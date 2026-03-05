import React, { useEffect, useRef, useState } from "react";
import { View, Dimensions, ActivityIndicator, Text, Platform } from "react-native";
import MapView from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Location from "expo-location";
import AppMap from "@/components/Maps";
import MechanicCard from "@/components/MechanicCard";
import { Provider } from "@/constants/providers";
import { fetchAPI } from "@/lib/fetch";
import {useLocalSearchParams} from "expo-router";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.78;
const SPACING = 12;


const params = useLocalSearchParams();
const filter = params.filter as string | undefined;
const GetHelp = () => {
    const mapRef = useRef<MapView>(null);
    const [providers, setProviders] = useState<Provider[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { filter } = useLocalSearchParams<{ filter?: string }>();
    const [userLocation, setUserLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);

    useEffect(() => {
        void fetchNearbyProviders();
    }, []);

    const fetchNearbyProviders = async () => {
        console.log("[GetHelp] Filter:", filter);
        setLoading(true);
        setError(null);
        try {
            console.log("[Location] Checking existing permission...");
            const { status: existing } = await Location.getForegroundPermissionsAsync();
            console.log("[Location] Existing status:", existing);

            const { status } = existing === "granted"
                ? { status: existing }
                : await Location.requestForegroundPermissionsAsync();
            console.log("[Location] Final status:", status);

            let path = filter
                ? `/providers?service_type=${filter}`
                : "/providers";

            if (status === "granted") {
                console.log("[Location] Getting position...");
                const location = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });
                console.log("[Location] Got position:", location.coords);

                const { latitude, longitude } = location.coords;
                setUserLocation({ latitude, longitude });
                path = filter
                    ? `/providers?lat=${latitude}&lng=${longitude}&radius_km=20&service_type=${filter}`
                    : `/providers?lat=${latitude}&lng=${longitude}&radius_km=20`;
            } else {
                console.log("[Location] Permission not granted:", status);
                setError("Location permission denied. Showing all providers.");
            }

            const data = await fetchAPI<any[]>(path);
            // ... rest of your code

            if (data.length === 0) {
                setError("No providers found nearby.");
                setLoading(false);
                return;
            }

            const mapped: Provider[] = data.map((p: any) => ({
                id:              String(p.id),
                name:            p.name,
                type:            p.service_type,
                phone:           p.phone,
                email:           p.email,
                address:         p.address,
                latitude:        p.latitude,
                longitude:       p.longitude,
                rating:          p.rating,
                totalReviews:    p.total_reviews,
                experienceYears: p.experience_years,
                basePrice:       p.base_price,
                description:     p.description ?? "",
                image:           p.image ?? "",
                verified:        p.verified,
                availability:    p.availability,
                distanceKm:      p.distance_km ?? null,
            }));

            setProviders(mapped);

        } catch (e: any) {
            console.error("[GetHelp] Error:", e);
            setError("Could not load providers. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const onScrollEnd = (event: any) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / (CARD_WIDTH + SPACING));
        const clampedIndex = Math.max(0, Math.min(index, providers.length - 1));
        setSelectedIndex(clampedIndex);

        const provider = providers[clampedIndex];
        if (provider && mapRef.current) {
            mapRef.current.animateToRegion(
                { latitude: provider.latitude, longitude: provider.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 },
                500
            );
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#1d4ed8" />
                <Text className="text-gray-500 text-sm mt-3">Finding nearby providers…</Text>
            </SafeAreaView>
        );
    }

    if (error && providers.length === 0) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center px-8">
                <Text className="text-red-500 text-base font-semibold text-center">{error}</Text>
                <Text className="text-blue-600 text-sm mt-3 font-semibold" onPress={fetchNearbyProviders}>
                    Tap to retry
                </Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1">
                <AppMap
                    ref={mapRef}
                    providers={providers}
                    selectedProvider={providers[selectedIndex]}
                    userLocation={userLocation}
                />
            </View>
            <MechanicCard
                providers={providers}
                onScrollEnd={onScrollEnd}
                bottomOffset={20}
            />
        </SafeAreaView>
    );
};

export default GetHelp;