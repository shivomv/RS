import React from 'react';
import { View, Text, ScrollView, Pressable, StatusBar, Alert } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';

const ProfileScreen = ({ navigation }) => {
  const { logout } = useAuthStore();
  const { clearCart } = useCartStore();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          clearCart();
          logout();
        },
      },
    ]);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-slate-50">
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

        <ScrollView className="flex-1 px-5">
          <View className="py-4">
            <Text className="text-xs tracking-widest font-bold text-slate-500">MY ACCOUNT</Text>
            <Text className="text-2xl font-black text-slate-950 mt-1">PARTNER PROFILE</Text>
          </View>

          {/* Avatar */}
          <View className="items-center py-8">
            <View className="w-24 h-24 rounded-full bg-blue-100 justify-center items-center">
              <Text className="text-3xl font-black text-blue-600">SV</Text>
            </View>
            <Text className="text-2xl font-black text-slate-950 mt-4">Suresh Kumar</Text>
            <Text className="text-slate-500 mt-1">Suresh Kirana Store</Text>
          </View>

          {/* Profile Info */}
          <ProfileRow icon="phone" label="Mobile" value="+91 9876543210" />
          <ProfileRow icon="map-pin" label="Delivery address" value="Shop No. 12, Main Market, Delhi" />
          <ProfileRow icon="award" label="Account tier" value="Gold partner" />

          {/* Outstanding Button */}
          <Pressable
            onPress={() => navigation.navigate('Outstanding')}
            className="flex-row items-center justify-between bg-white rounded-2xl px-4 py-3 mt-2"
          >
            <View className="flex-row items-center">
              <Icon name="credit-card" size={20} color="#003E6F" />
              <Text className="text-slate-950 font-bold ml-4">View outstanding balance</Text>
            </View>
            <Icon name="chevron-right" size={18} color="#94a3b8" />
          </Pressable>

          {/* Logout Button */}
          <Pressable
            onPress={handleLogout}
            className="flex-row items-center justify-center border border-red-200 rounded-lg py-4 mt-6"
          >
            <Icon name="log-out" size={18} color="#dc2626" />
            <Text className="text-red-600 font-bold ml-2">LOG OUT</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const ProfileRow = ({ icon, label, value }) => (
  <View className="flex-row items-center bg-white rounded-2xl px-4 py-3 mb-3">
    <Icon name={icon} size={20} color="#003E6F" />
    <View className="ml-4 flex-1">
      <Text className="text-xs text-slate-500 font-semibold">{label}</Text>
      <Text className="text-sm font-bold text-slate-950 mt-1">{value}</Text>
    </View>
  </View>
);

export default ProfileScreen;
