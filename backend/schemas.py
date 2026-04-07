from pydantic import BaseModel, EmailStr
from typing import Optional, Literal
from datetime import datetime

class User(BaseModel):
    firstName: str
    lastName: str
    phone: str
    email: EmailStr
    clerkId: str

class LoginUser(BaseModel):
    email: EmailStr
    clerkId: str

from typing import Literal, Optional
from pydantic import BaseModel, EmailStr

class ProviderCreate(BaseModel):
    name: str
    service_type: Literal["mechanic", "towing", "both"]  # ← add "both"
    phone: str
    email: EmailStr
    address: str
    latitude: float
    longitude: float
    experience_years: int = 0
    base_price: int = 0
    description: Optional[str] = None
    image: Optional[str] = None
    verified: bool = False
    availability: Literal["available", "busy"] = "available"
    clerk_id: Optional[str] = None

class ProviderResponse(BaseModel):
    id: int
    name: str
    service_type: str
    phone: str
    email: str
    address: str
    latitude: float
    longitude: float
    rating: float
    total_reviews: int
    experience_years: int
    base_price: int
    description: Optional[str]
    image: Optional[str]
    verified: bool
    availability: str
    is_active: bool
    created_at: datetime

class AvailabilityUpdate(BaseModel):
    availability: Literal["available", "busy"]


class BookingCreate(BaseModel):
    user_clerk_id: str
    provider_id: int
    user_lat: float
    user_lng: float
    distance_km: float
    duration_min: int
    base_price: int
    user_address: str

class PushTokenUpdate(BaseModel):
    clerk_id: str
    token: str


class BookingStatusUpdate(BaseModel):
    status: Literal["accepted", "rejected", "completed"]

class LocationUpdate(BaseModel):
    lat: float
    lng: float