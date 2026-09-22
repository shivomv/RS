import React, { useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RSLogo from '../../components/RSLogo';
import { useAuthStore } from '../../store/authStore';

export default function SplashScreen({ navigation }) {
  const { session } = useAuthStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (session) {
        navigation.reset({
          index: 0,
          routes: [{ name: session.role === 'admin' ? 'Admin' : 'Shopkeeper' }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Shopkeeper' }],
        });
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation, session]);

  return (
    <SafeAreaView className="flex-1 bg-[#006948] justify-center items-center">
      <StatusBar barStyle="light-content" backgroundColor="#006948" />

      <View className="items-center gap-6">
        {/* Logo */}
        <View className="w-20 h-20 rounded-2xl bg-white justify-center items-center shadow-lg">
          <Icon name="water-drop" size={48} color="#006948" />
        </View>

        {/* Text */}
        <View className="items-center gap-2">
          <RSLogo size="lg" />
          <Text className="text-lg font-bold text-white mt-2">
            Clean. Simple. Delivered.
          </Text>
          <Text className="text-sm text-white/80 text-center px-6">
            Direct from Factory
          </Text>
        </View>

        {/* Loader */}
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    </SafeAreaView>
  );
}
