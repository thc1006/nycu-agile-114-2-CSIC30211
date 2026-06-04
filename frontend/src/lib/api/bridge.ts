import {
  acceptOrder,
  confirmOrder,
  createOrder,
  deliverOrder,
  getOrder,
  listMyOrders,
  listOpenOrders,
  startOrder,
  type CreateOrderRequest,
  type MyOrdersRole,
  type OpenOrderResponse,
  type OrderResponse,
} from './orders'

export interface CampusEatsApiBridge {
  createOrder(input: CreateOrderRequest): Promise<OrderResponse>
  listOpenOrders(): Promise<OpenOrderResponse[]>
  listMyOrders(role: MyOrdersRole): Promise<OrderResponse[]>
  getOrder(orderId: string): Promise<OrderResponse>
  acceptOrder(orderId: string): Promise<OrderResponse>
  startOrder(orderId: string): Promise<OrderResponse>
  deliverOrder(orderId: string): Promise<OrderResponse>
  confirmOrder(orderId: string): Promise<OrderResponse>
}

declare global {
  interface Window {
    CampusEatsApi?: CampusEatsApiBridge
  }
}

/**
 * Bridge used by the legacy inline page scripts while the app is being migrated
 * to React. This keeps those pages on the same typed API client as the React
 * pages instead of duplicating fetch/token/CORS logic inside string scripts.
 */
export function installCampusEatsApiBridge(): void {
  window.CampusEatsApi = {
    createOrder,
    listMyOrders,
  listOpenOrders,
    getOrder,
    acceptOrder,
    startOrder,
    deliverOrder,
    confirmOrder,
  }
}
