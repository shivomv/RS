import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLocationStore } from '../store/locationStore';

/**
 * HyperlocalHeader
 * - Uses RS Brand Colors: Primary `#006948` (Forest/Emerald Green)
 * - Safe area padding built-in so header flows edge-to-edge under status bar seamlessly
 * - Brand Name & B2B Badge
 * - Address row with dropdown arrow and non-serviceable indicator
 * - Profile button
 * - Clean white search bar with search and catalog icons
 */
export default function HyperlocalHeader({
  navigation,
  search = '',
  onSearchChange,
  onClearSearch,
}) {
  const insets = useSafeAreaInsets();
  const { location, openModal } = useLocationStore();

  const isServiceable = location?.isServiceable !== false;
  const addressLabel = location
    ? `${location.city || location.district || 'Deliver to'} - ${location.pincode}`
    : 'Select Delivery Location';

  return (
    <View
      style={{ paddingTop: Math.max(insets.top, 10) }}
      className="bg-[#006948] px-4 pb-3.5 shadow-sm"
    >
      {/* Top Row: Brand + Address + Profile */}
      <View className="flex-row justify-between items-center">
        <View className="flex-1 mr-2">
          {/* Brand & Factory Direct Tag */}
          <View className="flex-row items-center gap-1.5">
            <Text className="text-xl font-black text-white tracking-tight uppercase">
              RS<Text className="text-[#85f8c4]"> Industries</Text>
            </Text>
            <View className="bg-white/20 px-1.5 py-0.5 rounded border border-white/25">
              <Text className="text-white text-[9.5px] font-black tracking-wide uppercase">
                B2B Wholesale
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
              color={isServiceable ? '#85f8c4' : '#fecdd3'}
            />
            <Text
              className="text-xs font-bold text-white max-w-[230px]"
              numberOfLines={1}
            >
              {addressLabel}
            </Text>
            {!isServiceable && (
              <View className="bg-[#ba1a1a] px-1.5 py-0.2 rounded">
                <Text className="text-[8.5px] font-black text-white uppercase">Out of Area</Text>
              </View>
            )}
            <Icon name="keyboard-arrow-down" size={15} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Profile Circle Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.8}
          className="w-9 h-9 rounded-full bg-white/15 border border-white/30 justify-center items-center shadow-xs"
        >
          <Icon name="person" size={20} color="#ffffff" />
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
          <Icon name="grid-view" size={18} color="#006948" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
