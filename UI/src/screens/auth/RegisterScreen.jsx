import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useAuthStore } from '../../store/authStore';

export default function RegisterScreen({ navigation }) {
  const [shopName, setShopName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Validation errors
  const [shopNameError, setShopNameError] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const { login } = useAuthStore();

  const validateShopName = (text) => {
    setShopName(text);
    if (!text.trim()) {
      setShopNameError('Shop name is required');
    } else {
      setShopNameError('');
    }
  };

  const validateMobile = (text) => {
    setMobile(text);
    const cleanText = text.trim();
    if (!cleanText) {
      setMobileError('Mobile number is required');
    } else if (!/^[6-9]\d{9}$/.test(cleanText)) {
      setMobileError('Enter a valid 10-digit mobile number');
    } else {
      setMobileError('');
    }
  };

  const validatePassword = (text) => {
    setPassword(text);
    if (!text) {
      setPasswordError('Password is required');
    } else if (text.length < 6) {
      setPasswordError('Password must be at least 6 characters');
    } else {
      setPasswordError('');
    }
  };

  const handleRegister = () => {
    let isValid = true;

    if (!shopName.trim()) {
      setShopNameError('Shop name is required');
      isValid = false;
    }

    const cleanMobile = mobile.trim();
    if (!cleanMobile) {
      setMobileError('Mobile number is required');
      isValid = false;
    } else if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      setMobileError('Enter a valid 10-digit mobile number');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    if (!isValid) return;

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      login(cleanMobile, 'shopkeeper', 'mock-token-' + Date.now());
      navigation.reset({
        index: 0,
        routes: [{ name: 'Shopkeeper' }],
      });
    }, 800);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
        <StatusBar barStyle="light-content" backgroundColor="#020617" />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            className="flex-1 px-6"
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View className="items-center mt-6 mb-6">
              <View className="w-16 h-16 bg-blue-600 rounded-2xl justify-center items-center shadow-lg shadow-blue-500/40 mb-3 border border-blue-400/30">
                <Icon name="shopping-bag" size={30} color="#ffffff" />
              </View>
              <Text className="text-white text-2xl font-black tracking-tight text-center">
                Partner Onboarding
              </Text>
              <Text className="text-slate-400 text-xs font-medium mt-1">
                Join RS Industries Retail Distribution Network
              </Text>
            </View>

            {/* Form Card */}
            <View className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl mb-6">
              <Text className="text-white text-lg font-bold mb-5">Create your account</Text>

              {/* Shop Name */}
              <View className="mb-4">
                <Text className="text-slate-300 font-semibold text-xs mb-2 tracking-wider uppercase">
                  Shop / Enterprise Name
                </Text>
                <View
                  className={`flex-row items-center bg-slate-950 border rounded-2xl px-4 py-3.5 ${
                    shopNameError ? 'border-red-500' : 'border-slate-800'
                  }`}
                >
                  <Icon name="home" size={18} color={shopNameError ? '#ef4444' : '#64748b'} />
                  <TextInput
                    className="flex-1 text-white font-semibold text-base ml-3 py-0"
                    placeholder="Gupta General Store"
                    placeholderTextColor="#475569"
                    value={shopName}
                    onChangeText={validateShopName}
                  />
                </View>
                {shopNameError ? (
                  <View className="flex-row items-center mt-1.5 ml-1">
                    <Icon name="alert-circle" size={12} color="#ef4444" />
                    <Text className="text-red-400 text-xs ml-1 font-medium">{shopNameError}</Text>
                  </View>
                ) : null}
              </View>

              {/* Mobile Input */}
              <View className="mb-4">
                <Text className="text-slate-300 font-semibold text-xs mb-2 tracking-wider uppercase">
                  Mobile Number
                </Text>
                <View
                  className={`flex-row items-center bg-slate-950 border rounded-2xl px-4 py-3.5 ${
                    mobileError ? 'border-red-500' : 'border-slate-800'
                  }`}
                >
                  <Icon name="phone" size={18} color={mobileError ? '#ef4444' : '#64748b'} />
                  <Text className="text-slate-400 font-bold ml-3 mr-2">+91</Text>
                  <TextInput
                    className="flex-1 text-white font-semibold text-base py-0"
                    placeholder="9876543210"
                    placeholderTextColor="#475569"
                    value={mobile}
                    onChangeText={validateMobile}
                    keyboardType="number-pad"
                    maxLength={10}
                  />
                </View>
                {mobileError ? (
                  <View className="flex-row items-center mt-1.5 ml-1">
                    <Icon name="alert-circle" size={12} color="#ef4444" />
                    <Text className="text-red-400 text-xs ml-1 font-medium">{mobileError}</Text>
                  </View>
                ) : null}
              </View>

              {/* Password Input */}
              <View className="mb-6">
                <Text className="text-slate-300 font-semibold text-xs mb-2 tracking-wider uppercase">
                  Create Password
                </Text>
                <View
                  className={`flex-row items-center bg-slate-950 border rounded-2xl px-4 py-3.5 ${
                    passwordError ? 'border-red-500' : 'border-slate-800'
                  }`}
                >
                  <Icon name="lock" size={18} color={passwordError ? '#ef4444' : '#64748b'} />
                  <TextInput
                    className="flex-1 text-white font-semibold text-base ml-3 py-0"
                    placeholder="Minimum 6 characters"
                    placeholderTextColor="#475569"
                    value={password}
                    onChangeText={validatePassword}
                    secureTextEntry={!showPassword}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    <Icon
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={18}
                      color="#64748b"
                    />
                  </Pressable>
                </View>
                {passwordError ? (
                  <View className="flex-row items-center mt-1.5 ml-1">
                    <Icon name="alert-circle" size={12} color="#ef4444" />
                    <Text className="text-red-400 text-xs ml-1 font-medium">{passwordError}</Text>
                  </View>
                ) : null}
              </View>

              {/* Submit */}
              <Pressable
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.85}
                className="bg-blue-600 rounded-2xl py-4 flex-row justify-center items-center gap-2 shadow-lg shadow-blue-600/40"
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Text className="text-white font-black tracking-wider text-base">
                      REGISTER ACCOUNT
                    </Text>
                    <Icon name="arrow-right" size={18} color="#ffffff" />
                  </>
                )}
              </Pressable>
            </View>

            {/* Login Link */}
            <View className="items-center pb-8">
              <Pressable
                onPress={() => navigation.navigate('Login')}
                className="flex-row items-center gap-1.5 py-2"
              >
                <Text className="text-slate-400 text-sm">Already registered?</Text>
                <Text className="text-blue-400 font-bold text-sm">Sign In</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
  );
}

