import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useCartStore } from '../store/cartStore';

/**
 * FloatingCartBar
 * Docked sticky floating cart strip above bottom navigation bar:
 * - Shows item count & total amount
 * - Direct 'View Cart →' button
 */
export default function FloatingCartBar({ navigation }) {
  const { totalAmount, itemCount } = useCartStore();
  const count = itemCount();
  const total = totalAmount();

  if (count <= 0) return null;

  return (
    <View className="absolute left-3 right-3 bottom-1.5 z-40">
      <TouchableOpacity
        onPress={() => navigation.navigate('Cart')}
        activeOpacity={0.92}
        className="bg-[#0C831F] rounded-xl px-3.5 py-2.5 flex-row items-center justify-between shadow-lg shadow-emerald-900/30"
      >
        {/* Left: Cart Info & Price */}
        <View className="flex-row items-center gap-2.5">
          <View className="w-8 h-8 rounded-lg bg-black/20 justify-center items-center">
            <Icon name="shopping-bag" size={17} color="#ffffff" />
          </View>
          <View>
            <View className="flex-row items-center gap-1.5">
              <Text className="text-xs font-black text-white uppercase tracking-wide">
                {count} {count === 1 ? 'ITEM' : 'ITEMS'}
              </Text>
              <Text className="text-white/60 text-xs">•</Text>
              <Text className="text-xs font-black text-white">
                ₹{total.toLocaleString('en-IN')}
              </Text>
            </View>
            <Text className="text-[10px] text-white/80 font-medium">
              Factory Direct • Cash on Delivery
            </Text>
          </View>
        </View>

        {/* Right: View Cart Action */}
        <View className="flex-row items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg shadow-xs">
          <Text className="text-xs font-black text-[#0C831F]">View Cart</Text>
          <Icon name="arrow-forward" size={13} color="#0C831F" />
        </View>
      </TouchableOpacity>
    </View>
  );
}
