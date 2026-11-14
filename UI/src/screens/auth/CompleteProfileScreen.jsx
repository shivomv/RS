import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RSLogo from '../../components/RSLogo';
import { useAuthStore } from '../../store/authStore';

export default function CompleteProfileScreen({ navigation, route }) {
  const { session, updateProfile, logout } = useAuthStore();
  const user = session?.user || {};

  const returnScreen = route?.params?.returnScreen;

  const [mobile, setMobile] = useState('');
  const [shopName, setShopName] = useState(
    user?.shopName || (user?.name ? `${user.name}'s Shop` : '')
  );
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const cleanMobile = mobile.replace(/\D/g, '').slice(0, 10);
  const isValidMobile = cleanMobile.length === 10 && !cleanMobile.startsWith('0000');

  const handleSubmit = async () => {
    if (!isValidMobile) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    try {
      setErrorMsg('');
      setLoading(true);

      const res = await updateProfile({
        mobile: cleanMobile,
        shopName: shopName.trim() || `${user?.name || 'Wholesale Buyer'}'s Store`,
      });

      setLoading(false);

      if (res && res.success) {
        if (returnScreen) {
          navigation.navigate(returnScreen);
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Shopkeeper' }],
          });
        }
      } else {
        setErrorMsg(res?.error || 'Failed to save mobile number. Please try again.');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || 'Network error while updating profile.');
    }
  };

  const handleSignOut = () => {
    Alert.alert('Switch Account', 'Do you want to sign in with a different Google account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#faf8ff]">
      <StatusBar barStyle="dark-content" backgroundColor="#faf8ff" />

      {/* Top Header */}
      <View className="bg-white/90 border-b border-[#dae2fd] px-4 py-3 flex-row items-center justify-between shadow-sm">
        <View className="flex-row items-center gap-2">
          <RSLogo size="sm" showText={false} />
          <Text className="text-base font-bold text-[#131b2e] ml-1">Complete Registration</Text>
        </View>
        <Pressable
          onPress={handleSignOut}
          className="px-3 py-1.5 rounded-full bg-[#f2f3ff] active:bg-[#e4e7fa]"
        >
          <Text className="text-xs font-semibold text-[#006948]">Sign Out</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingVertical: 24 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Welcome Banner */}
          <View className="items-center mb-6">
            <View className="w-16 h-16 rounded-full bg-[#006948]/10 items-center justify-center mb-3">
              <Icon name="phone-android" size={32} color="#006948" />
            </View>
            <Text className="text-xl font-extrabold text-[#131b2e] text-center">
              Enter Your Mobile Number
            </Text>
            <Text className="text-xs text-[#3d4a42] text-center mt-1 px-4 leading-relaxed">
              Mobile number is compulsory for all wholesale buyers to verify orders and track deliveries.
            </Text>
          </View>

          {/* Google Account Summary Card */}
          <View className="bg-white rounded-2xl p-4 border border-[#eaedff] shadow-sm mb-5">
            <View className="flex-row items-center gap-3">
              <View className="w-12 h-12 rounded-full bg-[#006948] items-center justify-center">
                <Text className="text-white font-extrabold text-base">
                  {(user?.name || user?.email || 'B')[0].toUpperCase()}
                </Text>
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-1.5">
                  <Text className="text-sm font-bold text-[#131b2e]">{user?.name || 'Wholesale Buyer'}</Text>
                  <Icon name="check-circle" size={15} color="#006948" />
                </View>
                <Text className="text-xs text-[#6d7a72] mt-0.5">{user?.email || 'Google Account'}</Text>
              </View>
            </View>
          </View>

          {/* Form Card */}
          <View className="bg-white rounded-3xl p-5 border border-[#eaedff] shadow-sm mb-6">
            {errorMsg ? (
              <View className="bg-[#ffdad6] rounded-xl p-3 mb-4 flex-row items-center gap-2">
                <Icon name="error-outline" size={18} color="#ba1a1a" />
                <Text className="text-xs text-[#ba1a1a] font-semibold flex-1">{errorMsg}</Text>
              </View>
            ) : null}

            {/* Mobile Input */}
            <Text className="text-xs font-bold text-[#131b2e] uppercase tracking-wider mb-2">
              10-Digit Mobile Number <Text className="text-red-500">*</Text>
            </Text>
            <View className="flex-row items-center bg-[#f8f9ff] border border-[#c4c7d0] rounded-2xl px-3.5 py-3 mb-1 focus:border-[#006948]">
              <Text className="text-xs font-bold text-[#131b2e] mr-2">🇮🇳 +91</Text>
              <View className="w-[1px] h-5 bg-[#c4c7d0] mr-2" />
              <TextInput
                value={cleanMobile}
                onChangeText={(val) => {
                  setMobile(val);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Enter 10-digit mobile"
                placeholderTextColor="#9ba7a0"
                keyboardType="phone-pad"
                maxLength={10}
                className="flex-1 text-sm font-bold text-[#131b2e] p-0"
                autoFocus
              />
              {cleanMobile.length === 10 ? (
                <Icon name="check" size={18} color="#006948" />
              ) : null}
            </View>
            <Text className="text-[11px] text-[#6d7a72] mb-4">
              {cleanMobile.length === 10
                ? '✓ Valid 10-digit number'
                : `${cleanMobile.length}/10 digits entered`}
            </Text>

            {/* Shop / Business Name */}
            <Text className="text-xs font-bold text-[#131b2e] uppercase tracking-wider mb-2">
              Shop / Business Name <Text className="text-[#6d7a72] font-normal">(Optional)</Text>
            </Text>
            <View className="flex-row items-center bg-[#f8f9ff] border border-[#c4c7d0] rounded-2xl px-3.5 py-3 mb-5">
              <Icon name="storefront" size={18} color="#6d7a72" />
              <TextInput
                value={shopName}
                onChangeText={setShopName}
                placeholder="e.g. Sharma General Store"
                placeholderTextColor="#9ba7a0"
                className="flex-1 text-xs font-bold text-[#131b2e] p-0 ml-2"
              />
            </View>

            {/* Action Button */}
            <Pressable
              onPress={handleSubmit}
              disabled={!isValidMobile || loading}
              className={`rounded-2xl py-3.5 items-center justify-center shadow-sm flex-row gap-2 ${
                isValidMobile && !loading
                  ? 'bg-[#006948] active:opacity-90'
                  : 'bg-[#006948]/40'
              }`}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Text className="text-white font-bold text-sm tracking-wider uppercase">
                    Activate Account & Continue
                  </Text>
                  <Icon name="arrow-forward" size={18} color="#ffffff" />
                </>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
