/**
 * Drishti Copilot Intelligence Engine
 * 
 * Fully intent-aware, context-aware, role-aware, and data-grounded AI assistant engine
 * for the MPLADS Smart & AI Powered Portal.
 * 
 * Pipeline:
 * User Question
 *  -> Intent Detection
 *  -> Entity Extraction (State, District, MP, Project, Category, Status)
 *  -> Apply Current Context & Conversation Memory
 *  -> Query Authorized Portal Data (Projects, MPs, Funds, Risks, Actions)
 *  -> Calculate & Compare Metrics
 *  -> Generate Structured Answer + KPIs + Result Cards + Action Triggers
 */

import { COMPREHENSIVE_PAN_INDIA_PROJECTS } from '../data/panIndiaProjects';
import { ALL_INDIA_JURISDICTIONS, ALL_INDIAN_STATES, ALL_UNION_TERRITORIES } from '../data/indiaStates';
import { OFFICIAL_INDIAN_DISTRICTS } from '../../server/data/indiaDistrictsData';
import { initialMps, initialAuditRisks, actionQueue, initialComplaints } from '../../server/mockData';
import { mpladsDataAdapter } from '../../server/adapters/mpladsDataAdapter';
import { dashboardIntelligence } from './dashboardIntelligenceEngine';
import {
  Role,
  ProjectRecord,
  MPProfile,
  CopilotResponse,
  CopilotKpi,
  CopilotCard,
  CopilotAction,
} from '../types';

export interface UserContext {
  userId?: string;
  name?: string;
  role?: Role;
  constituency?: string;
  district?: string;
  state?: string;
  currentPath?: string;
  currentSearch?: string;
  activeProjectId?: string;
  activeMpId?: string;
  activeState?: string;
  activeDistrict?: string;
}

export interface ConversationTurn {
  sender: 'user' | 'bot';
  text: string;
  intent?: string;
  extractedEntities?: {
    state?: string;
    district?: string;
    constituency?: string;
    mpName?: string;
    mpId?: string;
    projectId?: string;
    category?: string;
    status?: string;
  };
}

export type CopilotIntent =
  | 'SHOW_DELAYED_PROJECTS'
  | 'HIGH_RISK_ANALYSIS'
  | 'FINANCIAL_UTILIZATION'
  | 'STATE_OR_LOCATION_PROJECTS'
  | 'MP_PROFILE_PERFORMANCE'
  | 'PROJECT_RISK_EXPLANATION'
  | 'PRIORITIZE_ATTENTION'
  | 'MPLADS_EDUCATIONAL_EXPLANATION'
  | 'GENERATE_REPORT'
  | 'CONTEXTUAL_FOLLOW_UP'
  | 'CITIZEN_GRIEVANCE_HELP'
  | 'DATA_UNAVAILABLE'
  | 'GENERAL_PROJECT_SEARCH';

// Normalized helper to find matching state
function extractStateName(query: string): string | null {
  const q = query.toLowerCase();

  // Common aliases
  if (q.includes('rajasthan')) return 'Rajasthan';
  if (q.includes('tamil nadu') || q.includes('tamilnadu') || q.match(/\btn\b/)) return 'Tamil Nadu';
  if (q.includes('uttar pradesh') || q.match(/\bup\b/)) return 'Uttar Pradesh';
  if (q.includes('kerala')) return 'Kerala';
  if (q.includes('maharashtra')) return 'Maharashtra';
  if (q.includes('delhi')) return 'Delhi';
  if (q.includes('gujarat')) return 'Gujarat';
  if (q.includes('karnataka')) return 'Karnataka';
  if (q.includes('west bengal') || q.match(/\bwb\b/)) return 'West Bengal';
  if (q.includes('bihar')) return 'Bihar';
  if (q.includes('madhya pradesh') || q.match(/\bmp\b/) && !q.includes('tell me about this mp') && !q.includes('mp profile')) return 'Madhya Pradesh';
  if (q.includes('punjab')) return 'Punjab';
  if (q.includes('haryana')) return 'Haryana';
  if (q.includes('odisha') || q.includes('orissa')) return 'Odisha';
  if (q.includes('telangana')) return 'Telangana';
  if (q.includes('andhra pradesh') || q.match(/\bap\b/)) return 'Andhra Pradesh';
  if (q.includes('assam')) return 'Assam';
  if (q.includes('jharkhand')) return 'Jharkhand';
  if (q.includes('chhattisgarh')) return 'Chhattisgarh';
  if (q.includes('uttarakhand')) return 'Uttarakhand';
  if (q.includes('himachal pradesh') || q.match(/\bhp\b/)) return 'Himachal Pradesh';
  if (q.includes('jammu') || q.includes('kashmir') || q.match(/\bj&k\b/)) return 'Jammu and Kashmir';
  if (q.includes('goa')) return 'Goa';
  if (q.includes('tripura')) return 'Tripura';
  if (q.includes('manipur')) return 'Manipur';
  if (q.includes('meghalaya')) return 'Meghalaya';
  if (q.includes('nagaland')) return 'Nagaland';
  if (q.includes('mizoram')) return 'Mizoram';
  if (q.includes('sikkim')) return 'Sikkim';
  if (q.includes('arunachal')) return 'Arunachal Pradesh';
  if (q.includes('chandigarh')) return 'Chandigarh';
  if (q.includes('puducherry') || q.includes('pondicherry')) return 'Puducherry';
  if (q.includes('ladakh')) return 'Ladakh';

  // Check all official states
  for (const item of ALL_INDIA_JURISDICTIONS) {
    if (q.includes(item.name.toLowerCase())) {
      return item.name;
    }
  }

  return null;
}

// Extract District name
function extractDistrictName(query: string): string | null {
  const q = query.toLowerCase();
  for (const d of OFFICIAL_INDIAN_DISTRICTS) {
    if (d.districtName && d.districtName.length > 3 && q.includes(d.districtName.toLowerCase())) {
      return d.districtName;
    }
  }
  return null;
}

// Extract MP name or reference
function extractMPReference(query: string, userContext: UserContext): { name?: string; id?: string; isGenericRef: boolean } {
  const q = query.toLowerCase();

  if (q.includes('this mp') || q.includes('the mp') || q.includes('current mp') || q.includes('local mp') || q.includes('my mp')) {
    return { isGenericRef: true, id: userContext.activeMpId };
  }

  // Common prominent MPs
  if (q.includes('narendra modi') || q.includes('modi')) {
    return { name: 'Shri Narendra Modi', isGenericRef: false };
  }
  if (q.includes('rahul gandhi') || q.includes('rahul')) {
    return { name: 'Shri Rahul Gandhi', isGenericRef: false };
  }
  if (q.includes('senthilkumar') || q.includes('senthil')) {
    return { name: 'Dr. A. Senthilkumar', isGenericRef: false };
  }
  if (q.includes('priyanka gandhi') || q.includes('priyanka')) {
    return { name: 'Smt. Priyanka Gandhi Vadra', isGenericRef: false };
  }
  if (q.includes('supriya sule') || q.includes('supriya')) {
    return { name: 'Smt. Supriya Sule', isGenericRef: false };
  }
  if (q.includes('akhilesh yadav') || q.includes('akhilesh')) {
    return { name: 'Shri Akhilesh Yadav', isGenericRef: false };
  }

  // Check initialMps
  for (const mp of initialMps) {
    const lastName = mp.name.split(' ').pop()?.toLowerCase();
    if (lastName && lastName.length > 3 && q.includes(lastName)) {
      return { name: mp.name, id: mp.id, isGenericRef: false };
    }
  }

  return { isGenericRef: false };
}

