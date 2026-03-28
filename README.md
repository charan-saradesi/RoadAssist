# 🚗 RoadAssist

A full-stack roadside assistance mobile app built with **React Native (Expo)** and **FastAPI**. Users can find nearby mechanics and towing services, book them in real time, and track routes. Service providers can register, get verified, and receive push notifications for new bookings.

---

## 📱 Features

- **Find Nearby Help** — GPS-based search for mechanics and towing providers within 20km
- **Book a Service** — Real-time booking with route preview using Geoapify Routing API
- **Provider Registration** — Users can register as service providers (mechanic / towing / both)
- **Provider Verification** — Verified badge system with contact-based verification flow
- **Push Notifications** — Expo push notifications sent to providers on new bookings
- **Custom Map Pins** — Shared reusable map component with custom pin images
- **Clerk Authentication** — Sign up / Sign in with email via Clerk

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Mobile App | React Native, Expo, NativeWind (Tailwind) |
| Authentication | Clerk |
| Maps | react-native-maps, Geoapify Routing API |
| Backend | FastAPI, Python |
| Database | PostgreSQL (Neon or local) |
| Push Notifications | Expo Notifications |

---

## 📁 Project Structure

```
RoadAssist/
├── app/
│   ├── (auth)/           # Sign in, Sign up, Welcome
│   ├── (root)/
│   │   ├── (tabs)/       # Home, Profile, Rides, Chat
│   │   ├── getHelp.tsx   # Find nearby providers
│   │   ├── booking.tsx   # Route + booking confirmation
│   │   ├── ProviderDetails.tsx
│   │   ├── RegisterProvider.tsx
│   │   └── VerifyProvider.tsx
├── components/
│   ├── Maps.tsx           # Shared reusable map component
│   ├── MechanicCard.tsx   # Animated provider cards carousel
│   └── InputField.tsx
├── constants/
│   └── providers.ts       # Provider type definitions
├── lib/
│   ├── fetch.ts           # fetchAPI + APIError + useFetch
│   └── notifications.ts   # Push notification registration
├── backend/
│   ├── main.py            # FastAPI routes
│   ├── models.py          # DB operations + Haversine distance
│   ├── schemas.py         # Pydantic models
│   └── database.py        # PostgreSQL connection
└── assets/
    └── icons/             # user_pin, mechanic_pin, tow_pin
```

---

## ⚙️ Setup

### Prerequisites

- Node.js 18+
- Python 3.10+
- PostgreSQL (local or Neon)
- Expo CLI
- Clerk account
- Geoapify API key

---

### 1. Clone the repo

```bash
git clone https://github.com/yourname/RoadAssist.git
cd RoadAssist
```

---

### 2. Frontend Setup

```bash
npm install
```

Create `.env` in the root:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key
EXPO_PUBLIC_API_BASE=http://YOUR_LAPTOP_IP:8000
EXPO_PUBLIC_GEOAPIFY_KEY=your_geoapify_key
```

Run the app:

```bash
npx expo run:ios
# or
npx expo run:android
```

> **Note:** Use `npx expo run:ios` (not `npx expo start`) to apply permission changes in `app.json`.

Set simulated location in iOS Simulator:
```
Features → Location → Custom Location
Latitude:  12.9716
Longitude: 77.5946
```

---

### 3. Backend Setup

```bash
cd backend
python -m venv myenv
source myenv/bin/activate        # Mac/Linux
# myenv\Scripts\activate         # Windows

pip install -r requirements.txt
```

Create `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/RoadAssist
```

Run the server:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 4. Database Setup

Run all SQL below in pgAdmin or psql.

---

## 🗄️ SQL — Create Tables

```sql
-- USERS
CREATE TABLE users (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100)    NOT NULL,
    email       VARCHAR(100)    NOT NULL UNIQUE,
    phone       VARCHAR(20),
    clerk_id    VARCHAR(100)    NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- PROVIDERS
