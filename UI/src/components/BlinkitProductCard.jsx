import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import BlinkitAddButton from './BlinkitAddButton';
import { getDefaultProductPricing } from '../utils/productHelper';

/**
 * BlinkitProductCard
 * Crisp Blinkit-style product grid card:
 * - 24-48h Delivery Chip
 * - Unit / Pack Size Tag (5L, 500ml, Pack of 4)
 * - Discount badge & strikethrough MRP
 * - Blinkit ADD / Stepper Button
 */
export default function BlinkitProductCard({
  product,
  quantity = 0,
  onPress,
  onAdd,
  onIncrement,
  onDecrement,
  fullWidth = false,
}) {
  const pId = product._id || product.id;
  const defaultInfo = getDefaultProductPricing(product);
  const displayPrice = defaultInfo.price || product.price || 0;
  const displayMrp = defaultInfo.mrp || product.mrp || 0;
  const variantSubtitle = defaultInfo.variantLabel || product.subtitle || product.category;
  const bundleTag = defaultInfo.bundleLabel;
  const imageUri = defaultInfo.image || product.image || product.img;

  const discountPercent =
    displayMrp > displayPrice
      ? Math.round(((displayMrp - displayPrice) / displayMrp) * 100)
      : 0;

  return (
    <View
      className={`${
        fullWidth ? 'w-full' : 'w-[48.5%]'
      } bg-white rounded-2xl p-2.5 shadow-sm justify-between border border-[#e2e8f0] mb-3`}
    >
      <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
        {/* Product Image Area */}
        <View className="relative w-full h-36 rounded-xl bg-[#f8fafc] justify-center items-center mb-2 overflow-hidden border border-[#f1f5f9]">
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              className="w-full h-full"
              resizeMode="contain"
            />
          ) : (
            <Icon name="inventory-2" size={38} color="#94a3b8" />
          )}

          {/* Blinkit Delivery Badge (⚡ 24h Delivery) */}
          <View className="absolute top-1.5 left-1.5 z-10 bg-[#f0fdf4] px-1.5 py-0.5 rounded-md flex-row items-center gap-0.5 border border-[#bbf7d0] shadow-xs">
            <Icon name="bolt" size={11} color="#006948" />
            <Text className="text-[9px] font-black text-[#006948] uppercase tracking-wider">
              24h
            </Text>
          </View>

          {/* Discount Pill */}
          {discountPercent > 0 && (
            <View className="absolute top-1.5 right-1.5 z-10 bg-[#00316c] px-1.5 py-0.5 rounded-md shadow-xs">
              <Text className="text-[9px] font-black text-white">
                {discountPercent}% OFF
              </Text>
            </View>
          )}

          {/* Bundle Tag (e.g., Pack of 4) */}
          {bundleTag ? (
            <View className="absolute bottom-1.5 left-1.5 z-10 bg-[#006948] px-1.5 py-0.5 rounded shadow-xs">
              <Text className="text-[8.5px] text-white font-bold">{bundleTag}</Text>
            </View>
          ) : null}
        </View>

        {/* Product Title */}
        <Text className="text-xs font-black text-[#0f172a] leading-4" numberOfLines={2}>
          {product.name || product.title}
        </Text>

        {/* Pack / Variant Subtitle */}
        <Text className="text-[10px] text-[#64748b] font-bold mt-0.5" numberOfLines={1}>
          {variantSubtitle || 'Wholesale Standard Pack'}
        </Text>
      </TouchableOpacity>

      {/* Price & Blinkit ADD Button Row */}
      <View className="flex-row items-center justify-between mt-2.5 pt-2 border-t border-[#f1f5f9]">
        <View>
          <View className="flex-row items-baseline gap-1">
            <Text className="text-sm font-black text-[#0f172a]">₹{displayPrice}</Text>
            {displayMrp > displayPrice && (
              <Text className="text-[9.5px] text-[#94a3b8] line-through font-semibold">
                ₹{displayMrp}
              </Text>
            )}
          </View>
          <Text className="text-[9px] font-bold text-[#006948]">Factory Rate</Text>
        </View>

        {/* Blinkit ADD Button */}
        <BlinkitAddButton
          quantity={quantity}
          onAdd={onAdd}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
          size="sm"
        />
      </View>
    </View>
  );
}
