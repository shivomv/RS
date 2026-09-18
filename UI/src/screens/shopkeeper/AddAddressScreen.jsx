import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RSLogo from '../../components/RSLogo';

export default function AddAddressScreen({ navigation }) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [phone, setPhone] = useState('');

  const handleSave = () => {
    if (!name || !address || !pincode) {
      Alert.alert('Missing Fields', 'Please enter Facility Name, Street Address, and Pincode.');
      return;
    }

    Alert.alert('Facility Saved', `New delivery facility "${name}" added successfully.`, [
      { text: 'OK', onPress: () => navigation.goBack() },
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
          <Text className="text-base font-bold text-[#131b2e]">Add New Facility</Text>
        </View>
        <RSLogo size="sm" showText={false} />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View className="bg-white rounded-2xl p-4 shadow-sm border border-[#eaedff] gap-4">
          <View>
            <Text className="text-xs font-bold text-[#131b2e] mb-1.5">Facility / Godown Name *</Text>
            <TextInput
              placeholder="e.g. Peenya Factory Warehouse"
              value={name}
              onChangeText={setName}
              className="bg-[#f2f3ff] rounded-xl px-3 h-11 text-xs text-[#131b2e]"
            />
          </View>

          <View>
            <Text className="text-xs font-bold text-[#131b2e] mb-1.5">Full Street Address *</Text>
            <TextInput
              placeholder="Plot/Shed No, Road Name, Area"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={3}
              className="bg-[#f2f3ff] rounded-xl px-3 py-2 text-xs text-[#131b2e] min-h-[70px]"
            />
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-xs font-bold text-[#131b2e] mb-1.5">Landmark</Text>
              <TextInput
                placeholder="e.g. Near Bus Stand"
                value={landmark}
                onChangeText={setLandmark}
                className="bg-[#f2f3ff] rounded-xl px-3 h-11 text-xs text-[#131b2e]"
              />
            </View>
            <View className="w-32">
              <Text className="text-xs font-bold text-[#131b2e] mb-1.5">Pincode *</Text>
              <TextInput
                placeholder="560038"
                keyboardType="numeric"
                maxLength={6}
                value={pincode}
                onChangeText={setPincode}
                className="bg-[#f2f3ff] rounded-xl px-3 h-11 text-xs text-[#131b2e]"
              />
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-xs font-bold text-[#131b2e] mb-1.5">City</Text>
              <TextInput
                value={city}
                onChangeText={setCity}
                className="bg-[#f2f3ff] rounded-xl px-3 h-11 text-xs text-[#131b2e]"
              />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-bold text-[#131b2e] mb-1.5">Facility Contact Phone</Text>
              <TextInput
                placeholder="+91 98765 00000"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                className="bg-[#f2f3ff] rounded-xl px-3 h-11 text-xs text-[#131b2e]"
              />
            </View>
          </View>

          <Pressable
            onPress={handleSave}
            className="bg-[#006948] rounded-xl py-3.5 mt-2 items-center shadow-sm active:opacity-90"
          >
            <Text className="text-white font-bold text-xs uppercase tracking-wider">Save Delivery Facility</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
