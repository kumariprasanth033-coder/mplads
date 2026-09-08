/**
 * Safe Calculation & Formatting Utilities for MP & MPLADS Data
 * Prevents NaN%, empty '₹ Cr' values, and misleading numbers.
 */

import { MPRecord, MPProfile } from '../types';

/**
 * Calculates percentage safely.
 * Returns '—' if either numerator or denominator is invalid or missing, or denominator <= 0.
 */
export function safePercentage(
  numerator: number | undefined | null,
  denominator: number | undefined | null
): string {
  if (
    numerator === undefined ||
    numerator === null ||
    isNaN(numerator) ||
    denominator === undefined ||
    denominator === null ||
    isNaN(denominator) ||
    denominator <= 0
  ) {
    return '—';
  }

  const pct = Math.min(100, Math.max(0, Math.round((numerator / denominator) * 100)));
  return `${pct}%`;
}

/**
 * Returns numeric percentage safely, or null if unavailable.
 */
export function safePercentageNumber(
  numerator: number | undefined | null,
  denominator: number | undefined | null
): number | null {
  if (
    numerator === undefined ||
    numerator === null ||
    isNaN(numerator) ||
    denominator === undefined ||
    denominator === null ||
    isNaN(denominator) ||
    denominator <= 0
  ) {
    return null;
  }

  return Math.min(100, Math.max(0, Math.round((numerator / denominator) * 100)));
}

/**
 * Formats a Crores amount safely.
 * If data does not exist or is invalid: returns '—'.
 * Never returns bare '₹ Cr'.
 */
export function formatCrAmount(amountCr: number | undefined | null): string {
  if (
    amountCr === undefined ||
    amountCr === null ||
    isNaN(amountCr) ||
    typeof amountCr !== 'number'
  ) {
    return '—';
  }

  return `₹${amountCr.toFixed(1)} Cr`;
}

/**
 * Formats a works/projects count safely.
 * Returns '—' if undefined or null.
 */
export function formatWorksCount(count: number | undefined | null): string {
  if (count === undefined || count === null || isNaN(count)) {
    return '—';
  }
  return String(count);
}

/**
 * Normalizes any MP record (from server or mock) into a consistent MPProfile.
 */
export function normalizeMpProfile(raw: any): MPProfile {
  const stats = raw.stats || {};
  const fundUtil = raw.fundUtilization || {};

  // Resolve sanctioned amount in Cr
  let sanctionedCr: number | undefined = undefined;
  if (raw.sanctionedAmountCr !== undefined && !isNaN(raw.sanctionedAmountCr)) {
    sanctionedCr = Number(raw.sanctionedAmountCr);
  } else if (stats.sanctionedAmountLakhs !== undefined) {
    sanctionedCr = Number((stats.sanctionedAmountLakhs / 100).toFixed(2));
  } else if (fundUtil.sanctionedAmountLakhs !== undefined) {
    sanctionedCr = Number((fundUtil.sanctionedAmountLakhs / 100).toFixed(2));
  }

  // Resolve utilized amount in Cr
  let utilizedCr: number | undefined = undefined;
  if (raw.utilizedAmountCr !== undefined && !isNaN(raw.utilizedAmountCr)) {
    utilizedCr = Number(raw.utilizedAmountCr);
  } else if (stats.utilizedAmountLakhs !== undefined) {
    utilizedCr = Number((stats.utilizedAmountLakhs / 100).toFixed(2));
  } else if (fundUtil.utilizedAmountLakhs !== undefined) {
    utilizedCr = Number((fundUtil.utilizedAmountLakhs / 100).toFixed(2));
  }

  // Resolve works count
  let worksCount: number | undefined = undefined;
  if (raw.totalWorks !== undefined && !isNaN(raw.totalWorks)) {
    worksCount = Number(raw.totalWorks);
  } else if (stats.totalProjects !== undefined) {
    worksCount = Number(stats.totalProjects);
  } else if (fundUtil.recommendedWorksCount !== undefined) {
    worksCount = Number(fundUtil.recommendedWorksCount);
  }

  // Resolve percentage
  const utilizationPercentage = safePercentageNumber(utilizedCr, sanctionedCr);

  // Filter out any unsplash / fake image URLs
  const cleanPhoto = (url?: string) => {
    if (!url) return undefined;
    if (url.includes('unsplash.com') || url.includes('placeholder')) return undefined;
    return url;
  };

  const photoUrl = cleanPhoto(raw.photoUrl || raw.photo || raw.officialPhotoUrl);
  const officialPhotoUrl = cleanPhoto(raw.officialPhotoUrl || (raw.photoSource?.includes('Sansad') ? raw.photoUrl : undefined));
  const wikimediaUrl = cleanPhoto(raw.wikimediaUrl || (raw.photoSource?.includes('Wikimedia') ? raw.photoUrl : undefined));

  const hasFinancialData =
    raw.hasFinancialData !== false &&
    sanctionedCr !== undefined &&
    utilizedCr !== undefined;

  return {
    id: raw.id || `mp-${raw.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    source: raw.source || 'Official Digital Sansad',
    sourceMemberId: raw.id,
    name: raw.name || '',
    normalizedName: (raw.name || '').replace(/^(shri|smt|dr\.?|prof\.?)\s+/i, '').trim(),
    party: raw.party || 'Independent',
    house: raw.house === 'Rajya Sabha' ? 'Rajya Sabha' : 'Lok Sabha',
    constituency: raw.constituency || '',
    state: raw.state || '',
    district: raw.district || raw.city || raw.constituency || '',
    membershipStatus: raw.membershipStatus || 'Sitting',
    lokSabhaTerms: raw.lokSabhaTerms || raw.term || '18th Lok Sabha',
    officialProfileUrl: raw.officialProfileUrl || 'https://sansad.in/ls/members',

    photoUrl,
    officialPhotoUrl,
    wikimediaUrl,
    photoSource: raw.photoSource || (officialPhotoUrl ? 'Digital Sansad' : 'Initials Placeholder'),
    photoVerified: Boolean(raw.photoVerified || officialPhotoUrl || wikimediaUrl),
    photoConfidence: raw.photoVerified ? 0.95 : 0.8,

    wikidataId: raw.wikidataId || raw.wikidata?.id,
    wikipediaUrl: raw.wikipediaUrl || raw.wikidata?.wikipediaUrl,

    syncedAt: raw.lastUpdated || new Date().toISOString(),
    lastVerifiedAt: raw.lastUpdated || new Date().toISOString(),
    dataStatus: raw.dataSourceStatus || 'CACHED',

    worksCount,
    sanctionedCr,
    utilizedCr,
    utilizationPercentage: utilizationPercentage ?? undefined,
    hasFinancialData,
    isFinancialDemo: raw.isFinancialDemo !== false,

    email: raw.email || raw.contactEmail || 'mp.office@sansad.nic.in',
    phone: raw.phone || '+91-11-23034000',
    contactOffice: raw.contactOffice || `${raw.constituency || raw.state} Parliamentary Office`,
  };
}
