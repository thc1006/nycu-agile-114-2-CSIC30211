// Orders API surface (AG-002–006) — typed against the generated OpenAPI contract.
// Used by the order-flow pages during the #12 migration off the legacy mock.

import { apiFetch, type Schemas } from './client'

export type CreateOrderRequest = Schemas['CreateOrderRequest']
export type OrderResponse = Schemas['OrderResponse']
export type OpenOrderResponse = Schemas['OpenOrderResponse']

const orderPath = (orderId: string) => `/orders/${encodeURIComponent(orderId)}`

/** Which side of an order to list in "my orders" (AG-010). */
export type MyOrdersRole = 'customer' | 'runner'

/** POST /orders — create an order (orderer). */
export function createOrder(input: CreateOrderRequest): Promise<OrderResponse> {
  return apiFetch<OrderResponse>('/orders', { method: 'POST', body: input, auth: true })
}

/** GET /orders/open — the runner feed. */
export function listOpenOrders(): Promise<OpenOrderResponse[]> {
  return apiFetch<OpenOrderResponse[]>('/orders/open', { auth: true })
}

/**
 * GET /orders/mine?role=customer|runner — the caller's own order history (AG-010).
 * `customer` = orders I posted; `runner` = orders I accepted. Newest first.
 */
export function listMyOrders(role: MyOrdersRole): Promise<OrderResponse[]> {
  return apiFetch<OrderResponse[]>(`/orders/mine?role=${role}`, { auth: true })
}

/** GET /orders/{id} — a single order (participant-only once accepted; see IDOR fix). */
export function getOrder(orderId: string): Promise<OrderResponse> {
  return apiFetch<OrderResponse>(orderPath(orderId), { auth: true })
}

/** Forward-only status transitions (AG-004–006). Each is a POST action endpoint. */
type OrderAction = 'accept' | 'start' | 'deliver' | 'confirm'
function act(orderId: string, action: OrderAction): Promise<OrderResponse> {
  return apiFetch<OrderResponse>(`${orderPath(orderId)}/${action}`, { method: 'POST', auth: true })
}

/** POST /orders/{id}/accept — runner claims an OPEN order. */
export const acceptOrder = (orderId: string): Promise<OrderResponse> => act(orderId, 'accept')
/** POST /orders/{id}/start — runner starts buying (ACCEPTED → BUYING). */
export const startOrder = (orderId: string): Promise<OrderResponse> => act(orderId, 'start')
/** POST /orders/{id}/deliver — runner marks delivered (BUYING → DELIVERED). */
export const deliverOrder = (orderId: string): Promise<OrderResponse> => act(orderId, 'deliver')
/** POST /orders/{id}/confirm — orderer confirms receipt (DELIVERED → COMPLETED). */
export const confirmOrder = (orderId: string): Promise<OrderResponse> => act(orderId, 'confirm')

/** POST /orders/{id}/cancel — orderer cancels an as-yet-unaccepted order (AG-008). */
export function cancelOrder(orderId: string): Promise<OrderResponse> {
  return apiFetch<OrderResponse>(`${orderPath(orderId)}/cancel`, { method: 'POST', auth: true })
}
