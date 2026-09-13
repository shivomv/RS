import React from 'react';
import { View, Text, ScrollView, Pressable, StatusBar } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';

const AdminDashboardScreen = ({ navigation }) => {
  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-slate-950">
        <StatusBar barStyle="light-content" backgroundColor="#020617" />

        <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 30 }}>
          <Text className="text-blue-400 text-xs font-black tracking-widest mt-8">RS INDUSTRIES / ADMIN</Text>
          <Text className="text-white text-3xl font-black mt-3">Operations overview</Text>
          <Text className="text-slate-400 mt-2">Monitor inventory, partners, and fulfilment.</Text>

          {/* Stats Grid */}
          <View className="flex-row flex-wrap justify-between mt-8 mb-8">
            <AdminStat label="ORDERS TODAY" value="24" />
            <AdminStat label="REVENUE" value="₹84.2K" />
            <AdminStat label="PARTNERS" value="128" />
            <AdminStat label="LOW STOCK" value="07" />
          </View>

          {/* Management Actions */}
          <Text className="text-white text-base font-black mb-4">MANAGEMENT</Text>

          <AdminAction
            icon="package"
            label="Product catalog"
            detail="24 active SKUs"
            onPress={() => navigation.navigate('ProductManagement')}
          />
          <AdminAction
            icon="users"
            label="Shopkeepers"
            detail="Manage partner accounts"
            onPress={() => navigation.navigate('ShopkeeperManagement')}
          />
          <AdminAction
            icon="truck"
            label="Order queue"
            detail="12 orders need attention"
            onPress={() => {}}
          />
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const AdminStat = ({ label, value }) => (
  <View className="bg-slate-900 border border-slate-800 rounded-2xl p-4 w-[48%] mb-3">
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
