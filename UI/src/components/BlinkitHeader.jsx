import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuthStore } from '../store/authStore';
import { useLocationStore } from '../store/locationStore';
import LocationHeaderPill from './LocationHeaderPill';

/**
 * BlinkitHeader
 * Signature Blinkit two-line top bar:
 * - Line 1: 'RS Express • 24-48 Hours Delivery' & Profile Avatar
 * - Line 2: Location Selector Pill with current warehouse/city & pincode
 */
export default function BlinkitHeader({ navigation }) {
  const { session } = useAuthStore();
  const { location } = useLocationStore();

  const userInitial = session?.user?.name
    ? session.user.name.charAt(0).toUpperCase()
    : 'U';

  return (
    <View className="bg-white px-4 pt-2.5 pb-2 border-b border-[#e2e8f0] shadow-xs">
      {/* Top Line: Brand Delivery Promise & Avatar */}
      <View className="flex-row items-center justify-between mb-1.5">
        <View className="flex-1 mr-3">
          <View className="flex-row items-center gap-1.5">
            <View className="bg-[#006948] px-1.5 py-0.5 rounded flex-row items-center gap-0.5">
              <Icon name="bolt" size={12} color="#ffffff" />
              <Text className="text-[10px] font-black text-white tracking-wider uppercase">
                RS Express
              </Text>
            </View>
            <Text className="text-xs font-black text-[#0f172a]">
              Delivery in 24-48 Hours
            </Text>
          </View>
          <Text className="text-[10px] text-[#64748b] font-medium mt-0.5" numberOfLines={1}>
            B2B Wholesale Hub • Factory Direct Pricing
          </Text>
        </View>

        {/* Profile Avatar Button */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.8}
          className="w-9 h-9 rounded-full bg-[#f1f5f9] border border-[#cbd5e1] justify-center items-center overflow-hidden"
        >
          {session?.user?.avatarUrl || session?.user?.avatar ? (
            <Image
              source={{ uri: session.user.avatarUrl || session.user.avatar }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <Text className="text-xs font-black text-[#006948]">{userInitial}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Bottom Line: Blinkit Location Dropdown */}
      <View className="flex-row items-center justify-between pt-1 border-t border-[#f1f5f9]">
        <LocationHeaderPill />
        <View className="flex-row items-center gap-1 bg-[#f0fdf4] px-2 py-0.5 rounded-full border border-[#bbf7d0]">
          <Icon name="verified" size={12} color="#006948" />
          <Text className="text-[10px] font-bold text-[#006948]">Verified Hub</Text>
        </View>
      </View>
    </View>
  );
}
