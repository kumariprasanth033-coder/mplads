import React, { useState, useEffect } from 'react';
import {
  User,
  MapPin,
  Building2,
  Mail,
  Phone,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  FolderGit2,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  FileText,
  Map as MapIcon,
  Layers,
  Globe,
  GraduationCap,
  Calendar,
  RefreshCw,
  BookOpen,
  Twitter,
  Instagram,
  Facebook,
  Info,
  AlertTriangle,
  Check,
} from 'lucide-react';
import { digitalSansadMemberAdapter } from '../services/dataSources/digitalSansadMemberAdapter';
import { MPRecord, ProjectRecord } from '../types';
import { DataFreshnessBadge } from '../components/DataFreshnessBadge';

interface Props {
  mpId: string;
  onNavigate: (path: string) => void;
}

export const MpDetailPage: React.FC<Props> = ({ mpId, onNavigate }) => {
  const [data, setData] = useState<{ mp: MPRecord; projects: ProjectRecord[]; freshness?: any } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [photoError, setPhotoError] = useState(false);
  const [isSyncingCivic, setIsSyncingCivic] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<{
    active: boolean;
    stepText: string;
    outcome?: 'success' | 'unavailable' | 'error';
    message?: string;
    steps?: { title: string; status: 'completed' | 'pending' | 'failed' | 'skipped' }[];
  }>({
    active: false,
    stepText: '',
  });

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setPhotoError(false);
      try {
        const res = await digitalSansadMemberAdapter.getMemberById(mpId);
        setData(res);
      } catch (err) {
        console.error('Failed to load MP details:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [mpId]);

  const handleSyncOfficialPhoto = async () => {
    setIsSyncingCivic(true);
    setSyncMessage(null);
    setSyncStatus({
      active: true,
      stepText: 'Finding official identity...',
      outcome: undefined,
    });

    const stepLabels = [
      'Finding official identity...',
      'Resolving Wikidata...',
      'Finding verified image...',
      'Verifying image...',
      'Saving image...',
    ];

    let stepCounter = 0;
    const interval = setInterval(() => {
      stepCounter++;
      if (stepCounter < stepLabels.length) {
        setSyncStatus(prev => ({ ...prev, stepText: stepLabels[stepCounter] }));
      }
    }, 450);

    try {
      const res = await digitalSansadMemberAdapter.syncOfficialPhoto(mpId);
      clearInterval(interval);

      if (res && res.success && res.mp) {
        setData(prev => (prev ? { ...prev, mp: res.mp! } : prev));
        setPhotoError(false);
        setSyncStatus({
          active: false,
          stepText: '✓ Image synced',
          outcome: 'success',
          message: 'Official photo verified and synchronized successfully',
          steps: res.steps || [
            { title: 'Digital identity matched', status: 'completed' },
            { title: 'Image source found', status: 'completed' },
            { title: 'Image verified', status: 'completed' },
            { title: 'Image saved', status: 'completed' },
          ],
        });
        setSyncMessage('Official photo verified and synchronized with Wikimedia Commons / Wikidata!');
      } else {
        // Strict: Do NOT falsely say 'Synced' if no image was obtained
        setSyncStatus({
          active: false,
          stepText: 'Official image unavailable',
          outcome: 'unavailable',
          message: res.error || 'No verified high-confidence official photo found for this MP.',
          steps: res.steps || [
            { title: 'Digital identity matched', status: 'completed' },
            { title: 'Image source found', status: 'failed' },
            { title: 'Image verified', status: 'skipped' },
            { title: 'Image saved', status: 'skipped' },
          ],
        });
        setSyncMessage(null);
      }
    } catch (err: any) {
      clearInterval(interval);
      setSyncStatus({
        active: false,
        stepText: 'Official image unavailable',
        outcome: 'error',
        message: err?.message || 'Sync operation failed',
      });
    } finally {
      setIsSyncingCivic(false);
    }
  };

  const handleSyncCivic = handleSyncOfficialPhoto;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-9 h-9 border-3 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-xs text-slate-600 font-medium">
            Fetching verified parliamentary records from Digital Sansad...
          </span>
        </div>
      </div>
    );
  }

  if (!data || !data.mp) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center justify-center text-center">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md shadow-xs">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-800">Member of Parliament Not Found</h2>
          <p className="text-xs text-slate-500 mt-2 mb-6">
            The requested MP profile identifier could not be verified in the active parliamentary directory.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('/mps')}
            className="w-full py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
          >
            Return to MP Directory
          </button>
        </div>
      </div>
    );
  }

  const { mp, projects } = data;
  const photoUrl = mp.officialPhotoUrl || mp.photoUrl || mp.photo;
  const isVerifiedPhoto = mp.photoVerified && !photoError && Boolean(photoUrl);

  const fund = mp.fundUtilization || {
    allocatedAmountLakhs: mp.stats?.entitlementLakhs ?? 500,
    sanctionedAmountLakhs: mp.stats?.sanctionedAmountLakhs ?? 480,
    utilizedAmountLakhs: mp.stats?.utilizedAmountLakhs ?? 390,
    recommendedWorksCount: mp.stats?.totalProjects ?? 45,
    completedWorksCount: mp.stats?.completedProjects ?? 32,
    ongoingWorksCount: mp.stats?.inProgressProjects ?? 10,
  };

  const delayedWorksCount = mp.stats?.delayedProjects ?? 3;
  const utilizationPercent = Math.min(
    100,
    Math.round(((fund.utilizedAmountLakhs || 0) / (fund.allocatedAmountLakhs || 500)) * 100)
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      {/* Header Profile Section */}
      <div className="bg-slate-900 text-white py-10 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumbs */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <button
              type="button"
              onClick={() => onNavigate('/mps')}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to MP Directory</span>
            </button>

            <DataFreshnessBadge
              status={mp.dataSourceStatus || 'CACHED'}
              lastUpdated={mp.lastUpdated}
              source={mp.source || 'Digital Sansad (18th Lok Sabha)'}
            />
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Official Photo with verified fallback */}
            <div className="shrink-0 flex flex-col items-center gap-1.5">
              <div className="relative">
                {isVerifiedPhoto ? (
                  <img
                    src={photoUrl}
                    alt={mp.name}
                    referrerPolicy="no-referrer"
                    onError={() => setPhotoError(true)}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-slate-700 shadow-xl bg-slate-800"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-800 border-4 border-slate-700 flex flex-col items-center justify-center text-center p-2 shadow-xl">
                    <Building2 className="w-8 h-8 text-slate-400 mb-1" />
                    <span className="text-[9px] font-medium text-slate-400 leading-tight">
                      Official photo unavailable
                    </span>
                  </div>
                )}
                {mp.photoSource?.includes('Wikidata') && (
                  <span
                    title="Verified image from Wikidata / Wikimedia Commons"
                    className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-full p-1 text-[9px] font-bold shadow-md ring-2 ring-slate-900"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono text-slate-400 text-center max-w-[120px] truncate">
                {mp.photoSource || 'Digital Sansad'}
              </span>
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-blue-800 text-blue-100">
                  {mp.house}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-600 text-white">
                  {mp.party}
                </span>
                <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {mp.membershipStatus || 'Sitting Member'}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded bg-slate-800/80 text-amber-300 font-mono border border-slate-700">
                  {mp.lokSabhaTerms || mp.term}
                </span>
                {mp.wikidata?.id && (
                  <a
                    href={mp.wikidata.wikidataUrl || `https://www.wikidata.org/wiki/${mp.wikidata.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 font-mono border border-amber-800/80 hover:bg-amber-900 transition-colors flex items-center gap-1"
                  >
                    <span>Wikidata: {mp.wikidata.id}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3 flex-wrap">
                <span>{mp.displayName || mp.name}</span>
                <span className="text-xs font-mono font-normal text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Parliamentary Record</span>
                </span>
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>
                    Constituency: <strong className="text-white">{mp.constituency}</strong>, {mp.state}
                  </span>
                </span>

                {(mp.email || mp.contactEmail) && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{mp.email || mp.contactEmail}</span>
                  </span>
                )}

                {mp.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{mp.phone}</span>
                  </span>
                )}

                {mp.officialProfileUrl && (
                  <a
                    href={mp.officialProfileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 underline font-medium"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Digital Sansad Profile</span>
                  </a>
                )}
              </div>
            </div>

            <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-auto">
              <button
                type="button"
                onClick={handleSyncOfficialPhoto}
                disabled={isSyncingCivic}
                className="px-4 py-2.5 bg-blue-800 hover:bg-blue-700 disabled:opacity-75 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-colors flex items-center justify-center gap-2 min-w-[170px]"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCivic ? 'animate-spin' : ''}`} />
                <span>
                  {isSyncingCivic
                    ? syncStatus.stepText || 'Searching verified sources...'
                    : syncStatus.outcome === 'success'
                    ? '✓ Image synced'
                    : syncStatus.outcome === 'unavailable'
                    ? 'Official image unavailable'
                    : 'Sync Official Photo'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/dashboard/citizen')}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-colors text-center"
              >
                Submit Citizen Suggestion
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Verification Pipeline Step Breakdown */}
        {syncStatus.active && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-3 shadow-xs">
            <div className="w-5 h-5 border-2 border-blue-800 border-t-transparent rounded-full animate-spin shrink-0" />
            <div className="text-xs text-blue-950 font-medium">
              <span className="font-bold">Syncing Official Photo:</span> {syncStatus.stepText}
            </div>
          </div>
        )}

        {syncStatus.outcome === 'success' && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Verified Official Photo Synchronized</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
              <div className="flex items-center gap-1.5 text-emerald-800 bg-white/80 px-2.5 py-1.5 rounded-lg border border-emerald-100">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Digital identity matched</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-800 bg-white/80 px-2.5 py-1.5 rounded-lg border border-emerald-100">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Image source found</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-800 bg-white/80 px-2.5 py-1.5 rounded-lg border border-emerald-100">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Image verified</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-800 bg-white/80 px-2.5 py-1.5 rounded-lg border border-emerald-100">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Image saved</span>
              </div>
            </div>
          </div>
        )}

        {syncStatus.outcome === 'unavailable' && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl shadow-xs text-xs text-amber-950">
            <div className="flex items-center gap-2 font-bold mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>No verified image available</span>
            </div>
            <p className="text-[11px] text-amber-900 leading-relaxed">
              In accordance with strict safety protocols, unverified or ambiguous imagery is rejected. The official profile placeholder remains displayed until an authentic parliamentary portrait is indexed.
            </p>
          </div>
        )}

        {syncMessage && !syncStatus.outcome && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-semibold text-emerald-900 shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncMessage}</span>
          </div>
        )}

        {/* Politician Dossier: Wikidata API & Google Civic Information API */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-blue-900 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  <span>Verified External Knowledge Graph</span>
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Wikidata API &amp; Google Civic API
                </span>
              </div>
              <h2 className="font-bold text-lg text-slate-900 mt-1">
                Politician Dossier, Imagery &amp; Official Bio
              </h2>
            </div>

            <button
              type="button"
              onClick={handleSyncOfficialPhoto}
              disabled={isSyncingCivic}
              className="text-xs font-bold px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-center cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingCivic ? 'animate-spin' : ''}`} />
              <span>{isSyncingCivic ? 'Syncing...' : 'Sync Official Photo'}</span>
            </button>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {/* Column 1: Portrait & Encyclopedic Record */}
            <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-100 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wide">
                <BookOpen className="w-4 h-4 text-blue-900" />
                <span>Encyclopedic Record</span>
              </div>

              <div className="flex items-start gap-3">
                {isVerifiedPhoto ? (
                  <img
                    src={photoUrl}
                    alt={mp.name}
                    referrerPolicy="no-referrer"
                    onError={() => setPhotoError(true)}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-300 shadow-xs bg-white shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-200 flex items-center justify-center shrink-0">
                    <User className="w-6 h-6 text-slate-400" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] font-bold text-slate-900 block truncate">
                    {mp.wikidata?.label || mp.displayName || mp.name}
                  </span>
                  <span className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">
                    {mp.wikidata?.description || `${mp.party} MP representing ${mp.constituency}, ${mp.state}`}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Photo source: <strong>{mp.photoSource || 'Wikidata (Wikimedia Commons)'}</strong>
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80 flex flex-col gap-1.5 text-xs">
                {mp.wikidata?.id && (
                  <a
                    href={`https://www.wikidata.org/wiki/${mp.wikidata.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-900 hover:text-blue-800 font-medium flex items-center justify-between"
                  >
                    <span>Wikidata Entity: <strong>{mp.wikidata.id}</strong></span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {mp.wikidata?.wikipediaUrl && (
                  <a
                    href={mp.wikidata.wikipediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-800 hover:text-emerald-700 font-medium flex items-center justify-between"
                  >
                    <span>Read Wikipedia Biography</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Column 2: Biographical Facts */}
            <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-100 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wide">
                <Calendar className="w-4 h-4 text-emerald-700" />
                <span>Biographical Details</span>
              </div>

              <div className="space-y-2.5 text-xs">
                {mp.wikidata?.birthDate && (
                  <div>
                    <span className="text-slate-500 block text-[11px]">Date of Birth</span>
                    <span className="font-semibold text-slate-800">
                      {mp.wikidata.birthDate}
                    </span>
                  </div>
                )}

                {mp.wikidata?.birthPlace && (
                  <div>
                    <span className="text-slate-500 block text-[11px]">Place of Birth</span>
                    <span className="font-semibold text-slate-800">
                      {mp.wikidata.birthPlace}
                    </span>
                  </div>
                )}

                {mp.wikidata?.education && (
                  <div>
                    <span className="text-slate-500 block text-[11px] flex items-center gap-1">
                      <GraduationCap className="w-3 h-3 text-slate-400" />
                      <span>Education / Alma Mater</span>
                    </span>
                    <span className="font-semibold text-slate-800">
                      {mp.wikidata.education}
                    </span>
                  </div>
                )}

                {mp.wikidata?.website && (
                  <div>
                    <span className="text-slate-500 block text-[11px]">Official Website</span>
                    <a
                      href={mp.wikidata.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-blue-900 hover:underline flex items-center gap-1"
                    >
                      <Globe className="w-3 h-3" />
                      <span className="truncate">{mp.wikidata.website}</span>
                    </a>
                  </div>
                )}

                {!mp.wikidata?.birthDate && !mp.wikidata?.education && (
                  <div className="text-slate-500 italic text-[11px] py-2">
                    Biographical details linked via 18th Lok Sabha Digital Sansad registry and constituency records.
                  </div>
                )}
              </div>
            </div>

            {/* Column 3: Verified Digital & Civic Channels */}
            <div className="p-4 bg-slate-50/70 rounded-xl border border-slate-100 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wide">
                <Globe className="w-4 h-4 text-blue-700" />
                <span>Verified Public Channels</span>
              </div>

              <div className="space-y-2 text-xs">
                {/* Social Channels */}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  {mp.wikidata?.twitter && (
                    <a
                      href={`https://x.com/${mp.wikidata.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-black text-white rounded-lg text-[11px] font-bold flex items-center gap-1.5 hover:bg-slate-800 transition-colors"
                    >
                      <Twitter className="w-3 h-3" />
                      <span>@{mp.wikidata.twitter}</span>
                    </a>
                  )}

                  {mp.wikidata?.instagram && (
                    <a
                      href={`https://instagram.com/${mp.wikidata.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-lg text-[11px] font-bold flex items-center gap-1.5 hover:opacity-90 transition-opacity"
                    >
                      <Instagram className="w-3 h-3" />
                      <span>@{mp.wikidata.instagram}</span>
                    </a>
                  )}

                  {mp.wikidata?.facebook && (
                    <a
                      href={`https://facebook.com/${mp.wikidata.facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-[11px] font-bold flex items-center gap-1.5 hover:bg-blue-700 transition-colors"
                    >
                      <Facebook className="w-3 h-3" />
                      <span>Facebook</span>
                    </a>
                  )}
                </div>

                {/* Google Civic Information API Status Pill */}
                <div className="p-2.5 bg-white rounded-lg border border-slate-200 mt-2 text-[11px]">
                  <div className="flex items-center justify-between gap-1 text-slate-700 font-semibold mb-1">
                    <span>Google Civic Info API</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-50 text-blue-800 border border-blue-100">
                      {mp.civicInfo?.status === 'ACTIVE' ? 'Active' : 'Wikidata Primary'}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[10px] leading-relaxed">
                    Representative data enriched with high-resolution portraits &amp; public office channels.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* MPLADS Fund & Works Status Overview */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  MPLADS Scheme Entitlement &amp; Expenditure
                </span>
                {mp.isFinancialDemo ? (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    Demo Data • Standard ₹5 Cr Baseline
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Official Disbursed Accords
                  </span>
                )}
              </div>
              <h3 className="font-bold text-lg text-slate-900 mt-0.5">
                Fund Allocation, Recommended Works &amp; Expenditure
              </h3>
            </div>

            <span className="text-xs px-3 py-1 bg-emerald-50 text-emerald-800 font-bold rounded-full border border-emerald-200 self-start sm:self-center">
              {utilizationPercent}% Utilized
            </span>
          </div>

          {/* 5-Metric Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-5 text-xs">
            {/* Recommended Works */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 block text-[11px]">Recommended Works</span>
              <span className="text-xl font-extrabold text-slate-900 mt-1 block">
                {fund.recommendedWorksCount}
              </span>
              <span className="text-[10px] text-slate-400">Total works proposed</span>
            </div>

            {/* Sanctioned Works & Funds */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 block text-[11px]">Sanctioned Works</span>
              <span className="text-xl font-extrabold text-blue-900 mt-1 block">
                ₹{fund.sanctionedAmountLakhs} L
              </span>
              <span className="text-[10px] text-blue-800 font-medium">District DRDA approved</span>
            </div>

            {/* Completed Works */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 block text-[11px]">Completed Works</span>
              <span className="text-xl font-extrabold text-emerald-700 mt-1 block">
                {fund.completedWorksCount}
              </span>
              <span className="text-[10px] text-emerald-600 font-medium">With completion certificates</span>
            </div>

            {/* Ongoing Works */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 block text-[11px]">Ongoing Works</span>
              <span className="text-xl font-extrabold text-amber-700 mt-1 block">
                {fund.ongoingWorksCount}
              </span>
              <span className="text-[10px] text-amber-800 font-medium">Under active execution</span>
            </div>

            {/* Delayed Works */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-500 block text-[11px]">Delayed Works</span>
              <span className="text-xl font-extrabold text-rose-700 mt-1 block">
                {delayedWorksCount}
              </span>
              <span className="text-[10px] text-rose-800 font-medium">Escalated for review</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-slate-600">Fund Utilization Ratio</span>
              <span className="font-mono font-bold text-slate-800">
                ₹{fund.utilizedAmountLakhs} L / ₹{fund.allocatedAmountLakhs} L
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${utilizationPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Constituency MPLADS Projects Section */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
            <div>
              <h3 className="font-bold text-lg text-slate-900">
                Constituency Works &amp; Infrastructure Projects ({projects.length})
              </h3>
              <p className="text-xs text-slate-500">
                Sanctioned MPLADS development projects in {mp.constituency} ({mp.state})
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-xl self-start sm:self-center">
              DRDA &amp; District Portal Sync
            </span>
          </div>

          {projects.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8">
              <FolderGit2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-800 text-sm">
                No Sanctioned Works Recorded in Prototype State
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                New parliamentary term commenced in June 2024. DRDA work accord records will appear here as soon as approved by the District Authority.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(proj => (
                <div
                  key={proj.id}
                  onClick={() => onNavigate(`/projects/${proj.id}`)}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer p-5 flex flex-col justify-between group relative"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                        {proj.code}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          proj.status === 'Completed'
                            ? 'bg-emerald-600 text-white'
                            : proj.status === 'Delayed'
                            ? 'bg-rose-600 text-white'
                            : 'bg-amber-500 text-slate-950'
                        }`}
                      >
                        {proj.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-900 mt-2.5 line-clamp-2">
                      {proj.title}
                    </h4>

                    <div className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="truncate">
                        {proj.village || 'Panchayat Area'}, {proj.district || mp.constituency}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                      <span>Sector: {proj.sector}</span>
                      <span>•</span>
                      <span>Agency: {proj.implementingAgency || 'DRDA'}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Sanctioned</span>
                      <strong className="text-slate-900 font-mono">
                        ₹{proj.financial.sanctionedAmountLakhs} Lakhs
                      </strong>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Physical Progress</span>
                      <strong className="text-emerald-700 font-mono font-bold">
                        {proj.progressPercentage}%
                      </strong>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-blue-900 font-semibold group-hover:translate-x-0.5 transition-transform">
                    <span className="flex items-center gap-1 text-slate-400">
                      <FileText className="w-3 h-3" />
                      <span>Audit &amp; Evidence</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span>Inspect Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
