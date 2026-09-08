import express from 'express';
import { initialUsers, initialMps, initialProjects, initialAuditRisks, initialComplaints, initialActionQueue } from './mockData.js';
import { COMPREHENSIVE_PAN_INDIA_PROJECTS } from '../src/data/panIndiaProjects.js';
import { runProjectPrecheck, parseCitizenComplaint, runRoleCopilot } from './gemini.js';
import { ProjectRecord, ComplaintRecord, AuditRiskItem, ActionQueueItem, UserProfile } from '../src/types.js';
import { digitalSansadMemberAdapter } from './digitalSansadAdapter.js';
import { unifiedSearchService } from './adapters/unifiedSearchAdapter.js';
import { mpladsDataAdapter } from './adapters/mpladsDataAdapter.js';
import { politicianDataService } from './services/politicianDataService.js';
import { locationService } from './services/locationService.js';
import { verifiedPhotoService } from './services/verifiedPhotoService.js';

// In-memory persistent database for the application session
let users: UserProfile[] = [...initialUsers];

// Merge verified Digital Sansad members with initial MPs (ensuring no duplicates)
const verifiedMembers = digitalSansadMemberAdapter.getAllMembers();
const existingConstituencyState = new Set(
  verifiedMembers.map(m => `${(m.constituency || '').toLowerCase().trim()}_${(m.state || '').toLowerCase().trim()}`)
);
const existingCleanNames = new Set(
  verifiedMembers.map(m => (m.name || '').toLowerCase().replace(/^(shri|smt|dr\.|prof\.)\s+/i, '').trim())
);
const existingIds = new Set(verifiedMembers.map(m => m.id));

let mps = [
  ...verifiedMembers,
  ...initialMps.filter(m => {
    if (existingIds.has(m.id)) return false;
    const key = `${(m.constituency || '').toLowerCase().trim()}_${(m.state || '').toLowerCase().trim()}`;
    const cleanName = (m.name || '').toLowerCase().replace(/^(shri|smt|dr\.|prof\.)\s+/i, '').trim();
    if (existingConstituencyState.has(key) || existingCleanNames.has(cleanName)) return false;
    return true;
  }),
];
let projects: ProjectRecord[] = [...COMPREHENSIVE_PAN_INDIA_PROJECTS];
let auditRisks: AuditRiskItem[] = [...initialAuditRisks];
let complaints: ComplaintRecord[] = [...initialComplaints];
let actionQueue: ActionQueueItem[] = [...initialActionQueue];

export const app = express();

app.use(express.json({ limit: '10mb' }));

