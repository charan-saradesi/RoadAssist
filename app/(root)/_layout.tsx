import { Stack } from "expo-router";

const Layout = () => {
    return (
        <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="getHelp" options={{ headerShown: false }} />
            <Stack.Screen name="ProviderDetails" options={{ headerShown: false }} />
            <Stack.Screen
                name="confirm-ride"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="book-ride"
                options={{
                    headerShown: false,
                }}
            />
        </Stack>
    );
};

export default Layout;