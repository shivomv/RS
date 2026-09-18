import React, { useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useAuthStore } from '../../store/authStore';
import { useOrderStore } from '../../store/orderStore';
import { useProductStore } from '../../store/productStore';
import { useShopkeeperStore } from '../../store/shopkeeperStore';

const AdminDashboardScreen = ({ navigation }) => {
  const { logout } = useAuthStore();
  const { orders, fetchOrders } = useOrderStore();
  const { products, fetchProducts } = useProductStore();
  const { shopkeepers, fetchShopkeepers } = useShopkeeperStore();

  useEffect(() => {
    fetchOrders();
    fetchProducts();
    fetchShopkeepers();
  }, [fetchOrders, fetchProducts, fetchShopkeepers]);

  const totalRev = orders.reduce((sum, o) => sum + (o.total || o.totalAmount || 0), 0);
  const revenueDisplay = totalRev >= 1000 ? `₹${(totalRev / 1000).toFixed(1)}K` : `₹${totalRev}`;
  const lowStockCount = products.filter((p) => (p.stockQuantity ?? 100) < 50).length;

  const handleLogout = () => {
    logout();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
        <StatusBar barStyle="light-content" backgroundColor="#020617" />

        <ScrollView className="flex-1 px-5 pb-7">
          <View className="flex-row justify-between items-center mt-6">
            <View>
              <Text className="text-blue-400 text-xs font-black tracking-widest">RS INDUSTRIES / ADMIN</Text>
              <Text className="text-white text-3xl font-black mt-1">Operations overview</Text>
            </View>
            <Pressable onPress={handleLogout} className="bg-slate-800 p-3 rounded-xl active:opacity-80">
              <Icon name="log-out" size={20} color="#f87171" />
            </Pressable>
          </View>
          <Text className="text-slate-400 mt-2">Monitor inventory, partners, and fulfilment.</Text>

          {/* Dynamic Stats Grid */}
          <View className="flex-row flex-wrap justify-between mt-8 mb-8">
            <AdminStat label="TOTAL ORDERS" value={String(orders.length)} />
            <AdminStat label="REVENUE" value={revenueDisplay} />
            <AdminStat label="PARTNERS" value={String(shopkeepers.length)} />
            <AdminStat label="LOW STOCK" value={String(lowStockCount).padStart(2, '0')} />
          </View>

          {/* Management Actions */}
          <Text className="text-white text-base font-black mb-4">MANAGEMENT</Text>

          <AdminAction
            icon="package"
            label="Product catalog"
            detail="Manage products & inventory"
            onPress={() => navigation.navigate('ProductManagement')}
          />
          <AdminAction
            icon="users"
            label="Shopkeepers"
            detail="Manage partner accounts"
            onPress={() => navigation.navigate('ShopkeeperManagement')}
          />
        </ScrollView>
      </SafeAreaView>
  );
};

const AdminStat = ({ label, value }) => (
  // eslint-disable-next-line react-native/no-inline-styles
  <View style={{ width: '48%' }} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-3">
    <Text className="text-slate-500 text-xs font-bold tracking-wider">{label}</Text>
    <Text className="text-white text-2xl font-black mt-2">{value}</Text>
  </View>
);

const AdminAction = ({ icon, label, detail, onPress }) => (
  <Pressable
    onPress={onPress}
    className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-3 flex-row items-center"
  >
    <View className="w-11 h-11 bg-blue-950 rounded-xl justify-center items-center">
      <Icon name={icon} size={20} color="#60a5fa" />
    </View>
    <View className="ml-4 flex-1">
      <Text className="text-white font-bold">{label}</Text>
      <Text className="text-slate-500 text-xs mt-1">{detail}</Text>
    </View>
    <Icon name="chevron-right" size={18} color="#64748b" />
  </Pressable>
);

export default AdminDashboardScreen;
