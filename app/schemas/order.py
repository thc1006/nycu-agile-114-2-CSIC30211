from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class OrderStatus(str, Enum):
    OPEN = "OPEN"
    ACCEPTED = "ACCEPTED"
    BUYING = "BUYING"
    DELIVERED = "DELIVERED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class CreateOrderRequest(BaseModel):
    restaurant: str = Field(..., min_length=1, max_length=100)
    meal: str = Field(..., min_length=1, max_length=500)
    pickup_location: str = Field(..., min_length=1, max_length=100)
    expected_time: datetime
    delivery_fee: int = Field(..., ge=0)


class OrderResponse(BaseModel):
    id: str
    customer_id: str
    runner_id: str | None = None

    restaurant: str
    meal: str
    pickup_location: str
    expected_time: datetime
    delivery_fee: int

    status: OrderStatus

    created_at: datetime
    updated_at: datetime


class OpenOrderResponse(BaseModel):
    id: str
    restaurant: str
    meal_summary: str
    pickup_location: str
    expected_time: datetime
    delivery_fee: int
    status: OrderStatus


class RateOrderRequest(BaseModel):
    stars: int = Field(..., ge=1, le=5)


class RatingResponse(BaseModel):
    order_id: str
    rater_id: str
    ratee_id: str
    stars: int
    created_at: datetime


class UserRatingResponse(BaseModel):
    user_id: str
    average: float
    count: int