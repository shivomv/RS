import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function AboutScreen({ onNavigate }) {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-3xl font-bold text-green-600 mb-8">About</Text>
      <TouchableOpacity
        className="bg-green-600 px-6 py-3 rounded-lg"
        onPress={onNavigate}
      >
        <Text className="text-white font-bold">Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}
