from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
from schemas import User, LoginUser, ProviderCreate, ProviderResponse, AvailabilityUpdate
from models import (
    fetch_providers, fetch_provider_by_id, create_provider,
    update_availability, create_user, login_user,
    fetch_provider_by_clerk_id,
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

# ✅ by-clerk MUST be before /{provider_id}
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