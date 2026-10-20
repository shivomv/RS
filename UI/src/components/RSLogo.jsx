import React from 'react';
import { View, Text, Image } from 'react-native';

export const RSLogo = ({ size = 'md', showText = true }) => {
  const imgDim = size === 'sm' ? 28 : size === 'lg' ? 44 : 34;
  const textSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <View className="flex-row items-center gap-2">
      <Image
        source={require('../assets/logo-card.png')}
        style={{ width: imgDim, height: imgDim, borderRadius: 8 }}
        resizeMode="contain"
      />
      {showText && (
        <View className="flex-col">
          <Text className={`font-extrabold text-[#006948] tracking-tight ${textSize}`}>
            RS Enterprise
          </Text>
        </View>
      )}
    </View>
  );
};

export default RSLogo;
