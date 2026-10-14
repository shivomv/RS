import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { adminApi } from '../services/api';
import { OrderCardSkeleton, SkeletonList } from '../components/Skeletons';

export default function DashboardScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [ordRes, prodRes] = await Promise.all([
        adminApi.getOrders().catch(() => []),
        adminApi.getProducts().catch(() => []),
      ]);
      setOrders(Array.isArray(ordRes) ? ordRes : (ordRes?.data || []));
      setProducts(Array.isArray(prodRes) ? prodRes : (prodRes?.data || []));
    } catch (err) {
      console.error('[Dashboard] Error fetching data:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const totalRevenue = orders.reduce((sum, o) => {
    return String(o.status || '').toLowerCase() === 'cancelled' ? sum : sum + (o.totalAmount || o.total || 0);
  }, 0);

  const pendingOrders = orders.filter(o =>
    ['pending', ''].includes(String(o.status || '').toLowerCase())
  ).length;

  const getStatusColor = (st) => {
    switch (String(st || '').toLowerCase()) {
      case 'confirmed':   return '#3b82f6';
      case 'dispatching': return '#8b5cf6';
      case 'delivered':   return '#10b981';
      case 'cancelled':   return '#ef4444';
      default:            return '#f59e0b';
    }
  };

  const statCards = [
    { icon: 'payments',        color: '#10b981', label: 'Gross Revenue',  value: `\u20b9${totalRevenue.toLocaleString('en-IN')}`, valueColor: '#10b981' },
    { icon: 'shopping-bag',    color: '#3b82f6', label: 'Total Orders',   value: String(orders.length),   valueColor: '#0f172a' },
    { icon: 'pending-actions', color: '#ef4444', label: 'Action Pending', value: String(pendingOrders),   valueColor: '#ef4444' },
    { icon: 'inventory-2',     color: '#006948', label: 'Active Products',value: String(products.length), valueColor: '#0f172a' },
  ];

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#006948" />}
    >
      {/* Stats Summary Grid */}
      <View className="flex-row flex-wrap gap-3 mb-5">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <View key={i} className="flex-1 min-w-[140px] bg-surface rounded-3xl p-4 border border-border shadow-sm">
              <View className="w-9 h-9 rounded-xl bg-input mb-2" />
              <View className="w-20 h-3 bg-input rounded-md mb-2" />
              <View className="w-16 h-5 bg-input rounded-md" />
            </View>
          ))
        ) : (
          statCards.map((card) => (
            <View key={card.label} className="flex-1 min-w-[140px] bg-surface rounded-3xl p-4 border border-border shadow-sm">
              <View className="w-9 h-9 rounded-xl justify-center items-center mb-2" style={{ backgroundColor: `${card.color}15` }}>
                <Icon name={card.icon} size={20} color={card.color} />
              </View>
              <Text className="text-[10px] font-bold text-muted">{card.label}</Text>
              <Text className="text-lg font-black mt-0.5" style={{ color: card.valueColor }}>{card.value}</Text>
            </View>
          ))
        )}
      </View>

      {/* Recent Orders Feed */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-[11px] font-black text-faint uppercase tracking-wider">Recent Orders Feed</Text>
        <Pressable onPress={() => navigation.navigate('OrderList')}>
          <Text className="text-xs font-bold text-brand">View All →</Text>
        </Pressable>
      </View>

      {loading ? (
        <SkeletonList Component={OrderCardSkeleton} count={3} />
      ) : orders.length === 0 ? (
        <View className="py-12 items-center">
          <Icon name="receipt-long" size={40} color="#cbd5e1" />
          <Text className="text-sm text-faint font-semibold mt-3">No orders yet</Text>
        </View>
      ) : (
        orders.slice(0, 5).map((ord) => {
          const st = String(ord.status || 'pending').toLowerCase();
          const bc = getStatusColor(st);
          return (
            <Pressable
              key={ord._id || ord.orderId}
              onPress={() => navigation.navigate('OrderList', { selectedOrder: ord })}
              className="bg-surface rounded-2xl p-4 mb-3 border border-border flex-row items-center justify-between active:opacity-80 shadow-sm"
            >
              <View className="flex-1 pr-3">
                <View className="flex-row items-center gap-2 mb-1">
                  <Text className="text-xs font-black text-ink">Order #{ord.orderId || ord._id}</Text>
                  <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: `${bc}15` }}>
                    <Text className="text-[9px] font-black uppercase" style={{ color: bc }}>{st}</Text>
                  </View>
                </View>
                <Text className="text-xs font-bold text-muted">
                  {ord.buyerSnapshot?.name || ord.buyerName || 'Shopkeeper Account'}
                </Text>
              </View>
              <Text className="text-sm font-black text-brand-dim">₹{ord.totalAmount || ord.total || 0}</Text>
            </Pressable>
          );
        })
      )}
    </ScrollView>
  );
}
