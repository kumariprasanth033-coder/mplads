import { MPRecord } from '../../types';
import { digitalSansadMemberAdapter, MemberSearchFilters } from './digitalSansadMemberAdapter';

export type MPSearchFilters = MemberSearchFilters;

/**
 * MP Data Adapter
 * Delegates to the Digital Sansad Member Adapter for verified 18th Lok Sabha data
 */
export const mpDataAdapter = {
  async searchMP(query: string = '', filters: MPSearchFilters = {}): Promise<MPRecord[]> {
    const res = await digitalSansadMemberAdapter.searchMembers(query, filters);
    return res.mps;
  },

  async getMPByName(name: string): Promise<MPRecord | null> {
    return digitalSansadMemberAdapter.getMemberByName(name);
  },

  async getMPByConstituency(constituency: string): Promise<MPRecord | null> {
    return digitalSansadMemberAdapter.getMemberByConstituency(constituency);
  },

  async getMPByState(state: string): Promise<MPRecord[]> {
    return digitalSansadMemberAdapter.getMembersByState(state);
  },

  async getMPDetails(id: string): Promise<{ mp: MPRecord; projects: any[] } | null> {
    return digitalSansadMemberAdapter.getMemberById(id);
  },

  getMemberPhoto(member: MPRecord) {
    return digitalSansadMemberAdapter.getMemberPhoto(member);
  },

  async refreshData() {
    return digitalSansadMemberAdapter.refreshMemberData();
  },

  async getFreshness() {
    return digitalSansadMemberAdapter.getDataFreshness();
  },
};
