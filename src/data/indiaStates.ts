/**
 * Complete Official List of Indian States and Union Territories
 * As per the Ministry of Home Affairs, Government of India
 * Total: 28 States and 8 Union Territories (36 Jurisdictions)
 */

export const ALL_INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
] as const;

export const ALL_UNION_TERRITORIES = [
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
] as const;

export type IndianState = (typeof ALL_INDIAN_STATES)[number];
export type IndianUnionTerritory = (typeof ALL_UNION_TERRITORIES)[number];
export type IndianJurisdiction = IndianState | IndianUnionTerritory;

// Unified combined list (All States first, followed by Union Territories, alphabetically structured)
export const ALL_INDIA_JURISDICTIONS: {
  name: string;
  type: 'State' | 'Union Territory';
}[] = [
  ...ALL_INDIAN_STATES.map(s => ({ name: s, type: 'State' as const })),
  ...ALL_UNION_TERRITORIES.map(ut => ({ name: ut, type: 'Union Territory' as const })),
];

// Helper to check if jurisdiction exists
export function isValidJurisdiction(name: string): boolean {
  return ALL_INDIA_JURISDICTIONS.some(
    j => j.name.toLowerCase() === name.toLowerCase().trim()
  );
}
