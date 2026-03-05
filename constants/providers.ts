export type ProviderType = "mechanic" | "towing" | "both";

export type AvailabilityStatus = "available" | "busy" | "offline";

export interface Provider {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    type: ProviderType;
    image: string;
    rating: number;
    totalReviews: number;
    phone: string;
    email: string;
    address: string;
    experienceYears: number;
    availability: AvailabilityStatus;
    basePrice: number;
    verified: boolean;
    description: string;
    distanceKm?: number | null;
}

export const getAvailabilityColor = (status: AvailabilityStatus) => {
    switch (status) {
        case "available": return "#22c55e";
        case "busy":      return "#f59e0b";
        case "offline":   return "#ef4444";
    }
};
