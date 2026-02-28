import React from "react";
import {
    View,
    Text,
    Image,
    ScrollView,
    TouchableOpacity,

} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function ProviderDetails() {
    const { provider } = useLocalSearchParams();
    const router = useRouter();
    const item = JSON.parse(provider as string);

    const isBusy = item.availability !== "available";

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

                {/* HEADER BANNER */}
                <View style={{
                    backgroundColor: "#1d4ed8",
                    paddingTop: 20,
                    paddingBottom: 40,
                    paddingHorizontal: 20,
                }}>
                    {/* Back button */}
                    <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 16 }}>
                        <Text style={{ color: "#93c5fd", fontSize: 15, fontWeight: "600" }}>← Back</Text>
                    </TouchableOpacity>

                    <View className="flex-row items-center">
                        <View style={{ position: "relative", marginRight: 16 }}>
                            <Image
                                source={{ uri: item.image }}
                                style={{
                                    width: 80, height: 80, borderRadius: 40,
                                    borderWidth: 3, borderColor: "#fff",
                                }}
                            />
                            {item.verified && (
                                <View style={{
                                    position: "absolute", bottom: 2, right: 2,
                                    backgroundColor: "#2563eb",
                                    borderRadius: 999, width: 22, height: 22,
                                    alignItems: "center", justifyContent: "center",
                                    borderWidth: 2, borderColor: "#fff",
                                }}>
                                    <Text style={{ color: "#fff", fontSize: 11, fontWeight: "800" }}>✓</Text>
                                </View>
                            )}
                        </View>

                        <View style={{ flex: 1 }}>
                            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "800" }}>{item.name}</Text>
                            <Text style={{ color: "#bfdbfe", fontSize: 13, marginTop: 2, textTransform: "capitalize" }}>
                                {item.type}
                            </Text>
                            <View className="flex-row items-center mt-2">
                                <Text style={{ color: "#fbbf24", fontSize: 13 }}>⭐ {item.rating}</Text>
                                <Text style={{ color: "#bfdbfe", fontSize: 12, marginLeft: 6 }}>
                                    ({item.totalReviews} reviews)
                                </Text>
                            </View>
                        </View>

                        {/* Availability */}
                        <View style={{
                            backgroundColor: isBusy ? "#fca5a5" : "#86efac",
                            borderRadius: 999,
                            paddingHorizontal: 12,
                            paddingVertical: 4,
                            alignSelf: "flex-start",
                        }}>
                            <Text style={{ fontSize: 12, fontWeight: "700", color: isBusy ? "#7f1d1d" : "#14532d" }}>
                                {isBusy ? "● Busy" : "● Available"}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* CARD PULLED UP OVER BANNER */}
                <View style={{
                    marginTop: -24,
                    marginHorizontal: 16,
                    backgroundColor: "#fff",
                    borderRadius: 20,
                    padding: 20,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    elevation: 5,
                }}>
                    {/* Stats row */}
                    <View className="flex-row justify-around">
                        {[
                            { label: "Experience", value: `${item.experienceYears} yrs` },
                            { label: "Base Price", value: `₹${item.basePrice}` },
                            { label: "Reviews", value: item.totalReviews },
                        ].map((stat) => (
                            <View key={stat.label} className="items-center">
                                <Text style={{ fontSize: 18, fontWeight: "800", color: "#1d4ed8" }}>{stat.value}</Text>
                                <Text style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{stat.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* ABOUT SECTION */}
                <View style={{ marginHorizontal: 16, marginTop: 20 }}>
                    <Text style={{ fontSize: 16, fontWeight: "700", color: "#111", marginBottom: 8 }}>About</Text>
                    <Text style={{ fontSize: 14, color: "#4b5563", lineHeight: 22 }}>{item.description}</Text>
                </View>

                {/* CONTACT SECTION */}
                <View style={{
                    marginHorizontal: 16, marginTop: 20,
                    backgroundColor: "#fff",
                    borderRadius: 16, padding: 16,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.07,
                    shadowRadius: 8,
                    elevation: 3,
                }}>
                    <Text style={{ fontSize: 16, fontWeight: "700", color: "#111", marginBottom: 12 }}>Contact Info</Text>

                    {[
                        { icon: "📞", label: "Phone", value: item.phone },
                        { icon: "✉️", label: "Email", value: item.email },
                        { icon: "📍", label: "Address", value: item.address },
                    ].map((row) => (
                        <View key={row.label} className="flex-row items-start" style={{ marginBottom: 12 }}>
                            <Text style={{ fontSize: 18, marginRight: 12 }}>{row.icon}</Text>
                            <View>
                                <Text style={{ fontSize: 11, color: "#9ca3af", fontWeight: "600" }}>{row.label}</Text>
                                <Text style={{ fontSize: 14, color: "#374151", marginTop: 1 }}>{row.value}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* LOCATION SECTION */}
                <View style={{ marginHorizontal: 16, marginTop: 20 }}>
                    <Text style={{ fontSize: 16, fontWeight: "700", color: "#111", marginBottom: 8 }}>Location</Text>
                    <View style={{
                        backgroundColor: "#eff6ff",
                        borderRadius: 12, padding: 14,
                        flexDirection: "row",
                        alignItems: "center",
                    }}>
                        <Text style={{ fontSize: 22, marginRight: 10 }}>🗺️</Text>
                        <View>
                            <Text style={{ fontSize: 13, color: "#1d4ed8", fontWeight: "600" }}>{item.address}</Text>
                            <Text style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
                                {item.latitude?.toFixed(4)}, {item.longitude?.toFixed(4)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* BOOK BUTTON */}
                {!isBusy && (
                    <View style={{ marginHorizontal: 16, marginTop: 28 }}>
                        <TouchableOpacity
                            onPress={() =>
                                router.push({
                                    pathname: "./booking",
                                    params: { provider: JSON.stringify(item) },
                                })
                            }
                            style={{
                                backgroundColor: "#1d4ed8",
                                borderRadius: 16,
                                paddingVertical: 16,
                                alignItems: "center",
                                shadowColor: "#1d4ed8",
                                shadowOffset: { width: 0, height: 6 },
                                shadowOpacity: 0.35,
                                shadowRadius: 12,
                                elevation: 8,
                            }}
                            activeOpacity={0.85}
                        >
                            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800", letterSpacing: 0.5 }}>
                                Book Now · ₹{item.basePrice}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {isBusy && (
                    <View style={{ marginHorizontal: 16, marginTop: 28 }}>
                        <View style={{
                            backgroundColor: "#fef2f2",
                            borderRadius: 16,
                            paddingVertical: 16,
                            alignItems: "center",
                            borderWidth: 1,
                            borderColor: "#fecaca",
                        }}>
                            <Text style={{ color: "#dc2626", fontSize: 15, fontWeight: "700" }}>
                                Currently Unavailable
                            </Text>
                            <Text style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>
                                This provider is busy right now
                            </Text>
                        </View>
                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    );
}