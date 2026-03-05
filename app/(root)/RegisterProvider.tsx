import React, { useState } from "react";
import {
    View, Text, ScrollView, TouchableOpacity,
    ActivityIndicator, Alert, KeyboardAvoidingView,
    TouchableWithoutFeedback, Keyboard, Platform, Modal
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import * as Location from "expo-location";
import { fetchAPI } from "@/lib/fetch";
import InputField from "@/components/InputField";

type ServiceType = "mechanic" | "towing" | "both";

const SERVICE_OPTIONS: { value: ServiceType; label: string; icon: string; desc: string }[] = [
    { value: "mechanic", label: "Mechanic", icon: "🔧", desc: "Engine, brakes, AC & general repairs" },
    { value: "towing",   label: "Towing",   icon: "🚛", desc: "Flatbed & recovery towing services" },
    { value: "both",     label: "Both",     icon: "🔧🚛", desc: "Mechanic + towing services" },
];

const RegisterProvider = () => {
    const router = useRouter();
    const { user } = useUser();
    const [loading, setLoading] = useState(false);
    const [locating, setLocating] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const [form, setForm] = useState({
        name: "",
        service_type: "mechanic" as ServiceType,
        phone: "",
        email: user?.primaryEmailAddress?.emailAddress ?? "",
        address: "",
        latitude: null as number | null,
        longitude: null as number | null,
        experience_years: "",
        base_price: "",
        description: "",
    });

    const update = (key: string, value: string) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const selectedOption = SERVICE_OPTIONS.find(o => o.value === form.service_type)!;

    const detectLocation = async () => {
        setLocating(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Permission Denied", "Location permission is required.");
                return;
            }
            const loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });
            const [place] = await Location.reverseGeocodeAsync({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
            });
            const address = [place.street, place.district, place.city]
                .filter(Boolean)
                .join(", ");

            setForm((prev) => ({
                ...prev,
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                address: address || prev.address,
            }));
        } catch {
            Alert.alert("Error", "Could not get location.");
        } finally {
            setLocating(false);
        }
    };

    const handleSubmit = async () => {
        if (!form.name || !form.phone || !form.address || !form.description) {
            Alert.alert("Missing Fields", "Please fill in all required fields.");
            return;
        }
        if (!form.latitude || !form.longitude) {
            Alert.alert("Location Required", "Please detect your location first.");
            return;
        }
        setLoading(true);
        try {
            await fetchAPI("/providers", {
                method: "POST",
                body: JSON.stringify({
                    name: form.name,
                    service_type: form.service_type,
                    phone: form.phone,
                    email: form.email,
                    address: form.address,
                    latitude: form.latitude,
                    longitude: form.longitude,
                    experience_years: parseInt(form.experience_years) || 0,
                    base_price: parseInt(form.base_price) || 0,
                    description: form.description,
                    verified: false,
                    availability: "available",
                    clerk_id: user?.id,
                }),
            });
            Alert.alert(
                "Registered! 🎉",
                "You are now registered as a service provider.",
                [{ text: "OK", onPress: () => router.back() }]
            );
        } catch (e: any) {
            Alert.alert("Error", e.message || "Registration failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView
                        className="px-5"
                        contentContainerStyle={{ paddingBottom: 40 }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* HEADER */}
                        <View className="flex-row items-center mt-4 mb-6">
                            <TouchableOpacity onPress={() => router.back()} className="mr-4">
                                <Text className="text-blue-600 font-semibold text-base">← Back</Text>
                            </TouchableOpacity>
                            <Text className="text-xl font-extrabold text-gray-900">
                                Register as Provider
                            </Text>
                        </View>

                        {/* SERVICE TYPE DROPDOWN */}
                        <Text className="text-sm font-semibold text-gray-600 mb-2">
                            Service Type *
                        </Text>
                        <TouchableOpacity
                            onPress={() => setDropdownOpen(true)}
                            className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 mb-4 flex-row items-center justify-between"
                            style={{
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.05,
                                shadowRadius: 6,
                                elevation: 2,
                            }}
                            activeOpacity={0.8}
                        >
                            <View className="flex-row items-center">
                                <Text style={{ fontSize: 20 }} className="mr-3">
                                    {selectedOption.icon}
                                </Text>
                                <View>
                                    <Text className="text-sm font-bold text-gray-900">
                                        {selectedOption.label}
                                    </Text>
                                    <Text className="text-xs text-gray-400 mt-0.5">
                                        {selectedOption.desc}
                                    </Text>
                                </View>
                            </View>
                            <Text className="text-gray-400 text-base">▾</Text>
                        </TouchableOpacity>

                        {/* DROPDOWN MODAL */}
                        <Modal
                            visible={dropdownOpen}
                            transparent
                            animationType="fade"
                            onRequestClose={() => setDropdownOpen(false)}
                        >
                            <TouchableWithoutFeedback onPress={() => setDropdownOpen(false)}>
                                <View className="flex-1 justify-end"
                                      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
                                    <TouchableWithoutFeedback>
                                        <View className="bg-white rounded-t-3xl px-5 pt-5 pb-10">
                                            <Text className="text-base font-extrabold text-gray-900 mb-4">
                                                Select Service Type
                                            </Text>
                                            {SERVICE_OPTIONS.map((option) => {
                                                const isSelected = form.service_type === option.value;
                                                return (
                                                    <TouchableOpacity
                                                        key={option.value}
                                                        onPress={() => {
                                                            setForm((prev) => ({ ...prev, service_type: option.value }));
                                                            setDropdownOpen(false);
                                                        }}
                                                        className="flex-row items-center py-4 border-b border-gray-100"
                                                        activeOpacity={0.7}
                                                    >
                                                        <View
                                                            className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                                                            style={{
                                                                backgroundColor: isSelected ? "#eff6ff" : "#f9fafb",
                                                                borderWidth: isSelected ? 1.5 : 1,
                                                                borderColor: isSelected ? "#2563eb" : "#e5e7eb",
                                                            }}
                                                        >
                                                            <Text style={{ fontSize: 20 }}>{option.icon}</Text>
                                                        </View>
                                                        <View className="flex-1">
                                                            <Text style={{
                                                                fontSize: 15,
                                                                fontWeight: "700",
                                                                color: isSelected ? "#2563eb" : "#111827",
                                                            }}>
                                                                {option.label}
                                                            </Text>
                                                            <Text className="text-xs text-gray-400 mt-0.5">
                                                                {option.desc}
                                                            </Text>
                                                        </View>
                                                        {isSelected && (
                                                            <View className="w-6 h-6 rounded-full bg-blue-600 items-center justify-center">
                                                                <Text className="text-white font-bold" style={{ fontSize: 12 }}>✓</Text>
                                                            </View>
                                                        )}
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </TouchableWithoutFeedback>
                                </View>
                            </TouchableWithoutFeedback>
                        </Modal>

                        {/* FIELDS */}
                        <InputField
                            label="Full Name *"
                            value={form.name}
                            onChangeText={(v) => update("name", v)}
                            placeholder="Your business or full name"
                            containerStyle="bg-white border-gray-200"
                        />
                        <InputField
                            label="Phone *"
                            value={form.phone}
                            onChangeText={(v) => update("phone", v)}
                            placeholder="+91 9876543210"
                            keyboardType="phone-pad"
                            containerStyle="bg-white border-gray-200"
                        />
                        <InputField
                            label="Email *"
                            value={form.email}
                            onChangeText={(v) => update("email", v)}
                            placeholder="your@email.com"
                            keyboardType="email-address"
                            containerStyle="bg-white border-gray-200"
                        />
                        <InputField
                            label="Experience (years)"
                            value={form.experience_years}
                            onChangeText={(v) => update("experience_years", v)}
                            placeholder="5"
                            keyboardType="numeric"
                            containerStyle="bg-white border-gray-200"
                        />
                        <InputField
                            label="Base Price (₹)"
                            value={form.base_price}
                            onChangeText={(v) => update("base_price", v)}
                            placeholder="499"
                            keyboardType="numeric"
                            containerStyle="bg-white border-gray-200"
                        />
                        <InputField
                            label="Description *"
                            value={form.description}
                            onChangeText={(v) => update("description", v)}
                            placeholder="Describe your services..."
                            multiline
                            containerStyle="bg-white border-gray-200 rounded-2xl"
                            inputStyle="min-h-[100px]"
                        />

                        {/* LOCATION */}
                        <Text className="text-sm font-semibold text-gray-600 mb-2 mt-1">
                            Location *
                        </Text>
                        <View className="bg-white border border-gray-200 rounded-xl p-4 mb-3">
                            {form.latitude ? (
                                <View>
                                    <Text className="text-sm text-gray-700 font-medium">
                                        {form.address}
                                    </Text>
                                    <Text className="text-xs text-gray-400 mt-1">
                                        {form.latitude.toFixed(5)}, {form.longitude?.toFixed(5)}
                                    </Text>
                                </View>
                            ) : (
                                <Text className="text-sm text-gray-400">
                                    No location detected yet
                                </Text>
                            )}
                        </View>

                        <TouchableOpacity
                            onPress={detectLocation}
                            disabled={locating}
                            className="bg-blue-50 border border-blue-200 rounded-xl py-3 items-center mb-6"
                            activeOpacity={0.8}
                        >
                            {locating
                                ? <ActivityIndicator color="#2563eb" />
                                : <Text className="text-blue-600 font-bold text-sm">
                                    📍 {form.latitude ? "Re-detect Location" : "Detect My Location"}
                                </Text>
                            }
                        </TouchableOpacity>

                        {/* SUBMIT */}
                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={loading}
                            className="bg-blue-600 rounded-2xl py-4 items-center"
                            style={{
                                shadowColor: "#2563eb",
                                shadowOffset: { width: 0, height: 6 },
                                shadowOpacity: 0.3,
                                shadowRadius: 12,
                                elevation: 8,
                            }}
                            activeOpacity={0.85}
                        >
                            {loading
                                ? <ActivityIndicator color="#fff" />
                                : <Text className="text-white font-extrabold text-base">
                                    Register as Provider
                                </Text>
                            }
                        </TouchableOpacity>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default RegisterProvider;