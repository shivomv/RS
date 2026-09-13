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

const LoginScreen = ({ navigation }) => {
  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState('user');
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  
  const { login } = useAuthStore();

  const handleLogin = () => {
    if (!mobile || mobile.length < 10) {
      Alert.alert('Invalid Mobile', 'Please enter a valid 10-digit mobile number');
      return;
    }

    if (showOtp && !otp) {
      Alert.alert('Invalid OTP', 'Please enter OTP');
      return;
    }

    login(mobile, role, 'temp-token');
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-slate-50">
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
        
        <ScrollView className="flex-1 px-7" contentContainerStyle={{ paddingVertical: 44 }}>
          {/* Header */}
          <View className="flex-row items-center mb-16">
            <View className="w-1 h-12 bg-blue-600 mr-4" />
            <View>
              <Text className="text-slate-950 text-xl font-black tracking-widest">RS INDUSTRIES</Text>
              <Text className="text-slate-400 text-xs tracking-widest mt-1">LOGISTICS COMMAND V1.0</Text>
            </View>
          </View>

          {/* Title */}
          <Text className="text-slate-950 text-3xl font-black mb-3">PROCUREMENT PORTAL</Text>
          <Text className="text-slate-500 leading-6 mb-9">
            Access the distribution ledger and manage your bulk inventory orders.
          </Text>

          {/* Role Selection */}
          <View className="flex-row bg-slate-200 rounded-xl p-1 mb-9">
            <ModeButton active={role === 'user'} label="Partner access" onPress={() => setRole('user')} />
            <ModeButton active={role === 'admin'} label="Admin access" onPress={() => setRole('admin')} />
          </View>

          {/* Mobile Input */}
          <Text className="text-slate-500 text-xs font-black tracking-widest mb-3">MOBILE CREDENTIALS</Text>
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

          {/* OTP Input */}
          {showOtp && (
            <>
              <Text className="text-slate-500 text-xs font-black tracking-widest mb-3">VERIFICATION CODE</Text>
              <View className="bg-white border-l-2 border-blue-600 px-4 mb-8">
                <TextInput
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  placeholder="Enter OTP"
                  placeholderTextColor="#94a3b8"
                  className="text-slate-900 text-lg py-4"
                  maxLength={6}
                />
              </View>
            </>
          )}

          {/* Submit Button */}
          <Pressable
            onPress={() => showOtp ? handleLogin() : setShowOtp(true)}
            className="bg-blue-600 rounded-xl py-4 items-center mt-8 shadow-lg shadow-blue-300"
          >
            <Text className="text-white font-black tracking-widest text-xs">
              {showOtp ? 'AUTHORIZE ACCESS' : 'REQUEST TOKEN'}
            </Text>
          </Pressable>

          {/* Register Link */}
          <Pressable
            onPress={() => navigation.navigate('Register')}
            className="items-center mt-7"
          >
            <Text className="text-slate-400 text-xs">
              NEW PARTNER? <Text className="text-blue-600 font-bold">ENROLL NOW</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const ModeButton = ({ active, label, onPress }) => (
  <Pressable
    onPress={onPress}
    className={`flex-1 py-3 rounded-lg items-center ${active ? 'bg-white shadow-sm' : ''}`}
  >
    <Text className={`text-xs font-bold ${active ? 'text-blue-600' : 'text-slate-500'}`}>{label}</Text>
  </Pressable>
);

export default LoginScreen;
