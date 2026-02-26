import React, {
    useEffect,
    useState,
    useRef,
    forwardRef,
    useImperativeHandle,
} from "react";
import { View, StyleSheet,Image, ActivityIndicator } from "react-native";
import MapView, { Marker, Polyline, Region } from "react-native-maps";
import * as Location from "expo-location";

interface Provider {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    type: string;
}

interface MapsProps {
    providers?: Provider[];
    selectedProvider?: Provider | null;
    routeCoordinates?: { latitude: number; longitude: number }[];
}

const Maps = forwardRef<MapView, MapsProps>(
    (
        {
            providers = [],
            selectedProvider = null,
            routeCoordinates = [],
        },
        ref
    ) => {
        const internalMapRef = useRef<MapView>(null);
        const [location, setLocation] =
            useState<Location.LocationObject | null>(null);
        const [loading, setLoading] = useState(true);

        useImperativeHandle(ref, () => internalMapRef.current as MapView);

        /* ============================
           DEBUG: Providers
        ============================ */
        useEffect(() => {
            console.log("🛠 Providers received:", providers);
            console.log("🛠 Providers length:", providers.length);

            if (providers.length > 0) {
                console.log("🛠 First provider coords:", {
                    lat: providers[0].latitude,
                    lng: providers[0].longitude,
                    latType: typeof providers[0].latitude,
                    lngType: typeof providers[0].longitude,
                });
            }
        }, [providers]);

        /* ============================
           GET USER LOCATION
        ============================ */
        useEffect(() => {
            const fetchLocation = async () => {
                console.log("📍 Requesting permission...");

                const { status } =
                    await Location.requestForegroundPermissionsAsync();

                console.log("📍 Permission status:", status);

                if (status !== "granted") {
                    console.log("❌ Location permission denied");
                    setLoading(false);
                    return;
                }

                const currentLocation =
                    await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.High,
                    });

                console.log("📌 User location:", currentLocation.coords);

                setLocation(currentLocation);
                setLoading(false);

                // wait for map to be ready
                setTimeout(() => {
                    if (internalMapRef.current) {
                        const region: Region = {
                            latitude: currentLocation.coords.latitude,
                            longitude: currentLocation.coords.longitude,
                            latitudeDelta: 0.02,
                            longitudeDelta: 0.02,
                        };

                        console.log("🗺 Animating to user region:", region);

                        internalMapRef.current.animateToRegion(region, 1000);
                    } else {
                        console.log("❌ Map ref not ready");
                    }
                }, 800);
            };

            fetchLocation();
        }, []);

        /* ============================
           SELECTED PROVIDER ZOOM
        ============================ */
        useEffect(() => {
            if (selectedProvider && internalMapRef.current) {
                console.log("🎯 Selected provider changed:", selectedProvider);

                internalMapRef.current.animateToRegion(
                    {
                        latitude: selectedProvider.latitude,
                        longitude: selectedProvider.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    },
                    600
                );
            }
        }, [selectedProvider]);

        if (loading) {
            return (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" />
                </View>
            );
        }

        return (
            <MapView
                ref={internalMapRef}
                style={styles.map}
                initialRegion={{
                    latitude: 20.5937,
                    longitude: 78.9629,
                    latitudeDelta: 10,
                    longitudeDelta: 10,
                }}
                showsPointsOfInterest={false} // ✅ hide POIs like restaurants, stores
                showsBuildings={false}        // ✅ hide 3D buildings
                showsIndoors={false}          // ✅ hide indoor maps
                showsTraffic={false}          // ✅ hide traffic
                showsCompass={true}
                onMapReady={() => console.log("🗺 Map Ready")}
            >
                {/* USER MARKER */}
                {location && (
                    <Marker
                        coordinate={{
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                        }}
                    >
                        <Image
                            source={require("../assets/icons/pin_user.png")}
                            style={{ width: 50, height: 50 }}
                            resizeMode="contain"
                        />
                    </Marker>
                )}

                {/* PROVIDER MARKERS */}
                {providers.map((provider) => {
                    const pinImage =
                        provider.type === "mechanic"
                            ? require("../assets/icons/mechanic_pin.png")
                            : provider.type === "towing"
                                ? require("../assets/icons/tow_pin.png")
                                : require("../assets/icons/mechanic_pin.png"); // for "both"

                    return (
                        <Marker

                            key={provider.id}
                            coordinate={{
                                latitude: provider.latitude,
                                longitude: provider.longitude,
                            }}
                            image={pinImage}
                            title={provider.name}
                        />
                    );
                })}

                {routeCoordinates?.length > 0 && (
                    <Polyline
                        coordinates={routeCoordinates}
                        strokeWidth={4}
                        strokeColor="#0286FF"
                    />
                )}
            </MapView>
        );
    }
);

export default Maps;

const styles = StyleSheet.create({
    map: {
        width: "100%",
        height: "90%",
    },
    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },



});