import React, { useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";

const Home = () => {
    const router = useRouter();
    const { user } = useUser();
    const scaleGetHelp = useRef(new Animated.Value(1)).current;
    const scaleMechanic = useRef(new Animated.Value(1)).current;
    const scaleTowing = useRef(new Animated.Value(1)).current;

    const firstName = user?.firstName ?? "there";

    const animatePress = (scale: Animated.Value, cb: () => void) => {
        Animated.sequence([
            Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, speed: 30 }),
            Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }),
        ]).start(cb);
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 118 }} // 78 tabbar + 20 margin + 20 extra
            >
                {/* ── HEADER ── */}
                <View className="px-6 pt-5 pb-2">
                    <Text className="text-xs font-bold text-blue-600 tracking-widest uppercase mb-1">
                        RoadAssist
                    </Text>
                    <Text className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        Hello, {firstName} 👋
                    </Text>
                    <Text className="text-sm text-gray-400 mt-1">
                        What do you need help with?
                    </Text>
                </View>

                {/* ── EMERGENCY BANNER ── */}
                <View className="px-6 mt-6">
                    <Animated.View style={{ transform: [{ scale: scaleGetHelp }] }}>
                        <TouchableOpacity
                            activeOpacity={1}
                            onPress={() => animatePress(scaleGetHelp, () => router.push("/(root)/getHelp"))}
                            className="rounded-3xl overflow-hidden bg-blue-600"
                            style={{
                                shadowColor: "#2563eb",
                                shadowOffset: { width: 0, height: 12 },
                                shadowOpacity: 0.35,
                                shadowRadius: 20,
                                elevation: 12,
                            }}
                        >
                            {/* Decorative circles */}
                            <View style={{
                                position: "absolute", top: -30, right: -30,
                                width: 160, height: 160, borderRadius: 80,
                                backgroundColor: "rgba(255,255,255,0.08)",
                            }} />
                            <View style={{
                                position: "absolute", bottom: -20, right: 60,
                                width: 100, height: 100, borderRadius: 50,
                                backgroundColor: "rgba(255,255,255,0.05)",
                            }} />

                            <View className="p-7">
                                <View className="w-14 h-14 rounded-2xl items-center justify-center mb-4"
                                      style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
                                    <Text style={{ fontSize: 28 }}>🚨</Text>
                                </View>

                                <Text className="text-2xl font-extrabold text-white tracking-tight">
                                    Get Help Now
                                </Text>
                                <Text className="text-sm mt-2 leading-5"
                                      style={{ color: "rgba(255,255,255,0.8)" }}>
                                    Emergency roadside assistance — find the nearest available mechanic or towing service instantly.
                                </Text>

                                <View className="flex-row items-center mt-5 self-start rounded-xl px-4 py-2.5"
                                      style={{ backgroundColor: "rgba(255,255,255,0.18)" }}>
                                    <Text className="text-white font-bold text-sm">Find Nearby Help</Text>
                                    <Text className="text-white text-base ml-2">→</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                </View>

                {/* ── SECTION TITLE ── */}
                <View className="px-6 mt-8 mb-4">
                    <Text className="text-lg font-bold text-gray-900 tracking-tight">
                        Book a Service
                    </Text>
                    <Text className="text-xs text-gray-400 mt-1">
                        Schedule assistance in advance
                    </Text>
                </View>

                {/* ── SERVICE CARDS ── */}
                <View className="flex-row px-6 gap-3">

                    {/* MECHANIC */}
                    <Animated.View style={{ flex: 1, transform: [{ scale: scaleMechanic }] }}>
                        <TouchableOpacity
                            activeOpacity={1}
                            onPress={() => animatePress(scaleMechanic, () =>
                                router.push({ pathname: "/(root)/getHelp", params: { filter: "mechanic" } })
                            )}
                            className="bg-white rounded-2xl p-5 border border-gray-100"
                            style={{
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.08,
                                shadowRadius: 12,
                                elevation: 4,
                            }}
                        >
                            <View className="w-12 h-12 rounded-xl bg-blue-50 items-center justify-center mb-4 border border-blue-100">
                                <Text style={{ fontSize: 22 }}>🔧</Text>
                            </View>

                            <Text className="text-base font-bold text-gray-900">
                                Mechanic
                            </Text>
                            <Text className="text-xs text-gray-400 mt-1 leading-4">
                                Engine, brakes, AC & more
                            </Text>

                            <View className="flex-row items-center mt-4">
                                <View className="w-2 h-2 rounded-full bg-green-500 mr-1.5" />
                                <Text className="text-xs text-green-600 font-semibold">
                                    Available now
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* TOWING */}
                    <Animated.View style={{ flex: 1, transform: [{ scale: scaleTowing }] }}>
                        <TouchableOpacity
                            activeOpacity={1}
                            onPress={() => animatePress(scaleTowing, () =>
                                router.push({ pathname: "/(root)/getHelp", params: { filter: "towing" } })
                            )}
                            className="bg-white rounded-2xl p-5 border border-gray-100"
                            style={{
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.08,
                                shadowRadius: 12,
                                elevation: 4,
                            }}
                        >
                            <View className="w-12 h-12 rounded-xl bg-orange-50 items-center justify-center mb-4 border border-orange-100">
                                <Text style={{ fontSize: 22 }}>🚛</Text>
                            </View>

                            <Text className="text-base font-bold text-gray-900">
                                Towing
                            </Text>
                            <Text className="text-xs text-gray-400 mt-1 leading-4">
                                Flatbed & recovery trucks
                            </Text>

                            <View className="flex-row items-center mt-4">
                                <View className="w-2 h-2 rounded-full bg-green-500 mr-1.5" />
                                <Text className="text-xs text-green-600 font-semibold">
                                    Available now
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                </View>

                {/* ── HOW IT WORKS ── */}
                <View className="px-6 mt-8">
                    <Text className="text-lg font-bold text-gray-900 tracking-tight mb-5">
                        How it works
                    </Text>

                    {[
                        { step: "01", icon: "📍", title: "Share Location", desc: "We detect your position automatically" },
                        { step: "02", icon: "🔍", title: "Find Providers", desc: "Browse nearby mechanics and towers" },
                        { step: "03", icon: "✅", title: "Book & Relax", desc: "Confirm booking and track arrival" },
                    ].map((item, index) => (
                        <View
                            key={item.step}
                            className="flex-row items-start"
                            style={{ marginBottom: index < 2 ? 18 : 0 }}
                        >
                            <View className="w-10 h-10 rounded-xl bg-white items-center justify-center border border-gray-100 mr-4"
                                  style={{
                                      shadowColor: "#000",
                                      shadowOffset: { width: 0, height: 2 },
                                      shadowOpacity: 0.06,
                                      shadowRadius: 6,
                                      elevation: 2,
                                  }}>
                                <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                            </View>
                            <View className="flex-1 pt-0.5">
                                <View className="flex-row items-center">
                                    <Text className="text-xs font-extrabold text-blue-500 tracking-widest mr-2">
                                        {item.step}
                                    </Text>
                                    <Text className="text-sm font-bold text-gray-900">
                                        {item.title}
                                    </Text>
                                </View>
                                <Text className="text-xs text-gray-400 mt-0.5 leading-4">
                                    {item.desc}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* ── STATS BAR ── */}
                <View className="mx-6 mt-8 bg-white rounded-2xl p-5 flex-row justify-around border border-gray-100"
                      style={{
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.06,
                          shadowRadius: 12,
                          elevation: 3,
                      }}>
                    {[
                        { value: "25+", label: "Providers" },
                        { value: "4.6★", label: "Avg Rating" },
                        { value: "24/7", label: "Support" },
                    ].map((stat, i) => (
                        <View key={stat.label} className="items-center">
                            <Text className="text-xl font-extrabold text-blue-600 tracking-tight">
                                {stat.value}
                            </Text>
                            <Text className="text-xs text-gray-400 mt-1 font-medium">
                                {stat.label}
                            </Text>
                        </View>
                    ))}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

export default Home;