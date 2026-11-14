import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLocationStore } from '../store/locationStore';

export default function ServiceabilityBanner() {
  const { location, openModal } = useLocationStore();

  if (!location) {
    return (
      <Pressable
        onPress={openModal}
        className="bg-[#1e293b] px-4 py-2 flex-row items-center justify-between active:opacity-90"
      >
        <View className="flex-row items-center gap-2 flex-1 mr-2">
          <Icon name="my-location" size={16} color="#38bdf8" />
          <Text className="text-white text-[11px] font-medium leading-tight flex-1">
            Set your delivery pincode to check stock & delivery timelines.
          </Text>
        </View>
        <View className="bg-[#38bdf8] px-2 py-0.5 rounded">
          <Text className="text-[#0f172a] text-[10px] font-bold uppercase">Select</Text>
        </View>
      </Pressable>
    );
  }

  if (location.isServiceable) {
    return null;
  }

  const locationText = [location.city, location.pincode].filter(Boolean).join(' ') || location.pincode;

  return (
    <Pressable
      onPress={openModal}
      className="bg-[#dc2626] px-4 py-2.5 flex-row items-center justify-between active:opacity-90 shadow-md"
    >
      <View className="flex-row items-center gap-2 flex-1 mr-2">
        <Icon name="warning" size={18} color="#ffffff" />
        <View className="flex-1">
          <Text className="text-white text-xs font-bold leading-tight">
            Delivery Unavailable in {locationText}
          </Text>
          <Text className="text-[#fecaca] text-[10px] leading-tight mt-0.5">
            RS Industries is not servicing this pincode. Ordering is paused.
          </Text>
        </View>
      </View>
      <View className="bg-white/20 px-2.5 py-1 rounded-lg">
        <Text className="text-white text-[10px] font-bold uppercase tracking-wider">Change</Text>
      </View>
    </Pressable>
  );
}
