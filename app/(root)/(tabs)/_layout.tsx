import { Tabs } from "expo-router";
import {
    Image,
    ImageSourcePropType,
    View,
    Animated,
} from "react-native";
import { useEffect, useRef } from "react";

import { icons } from "@/constants";

const TabIcon = ({
                     source,
                     focused,
                 }: {
    source: ImageSourcePropType;
    focused: boolean;
}) => {
    const scale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.spring(scale, {
            toValue: focused ? 1.25 : 1,
            useNativeDriver: true,
            friction: 5,
        }).start();
    }, [focused]);

    return (
        <Animated.View
            style={{
                width: 60,
                height: 60,
                borderRadius: 50,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: focused ? "#4B5563" : "transparent",
                transform: [{ scale }],
            }}
        >
            <View
                style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: focused ? "#3cb371" : "transparent",
                }}
            >
                <Image
                    source={source}
                    tintColor="white"
                    resizeMode="contain"
                    className="w-7 h-7"
                />
            </View>
        </Animated.View>
    );
};
export default function Layout() {
    return (
        <Tabs
            initialRouteName="home"
            screenOptions={{
                animation: "shift",
                tabBarActiveTintColor: "white",
                tabBarInactiveTintColor: "white",
                tabBarShowLabel: false,

                tabBarStyle: {
                    backgroundColor: "#333333",
                    borderRadius: 50,

                    overflow: "hidden",
                    marginHorizontal: 20,
                    marginBottom: 20,
                    height: 78,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexDirection: "row",
                    position: "absolute",
                },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: "Home",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon source={icons.home} focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="rides"
                options={{
                    title: "Rides",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon source={icons.list} focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="chat"
                options={{
                    title: "Chat",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon source={icons.chat} focused={focused} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    headerShown: false,
                    tabBarIcon: ({ focused }) => (
                        <TabIcon source={icons.profile} focused={focused} />
                    ),
                }}
            />
        </Tabs>
    );
}