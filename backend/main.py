from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
from schemas import User, LoginUser, ProviderCreate, ProviderResponse, AvailabilityUpdate, BookingCreate, PushTokenUpdate, BookingStatusUpdate, LocationUpdate
from models import (
    fetch_providers, fetch_provider_by_id, create_provider,
    update_availability, create_user, login_user,
    fetch_provider_by_clerk_id, create_booking,
    save_user_push_token, save_provider_push_token,
    get_bookings_for_user, get_bookings_for_provider, update_booking_status,
    update_provider_location, get_booking_location,
)

app = FastAPI(title="RoadAssist API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "RoadAssist API running"}

# ── Users ──────────────────────────────────────────
@app.post("/user")
def register(user: User):
    return create_user(user.firstName, user.lastName, user.phone, user.email, user.clerkId)

@app.post("/login")
def login(user: LoginUser):
    return login_user(user.email, user.clerkId)

# ── Providers ──────────────────────────────────────
@app.get("/providers", response_model=List[ProviderResponse])
def get_providers(
    service_type: Optional[str] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    radius_km: float = 20.0,
):
    return fetch_providers(
        service_type=service_type,
        user_lat=lat,
        user_lng=lng,
        radius_km=radius_km,
    )

@app.get("/providers/by-clerk/{clerk_id}")
def get_provider_by_clerk(clerk_id: str):
    return fetch_provider_by_clerk_id(clerk_id)

@app.get("/providers/{provider_id}", response_model=ProviderResponse)
def get_provider(provider_id: int):
    return fetch_provider_by_id(provider_id)

@app.post("/providers", response_model=ProviderResponse)
def add_provider(data: ProviderCreate):
    return create_provider(data)

@app.patch("/providers/{provider_id}/availability", response_model=ProviderResponse)
def set_availability(provider_id: int, body: AvailabilityUpdate):
    return update_availability(provider_id, body.availability)

@app.patch("/users/push-token")
def update_user_push_token(body: PushTokenUpdate):
    return save_user_push_token(body.clerk_id, body.token)

@app.patch("/providers/push-token")
def update_provider_push_token(body: PushTokenUpdate):
    return save_provider_push_token(body.clerk_id, body.token)

# ── Bookings ──────────────────────────────────────
@app.post("/bookings")
def book_service(body: BookingCreate):
    return create_booking(
        user_clerk_id=body.user_clerk_id,
        provider_id=body.provider_id,
        user_lat=body.user_lat,
        user_lng=body.user_lng,
        distance_km=body.distance_km,
        duration_min=body.duration_min,
        base_price=body.base_price,
        user_address=body.user_address,
    )

# ✅ Specific routes BEFORE generic /{booking_id} routes
@app.get("/bookings/user/{clerk_id}")
def get_user_bookings(clerk_id: str):
    return get_bookings_for_user(clerk_id)

@app.get("/bookings/provider/{clerk_id}")
def get_provider_bookings(clerk_id: str):
    return get_bookings_for_provider(clerk_id)

@app.patch("/bookings/{booking_id}/status")
def update_status(booking_id: int, body: BookingStatusUpdate):
    return update_booking_status(booking_id, body.status)

@app.patch("/bookings/{booking_id}/location")
def set_provider_location(booking_id: int, body: LocationUpdate):
    return update_provider_location(booking_id, body.lat, body.lng)

@app.get("/bookings/{booking_id}/location")
def get_location(booking_id: int):
    return get_booking_location(booking_id)