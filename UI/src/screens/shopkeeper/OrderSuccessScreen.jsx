import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RSLogo from '../../components/RSLogo';

export default function OrderSuccessScreen({ route, navigation }) {
  const { order } = route.params || {};

  const orderData = order || {
    id: 'RS-ORD-8942',
    total: 3450,
    items: [],
  };

  return (
    <SafeAreaView className="flex-1 bg-[#faf8ff] justify-between">
      <View className="px-4 py-3 items-center">
        <RSLogo size="md" />
      </View>

      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingHorizontal: 24, paddingVertical: 20 }}>
        {/* Checkmark Badge */}
        <View className="w-24 h-24 rounded-full bg-[#006948] justify-center items-center mb-6 shadow-lg">
          <Icon name="check-circle" size={54} color="#85f8c4" />
        </View>

        <Text className="text-2xl font-extrabold text-[#131b2e] text-center mb-1">
          Order Placed Successfully!
        </Text>
        <Text className="text-xs text-[#3d4a42] text-center mb-4 leading-relaxed">
          Your order <Text className="font-bold text-[#006948]">#{orderData.id}</Text> has been verified by RS Industries dispatch team.
        </Text>

        {/* Delivery Guarantee Banner */}
        <View className="w-full bg-[#99efe5] rounded-2xl p-4 mb-6 items-center shadow-sm">
          <View className="flex-row items-center gap-2 mb-1">
            <Icon name="bolt" size={20} color="#006f67" />
            <Text className="text-sm font-bold text-[#006f67]">Express Delivery Guarantee</Text>
          </View>
          <Text className="text-xs text-[#006f67] font-extrabold">Arriving in ~25 Minutes</Text>
        </View>

        {/* Order Brief Box */}
        <View className="w-full bg-white rounded-2xl p-4 border border-[#eaedff] shadow-sm mb-6">
          <View className="flex-row justify-between py-1.5 border-b border-[#f2f3ff]">
            <Text className="text-xs text-[#6d7a72]">Order ID</Text>
            <Text className="text-xs font-bold text-[#131b2e]">#{orderData.id}</Text>
          </View>
          <View className="flex-row justify-between py-1.5 border-b border-[#f2f3ff]">
            <Text className="text-xs text-[#6d7a72]">Total Amount</Text>
            <Text className="text-xs font-bold text-[#006948]">₹{orderData.total}</Text>
          </View>
          <View className="flex-row justify-between py-1.5">
            <Text className="text-xs text-[#6d7a72]">GST Invoice Status</Text>
            <Text className="text-xs font-bold text-[#006f67]">Generated & Emailed</Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View className="p-4 gap-3 bg-white border-t border-[#dae2fd]">
        <Pressable
          onPress={() => navigation.replace('OrderDetail', { order: orderData })}
          className="bg-[#006948] rounded-xl py-3.5 items-center shadow-sm active:opacity-90"
        >
          <Text className="text-white font-bold text-xs uppercase tracking-wider">Track Order Live</Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Shopkeeper' }] })}
          className="bg-[#f2f3ff] rounded-xl py-3 items-center border border-[#dae2fd] active:opacity-80"
        >
          <Text className="text-[#006948] font-bold text-xs">Back to Home</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
