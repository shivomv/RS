import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { useAdminAuth } from '../store/adminAuthStore';
import { promptGoogleSignIn } from '../services/googleAuth';

export default function AdminLoginScreen() {
  const { loginGoogle } = useAdminAuth();
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleGoogleAdminLogin = async () => {
    setErrorMsg('');
    setSubmitting(true);
    try {
      // 1. Launch native Google Sign-In prompt
      const realGoogleProfile = await promptGoogleSignIn();

      // 2. Authenticate admin with backend
      const res = await loginGoogle(realGoogleProfile);
      if (!res.success) {
        setErrorMsg(res.error || 'Google admin authentication failed');
      }
    } catch (e) {
      if (e.code === 'SIGN_IN_CANCELLED' || e.message?.includes('cancelled')) {
        setErrorMsg('Sign-in cancelled');
      } else {
        setErrorMsg(e.message || 'Google login failed');
      }
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
      <View className="bg-surface rounded-3xl p-6 border border-border shadow-sm">
        <Text className="text-sm font-extrabold text-ink mb-1">Secure Admin Access</Text>
        <Text className="text-[11px] text-muted mb-6">Authenticate exclusively via Google Sign-In</Text>

        {errorMsg ? (
          <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex-row items-center gap-2">
            <Icon name="error-outline" size={18} color="#ef4444" />
            <Text className="text-xs text-red-500 font-semibold flex-1">{errorMsg}</Text>
          </View>
        ) : null}

        {/* Primary Action: Official Google Sign-In Button */}
        <View className="items-center w-full mb-4">
          <GoogleSigninButton
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Dark}
            onPress={handleGoogleAdminLogin}
            disabled={submitting}
            style={{ width: '100%', height: 56, borderRadius: 16 }}
          />
          {submitting ? (
            <View className="flex-row items-center gap-2 mt-3">
              <ActivityIndicator color="#002d62" size="small" />
              <Text className="text-xs font-bold text-[#002d62]">Verifying Admin Credentials...</Text>
            </View>
          ) : null}
        </View>

        <Text className="text-[10px] text-faint text-center mt-2">Authorized RS Industries Directors & Operations Only</Text>
      </View>
    </SafeAreaView>
  );
}
