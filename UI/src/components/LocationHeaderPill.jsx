import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLocationStore } from '../store/locationStore';

export default function LocationHeaderPill() {
  const { location, openModal } = useLocationStore();

  if (!location) {
    return (
      <Pressable
        onPress={openModal}
        className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f1f5f9] border border-[#cbd5e1] active:opacity-75"
      >
        <Icon name="add-location-alt" size={14} color="#475569" />
        <Text className="text-[11px] font-bold text-[#475569]">Set Location</Text>
        <Icon name="keyboard-arrow-down" size={16} color="#475569" />
      </Pressable>
    );
  }

  const isServiceable = location.isServiceable;
  const label = [location.city, location.pincode].filter(Boolean).join(' - ') || location.pincode || 'Location';

  return (
    <Pressable
      onPress={openModal}
      className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full border active:opacity-75 ${
        isServiceable
          ? 'bg-[#f0fdf4] border-[#bbf7d0]'
          : 'bg-[#fef2f2] border-[#fecaca]'
      }`}
    >
      <Icon
        name={isServiceable ? 'place' : 'location-off'}
        size={14}
        color={isServiceable ? '#16a34a' : '#dc2626'}
      />
      <View className="flex-row items-center gap-1">
        <Text
          className={`text-[11px] font-bold ${
            isServiceable ? 'text-[#166534]' : 'text-[#991b1b]'
          }`}
          numberOfLines={1}
        >
          {label}
        </Text>
        {!isServiceable && (
          <View className="bg-[#dc2626] px-1 py-0.2 rounded">
            <Text className="text-[9px] font-black text-white uppercase">Unavailable</Text>
          </View>
        )}
      </View>
      <Icon
        name="keyboard-arrow-down"
        size={16}
        color={isServiceable ? '#166534' : '#991b1b'}
      />
    </Pressable>
  );
}
