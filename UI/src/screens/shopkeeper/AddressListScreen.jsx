import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RSLogo from '../../components/RSLogo';
import { AddressSkeleton } from '../../components/Skeleton';
import { api } from '../../services/api';

export default function AddressListScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState([
    {
      id: '1',
      title: 'Indiranagar Facilities Ltd (Default)',
      address: 'Plot 42, 10th Main, Indiranagar, Bengaluru, Karnataka - 560038',
      type: 'Central Warehouse',
      contact: '+91 98765 43210',
      isDefault: true,
    },
    {
      id: '2',
      title: 'Peenya Factory Godown',
      address: 'Shed 14, Industrial Suburb, Peenya 1st Stage, Bengaluru - 560058',
      type: 'Manufacturing Plant',
      contact: '+91 98765 99887',
      isDefault: false,
    },
    {
      id: '3',
      title: 'Whitefield Commercial Office',
      address: 'Unit 302, Tech Park Tower, EPIP Zone, Whitefield, Bengaluru - 560066',
      type: 'Corporate Office',
      contact: '+91 98765 11223',
      isDefault: false,
    },
  ]);

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
    let isMounted = true;
    setLoading(true);
    const timer = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 400);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  const handleSetDefault = (id) => {
    setAddresses((prev) =>
      prev.map((item) => ({
        ...item,
        isDefault: item.id === id,
      }))
    );
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Address', 'Are you sure you want to remove this delivery facility?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        onPress: () => setAddresses((prev) => prev.filter((item) => item.id !== id)),
        style: 'destructive',
      },
    ]);
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-[#faf8ff]">
      {/* Header */}
      <View className="bg-white border-b border-[#dae2fd] px-4 py-3 flex-row items-center justify-between shadow-sm z-10">
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('ShopHome');
              }
            }}
            activeOpacity={0.7}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            className="w-9 h-9 rounded-full bg-[#f2f3ff] justify-center items-center border border-[#dae2fd]"
          >
            <Icon name="arrow-back" size={20} color="#131b2e" />
          </TouchableOpacity>
          <RSLogo size="sm" showText={false} />
          <Text className="text-base font-bold text-[#131b2e] ml-1">Shipping Addresses</Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('AddAddress')}
          activeOpacity={0.7}
          className="bg-[#006948] px-3 py-1.5 rounded-full flex-row items-center gap-1 shadow-sm"
        >
          <Icon name="add" size={16} color="#ffffff" />
          <Text className="text-xs text-white font-bold">Add Address</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      >
        <Text className="text-xs font-black text-[#131b2e] uppercase tracking-wider mb-3">
          Saved Facilities & Warehouses ({addresses.length})
        </Text>

        {loading ? (
          <View className="gap-y-3">
            <AddressSkeleton />
            <AddressSkeleton />
            <AddressSkeleton />
          </View>
        ) : (
          addresses.map((item) => (
            <View
              key={item.id}
              className={`bg-white rounded-2xl p-4 mb-3 shadow-sm border ${
                item.isDefault ? 'border-[#006948]' : 'border-[#eaedff]'
              }`}
            >
              <View className="flex-row justify-between items-start mb-1.5">
                <View className="flex-row items-center gap-2 flex-1 pr-2">
                  <Icon name="business" size={18} color="#006948" />
                  <Text className="text-xs font-bold text-[#131b2e]" numberOfLines={1}>
                    {item.title}
                  </Text>
                </View>
                {item.isDefault ? (
                  <View className="bg-[#85f8c4] px-2 py-0.5 rounded-md">
                    <Text className="text-[9px] text-[#002114] font-bold uppercase">Default</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => handleSetDefault(item.id)}
                    activeOpacity={0.7}
                    className="bg-[#f2f3ff] px-2 py-0.5 rounded-md"
                  >
                    <Text className="text-[9px] text-[#006948] font-bold">Set Default</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Text className="text-xs text-[#3d4a42] leading-relaxed mb-2">{item.address}</Text>

              <View className="flex-row justify-between items-center pt-2 border-t border-[#f2f3ff]">
                <Text className="text-[10px] text-[#6d7a72] font-semibold">Contact: {item.contact}</Text>

                <TouchableOpacity
                  onPress={() => handleDelete(item.id)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  className="p-1"
                >
                  <Icon name="delete-outline" size={18} color="#ba1a1a" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
