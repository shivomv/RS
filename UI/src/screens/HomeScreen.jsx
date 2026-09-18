import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function HomeScreen({ onNavigate }) {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-3xl font-bold text-blue-600 mb-8">Home</Text>
      <TouchableOpacity
        className="bg-blue-600 px-6 py-3 rounded-lg"
        onPress={onNavigate}
      >
        <Text className="text-white font-bold">Go to About</Text>
      </TouchableOpacity>
    </View>
  );
}