CREATE TABLE providers (
    id                  SERIAL PRIMARY KEY,
    name                VARCHAR(100)        NOT NULL,
    service_type        VARCHAR(20)         NOT NULL,
    phone               VARCHAR(20)         NOT NULL,
    email               VARCHAR(100)        NOT NULL,
    address             TEXT                NOT NULL,
    latitude            DOUBLE PRECISION    NOT NULL,
    longitude           DOUBLE PRECISION    NOT NULL,
    rating              NUMERIC(2,1)        NOT NULL DEFAULT 0.0,
    total_reviews       INTEGER             NOT NULL DEFAULT 0,
    experience_years    INTEGER             NOT NULL DEFAULT 0,
    base_price          INTEGER             NOT NULL DEFAULT 0,
    description         TEXT,
    image               TEXT,
    verified            BOOLEAN             NOT NULL DEFAULT FALSE,
    availability        VARCHAR(20)         NOT NULL DEFAULT 'available',
    is_active           BOOLEAN             NOT NULL DEFAULT TRUE,
    clerk_id            VARCHAR(100),
    expo_token          VARCHAR(200),
    created_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    CONSTRAINT providers_service_type_check
        CHECK (service_type IN ('mechanic', 'towing', 'both')),
    CONSTRAINT providers_availability_check
        CHECK (availability IN ('available', 'busy'))
);

-- BOOKINGS
CREATE TABLE bookings (
    id              SERIAL PRIMARY KEY,
    user_id         VARCHAR(100)        NOT NULL,
    provider_id     INTEGER             NOT NULL REFERENCES providers(id),
    status          VARCHAR(20)         NOT NULL DEFAULT 'pending',
    user_lat        DOUBLE PRECISION,
    user_lng        DOUBLE PRECISION,
    user_address    TEXT,
    distance_km     NUMERIC(5,2),
    duration_min    INTEGER,
    base_price      INTEGER,
    notes           TEXT,
    created_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    CONSTRAINT bookings_status_check
        CHECK (status IN ('pending', 'accepted', 'rejected', 'completed'))
);
```

---

## 🌱 SQL — Mock Data (25 Providers in Bangalore)

```sql
INSERT INTO providers (
    name, service_type, phone, email, address,
    latitude, longitude, rating, total_reviews,
    experience_years, base_price, description,
    image, verified, availability
) VALUES
('SpeedFix Mechanic', 'mechanic', '+91 9876543210', 'speedfix@gmail.com',
 'MG Road, Bangalore', 12.933114, 77.560822, 4.8, 214, 8, 499,
 'Expert in engine diagnostics, brake repair and roadside emergency services.',
 'https://randomuser.me/api/portraits/men/32.jpg', TRUE, 'available'),

('Rapid Tow Services', 'towing', '+91 9123456780', 'rapidtow@gmail.com',
 'Indiranagar, Bangalore', 12.930890, 77.568615, 4.5, 132, 5, 899,
 '24/7 towing support with flatbed trucks and accident recovery service.',
 'https://randomuser.me/api/portraits/men/45.jpg', TRUE, 'busy'),

('Auto Rescue Pro', 'both', '+91 9988776655', 'autorescue@gmail.com',
 'Koramangala, Bangalore', 12.921018, 77.559174, 4.9, 341, 10, 699,
 'Premium roadside assistance, mechanical repairs and towing services.',
 'https://randomuser.me/api/portraits/men/51.jpg', TRUE, 'available'),

('City Tow Expert', 'towing', '+91 9011223344', 'citytow@gmail.com',
 'Jayanagar, Bangalore', 12.932019, 77.555783, 4.2, 88, 6, 799,
 'Reliable towing and breakdown recovery services across the city.',
 'https://randomuser.me/api/portraits/men/12.jpg', FALSE, 'available'),

('Garage Master', 'mechanic', '+91 9090909090', 'garagemaster@gmail.com',
 'HSR Layout, Bangalore', 12.932772, 77.574023, 4.6, 167, 7, 550,
 'Specialist in car servicing, battery replacement and AC repairs.',
 'https://randomuser.me/api/portraits/men/77.jpg', TRUE, 'available'),

('Roadside Hero', 'both', '+91 9445566778', 'roadsidehero@gmail.com',
 'Whitefield, Bangalore', 12.931183, 77.568529, 4.7, 205, 9, 650,
 'Quick response roadside mechanic with professional towing support.',
 'https://randomuser.me/api/portraits/men/66.jpg', TRUE, 'available'),

