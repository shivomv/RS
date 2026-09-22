import React, { useEffect } from 'react';
import {
  View,
  Text,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RSLogo from '../../components/RSLogo';
import { useAuthStore } from '../../store/authStore';

export default function SplashScreen({ navigation }) {
  const { session, initialized, initializeAuth } = useAuthStore();

  useEffect(() => {
    const initApp = async () => {
      // Initialize auth from storage
      await initializeAuth();
    };

    initApp();
  }, []);

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
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation, session?.token, initialized]);

  return (
    <SafeAreaView className="flex-1 bg-[#006948]">
      <StatusBar barStyle="light-content" backgroundColor="#006948" />

      <View className="flex-1 justify-center items-center px-6">
        {/* Center Section - Logo & Brand */}
        <View className="items-center gap-8 w-full">
          {/* Logo Circle */}
          <View className="relative items-center">
            {/* Outer glow ring */}
            <View className="absolute inset-0 w-32 h-32 rounded-full bg-white/20 blur-xl" />
            
            {/* Main logo card */}
            <View className="w-28 h-28 rounded-3xl bg-white shadow-2xl justify-center items-center">
              <Icon name="water-drop" size={56} color="#006948" />
            </View>

            {/* Badge - top right */}
            <View className="absolute -top-3 -right-12 w-10 h-10 rounded-full bg-[#85f8c4] justify-center items-center shadow-lg border-2 border-white">
              <Icon name="verified" size={20} color="#006948" />
            </View>
          </View>

          {/* Brand Name */}
          <View className="items-center gap-2 w-full">
            <RSLogo size="lg" />
            
            <Text className="text-xl font-bold text-white mt-2">
              Clean. Simple. Delivered.
            </Text>
            
            <Text className="text-sm text-white/80 text-center leading-relaxed">
              Direct from Factory to Your Door
            </Text>
          </View>

          {/* Stats Pills */}
          <View className="flex-row gap-2 mt-4 justify-center flex-wrap">
            <View className="bg-white/20 px-3 py-2 rounded-full flex-row items-center gap-1 shadow-sm">
              <Icon name="location-on" size={14} color="#ffffff" />
              <Text className="text-xs font-bold text-white">14,200+ Pincodes</Text>
            </View>
            
            <View className="bg-white/20 px-3 py-2 rounded-full flex-row items-center gap-1 shadow-sm">
              <Icon name="bolt" size={14} color="#85f8c4" />
              <Text className="text-xs font-bold text-white">25-Min Express</Text>
            </View>
          </View>

          {/* Loading Spinner */}
          <View className="mt-12 items-center gap-4">
            <ActivityIndicator size="large" color="#006948" />
            
            {/* Loading Text */}
            <View className="items-center gap-1">
              <Text className="text-sm font-semibold text-white">
                Preparing your experience...
              </Text>
              <Text className="text-xs text-white/60">
                Connecting to our network
              </Text>
            </View>

            {/* Progress bar */}
            <View className="w-32 h-1 bg-white/20 rounded-full overflow-hidden mt-2">
              <View 
                className="h-full bg-[#85f8c4] rounded-full"
                style={{
                  width: '65%',
                }}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Floating elements for visual interest */}
      <View className="absolute top-1/4 right-0 w-40 h-40 rounded-full bg-white/5 blur-3xl" />
      <View className="absolute bottom-1/4 left-0 w-48 h-48 rounded-full bg-[#85f8c4]/5 blur-3xl" />
    </SafeAreaView>
  );
}
