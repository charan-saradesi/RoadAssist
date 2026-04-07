from fastapi import HTTPException
from typing import Optional
from database import get_connection
from schemas import ProviderCreate
import math

import httpx

def send_push_notification(token: str, title: str, body: str) -> None:
    if not token:
        return
    try:
        httpx.post(
            "https://exp.host/--/api/v2/push/send",
            json={
                "to": token,
                "title": title,
                "body": body,
                "sound": "default",
            },
            timeout=5,
        )
    except Exception as e:
        print(f"Push notification failed: {e}")

def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    a = (math.sin(delta_lat / 2) ** 2 +
         math.cos(math.radians(lat1)) *
         math.cos(math.radians(lat2)) *
         math.sin(delta_lon / 2) ** 2)
    return R * 2 * math.asin(math.sqrt(a))


def row_to_dict(row) -> dict:
    return {
        "id": row[0], "name": row[1], "service_type": row[2],
        "phone": row[3], "email": row[4], "address": row[5],
        "latitude": float(row[6]), "longitude": float(row[7]),
        "rating": float(row[8]), "total_reviews": row[9],
        "experience_years": row[10], "base_price": row[11],
        "description": row[12], "image": row[13],
        "verified": row[14], "availability": row[15],
        "is_active": row[16], "created_at": row[17],
    }


# ── Providers ─────────────────────────────────────

def fetch_providers(
    service_type: Optional[str] = None,
    user_lat: Optional[float] = None,
    user_lng: Optional[float] = None,
    radius_km: float = 20.0,
) -> list[dict]:
    conn = get_connection()
    cursor = conn.cursor()
    try:
        if service_type:
            cursor.execute("""
                SELECT id,name,service_type,phone,email,address,latitude,longitude,
                       rating,total_reviews,experience_years,base_price,
                       description,image,verified,availability,is_active,created_at
                FROM providers WHERE is_active=TRUE AND service_type=%s;
            """, (service_type,))
        else:
            cursor.execute("""
                SELECT id,name,service_type,phone,email,address,latitude,longitude,
                       rating,total_reviews,experience_years,base_price,
                       description,image,verified,availability,is_active,created_at
                FROM providers WHERE is_active=TRUE;
            """)

        rows = cursor.fetchall()
        providers = [row_to_dict(row) for row in rows]

        if user_lat is not None and user_lng is not None:
            for provider in providers:
                provider["distance_km"] = round(
                    haversine(user_lat, user_lng, provider["latitude"], provider["longitude"]), 2
                )
            providers = [provider for provider in providers if provider["distance_km"] <= radius_km]
            providers.sort(key=lambda provider: provider["distance_km"])
        else:
            providers.sort(key=lambda provider: provider["rating"], reverse=True)

        return providers
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


def fetch_provider_by_id(provider_id: int) -> dict:
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT id,name,service_type,phone,email,address,latitude,longitude,
                   rating,total_reviews,experience_years,base_price,
                   description,image,verified,availability,is_active,created_at
            FROM providers WHERE id=%s AND is_active=TRUE;
        """, (provider_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Provider not found")
        return row_to_dict(row)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


def create_provider(data: ProviderCreate) -> dict:
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO providers (
                name,service_type,phone,email,address,latitude,longitude,
                experience_years,base_price,description,image,verified,availability,clerk_id
            ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            RETURNING id;
        """, (
            data.name, data.service_type, data.phone, data.email,
            data.address, data.latitude, data.longitude,
            data.experience_years, data.base_price, data.description,
            data.image, data.verified, data.availability, data.clerk_id,
        ))
        pid = cursor.fetchone()[0]
        conn.commit()
        return fetch_provider_by_id(pid)
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()



def update_availability(provider_id: int, availability: str) -> dict:
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "UPDATE providers SET availability=%s WHERE id=%s RETURNING id;",
            (availability, provider_id)
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Provider not found")
        conn.commit()
        return fetch_provider_by_id(provider_id)
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


# ── Users ─────────────────────────────────────────

def create_user(first_name: str, last_name: str, phone: str, email: str, clerk_id: str) -> dict:
    name = f"{first_name} {last_name}"
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("SELECT id FROM users WHERE clerk_id=%s", (clerk_id,))
        existing = cursor.fetchone()
        if existing:
            return {"success": True, "id": existing[0]}
        cursor.execute(
            "INSERT INTO users (name,email,phone,clerk_id) VALUES (%s,%s,%s,%s) RETURNING id;",
            (name, email, phone, clerk_id),
        )
        uid = cursor.fetchone()[0]
        conn.commit()
        return {"success": True, "id": uid}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


