import React, { useEffect } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RSLogo from '../../components/RSLogo';
import { useOrderStore } from '../../store/orderStore';

const StatusBadge = ({ status }) => {
  const isDelivered = status === 'delivered';
  return (
    <View
      className={`rounded-full px-2.5 py-0.5 ${
        isDelivered ? 'bg-[#85f8c4]' : 'bg-[#99efe5]'
      }`}
    >
      <Text
        className={`text-[10px] font-bold uppercase tracking-wider ${
          isDelivered ? 'text-[#002114]' : 'text-[#006f67]'
        }`}
      >
        {status || 'Dispatching'}
      </Text>
    </View>
  );
};

export default function OrdersScreen({ navigation }) {
  const { orders, fetchOrders } = useOrderStore();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <SafeAreaView className="flex-1 bg-[#faf8ff]">
      {/* Top Header */}
      <View className="bg-white border-b border-[#dae2fd] px-4 py-3 flex-row items-center justify-between shadow-sm">
        <RSLogo size="md" />
        <View className="bg-[#006948]/10 px-2.5 py-1 rounded-full flex-row items-center gap-1">
          <Icon name="receipt-long" size={14} color="#006948" />
          <Text className="text-xs text-[#006948] font-bold">{orders.length} B2B Orders</Text>
        </View>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item, idx) => item._id || item.id || String(idx)}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('OrderDetail', { order: { ...item, id: item._id } })}
            className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-[#eaedff] active:opacity-90"
          >
            <View className="flex-row justify-between items-start mb-2">
              <View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-xs font-extrabold text-[#131b2e]">
                    Order #{item._id.slice(-6)}
                  </Text>
                  {item.gstInvoice && (
                    <View className="bg-[#85f8c4]/40 px-1.5 py-0.2 rounded">
                      <Text className="text-[9px] text-[#006948] font-bold">GST Invoice</Text>
                    </View>
                  )}
                </View>
                <Text className="text-[10px] text-[#3d4a42] mt-0.5">
                  RS Industries Procurement • {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <StatusBadge status={item.status} />
            </View>

            <View className="bg-[#f2f3ff] rounded-xl p-3 my-2 gap-1">
              {item.items.map((cartItem, idx) => (
                <Text key={idx} className="text-xs text-[#131b2e]">
                  • {cartItem.name || cartItem.product?.name} × {cartItem.quantity}
                </Text>
              ))}
            </View>

            <View className="flex-row justify-between items-center pt-2 border-t border-[#f2f3ff]">
              <Text className="text-xs text-[#3d4a42] font-semibold">Total Payable:</Text>
              <View className="flex-row items-center gap-1">
                <Text className="text-base font-extrabold text-[#006948]">
                  ₹{item.total.toLocaleString('en-IN')}
                </Text>
                <Icon name="chevron-right" size={18} color="#006948" />
              </View>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
