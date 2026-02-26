export type ProviderType = "mechanic" | "towing" | "both";

export interface Provider {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    type: ProviderType; // Use your exported type
} // <-- Add this


export const mockProviders: Provider[] = [
    {
        id: "1",
        name: "SpeedFix Mechanic",
        type: "mechanic",
        latitude: 12.933114,
        longitude: 77.560822,
    },
    {
        id: "2",
        name: "Rapid Tow Services",
        type: "towing",
        latitude: 12.930890308981414,
        longitude: 77.56861567370673,
    },
    {
        id: "3",
        name: "Auto Rescue Pro",
        type: "both",
        latitude: 12.921018932376375,
        longitude: 77.55917429860008,
    }, {
        id: "4",
        name: "mechanic 4",
        type: "towing",
        latitude: 12.932019636503433,
        longitude: 77.55578398662999,
    }, {
        id: "5",
        name: "mechanic 5",
        type: "mechanic",
        latitude: 12.932772518609507,
        longitude:  77.57402300735951,
    }, {
        id: "6",
        name: "mechanic 6",
        type: "both",
        latitude: 12.931183098019906,
        longitude: 77.56852984366111,
    },
];