('QuickTow Services', 'towing', '+91 9876500001', 'quicktow@gmail.com',
 'Indiranagar, Bangalore', 12.978540, 77.640960, 4.5, 182, 6, 699,
 'Fast and reliable towing for all vehicle types, available 24/7.',
 'https://randomuser.me/api/portraits/men/43.jpg', TRUE, 'available'),

('RoadStar Mechanic', 'mechanic', '+91 9876500002', 'roadstar@gmail.com',
 'Koramangala, Bangalore', 12.934533, 77.626579, 4.6, 98, 5, 399,
 'Specializes in transmission repair, oil changes and full vehicle servicing.',
 'https://randomuser.me/api/portraits/men/67.jpg', FALSE, 'busy'),

('SafeHaul Towing', 'towing', '+91 9876500003', 'safetow@gmail.com',
 'Whitefield, Bangalore', 12.969040, 77.749870, 4.2, 76, 4, 599,
 'Flatbed and wheel-lift towing across Bangalore city and outskirts.',
 'https://randomuser.me/api/portraits/men/88.jpg', TRUE, 'available'),

('AutoCare Pro', 'mechanic', '+91 9876500004', 'autocare@gmail.com',
 'HSR Layout, Bangalore', 12.911260, 77.647530, 4.9, 310, 12, 549,
 'Premium roadside assistance with expertise in European and luxury cars.',
 'https://randomuser.me/api/portraits/men/21.jpg', TRUE, 'available'),

('TowMaster Bangalore', 'towing', '+91 9876500005', 'towmaster@gmail.com',
 'Electronic City, Bangalore', 12.839500, 77.676900, 4.3, 95, 7, 749,
 '24/7 towing and recovery for cars, SUVs and light commercial vehicles.',
 'https://randomuser.me/api/portraits/men/34.jpg', TRUE, 'available'),

('FixIt Fast', 'mechanic', '+91 9876500006', 'fixitfast@gmail.com',
 'Marathahalli, Bangalore', 12.959800, 77.697600, 4.7, 223, 9, 449,
 'On-the-spot repairs for engine issues, flat tyres and battery problems.',
 'https://randomuser.me/api/portraits/men/55.jpg', TRUE, 'available'),

('City Rescue Towing', 'towing', '+91 9876500007', 'cityrescue@gmail.com',
 'BTM Layout, Bangalore', 12.916700, 77.610500, 4.4, 118, 5, 649,
 'Professional towing with GPS tracking and transparent pricing.',
 'https://randomuser.me/api/portraits/men/62.jpg', TRUE, 'available'),

('Bangalore Auto Works', 'both', '+91 9876500008', 'bangaloreauto@gmail.com',
 'Rajajinagar, Bangalore', 12.989700, 77.552400, 4.8, 287, 11, 599,
 'Full-service roadside assistance including repairs and towing.',
 'https://randomuser.me/api/portraits/men/71.jpg', TRUE, 'available'),

('Express Mechanic', 'mechanic', '+91 9876500009', 'expressmech@gmail.com',
 'Jayanagar, Bangalore', 12.930200, 77.583100, 4.5, 143, 6, 499,
 'Fast response mechanic specialising in all makes and models.',
 'https://randomuser.me/api/portraits/men/83.jpg', FALSE, 'available'),

('HeavyLift Towing', 'towing', '+91 9876500010', 'heavylift@gmail.com',
 'Peenya, Bangalore', 13.028600, 77.518700, 4.1, 64, 8, 899,
 'Heavy vehicle and commercial truck towing and recovery.',
 'https://randomuser.me/api/portraits/men/91.jpg', TRUE, 'busy'),

('Road Runners', 'both', '+91 9876500011', 'roadrunners@gmail.com',
 'Yelahanka, Bangalore', 13.100600, 77.596400, 4.6, 175, 7, 625,
 'Comprehensive roadside service covering north Bangalore.',
 'https://randomuser.me/api/portraits/men/14.jpg', TRUE, 'available'),

('Pit Stop Mechanic', 'mechanic', '+91 9876500012', 'pitstop@gmail.com',
 'Bellandur, Bangalore', 12.926400, 77.676800, 4.7, 198, 8, 525,
 'Expert diagnostics and on-site repairs for all vehicle types.',
 'https://randomuser.me/api/portraits/men/26.jpg', TRUE, 'available'),

