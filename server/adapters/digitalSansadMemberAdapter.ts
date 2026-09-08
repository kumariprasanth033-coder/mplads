import { MPRecord } from '../../src/types.js';
import { digitalSansadMemberAdapter as baseAdapter, DigitalSansadMemberRecord } from '../digitalSansadAdapter.js';

/**
 * Digital Sansad Member Data Adapter
 * Primary official parliamentary source: https://sansad.in/ls/members
 * 18th Lok Sabha sitting members directory
 */
export class DigitalSansadMemberAdapterService {
  public getAllMembers(): DigitalSansadMemberRecord[] {
    return baseAdapter.getAllMembers();
  }

  public searchMembers(
    query?: string,
    filters?: {
      state?: string;
      party?: string;
      house?: string;
      status?: string;
      constituency?: string;
      district?: string;
      city?: string;
    }
  ): DigitalSansadMemberRecord[] {
    return baseAdapter.searchMembers(query, filters);
  }

  public getMembersByState(state: string): DigitalSansadMemberRecord[] {
    return baseAdapter.getMembersByState(state);
  }

  public getMemberByName(name: string): DigitalSansadMemberRecord | null {
    return baseAdapter.getMemberByName(name);
  }

  public getMemberByConstituency(constituency: string): DigitalSansadMemberRecord | null {
    return baseAdapter.getMemberByConstituency(constituency);
  }

  public getMemberById(id: string): DigitalSansadMemberRecord | null {
    return baseAdapter.getMemberById(id);
  }

  public getMemberPhoto(member: DigitalSansadMemberRecord): {
    photoUrl: string;
    isVerified: boolean;
    photoSource: string;
  } {
    return baseAdapter.getMemberPhoto(member);
  }

  public async refreshMemberData() {
    return baseAdapter.refreshMemberData();
  }

  public getFreshnessTelemetry() {
    return baseAdapter.getFreshnessTelemetry();
  }
}

export const digitalSansadMemberAdapter = new DigitalSansadMemberAdapterService();
export type { DigitalSansadMemberRecord };
