import { entity, role, uuid, text, int, date, set } from '@microsoft/rayfin-core';

/**
 * A reorder a regional manager sent to purchasing.
 *
 * Caldova's semantic model reads this table, so a request a manager sends here
 * shows up in the app, the regional dashboard and analytics as one number.
 * `requested_by` and `requested_at` are what make a request traceable.
 */
@entity()
@role('authenticated', ['create', 'read'], {
  policy: (claims, item) => claims.sub.eq(item.requested_by_id),
})
export class RestockRequest {
  @uuid() id!: string;
  @text({ max: 32 }) store_id!: string;
  @text({ max: 32 }) sku!: string;
  @int() qty!: number;

  /** Who asked for the restock, as the signed-in user. */
  @text({ max: 200 }) requested_by!: string;

  /** The requester's directory object id, so the request traces to an identity. */
  @text({ max: 64 }) requested_by_id!: string;

  /** When the request was made, in UTC. */
  @date() requested_at!: Date;

  @set('submitted', 'fulfilled') status!: 'submitted' | 'fulfilled';

  @text({ max: 400, optional: true }) note?: string;
}
