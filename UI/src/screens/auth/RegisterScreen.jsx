import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useAuthStore } from '../../store/authStore';

const RegisterScreen = ({ navigation }) => {
  const [mobile, setMobile] = useState('');
  const [shopName, setShopName] = useState('');
  const [address, setAddress] = useState('');
  const { login } = useAuthStore();

  const handleRegister = () => {
    if (!mobile || mobile.length < 10 || !shopName || !address) {
      Alert.alert('Missing Fields', 'Please fill in all required fields');
      return;
    }

    login(mobile, 'user', 'temp-token');
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-slate-50">
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
        
        <ScrollView className="flex-1 px-7" contentContainerStyle={{ paddingVertical: 44 }}>
          {/* Back Button */}
          <Pressable
            onPress={() => navigation.goBack()}
            className="flex-row items-center mb-8"
          >
            <Icon name="arrow-left" size={20} color="#0f172a" />
            <Text className="text-slate-950 font-bold ml-3">BACK TO LOGIN</Text>
          </Pressable>

          {/* Header */}
          <View className="flex-row items-center mb-8">
            <View className="w-1 h-12 bg-blue-600 mr-4" />
            <View>
              <Text className="text-slate-950 text-xl font-black tracking-widest">RS INDUSTRIES</Text>
              <Text className="text-slate-400 text-xs tracking-widest mt-1">PARTNER REGISTRATION</Text>
            </View>
          </View>

          {/* Title */}
          <Text className="text-slate-950 text-3xl font-black mb-3">PARTNER REGISTRATION</Text>
          <Text className="text-slate-500 leading-6 mb-9">
            Join our distribution network. Fill in your details to get started.
          </Text>

          {/* Mobile */}
          <Text className="text-slate-500 text-xs font-black tracking-widest mb-3">MOBILE NUMBER</Text>
          <View className="bg-white border-l-2 border-blue-600 px-4 mb-8">
            <TextInput
              value={mobile}
              onChangeText={setMobile}
              keyboardType="phone-pad"
              placeholder="10-digit mobile number"
              placeholderTextColor="#94a3b8"
              className="text-slate-900 text-lg py-4"
              maxLength={10}
            />
          </View>

          {/* Shop Name */}
          <Text className="text-slate-500 text-xs font-black tracking-widest mb-3">SHOP NAME</Text>
          <View className="bg-white border-l-2 border-blue-600 px-4 mb-8">
            <TextInput
              value={shopName}
              onChangeText={setShopName}
              placeholder="Your shop name"
              placeholderTextColor="#94a3b8"
              className="text-slate-900 text-lg py-4"
            />
          </View>

          {/* Address */}
          <Text className="text-slate-500 text-xs font-black tracking-widest mb-3">DELIVERY ADDRESS</Text>
          <View className="bg-white border-l-2 border-blue-600 px-4 mb-9">
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder="Complete delivery address"
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={3}
              className="text-slate-900 text-lg py-4"
            />
          </View>

          {/* Submit Button */}
          <Pressable
            onPress={handleRegister}
            className="bg-blue-600 rounded-xl py-4 items-center"
          >
            <Text className="text-white font-black tracking-wider text-xs">SUBMIT REGISTRATION</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default RegisterScreen;
