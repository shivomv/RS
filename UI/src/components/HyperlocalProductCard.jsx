import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import QuickAddButton from './QuickAddButton';
import { getDefaultProductPricing } from '../utils/productHelper';

/**
 * HyperlocalProductCard
 * Exact card structure matching the preview HTML:
 * - Top image with rounded corners
 * - Delivery time chip (e.g. 10 MINS / 24h)
 * - Product Title
 * - Pack/Variant size in muted gray
 * - Price row with bold selling price & strikethrough MRP
 * - Clean ADD button with steppers
 */
export default function HyperlocalProductCard({
  product,
  quantity = 0,
  onPress,
  onAdd,
  onIncrement,
  onDecrement,
  fullWidth = false,
}) {
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
      } bg-white rounded-2xl p-2.5 shadow-2xs justify-between border border-[#E8E8E8] mb-2.5`}
    >
      <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
        {/* Product Image Box */}
        <View className="relative w-full h-32 rounded-xl bg-[#F8FAFC] justify-center items-center mb-2 overflow-hidden border border-[#F1F5F9]">
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              className="w-full h-full"
              resizeMode="contain"
            />
          ) : (
            <Icon name="inventory-2" size={34} color="#94a3b8" />
          )}

          {/* Delivery Time Badge */}
          <View className="absolute top-1.5 left-1.5 z-10 bg-[#EBF7EE] px-1.5 py-0.5 rounded flex-row items-center gap-0.5 shadow-xs">
            <Icon name="bolt" size={11} color="#0C831F" />
            <Text className="text-[9px] font-black text-[#0C831F] uppercase">
              10-15 MINS
            </Text>
          </View>

          {/* Discount Badge */}
          {discountPercent > 0 && (
            <View className="absolute top-1.5 right-1.5 z-10 bg-[#00316C] px-1.5 py-0.5 rounded shadow-xs">
              <Text className="text-[9px] font-black text-white">
                {discountPercent}% OFF
              </Text>
            </View>
          )}

          {/* Pack Tag */}
          {bundleTag ? (
            <View className="absolute bottom-1.5 left-1.5 z-10 bg-[#0C831F] px-1.5 py-0.5 rounded shadow-xs">
              <Text className="text-[8.5px] text-white font-bold">{bundleTag}</Text>
            </View>
          ) : null}
        </View>

        {/* Product Title */}
        <Text className="text-xs font-bold text-[#1C1C1C] leading-4" numberOfLines={2}>
          {product.name || product.title}
        </Text>

        {/* Unit / Pack Label */}
        <Text className="text-[10px] text-[#666666] font-medium mt-0.5" numberOfLines={1}>
          {variantSubtitle || '500 ml'}
        </Text>
      </TouchableOpacity>

      {/* Pricing & Add Button Row */}
      <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-[#F4F6FB]">
        <View>
          <View className="flex-row items-baseline gap-1">
            <Text className="text-sm font-black text-[#1C1C1C]">₹{displayPrice}</Text>
            {displayMrp > displayPrice && (
              <Text className="text-[9.5px] text-[#888888] line-through font-medium">
                ₹{displayMrp}
              </Text>
            )}
          </View>
        </View>

        <QuickAddButton
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
