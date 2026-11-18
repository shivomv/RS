import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

/**
 * QuickAddButton
 * Clean compact ADD button with quantity steppers:
 * - 0 quantity: Clean button with green border & bold green 'ADD +'
 * - >0 quantity: Solid brand green pill with '-' [Qty] '+'
 */
export default function QuickAddButton({
  quantity = 0,
  onAdd,
  onIncrement,
  onDecrement,
  size = 'md',
}) {
  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  const containerHeight = isSmall ? 'h-7' : isLarge ? 'h-10' : 'h-8';
  const buttonPadding = isSmall ? 'px-2.5' : isLarge ? 'px-4' : 'px-3';
  const fontSize = isSmall ? 'text-[11px]' : isLarge ? 'text-sm' : 'text-xs';
  const iconSize = isSmall ? 13 : isLarge ? 17 : 14;

  if (quantity === 0) {
    return (
      <TouchableOpacity
        onPress={onAdd}
        activeOpacity={0.8}
        className={`${containerHeight} ${buttonPadding} bg-white border border-[#0C831F] rounded-lg flex-row items-center justify-center gap-1 shadow-xs active:bg-[#f0fdf4]`}
      >
        <Text className={`${fontSize} font-black text-[#0C831F] tracking-wider`}>ADD</Text>
        <Icon name="add" size={iconSize} color="#0C831F" />
      </TouchableOpacity>
    );
  }

  return (
    <View
      className={`${containerHeight} bg-[#0C831F] rounded-lg flex-row items-center px-1 shadow-xs`}
    >
      <TouchableOpacity
        onPress={onDecrement}
        activeOpacity={0.7}
        className="w-7 h-full justify-center items-center active:opacity-60"
        hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
      >
        <Icon name="remove" size={iconSize} color="#ffffff" />
      </TouchableOpacity>
      <Text className={`px-2 ${fontSize} font-black text-white text-center min-w-[20px]`}>
        {quantity}
      </Text>
      <TouchableOpacity
        onPress={onIncrement}
        activeOpacity={0.7}
        className="w-7 h-full justify-center items-center active:opacity-60"
        hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
      >
        <Icon name="add" size={iconSize} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}
