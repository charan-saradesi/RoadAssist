import React from "react";
import { View, Image, TouchableOpacity, Text } from "react-native";
import CustomButton from "@/components/CustomButton";
import { router } from "expo-router";
import {SafeAreaView} from "react-native-safe-area-context";
import {icons} from "@/constants";
import {useAuth, useUser} from "@clerk/clerk-expo";

const Home = () => {
    const { user } = useUser();
    const { signOut } = useAuth();

    const handleSignOut = () => {
        signOut();
        router.replace("/(auth)/sign-in");
    };
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View className="flex-row ml-2 mr-2 items-center justify-between mb-5">
                <Text className="text-2xl  font-JakartaExtraBold">
                    Welcome {user?.firstName} 👋
                </Text>

                <TouchableOpacity
                    onPress={handleSignOut}
                    className="w-10 h-10 rounded-full bg-white items-center justify-center shadow-sm"
                >
                    <Image source={icons.out} className="w-4 h-4" />
                </TouchableOpacity>
            </View>

            <View className="flex-auto items-center justify-center bg-white">

            <CustomButton
                title="Get Help"
                onPress={() => router.push("/getHelp")}
            />
        </View>
        </SafeAreaView>
    );
};

export default Home;