import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useShopkeeperStore } from '../../store/shopkeeperStore';

const ShopkeeperManagementScreen = ({ navigation }) => {
  const { shopkeepers, fetchShopkeepers } = useShopkeeperStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchShopkeepers();
  }, [fetchShopkeepers]);

  const filtered = shopkeepers.filter(
    (s) =>
      (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.mobile || '').includes(search) ||
      (s.location || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
        <View className="px-5 py-4 flex-row items-center border-b border-slate-800">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
            <Icon name="arrow-left" size={24} color="#60a5fa" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold flex-1">Shopkeeper Partners</Text>
        </View>

        <View className="px-5 py-3">
          <View className="flex-row items-center bg-slate-900 rounded-lg px-3 py-2 border border-slate-800">
            <Icon name="search" size={18} color="#64748b" />
            <TextInput
              className="flex-1 ml-2 text-white py-1"
              placeholder="Search partner or location..."
              placeholderTextColor="#64748b"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-3">
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1">
                  <Text className="text-white font-bold text-base">{item.name}</Text>
                  <Text className="text-slate-400 text-xs mt-1">{item.mobile}</Text>
                </View>
                <View className={`px-2.5 py-1 rounded-full ${item.status === 'Active' ? 'bg-emerald-950 border border-emerald-800' : 'bg-amber-950 border border-amber-800'}`}>
                  <Text className={`text-xs font-semibold ${item.status === 'Active' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {item.status}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center mt-2 pt-3 border-t border-slate-800 justify-between">
                <View className="flex-row items-center">
                  <Icon name="map-pin" size={14} color="#64748b" />
                  <Text className="text-slate-400 text-xs ml-1">{item.location}</Text>
                </View>
                <Text className="text-blue-400 text-xs font-semibold">{item.totalOrders} Orders</Text>
              </View>
            </View>
          )}
        />
      </SafeAreaView>
  );
};

export default ShopkeeperManagementScreen;
