import { Driver, MarkerData } from "@/types/type";

const GEOAPIFY_API_KEY = process.env.EXPO_PUBLIC_GEOAPIFY_KEY;

export const generateMarkersFromData = ({
                                          data,
                                          userLatitude,
                                          userLongitude,
                                        }: {
  data: Driver[];
  userLatitude: number;
  userLongitude: number;
}): MarkerData[] => {
  return data.map((driver) => {
    const latOffset = (Math.random() - 0.5) * 0.01;
    const lngOffset = (Math.random() - 0.5) * 0.01;

    return {
      latitude: userLatitude + latOffset,
      longitude: userLongitude + lngOffset,
      title: `${driver.first_name} ${driver.last_name}`,
      ...driver,
    };
  });
};

export const calculateRegion = ({
                                  userLatitude,
                                  userLongitude,
                                  destinationLatitude,
                                  destinationLongitude,
                                }: {
  userLatitude: number | null;
  userLongitude: number | null;
  destinationLatitude?: number | null;
  destinationLongitude?: number | null;
}) => {
  if (!userLatitude || !userLongitude) {
    return {
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }

  if (!destinationLatitude || !destinationLongitude) {
    return {
      latitude: userLatitude,
      longitude: userLongitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }

  const minLat = Math.min(userLatitude, destinationLatitude);
  const maxLat = Math.max(userLatitude, destinationLatitude);
  const minLng = Math.min(userLongitude, destinationLongitude);
  const maxLng = Math.max(userLongitude, destinationLongitude);

  return {
    latitude: (userLatitude + destinationLatitude) / 2,
    longitude: (userLongitude + destinationLongitude) / 2,
    latitudeDelta: (maxLat - minLat) * 1.3 || 0.01,
    longitudeDelta: (maxLng - minLng) * 1.3 || 0.01,
  };
};

export const calculateDriverTimes = async ({
                                             markers,
                                             userLatitude,
                                             userLongitude,
                                             destinationLatitude,
                                             destinationLongitude,
                                           }: {
  markers: MarkerData[];
  userLatitude: number | null;
  userLongitude: number | null;
  destinationLatitude: number | null;
  destinationLongitude: number | null;
}) => {
  if (
      !userLatitude ||
      !userLongitude ||
      !destinationLatitude ||
      !destinationLongitude
  )
    return;

  try {
    const timesPromises = markers.map(async (marker) => {
      // ---------------- Driver → User ----------------
      const responseToUser = await fetch(
          `https://api.geoapify.com/v1/routing?waypoints=${marker.latitude},${marker.longitude}|${userLatitude},${userLongitude}&mode=drive&apiKey=${GEOAPIFY_API_KEY}`
      );

      const dataToUser = await responseToUser.json();
      const timeToUser =
          dataToUser.features[0].properties.time; // seconds

      // ---------------- User → Destination ----------------
      const responseToDestination = await fetch(
          `https://api.geoapify.com/v1/routing?waypoints=${userLatitude},${userLongitude}|${destinationLatitude},${destinationLongitude}&mode=drive&apiKey=${GEOAPIFY_API_KEY}`
      );

      const dataToDestination = await responseToDestination.json();
      const timeToDestination =
          dataToDestination.features[0].properties.time; // seconds

      // ---------------- Total ----------------
      const totalTimeMinutes = (timeToUser + timeToDestination) / 60;

      const price = (totalTimeMinutes * 0.5).toFixed(2);

      return {
        ...marker,
        time: totalTimeMinutes,
        price,
      };
    });

    return await Promise.all(timesPromises);
  } catch (error) {
    console.error("Geoapify routing error:", error);
  }
};