def login_user(email: str, clerk_id: str) -> dict:
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "SELECT id,name FROM users WHERE email=%s AND clerk_id=%s",
            (email, clerk_id),
        )
        result = cursor.fetchone()
        if not result:
            raise HTTPException(status_code=401, detail="Invalid email or Clerk ID")
        return {"success": True, "id": result[0], "name": result[1]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


def fetch_provider_by_clerk_id(clerk_id: str) -> dict:
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT id, name, service_type, verified
            FROM providers
            WHERE clerk_id = %s AND is_active = TRUE;
        """, (clerk_id,))
        row = cursor.fetchone()
        if not row:
            return {"status": "not_registered"}  # ← return 200, not 404
        return {
            "status": "verified" if row[3] else "registered",
            "id": row[0],
            "name": row[1],
            "service_type": row[2],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


def create_booking(user_clerk_id: str, provider_id: int, user_lat: float, user_lng: float, distance_km: float, duration_min: int, base_price: int, user_address: str) -> dict:
    conn = get_connection()
    cursor = conn.cursor()
    try:
        # Get user_id and user push token
        cursor.execute("SELECT id, name, expo_push_token FROM users WHERE clerk_id=%s", (user_clerk_id,))
        user_row = cursor.fetchone()
        if not user_row:
            raise HTTPException(status_code=404, detail="User not found")
        user_id, user_name, user_push_token = user_row

        # Get provider push token
        cursor.execute("SELECT expo_push_token FROM providers WHERE id=%s", (provider_id,))
        provider_row = cursor.fetchone()
        if not provider_row:
            raise HTTPException(status_code=404, detail="Provider not found")
        provider_push_token = provider_row[0]

        # Insert into service_requests
        cursor.execute("""
            INSERT INTO service_requests 
                (user_id, provider_id, user_lat, user_lng, distance_km, duration_min, base_price, user_address, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'pending')
            RETURNING id;
        """, (user_id, provider_id, user_lat, user_lng, distance_km, duration_min, base_price, user_address))

        booking_id = cursor.fetchone()[0]
        conn.commit()

        # Send push to provider
        send_push_notification(
            provider_push_token,
            "🔧 New Booking Request!",
            f"{user_name} has requested your service. Tap to respond."
        )

        # Send push to user
        send_push_notification(
            user_push_token,
            "✅ Booking Confirmed!",
            "Your booking request has been sent. Waiting for provider to accept."
        )

        return {"success": True, "booking_id": booking_id}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

def save_user_push_token(clerk_id: str, token: str) -> dict:
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "UPDATE users SET expo_push_token=%s WHERE clerk_id=%s RETURNING id;",
            (token, clerk_id)
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="User not found")
        conn.commit()
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


def save_provider_push_token(clerk_id: str, token: str) -> dict:
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "UPDATE providers SET expo_push_token=%s WHERE clerk_id=%s RETURNING id;",
            (token, clerk_id)
        )
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Provider not found")
        conn.commit()
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

def get_bookings_for_user(clerk_id: str) -> list:
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT sr.id, sr.status, sr.created_at, sr.base_price,
                   sr.distance_km, sr.duration_min, sr.user_address,
                   p.name as provider_name, p.phone as provider_phone,
                   p.service_type, p.image as provider_image
            FROM service_requests sr
            JOIN providers p ON sr.provider_id = p.id
            JOIN users u ON sr.user_id = u.id
            WHERE u.clerk_id = %s
            ORDER BY sr.created_at DESC;
        """, (clerk_id,))
        rows = cursor.fetchall()
        return [
            {
                "id": row[0], "status": row[1], "created_at": str(row[2]),
                "base_price": float(row[3]), "distance_km": float(row[4]),
                "duration_min": row[5], "user_address": row[6],
                "provider_name": row[7], "provider_phone": row[8],
                "service_type": row[9], "provider_image": row[10],
            }
            for row in rows
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


def get_bookings_for_provider(clerk_id: str) -> list:
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
                       SELECT sr.id,
                              sr.status,
                              sr.created_at,
                              sr.base_price,
                              sr.distance_km,
                              sr.duration_min,
                              sr.user_address,
                              u.name  as user_name,
                              u.phone as user_phone,
                              sr.user_lat,
                              sr.user_lng
                       FROM service_requests sr
                                JOIN providers p ON sr.provider_id = p.id
                                JOIN users u ON sr.user_id = u.id
                       WHERE p.clerk_id = %s
                       ORDER BY sr.created_at DESC;
                       """, (clerk_id,))
        rows = cursor.fetchall()
        return [
            {
                "id": row[0], "status": row[1], "created_at": str(row[2]),
                "base_price": float(row[3]), "distance_km": float(row[4]),
                "duration_min": row[5], "user_address": row[6],
                "user_name": row[7], "user_phone": row[8],
                "user_lat": float(row[9]) if row[9] else None,
                "user_lng": float(row[10]) if row[10] else None,
            }
            for row in rows
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


def update_booking_status(booking_id: int, status: str) -> dict:
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE service_requests 
            SET status=%s, updated_at=now() 
            WHERE id=%s RETURNING id;
        """, (status, booking_id))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Booking not found")
        conn.commit()
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


def update_provider_location(booking_id: int, lat: float, lng: float) -> dict:
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE service_requests 
            SET provider_lat=%s, provider_lng=%s, updated_at=now()
            WHERE id=%s RETURNING id;
        """, (lat, lng, booking_id))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Booking not found")
        conn.commit()
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()


def get_booking_location(booking_id: int) -> dict:
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT provider_lat, provider_lng, status
            FROM service_requests WHERE id=%s;
        """, (booking_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Booking not found")
        return {
            "provider_lat": float(row[0]) if row[0] is not None else None,
            "provider_lng": float(row[1]) if row[1] is not None else None,
            "status": row[2],
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()