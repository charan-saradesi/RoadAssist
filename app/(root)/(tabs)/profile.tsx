import { useUser, useAuth } from "@clerk/clerk-expo";
import { Image, ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import InputField from "@/components/InputField";
import { fetchAPI } from "@/lib/fetch";
import { icons } from "@/constants";

type ProviderStatus = null | "loading" | "not_registered" | "registered" | "verified";

// ── Moved OUTSIDE Profile component ──
const ProviderSection = ({
                             status,
                             onRegister,
                             onVerify,
                         }: {
    status: ProviderStatus;
    onRegister: () => void;
    onVerify: () => void;
}) => {
    if (status === "loading" || status === null) {
        return (
            <View className="bg-white rounded-2xl px-5 py-4 border border-gray-100 items-center"
                  style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 }}>
                <ActivityIndicator color="#2563eb" />
            </View>
        );
    }

    if (status === "verified") {
        return (
            <View className="bg-green-50 rounded-2xl px-5 py-5 border border-green-100"
                  style={{ shadowColor: "#16a34a", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 3 }}>
                <View className="flex-row items-center">
                    <View className="w-12 h-12 rounded-2xl bg-green-100 items-center justify-center mr-4">
                        <Text style={{ fontSize: 22 }}>✅</Text>
                    </View>
                    <View className="flex-1">
                        <Text className="text-base font-extrabold text-green-800">
                            Verified Provider
                        </Text>
                        <Text className="text-xs text-green-600 mt-0.5">
                            Your profile is live and visible to customers
                        </Text>
                    </View>
                </View>
                <View className="mt-4 pt-4 border-t border-green-200 flex-row items-center">
                    <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                    <Text className="text-xs text-green-700 font-semibold">
                        Active on RoadAssist network
                    </Text>
                </View>
            </View>
        );
    }

    if (status === "registered") {
        return (
            <View className="bg-amber-50 rounded-2xl px-5 py-5 border border-amber-100"
                  style={{ shadowColor: "#f59e0b", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 3 }}>
                <View className="flex-row items-center mb-4">
                    <View className="w-12 h-12 rounded-2xl bg-amber-100 items-center justify-center mr-4">
                        <Text style={{ fontSize: 22 }}>⏳</Text>
                    </View>
                    <View className="flex-1">
                        <Text className="text-base font-extrabold text-amber-800">
                            Verification Pending
                        </Text>
                        <Text className="text-xs text-amber-600 mt-0.5">
                            Your provider profile is registered but not yet verified
                        </Text>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={onVerify}
                    className="bg-amber-500 rounded-xl py-3 items-center"
                    activeOpacity={0.85}
                    style={{ shadowColor: "#f59e0b", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }}
                >
                    <Text className="text-white font-bold text-sm">
                        Request Verification →
                    </Text>
                </TouchableOpacity>
            </View>
        );
    }

    // not_registered
    return (
        <TouchableOpacity
            onPress={onRegister}
            className="bg-blue-600 rounded-2xl px-5 py-5 flex-row items-center justify-between"
            style={{ shadowColor: "#2563eb", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 12, elevation: 6 }}
            activeOpacity={0.85}
        >
            <View className="flex-1">
                <Text className="text-white font-extrabold text-base">
                    Become a Service Provider
                </Text>
                <Text className="text-blue-100 text-xs mt-1">
                    Register as a mechanic or towing service
                </Text>
            </View>
            <Text style={{ fontSize: 22 }} className="ml-3">🔧</Text>
        </TouchableOpacity>
    );
};

// ── Main Profile component ──
const Profile = () => {
    const { user } = useUser();
    const { signOut } = useAuth();
    const router = useRouter();

    const [providerStatus, setProviderStatus] = useState<ProviderStatus>(null);

    useFocusEffect(
        useCallback(() => {
            void checkProviderStatus();
        }, [user?.id])
    );

    const checkProviderStatus = async () => {
        setProviderStatus("loading");
        try {
            const data = await fetchAPI<any>(`/providers/by-clerk/${user?.id}`);
            setProviderStatus(data.status); // "not_registered" | "registered" | "verified"
        } catch (e) {
            console.error("[Profile] Error:", e);
            setProviderStatus("not_registered");
        }
    };

    const handleLogout = async () => {
        await signOut();
        router.replace("/(auth)/sign-in");
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <ScrollView
                className="px-5"
                contentContainerStyle={{ paddingBottom: 120 }}
            >
                {/* HEADER */}
                <View className="flex-row items-center justify-between my-5">
                    <Text className="text-2xl font-JakartaBold">My Profile</Text>
                    <TouchableOpacity
                        onPress={handleLogout}
                        className="justify-center items-center w-10 h-10 rounded-full bg-white shadow-black"
                    >
                        <Image source={icons.out} className="w-4 h-4" />
                    </TouchableOpacity>
                </View>

                {/* AVATAR */}
                <View className="flex items-center justify-center my-5">
                    <Image
                        source={{ uri: user?.externalAccounts[0]?.imageUrl ?? user?.imageUrl }}
                        style={{ width: 110, height: 110, borderRadius: 55 }}
                        className="border-[3px] border-white shadow-sm shadow-neutral-300"
                    />
                    <Text className="text-lg font-JakartaSemiBold mt-3 text-gray-900">
                        {user?.firstName} {user?.lastName}
                    </Text>
                    <Text className="text-sm text-gray-400">
                        {user?.primaryEmailAddress?.emailAddress}
                    </Text>
                </View>

                {/* PROFILE FIELDS */}
                <View className="flex flex-col bg-white rounded-2xl shadow-sm shadow-neutral-300 px-5 py-3 mb-5">
                    <InputField
                        label="First name"
                        placeholder={user?.firstName || "Not Found"}
                        containerStyle="w-full"
                        inputStyle="p-3.5"
                        editable={false}
                    />
                    <InputField
                        label="Last name"
                        placeholder={user?.lastName || "Not Found"}
                        containerStyle="w-full"
                        inputStyle="p-3.5"
                        editable={false}
                    />
                    <InputField
                        label="Email"
                        placeholder={user?.primaryEmailAddress?.emailAddress || "Not Found"}
                        containerStyle="w-full"
                        inputStyle="p-3.5"
                        editable={false}
                    />
                    <InputField
                        label="Phone"
                        placeholder={user?.primaryPhoneNumber?.phoneNumber || "Not Found"}
                        containerStyle="w-full"
                        inputStyle="p-3.5"
                        editable={false}
                    />
                </View>

                {/* PROVIDER STATUS */}
                <Text className="text-base font-bold text-gray-900 mb-3">
                    Service Provider
                </Text>
                <ProviderSection
                    status={providerStatus}
                    onRegister={() => router.push("/(root)/RegisterProvider")}
                    onVerify={() => router.push("/(root)/VerifyProvider")}
                />

            </ScrollView>
        </SafeAreaView>
    );
};

export default Profile;