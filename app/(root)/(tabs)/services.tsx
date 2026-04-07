import React, { useCallback, useState, useEffect, useRef } from "react";
import {
    View, Text, ScrollView, TouchableOpacity,
    ActivityIndicator, Image, RefreshControl,
 Platform, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@clerk/clerk-expo";
import { useFocusEffect, useRouter } from "expo-router";
import { fetchAPI } from "@/lib/fetch";
import * as Location from "expo-location";

type Booking = {
    id: number;
    status: string;
    created_at: string;
    base_price: number;
    distance_km: number;
    duration_min: number;
    user_address: string;
    user_lat?: number;      // ← add
    user_lng?: number;      // ← add
    provider_name?: string;
    provider_phone?: string;
    provider_image?: string;
    service_type?: string;
    user_name?: string;
    user_phone?: string;
};

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
    pending:   { bg: "#fef9c3", text: "#854d0e", label: "⏳ Pending" },
    accepted:  { bg: "#dcfce7", text: "#14532d", label: "✅ Accepted" },
    rejected:  { bg: "#fee2e2", text: "#7f1d1d", label: "❌ Rejected" },
    completed: { bg: "#eff6ff", text: "#1e3a8a", label: "🏁 Completed" },
};

export default function ServicesScreen() {
    const { user } = useUser();
    const router = useRouter();
    const [isProvider, setIsProvider] = useState(false);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [updatingId, setUpdatingId] = useState<number | null>(null);
    const locationIntervalRef = useRef<any>(null);

    useFocusEffect(
        useCallback(() => {
            void loadData();
        }, [user?.id])
    );

    // Cleanup interval on unmount
    useEffect(() => {
        return () => clearInterval(locationIntervalRef.current);
    }, []);

    // Provider location sharing — runs when bookings change
    useEffect(() => {
        if (!isProvider) return;

        const acceptedBooking = bookings.find(b => b.status === "accepted");
        if (!acceptedBooking) {
            clearInterval(locationIntervalRef.current);
            return;
        }

        const sendLocation = async () => {
            try {
                const { status } = await Location.getForegroundPermissionsAsync();
                if (status !== "granted") return;
                const loc = await Location.getCurrentPositionAsync({});
                await fetchAPI(`/bookings/${acceptedBooking.id}/location`, {
                    method: "PATCH",
                    body: JSON.stringify({
                        lat: loc.coords.latitude,
                        lng: loc.coords.longitude,
                    }),
                });
                console.log("📍 Provider location sent");
            } catch (e) {
                console.log("Location send error:", e);
            }
        };

        // Send immediately then every 3 minutes
        void sendLocation();
        clearInterval(locationIntervalRef.current);
        locationIntervalRef.current = setInterval(sendLocation, 3 * 60 * 1000);

        return () => clearInterval(locationIntervalRef.current);
    }, [isProvider, bookings]);

    const loadData = async (isRefresh = false) => {
        if (!user?.id) return;
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const providerData = await fetchAPI<any>(`/providers/by-clerk/${user.id}`);
            const isProviderUser = providerData.status === "verified" || providerData.status === "registered";
            setIsProvider(isProviderUser);

            const path = isProviderUser
                ? `/bookings/provider/${user.id}`
                : `/bookings/user/${user.id}`;
            const data = await fetchAPI<Booking[]>(path);
            setBookings(data);
        } catch (e) {
            console.error("[Services] Error:", e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleStatusUpdate = async (bookingId: number, status: "accepted" | "rejected" | "completed") => {
        setUpdatingId(bookingId);
        try {
            await fetchAPI(`/bookings/${bookingId}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status }),
            });
            await loadData();
        } catch (e) {
            console.error("[Services] Status update error:", e);
        } finally {
            setUpdatingId(null);
        }
    };

    const activeBookings = bookings.filter(b => ["pending", "accepted"].includes(b.status));
    const pastBookings = bookings.filter(b => ["rejected", "completed"].includes(b.status));

    const BookingCard = ({ booking }: { booking: Booking }) => {
        const statusStyle = STATUS_COLORS[booking.status] ?? STATUS_COLORS.pending;
        const isUpdating = updatingId === booking.id;
        const isTrackable = !isProvider && booking.status === "accepted";

        const handleCardPress = () => {
            if (isTrackable) {
                router.push({
                    pathname: "/(root)/tracking",
                    params: { booking: JSON.stringify(booking) },
                });
            }
        };

        return (
            <TouchableOpacity
                onPress={handleCardPress}
                activeOpacity={isTrackable ? 0.7 : 1}
                className="bg-white rounded-2xl p-4 mb-3 border border-gray-100"
                style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 }}
            >
                {/* Tap hint for accepted bookings */}
                {isTrackable && (
                    <View className="bg-blue-50 rounded-xl px-3 py-1.5 mb-3 flex-row items-center">
                        <Text className="text-xs text-blue-600 font-semibold">📍 Tap to track provider location</Text>
                    </View>
                )}

                {/* Header */}
                <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center flex-1">
                        {(booking.provider_image || booking.user_name) && (
                            <Image
                                source={{ uri: booking.provider_image ?? `https://randomuser.me/api/portraits/men/1.jpg` }}
                                style={{ width: 42, height: 42, borderRadius: 21, marginRight: 10 }}
                            />
                        )}
                        <View className="flex-1">
                            <Text className="text-sm font-extrabold text-gray-900">
                                {isProvider ? booking.user_name : booking.provider_name}
                            </Text>
                            <Text className="text-xs text-gray-400 mt-0.5">
                                {isProvider ? booking.user_phone : booking.service_type}
                            </Text>
                        </View>
                    </View>
                    <View style={{ backgroundColor: statusStyle.bg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
                        <Text style={{ color: statusStyle.text, fontSize: 11, fontWeight: "700" }}>
                            {statusStyle.label}
                        </Text>
                    </View>
                </View>

                {/* Details */}
                <View className="bg-slate-50 rounded-xl p-3 flex-row justify-around mb-3">
                    <View className="items-center">
                        <Text className="text-base font-extrabold text-blue-600">₹{booking.base_price}</Text>
                        <Text className="text-xs text-gray-400">Price</Text>
                    </View>
                    <View className="w-px bg-slate-200" />
                    <View className="items-center">
                        <Text className="text-base font-extrabold text-gray-800">{booking.distance_km} km</Text>
                        <Text className="text-xs text-gray-400">Distance</Text>
                    </View>
                    <View className="w-px bg-slate-200" />
                    <View className="items-center">
                        <Text className="text-base font-extrabold text-gray-800">{booking.duration_min} min</Text>
                        <Text className="text-xs text-gray-400">ETA</Text>
                    </View>
                </View>

                {/* Address */}
                <View className="flex-row items-center mb-3">
                    <Text className="text-base mr-2">📍</Text>
                    <Text className="text-xs text-gray-500 flex-1" numberOfLines={2}>{booking.user_address}</Text>
                </View>

                {/* Provider action buttons */}
                {isProvider && booking.status === "pending" && (
                    <View className="flex-row gap-2">
                        <TouchableOpacity
                            onPress={() => handleStatusUpdate(booking.id, "accepted")}
                            disabled={isUpdating}
                            className="flex-1 bg-green-500 rounded-xl py-3 items-center"
                            activeOpacity={0.85}
                        >
                            {isUpdating
                                ? <ActivityIndicator color="#fff" size="small" />
                                : <Text className="text-white font-bold text-sm">✅ Accept</Text>
                            }
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => handleStatusUpdate(booking.id, "rejected")}
                            disabled={isUpdating}
                            className="flex-1 bg-red-500 rounded-xl py-3 items-center"
                            activeOpacity={0.85}
                        >
                            {isUpdating
                                ? <ActivityIndicator color="#fff" size="small" />
                                : <Text className="text-white font-bold text-sm">❌ Reject</Text>
                            }
                        </TouchableOpacity>
                    </View>
                )}

                {/* Provider accepted — Navigate + Complete buttons */}
                {isProvider && booking.status === "accepted" && (
                    <View className="gap-2">
                        <TouchableOpacity
                            onPress={() => {
                                const lat = booking.user_lat ?? 12.9716;
                                const lng = booking.user_lng ?? 77.5946;
                                const url = Platform.OS === "ios"
                                    ? `maps://?daddr=${lat},${lng}`
                                    : `google.navigation:q=${lat},${lng}`;
                                Linking.openURL(url).catch(() => {
                                    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
                                });
                            }}
                            className="bg-green-500 rounded-xl py-3 items-center"
                            activeOpacity={0.85}
                        >
                            <Text className="text-white font-bold text-sm">🗺️ Navigate to User</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => handleStatusUpdate(booking.id, "completed")}
                            disabled={isUpdating}
                            className="bg-blue-600 rounded-xl py-3 items-center"
                            activeOpacity={0.85}
                        >
                            {isUpdating
                                ? <ActivityIndicator color="#fff" size="small" />
                                : <Text className="text-white font-bold text-sm">🏁 Mark as Completed</Text>
                            }
                        </TouchableOpacity>
                    </View>
                )}

                {/* Date */}
                <Text className="text-xs text-gray-300 mt-2">
                    {new Date(booking.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                    })}
                </Text>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
                <ActivityIndicator size="large" color="#1d4ed8" />
                <Text className="text-gray-400 text-sm mt-3">Loading services…</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <ScrollView
                className="px-5"
                contentContainerStyle={{ paddingBottom: 120 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} colors={["#1d4ed8"]} />
                }
            >
                <View className="mt-5 mb-6">
                    <Text className="text-2xl font-extrabold text-gray-900">
                        {isProvider ? "Service Requests" : "My Bookings"}
                    </Text>
                    <Text className="text-xs text-gray-400 mt-1">
                        {isProvider ? "Manage incoming requests" : "Track your service history"}
                    </Text>
                </View>

                {bookings.length === 0 ? (
                    <View className="items-center justify-center mt-20">
                        <Text style={{ fontSize: 48 }}>📋</Text>
                        <Text className="text-lg font-bold text-gray-700 mt-4">No services yet</Text>
                        <Text className="text-sm text-gray-400 mt-1 text-center">
                            {isProvider ? "New booking requests will appear here" : "Your bookings will appear here"}
                        </Text>
                    </View>
                ) : (
                    <>
                        {activeBookings.length > 0 && (
                            <View className="mb-6">
                                <Text className="text-sm font-extrabold text-gray-700 uppercase tracking-widest mb-3">
                                    {isProvider ? "🔔 New & Active" : "🔄 Active"}
                                </Text>
                                {activeBookings.map(b => <BookingCard key={b.id} booking={b} />)}
                            </View>
                        )}
                        {pastBookings.length > 0 && (
                            <View>
                                <Text className="text-sm font-extrabold text-gray-700 uppercase tracking-widest mb-3">
                                    📁 History
                                </Text>
                                {pastBookings.map(b => <BookingCard key={b.id} booking={b} />)}
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}