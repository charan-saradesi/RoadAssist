import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Dimensions,
} from "react-native";
import MapView from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import Maps from "@/components/Maps";
import MechanicCard from "@/components/MechanicCard";
import { mockProviders, Provider } from "@/constants/providers";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

// ✅ Must match CARD_WIDTH and SPACING inside MechanicCard exactly
const CARD_WIDTH = width * 0.78;
const SPACING = 12;

const GetHelp = () => {
    const mapRef = useRef<MapView>(null);
    const router = useRouter();

    const [providers, setProviders] = useState<Provider[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        setTimeout(() => {
            setProviders(mockProviders);
        }, 800);
    }, []);

    const onScrollEnd = (event: any) => {
        // ✅ Use same CARD_WIDTH + SPACING as MechanicCard
        const index = Math.round(
            event.nativeEvent.contentOffset.x / (CARD_WIDTH + SPACING)
        );

        const clampedIndex = Math.max(0, Math.min(index, providers.length - 1));
        setSelectedIndex(clampedIndex);

        const provider = providers[clampedIndex];
        if (provider && mapRef.current) {
            mapRef.current.animateToRegion(
                {
                    latitude: provider.latitude,
                    longitude: provider.longitude,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02,
                },
                500
            );
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-general-50">
            {/* MAP */}
            <View className="flex-1 mt-5">
                <Maps
                    ref={mapRef}
                    providers={providers}
                    selectedProvider={providers[selectedIndex]}
                />
            </View>

            {/* FLOATING CARDS */}
            <MechanicCard
                providers={providers}
                onScrollEnd={onScrollEnd}
                bottomOffset={20}
            />
        </SafeAreaView>
    );
};

export default GetHelp;