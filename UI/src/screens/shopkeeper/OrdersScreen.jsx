import React, { useEffect } from 'react';
import { View, Text, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useOrderStore } from '../../store/orderStore';
import apiService from '../../services/api';

const OrdersScreen = ({ navigation }) => {
  const { orders, setOrders, setLoading } = useOrderStore();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await apiService.getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-slate-50">
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

        <ScrollView className="flex-1 px-5">
          <View className="py-4">
            <Text className="text-xs tracking-widest font-bold text-slate-500">ORDERS</Text>
            <Text className="text-2xl font-black text-slate-950 mt-1">TRACK YOUR DISTRIBUTION CYCLE</Text>
          </View>

          {orders.length === 0 ? (
            <View className="items-center py-20">
              <Icon name="inbox" size={48} color="#94a3b8" />
              <Text className="mt-6 text-slate-500">No orders yet</Text>
            </View>
          ) : (
            orders.map((order) => (
              <OrderRow key={order._id} order={order} />
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const OrderRow = ({ order }) => (
  <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 mb-3">
    <View className="w-11 h-11 bg-blue-50 rounded-xl justify-center items-center">
      <Icon name="truck" size={20} color="#003E6F" />
    </View>

    <View className="flex-1 ml-4">
      <Text className="text-slate-950 font-bold text-sm">
        {order._id?.substring(0, 8).toUpperCase() || 'RS-XXXX'}
      </Text>
      <Text className="text-slate-500 text-xs mt-1 capitalize">{order.status}</Text>
    </View>

    <Text className="text-slate-950 font-black">₹{order.totalAmount}</Text>
  </View>
);

export default OrdersScreen;
