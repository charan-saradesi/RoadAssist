import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface MechanicCardProps {
    name: string;
    type: string;
    isSelected: boolean;
    onPress: () => void;
}

const MechanicCard: React.FC<MechanicCardProps> = ({
                                                       name,
                                                       type,
                                                       isSelected,
                                                       onPress,
                                                   }) => {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={onPress}
            className={`mr-4 mb-4 p-4 w-44 rounded-2xl shadow-md ${
                isSelected ? "bg-blue-600" : "bg-white"
            }`}
        >
            <Text
                numberOfLines={1}
                className={`font-JakartaBold text-base ${
                    isSelected ? "text-white" : "text-black"
                }`}
            >
                {name}
            </Text>

            <Text
                className={`text-sm mt-2 ${
                    isSelected ? "text-white" : "text-gray-500"
                }`}
            >
                {type.toUpperCase()}
            </Text>
        </TouchableOpacity>
    );
};

export default MechanicCard;