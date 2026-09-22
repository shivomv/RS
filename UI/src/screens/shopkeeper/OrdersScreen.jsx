import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView, BackHandler, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RSLogo from '../../components/RSLogo';
import { OrderCardSkeleton } from '../../components/Skeleton';
import { useOrderStore } from '../../store/orderStore';
import { useAuthStore } from '../../store/authStore';

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
  const { session } = useAuthStore();
  const { orders, fetchOrders } = useOrderStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Hardware Android Back Button Handler
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
      console.error('[Orders] Refresh error:', err.message);
    } finally {
      setRefreshing(false);
    }
  };

  // Render Guest View if User is Not Logged In
  if (!session) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-[#faf8ff]">
        {/* Top Header */}
        <View className="bg-white border-b border-[#dae2fd] px-4 py-3 flex-row items-center justify-between shadow-sm z-10">
          <RSLogo size="md" />
          <TouchableOpacity
            onPress={() => navigation.navigate('Login', { returnScreen: 'Orders' })}
            activeOpacity={0.7}
            className="bg-[#006948] px-3.5 py-1.5 rounded-full flex-row items-center gap-1 shadow-sm"
          >
            <Icon name="login" size={16} color="#ffffff" />
            <Text className="text-xs text-white font-bold">Log In</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 24, paddingBottom: 60, alignItems: 'center' }}
          className="flex-1"
        >
          <View className="w-20 h-20 rounded-full bg-[#006948]/10 justify-center items-center mb-4 mt-8">
            <Icon name="receipt-long" size={44} color="#006948" />
          </View>
          <Text className="text-lg font-black text-[#131b2e] text-center">
            Log In to View Your Orders
          </Text>
          <Text className="text-xs text-[#3d4a42] text-center mt-2 px-2 leading-relaxed">
            Please log in with your registered mobile number to track dispatches, inspect shipment progress, and download GST tax invoices.
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login', { returnScreen: 'Orders' })}
            activeOpacity={0.85}
            className="bg-[#006948] w-full rounded-2xl py-3.5 items-center justify-center flex-row gap-2 mt-8 shadow-md"
          >
            <Icon name="login" size={20} color="#ffffff" />
            <Text className="text-sm text-white font-extrabold">Log In / Register</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-[#faf8ff]">
      {/* Top Header */}
      <View className="bg-white border-b border-[#dae2fd] px-4 py-3 flex-row items-center justify-between shadow-sm z-10">
        <RSLogo size="md" />
        <View className="bg-[#006948]/10 px-2.5 py-1 rounded-full flex-row items-center gap-1">
          <Icon name="receipt-long" size={14} color="#006948" />
          <Text className="text-xs text-[#006948] font-bold">{orders.length} Orders</Text>
        </View>
      </View>

      {loading ? (
        <View className="p-4 gap-y-3">
          <OrderCardSkeleton />
          <OrderCardSkeleton />
          <OrderCardSkeleton />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item, idx) => item._id || item.id || String(idx)}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
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
            return (
              <TouchableOpacity
                onPress={() => navigation.navigate('OrderDetail', { order: { ...item, id: rawId } })}
                activeOpacity={0.7}
                className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-[#eaedff]"
              >
                <View className="flex-row justify-between items-start mb-2">
                  <View>
                    <View className="flex-row items-center gap-2">
                      <Text className="text-xs font-extrabold text-[#131b2e]">
                        Order #{orderNum}
                      </Text>
                      {item.gstInvoice && (
                        <View className="bg-[#e2e7ff] px-1.5 py-0.5 rounded">
                          <Text className="text-[9px] text-[#131b2e] font-semibold">GST Claimed</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-[10px] text-[#3d4a42] mt-0.5">
                      Placed on {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN') : 'Recent'}
                    </Text>
                  </View>
                  <StatusBadge status={item.status || item.orderStatus} />
                </View>

                <View className="py-2 border-y border-[#f2f3ff] my-1 flex-row justify-between items-center">
                  <Text className="text-xs text-[#3d4a42]">
                    {item.items?.length || 1} SKUs Wholesale Dispatch
                  </Text>
                  <Text className="text-sm font-extrabold text-[#131b2e]">
                    ₹{(item.totalAmount || item.finalAmount || 1825).toLocaleString('en-IN')}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center pt-1">
                  <Text className="text-[10px] text-[#006948] font-bold">Track Shipment & Invoice</Text>
                  <Icon name="chevron-right" size={18} color="#006948" />
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
