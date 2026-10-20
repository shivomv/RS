import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAdminAuth } from '../store/adminAuthStore';

export default function AdminLoginScreen() {
  const { login } = useAdminAuth();
  const [mobile, setMobile] = useState('');
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    setErrorMsg('');
    if (!mobile || mobile.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!pin) {
      setErrorMsg('Please enter the Admin Security PIN.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await login(mobile, pin);
      if (!res.success) {
        setErrorMsg(res.error || 'Authentication failed');
      }
    } catch (e) {
      setErrorMsg(e.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background justify-center px-6">
      {/* Brand Header */}
      <View className="items-center mb-8">
        <Image
          source={require('../assets/logo.png')}
          style={{ width: 220, height: 95 }}
          resizeMode="contain"
        />
        <View className="flex-row items-center gap-1.5 mt-2 bg-[#002d62]/10 px-3 py-1 rounded-full border border-[#002d62]/20">
          <Icon name="admin-panel-settings" size={15} color="#002d62" />
          <Text className="text-xs font-bold text-[#002d62] uppercase tracking-wider">Admin Console</Text>
        </View>
        <Text className="text-xs text-muted text-center mt-1.5">Wholesale Distribution & Control Portal</Text>
      </View>

      {/* Login Card */}
      <View className="bg-surface rounded-3xl p-6 border border-border">
        <Text className="text-sm font-extrabold text-ink mb-4">Secure Admin Authentication</Text>

        {errorMsg ? (
          <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex-row items-center gap-2">
            <Icon name="error-outline" size={18} color="#ef4444" />
            <Text className="text-xs text-red-500 font-semibold flex-1">{errorMsg}</Text>
          </View>
        ) : null}

        {/* Mobile */}
        <View className="mb-4">
          <Text className="text-[11px] font-bold text-muted mb-1.5 uppercase tracking-wider">Mobile Number</Text>
          <View className="flex-row items-center bg-input rounded-2xl px-3.5 py-3 border border-border">
            <Icon name="phone" size={20} color="#006948" />
            <TextInput
              value={mobile}
              onChangeText={setMobile}
              placeholder="Enter 10-digit mobile number"
              placeholderTextColor="#94a3b8"
              keyboardType="phone-pad"
              maxLength={10}
              className="flex-1 text-sm font-bold text-ink p-0 ml-2"
            />
          </View>
        </View>

        {/* PIN */}
        <View className="mb-6">
          <Text className="text-[11px] font-bold text-muted mb-1.5 uppercase tracking-wider">Admin PIN</Text>
          <View className="flex-row items-center bg-input rounded-2xl px-3.5 py-3 border border-border">
            <Icon name="lock" size={20} color="#006948" />
            <TextInput
              value={pin}
              onChangeText={setPin}
              placeholder="Enter Admin PIN"
              placeholderTextColor="#94a3b8"
              secureTextEntry
              keyboardType="number-pad"
              maxLength={6}
              className="flex-1 text-sm font-bold text-ink p-0 ml-2"
            />
          </View>
        </View>

        {/* Submit */}
        <Pressable
          onPress={handleLogin}
          disabled={submitting}
          className="bg-brand rounded-2xl py-4 items-center justify-center flex-row gap-2 active:opacity-90"
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Icon name="verified-user" size={20} color="#ffffff" />
              <Text className="text-sm font-extrabold text-white uppercase tracking-wider">
                Authenticate & Access Console
              </Text>
            </>
          )}
        </Pressable>

        <Text className="text-[10px] text-faint text-center mt-4">Authorized RS Director Access Only</Text>
      </View>
    </SafeAreaView>
  );
}
