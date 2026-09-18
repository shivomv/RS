import React from 'react';
import { View, Text, Pressable, ScrollView, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RSLogo from '../../components/RSLogo';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useOrderStore } from '../../store/orderStore';
import { apiClient } from '../../services/api';
import ENV from '../../config/env';

export default function ProfileScreen({ navigation }) {
  const { session, logout } = useAuthStore();
  const { items } = useCartStore();
  const { orders } = useOrderStore();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout from RS Industries?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: () => {
          logout();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#faf8ff]">
      {/* Top Header */}
      <View className="bg-white border-b border-[#dae2fd] px-4 py-3 flex-row items-center justify-between shadow-sm">
        <RSLogo size="md" />
        <View className="bg-[#99efe5] px-2.5 py-1 rounded-full">
          <Text className="text-xs text-[#006f67] font-bold">GST Verified</Text>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* User Card */}
        <View className="bg-[#006948] px-6 py-6 items-center">
          <View className="w-20 h-20 rounded-full overflow-hidden border-2 border-white mb-3 shadow-md bg-white/20 justify-center items-center">
            {session ? (
              <Image
                source={{
                  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDO2ijUAJMNwM-QODTNqSRCuJgJck70ZUjFztadUdQ6FY5QFQu1PRfZXrHv48QsDfm2odixXZVku1HckHrgpzBJXDjUuSQvqGsjB-N20z0l40gEeMYHfDd2UGxvKusUOYDZockQrFLPsfy6Mrv8tAG9ouXqm6-sobkEwc13Pinr0UynpcUjCcmLovh45QuDwt8IRv9A2Z1Yh6Uxjz6IeRLO0kDvVPUD7AcwYTdY6Ts-67cMaQugjx_D',
                }}
                className="w-full h-full"
              />
            ) : (
              <Icon name="person" size={40} color="#ffffff" />
            )}
          </View>
          <Text className="text-white text-lg font-bold">
            {session ? session.user?.name || 'Registered B2B Partner' : 'Guest Buyer Account'}
          </Text>
          <Text className="text-[#85f8c4] text-xs font-semibold mt-0.5">
            {session ? `Mobile: ${session.mobile} • Role: ${session.role}` : 'Sign in to access B2B credit & orders'}
          </Text>
        </View>

        {/* Quick Stats */}
        <View className="px-4 py-4">
          <Text className="text-sm font-bold text-[#131b2e] mb-3">Procurement Overview</Text>
          <View className="flex-row gap-3">
            <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-[#eaedff]">
              <Icon name="shopping-bag" size={24} color="#006948" />
              <Text className="text-xl font-extrabold text-[#131b2e] mt-2">{items.length}</Text>
              <Text className="text-[10px] text-[#3d4a42]">Items in Cart</Text>
            </View>
            <View className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-[#eaedff]">
              <Icon name="receipt-long" size={24} color="#006948" />
              <Text className="text-xl font-extrabold text-[#131b2e] mt-2">{orders.length}</Text>
              <Text className="text-[10px] text-[#3d4a42]">B2B Orders</Text>
            </View>
          </View>
        </View>

        {/* Account & Company Info */}
        <View className="px-4 gap-2.5">
          <Text className="text-sm font-bold text-[#131b2e] mb-1">Company Details</Text>

          {/* Debug API Base URL Card */}
          <View className="bg-[#f2f3ff] rounded-2xl p-3.5 border border-[#dae2fd]">
            <View className="flex-row items-center gap-2 mb-1">
              <Icon name="dns" size={16} color="#006948" />
              <Text className="text-xs font-bold text-[#006948]">Active API Base URL (Debug Mode)</Text>
            </View>
            <Text className="text-[11px] font-mono font-bold text-[#131b2e]" numberOfLines={2}>
              {apiClient?.defaults?.baseURL || ENV?.API_BASE_URL || 'https://rs-gamma-olive.vercel.app/api'}
            </Text>
          </View>

          <View className="bg-white rounded-2xl p-3.5 shadow-sm flex-row items-center border border-[#eaedff]">
            <Icon name="business" size={20} color="#006948" />
            <View className="flex-1 ml-3">
              <Text className="text-[10px] text-[#3d4a42]">Account Status</Text>
              <Text className="text-xs font-bold text-[#131b2e] mt-0.5">
                {session ? `Authenticated (${session.role})` : 'Guest Mode (Unauthenticated)'}
              </Text>
            </View>
          </View>

          <Pressable
            onPress={() => navigation.navigate('AddressList')}
            className="bg-white rounded-2xl p-3.5 shadow-sm flex-row items-center justify-between border border-[#eaedff]"
          >
            <View className="flex-row items-center gap-3">
              <Icon name="location-on" size={20} color="#006948" />
              <View>
                <Text className="text-[10px] text-[#3d4a42]">Delivery Facilities</Text>
                <Text className="text-xs font-bold text-[#131b2e]">Manage Saved Godowns & Plants</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={20} color="#6d7a72" />
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate('Outstanding')}
            className="bg-white rounded-2xl p-3.5 shadow-sm flex-row items-center justify-between border border-[#eaedff]"
          >
            <View className="flex-row items-center gap-3">
              <Icon name="account-balance-wallet" size={20} color="#006948" />
              <View>
                <Text className="text-[10px] text-[#3d4a42]">B2B Credit Ledger</Text>
                <Text className="text-xs font-bold text-[#131b2e]">View Pending Invoices & Credit Limit</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={20} color="#6d7a72" />
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate('BulkPriceOptimizer')}
            className="bg-[#f2f3ff] rounded-2xl p-3.5 flex-row items-center justify-between border border-[#e2e7ff]"
          >
            <View className="flex-row items-center gap-3">
              <Icon name="calculate" size={20} color="#006948" />
              <Text className="text-xs font-bold text-[#006948]">Bulk Price Optimizer Tool</Text>
            </View>
            <Icon name="chevron-right" size={20} color="#006948" />
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate('Support')}
            className="bg-white rounded-2xl p-3.5 shadow-sm flex-row items-center justify-between border border-[#eaedff]"
          >
            <View className="flex-row items-center gap-3">
              <Icon name="headset-mic" size={20} color="#006948" />
              <View>
                <Text className="text-[10px] text-[#3d4a42]">Help & Support</Text>
                <Text className="text-xs font-bold text-[#131b2e]">Dispatch Manager & GST FAQs</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={20} color="#6d7a72" />
          </Pressable>

          {session ? (
            <Pressable
              onPress={handleLogout}
              className="bg-[#ba1a1a] rounded-xl py-3 mt-4 flex-row items-center justify-center gap-2 shadow-sm active:opacity-90"
            >
              <Icon name="logout" size={18} color="#ffffff" />
              <Text className="text-white font-bold text-xs">Logout Account</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => navigation.navigate('Login')}
              className="bg-[#006948] rounded-xl py-3 mt-4 flex-row items-center justify-center gap-2 shadow-sm active:opacity-90"
            >
              <Icon name="login" size={18} color="#ffffff" />
              <Text className="text-white font-bold text-xs">Sign In / Register with OTP</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
