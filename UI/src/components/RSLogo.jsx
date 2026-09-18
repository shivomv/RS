import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const RSLogo = ({ size = 'md', showText = true }) => {
  const iconSize = size === 'sm' ? 22 : size === 'lg' ? 36 : 28;
  const textSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <View className="flex-row items-center gap-2">
      <View className="w-8 h-8 rounded-lg bg-[#006948] justify-center items-center shadow-sm">
        <Icon name="shield-check" size={iconSize - 6} color="#ffffff" />
      </View>
      {showText && (
        <View className="flex-col">
          <Text className={`font-extrabold text-[#006948] tracking-tight ${textSize}`}>
            RS Industries
          </Text>
        </View>
      )}
    </View>
  );
};

export default RSLogo;
