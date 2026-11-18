import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView, BackHandler, RefreshControl, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { OrderCardSkeleton } from '../../components/Skeleton';
import { useOrderStore } from '../../store/orderStore';
import { useAuthStore } from '../../store/authStore';

const StatusBadge = ({ status }) => {
  const norm = String(status || '').toLowerCase();
  const isDelivered = norm === 'delivered';
  const isCancelled = norm === 'cancelled';

  if (isDelivered) {
    return (
      <View className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-full px-2.5 py-0.5 flex-row items-center gap-1">
        <View className="w-1.5 h-1.5 rounded-full bg-[#006948]" />
        <Text className="text-[10px] font-black uppercase text-[#006948]">Delivered</Text>
      </View>
    );
  }

  if (isCancelled) {
    return (
      <View className="bg-[#fff1f2] border border-[#fecdd3] rounded-full px-2.5 py-0.5 flex-row items-center gap-1">
        <View className="w-1.5 h-1.5 rounded-full bg-[#e11d48]" />
        <Text className="text-[10px] font-black uppercase text-[#e11d48]">Cancelled</Text>
      </View>
    );
  }

  return (
    <View className="bg-[#fef9c3] border border-[#fef08a] rounded-full px-2.5 py-0.5 flex-row items-center gap-1">
      <View className="w-1.5 h-1.5 rounded-full bg-[#ca8a04]" />
      <Text className="text-[10px] font-black uppercase text-[#854d0e]">
        {status || 'Dispatched'}
      </Text>
    </View>
  );
};

export default function OrdersScreen({ navigation }) {
  const { session } = useAuthStore();
  const { orders, fetchOrders } = useOrderStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Hardware Back Handler
  useEffect(() => {
    const onBackPress = () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
        return true;
      }
      navigation.navigate('ShopHome');
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [navigation]);

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    fetchOrders().then(() => {
      if (isMounted) setLoading(false);
    }).catch(() => {
      if (isMounted) setLoading(false);
    });

    return () => { isMounted = false; };
  }, [session, fetchOrders]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchOrders();
    } catch (err) {
      console.warn('[Orders] Refresh error:', err.message);
    } finally {
      setRefreshing(false);
    }
  };

  if (!session) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-[#f8fafc]">
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View className="bg-white border-b border-[#e2e8f0] px-4 py-3 flex-row items-center justify-between shadow-xs">
          <Text className="text-base font-black text-[#0f172a]">Your Orders</Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 24, alignItems: 'center' }} className="flex-1">
          <View className="w-16 h-16 rounded-full bg-[#f1f5f9] justify-center items-center mb-3 mt-12 border border-[#e2e8f0]">
            <Icon name="receipt-long" size={32} color="#94a3b8" />
          </View>
          <Text className="text-base font-black text-[#0f172a] text-center">Login to View Orders</Text>
          <Text className="text-xs text-[#64748b] text-center mt-1 px-4 leading-relaxed">
            Sign in with your registered account to track your orders, dispatch status, and download invoices.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
            className="mt-6 bg-[#006948] px-6 py-2.5 rounded-xl shadow-xs"
          >
            <Text className="text-xs font-black text-white uppercase tracking-wider">Login Now</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-[#f8fafc]">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Blinkit Top Bar for Orders */}
      <View className="bg-white border-b border-[#e2e8f0] px-4 py-2.5 flex-row items-center justify-between shadow-xs">
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-lg bg-[#006948] justify-center items-center">
            <Icon name="local-shipping" size={18} color="#ffffff" />
          </View>
          <View>
            <Text className="text-sm font-black text-[#0f172a]">Order History</Text>
            <Text className="text-[10px] text-[#64748b]">Realtime dispatch updates</Text>
          </View>
        </View>
        <View className="bg-[#f0fdf4] border border-[#bbf7d0] px-2.5 py-0.5 rounded-full">
          <Text className="text-xs font-black text-[#006948]">{orders.length} Orders</Text>
        </View>
      </View>

      {loading ? (
        <View className="p-4 gap-y-3">
          <OrderCardSkeleton />
          <OrderCardSkeleton />
          <OrderCardSkeleton />
        </View>
      ) : orders.length === 0 ? (
        <View className="flex-1 justify-center items-center p-6">
          <View className="w-16 h-16 rounded-full bg-[#f1f5f9] justify-center items-center mb-3 border border-[#e2e8f0]">
            <Icon name="receipt" size={32} color="#94a3b8" />
          </View>
          <Text className="text-sm font-black text-[#0f172a]">No Orders Placed Yet</Text>
          <Text className="text-xs text-[#64748b] text-center mt-1">
            Browse our factory catalog and stock up on best-selling chemicals.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('ShopHome')}
            activeOpacity={0.8}
            className="mt-5 bg-[#006948] px-5 py-2.5 rounded-xl shadow-xs"
          >
            <Text className="text-xs font-black text-white uppercase tracking-wider">Browse Catalog</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item, idx) => item._id || item.id || String(idx)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#006948']}
              tintColor="#006948"
            />
          }
          renderItem={({ item }) => {
            const rawId = item._id || item.id || 'RS-ORD';
            const orderNum = String(rawId).slice(-6);
            const total = item.totalAmount || item.finalAmount || item.total || 0;
            const itemsCount = item.items?.length || 1;

            return (
              <TouchableOpacity
                onPress={() => navigation.navigate('OrderDetail', { order: { ...item, id: rawId } })}
                activeOpacity={0.85}
                className="bg-white rounded-2xl p-3.5 mb-2.5 border border-[#e2e8f0] shadow-xs"
              >
                <View className="flex-row justify-between items-start mb-2">
                  <View>
                    <View className="flex-row items-center gap-1.5">
                      <Text className="text-xs font-black text-[#0f172a]">
                        Order #{orderNum}
                      </Text>
                      <View className="bg-[#f0fdf4] px-1.5 py-0.2 rounded border border-[#bbf7d0]">
                        <Text className="text-[8.5px] font-bold text-[#006948]">COD</Text>
                      </View>
                    </View>
                    <Text className="text-[10px] text-[#64748b] mt-0.5">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN') : 'Recent Order'}
                    </Text>
                  </View>
                  <StatusBadge status={item.status || item.orderStatus} />
                </View>

                <View className="py-2 border-y border-[#f1f5f9] my-1 flex-row justify-between items-center">
                  <View className="flex-row items-center gap-1">
                    <Icon name="inventory-2" size={14} color="#64748b" />
                    <Text className="text-xs text-[#475569] font-medium">
                      {itemsCount} {itemsCount === 1 ? 'item' : 'items'} in dispatch
                    </Text>
                  </View>
                  <Text className="text-sm font-black text-[#0f172a]">
                    ₹{total.toLocaleString('en-IN')}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center pt-1.5">
                  <Text className="text-[10px] text-[#006948] font-bold">
                    ⚡ 24-48h Factory Dispatch
                  </Text>
                  <View className="flex-row items-center gap-0.5">
                    <Text className="text-xs font-black text-[#006948]">View Order</Text>
                    <Icon name="chevron-right" size={16} color="#006948" />
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
