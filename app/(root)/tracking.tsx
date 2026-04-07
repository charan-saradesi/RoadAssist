import React, { useEffect, useRef, useState } from "react";
import {
    View, Text, TouchableOpacity, ActivityIndicator, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView from "react-native-maps";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import AppMap from "@/components/Maps";
import { fetchAPI } from "@/lib/fetch";

const STATUS_INFO: Record<string, { label: string; color: string; icon: string }> = {
    pending:   { label: "Waiting for provider to accept", color: "#f59e0b", icon: "⏳" },
    accepted:  { label: "Provider is on the way",         color: "#22c55e", icon: "🚗" },
    completed: { label: "Service completed",              color: "#3b82f6", icon: "🏁" },
    rejected:  { label: "Booking was rejected",           color: "#ef4444", icon: "❌" },
};

export default function TrackingScreen() {
    const { booking } = useLocalSearchParams();
    const item = JSON.parse(booking as string);
    const router = useRouter();
    const mapRef = useRef<MapView>(null);

    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [providerLocation, setProviderLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [status, setStatus] = useState<string>(item.status);
    const [loading, setLoading] = useState(true);
    const intervalRef = useRef<any>(null);

    useEffect(() => {
        void init();
        return () => clearInterval(intervalRef.current);
    }, []);

    const init = async () => {
        try {
            const { status: perm } = await Location.requestForegroundPermissionsAsync();
            if (perm === "granted") {
                const loc = await Location.getCurrentPositionAsync({});
                setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
            }
        } catch (e) {
            console.log("Location error:", e);
        } finally {
            setLoading(false);
        }

        // Fetch immediately then every 3 minutes
        await fetchLocation();
        intervalRef.current = setInterval(fetchLocation, 3 * 60 * 1000);
    };

    const fetchLocation = async () => {
        try {
            const data = await fetchAPI<any>(`/bookings/${item.id}/location`);
            console.log("📍 Location data:", JSON.stringify(data)); // ← add this
            setStatus(data.status);
            if (data.provider_lat && data.provider_lng) {
                const newLoc = { latitude: data.provider_lat, longitude: data.provider_lng };
                setProviderLocation(newLoc);
                mapRef.current?.animateToRegion({
                    ...newLoc,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }, 1000);
            }
        } catch (e) {
            console.log("Location fetch error:", e);
        }
    };

    const statusInfo = STATUS_INFO[status] ?? STATUS_INFO.pending;

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
                <ActivityIndicator size="large" color="#1d4ed8" />
                <Text className="mt-3 text-gray-500 text-sm">Loading tracking…</Text>
            </SafeAreaView>
        );
    }

    const providerAsProvider = providerLocation ? [{
        id: "provider",
        name: item.provider_name ?? "Provider",
        type: "mechanic",
        latitude: providerLocation.latitude,
        longitude: providerLocation.longitude,
        phone: "", email: "", address: "", rating: 0,
        totalReviews: 0, experienceYears: 0, basePrice: 0,
        description: "", image: "", verified: false,
        availability: "available", distanceKm: null,
    }] : [];

    return (
        <SafeAreaView className="flex-1 bg-slate-50">

            {/* Map */}
            <View style={{ flex: 1 }}>
                <AppMap
                    ref={mapRef}
                    providers={providerAsProvider as any}
                    selectedProvider={providerAsProvider[0] as any}
                    userLocation={userLocation}
                    initialRegion={userLocation ? {
                        latitude: userLocation.latitude,
                        longitude: userLocation.longitude,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                    } : undefined}
                    style={{ flex: 1 }}
                />

                {/* Back button */}
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="absolute left-4 bg-white/95 rounded-full w-10 h-10 items-center justify-center shadow"
                    style={{ top: Platform.OS === "android" ? 16 : 12 }}
                    activeOpacity={0.8}
                >
                    <Text className="text-lg text-blue-700 font-bold">←</Text>
                </TouchableOpacity>
            </View>

            {/* Status Card */}
            <View className="bg-white px-5 py-5 border-t border-gray-100"
                  style={{ shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 10 }}>

                {/* Status */}
                <View className="flex-row items-center mb-4">
                    <View className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                          style={{ backgroundColor: statusInfo.color + "20" }}>
                        <Text style={{ fontSize: 22 }}>{statusInfo.icon}</Text>
                    </View>
                    <View className="flex-1">
                        <Text className="text-base font-extrabold text-gray-900">
                            {statusInfo.label}
                        </Text>
                        <Text className="text-xs text-gray-400 mt-0.5">
                            Booking #{item.id} · ₹{item.base_price}
                        </Text>
                    </View>
                </View>

                {/* Details row */}
                <View className="bg-slate-50 rounded-2xl p-3 flex-row justify-around mb-4 border border-slate-100">
                    <View className="items-center">
                        <Text className="text-sm font-extrabold text-gray-800">{item.distance_km} km</Text>
                        <Text className="text-xs text-gray-400">Distance</Text>
                    </View>
                    <View className="w-px bg-slate-200" />
                    <View className="items-center">
                        <Text className="text-sm font-extrabold text-gray-800">{item.duration_min} min</Text>
                        <Text className="text-xs text-gray-400">ETA</Text>
                    </View>
                    <View className="w-px bg-slate-200" />
                    <View className="items-center">
                        <Text className="text-sm font-extrabold text-gray-800">
                            {item.provider_name ?? item.user_name}
                        </Text>
                        <Text className="text-xs text-gray-400">Provider</Text>
                    </View>
                </View>

                {/* Refresh button */}
                <TouchableOpacity
                    onPress={fetchLocation}
                    className="bg-blue-50 rounded-xl py-3 items-center border border-blue-100"
                    activeOpacity={0.8}
                >
                    <Text className="text-blue-600 font-bold text-sm">🔄 Refresh Location</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}