import {
    UserDataFunctions,
    RayfinContext,
    AudienceType,
} from '@microsoft/fabric-user-data-functions';
import { purchasing, sendToPurchasing } from './purchasing-client.js';
import { acceptPurchaseOrder } from './purchasing-mock.js';
import { signedInManager } from './identity.js';
import type { AppSchema } from './data-schema.js';

const udf = new UserDataFunctions();

/**
 * Sends a reorder to purchasing and records it in Fabric.
 *
 * Reorders go through here rather than a direct client write, so that every
 * request reaches purchasing and lands in the semantic model as one traceable
 * row — with who asked for it, and when.
 */
udf.func(
    'sendReorder',
    async (ctx: RayfinContext<AppSchema>, storeId: string, sku: string, units: number) => {
        const manager = signedInManager(ctx);

        // 1. Ask Caldova's purchasing system for the units.
        const order = await sendToPurchasing(purchasing(ctx), {
            storeId,
            sku,
            units,
            requestedBy: manager.upn,
        });

        // 2. Record the request in Fabric, against the manager who sent it.
        const request = await ctx.getDataClient().RestockRequest.create({
            store_id: storeId,
            sku,
            qty: units,
            requested_by: manager.upn,
            requested_by_id: manager.id,
            requested_at: new Date(),
            status: 'submitted',
            note: `Raised from the regional dashboard against ${order.purchaseOrderId}.`,
        });

        return {
            requestId: request.id,
            purchaseOrderId: order.purchaseOrderId,
            expectedDelivery: order.expectedDelivery,
        };
    },
    // Binds the signed-in user's Fabric identity, so the recorded row carries
    // the UPN the semantic model's row-level security matches on.
    [udf.connection({ audienceType: AudienceType.Fabric })],
);

/**
 * Caldova's purchasing system, stood in for the demo.
 *
 * Hosting it here keeps the call above a real HTTP round trip with no
 * dependency on anything outside this workspace.
 */
udf.func(
    'purchaseOrders',
    async (store_id: string, sku: string, units: number, requested_by: string) =>
        acceptPurchaseOrder({ store_id, sku, units, requested_by }),
    [],
);
