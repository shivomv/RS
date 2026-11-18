import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLocationStore } from '../store/locationStore';

/**
 * HyperlocalHeader
 * Exact header matched to customer_home_preview.html:
 * - Yellow background: #F7D435
 * - Top Left: Brand name + '10-15 MINS' badge
 * - Address row with dropdown arrow and instant 'Out of Area' pill if not serviceable
 * - Top Right: Profile circle icon
 * - Bottom: White floating search bar with search icon & scanner/category icon
 */
export default function HyperlocalHeader({
  navigation,
  search = '',
  onSearchChange,
  onClearSearch,
}) {
  const { location, openModal } = useLocationStore();

  const isServiceable = location?.isServiceable !== false;
  const addressLabel = location
    ? `${location.city || location.district || 'Deliver to'} - ${location.pincode}`
    : 'Select Delivery Location';

  return (
    <View className="bg-[#F7D435] px-4 pt-2.5 pb-3.5 shadow-xs">
      {/* Top Row: Brand & Time + Address + Profile */}
      <View className="flex-row justify-between items-center">
        <View className="flex-1 mr-2">
          {/* Brand & ETA Pill */}
          <View className="flex-row items-center gap-1.5">
            <Text className="text-xl font-black text-[#1C1C1C] tracking-tight uppercase">
              RS<Text className="text-[#0C831F]"> Enterprise</Text>
            </Text>
            <View className="bg-[#1C1C1C] px-1.5 py-0.5 rounded">
              <Text className="text-white text-[9.5px] font-black tracking-wide">
                10-15 MINS
              </Text>
            </View>
          </View>

          {/* Location Dropdown Row */}
          <TouchableOpacity
            onPress={openModal}
            activeOpacity={0.8}
            className="flex-row items-center gap-1 mt-1"
          >
            <Icon
              name={isServiceable ? 'place' : 'location-off'}
              size={13}
              color={isServiceable ? '#1C1C1C' : '#ba1a1a'}
            />
            <Text
              className="text-xs font-bold text-[#1C1C1C] max-w-[230px]"
              numberOfLines={1}
            >
              {addressLabel}
            </Text>
            {!isServiceable && (
              <View className="bg-[#ba1a1a] px-1.5 py-0.2 rounded">
                <Text className="text-[8.5px] font-black text-white uppercase">Out of Area</Text>
              </View>
            )}
            <Icon name="keyboard-arrow-down" size={15} color="#1C1C1C" />
          </TouchableOpacity>
        </View>

        {/* Profile Circle Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.8}
          className="w-9 h-9 rounded-full bg-white/95 border border-black/10 justify-center items-center shadow-xs"
        >
          <Icon name="person" size={20} color="#1C1C1C" />
        </TouchableOpacity>
      </View>

      {/* White Search Box */}
      <View className="mt-3 bg-white rounded-xl shadow-xs flex-row items-center px-3.5 py-2 border border-transparent">
        <Icon name="search" size={18} color="#666666" />
        <TextInput
          value={search}
          onChangeText={onSearchChange}
          placeholder='Search "phenyl", "floor cleaner", "detergent"...'
          placeholderTextColor="#888888"
          className="flex-1 text-xs font-medium text-[#1C1C1C] ml-2 h-7 p-0"
        />
        {search ? (
          <TouchableOpacity onPress={onClearSearch} activeOpacity={0.7} className="p-1">
            <Icon name="cancel" size={16} color="#888888" />
          </TouchableOpacity>
        ) : null}
        <View className="h-4 w-[1px] bg-gray-200 mx-2" />
        <TouchableOpacity
          onPress={() => navigation.navigate('Catalog')}
          activeOpacity={0.7}
        >
          <Icon name="grid-view" size={18} color="#0C831F" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