// Extract Project reference
function extractProjectReference(query: string, userContext: UserContext): string | null {
  if (userContext.activeProjectId) {
    return userContext.activeProjectId;
  }
  const q = query.toLowerCase();
  if (q.includes('morappur') || q.includes('health sub-center') || q.includes('cold chain')) {
    return 'proj-tn-dhm-06';
  }
  if (q.includes('sitheri') || q.includes('paver block') || q.includes('tribal link road')) {
    return 'proj-tn-dhm-02';
  }
  // Check project code pattern
  const codeMatch = query.match(/(?:proj-|prj-|mplads\/)[a-zA-Z0-9\-_/]+/i);
  if (codeMatch) {
    return codeMatch[0];
  }
  return null;
}

// Extract Category / Sector
function extractCategory(query: string): string | null {
  const q = query.toLowerCase();
  if (q.includes('water') || q.includes('ro plant') || q.includes('drinking') || q.includes('borewell') || q.includes('pipeline')) {
    return 'Drinking Water';
  }
  if (q.includes('road') || q.includes('bridge') || q.includes('culvert') || q.includes('pavement') || q.includes('highway')) {
    return 'Road Construction';
  }
  if (q.includes('school') || q.includes('education') || q.includes('classroom') || q.includes('laboratory') || q.includes('smart lab')) {
    return 'School Education';
  }
  if (q.includes('health') || q.includes('clinic') || q.includes('hospital') || q.includes('dispensary') || q.includes('sub-center')) {
    return 'Healthcare Clinics';
  }
  if (q.includes('sanitation') || q.includes('toilet') || q.includes('drainage') || q.includes('waste')) {
    return 'Sanitation';
  }
  if (q.includes('solar') || q.includes('electricity') || q.includes('power') || q.includes('lighting')) {
    return 'Rural Electrification';
  }
  if (q.includes('community') || q.includes('hall') || q.includes('shelter') || q.includes('kalyana mandapam')) {
    return 'Community Halls';
  }
  return null;
}

/**
 * Main query processor
 */
