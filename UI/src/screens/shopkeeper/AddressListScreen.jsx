import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RSLogo from '../../components/RSLogo';

export default function AddressListScreen({ navigation }) {
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
    <SafeAreaView className="flex-1 bg-[#faf8ff]">
      {/* Header */}
      <View className="bg-white border-b border-[#dae2fd] px-4 py-3 flex-row items-center justify-between shadow-sm">
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => navigation.goBack()}
            className="w-9 h-9 rounded-full bg-[#f2f3ff] justify-center items-center active:opacity-70"
          >
            <Icon name="arrow-back" size={20} color="#131b2e" />
          </Pressable>
          <Text className="text-base font-bold text-[#131b2e]">Delivery Facilities</Text>
        </View>
        <RSLogo size="sm" showText={false} />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-xs font-bold text-[#131b2e]">Saved Locations ({addresses.length})</Text>
          <Pressable
            onPress={() => navigation.navigate('AddAddress')}
            className="flex-row items-center gap-1 bg-[#006948] px-3 py-1.5 rounded-lg active:opacity-80 shadow-sm"
          >
            <Icon name="add" size={16} color="#ffffff" />
            <Text className="text-[10px] text-white font-bold uppercase">Add Facility</Text>
          </Pressable>
        </View>

        {addresses.map((item) => (
          <View
            key={item.id}
            className={`bg-white rounded-2xl p-4 mb-3 border shadow-sm ${
              item.isDefault ? 'border-[#006948]' : 'border-[#eaedff]'
            }`}
          >
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-2">
                <Text className="text-xs font-bold text-[#131b2e]">{item.title}</Text>
                {item.isDefault && (
                  <View className="bg-[#99efe5] px-2 py-0.5 rounded">
                    <Text className="text-[9px] text-[#006f67] font-bold">DEFAULT</Text>
                  </View>
                )}
              </View>
              <Pressable onPress={() => handleDelete(item.id)}>
                <Icon name="delete-outline" size={18} color="#ba1a1a" />
              </Pressable>
            </View>

            <Text className="text-xs text-[#3d4a42] mb-2 leading-relaxed">{item.address}</Text>
            <Text className="text-[10px] text-[#6d7a72] mb-3">
              Type: {item.type} • Phone: {item.contact}
            </Text>

            {!item.isDefault && (
              <Pressable
                onPress={() => handleSetDefault(item.id)}
                className="self-start bg-[#f2f3ff] px-3 py-1.5 rounded-lg border border-[#dae2fd] active:opacity-80"
              >
                <Text className="text-[10px] text-[#006948] font-bold">Set as Default Facility</Text>
              </Pressable>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
