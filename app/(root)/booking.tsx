import React, { useEffect, useRef, useState } from "react";
import {
    View, Text, TouchableOpacity, ActivityIndicator,
    ScrollView, Image, Dimensions, Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView from "react-native-maps";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import AppMap from "@/components/Maps";
import { useUser } from "@clerk/clerk-expo";
import { fetchAPI } from "@/lib/fetch";

const GEOAPIFY_API_KEY = process.env.EXPO_PUBLIC_GEOAPIFY_KEY;
const { height } = Dimensions.get("window");

interface RouteInfo {
    distanceKm: number;
    durationMin: number;
    coordinates: { latitude: number; longitude: number }[];
}

export default function BookingScreen() {
    const { provider } = useLocalSearchParams();
    const item = JSON.parse(provider as string);
    const router = useRouter();
    const mapRef = useRef<MapView>(null);
    const { user } = useUser();

    const providerCoords = useRef({
        latitude: item.latitude,
        longitude: item.longitude,
    }).current;

    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [routeLoading, setRouteLoading] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [bookingConfirmed, setBookingConfirmed] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== "granted") {
                    setError("Location permission denied.");
                    setLoading(false);
                    return;
                }
                const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
                setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
            } catch {
                setError("Could not get your location.");
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        if (!userLocation) return;
        fetchRoute(userLocation, providerCoords);
    }, [userLocation]);

    const fetchRoute = async (
        from: { latitude: number; longitude: number },
        to: { latitude: number; longitude: number }
    ) => {
        setRouteLoading(true);
        setError(null);
        try {
            const url =
                `https://api.geoapify.com/v1/routing?` +
                `waypoints=${from.latitude},${from.longitude}|${to.latitude},${to.longitude}` +
                `&mode=drive&apiKey=${GEOAPIFY_API_KEY ?? ""}`;

            const res = await fetch(url);
            const json = await res.json();

            if (!json.features || json.features.length === 0) {
                setError("Could not find a route.");
                return;
            }

            const feature = json.features[0];
            const props = feature.properties;
            const distanceKm = parseFloat((props.distance / 1000).toFixed(1));
            const durationMin = Math.round(props.time / 60);

            const rawCoords: [number, number][] =
                feature.geometry.type === "MultiLineString"
                    ? feature.geometry.coordinates.flat()
                    : feature.geometry.coordinates;

            const coordinates = rawCoords.map(([lng, lat]: [number, number]) => ({
                latitude: lat,
                longitude: lng,
            }));

            setRouteInfo({ distanceKm, durationMin, coordinates });

            setTimeout(() => {
                mapRef.current?.fitToCoordinates([from, to, ...coordinates], {
                    edgePadding: { top: 80, right: 60, bottom: 320, left: 60 },
                    animated: true,
                });
            }, 800);
        } catch {
            setError("Failed to fetch route.");
        } finally {
            setRouteLoading(false);
        }
    };

    const handleConfirmBooking = async () => {
        setBookingLoading(true);
        try {
            await fetchAPI("/bookings", {
                method: "POST",
                body: JSON.stringify({
                    user_clerk_id: user?.id,
                    provider_id: Number(item.id),
                    user_lat: userLocation?.latitude,
                    user_lng: userLocation?.longitude,
                    distance_km: routeInfo?.distanceKm ?? 0,
                    duration_min: routeInfo?.durationMin ?? 0,
                    base_price: item.basePrice,
                    user_address: item.address,
                }),
            });
            setBookingConfirmed(true);
        } catch (e: any) {
            setError("Booking failed: " + e.message);
        } finally {
            setBookingLoading(false);
        }
    };

    const initialRegion = userLocation
        ? {
            latitude: (userLocation.latitude + providerCoords.latitude) / 2,
            longitude: (userLocation.longitude + providerCoords.longitude) / 2,
            latitudeDelta: Math.abs(userLocation.latitude - providerCoords.latitude) * 2.5 + 0.05,
            longitudeDelta: Math.abs(userLocation.longitude - providerCoords.longitude) * 2.5 + 0.05,
        }
        : { latitude: providerCoords.latitude, longitude: providerCoords.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
                <ActivityIndicator size="large" color="#1d4ed8" />
                <Text className="mt-3 text-gray-500 text-sm">Getting your location…</Text>
            </SafeAreaView>
        );
    }

    if (bookingConfirmed) {
        return (
            <SafeAreaView className="flex-1 bg-green-50 items-center justify-center px-8">
                <View className="bg-white rounded-3xl p-8 items-center w-full shadow-md">
                    <Text className="text-5xl">🎉</Text>
                    <Text className="text-xl font-extrabold text-green-800 mt-4">Booking Made!</Text>
                    <Text className="text-sm text-gray-500 mt-2 text-center">{item.name} please waite for conformation.</Text>
                    {routeInfo && (
                        <View className="bg-green-50 rounded-2xl p-4 mt-5 w-full flex-row justify-around">
                            <View className="items-center">
                                <Text className="text-xl font-extrabold text-green-600">{routeInfo.distanceKm} km</Text>
                                <Text className="text-xs text-gray-400 mt-0.5">Distance</Text>
                            </View>
                            <View className="w-px bg-green-200" />
                            <View className="items-center">
                                <Text className="text-xl font-extrabold text-green-600">{routeInfo.durationMin} min</Text>
                                <Text className="text-xs text-gray-400 mt-0.5">ETA</Text>
                            </View>
                            <View className="w-px bg-green-200" />
                            <View className="items-center">
                                <Text className="text-xl font-extrabold text-green-600">₹{item.basePrice}</Text>
                                <Text className="text-xs text-gray-400 mt-0.5">Base Price</Text>
                            </View>
                        </View>
                    )}
                    <TouchableOpacity
                        onPress={() => router.replace("/(root)/(tabs)/services")}
                        className="bg-blue-700 rounded-2xl py-3.5 px-10 mt-6"
                        activeOpacity={0.85}
                    >
                        <Text className="text-white text-base font-bold">Back to Home</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <View style={{ height: height * 0.55 }}>
                <AppMap
                    ref={mapRef}
                    providers={[item]}
                    selectedProvider={item}
                    userLocation={userLocation}
                    routeInfo={routeInfo}
                    initialRegion={initialRegion}
                    style={{ flex: 1 }}
                />
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="absolute left-4 bg-white/95 rounded-full w-10 h-10 items-center justify-center shadow"
                    style={{ top: Platform.OS === "android" ? 16 : 12 }}
                    activeOpacity={0.8}
                >
                    <Text className="text-lg text-blue-700 font-bold">←</Text>
                </TouchableOpacity>
                {routeLoading && (
                    <View
                        className="absolute right-4 bg-white/95 rounded-xl px-3 py-2 flex-row items-center shadow"
                        style={{ top: Platform.OS === "android" ? 16 : 12 }}
                    >
                        <ActivityIndicator size="small" color="#1d4ed8" />
                        <Text className="text-xs text-gray-600 ml-1.5 font-semibold">Calculating route…</Text>
                    </View>
                )}
            </View>

            <ScrollView
                className="flex-1 bg-white"
                contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
                bounces={false}
            >
                <View className="flex-row items-center mb-4">
                    <Image
                        source={{ uri: item.image }}
                        style={{ width: 52, height: 52, borderRadius: 26, marginRight: 14 }}
                    />
                    <View className="flex-1">
                        <Text className="text-lg font-extrabold text-gray-900">{item.name}</Text>
                        <Text className="text-xs text-gray-400 mt-0.5">
                            ⭐ {item.rating}  ·  {item.experienceYears} yrs experience
                        </Text>
                    </View>
                    <View className="bg-blue-50 rounded-xl px-3 py-1.5">
                        <Text className="text-base font-extrabold text-blue-700">₹{item.basePrice}</Text>
                    </View>
                </View>

                {routeInfo ? (
                    <View className="bg-slate-50 rounded-2xl p-4 flex-row justify-around mb-4 border border-slate-200">
                        <View className="items-center">
                            <Text className="text-xl">📍</Text>
                            <Text className="text-base font-extrabold text-gray-900 mt-1">{routeInfo.distanceKm} km</Text>
                            <Text className="text-xs text-gray-400">Distance</Text>
                        </View>
                        <View className="w-px bg-slate-200" />
                        <View className="items-center">
                            <Text className="text-xl">⏱️</Text>
                            <Text className="text-base font-extrabold text-gray-900 mt-1">{routeInfo.durationMin} min</Text>
                            <Text className="text-xs text-gray-400">ETA</Text>
                        </View>
                        <View className="w-px bg-slate-200" />
                        <View className="items-center">
                            <Text className="text-xl">🛣️</Text>
                            <Text className="text-base font-extrabold text-gray-900 mt-1">Drive</Text>
                            <Text className="text-xs text-gray-400">Mode</Text>
                        </View>
                    </View>
                ) : error ? (
                    <View className="bg-red-50 rounded-2xl p-3.5 mb-4 border border-red-200">
                        <Text className="text-red-600 text-sm font-semibold">⚠️ {error}</Text>
                    </View>
                ) : (
                    <View className="bg-slate-50 rounded-2xl p-4 mb-4 items-center">
                        <ActivityIndicator color="#1d4ed8" />
                        <Text className="text-gray-400 text-sm mt-2">Calculating route…</Text>
                    </View>
                )}

                <View className="bg-slate-50 rounded-2xl p-3.5 flex-row items-center mb-5">
                    <Text className="text-xl mr-2.5">📍</Text>
                    <View>
                        <Text className="text-xs text-gray-400 font-semibold">Mechanic Location</Text>
                        <Text className="text-sm text-gray-700 mt-0.5">{item.address}</Text>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={handleConfirmBooking}
                    disabled={bookingLoading}
                    className="bg-blue-700 rounded-2xl py-4 items-center"
                    style={{
                        shadowColor: "#1d4ed8",
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.35,
                        shadowRadius: 12,
                        elevation: 8,
                    }}
                    activeOpacity={0.85}
                >
                    {bookingLoading
                        ? <ActivityIndicator color="#fff" />
                        : <Text className="text-white text-base font-extrabold">
                            Confirm Booking · ₹{item.basePrice}
                        </Text>
                    }
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}