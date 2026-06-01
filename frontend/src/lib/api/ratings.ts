// Ratings API surface (AG-007) — typed against the generated OpenAPI contract.

import { apiFetch, type Schemas } from './client'

export type RateOrderRequest = Schemas['RateOrderRequest']
export type RatingResponse = Schemas['RatingResponse']
export type UserRatingResponse = Schemas['UserRatingResponse']

/** POST /orders/{id}/ratings — submit a one-time 1–5 star rating for a completed order. */
export function rateOrder(orderId: string, input: RateOrderRequest): Promise<RatingResponse> {
  return apiFetch<RatingResponse>(`/orders/${encodeURIComponent(orderId)}/ratings`, {
    method: 'POST',
    body: input,
    auth: true,
  })
}

/** GET /users/{id}/rating — aggregate rating (average + count) for a user. */
export function getUserRating(userId: string): Promise<UserRatingResponse> {
  return apiFetch<UserRatingResponse>(`/users/${encodeURIComponent(userId)}/rating`, { auth: true })
}
