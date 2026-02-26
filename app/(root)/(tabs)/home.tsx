import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    FlatList,
    ActivityIndicator,
    Dimensions,
} from "react-native";

import MapView from "react-native-maps";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { SafeAreaView } from "react-native-safe-area-context";

import Maps from "@/components/Maps";
import MechanicCard from "@/components/MechanicCard";
import { icons, images } from "@/constants";
import GoogleTextInput from "@/components/GoogleTextInput";
import { mockProviders, Provider } from "@/constants/providers";

const { width } = Dimensions.get("window");
const CARD_WIDTH = 200;

const Home = () => {
    const tabBarHeight = useBottomTabBarHeight();
    const mapRef = useRef<MapView>(null);
    const flatListRef = useRef<FlatList>(null);

    const [providers, setProviders] = useState<Provider[]>([]);
    const [loadingProviders, setLoadingProviders] = useState(true);
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        setTimeout(() => {
            setProviders(mockProviders);
            setLoadingProviders(false);
        }, 800);
    }, []);

    /* ======================
       SCROLL SYNC FUNCTION
    ====================== */

    const onScrollEnd = (event: any) => {
        const index = Math.round(
            event.nativeEvent.contentOffset.x / CARD_WIDTH
        );

        setSelectedIndex(index);

        const provider = providers[index];

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
        <SafeAreaView className="flex-1 bg-general-500">
            {/* HEADER */}
            <View className="px-5 pt-5">
                <View className="flex-row items-center justify-between mb-5">
                    <Text className="text-2xl font-JakartaExtraBold">
                        Welcome 👋
                    </Text>

                    <TouchableOpacity className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm">
                        <Image source={icons.out} className="w-4 h-4" />
                    </TouchableOpacity>
                </View>

                <GoogleTextInput
                    icon={icons.search}
                    containerStyle="bg-white shadow-md rounded-xl"
                    handlePress={() => {}}
                />
            </View>

            {/* MAP */}
            <View className="flex-1 mt-5">
                <Maps
                    ref={mapRef}
                    providers={providers}
                    selectedProvider={providers[selectedIndex]}
                />
            </View>

            {/* FLOATING CARDS */}
            <View
                style={{
                    position: "absolute",
                    bottom: tabBarHeight + 15,
                }}
                className="w-full"
            >
                {loadingProviders ? (
                    <ActivityIndicator />
                ) : providers.length === 0 ? (
                    <View className="items-center bg-white/90 mx-5 py-6 rounded-2xl">
                        <Image
                            source={images.noResult}
                            className="w-24 h-24"
                            resizeMode="contain"
                        />
                        <Text className="text-gray-500 mt-2">
                            No nearby services found
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={providers}
                        horizontal
                        snapToInterval={CARD_WIDTH}
                        decelerationRate="fast"
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.id}
                        onMomentumScrollEnd={onScrollEnd}
                        contentContainerStyle={{
                            paddingHorizontal: (width - CARD_WIDTH) / 2,
                        }}
                        renderItem={({ item, index }) => (
                            <View style={{ width: CARD_WIDTH }}>
                                <MechanicCard
                                    name={item.name}
                                    type={item.type}
                                    isSelected={index === selectedIndex}
                                    onPress={() => {
                                        flatListRef.current?.scrollToIndex({
                                            index,
                                            animated: true,
                                        });
                                    }}
                                />
                            </View>
                        )}
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

export default Home;