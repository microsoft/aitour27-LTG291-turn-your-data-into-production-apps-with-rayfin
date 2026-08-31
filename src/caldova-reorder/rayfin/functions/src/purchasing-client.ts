/**
 * Client for Caldova's purchasing system.
 *
 * The endpoint is mocked for the demo, but nothing else here is: this is the
 * request shape purchasing publishes, with a timeout and errors that say what
 * actually went wrong.
 */

/** A reorder as purchasing expects to receive it. */
export interface PurchaseOrderRequest {
  storeId: string;
  sku: string;
  units: number;
  requestedBy: string;
}

/** Purchasing's acknowledgement of a reorder. */
export interface PurchaseOrder {
  purchaseOrderId: string;
  expectedDelivery: string;
}

export class PurchasingError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'PurchasingError';
  }
}

const REQUEST_TIMEOUT_MS = 10_000;

export async function sendToPurchasing(
  endpoint: string,
  apiKey: string,
  order: PurchaseOrderRequest,
): Promise<PurchaseOrder> {
  let response: Response;

  try {
    response = await fetch(`${endpoint}/purchase-orders`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        store_id: order.storeId,
        sku: order.sku,
        units: order.units,
        requested_by: order.requestedBy,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new PurchasingError(`Could not reach the purchasing system at ${endpoint}.`);
  }

  if (!response.ok) {
    throw new PurchasingError(
      `Purchasing rejected the order: ${response.status} ${response.statusText}.`,
      response.status,
    );
  }

  const acknowledgement = (await response.json()) as Partial<PurchaseOrder>;

  if (!acknowledgement.purchaseOrderId) {
    throw new PurchasingError('Purchasing accepted the order but returned no order id.');
  }

  return {
    purchaseOrderId: acknowledgement.purchaseOrderId,
    expectedDelivery: acknowledgement.expectedDelivery ?? 'unconfirmed',
  };
}
