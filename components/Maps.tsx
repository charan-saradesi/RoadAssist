import React, { forwardRef, useImperativeHandle, useRef, useEffect } from "react";
import { Image, StyleSheet, TouchableOpacity, View, Platform } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import { Provider } from "@/constants/providers";

interface RouteInfo {
    coordinates: { latitude: number; longitude: number }[];
}

interface AppMapProps {
    providers?: Provider[];
    selectedProvider?: Provider | null;
    userLocation?: { latitude: number; longitude: number } | null;
    routeInfo?: RouteInfo | null;
    initialRegion?: {
        latitude: number;
        longitude: number;
        latitudeDelta: number;
        longitudeDelta: number;
    };
    style?: any;
}

const AppMap = forwardRef<MapView, AppMapProps>(
    ({ providers = [], selectedProvider, userLocation, routeInfo, initialRegion, style }, ref) => {

        const internalRef = useRef<MapView>(null);
        useImperativeHandle(ref, () => internalRef.current as MapView);

        // Auto-zoom to user location when it arrives
        useEffect(() => {
            if (!userLocation) return;
            const delay = Platform.OS === "ios" ? 1200 : 800;
            const timer = setTimeout(() => {
                internalRef.current?.animateToRegion(
                    {
                        latitude: userLocation.latitude,
                        longitude: userLocation.longitude,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                    },
                    1000
                );
            }, delay);
            return () => clearTimeout(timer);
        }, [userLocation]);

        const zoomToUser = () => {
            if (!userLocation) return;
            internalRef.current?.animateToRegion(
                {
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    latitudeDelta: 0.02,
                    longitudeDelta: 0.02,
                },
                600
            );
        };

        const defaultRegion = userLocation
            ? {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            }
            : {
                latitude: 12.9716,
                longitude: 77.5946,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
            };

        return (
            <View style={style ?? styles.container}>
                <MapView
                    ref={internalRef}
                    style={styles.map}

                    initialRegion={initialRegion ?? defaultRegion}
                    showsUserLocation={false}
                    showsMyLocationButton={false}
                    showsPointsOfInterest={false}
                    showsBuildings={false}
                    showsIndoors={false}
                    showsTraffic={false}
                    showsCompass={true}
                >
                    {userLocation && (
                        <Marker
                            coordinate={userLocation}
                            title="You"
                            anchor={{ x: 0.5, y: 1 }}
                        >
                            <Image
                                source={require("../assets/icons/user_pin.png")}
                                style={{ width: 50, height: 50 }}
                                resizeMode="contain"
                            />
                        </Marker>
                    )}

                    {providers.map((provider) => {
                        const isSelected = selectedProvider?.id === provider.id;
                        const pinImage =
                            provider.type === "towing"
                                ? require("../assets/icons/tow_pin.png")
                                : require("../assets/icons/mechanic_pin.png");

                        return (
                            <Marker
                                key={provider.id}
                                coordinate={{
                                    latitude: provider.latitude,
                                    longitude: provider.longitude,
                                }}
                                title={provider.name}
                                anchor={{ x: 0.5, y: 1 }}
                            >
                                <Image
                                    source={pinImage}
                                    style={{
                                        width: isSelected ? 40 : 40,
                                        height: isSelected ? 40 : 40,
                                    }}
                                    resizeMode="contain"
                                />
                            </Marker>
                        );
                    })}

                    {routeInfo && routeInfo.coordinates.length > 0 && (
                        <Polyline
                            coordinates={routeInfo.coordinates}
                            strokeColor="#2563eb"
                            strokeWidth={4}
                        />
                    )}
                </MapView>

                {/* Custom My Location Button — works on both iOS and Android */}
                {userLocation && (
                    <TouchableOpacity
                        onPress={zoomToUser}
                        style={styles.locationButton}
                        activeOpacity={0.8}
                    >
                        <Image
                            source={require("../assets/icons/user_pin.png")}
                            style={{ width: 22, height: 22 }}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                )}
            </View>
        );
    }
);

export default AppMap;

const styles = StyleSheet.create({
    container: {
        width: "100%",
        height: "100%",
    },
    map: {
        width: "100%",
        height: "100%",
    },
    locationButton: {
        position: "absolute",
        bottom: 160,
        right: 16,
        backgroundColor: "#fff",
        borderRadius: 999,
        width: 44,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5,
    },
});