('Swift Tow', 'towing', '+91 9876500013', 'swifttow@gmail.com',
 'Bannerghatta Road, Bangalore', 12.873500, 77.597200, 4.3, 87, 4, 699,
 'Swift and safe towing with modern flatbed trucks.',
 'https://randomuser.me/api/portraits/men/38.jpg', TRUE, 'available'),

('MechPro Services', 'mechanic', '+91 9876500014', 'mechpro@gmail.com',
 'Sarjapur Road, Bangalore', 12.908700, 77.686300, 4.8, 256, 10, 575,
 'Certified mechanics providing reliable on-site vehicle repairs.',
 'https://randomuser.me/api/portraits/men/47.jpg', TRUE, 'available'),

('Rescue Tow Bangalore', 'towing', '+91 9876500015', 'rescuetow@gmail.com',
 'Hennur, Bangalore', 13.053200, 77.638400, 4.2, 73, 5, 749,
 'Accident recovery and breakdown towing across Bangalore.',
 'https://randomuser.me/api/portraits/men/58.jpg', FALSE, 'available'),

('All Roads Mechanic', 'both', '+91 9876500016', 'allroads@gmail.com',
 'Kengeri, Bangalore', 12.908900, 77.482700, 4.5, 132, 6, 575,
 'Mechanic and towing services covering west Bangalore.',
 'https://randomuser.me/api/portraits/men/69.jpg', TRUE, 'available'),

('FastLane Towing', 'towing', '+91 9876500017', 'fastlane@gmail.com',
 'Hebbal, Bangalore', 13.035100, 77.597300, 4.6, 154, 7, 699,
 'Quick dispatch towing with 20 min average response time.',
 'https://randomuser.me/api/portraits/men/78.jpg', TRUE, 'available'),

('TechFix Mechanic', 'mechanic', '+91 9876500018', 'techfix@gmail.com',
 'Electronic City Phase 2, Bangalore', 12.829600, 77.675100, 4.7, 211, 9, 499,
 'Technology-driven diagnostics and precision vehicle repairs.',
 'https://randomuser.me/api/portraits/men/85.jpg', TRUE, 'available'),

('Quick Fix Mechanic', 'mechanic', '+91 9876543210', 'quickfix@gmail.com',
 'Kanakapura, Bangalore', 12.651373, 77.439900, 4.5, 0, 5, 499,
 'Expert in engine diagnostics, brake repair and roadside emergency services.',
 'https://randomuser.me/api/portraits/men/42.jpg', TRUE, 'available');
```

---

## 🔑 Environment Variables

### Frontend `.env`
```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
EXPO_PUBLIC_API_BASE=http://YOUR_LAPTOP_IP:8000
EXPO_PUBLIC_GEOAPIFY_KEY=your_geoapify_key
```

### Backend `backend/.env`
```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/RoadAssist
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/providers` | Get all providers (supports `?lat=&lng=&radius_km=&service_type=`) |
| GET | `/providers/{id}` | Get provider by ID |
| GET | `/providers/by-clerk/{clerk_id}` | Get provider registration status |
| POST | `/providers` | Register new provider |
| PATCH | `/providers/{id}/availability` | Update availability |
| PATCH | `/providers/expo-token` | Save push notification token |
| POST | `/user` | Register user |
| POST | `/login` | Login user |
| POST | `/bookings` | Create booking + send push notification |
| GET | `/bookings/provider/{clerk_id}` | Get bookings for a provider |
| PATCH | `/bookings/{id}/status` | Update booking status |

---

## 📦 Dependencies

### Frontend
```bash
npx expo install expo-location expo-notifications expo-device react-native-maps
npm install @clerk/clerk-expo nativewind
```

### Backend
```
fastapi
uvicorn
psycopg2-binary
python-dotenv
pydantic[email]
httpx
```

---

## 🧪 Testing on Physical Device

1. Make sure your phone and laptop are on the **same WiFi**
2. Find your laptop IP: `ipconfig getifaddr en0` (Mac) or `ip a` (Linux)
3. Set `EXPO_PUBLIC_API_BASE=http://YOUR_IP:8000` in `.env`
4. Run FastAPI with: `uvicorn main:app --host 0.0.0.0 --port 8000 --reload`

---

## 📄 License

MIT