import { View, Text, TouchableOpacity } from "react-native";

interface MechanicCardProps {
  name: string;
  type: string;
  isSelected: boolean;
  onPress: () => void;
}

const MechanicCard = ({
                        name,
                        type,
                        isSelected,
                        onPress,
                      }: MechanicCardProps) => {
  return (
      <TouchableOpacity
          onPress={onPress}
          className={`mr-4 p-4 w-44 rounded-2xl shadow-md ${
              isSelected ? "bg-blue-600" : "bg-white"
          }`}
      >
        <Text
            className={`font-JakartaBold ${
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
          {type}
        </Text>
      </TouchableOpacity>
  );
};

export default MechanicCard;