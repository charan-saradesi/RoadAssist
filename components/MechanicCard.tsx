import React, { useRef, useState } from "react";
import {
    View,
    Text,
    Animated,
    Image,
    Dimensions,
    TouchableOpacity,
    FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { Provider } from "@/constants/providers";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.78;
const SPACING = 12;
const INACTIVE_SCALE_X = 0.72;
const INACTIVE_SCALE_Y = 0.85;

export default function MechanicCard({
                                         providers,
                                         onScrollEnd,
                                         bottomOffset = 20,
                                     }: {
    providers: Provider[];
    onScrollEnd?: (event: any) => void;
    bottomOffset?: number;
}) {
    const scrollX = useRef(new Animated.Value(0)).current;
    const flatListRef = useRef<FlatList>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const router = useRouter();

    if (!providers || providers.length === 0) return null;

    const scrollToIndex = (index: number) => {
        if (index < 0 || index >= providers.length) return;
        flatListRef.current?.scrollToIndex({ index, animated: true });
        setActiveIndex(index);
    };

    const handleScrollEnd = (event: any) => {
        const newIndex = Math.round(
            event.nativeEvent.contentOffset.x / (CARD_WIDTH + SPACING)
        );
        setActiveIndex(newIndex);
        onScrollEnd?.(event);
    };

    const prevProvider = activeIndex > 0 ? providers[activeIndex - 1] : null;
    const nextProvider = activeIndex < providers.length - 1 ? providers[activeIndex + 1] : null;

    return (
        <View className="absolute w-full" style={{ bottom: bottomOffset }}>
            <View className="flex-row items-center justify-between px-1">

                {/* LEFT PEEK BUTTON */}
                <TouchableOpacity
                    onPress={() => scrollToIndex(activeIndex - 1)}
                    disabled={!prevProvider}
                    style={{ opacity: prevProvider ? 1 : 0 }}
                    activeOpacity={0.7}
                >
                    <View style={{
                        backgroundColor: "rgba(255,255,255,0.85)",
                        borderRadius: 999,
                        padding: 3,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.15,
                        shadowRadius: 6,
                        elevation: 4,
                    }}>
                        {prevProvider && (
                            <Image
                                source={{ uri: prevProvider.image }}
                                style={{ width: 36, height: 36, borderRadius: 18 }}
                            />
                        )}
                        <View style={{
                            position: "absolute",
                            top: 0, left: 0, right: 0, bottom: 0,
                            borderRadius: 999,
                            backgroundColor: "rgba(0,0,0,0.22)",
                            alignItems: "center",
                            justifyContent: "center",
                        }}>
                            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700", marginLeft: -2 }}>‹</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                {/* CARDS LIST */}
                <Animated.FlatList
                    ref={flatListRef}
                    data={providers}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    snapToInterval={CARD_WIDTH + SPACING}
                    decelerationRate="fast"
                    contentContainerStyle={{ paddingHorizontal: 4 }}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                        { useNativeDriver: true }
                    )}
                    scrollEventThrottle={16}
                    onMomentumScrollEnd={handleScrollEnd}
                    renderItem={({ item, index }) => {
                        const inputRange = [
                            (index - 1) * (CARD_WIDTH + SPACING),
                            index * (CARD_WIDTH + SPACING),
                            (index + 1) * (CARD_WIDTH + SPACING),
                        ];

                        const scaleX = scrollX.interpolate({ inputRange, outputRange: [INACTIVE_SCALE_X, 1, INACTIVE_SCALE_X], extrapolate: "clamp" });
                        const scaleY = scrollX.interpolate({ inputRange, outputRange: [INACTIVE_SCALE_Y, 1, INACTIVE_SCALE_Y], extrapolate: "clamp" });
                        const cardOpacity = scrollX.interpolate({ inputRange, outputRange: [0.35, 1, 0.35], extrapolate: "clamp" });
                        const translateY = scrollX.interpolate({ inputRange, outputRange: [14, 0, 14], extrapolate: "clamp" });
                        const detailOpacity = scrollX.interpolate({ inputRange, outputRange: [0, 1, 0], extrapolate: "clamp" });

                        const isBusy = item.availability !== "available";

                        return (
                            <Animated.View style={{
                                width: CARD_WIDTH,
                                marginRight: SPACING,
                                opacity: cardOpacity,
                                transform: [{ scaleX }, { scaleY }, { translateY }],
                                backgroundColor: "#fff",
                                borderRadius: 24,
                                padding: 14,
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 6 },
                                shadowOpacity: 0.13,
                                shadowRadius: 14,
                                elevation: 7,
                                overflow: "hidden",
                            }}>

                                {/* TOP ROW */}
                                <View className="flex-row items-center">
                                    <View style={{ position: "relative", marginRight: 12 }}>
                                        <Image
                                            source={{ uri: item.image }}
                                            style={{ width: 52, height: 52, borderRadius: 26 }}
                                        />
                                        {item.verified && (
                                            <View style={{
                                                position: "absolute",
                                                bottom: 0, right: 0,
                                                backgroundColor: "#2563eb",
                                                borderRadius: 999,
                                                width: 16, height: 16,
                                                alignItems: "center",
                                                justifyContent: "center",
                                                borderWidth: 1.5,
                                                borderColor: "#fff",
                                            }}>
                                                <Text style={{ color: "#fff", fontSize: 9, fontWeight: "800" }}>✓</Text>
                                            </View>
                                        )}
                                    </View>

                                    <View style={{ flex: 1 }}>
                                        <View className="flex-row items-center justify-between">
                                            <Text style={{ fontSize: 15, fontWeight: "700", color: "#111", flex: 1 }} numberOfLines={1}>
                                                {item.name}
                                            </Text>
                                            <View style={{
                                                backgroundColor: isBusy ? "#fee2e2" : "#dcfce7",
                                                borderRadius: 999,
                                                paddingHorizontal: 8,
                                                paddingVertical: 2,
                                                marginLeft: 6,
                                            }}>
                                                <Text style={{ fontSize: 10, fontWeight: "600", color: isBusy ? "#dc2626" : "#16a34a" }}>
                                                    {isBusy ? "● Busy" : "● Available"}
                                                </Text>
                                            </View>
                                        </View>

                                        <View className="flex-row items-center mt-0.5">
                                            <Text style={{ fontSize: 12, color: "#f59e0b" }}>⭐ {item.rating}</Text>
                                            <Text style={{ fontSize: 11, color: "#9ca3af", marginLeft: 4 }}>({item.totalReviews} reviews)</Text>
                                            <Text style={{ fontSize: 11, color: "#9ca3af", marginLeft: 6 }}>· {item.experienceYears}yr exp</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* ANIMATED DETAILS */}
                                <Animated.View style={{ opacity: detailOpacity }}>

                                    {/* Description - big */}
                                    <Text style={{
                                        fontSize: 13,
                                        color: "#374151",
                                        marginTop: 10,
                                        lineHeight: 19,
                                        fontWeight: "400",
                                    }} numberOfLines={3}>
                                        {item.description}
                                    </Text>

                                    {/* Bottom row: View More Info + Book Now (if available) */}
                                    <View className="flex-row items-center justify-between mt-3">
                                        <TouchableOpacity
                                            onPress={() =>
                                                router.push({
                                                    pathname: "../(root)/ProviderDetails",
                                                    params: { provider: JSON.stringify(item) },
                                                })
                                            }
                                            activeOpacity={0.7}
                                        >
                                            <Text style={{ fontSize: 13, color: "#2563eb", fontWeight: "600" }}>
                                                View More Info →
                                            </Text>
                                        </TouchableOpacity>

                                        {!isBusy && (
                                            <TouchableOpacity
                                                onPress={() => console.log("Book", item.name)}
                                                style={{
                                                    backgroundColor: "#2563eb",
                                                    paddingHorizontal: 20,
                                                    paddingVertical: 9,
                                                    borderRadius: 14,
                                                }}
                                                activeOpacity={0.8}
                                            >
                                                <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>Book Now</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </Animated.View>
                            </Animated.View>
                        );
                    }}
                />

                {/* RIGHT PEEK BUTTON */}
                <TouchableOpacity
                    onPress={() => scrollToIndex(activeIndex + 1)}
                    disabled={!nextProvider}
                    style={{ opacity: nextProvider ? 1 : 0 }}
                    activeOpacity={0.7}
                >
                    <View style={{
                        backgroundColor: "rgba(255,255,255,0.85)",
                        borderRadius: 999,
                        padding: 3,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.15,
                        shadowRadius: 6,
                        elevation: 4,
                    }}>
                        {nextProvider && (
                            <Image
                                source={{ uri: nextProvider.image }}
                                style={{ width: 36, height: 36, borderRadius: 18 }}
                            />
                        )}
                        <View style={{
                            position: "absolute",
                            top: 0, left: 0, right: 0, bottom: 0,
                            borderRadius: 999,
                            backgroundColor: "rgba(0,0,0,0.22)",
                            alignItems: "center",
                            justifyContent: "center",
                        }}>
                            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700", marginRight: -2 }}>›</Text>
                        </View>
                    </View>
                </TouchableOpacity>

            </View>
        </View>
    );
}