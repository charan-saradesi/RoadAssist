export type ProviderType = "mechanic" | "towing" | "both";

export type AvailabilityStatus = "available" | "busy" | "offline";

export interface Provider {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    type: ProviderType;

    // 🔥 New Fields
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

    // Optional (can calculate later)
    distanceKm?: number;
}

export const getAvailabilityColor = (status: AvailabilityStatus) => {
    switch (status) {
        case "available":
            return "#22c55e";
        case "busy":
            return "#f59e0b";
        case "offline":
            return "#ef4444";
    }
};

export const mockProviders: Provider[] = [
    {
        id: "1",
        name: "SpeedFix Mechanic",
        type: "mechanic",
        latitude: 12.933114,
        longitude: 77.560822,

        image: "https://randomuser.me/api/portraits/men/32.jpg",
        rating: 4.8,
        totalReviews: 214,
        phone: "+91 9876543210",
        email: "speedfix@gmail.com",
        address: "MG Road, Bangalore",
        experienceYears: 8,
        availability: "available",
        basePrice: 499,
        verified: true,
        description:
            "Expert in engine diagnostics, brake repair and roadside emergency services.",
    },
    {
        id: "2",
        name: "Rapid Tow Services",
        type: "towing",
        latitude: 12.930890308981414,
        longitude: 77.56861567370673,

        image: "https://randomuser.me/api/portraits/men/45.jpg",
        rating: 4.5,
        totalReviews: 132,
        phone: "+91 9123456780",
        email: "rapidtow@gmail.com",
        address: "Indiranagar, Bangalore",
        experienceYears: 5,
        availability: "busy",
        basePrice: 899,
        verified: true,
        description:
            "24/7 towing support with flatbed trucks and accident recovery service.",
    },
    {
        id: "3",
        name: "Auto Rescue Pro",
        type: "both",
        latitude: 12.921018932376375,
        longitude: 77.55917429860008,

        image: "https://randomuser.me/api/portraits/men/51.jpg",
        rating: 4.9,
        totalReviews: 341,
        phone: "+91 9988776655",
        email: "autorescue@gmail.com",
        address: "Koramangala, Bangalore",
        experienceYears: 10,
        availability: "available",
        basePrice: 699,
        verified: true,
        description:
            "Premium roadside assistance, mechanical repairs & towing services.",
    },
    {
        id: "4",
        name: "City Tow Expert",
        type: "towing",
        latitude: 12.932019636503433,
        longitude: 77.55578398662999,

        image: "https://randomuser.me/api/portraits/men/12.jpg",
        rating: 4.2,
        totalReviews: 88,
        phone: "+91 9011223344",
        email: "citytow@gmail.com",
        address: "Jayanagar, Bangalore",
        experienceYears: 6,
        availability: "offline",
        basePrice: 799,
        verified: false,
        description:
            "Reliable towing and breakdown recovery services across the city.",
    },
    {
        id: "5",
        name: "Garage Master",
        type: "mechanic",
        latitude: 12.932772518609507,
        longitude: 77.57402300735951,

        image: "https://randomuser.me/api/portraits/men/77.jpg",
        rating: 4.6,
        totalReviews: 167,
        phone: "+91 9090909090",
        email: "garagemaster@gmail.com",
        address: "HSR Layout, Bangalore",
        experienceYears: 7,
        availability: "available",
        basePrice: 550,
        verified: true,
        description:
            "Specialist in car servicing, battery replacement and AC repairs.",
    },
    {
        id: "6",
        name: "Roadside Hero",
        type: "both",
        latitude: 12.931183098019906,
        longitude: 77.56852984366111,

        image: "https://randomuser.me/api/portraits/men/66.jpg",
        rating: 4.7,
        totalReviews: 205,
        phone: "+91 9445566778",
        email: "roadsidehero@gmail.com",
        address: "Whitefield, Bangalore",
        experienceYears: 9,
        availability: "available",
        basePrice: 650,
        verified: true,
        description:
            "Quick response roadside mechanic with professional towing support.",
    },
];