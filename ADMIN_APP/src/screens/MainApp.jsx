import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import SideDrawer from '../components/SideDrawer';
import AppHeader from '../components/AppHeader';

import DashboardScreen from './DashboardScreen';
import ProductManagementScreen from './ProductManagementScreen';
import OrderManagementScreen from './OrderManagementScreen';
import CategoryManagementScreen from './CategoryManagementScreen';
import BuyerManagementScreen from './BuyerManagementScreen';
import SupportTicketScreen from './SupportTicketScreen';
import BannerManagementScreen from './BannerManagementScreen';
import AboutManagementScreen from './AboutManagementScreen';
import AdminManagementScreen from './AdminManagementScreen';
import NotificationSettingsScreen from './NotificationSettingsScreen';
import ZoneManagementScreen from './ZoneManagementScreen';

import { adminApi } from '../services/api';
import { registerDeviceToken } from '../services/notificationService';
import { useAdminAuth } from '../store/adminAuthStore';
import { setTabListener } from '../navigation/navigationRef';

export default function MainApp() {
  const { session } = useAdminAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedOrderData, setSelectedOrderData] = useState(null);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    totalBuyers: 0,
  });

  // Listen to external tab switch events (e.g., from push notifications / WebSocket)
  useEffect(() => {
    const cleanup = setTabListener((tabKey, params) => {
      setActiveTab(tabKey);
      if (params?.selectedOrder || params?.orderId) {
        setSelectedOrderData(params.selectedOrder || { orderId: params.orderId });
      }
    });
    return cleanup;
  }, []);

  // Ensure admin device is registered with backend
  useEffect(() => {
    const adminIdentifier = session?.user?.mobile || 'primary_admin';
    registerDeviceToken(adminIdentifier).catch((err) => {
      console.warn('[MainApp] Auto-register device error:', err.message);
    });
  }, [session?.user?.mobile]);

  const loadStats = async () => {
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
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleSelectTab = (tabKey) => {
    setActiveTab(tabKey);
    setDrawerOpen(false);
  };

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardScreen onSelectTab={handleSelectTab} stats={stats} />;
      case 'products':
        return <ProductManagementScreen />;
      case 'orders':
        return <OrderManagementScreen route={{ params: { selectedOrder: selectedOrderData } }} onRefresh={loadStats} />;
      case 'categories':
        return <CategoryManagementScreen />;
      case 'zones':
        return <ZoneManagementScreen />;
      case 'buyers':
        return <BuyerManagementScreen />;
      case 'tickets':
        return <SupportTicketScreen />;
      case 'banners':
        return <BannerManagementScreen />;
      case 'about':
        return <AboutManagementScreen />;
      case 'admins':
        return <AdminManagementScreen />;
      case 'settings':
        return <NotificationSettingsScreen />;
      default:
        return <DashboardScreen onSelectTab={handleSelectTab} stats={stats} />;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 relative">
        <AppHeader
          activeTab={activeTab}
          onOpenDrawer={() => setDrawerOpen(true)}
        />

        <View className="flex-1">
          {renderActiveScreen()}
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
