import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initialUsers, initialMps, initialProjects, initialAuditRisks, initialComplaints, initialActionQueue } from './server/mockData.js';
import { runProjectPrecheck, parseCitizenComplaint, runRoleCopilot } from './server/gemini.js';
import { ProjectRecord, ComplaintRecord, AuditRiskItem, ActionQueueItem, UserProfile } from './src/types.js';
import { digitalSansadMemberAdapter } from './server/digitalSansadAdapter.js';
import { unifiedSearchService } from './server/adapters/unifiedSearchAdapter.js';
import { mpladsDataAdapter } from './server/adapters/mpladsDataAdapter.js';

// In-memory persistent database for the application session
let users: UserProfile[] = [...initialUsers];

// Merge verified Digital Sansad members with initial MPs (ensuring no duplicates)
const verifiedMembers = digitalSansadMemberAdapter.getAllMembers();
const existingIds = new Set(verifiedMembers.map(m => m.id));
let mps = [
  ...verifiedMembers,
  ...initialMps.filter(m => !existingIds.has(m.id)),
];
let projects: ProjectRecord[] = [...initialProjects];
let auditRisks: AuditRiskItem[] = [...initialAuditRisks];
let complaints: ComplaintRecord[] = [...initialComplaints];
let actionQueue: ActionQueueItem[] = [...initialActionQueue];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

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

    const photoUrl = mp.photoUrl || mp.officialPhotoUrl || mp.photo || '';
    const isPhotoVerified = Boolean(mp.photoVerified && photoUrl);

    return {
      ...mp,
      photo: photoUrl,
      photoUrl,
      officialPhotoUrl: isPhotoVerified ? photoUrl : '',
      photoSource: isPhotoVerified ? 'Official Digital Sansad' : 'Official photo unavailable',
      photoVerified: isPhotoVerified,
      lokSabhaTerms: mp.lokSabhaTerms || mp.term || '18th Lok Sabha',
      term: mp.term || '18th Lok Sabha (2024 - Present)',
      dataSourceStatus: mp.dataSourceStatus || 'CACHED',
      isFinancialDemo: mp.isFinancialDemo !== false,
      source: 'Official Digital Sansad',
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
    const { query, state, party, house, status, constituency, page = '1', limit = '100' } = req.query;
    let filtered = [...mps];

    if (query && typeof query === 'string') {
      const q = query.toLowerCase().trim();
      filtered = filtered.filter(
        mp =>
          mp.name.toLowerCase().includes(q) ||
          (mp.displayName && mp.displayName.toLowerCase().includes(q)) ||
          mp.constituency.toLowerCase().includes(q) ||
          mp.party.toLowerCase().includes(q) ||
          mp.state.toLowerCase().includes(q)
      );
    }
    if (state && typeof state === 'string') {
      filtered = filtered.filter(mp => mp.state.toLowerCase() === state.toLowerCase().trim());
    }
    if (party && typeof party === 'string') {
      filtered = filtered.filter(mp => mp.party.toLowerCase() === party.toLowerCase().trim());
    }
    if (house && typeof house === 'string') {
      filtered = filtered.filter(mp => mp.house.toLowerCase() === house.toLowerCase().trim());
    }
    if (status && typeof status === 'string') {
      filtered = filtered.filter(mp => mp.membershipStatus.toLowerCase() === status.toLowerCase().trim());
    }
    if (constituency && typeof constituency === 'string') {
      filtered = filtered.filter(mp => mp.constituency.toLowerCase() === constituency.toLowerCase().trim());
    }

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(limit as string) || 100));
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

  app.get('/api/mps/:id', (req, res) => {
    const rawMp = mps.find(m => m.id === req.params.id) || digitalSansadMemberAdapter.getMemberById(req.params.id);
    if (!rawMp) {
      return res.status(404).json({ error: 'Member of Parliament not found' });
    }
    const mp = formatMpRecord(rawMp);
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
      source: mp.source || 'Official Digital Sansad',
      lastUpdated: mp.lastUpdated || new Date().toISOString(),
      freshness: digitalSansadMemberAdapter.getFreshnessTelemetry(),
    });
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
    if (state && typeof state === 'string') {
      filtered = filtered.filter(p => p.state.toLowerCase() === state.toLowerCase());
    }
    if (district && typeof district === 'string') {
      filtered = filtered.filter(p => p.district.toLowerCase() === district.toLowerCase());
    }
    if (constituency && typeof constituency === 'string') {
      filtered = filtered.filter(p => p.constituency.toLowerCase() === constituency.toLowerCase());
    }
    if (status && typeof status === 'string') {
      filtered = filtered.filter(p => p.status.toLowerCase() === status.toLowerCase());
    }
    if (sector && typeof sector === 'string') {
      filtered = filtered.filter(p => p.category.toLowerCase() === sector.toLowerCase());
    }
    if (year && typeof year === 'string') {
      filtered = filtered.filter(p => p.year === year);
    }
    if (mpId && typeof mpId === 'string') {
      filtered = filtered.filter(p => p.mpId === mpId);
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
    const q = (req.query.q as string) || '';
    const results = unifiedSearchService.search(q);
    res.json(results);
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

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MPLADS Smart & AI Powered Portal server running on port ${PORT}`);
  });
}

startServer();