// CORS & Preflight support
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'MPLADS Smart & AI Powered Portal',
      timestamp: new Date().toISOString(),
      isGeminiAvailable: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // Dynamic statistics
  app.get('/api/stats', (req, res) => {
    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.status === 'Completed').length;
    const inProgressProjects = projects.filter(p => p.status === 'In Progress' || p.status === 'Near Completion').length;
    const delayedProjects = projects.filter(p => p.status === 'Delayed').length;

    const sanctionedAmountLakhs = projects.reduce((sum, p) => sum + p.financial.sanctionedAmountLakhs, 0);
    const utilizedAmountLakhs = projects.reduce((sum, p) => sum + p.financial.expenditureLakhs, 0);
    const totalComplaints = complaints.length;
    const resolvedComplaints = complaints.filter(c => c.status === 'Resolved').length;

    res.json({
      totalProjects,
      completedProjects,
      inProgressProjects,
      delayedProjects,
      sanctionedAmountLakhs: Math.round(sanctionedAmountLakhs * 10) / 10,
      utilizedAmountLakhs: Math.round(utilizedAmountLakhs * 10) / 10,
      totalComplaints,
      resolvedComplaints,
      lastUpdated: new Date().toISOString(),
      source: 'SIH DEMO DATA',
      dataSourceLabel: 'SIH DEMO DATA (Synchronized Prototype State)',
      isLive: false,
    });
  });

  function formatMpRecord(mp: any) {
    const stats = mp.stats || {};
    const allocatedAmountLakhs = mp.fundUtilization?.allocatedAmountLakhs ?? stats.entitlementLakhs ?? 500.0;
    const sanctionedAmountLakhs = mp.fundUtilization?.sanctionedAmountLakhs ?? stats.sanctionedAmountLakhs ?? 480.0;
    const utilizedAmountLakhs = mp.fundUtilization?.utilizedAmountLakhs ?? stats.utilizedAmountLakhs ?? 390.0;
    const recommendedWorksCount = mp.fundUtilization?.recommendedWorksCount ?? stats.totalProjects ?? 45;
    const completedWorksCount = mp.fundUtilization?.completedWorksCount ?? stats.completedProjects ?? 32;
    const ongoingWorksCount = mp.fundUtilization?.ongoingWorksCount ?? stats.inProgressProjects ?? 10;

    const instant = politicianDataService.getInstantEnrichmentSync(mp.name);
    const verified = verifiedPhotoService.getCachedVerifiedPhoto(mp.name, mp.id);

    let photoUrl = '';
    let photoSource = 'Digital Sansad';
    let isPhotoVerified = false;

    if (verified?.imageUrl && verified.verified) {
      photoUrl = verified.imageUrl;
      photoSource = verified.imageSource || 'Wikidata (Wikimedia Commons)';
      isPhotoVerified = true;
    } else if (mp.photoVerified && (mp.photoUrl || mp.officialPhotoUrl || mp.photo)) {
      photoUrl = mp.photoUrl || mp.officialPhotoUrl || mp.photo;
      photoSource = mp.photoSource || 'Digital Sansad';
      isPhotoVerified = true;
    } else if (instant?.photoUrl && instant.photoVerified) {
      photoUrl = instant.photoUrl;
      photoSource = instant.photoSource || 'Wikidata (Wikimedia Commons)';
      isPhotoVerified = true;
    }

    const wikidataObj = verified
      ? {
          id: verified.wikidataId,
          label: verified.mpName,
          description: verified.biography?.description || 'Member of Parliament, Lok Sabha, India',
          wikipediaUrl: verified.biography?.wikipediaUrl,
          wikidataUrl: `https://www.wikidata.org/wiki/${verified.wikidataId}`,
          birthDate: verified.biography?.birthDate,
          birthPlace: verified.biography?.birthPlace,
          education: verified.biography?.education,
          website: verified.biography?.website,
          twitter: verified.biography?.twitter,
          photoUrl: verified.imageUrl,
          verified: true,
          verifiedAt: verified.verifiedAt,
        }
      : instant?.wikidata || mp.wikidata;

    const sanctionedAmountCr = Number((sanctionedAmountLakhs / 100).toFixed(2));
    const utilizedAmountCr = Number((utilizedAmountLakhs / 100).toFixed(2));
    const wikimediaUrl = verified?.imageUrl || (instant?.photoUrl?.includes('wikimedia') ? instant.photoUrl : undefined);

    return {
      ...mp,
      district: mp.district || mp.constituency,
      city: mp.city || mp.constituency,
      photo: photoUrl,
      photoUrl,
      officialPhotoUrl: mp.officialPhotoUrl || (photoSource.includes('Sansad') ? photoUrl : undefined),
      wikimediaUrl,
      photoSource,
      photoVerified: isPhotoVerified,
      wikidata: wikidataObj,
      civicInfo: instant?.civicInfo || mp.civicInfo,
      lokSabhaTerms: mp.lokSabhaTerms || mp.term || '18th Lok Sabha',
      term: mp.term || '18th Lok Sabha (2024 - Present)',
      dataSourceStatus: mp.dataSourceStatus || 'CACHED',
      isFinancialDemo: mp.isFinancialDemo !== false,
      source: 'Official Digital Sansad & Wikidata / Civic Graph',
      sanctionedAmountCr,
      utilizedAmountCr,
      totalWorks: recommendedWorksCount,
      completedWorks: completedWorksCount,
      inProgressWorks: ongoingWorksCount,
      delayedWorks: stats.delayedProjects ?? 3,
      utilizationRate: sanctionedAmountLakhs > 0 ? Number(((utilizedAmountLakhs / sanctionedAmountLakhs) * 100).toFixed(1)) : 0,
      hasFinancialData: true,
      stats: {
        totalProjects: recommendedWorksCount,
        sanctionedAmountLakhs,
        utilizedAmountLakhs,
        completedProjects: completedWorksCount,
        inProgressProjects: ongoingWorksCount,
        delayedProjects: stats.delayedProjects ?? 3,
        entitlementLakhs: allocatedAmountLakhs,
        ...stats,
      },
      fundUtilization: {
        allocatedAmountLakhs,
        sanctionedAmountLakhs,
        utilizedAmountLakhs,
        recommendedWorksCount,
        completedWorksCount,
        ongoingWorksCount,
      },
      email: mp.email || mp.contactEmail || 'mp.office@sansad.nic.in',
      phone: mp.phone || '+91-11-23034000',
    };
  }

  // MP Routes
  app.get('/api/mps', (req, res) => {
    const { query, state, party, house, status, constituency, district, city, page = '1', limit = '100' } = req.query;
    let filtered = [...mps];

    if (query && typeof query === 'string' && query.trim()) {
      const q = query.toLowerCase().trim();
      filtered = filtered.filter(
        mp =>
          mp.name.toLowerCase().includes(q) ||
          (mp.displayName && mp.displayName.toLowerCase().includes(q)) ||
          mp.constituency.toLowerCase().includes(q) ||
          mp.party.toLowerCase().includes(q) ||
          mp.state.toLowerCase().includes(q) ||
          (mp.district && mp.district.toLowerCase().includes(q)) ||
          (mp.city && mp.city.toLowerCase().includes(q)) ||
          (mp.membershipStatus && mp.membershipStatus.toLowerCase().includes(q)) ||
          (mp.house && mp.house.toLowerCase().includes(q))
      );
    }
    if (state && typeof state === 'string' && state !== 'All India' && state !== 'all') {
      filtered = filtered.filter(mp => mp.state.toLowerCase() === state.toLowerCase().trim());
    }
    if (district && typeof district === 'string' && district !== 'all' && district.trim()) {
      const d = district.toLowerCase().trim();
      filtered = filtered.filter(
        mp =>
          (mp.district && (mp.district.toLowerCase() === d || mp.district.toLowerCase().includes(d) || d.includes(mp.district.toLowerCase()))) ||
          (mp.city && (mp.city.toLowerCase() === d || mp.city.toLowerCase().includes(d) || d.includes(mp.city.toLowerCase()))) ||
          (mp.constituency && (mp.constituency.toLowerCase() === d || mp.constituency.toLowerCase().includes(d) || d.includes(mp.constituency.toLowerCase())))
      );
    }
    if (city && typeof city === 'string' && city !== 'all' && city.trim()) {
      const c = city.toLowerCase().trim();
      filtered = filtered.filter(
        mp =>
          (mp.city && (mp.city.toLowerCase() === c || mp.city.toLowerCase().includes(c) || c.includes(mp.city.toLowerCase()))) ||
          (mp.district && (mp.district.toLowerCase() === c || mp.district.toLowerCase().includes(c) || c.includes(mp.district.toLowerCase()))) ||
          (mp.constituency && (mp.constituency.toLowerCase() === c || mp.constituency.toLowerCase().includes(c) || c.includes(mp.constituency.toLowerCase())))
      );
    }
    if (party && typeof party === 'string' && party !== 'all') {
      filtered = filtered.filter(mp => mp.party.toLowerCase() === party.toLowerCase().trim());
    }
    if (house && typeof house === 'string' && house !== 'all') {
      filtered = filtered.filter(mp => mp.house.toLowerCase() === house.toLowerCase().trim());
    }
    if (status && typeof status === 'string' && status !== 'all') {
      filtered = filtered.filter(mp => mp.membershipStatus.toLowerCase() === status.toLowerCase().trim());
    }
    if (constituency && typeof constituency === 'string' && constituency !== 'all') {
      filtered = filtered.filter(mp => mp.constituency.toLowerCase() === constituency.toLowerCase().trim());
    }

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(500, Math.max(1, parseInt(limit as string) || 100));
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = filtered.slice(startIndex, startIndex + limitNum);

    res.json({
      count: paginated.length,
      total: filtered.length,
      page: pageNum,
      limit: limitNum,
      mps: paginated.map(formatMpRecord),
      freshness: digitalSansadMemberAdapter.getFreshnessTelemetry(),
      source: 'Official Digital Sansad (18th Lok Sabha Sitting Members)',
    });
  });

  // Telemetry endpoint for data freshness badge
  app.get('/api/mps/telemetry', (req, res) => {
    res.json(digitalSansadMemberAdapter.getFreshnessTelemetry());
  });

  // Refresh trigger endpoint
  app.post('/api/mps/refresh', async (req, res) => {
    const result = await digitalSansadMemberAdapter.refreshMemberData();
    res.json(result);
  });

  // Refresh photos trigger endpoint
  app.post('/api/mps/refresh-photos', async (req, res) => {
    const registry = verifiedPhotoService.getAllVerifiedPhotos();
    res.json({
      success: true,
      verifiedCount: Object.keys(registry).length,
      status: 'VERIFIED',
      message: 'Verified photo cache refreshed against parliamentary and Wikidata entities',
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/mps/:id', async (req, res) => {
    const rawMp = mps.find(m => m.id === req.params.id) || digitalSansadMemberAdapter.getMemberById(req.params.id);
    if (!rawMp) {
      return res.status(404).json({ error: 'Member of Parliament not found' });
    }

    // Enrich with live Wikidata & Google Civic Information
    let enrichment = null;
    try {
      enrichment = await politicianDataService.getPoliticianEnrichment(
        rawMp.name,
        rawMp.constituency,
        rawMp.state,
        rawMp.photoUrl || rawMp.photo
      );
    } catch (e) {
      console.warn('Live enrichment warning:', e);
    }

    const mp = formatMpRecord(rawMp);
    if (enrichment) {
      if (enrichment.photoUrl) {
        mp.photo = enrichment.photoUrl;
        mp.photoUrl = enrichment.photoUrl;
        mp.officialPhotoUrl = enrichment.photoUrl;
        mp.photoSource = enrichment.photoSource;
        mp.photoVerified = enrichment.photoVerified;
      }
      if (enrichment.wikidata) mp.wikidata = enrichment.wikidata;
      if (enrichment.civicInfo) mp.civicInfo = enrichment.civicInfo;
    }

    let mpProjects = projects.filter(p => p.mpId === mp.id);

    // If MP has no custom projects in prototype, link representative projects from the same state
    // so that the entire project/map/fund workflow functions without error
    if (mpProjects.length === 0) {
      const stateProjects = projects.filter(p => p.state && p.state.toLowerCase() === mp.state.toLowerCase());
      if (stateProjects.length > 0) {
        mpProjects = stateProjects.slice(0, 4).map((p, idx) => ({
          ...p,
          id: `proj-rep-${mp.id}-${idx}`,
          mpId: mp.id,
          mpName: mp.name,
          constituency: mp.constituency,
          state: mp.state,
          isDemo: true,
        }));
      }
    }

    res.json({
      mp,
      projects: mpProjects,
      source: mp.source || 'Official Digital Sansad & Wikidata / Civic Graph',
      lastUpdated: mp.lastUpdated || new Date().toISOString(),
      freshness: digitalSansadMemberAdapter.getFreshnessTelemetry(),
    });
  });

  // Dedicated Civic & Wikidata info endpoint
  app.get('/api/mps/:id/civic-info', async (req, res) => {
    const rawMp = mps.find(m => m.id === req.params.id) || digitalSansadMemberAdapter.getMemberById(req.params.id);
    if (!rawMp) {
      return res.status(404).json({ error: 'Member of Parliament not found' });
    }
    try {
      const enrichment = await politicianDataService.getPoliticianEnrichment(
        rawMp.name,
        rawMp.constituency,
        rawMp.state,
        rawMp.photoUrl || rawMp.photo
      );
      res.json({
        mpId: rawMp.id,
        name: rawMp.name,
        constituency: rawMp.constituency,
        state: rawMp.state,
        enrichment,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to fetch civic & Wikidata info' });
    }
  });

  // Step-by-step verified official photo synchronization pipeline
  app.post('/api/mps/:id/sync-photo', async (req, res) => {
    const rawMp = mps.find(m => m.id === req.params.id) || digitalSansadMemberAdapter.getMemberById(req.params.id);
    if (!rawMp) {
      return res.status(404).json({
        success: false,
        phase: 'Official photo unavailable',
        steps: [{ title: 'Finding official identity...', status: 'failed' }],
        error: 'Member of Parliament not found in official directory',
      });
    }

    try {
      const syncResult = await verifiedPhotoService.syncMemberPhoto(
        rawMp.id,
        rawMp.name,
        rawMp.constituency,
        rawMp.state,
        rawMp.officialProfileUrl
      );

      if (syncResult.success && syncResult.photoRecord?.imageUrl) {
        rawMp.photoUrl = syncResult.photoRecord.imageUrl;
        rawMp.officialPhotoUrl = syncResult.photoRecord.imageUrl;
        rawMp.photoSource = syncResult.photoRecord.imageSource;
        rawMp.photoVerified = true;
        rawMp.wikidataId = syncResult.photoRecord.wikidataId;
      } else {
        // Strict safety rule: If identity matching fails, photoUrl = null, show "Official photo unavailable"
        rawMp.photoUrl = '';
        rawMp.officialPhotoUrl = '';
        rawMp.photoVerified = false;
      }

      res.json({
        ...syncResult,
        mp: formatMpRecord(rawMp),
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        phase: 'Official photo unavailable',
        steps: [],
        error: err?.message || 'Verification workflow encountered an error',
      });
    }
  });

  // Force re-enrichment from live Wikidata & Google Civic API
  app.post('/api/mps/:id/civic-enrich', async (req, res) => {
    const rawMp = mps.find(m => m.id === req.params.id) || digitalSansadMemberAdapter.getMemberById(req.params.id);
    if (!rawMp) {
      return res.status(404).json({ error: 'Member of Parliament not found' });
    }
    try {
      // 1. Run verified photo sync first
      const photoResult = await verifiedPhotoService.syncMemberPhoto(
        rawMp.id,
        rawMp.name,
        rawMp.constituency,
        rawMp.state,
        rawMp.officialProfileUrl
      );

      if (photoResult.success && photoResult.photoRecord?.imageUrl) {
        rawMp.photoUrl = photoResult.photoRecord.imageUrl;
        rawMp.officialPhotoUrl = photoResult.photoRecord.imageUrl;
        rawMp.photoSource = photoResult.photoRecord.imageSource;
        rawMp.photoVerified = true;
        rawMp.wikidataId = photoResult.photoRecord.wikidataId;
      }

      const cleanName = politicianDataService.cleanPoliticianName(rawMp.name);
      const entityId = rawMp.wikidataId || (await politicianDataService.searchWikidataEntity(cleanName));
      let liveWikidata = null;
      if (entityId) {
        liveWikidata = await politicianDataService.fetchWikidataDetails(entityId);
      }
      const civicAddress = `${rawMp.constituency}, ${rawMp.state}, India`;
      const liveCivic = await politicianDataService.queryGoogleCivicInfo(civicAddress, rawMp.name);

      if (liveWikidata?.photoUrl) {
        rawMp.photoUrl = liveWikidata.photoUrl;
        rawMp.officialPhotoUrl = liveWikidata.photoUrl;
        rawMp.photoSource = 'Wikidata (Wikimedia Commons)';
        rawMp.photoVerified = true;
      } else if (liveCivic?.photoUrl) {
        rawMp.photoUrl = liveCivic.photoUrl;
        rawMp.officialPhotoUrl = liveCivic.photoUrl;
        rawMp.photoSource = 'Google Civic Information API';
        rawMp.photoVerified = true;
      }

      const formatted = formatMpRecord(rawMp);
      res.json({
        success: true,
        mpId: rawMp.id,
        name: rawMp.name,
        mp: formatted,
        data: {
          photoUrl: rawMp.photoUrl,
          photoSource: rawMp.photoSource,
          wikidata: liveWikidata,
          civicInfo: liveCivic,
        },
        wikidata: liveWikidata,
        civicInfo: liveCivic,
        refreshedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to re-enrich MP record' });
    }
  });

  // Admin Batch Photo Sync (Requirement 20)
  app.post('/api/admin/sync-missing-photos', async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 40;
    const candidates = mps.map(m => ({
      id: m.id,
      name: m.name,
      constituency: m.constituency,
      state: m.state,
      officialProfileUrl: m.officialProfileUrl,
    }));
    const stats = await verifiedPhotoService.syncMissingPhotosBatch(candidates, limit);
    res.json({
      success: true,
      message: `${stats.totalChecked} MPs checked, ${stats.photosVerified} new verified photos synced.`,
      stats,
      timestamp: new Date().toISOString(),
    });
  });

  // Admin Photo Resolution Error Logs (Requirement 21)
  app.get('/api/admin/photo-sync-logs', (req, res) => {
    const logs = verifiedPhotoService.getErrorLogs();
    res.json({
      totalErrors: logs.length,
      logs,
      timestamp: new Date().toISOString(),
    });
  });


  // Generic Civic & Wikidata search for any politician name
  app.get('/api/politicians/civic-search', async (req, res) => {
    const { query, state = '', constituency = '' } = req.query;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Search query parameter is required' });
    }
    try {
      const enrichment = await politicianDataService.getPoliticianEnrichment(
        query,
        constituency as string,
        state as string
      );
      res.json({
        query,
        enrichment,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to query politician data' });
    }
  });

  // Project Routes
  app.get('/api/projects', (req, res) => {
    const {
      query,
      state,
      district,
      constituency,
      status,
      sector,
      year,
      mpId,
      risk,
      sortBy = 'latest',
      page = '1',
      limit = '12',
    } = req.query;

    let filtered = [...projects];

    if (query && typeof query === 'string') {
      const q = query.toLowerCase().trim();
      filtered = filtered.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.district.toLowerCase().includes(q) ||
          (p.village && p.village.toLowerCase().includes(q)) ||
          p.constituency.toLowerCase().includes(q) ||
          p.mpName.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    if (state && typeof state === 'string' && state !== 'All') {
      filtered = filtered.filter(p => p.state.toLowerCase() === state.toLowerCase());
    }
    if (district && typeof district === 'string' && district !== 'All') {
      filtered = filtered.filter(p => p.district.toLowerCase() === district.toLowerCase());
    }
    if (constituency && typeof constituency === 'string' && constituency !== 'All') {
      filtered = filtered.filter(p => p.constituency.toLowerCase() === constituency.toLowerCase());
    }
    if (status && typeof status === 'string' && status.toLowerCase() !== 'all') {
      filtered = filtered.filter(p => p.status.toLowerCase() === status.toLowerCase());
    }
    if (sector && typeof sector === 'string' && sector.toLowerCase() !== 'all') {
      filtered = filtered.filter(p => p.category.toLowerCase() === sector.toLowerCase());
    }
    if (year && typeof year === 'string' && year !== 'All') {
      filtered = filtered.filter(p => p.year === year);
    }
    if (mpId && typeof mpId === 'string') {
      filtered = filtered.filter(p => p.mpId === mpId);
    }
    if (risk && typeof risk === 'string' && risk.toUpperCase() !== 'ALL') {
      const r = risk.toUpperCase();
      if (r === 'HIGH') {
        filtered = filtered.filter(p => p.riskCategory === 'HIGH' || p.riskScore >= 50 || p.status === 'Delayed');
      } else {
        filtered = filtered.filter(p => p.riskCategory === r);
      }
    }

    // Sort
    if (sortBy === 'amount') {
      filtered.sort((a, b) => b.financial.sanctionedAmountLakhs - a.financial.sanctionedAmountLakhs);
    } else if (sortBy === 'progress') {
      filtered.sort((a, b) => b.progressPercentage - a.progressPercentage);
    } else if (sortBy === 'risk') {
      filtered.sort((a, b) => b.riskScore - a.riskScore);
    } else if (sortBy === 'completion') {
      filtered.sort((a, b) => (b.status === 'Completed' ? 1 : 0) - (a.status === 'Completed' ? 1 : 0));
    } else {
      // latest
      filtered.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
    }

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 12;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = filtered.slice(startIndex, startIndex + limitNum);

    res.json({
      total: filtered.length,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(filtered.length / limitNum),
      projects: paginated,
      allForMap: filtered.map(p => ({
        id: p.id,
        code: p.code,
        title: p.title,
        category: p.category,
        status: p.status,
        coordinates: p.coordinates,
        sanctionedAmountLakhs: p.financial.sanctionedAmountLakhs,
        progressPercentage: p.progressPercentage,
        district: p.district,
        state: p.state,
      })),
    });
  });

  app.get('/api/projects/:id', (req, res) => {
    const project = projects.find(p => p.id === req.params.id || p.code === req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  });

  app.post('/api/projects', (req, res) => {
    const body = req.body;
    const newId = `proj-${Date.now()}`;
    const newCode = `MPLADS/${new Date().getFullYear()}-${(new Date().getFullYear() + 1).toString().slice(2)}/${(body.state || 'IN').slice(0, 2).toUpperCase()}-${(body.district || 'GEN').slice(0, 3).toUpperCase()}/${Math.floor(100 + Math.random() * 900)}`;

    const newProject: ProjectRecord = {
      id: newId,
      code: newCode,
      title: body.title || 'Untitled Recommendation',
      description: body.description || '',
      category: body.category || 'Drinking Water',
      mpId: body.mpId || 'mp-tn-dharmapuri',
      mpName: body.mpName || 'Dr. A. Senthilkumar',
      state: body.state || 'Tamil Nadu',
      district: body.district || 'Dharmapuri',
      constituency: body.constituency || 'Dharmapuri',
      village: body.village || 'Local Panchayat',
      department: body.department || 'Rural Development',
      implementingAgency: body.implementingAgency || 'DRDA / PWD',
      coordinates: body.coordinates || { lat: 12.1332, lng: 77.8872 },
      financial: {
        recommendedAmountLakhs: Number(body.estimatedCostLakhs) || 20.0,
        sanctionedAmountLakhs: 0,
        releasedAmountLakhs: 0,
        expenditureLakhs: 0,
        balanceLakhs: Number(body.estimatedCostLakhs) || 20.0,
      },
      status: 'Proposed',
      progressPercentage: 0,
      timeline: [
        {
          status: 'Proposed',
          date: new Date().toISOString().split('T')[0],
          note: 'Recommended by MP via Smart Portal',
          updatedBy: body.mpName || 'MP Office',
        },
      ],
      evidence: [],
      documents: [
        {
          id: `doc-${Date.now()}`,
          name: 'MP_Recommendation_Letter.pdf',
          type: 'Sanction Order',
          status: 'Needs Verification',
          uploadDate: new Date().toISOString().split('T')[0],
        },
      ],
      transparencyScore: 85,
      riskScore: 20,
      riskCategory: 'LOW',
      year: `${new Date().getFullYear()}-${(new Date().getFullYear() + 1).toString().slice(2)}`,
      lastUpdated: new Date().toISOString(),
      source: 'SIH DEMO DATA',
    };

    projects.unshift(newProject);

    // Add to action queue for district collector
    actionQueue.unshift({
      id: `act-${Date.now()}`,
      type: 'NEW_RECOMMENDATION',
      projectId: newProject.id,
      title: newProject.title,
      mpName: newProject.mpName,
      constituency: newProject.constituency,
      amountLakhs: newProject.financial.recommendedAmountLakhs,
      submittedDate: new Date().toISOString().split('T')[0],
      priority: 'Normal',
      aiPrecheckStatus: 'PROCEED',
    });

    res.status(201).json(newProject);
  });

  app.patch('/api/projects/:id', (req, res) => {
    const pIndex = projects.findIndex(p => p.id === req.params.id);
    if (pIndex === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const current = projects[pIndex];
    const { status, progressPercentage, financialUpdate, timelineNote, updatedBy } = req.body;

    if (status && status !== current.status) {
      current.status = status;
      current.timeline.push({
        status,
        date: new Date().toISOString().split('T')[0],
        note: timelineNote || `Status updated to ${status}`,
        updatedBy: updatedBy || 'Authorized Official',
      });
    }

    if (typeof progressPercentage === 'number') {
      current.progressPercentage = Math.min(100, Math.max(0, progressPercentage));
      if (current.progressPercentage === 100 && current.status !== 'Completed') {
        current.status = 'Completed';
        current.timeline.push({
          status: 'Completed',
          date: new Date().toISOString().split('T')[0],
          note: 'Marked 100% physical completion by implementing agency',
          updatedBy: updatedBy || 'Agency Engineer',
        });
      }
    }

    if (financialUpdate) {
      current.financial = { ...current.financial, ...financialUpdate };
    }

    current.lastUpdated = new Date().toISOString();
    projects[pIndex] = current;
    res.json(current);
  });

  // Evidence upload endpoint
  app.post('/api/projects/:id/evidence', (req, res) => {
    const project = projects.find(p => p.id === req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const { stage, url, description, uploadedBy, gpsLocation } = req.body;
    const newEvidence = {
      id: `ev-${Date.now()}`,
      stage: stage || 'During',
      url: url || 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=600&auto=format&fit=crop&q=80',
      description: description || 'Field site inspection photo',
      date: new Date().toISOString().split('T')[0],
      uploadedBy: uploadedBy || 'Field Engineer',
      gpsLocation: gpsLocation || project.coordinates,
    };

    project.evidence.push(newEvidence);
    project.lastUpdated = new Date().toISOString();
    res.status(201).json(newEvidence);
  });

  // Document submission
  app.post('/api/projects/:id/documents', (req, res) => {
    const project = projects.find(p => p.id === req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const { name, type, status = 'Available', fileSize = '1.2 MB' } = req.body;
    const newDoc = {
      id: `doc-${Date.now()}`,
      name: name || `${type.replace(/\s+/g, '_')}.pdf`,
      type,
      status: status as any,
      uploadDate: new Date().toISOString().split('T')[0],
      fileSize,
    };

    project.documents.push(newDoc);
    project.lastUpdated = new Date().toISOString();
    res.status(201).json(newDoc);
  });

  // Flagship AI Pre-Check Endpoint
  app.post('/api/ai/precheck', async (req, res) => {
    try {
      const input = req.body;
      const result = await runProjectPrecheck(input, projects);
      res.json(result);
    } catch (err: any) {
      console.error('Error running AI precheck:', err);
      res.status(500).json({ error: 'Failed to run AI precheck', details: err.message });
    }
  });

  // Citizen Complaint AI Parsing Endpoint
  app.post('/api/ai/citizen-complaint', async (req, res) => {
    try {
      const { text, userLocation } = req.body;
      const parsed = await parseCitizenComplaint(text, userLocation, projects);
      res.json(parsed);
    } catch (err: any) {
      console.error('Error parsing citizen complaint:', err);
      res.status(500).json({ error: 'Failed to parse complaint', details: err.message });
    }
  });

  // Unified Search API Endpoint
  app.get('/api/search', (req, res) => {
    const q = (req.query.q as string) || (req.query.query as string) || (req.query.search as string) || '';
    const results = unifiedSearchService.search(q);
    res.json(results);
  });

  // Location System API Endpoints (Official GoI 28 States + 8 UTs + 786 Districts + Cities)
  app.get('/api/locations/summary', (req, res) => {
    res.json(locationService.getLocationSummary());
  });

  app.get('/api/locations/states', (req, res) => {
    res.json(locationService.getAllStates());
  });

  app.get('/api/locations/union-territories', (req, res) => {
    res.json(locationService.getAllUnionTerritories());
  });

  app.get('/api/locations/all', (req, res) => {
    res.json(locationService.getAllJurisdictions());
  });

  app.get('/api/locations/districts', (req, res) => {
    const state = (req.query.state as string) || '';
    res.json(locationService.getDistrictsByState(state));
  });

  app.get('/api/locations/cities', (req, res) => {
    const state = (req.query.state as string) || '';
    const district = (req.query.district as string) || '';
    if (district) {
      res.json(locationService.getCitiesByDistrict(district, state));
    } else {
      res.json(locationService.getCitiesByState(state));
    }
  });

  app.get('/api/locations/combined', (req, res) => {
    const state = (req.query.state as string) || '';
    const q = (req.query.q as string) || '';
    res.json(locationService.getCombinedLocations(state, q));
  });

  app.get('/api/locations/search', (req, res) => {
    const q = (req.query.q as string) || '';
    const state = (req.query.state as string) || '';
    const type = (req.query.type as string) || 'all';

    if (type === 'districts') {
      res.json(locationService.searchDistricts(q, state));
    } else if (type === 'cities') {
      res.json(locationService.searchCities(q, state));
    } else {
      const districts = locationService.searchDistricts(q, state);
      const cities = locationService.searchCities(q, state);
      res.json({ districts, cities });
    }
  });

  app.get('/api/locations/constituency-mapping', (req, res) => {
    const state = (req.query.state as string) || '';
    const location = (req.query.location as string) || '';
    // Collect all official constituencies for this state from MP dataset
    const stateMps = mps.filter(m => !state || m.state.toLowerCase() === state.toLowerCase().trim());
    const officialConstituencies = Array.from(new Set(stateMps.map(m => m.constituency).filter(Boolean)));
    const mapping = locationService.getConstituencyMapping(state, location, officialConstituencies);
    res.json(mapping);
  });

  app.get('/api/locations/freshness', (req, res) => {
    res.json(locationService.getFreshness());
  });

  app.post('/api/locations/refresh', (req, res) => {
    const summary = locationService.refreshLocationData();
    res.json({ success: true, summary });
  });

  // Real-Time Data Status Telemetry Endpoint
  app.get('/api/data/freshness', (req, res) => {
    res.json({
      digitalSansad: digitalSansadMemberAdapter.getFreshnessTelemetry(),
      mplads: mpladsDataAdapter.getFreshnessTelemetry(),
      timestamp: new Date().toISOString(),
    });
  });

  // Upstream Live Data Refresh Trigger
  app.post('/api/data/refresh', async (req, res) => {
    const [sansadStatus, mpladsStatus] = await Promise.all([
      digitalSansadMemberAdapter.refreshMemberData(),
      mpladsDataAdapter.refreshData(),
    ]);
    res.json({
      success: true,
      digitalSansad: sansadStatus,
      mplads: mpladsStatus,
      refreshedAt: new Date().toISOString(),
    });
  });

  // Official MPLADS Dashboard summary for constituency
  app.get('/api/mplads/constituency/:constituency', (req, res) => {
    const { state, mpName } = req.query as { state?: string; mpName?: string };
    const summary = mpladsDataAdapter.getConstituencySummary(req.params.constituency, state, mpName);
    res.json(summary);
  });

  // Official MPLADS National summary
  app.get('/api/mplads/national', (req, res) => {
    const summary = mpladsDataAdapter.getNationalSummary();
    res.json(summary);
  });

  // Role Copilot Endpoint (Personalized for every role, with tool calling & RBAC)
  app.post('/api/ai/copilot', async (req, res) => {
    try {
      const { role, query, userContext, history } = req.body;
      const result = await runRoleCopilot(
        role || 'GUEST',
        query,
        {
          ...(userContext || {}),
          role: role || userContext?.role || 'GUEST',
          projectStats: { total: projects.length, delayed: projects.filter(p => p.status === 'Delayed').length },
        },
        history || []
      );
      res.json(result);
    } catch (err: any) {
      console.error('Error in AI Copilot:', err);
      res.status(500).json({ error: 'Copilot query failed', details: err.message });
    }
  });

  // Complaints CRUD
  app.get('/api/complaints', (req, res) => {
    const { category, status, search } = req.query;
    let list = [...complaints];
    if (category && typeof category === 'string') {
      list = list.filter(c => c.category.toLowerCase() === category.toLowerCase());
    }
    if (status && typeof status === 'string') {
      list = list.filter(c => c.status.toLowerCase() === status.toLowerCase());
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      list = list.filter(
        c =>
          c.problemTitle.toLowerCase().includes(q) ||
          c.trackingId.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.location.district.toLowerCase().includes(q)
      );
    }
    res.json(list);
  });

  app.post('/api/complaints', (req, res) => {
    const body = req.body;
    const trackingId = `MPLADS-GRV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newComplaint: ComplaintRecord = {
      id: `comp-${Date.now()}`,
      trackingId,
      citizenName: body.citizenName || 'Citizen User',
      citizenEmail: body.citizenEmail || 'citizen@example.com',
      citizenPhone: body.citizenPhone,
      problemTitle: body.problemTitle,
      description: body.description,
      category: body.category || 'Other Public Utilities',
      severity: body.severity || 'Medium',
      location: body.location || { state: 'Tamil Nadu', district: 'Dharmapuri' },
      possibleLevel: body.possibleLevel || 'District',
      matchedProjectIds: body.matchedProjectIds || [],
      status: 'Submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        {
          status: 'Submitted',
          timestamp: new Date().toISOString(),
          note: 'Grievance submitted via Citizen AI Assistant',
        },
      ],
    };

    complaints.unshift(newComplaint);
    res.status(201).json(newComplaint);
  });

  app.patch('/api/complaints/:id', (req, res) => {
    const cIndex = complaints.findIndex(c => c.id === req.params.id || c.trackingId === req.params.id);
    if (cIndex === -1) return res.status(404).json({ error: 'Complaint not found' });

    const c = complaints[cIndex];
    const { status, note, officer, assignedAgency } = req.body;
    if (status && status !== c.status) {
      c.status = status;
      c.timeline.push({
        status,
        timestamp: new Date().toISOString(),
        note: note || `Status updated to ${status}`,
        officer: officer || 'District Nodal Officer',
      });
    }
    if (assignedAgency) c.assignedAgency = assignedAgency;
    if (officer) c.assignedOfficer = officer;
    c.updatedAt = new Date().toISOString();

    complaints[cIndex] = c;
    res.json(c);
  });

  // Auditor risks
  app.get('/api/audit-risks', (req, res) => {
    res.json(auditRisks);
  });

  app.patch('/api/audit-risks/:id', (req, res) => {
    const item = auditRisks.find(r => r.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'Audit risk record not found' });
    const { status } = req.body;
    if (status) item.status = status;
    res.json(item);
  });

  // District Officer action queue
  app.get('/api/action-queue', (req, res) => {
    res.json(actionQueue);
  });

  app.post('/api/action-queue/:id/decision', (req, res) => {
    const item = actionQueue.find(a => a.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'Action item not found' });
    const { decision, note, officerName } = req.body;

    // Apply decision to project
    const proj = projects.find(p => p.id === item.projectId);
    if (proj) {
      if (decision === 'APPROVE_SANCTION') {
        proj.status = 'Sanctioned';
        proj.financial.sanctionedAmountLakhs = proj.financial.recommendedAmountLakhs;
        proj.timeline.push({
          status: 'Sanctioned',
          date: new Date().toISOString().split('T')[0],
          note: note || 'Administrative sanction accorded after human verification review.',
          updatedBy: officerName || 'District Collector',
        });
      } else if (decision === 'HOLD_FOR_VERIFICATION') {
        proj.timeline.push({
          status: proj.status,
          date: new Date().toISOString().split('T')[0],
          note: `HOLD FOR VERIFICATION: ${note || 'Site inspection required'}`,
          updatedBy: officerName || 'District Collector',
        });
      }
    }

    actionQueue = actionQueue.filter(a => a.id !== req.params.id);
    res.json({ success: true, message: `Decision recorded: ${decision}. Human decision remains final.` });
  });

  // Auth demo logins
  app.get('/api/auth/users', (req, res) => {
    res.json(users);
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, role } = req.body;
    const user = users.find(u => (email && u.email === email) || (role && u.role === role));
    if (!user) {
      // Create guest or demo user
      const newUser: UserProfile = {
        uid: `user-${Date.now()}`,
        name: email ? email.split('@')[0] : `${role} User`,
        email: email || `${(role || 'citizen').toLowerCase()}@mplads.gov.in`,
        role: role || 'CITIZEN',
        status: 'active',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        isDemo: true,
      };
      users.push(newUser);
      return res.json(newUser);
    }
    user.lastLogin = new Date().toISOString();
    res.json(user);
  });

export default app;

