import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { adminApi } from '../services/api';
import { BuyerCardSkeleton, SkeletonList } from '../components/Skeletons';

export default function BuyerManagementScreen({ buyers: initialBuyers = [] }) {
  const [buyerList, setBuyerList] = useState(initialBuyers);
  const [loading, setLoading] = useState(initialBuyers.length === 0);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBuyersData = async () => {
    try {
      const res = await adminApi.getBuyers().catch(() => []);
      setBuyerList(Array.isArray(res) ? res : (res?.data || []));
    } catch (e) {
      console.error('[BuyerManagementScreen] Fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBuyersData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBuyersData();
  };

  const [activeView, setActiveView] = useState('list');
  const [selectedBuyer, setSelectedBuyer] = useState(null);

  const openProfile = (b) => { setSelectedBuyer(b); setActiveView('view'); };

  /* ── BUYER PROFILE VIEW ── */
  if (activeView === 'view' && selectedBuyer) {
    return (
      <View className="flex-1 bg-background">
        <View className="bg-surface border-b border-border px-4 py-3 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3 flex-1 pr-2">
            <Pressable
              onPress={() => setActiveView('list')}
              className="w-10 h-10 rounded-2xl bg-input justify-center items-center border border-border active:opacity-70"
            >
              <Icon name="arrow-back" size={22} color="#006948" />
            </Pressable>
            <View className="flex-1">
              <Text className="text-base font-black text-ink" numberOfLines={1}>
                {selectedBuyer.shopName || selectedBuyer.name}
              </Text>
              <Text className="text-[10px] font-bold text-muted">B2B Buyer Account</Text>
            </View>
          </View>
          <View className="bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            <Text className="text-xs font-black text-emerald-600 uppercase">VERIFIED</Text>
          </View>
        </View>

        <ScrollView className="flex-1 p-5" contentContainerStyle={{ paddingBottom: 60 }}>
          <View className="bg-surface rounded-3xl p-5 mb-4 border border-border">
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-14 h-14 rounded-2xl bg-brand/10 justify-center items-center border border-brand/20">
                <Icon name="storefront" size={28} color="#006948" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-black text-ink">{selectedBuyer.shopName || 'RS Retail Partner Store'}</Text>
                <Text className="text-xs text-muted">Owner: {selectedBuyer.name || 'Store Manager'}</Text>
              </View>
            </View>

            <View className="border-t border-border pt-3">
              <View className="flex-row justify-between py-2 border-b border-border">
                <Text className="text-xs text-muted">Direct Contact:</Text>
                <Text className="text-xs font-black text-brand-dim">📞 {selectedBuyer.mobile}</Text>
              </View>
              <View className="flex-row justify-between py-2 border-b border-border">
                <Text className="text-xs text-muted">GSTIN Registration:</Text>
                <Text className="text-xs font-bold text-ink">{selectedBuyer.gstin || 'Not Provided'}</Text>
              </View>
              <View className="flex-row justify-between py-2 border-b border-border">
                <Text className="text-xs text-muted">Account Type:</Text>
                <Text className="text-xs font-bold text-ink">B2B Wholesale Buyer</Text>
              </View>
              <View className="py-2">
                <Text className="text-xs text-muted mb-1">Registered Shop Address:</Text>
                <Text className="text-xs font-bold text-ink leading-relaxed">
                  {selectedBuyer.address || 'Address Not Provided'}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  /* ── BUYER LIST VIEW ── */
  return (
    <View className="flex-1 bg-background">
      <View className="p-4 bg-surface border-b border-border">
        <Text className="text-base font-black text-ink">Registered B2B Partners</Text>
        <Text className="text-[10px] text-muted font-bold">Total Buyers: {buyerList.length}</Text>
      </View>

      <ScrollView
        className="flex-1 p-4"
        contentContainerStyle={{ paddingBottom: 60 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#006948" />}
      >
        {loading ? (
          <SkeletonList Component={BuyerCardSkeleton} count={4} />
        ) : buyerList.length === 0 ? (
          <View className="py-16 items-center">
            <Icon name="people" size={48} color="#cbd5e1" />
            <Text className="text-sm font-bold text-faint mt-3">No registered shopkeepers found</Text>
          </View>
        ) : (
          buyerList.map(b => (
            <Pressable key={b._id} onPress={() => openProfile(b)}
              className="bg-surface rounded-2xl p-4 mb-3 border border-border active:opacity-90">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center gap-2">
                  <Icon name="store" size={20} color="#006948" />
                  <Text className="text-sm font-black text-ink">{b.shopName || b.name}</Text>
                </View>
                <View className="bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                  <Text className="text-[10px] font-black text-emerald-600 uppercase">APPROVED</Text>
                </View>
              </View>
              <Text className="text-xs font-bold text-muted mb-1">Owner: {b.name}</Text>
              <Text className="text-xs font-bold text-brand-dim mb-2">📞 {b.mobile}</Text>
              <View className="flex-row items-center justify-between border-t border-border pt-2">
                <Text className="text-[10px] text-faint">GSTIN: {b.gstin || 'N/A'}</Text>
                <Text className="text-xs font-bold text-brand">View Account →</Text>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}
