import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useCartStore } from '../store/cartStore';

/**
 * BlinkitCartStrip
 * Docked floating sticky pill directly above bottom navigation bar:
 * - Shows item count & total amount with savings/summary
 * - Big bold 'View Cart →' button with shopping bag
 */
export default function BlinkitCartStrip({ navigation }) {
  const { items, totalAmount, itemCount } = useCartStore();
  const count = itemCount();
  const total = totalAmount();

  if (count <= 0) return null;

  return (
    <View className="absolute left-3 right-3 bottom-1.5 z-40">
      <TouchableOpacity
        onPress={() => navigation.navigate('Cart')}
        activeOpacity={0.92}
        className="bg-[#006948] rounded-2xl px-4 py-3 flex-row items-center justify-between shadow-xl border border-white/20"
      >
        {/* Left: Cart Info & Price */}
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-xl bg-white/15 justify-center items-center border border-white/20">
            <Icon name="shopping-bag" size={20} color="#ffffff" />
          </View>
          <View>
            <View className="flex-row items-center gap-1.5">
              <Text className="text-sm font-black text-white">
                {count} {count === 1 ? 'item' : 'items'}
              </Text>
              <Text className="text-white/60 text-xs">•</Text>
              <Text className="text-base font-black text-white">
                ₹{total.toLocaleString('en-IN')}
              </Text>
            </View>
            <Text className="text-[10px] font-semibold text-emerald-100">
              RS Factory Direct • Cash on Delivery
            </Text>
          </View>
        </View>

        {/* Right: View Cart Action */}
        <View className="flex-row items-center gap-1 bg-white/20 px-3.5 py-1.5 rounded-xl border border-white/30">
          <Text className="text-xs font-black text-white uppercase tracking-wider">
            View Cart
          </Text>
          <Icon name="arrow-forward" size={16} color="#ffffff" />
        </View>
      </TouchableOpacity>
    </View>
  );
}
