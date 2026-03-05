import React from "react";
import { View, Text, TouchableOpacity, Linking, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";

export default function VerifyProvider() {
    const router = useRouter();
    const { user } = useUser();

    const email = "verify@roadassist.com";
    const subject = `Verification Request - ${user?.firstName} ${user?.lastName}`;
    const body = `Hi RoadAssist Team,\n\nI would like to request verification for my provider profile.\n\nName: ${user?.firstName} ${user?.lastName}\nEmail: ${user?.primaryEmailAddress?.emailAddress}\nClerk ID: ${user?.id}\n\nPlease verify my account.\n\nThank you.`;

    const openEmail = () => {
        Linking.openURL(
            `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
        );
    };

    const openWhatsApp = () => {
        const phone = "919876543210"; // replace with your support number
        const message = `Hi RoadAssist, I'd like to verify my provider account.\nName: ${user?.firstName} ${user?.lastName}\nEmail: ${user?.primaryEmailAddress?.emailAddress}\nClerk ID: ${user?.id}`;
        Linking.openURL(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`);
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <ScrollView
                className="px-5"
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {/* HEADER */}
                <View className="flex-row items-center mt-4 mb-8">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <Text className="text-blue-600 font-semibold text-base">← Back</Text>
                    </TouchableOpacity>
                    <Text className="text-xl font-extrabold text-gray-900">
                        Get Verified
                    </Text>
                </View>

                {/* HERO */}
                <View className="bg-blue-600 rounded-3xl p-7 mb-6 items-center"
                      style={{ shadowColor: "#2563eb", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 }}>
                    <Text style={{ fontSize: 52 }}>🛡️</Text>
                    <Text className="text-2xl font-extrabold text-white mt-4 text-center tracking-tight">
                        Become a Verified Provider
                    </Text>
                    <Text className="text-blue-100 text-sm mt-2 text-center leading-5">
                        Verified providers get a trust badge, appear higher in search results, and receive more bookings.
                    </Text>
                </View>

                {/* BENEFITS */}
                <Text className="text-base font-bold text-gray-900 mb-4">
                    Why get verified?
                </Text>
                <View className="bg-white rounded-2xl px-5 py-4 mb-6 border border-gray-100"
                      style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 }}>
                    {[
                        { icon: "✅", title: "Trust Badge", desc: "Blue verified checkmark on your profile" },
                        { icon: "📈", title: "More Visibility", desc: "Appear higher in customer search results" },
                        { icon: "💰", title: "More Bookings", desc: "Customers prefer verified providers" },
                        { icon: "🔒", title: "Secure Profile", desc: "Confirm your identity and credentials" },
                    ].map((item) => (
                        <View key={item.title} className="flex-row items-center mb-4 last:mb-0">
                            <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center mr-4">
                                <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-sm font-bold text-gray-900">{item.title}</Text>
                                <Text className="text-xs text-gray-400 mt-0.5">{item.desc}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* CONTACT OPTIONS */}
                <Text className="text-base font-bold text-gray-900 mb-4">
                    Contact RoadAssist
                </Text>

                <TouchableOpacity
                    onPress={openEmail}
                    className="bg-white rounded-2xl px-5 py-4 flex-row items-center mb-3 border border-gray-100"
                    style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 }}
                    activeOpacity={0.8}
                >
                    <View className="w-12 h-12 rounded-2xl bg-blue-50 items-center justify-center mr-4">
                        <Text style={{ fontSize: 22 }}>✉️</Text>
                    </View>
                    <View className="flex-1">
                        <Text className="text-sm font-bold text-gray-900">Send Email</Text>
                        <Text className="text-xs text-gray-400 mt-0.5">verify@roadassist.com</Text>
                    </View>
                    <Text className="text-gray-300 text-lg">→</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={openWhatsApp}
                    className="bg-white rounded-2xl px-5 py-4 flex-row items-center mb-6 border border-gray-100"
                    style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 }}
                    activeOpacity={0.8}
                >
                    <View className="w-12 h-12 rounded-2xl bg-green-50 items-center justify-center mr-4">
                        <Text style={{ fontSize: 22 }}>💬</Text>
                    </View>
                    <View className="flex-1">
                        <Text className="text-sm font-bold text-gray-900">WhatsApp</Text>
                        <Text className="text-xs text-gray-400 mt-0.5">Chat with our support team</Text>
                    </View>
                    <Text className="text-gray-300 text-lg">→</Text>
                </TouchableOpacity>

                {/* YOUR INFO */}
                <View className="bg-slate-100 rounded-2xl px-5 py-4 border border-slate-200">
                    <Text className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                        Your Details (auto-filled)
                    </Text>
                    {[
                        { label: "Name", value: `${user?.firstName} ${user?.lastName}` },
                        { label: "Email", value: user?.primaryEmailAddress?.emailAddress ?? "" },
                        { label: "Clerk ID", value: user?.id ?? "" },
                    ].map((row) => (
                        <View key={row.label} className="mb-2">
                            <Text className="text-xs text-gray-400">{row.label}</Text>
                            <Text className="text-sm text-gray-700 font-medium" numberOfLines={1}>{row.value}</Text>
                        </View>
                    ))}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}