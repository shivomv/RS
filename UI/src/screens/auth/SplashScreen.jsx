import React, { useEffect } from 'react';
import { View, Text, StatusBar, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';

export default function SplashScreen({ navigation }) {
  const { session, initialized, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (!initialized) return;

    const timer = setTimeout(() => {
      if (session?.token) {
        navigation.reset({
          index: 0,
          routes: [{ name: session.role === 'admin' ? 'Admin' : 'Shopkeeper' }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'AuthChoice' }],
        });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigation, session?.token, session?.role, initialized]);

  return (
    <SafeAreaView className="flex-1 bg-[#ffffff] justify-between items-center py-12 px-6">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Top Spacer for optical vertical centering */}
      <View className="h-6" />

      {/* Official Brand Logo */}
      <View className="items-center">
        <Image
          source={require('../../assets/logo.png')}
          style={{ width: 250, height: 125 }}
          resizeMode="contain"
        />
        <Text className="text-xs font-semibold text-[#6d7a72] mt-3 tracking-widest uppercase">
          B2B Wholesale Portal
        </Text>
      </View>

      {/* Bottom Minimal Indicator */}
      <View className="items-center gap-2.5">
        <ActivityIndicator size="small" color="#006948" />
        <Text className="text-[11px] font-medium text-[#9ba7a0]">
          Direct from Factory • Express Delivery
        </Text>
      </View>
    </SafeAreaView>
  );
}
