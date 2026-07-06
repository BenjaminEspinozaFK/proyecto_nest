import {
  PushSubscriptionRecord,
  CreatePushSubscriptionInput,
} from './push.types';

export interface PushRepositoryPort {
  upsertSubscription(
    data: CreatePushSubscriptionInput,
  ): Promise<PushSubscriptionRecord>;
  deleteByEndpoint(endpoint: string): Promise<void>;
  findByOwner(
    ownerId: string,
    role: string,
  ): Promise<PushSubscriptionRecord[]>;
  findAllAdminSubscriptions(): Promise<PushSubscriptionRecord[]>;
}
