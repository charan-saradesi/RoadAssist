from pydantic import BaseModel, EmailStr
from typing import Optional, Literal
from datetime import datetime

class User(BaseModel):
    name: str
    email: EmailStr
    clerkId: str

class LoginUser(BaseModel):
    email: EmailStr
    clerkId: str

class ProviderCreate(BaseModel):
    name: str
    service_type: Literal["mechanic", "towing"]
    phone: str
    email: EmailStr
    address: str
    latitude: float
    longitude: float
    rating: float = 0.0
    total_reviews: int = 0
    experience_years: int = 0
    base_price: int = 0
    description: Optional[str] = None
    image: Optional[str] = None
    verified: bool = False
    availability: Literal["available", "busy"] = "available"

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