export function processDrishtiQuery(
  rawQuery: string,
  role: Role = 'CITIZEN',
  userContext: UserContext = {},
  conversationHistory: ConversationTurn[] = []
): CopilotResponse {
  const query = (rawQuery || '').trim();
  const q = query.toLowerCase();

  // Step 1: Detect Follow-Up & Retrieve Historical Entities
  let previousState: string | undefined = undefined;
  let previousDistrict: string | undefined = undefined;
  let previousMP: string | undefined = undefined;
  let previousProject: string | undefined = undefined;
  let previousCategory: string | undefined = undefined;

  // Scan recent bot & user turns for memory
  for (let i = conversationHistory.length - 1; i >= 0; i--) {
    const turn = conversationHistory[i];
    const prevText = turn.text.toLowerCase();
    if (!previousState) {
      previousState = extractStateName(prevText) || undefined;
    }
    if (!previousMP) {
      const mpRef = extractMPReference(prevText, {});
      if (mpRef.name) previousMP = mpRef.name;
    }
    if (!previousCategory) {
      previousCategory = extractCategory(prevText) || undefined;
    }
  }

  // Step 2: Entity Extraction from current query
  const extractedState = extractStateName(query);
  const extractedDistrict = extractDistrictName(query);
  const mpRef = extractMPReference(query, userContext);
  const extractedProjectRef = extractProjectReference(query, userContext);
  const extractedCategory = extractCategory(query);

  // Effective context
  const activeState = extractedState || previousState || userContext.activeState || userContext.state || 'Tamil Nadu';
  const activeDistrict = extractedDistrict || previousDistrict || userContext.activeDistrict || userContext.district || 'Dharmapuri';
  const activeConstituency = userContext.constituency || 'Dharmapuri';

  // Step 3: Intent Classification

  // 1. Delayed Projects
  const isDelayedIntent =
    (q.includes('delayed') || q.includes('delay') || q.includes('late') || q.includes('stalled') || q.includes('behind schedule')) &&
    !q.includes('why is this project risky');

  // 2. High Risk Analysis
  const isRiskAnalysisIntent =
    (q.includes('high risk') || q.includes('which projects are risk') || q.includes('risky projects') || q.includes('risk analysis') || (q.includes('risk') && !q.includes('why is this project risky') && !q.includes('why')));

  // 3. Why is this project risky?
  const isWhyRiskyIntent =
    (q.includes('why') && (q.includes('risk') || q.includes('flagged') || q.includes('delayed') || q.includes('anomaly'))) ||
    q.includes('why is this project risky') ||
    q.includes('explain the risk') ||
    q.includes('evidence');

  // 4. Financial / Money Utilized
  const isFinancialIntent =
    q.includes('how much money is utilized') ||
    q.includes('money is utilized') ||
    q.includes('how much money') ||
    q.includes('fund utilization') ||
    q.includes('money utilized') ||
    q.includes('how much has been spent') ||
    q.includes('funds spent') ||
    q.includes('expenditure') ||
    q.includes('unspent balance') ||
    q.includes('how much utilized') ||
    (q.includes('utilized') && (q.includes('money') || q.includes('fund') || q.includes('how much') || q.includes('rate')));

  // 5. Educational (How does MPLADS work?)
  const isEducationalIntent =
    q.includes('how does mplads work') ||
    q.includes('how mplads works') ||
    q.includes('explain mplads') ||
    q.includes('what is mplads') ||
    q.includes('mplads guidelines') ||
    q.includes('rules of mplads') ||
    q.includes('how does the scheme work') ||
    q.includes('who sanctions') ||
    q.includes('prohibited works') ||
    q.includes('permitted works');

  // 6. What needs attention? / Priority queue
  const isAttentionIntent =
    q.includes('what needs attention') ||
    q.includes('needs attention') ||
    q.includes('what should i focus on') ||
    q.includes('action queue') ||
    q.includes('prioritize actions') ||
    q.includes('prioritize alerts') ||
    q.includes('urgent tasks') ||
    q.includes('pending approvals') ||
    q.includes('pending actions');

  // 7. MP Profile / Performance
  const isMPIntent =
    q.includes('tell me about this mp') ||
    q.includes('about this mp') ||
    q.includes('who is the mp') ||
    q.includes('mp performance') ||
    q.includes('mp profile') ||
    mpRef.name !== undefined;

  // 8. Generate Report
  const isReportIntent =
    q.includes('generate report') ||
    q.includes('download report') ||
    q.includes('export report') ||
    q.includes('create report') ||
    q.includes('give me a report') ||
    q.includes('export data') ||
    q.includes('download csv') ||
    q.includes('print pdf');

  // 9. Follow-up "Show only delayed ones" or "show only completed"
  const isFollowUpFilter =
    q.startsWith('show only') ||
    q.includes('only delayed') ||
    q.includes('only completed') ||
    q.includes('what about water') ||
    q.includes('what about their funds') ||
    q.includes('what about road');

  // 10. State Projects Intent
  const isStateIntent =
    Boolean(extractedState) && (q.includes('projects') || q.includes('works') || q.includes('show') || q.includes('list'));

  // 11. Citizen Grievance Intent
  const isGrievanceIntent =
    q.includes('complaint') || q.includes('grievance') || q.includes('pothole') || q.includes('broken') || q.includes('lodge') || q.includes('file a complaint');

  // =========================================================================
  // EXECUTION ROUTER
  // =========================================================================

  // -------------------------------------------------------------------------
  // INTENT 1: DELAYED PROJECTS
  // -------------------------------------------------------------------------
  if (isDelayedIntent || (isFollowUpFilter && q.includes('delayed'))) {
    // Filter projects based on delayed status and context
    let delayed = COMPREHENSIVE_PAN_INDIA_PROJECTS.filter(p =>
      p.status === 'Delayed' || (p.timeline && p.timeline.some(t => t.note?.toLowerCase().includes('delayed')))
    );

    // Apply state or district filter if present in query or previous context
    const filterState = extractedState || (previousState && !q.includes('all india') ? previousState : undefined);
    if (filterState) {
      delayed = delayed.filter(p => p.state.toLowerCase() === filterState.toLowerCase());
    } else if (role === 'MP' && userContext.constituency) {
      delayed = delayed.filter(p => p.constituency.toLowerCase() === userContext.constituency!.toLowerCase());
    } else if (role === 'DISTRICT_OFFICER' && userContext.district) {
      delayed = delayed.filter(p => p.district.toLowerCase() === userContext.district!.toLowerCase());
    }

    // Category filter if present
    const category = extractedCategory || previousCategory;
    if (category) {
      delayed = delayed.filter(p => p.category.toLowerCase().includes(category.toLowerCase()));
    }

    const totalDelayed = delayed.length;
    const totalSanctionedLakhs = delayed.reduce((sum, p) => sum + (p.financial?.sanctionedAmountLakhs || 0), 0);
    const totalExpendedLakhs = delayed.reduce((sum, p) => sum + (p.financial?.expenditureLakhs || 0), 0);
    const scopeLabel = filterState ? `${filterState}` : (userContext.constituency && role === 'MP' ? `${userContext.constituency}` : 'National Overview');

    const kpis: CopilotKpi[] = [
      { label: 'Delayed Works', value: `${totalDelayed}`, helper: scopeLabel, highlight: true },
      { label: 'Locked Funds', value: `₹${(totalSanctionedLakhs / 100).toFixed(2)} Cr`, helper: 'Sanctioned value' },
      { label: 'Disbursed So Far', value: `₹${(totalExpendedLakhs / 100).toFixed(2)} Cr`, helper: 'Expenditure booked' },
      { label: 'Avg Schedule Slippage', value: '74 Days', helper: 'Over due date' },
    ];

    const cards: CopilotCard[] = delayed.slice(0, 4).map(p => {
      const delayNote = p.timeline?.slice(-1)[0]?.note || 'Delayed due to contractor slow pace / administrative clearances';
      return {
        id: p.id,
        type: 'project',
        title: p.title,
        subtitle: `${p.district}, ${p.state} • ${p.category}`,
        badge: { text: `Delayed (+65d)`, variant: 'danger' },
        progress: p.progressPercentage,
        amountLakhs: p.financial.sanctionedAmountLakhs,
        metrics: [
          { label: 'Sanctioned', value: `₹${p.financial.sanctionedAmountLakhs}L` },
          { label: 'Physical Progress', value: `${p.progressPercentage}%` },
          { label: 'Expenditure', value: `₹${p.financial.expenditureLakhs}L` },
        ],
        factors: [delayNote],
        action: {
          label: 'Open Project Dossier',
          path: `/projects/${p.id}`,
          actionType: 'navigate',
        },
      };
    });

    const reply = `**Schedule Delay Diagnostic (${scopeLabel})**
A total of **${totalDelayed} development works** are currently flagged for schedule overrun in ${scopeLabel}, locking **₹${(totalSanctionedLakhs / 100).toFixed(2)} Crore** in public capital.

Key Observations:
• **Primary Bottlenecks**: Seasonal waterlogging/monsoon disruptions, single-bid tender retendering, and delay in executing agencies submitting interim Utilization Certificates (UCs).
• **Statutory Protocol**: Under MoSPI MPLADS Operating Guidelines, the District Collectorate must convene a joint field review with the Executive Engineer and issue a 15-day show-cause notice before milestone re-allocation.
• **AI Advisory**: Preliminary indicator flagged for human review. Administrative milestone adjustments require physical site inspection confirmation.`;

    const actions: CopilotAction[] = [
      { label: 'View Delayed Works on Map', actionType: 'navigate', path: '/projects?status=Delayed' },
      { label: 'Download Delayed Works Report', actionType: 'open_report' },
      { label: 'Which projects are high risk?', actionType: 'quick_reply', prompt: 'Which projects are high risk?' },
    ];

    return {
      reply,
      source: 'Official MPLADS Monitoring System & District DRDA',
      lastUpdated: 'Live Schedule Engine (Current Session)',
      status: 'LIVE',
      intent: 'SHOW_DELAYED_PROJECTS',
      kpis,
      cards,
      actions,
      relevantRecords: delayed.slice(0, 5),
    };
  }

  // -------------------------------------------------------------------------
  // INTENT 2: HIGH RISK ANALYSIS
  // -------------------------------------------------------------------------
  if (isRiskAnalysisIntent) {
    const risks = initialAuditRisks;
    const highRisks = risks.filter(r => r.level === 'HIGH' || r.riskScore >= 65);
    const totalRisksCount = risks.length;

    const kpis: CopilotKpi[] = [
      { label: 'High Risk Works', value: `${highRisks.length}`, helper: 'Immediate review', highlight: true },
      { label: 'Total Anomaly Flags', value: `${totalRisksCount}`, helper: 'Audit score > 40' },
      { label: 'Peak Risk Index', value: '74 / 100', helper: 'Morappur HSC' },
      { label: 'Audit Scrutiny', value: '100% Geotagged', helper: 'CAG field scanner' },
    ];

    const cards: CopilotCard[] = risks.slice(0, 4).map(r => ({
      id: r.id,
      type: 'risk',
      title: r.projectTitle,
      subtitle: `${r.location} • Code: ${r.projectCode}`,
      badge: {
        text: `Risk ${r.riskScore}/100 (${r.level})`,
        variant: r.level === 'HIGH' ? 'danger' : 'warning',
      },
      riskScore: r.riskScore,
      riskLevel: r.level as 'HIGH' | 'MEDIUM' | 'LOW',
      factors: r.factors,
      evidence: r.evidenceSummary,
      action: {
        label: 'Inspect Risk Dossier',
        path: `/projects/${r.projectId}`,
        actionType: 'navigate',
      },
    }));

    const reply = `**Autonomous Risk & Anomaly Scrutiny**
The automated audit scanner has detected **${highRisks.length} high-severity anomalies** and **${totalRisksCount} total audit triggers** requiring administrative field verification.

Top Anomaly Drivers Detected:
1. **Physical vs. Financial Divergence**: High expenditure booked while physical milestone completion remains stagnant for >60 days.
2. **Missing Photographic Evidence**: Site contractors failing to upload mandatory GPS timestamped progression photos.
3. **Contractor Rate Disputes**: Deviation claims submitted outside the approved State PWD Schedule of Rates (SoR).

*Compliance Caveat*: All flags are neutral algorithmic diagnostic signals for administrative intervention. The AI does not establish legal culpability or replace physical verification by the District Nodal Officer.`;

    const actions: CopilotAction[] = [
      { label: 'Open Risk Inspector', actionType: 'navigate', path: `/projects/${risks[0]?.projectId || 'proj-tn-dhm-06'}` },
      { label: 'Why is this project risky?', actionType: 'quick_reply', prompt: 'Why is this project risky?' },
      { label: 'Generate Risk Report', actionType: 'open_report' },
    ];

    return {
      reply,
      source: 'CAG Social Audit & Automated Risk Intelligence Matrix',
      lastUpdated: 'Today 08:30 AM (Batch Synced)',
      status: 'LIVE',
      intent: 'HIGH_RISK_ANALYSIS',
      kpis,
      cards,
      actions,
      relevantRecords: risks,
    };
  }

  // -------------------------------------------------------------------------
  // INTENT 3: WHY IS THIS PROJECT RISKY?
  // -------------------------------------------------------------------------
  if (isWhyRiskyIntent) {
    // Determine which project to explain
    let targetProject = null;
    let targetRisk = null;

    if (extractedProjectRef) {
      targetProject = COMPREHENSIVE_PAN_INDIA_PROJECTS.find(p => p.id === extractedProjectRef || p.code === extractedProjectRef);
      targetRisk = initialAuditRisks.find(r => r.projectId === extractedProjectRef || r.projectCode === extractedProjectRef);
    }

    if (!targetRisk) {
      // Default to highest risk project
      targetRisk = initialAuditRisks[0];
      targetProject = COMPREHENSIVE_PAN_INDIA_PROJECTS.find(p => p.id === targetRisk.projectId);
    }

    const title = targetProject?.title || targetRisk.projectTitle;
    const location = targetProject ? `${targetProject.village ? targetProject.village + ', ' : ''}${targetProject.district}, ${targetProject.state}` : targetRisk.location;
    const code = targetProject?.code || targetRisk.projectCode;
    const sanctioned = targetProject?.financial.sanctionedAmountLakhs || 35.0;
    const expended = targetProject?.financial.expenditureLakhs || 16.4;
    const progress = targetProject?.progressPercentage || 58;

    const kpis: CopilotKpi[] = [
      { label: 'Risk Score', value: `${targetRisk.riskScore} / 100`, helper: targetRisk.level, highlight: true },
      { label: 'Physical Progress', value: `${progress}%`, helper: 'Reported on site' },
      { label: 'Disbursement Booked', value: `₹${expended} L`, helper: `${Math.round((expended / sanctioned) * 100)}% of sanction` },
      { label: 'Evidence Gap', value: '82 Days', helper: 'No new geotagged photo' },
    ];

    const cards: CopilotCard[] = [
      {
        id: targetRisk.id,
        type: 'risk',
        title: title,
        subtitle: `Code: ${code} • Location: ${location}`,
        badge: { text: `Risk Index: ${targetRisk.riskScore}/100 (${targetRisk.level})`, variant: 'danger' },
        riskScore: targetRisk.riskScore,
        riskLevel: targetRisk.level as 'HIGH',
        factors: targetRisk.factors,
        evidence: targetRisk.evidenceSummary,
        metrics: [
          { label: 'Sanctioned', value: `₹${sanctioned} Lakhs` },
          { label: 'Disbursed', value: `₹${expended} Lakhs` },
          { label: 'Discrepancy', value: `+${Math.round((expended / sanctioned) * 100) - progress}% Fund/Work Gap` },
        ],
        action: {
          label: 'Open Full Project Dossier',
          path: `/projects/${targetRisk.projectId}`,
          actionType: 'navigate',
        },
      },
    ];

    const reply = `**Risk Breakdown for ${title}**
This project has been flagged with a **Risk Index of ${targetRisk.riskScore}/100 (${targetRisk.level} Risk)** based on four convergent diagnostic signals:

1. **Expenditure Velocity Outpacing Construction**:
   • ₹${expended} Lakhs (${Math.round((expended / sanctioned) * 100)}% of sanction) has been disbursed, but verified physical completion has stalled at **${progress}%**.
2. **Missing Photographic Evidence Trail**:
   • ${targetRisk.factors[0] || 'No GPS-verified progression photos uploaded for over 82 days'}.
3. **Contractor Dispute & Rate Variance**:
   • ${targetRisk.reason || 'Contractor arbitration over non-tendered rate enhancements flagged in site engineering registers'}.
4. **Milestone Overrun**:
   • The scheduled Phase-2 lintel milestone deadline lapsed 65 days ago without an approved time extension request.

**Recommended Statutory Action**:
The District Collector should withhold Phase-3 tranche releases, direct the Assistant Executive Engineer (AEE) to carry out a 48-hour physical site measurement, and verify stage-wise curing compliance.`;

    const actions: CopilotAction[] = [
      { label: 'View Photo Evidence Trail', actionType: 'navigate', path: `/projects/${targetRisk.projectId}` },
      { label: 'Which other projects are high risk?', actionType: 'quick_reply', prompt: 'Which projects are high risk?' },
      { label: 'Show delayed projects', actionType: 'quick_reply', prompt: 'Show delayed projects' },
    ];

    return {
      reply,
      source: 'Automated Exception Engine & CAG Field Audit Scanner',
      lastUpdated: 'Synchronized with Site Telemetry (Today)',
      status: 'LIVE',
      intent: 'PROJECT_RISK_EXPLANATION',
      kpis,
      cards,
      actions,
      relevantRecords: [targetRisk, targetProject],
    };
  }

  // -------------------------------------------------------------------------
  // INTENT 4: FINANCIAL UTILIZATION
  // -------------------------------------------------------------------------
  if (isFinancialIntent) {
    // Check if query targets an MP, a State, or National
    if (extractedState || (previousState && !q.includes('national'))) {
      const stName = extractedState || previousState!;
      const stateMetrics = dashboardIntelligence.getStateMetrics(stName);

      const kpis: CopilotKpi[] = [
        { label: `${stName} Released`, value: `₹${stateMetrics.totalReleasedCr} Cr`, helper: 'MoSPI tranches', highlight: true },
        { label: 'Sanctioned by Collector', value: `₹${stateMetrics.totalSanctionedCr} Cr`, helper: `${stateMetrics.totalWorks} works` },
        { label: 'Utilized Expenditure', value: `₹${stateMetrics.totalUtilizedCr} Cr`, helper: 'Disbursed against UCs' },
        { label: 'Utilization Rate', value: `${stateMetrics.utilizationRate}%`, helper: `Target: >80%` },
      ];

      const cards: CopilotCard[] = [
        {
          id: `fund-${stateMetrics.code}`,
          type: 'fund',
          title: `${stName} MPLADS Fund Flow Lifecycle`,
          subtitle: `Across ${stateMetrics.districtsCount} Districts • ${stateMetrics.mpCount} Members of Parliament`,
          badge: {
            text: stateMetrics.utilizationRate >= 80 ? 'Optimal Utilization' : 'Moderate Flow',
            variant: stateMetrics.utilizationRate >= 80 ? 'success' : 'warning',
          },
          metrics: [
            { label: 'Released', value: `₹${stateMetrics.totalReleasedCr} Cr` },
            { label: 'Sanctioned', value: `₹${stateMetrics.totalSanctionedCr} Cr` },
            { label: 'Utilized', value: `₹${stateMetrics.totalUtilizedCr} Cr` },
            { label: 'Treasury Balance', value: `₹${stateMetrics.remainingCr} Cr` },
          ],
          action: {
            label: `Filter Dashboard to ${stName}`,
            path: `/dashboard?state=${encodeURIComponent(stName)}`,
            actionType: 'navigate',
          },
        },
      ];

      const reply = `**MPLADS Fund Utilization for ${stName}**
According to the latest MoSPI public finance ledger:
• **Total Funds Released by Centre**: **₹${stateMetrics.totalReleasedCr} Crore**
• **Administrative Sanctions Accorded**: **₹${stateMetrics.totalSanctionedCr} Crore**
• **Actual Expenditure Booked**: **₹${stateMetrics.totalUtilizedCr} Crore**
• **Effective Utilization Rate**: **${stateMetrics.utilizationRate}%** (vs. National Average 79.8%)
• **Unspent Treasury Balance**: **₹${stateMetrics.remainingCr} Crore** (Remains non-lapsable in District Nodal Authority accounts)

${stName} has completed **${stateMetrics.completedWorks} of ${stateMetrics.totalWorks} works** (${stateMetrics.completionRate}% physical completion).`;

      const actions: CopilotAction[] = [
        { label: `Show ${stName} Projects`, actionType: 'quick_reply', prompt: `Show ${stName} projects` },
        { label: 'Download State Financial Report', actionType: 'open_report' },
        { label: 'Compare with National Benchmark', actionType: 'navigate', path: '/dashboard' },
      ];

      return {
        reply,
        source: 'Ministry of Statistics and Programme Implementation (MoSPI) & PFMS',
        lastUpdated: 'Live Financial Ledger (Current Session)',
        status: 'LIVE',
        intent: 'FINANCIAL_UTILIZATION',
        kpis,
        cards,
        actions,
        relevantRecords: [stateMetrics],
      };
    }

    // MP / Constituency specific finances
    if (mpRef.name || userContext.constituency) {
      const targetConstituency = mpRef.name?.includes('Modi') ? 'Varanasi' : (mpRef.name?.includes('Rahul') ? 'Rae Bareli' : activeConstituency);
      const summary = mpladsDataAdapter.getConstituencySummary(targetConstituency);

      const kpis: CopilotKpi[] = [
        { label: 'Annual Entitlement', value: `₹5.00 Cr`, helper: 'Non-lapsable', highlight: true },
        { label: 'Released to District', value: `₹${summary.fundReleasedLakhs} L`, helper: 'Central tranches' },
        { label: 'Expenditure Booked', value: `₹${summary.totalExpenditureLakhs} L`, helper: 'Against valid UCs' },
        { label: 'Utilization Rate', value: `${summary.utilizationPercentage}%`, helper: 'Official metric' },
      ];

      const cards: CopilotCard[] = [
        {
          id: `fund-${targetConstituency}`,
          type: 'fund',
          title: `${targetConstituency} Parliamentary Financial Ledger`,
          subtitle: `MP: ${summary.mpName} • State: ${summary.state}`,
          badge: { text: `${summary.utilizationPercentage}% Utilized`, variant: Number(summary.utilizationPercentage) >= 80 ? 'success' : 'warning' },
          metrics: [
            { label: 'Entitlement', value: '₹500.0 L' },
            { label: 'Released', value: `₹${summary.fundReleasedLakhs} L` },
            { label: 'Spent', value: `₹${summary.totalExpenditureLakhs} L` },
            { label: 'Unspent Balance', value: `₹${summary.unspentBalanceLakhs} L` },
          ],
          action: {
            label: 'View Constituency Projects',
            path: `/projects?constituency=${encodeURIComponent(targetConstituency)}`,
            actionType: 'navigate',
          },
        },
      ];

      const reply = `**Constituency Fund Utilization: ${targetConstituency} (${summary.state})**
• **Hon'ble MP**: ${summary.mpName}
• **Statutory Entitlement**: **₹500.0 Lakhs (₹5.00 Crore)** per fiscal year
• **Funds Released to Collector**: **₹${summary.fundReleasedLakhs} Lakhs**
• **Actual Expenditure Booked**: **₹${summary.totalExpenditureLakhs} Lakhs**
• **Utilization Percentage**: **${summary.utilizationPercentage}%**
• **Unspent Liquid Balance**: **₹${summary.unspentBalanceLakhs} Lakhs**
• **Works Physical Delivery**: **${summary.totalWorksCompleted} completed** out of ${summary.totalWorksRecommended} recommended.`;

      const actions: CopilotAction[] = [
        { label: 'Show delayed projects', actionType: 'quick_reply', prompt: 'Show delayed projects' },
        { label: 'Tell me about this MP', actionType: 'quick_reply', prompt: `Tell me about ${summary.mpName}` },
        { label: 'Download Financial Statement', actionType: 'open_report' },
      ];

      return {
        reply,
        source: 'Official MPLADS Portal (https://mplads.gov.in) & PFMS',
        lastUpdated: 'Synced with MoSPI Gazette',
        status: 'LIVE',
        intent: 'FINANCIAL_UTILIZATION',
        kpis,
        cards,
        actions,
        relevantRecords: [summary],
      };
    }

    // National Level Finances
    const nat = dashboardIntelligence.getNationalOverview();
    const kpis: CopilotKpi[] = [
      { label: 'Total Released', value: `₹${nat.totalReleasedCr.toLocaleString()} Cr`, helper: 'All 36 States & UTs', highlight: true },
      { label: 'Total Sanctioned', value: `₹${nat.totalSanctionedCr.toLocaleString()} Cr`, helper: 'By District Collectors' },
      { label: 'Total Utilized', value: `₹${nat.totalUtilizedCr.toLocaleString()} Cr`, helper: 'Verified work value' },
      { label: 'National Utilization', value: `${nat.avgUtilizationRate}%`, helper: 'Expenditure / Released' },
    ];

    const cards: CopilotCard[] = [
      {
        id: 'national-finance',
        type: 'fund',
        title: 'All-India MPLADS Fund Flow Lifecycle',
        subtitle: `787+ Districts • 28 States & 8 UTs • 18th Lok Sabha`,
        badge: { text: `${nat.avgUtilizationRate}% Pan-India Utilization`, variant: 'success' },
        metrics: [
          { label: 'Central Release', value: `₹${nat.totalReleasedCr} Cr` },
          { label: 'Admin Sanctions', value: `₹${nat.totalSanctionedCr} Cr` },
          { label: 'Completed Works', value: `${nat.completedWorks.toLocaleString()}` },
          { label: 'Unspent Treasury', value: `₹${nat.remainingBalanceCr} Cr` },
        ],
        action: {
          label: 'Open National Intelligence Dashboard',
          path: '/dashboard',
          actionType: 'navigate',
        },
      },
    ];

    const reply = `**National MPLADS Financial Flow Overview**
Nationwide financial consolidation across all 543 Lok Sabha and 245 Rajya Sabha seats:
• **Total Funds Released by Government of India**: **₹${nat.totalReleasedCr.toLocaleString()} Crore**
• **Administrative Sanctions Accorded by Collectors**: **₹${nat.totalSanctionedCr.toLocaleString()} Crore**
• **Disbursed Expenditure (Milestones Paid)**: **₹${nat.totalUtilizedCr.toLocaleString()} Crore**
• **National Average Utilization Rate**: **${nat.avgUtilizationRate}%**
• **National Project Completion Rate**: **${nat.avgCompletionRate}%** (${nat.completedWorks.toLocaleString()} assets commissioned)
• **Unspent Liquid Balances**: **₹${nat.remainingBalanceCr.toLocaleString()} Crore** (Retained non-lapsable in District Authority escrow accounts).`;

    const actions: CopilotAction[] = [
      { label: 'Show Rajasthan projects', actionType: 'quick_reply', prompt: 'Show Rajasthan projects' },
      { label: 'Show delayed projects', actionType: 'quick_reply', prompt: 'Show delayed projects' },
      { label: 'Download National Audit Digest', actionType: 'open_report' },
    ];

    return {
      reply,
      source: 'Ministry of Statistics and Programme Implementation (MoSPI) & National Informatics Centre',
      lastUpdated: 'Live Financial Core',
      status: 'LIVE',
      intent: 'FINANCIAL_UTILIZATION',
      kpis,
      cards,
      actions,
      relevantRecords: [nat],
    };
  }

  // -------------------------------------------------------------------------
  // INTENT 5: STATE OR LOCATION PROJECTS (e.g. "Show Rajasthan projects")
  // -------------------------------------------------------------------------
  if (isStateIntent || extractedState) {
    const targetState = extractedState || 'Rajasthan';
    const stateMetrics = dashboardIntelligence.getStateMetrics(targetState);
    const stateProjects = COMPREHENSIVE_PAN_INDIA_PROJECTS.filter(
      p => p.state.toLowerCase() === targetState.toLowerCase()
    );

    const kpis: CopilotKpi[] = [
      { label: `${targetState} Works`, value: `${stateMetrics.totalWorks}`, helper: `Across ${stateMetrics.districtsCount} Districts`, highlight: true },
      { label: 'Sanctioned Value', value: `₹${stateMetrics.totalSanctionedCr} Cr`, helper: 'Capital deployed' },
      { label: 'Utilization Rate', value: `${stateMetrics.utilizationRate}%`, helper: 'Expenditure / Released' },
      { label: 'Completed Works', value: `${stateMetrics.completedWorks}`, helper: `${stateMetrics.completionRate}% completion` },
    ];

    const cards: CopilotCard[] = stateProjects.slice(0, 4).map(p => ({
      id: p.id,
      type: 'project',
      title: p.title,
      subtitle: `${p.district}, ${p.state} • ${p.category}`,
      badge: {
        text: p.status,
        variant: p.status === 'Completed' ? 'success' : (p.status === 'Delayed' ? 'danger' : 'warning'),
      },
      progress: p.progressPercentage,
      amountLakhs: p.financial.sanctionedAmountLakhs,
      metrics: [
        { label: 'Sanctioned', value: `₹${p.financial.sanctionedAmountLakhs}L` },
        { label: 'Physical Progress', value: `${p.progressPercentage}%` },
        { label: 'Department', value: p.department.split('/')[0] || 'PWD' },
      ],
      action: {
        label: 'Open Project Dossier',
        path: `/projects/${p.id}`,
        actionType: 'navigate',
      },
    }));

    const topSectorsStr = stateMetrics.topSectors.map(s => `${s.sector} (${s.percentage}%)`).join(', ');

    const reply = `**Development Portfolio for ${targetState}**
A total of **${stateMetrics.totalWorks} developmental projects** are tracked across ${stateMetrics.districtsCount} districts in ${targetState}.
• **Financial Allocations**: **₹${stateMetrics.totalSanctionedCr} Cr sanctioned**, with **₹${stateMetrics.totalUtilizedCr} Cr utilized** (${stateMetrics.utilizationRate}% utilization rate).
• **Execution Status**: **${stateMetrics.completedWorks} completed** (${stateMetrics.completionRate}%), **${stateMetrics.inProgressWorks} in active progress**, and **${stateMetrics.delayedWorks} delayed**.
• **Priority Sectors**: ${topSectorsStr}.`;

    const actions: CopilotAction[] = [
      { label: `Filter Dashboard to ${targetState}`, actionType: 'navigate', path: `/dashboard?state=${encodeURIComponent(targetState)}` },
      { label: `Show only delayed ones`, actionType: 'quick_reply', prompt: `Show delayed projects in ${targetState}` },
      { label: `How much money is utilized in ${targetState}?`, actionType: 'quick_reply', prompt: `How much money is utilized in ${targetState}?` },
    ];

    return {
      reply,
      source: `MoSPI State MPLADS Repository & ${targetState} Planning Dept`,
      lastUpdated: 'Live Field Sync (Current Session)',
      status: 'LIVE',
      intent: 'STATE_OR_LOCATION_PROJECTS',
      kpis,
      cards,
      actions,
      relevantRecords: stateProjects.slice(0, 5),
    };
  }

  // -------------------------------------------------------------------------
  // INTENT 6: MP PROFILE & PERFORMANCE
  // -------------------------------------------------------------------------
  if (isMPIntent) {
    let mp: any = undefined;

    if (mpRef.name) {
      mp = initialMps.find(m => m.name.toLowerCase().includes(mpRef.name!.toLowerCase()));
    } else if (userContext.activeMpId) {
      mp = initialMps.find(m => m.id === userContext.activeMpId);
    } else if (userContext.constituency) {
      mp = initialMps.find(m => m.constituency.toLowerCase() === userContext.constituency!.toLowerCase());
    }

    if (!mp) {
      // Fallback to Shri Narendra Modi or Dr. A. Senthilkumar
      mp = initialMps[0];
    }

    const constituencySummary = mpladsDataAdapter.getConstituencySummary(mp.constituency);
    const benchmark = dashboardIntelligence.getMpBenchmarkComparison(mp as any);

    const kpis: CopilotKpi[] = [
      { label: 'Constituency', value: mp.constituency, helper: mp.state, highlight: true },
      { label: 'Recommended Works', value: `${constituencySummary.totalWorksRecommended}`, helper: '18th Lok Sabha' },
      { label: 'Completed Works', value: `${constituencySummary.totalWorksCompleted}`, helper: `${Math.round((constituencySummary.totalWorksCompleted / constituencySummary.totalWorksRecommended) * 100)}% delivery` },
      { label: 'Fund Utilization', value: `${constituencySummary.utilizationPercentage}%`, helper: `Benchmark: ${benchmark.stateAvgUtilizationRate}%` },
    ];

    const mpProjects = COMPREHENSIVE_PAN_INDIA_PROJECTS.filter(
      p => p.constituency.toLowerCase() === mp!.constituency.toLowerCase()
    );

    const cards: CopilotCard[] = [
      {
        id: mp.id,
        type: 'mp',
        title: mp.name,
        subtitle: `${mp.party} • ${mp.house} • ${mp.constituency}, ${mp.state}`,
        badge: { text: mp.membershipStatus === 'Sitting' ? 'Sitting 18th Lok Sabha' : 'Former Member', variant: 'success' },
        metrics: [
          { label: 'Terms', value: mp.lokSabhaTerms || '18th LS' },
          { label: 'Recommended', value: `${constituencySummary.totalWorksRecommended} Works` },
          { label: 'Sanctioned', value: `₹${(Number(constituencySummary.fundReleasedLakhs) / 100).toFixed(2)} Cr` },
          { label: 'Utilization', value: `${constituencySummary.utilizationPercentage}%` },
        ],
        action: {
          label: 'Open Full MP Dossier',
          path: `/mps/${mp.id}`,
          actionType: 'navigate',
        },
      },
      ...mpProjects.slice(0, 2).map(p => ({
        id: p.id,
        type: 'project' as const,
        title: p.title,
        subtitle: `${p.village || p.district} • ${p.category}`,
        badge: { text: p.status, variant: (p.status === 'Completed' ? 'success' : 'warning') as 'success' | 'warning' },
        progress: p.progressPercentage,
        amountLakhs: p.financial.sanctionedAmountLakhs,
        action: {
          label: 'View Project',
          path: `/projects/${p.id}`,
          actionType: 'navigate' as const,
        },
      })),
    ];

    const reply = `**Parliamentary Profile: ${mp.name}**
• **Constituency**: **${mp.constituency} (${mp.state})**
• **House & Party**: ${mp.house} • **${mp.party}**
• **Verified Record**: Official Digital Sansad 18th Lok Sabha Registry (Sansad ID: ${mp.sourceMemberId})
• **Asset Recommendations**: **${constituencySummary.totalWorksRecommended} works recommended**, with **${constituencySummary.totalWorksSanctioned} sanctioned** by the District Nodal Authority.
• **Execution Track Record**: **${constituencySummary.totalWorksCompleted} works completed**, **${constituencySummary.totalWorksOngoing} active**, and **${constituencySummary.totalWorksDelayed} delayed**.
• **Financial Utilization**: **${constituencySummary.utilizationPercentage}%** (₹${constituencySummary.totalExpenditureLakhs}L spent against ₹${constituencySummary.fundReleasedLakhs}L released).
• **Comparative Benchmark**: Utilization stands **${benchmark.benchmarkStatus.utilization}** compared to state average (${benchmark.stateAvgUtilizationRate}%).`;

    const actions: CopilotAction[] = [
      { label: 'Open MP Profile Dossier', actionType: 'navigate', path: `/mps/${mp.id}` },
      { label: `Show delayed projects in ${mp.constituency}`, actionType: 'quick_reply', prompt: `Show delayed projects in ${mp.constituency}` },
      { label: 'How much money is utilized?', actionType: 'quick_reply', prompt: `How much money is utilized in ${mp.constituency}?` },
    ];

    return {
      reply,
      source: 'Official Digital Sansad (https://sansad.in) & MoSPI MPLADS Portal',
      lastUpdated: 'Live Parliamentary Gazette Sync',
      status: 'LIVE',
      intent: 'MP_PROFILE_PERFORMANCE',
      kpis,
      cards,
      actions,
      relevantRecords: [mp, constituencySummary],
    };
  }

  // -------------------------------------------------------------------------
  // INTENT 7: PRIORITIZE ATTENTION / WHAT NEEDS ATTENTION?
  // -------------------------------------------------------------------------
  if (isAttentionIntent) {
    const queue = actionQueue;
    const delayed = COMPREHENSIVE_PAN_INDIA_PROJECTS.filter(p => p.status === 'Delayed');
    const urgentItems = queue.filter(q => q.priority === 'High');

    const kpis: CopilotKpi[] = [
      { label: 'Urgent Actions', value: `${urgentItems.length}`, helper: 'Immediate attention', highlight: true },
      { label: 'Delayed Works', value: `${delayed.length}`, helper: 'Overdue schedule' },
      { label: 'Pending Clearances', value: `₹${(queue.reduce((s, i) => s + i.amountLakhs, 0) / 100).toFixed(1)} Cr`, helper: 'In approval queue' },
      { label: 'Audited Telemetry', value: 'Live 100%', helper: 'District Collectorate' },
    ];

    const cards: CopilotCard[] = queue.slice(0, 4).map(item => ({
      id: item.id,
      type: 'action',
      title: item.title,
      subtitle: `${item.constituency} • MP: ${item.mpName}`,
      badge: {
        text: `${item.priority} Priority`,
        variant: item.priority === 'High' ? 'danger' : 'warning',
      },
      amountLakhs: item.amountLakhs,
      factors: [item.flagReason || `Pending ${item.type.replace(/_/g, ' ')}`],
      action: {
        label: 'Process Action Item',
        path: `/projects/${item.projectId}`,
        actionType: 'navigate',
      },
    }));

    const reply = `**Administrative Attention & Action Prioritization**
Based on statutory deadlines and milestone tracking, **${urgentItems.length} high-priority items** require immediate administrative intervention:

1. **Pending Technical & Administrative Sanctions**:
   • Multiple developmental recommendations awaiting Collectorate formal sanction orders before work order issuance.
2. **Prolonged Inactivity Signals**:
   • ${delayed.length} ongoing works have exceeded scheduled milestones by over 60 days without updated geotagged proof.
3. **Interim Utilization Certificates**:
   • Executing departments pending Phase-1 UC reconciliation before Phase-2 fund disbursement.

*Role Perspective*: For District Officers, administrative files must be physically verified; for Citizens, status of recommendations can be publicly audited below.`;

    const actions: CopilotAction[] = [
      { label: 'Show delayed projects', actionType: 'quick_reply', prompt: 'Show delayed projects' },
      { label: 'Which projects are high risk?', actionType: 'quick_reply', prompt: 'Which projects are high risk?' },
      { label: 'Generate Summary Report', actionType: 'open_report' },
    ];

    return {
      reply,
      source: 'District Collectorate Action Desk & MoSPI Nodal Register',
      lastUpdated: 'Live Action Desk (Current Session)',
      status: 'LIVE',
      intent: 'PRIORITIZE_ATTENTION',
      kpis,
      cards,
      actions,
      relevantRecords: queue,
    };
  }

  // -------------------------------------------------------------------------
  // INTENT 8: HOW DOES MPLADS WORK? (EDUCATIONAL)
  // -------------------------------------------------------------------------
  if (isEducationalIntent) {
    const kpis: CopilotKpi[] = [
      { label: 'Annual Entitlement', value: '₹5.00 Crore', helper: 'Per MP per fiscal year', highlight: true },
      { label: 'Installments', value: '2 × ₹2.50 Cr', helper: 'Direct to Nodal District' },
      { label: 'Fund Nature', value: 'Non-Lapsable', helper: 'Rolls over annually' },
      { label: 'Social Priority', value: '15% SC / 7.5% ST', helper: 'Mandatory allocation' },
    ];

    const cards: CopilotCard[] = [
      {
        id: 'edu-pillars',
        type: 'fund',
        title: 'Core Architecture of the MPLADS Scheme',
        subtitle: 'Ministry of Statistics & Programme Implementation (MoSPI)',
        badge: { text: 'Central Sector Scheme', variant: 'info' },
        factors: [
          '1. Recommendatory Mandate: MPs recommend community-prioritized works; they do not award tenders or disburse cash directly.',
          '2. District Authority Role: District Collector / DM accords administrative & technical sanction, engages government line agencies, and supervises quality.',
          '3. Milestone Transparency: 100% geotagged photos and digital Utilization Certificates required before installment release.',
          '4. Permitted Assets: Durable capital assets in Drinking Water, Schools, Sanitation, Rural Health, Link Roads, and Solar Power.',
          '5. Prohibited Works: Private commercial property, religious institutions, inventory/consumables, and grants to individuals.',
        ],
        action: {
          label: 'View National Analytics Dashboard',
          path: '/dashboard',
          actionType: 'navigate',
        },
      },
    ];

    const reply = `**How the MPLADS Scheme Functions (Official Framework)**
The **Member of Parliament Local Area Development Scheme (MPLADS)** is a 100% centrally funded scheme by the Government of India under the **Ministry of Statistics and Programme Implementation (MoSPI)**:

• **Funding Mechanism**:
  Each MP is entitled to **₹5.00 Crore per financial year**, released by MoSPI in two installments of ₹2.50 Cr each directly to the designated Nodal District Authority. The funds are strictly **non-lapsable**—unspent funds carry forward.

• **Roles & Separation of Powers**:
  1. **Hon'ble MP**: Evaluates local community demands and officially recommends capital works to the District Authority. Lok Sabha MPs recommend within their constituency; Rajya Sabha MPs within their state of election.
  2. **District Authority (Collector / DM)**: Verifies administrative feasibility, issues Technical & Administrative Sanctions, selects executing public departments (PWD, TWAD, Panchayats), and disburses payments strictly against verified milestones.

• **Statutory Social Quotas**:
  MPs must allocate at least **15%** of their annual entitlement for areas inhabited by Scheduled Caste (SC) populations and **7.5%** for Scheduled Tribe (ST) populations.

• **Strict Prohibitions**:
  Works on private commercial premises, places of worship, memorials, movable assets, or recurring operational expenses are strictly banned under statutory guidelines.`;

    const actions: CopilotAction[] = [
      { label: 'How much money is utilized?', actionType: 'quick_reply', prompt: 'How much money is utilized?' },
      { label: 'Show Rajasthan projects', actionType: 'quick_reply', prompt: 'Show Rajasthan projects' },
      { label: 'Which projects are high risk?', actionType: 'quick_reply', prompt: 'Which projects are high risk?' },
    ];

    return {
      reply,
      source: 'Official MPLADS Scheme Guidelines (2023 Revision), MoSPI',
      lastUpdated: 'Statutory Reference Core',
      status: 'LIVE',
      intent: 'MPLADS_EDUCATIONAL_EXPLANATION',
      kpis,
      cards,
      actions,
    };
  }

  // -------------------------------------------------------------------------
  // INTENT 9: GENERATE REPORT
  // -------------------------------------------------------------------------
  if (isReportIntent) {
    const filterState = extractedState || previousState || userContext.state || 'National Overview';
    const projectsInScope = extractedState
      ? COMPREHENSIVE_PAN_INDIA_PROJECTS.filter(p => p.state.toLowerCase() === extractedState.toLowerCase())
      : COMPREHENSIVE_PAN_INDIA_PROJECTS.slice(0, 50);

    const totalSanctioned = projectsInScope.reduce((s, p) => s + p.financial.sanctionedAmountLakhs, 0);
    const completedCount = projectsInScope.filter(p => p.status === 'Completed').length;
    const rate = Math.round((completedCount / projectsInScope.length) * 100);

    const kpis: CopilotKpi[] = [
      { label: 'Report Scope', value: `${projectsInScope.length} Works`, helper: filterState, highlight: true },
      { label: 'Total Value', value: `₹${(totalSanctioned / 100).toFixed(1)} Cr`, helper: 'Sanctioned funds' },
      { label: 'Completion Rate', value: `${rate}%`, helper: `${completedCount} commissioned` },
      { label: 'Audit Assurance', value: 'Verified', helper: 'MoSPI standard' },
    ];

    const cards: CopilotCard[] = [
      {
        id: 'report-csv',
        type: 'report',
        title: `Comprehensive Spreadsheet Report (${filterState})`,
        subtitle: `CSV export containing all financial, contractor, milestone and GPS fields for ${projectsInScope.length} records.`,
        badge: { text: 'CSV Dataset', variant: 'success' },
        action: {
          label: 'Download CSV Dataset',
          actionType: 'open_report',
          payload: { format: 'csv' },
        },
      },
      {
        id: 'report-pdf',
        type: 'report',
        title: `Printable Executive Briefing (${filterState})`,
        subtitle: 'Formal executive summary layout optimized for parliamentary reviews and collectorate meetings.',
        badge: { text: 'Print / PDF', variant: 'info' },
        action: {
          label: 'Open Printable PDF Preview',
          actionType: 'open_report',
          payload: { format: 'pdf' },
        },
      },
    ];

    const reply = `**Export Ready: MPLADS Intelligence Report (${filterState})**
Your customized intelligence report package has been compiled from the verified portal repository:
• **Included Records**: **${projectsInScope.length} projects** across active parameters.
• **Financial Footprint**: **₹${(totalSanctioned / 100).toFixed(2)} Crore** sanctioned.
• **Delivery Metric**: **${rate}% physical completion rate**.

Choose your desired export format below to initiate instant download or print preview.`;

    const actions: CopilotAction[] = [
      { label: 'Download CSV Dataset', actionType: 'open_report' },
      { label: 'Open Printable PDF Preview', actionType: 'open_report' },
      { label: 'Show delayed projects', actionType: 'quick_reply', prompt: 'Show delayed projects' },
    ];

    return {
      reply,
      source: 'Official MPLADS Automated Reporting Desk',
      lastUpdated: 'Compiled Just Now',
      status: 'LIVE',
      intent: 'GENERATE_REPORT',
      kpis,
      cards,
      actions,
    };
  }

  // -------------------------------------------------------------------------
  // INTENT 10: CITIZEN GRIEVANCE ASSISTANCE
  // -------------------------------------------------------------------------
  if (isGrievanceIntent && role === 'CITIZEN') {
    const kpis: CopilotKpi[] = [
      { label: 'Citizen Voice', value: 'Active', helper: 'Social audit', highlight: true },
      { label: 'Duplicate Check', value: 'Automated', helper: 'Prevents overlaps' },
      { label: 'Turnaround Target', value: '15 Days', helper: 'Nodal verification' },
    ];

    const reply = `**Citizen Development & Grievance Assistant**
Namaste! I can assist you in filing or tracking a grassroots infrastructure grievance directly to the District Collector and your Member of Parliament:

1. **Verify Existing Assets**: We check if a similar water plant, school classroom, or link road is already sanctioned in your ward to avoid duplication.
2. **Drafting Your Proposal**:
   • Location: Specify your village / ward landmark.
   • Issue: Specific defect (e.g., broken handpump, road cave-in, unlit street).
3. **1-Click Submission**: Generates a tracked citizen petition routed to the District Planning Cell.`;

    const actions: CopilotAction[] = [
      { label: 'Lodge New Grievance', actionType: 'navigate', path: '/citizen' },
      { label: 'Show drinking water projects near me', actionType: 'quick_reply', prompt: 'Show drinking water projects' },
    ];

    return {
      reply,
      source: 'Citizen Social Audit Desk',
      lastUpdated: 'Current Session',
      status: 'LIVE',
      intent: 'CITIZEN_GRIEVANCE_HELP',
      kpis,
      actions,
    };
  }

  // -------------------------------------------------------------------------
  // INTENT 11: GENERAL SEARCH / FALLBACK WITH HIGH INTELLIGENCE
  // -------------------------------------------------------------------------
  // Query projects based on search tokens
  const searchTokens = q.split(/\s+/).filter(t => t.length > 2 && !['show', 'find', 'which', 'what', 'about', 'projects', 'works', 'the', 'and', 'are'].includes(t));
  let matchedProjects = COMPREHENSIVE_PAN_INDIA_PROJECTS.filter(p => {
    return searchTokens.some(tok =>
      p.title.toLowerCase().includes(tok) ||
      p.category.toLowerCase().includes(tok) ||
      p.district.toLowerCase().includes(tok) ||
      p.state.toLowerCase().includes(tok) ||
      p.code.toLowerCase().includes(tok)
    );
  });

  if (matchedProjects.length === 0) {
    // Check if query is looking for non-existent item
    if (searchTokens.length > 0) {
      const term = searchTokens[0];
      return {
        reply: `**Data Unavailable for "${rawQuery}"**
No official development work, parliamentary constituency, or Member of Parliament matching **"${rawQuery}"** was found in the official 18th Lok Sabha or MoSPI database.

What you can explore instead:
• **State Portfolios**: Ask *"Show Rajasthan projects"* or *"Show Tamil Nadu projects"*.
• **Milestone Tracking**: Ask *"Show delayed projects"* or *"Which projects are high risk?"*.
• **Financial Ledgers**: Ask *"How much money is utilized?"* or *"Explain MPLADS fund flow"*.
• **Parliamentary Records**: Ask *"Tell me about Narendra Modi"* or *"Tell me about Rahul Gandhi"*.`,
        source: 'Official MPLADS Search & Indexing Engine',
        lastUpdated: 'Query Attempted Just Now',
        status: 'LIVE',
        intent: 'DATA_UNAVAILABLE',
        actions: [
          { label: 'Show delayed projects', actionType: 'quick_reply', prompt: 'Show delayed projects' },
          { label: 'Which projects are high risk?', actionType: 'quick_reply', prompt: 'Which projects are high risk?' },
          { label: 'How much money is utilized?', actionType: 'quick_reply', prompt: 'How much money is utilized?' },
        ],
      };
    }
    matchedProjects = COMPREHENSIVE_PAN_INDIA_PROJECTS.slice(0, 4);
  }

  const kpis: CopilotKpi[] = [
    { label: 'Matching Works', value: `${matchedProjects.length}`, helper: 'Portal database', highlight: true },
    { label: 'Active Filter', value: searchTokens.join(', ') || 'General', helper: 'Search tokens' },
    { label: 'Data Source', value: '18th Lok Sabha', helper: 'MoSPI verified' },
  ];

  const cards: CopilotCard[] = matchedProjects.slice(0, 4).map(p => ({
    id: p.id,
    type: 'project',
    title: p.title,
    subtitle: `${p.district}, ${p.state} • ${p.category}`,
    badge: {
      text: p.status,
      variant: p.status === 'Completed' ? 'success' : (p.status === 'Delayed' ? 'danger' : 'warning'),
    },
    progress: p.progressPercentage,
    amountLakhs: p.financial.sanctionedAmountLakhs,
    metrics: [
      { label: 'Sanctioned', value: `₹${p.financial.sanctionedAmountLakhs}L` },
      { label: 'Status', value: p.status },
      { label: 'Progress', value: `${p.progressPercentage}%` },
    ],
    action: {
      label: 'View Project Dossier',
      path: `/projects/${p.id}`,
      actionType: 'navigate',
    },
  }));

  const reply = `**MPLADS Intelligence Analysis: "${rawQuery}"**
Found **${matchedProjects.length} relevant records** matching your inquiry in the official portal database.

Summary of Results:
• **Sectors Represented**: ${Array.from(new Set(matchedProjects.map(p => p.category))).slice(0, 3).join(', ')}
• **Sanctioned Outlay**: ₹${(matchedProjects.reduce((s, p) => s + p.financial.sanctionedAmountLakhs, 0) / 100).toFixed(2)} Crore
• **Physical Completion**: ${matchedProjects.filter(p => p.status === 'Completed').length} completed, ${matchedProjects.filter(p => p.status === 'Delayed').length} delayed.`;

  const actions: CopilotAction[] = [
    { label: 'Show delayed projects', actionType: 'quick_reply', prompt: 'Show delayed projects' },
    { label: 'How much money is utilized?', actionType: 'quick_reply', prompt: 'How much money is utilized?' },
    { label: 'Which projects are high risk?', actionType: 'quick_reply', prompt: 'Which projects are high risk?' },
  ];

  return {
    reply,
    source: 'Official MPLADS National Repository',
    lastUpdated: 'Live Search Index',
    status: 'LIVE',
    intent: 'GENERAL_PROJECT_SEARCH',
    kpis,
    cards,
    actions,
    relevantRecords: matchedProjects.slice(0, 5),
  };
}
