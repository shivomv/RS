import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLocationStore } from '../store/locationStore';

/**
 * Blinkit-styled Location Header Dropdown Pill
 */
export default function LocationHeaderPill() {
  const { location, openModal } = useLocationStore();

  if (!location) {
    return (
      <Pressable
        onPress={openModal}
        className="flex-row items-center gap-1.5 px-3 py-1 rounded-full bg-[#f8fafc] border border-[#cbd5e1] active:opacity-75"
      >
        <Icon name="add-location-alt" size={14} color="#006948" />
        <Text className="text-[11px] font-black text-[#0f172a]">Select Delivery Pincode</Text>
        <Icon name="keyboard-arrow-down" size={16} color="#64748b" />
      </Pressable>
    );
  }

  const isServiceable = location.isServiceable;
  const mainAddress = location.city || location.district || 'Deliver to';
  const pinCode = location.pincode;

  return (
    <Pressable
      onPress={openModal}
      className={`flex-row items-center gap-1.5 px-3 py-1 rounded-full border active:opacity-75 ${
        isServiceable
          ? 'bg-[#f0fdf4] border-[#bbf7d0]'
          : 'bg-[#fff1f2] border-[#fecdd3]'
      }`}
    >
      <Icon
        name={isServiceable ? 'place' : 'location-off'}
        size={14}
        color={isServiceable ? '#006948' : '#e11d48'}
      />
      <View className="flex-row items-center gap-1">
        <Text
          className={`text-[11px] font-black ${
            isServiceable ? 'text-[#0f172a]' : 'text-[#9f1239]'
          }`}
          numberOfLines={1}
        >
          {mainAddress} - {pinCode}
        </Text>
        {!isServiceable && (
          <View className="bg-[#ffe4e6] px-1.5 py-0.2 rounded border border-[#fecdd3]">
            <Text className="text-[9px] font-black text-[#e11d48] uppercase">Out of Area</Text>
          </View>
        )}
      </View>
      <Icon
        name="keyboard-arrow-down"
        size={16}
        color={isServiceable ? '#006948' : '#e11d48'}
      />
    </Pressable>
  );
}
