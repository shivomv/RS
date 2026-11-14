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
        className="bg-[#f8fafc] border-b border-[#e2e8f0] px-4 py-2.5 flex-row items-center justify-between active:opacity-90"
      >
        <View className="flex-row items-center gap-2 flex-1 mr-2">
          <Icon name="my-location" size={16} color="#0284c7" />
          <Text className="text-[#334155] text-[11px] font-medium leading-tight flex-1">
            Tap to set your delivery pincode and check availability
          </Text>
        </View>
        <View className="bg-[#e0f2fe] px-2.5 py-1 rounded-md border border-[#bae6fd]">
          <Text className="text-[#0369a1] text-[10px] font-bold uppercase">Select</Text>
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
      className="bg-[#fff1f2] border-b border-[#fecdd3] px-4 py-2.5 flex-row items-center justify-between active:opacity-90"
    >
      <View className="flex-row items-center gap-2.5 flex-1 mr-2">
        <View className="w-7 h-7 rounded-full bg-[#ffe4e6] justify-center items-center">
          <Icon name="location-off" size={15} color="#e11d48" />
        </View>
        <View className="flex-1">
          <Text className="text-[#9f1239] text-xs font-bold leading-tight">
            Delivery Unavailable in {locationText}
          </Text>
          <Text className="text-[#be123c] text-[10.5px] leading-tight mt-0.5">
            RS Industries is not servicing this pincode yet. Tap to change.
          </Text>
        </View>
      </View>
      <View className="bg-[#ffe4e6] px-2.5 py-1 rounded-lg border border-[#fecdd3]">
        <Text className="text-[#e11d48] text-[10px] font-bold uppercase tracking-wider">Change</Text>
      </View>
    </Pressable>
  );
}
