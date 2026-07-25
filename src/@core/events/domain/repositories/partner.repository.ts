import { PartnerId } from '../entities/partner-id';
import { Partner } from '../entities/partner';

export interface PartnerRepository {
  save(partner: Partner): Promise<void>;
  findById(id: PartnerId): Promise<Partner | null>;
  findAll(): Promise<Partner[]>;
  delete(id: PartnerId): Promise<void>;
}
