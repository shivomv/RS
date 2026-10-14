import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SideDrawer from '../components/SideDrawer';
import AppHeader from '../components/AppHeader';
import AppNavigator from '../navigation/AppNavigator';
import { adminApi } from '../services/api';
import { navigate } from '../navigation/navigationRef';

export default function MainApp() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    totalBuyers: 0,
  });

  useEffect(() => {
    (async () => {
      try {
        const [ordRes, prodRes, shopRes] = await Promise.all([
          adminApi.getOrders().catch(() => []),
          adminApi.getProducts().catch(() => []),
          adminApi.getBuyers().catch(() => []),
        ]);
        const orders = Array.isArray(ordRes) ? ordRes : (ordRes?.data || []);
        const products = Array.isArray(prodRes) ? prodRes : (prodRes?.data || []);
        const buyers = Array.isArray(shopRes) ? shopRes : (shopRes?.data || []);

        const totalRevenue = orders.reduce((s, o) =>
          String(o.status || '').toLowerCase() === 'cancelled' ? s : s + (o.totalAmount || o.total || 0), 0);
        const pendingOrders = orders.filter(o => ['pending', ''].includes(String(o.status || '').toLowerCase())).length;

        setStats({ totalRevenue, totalOrders: orders.length, pendingOrders, totalProducts: products.length, totalBuyers: buyers.length });
      } catch (_) {}
    })();
  }, []);

  const handleSelectTab = (tabKey) => {
    setActiveTab(tabKey);
    setDrawerOpen(false);

    // Map tabKey to React Navigation screen names
    const screenMap = {
      dashboard: 'Dashboard',
      products: 'ProductList',
      orders: 'OrderList',
      categories: 'CategoryList',
      buyers: 'BuyerList',
      tickets: 'TicketList',
      banners: 'BannerList',
      about: 'AboutList',
    };

    const targetScreen = screenMap[tabKey] || 'Dashboard';
    navigate(targetScreen);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 relative">
        <AppHeader
          activeTab={activeTab}
          onOpenDrawer={() => setDrawerOpen(true)}
        />

        <View className="flex-1">
          <AppNavigator />
        </View>

        <SideDrawer
          visible={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onOpen={() => setDrawerOpen(true)}
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          stats={stats}
        />
      </View>
    </SafeAreaView>
  );
}
