import React from 'react';
import {
  View,
  Text,
  Pressable,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RSLogo from '../../components/RSLogo';

export default function AuthChoiceScreen({ navigation }) {
  return (
    <SafeAreaView className="flex-1 bg-[#faf8ff]">
      <StatusBar barStyle="dark-content" backgroundColor="#faf8ff" />

      <View className="flex-1 justify-between px-6 py-12">
        {/* Top - Empty for balance */}
        <View />

        {/* Center - Logo & Message */}
        <View className="items-center gap-6">
          {/* Logo */}
          <View className="w-24 h-24 rounded-3xl bg-white shadow-lg justify-center items-center border border-[#e2e7e3]">
            <Icon name="water-drop" size={56} color="#006948" />
          </View>

          {/* Text */}
          <View className="items-center gap-2">
            <RSLogo size="lg" />
            <Text className="text-lg font-bold text-[#131b2e] mt-3">
              Welcome to RS Industries
            </Text>
            <Text className="text-sm text-[#6d7a72] text-center leading-relaxed px-4">
              Direct from Factory • Ultra-Pure Formulations • Express Delivery
            </Text>
          </View>
        </View>

        {/* Bottom - Buttons */}
        <View className="gap-3">
          {/* New User Button */}
          <Pressable
            onPress={() => navigation.navigate('Signup')}
            className="w-full h-12 rounded-xl bg-[#006948] flex-row items-center justify-center gap-2 shadow-md active:opacity-90"
          >
            <Icon name="person-add" size={20} color="#ffffff" />
            <Text className="text-sm font-bold text-white">New User - Sign Up</Text>
          </Pressable>

          {/* Existing User Button */}
          <Pressable
            onPress={() => navigation.navigate('Login')}
            className="w-full h-12 rounded-xl border-2 border-[#006948] flex-row items-center justify-center gap-2 active:opacity-80"
          >
            <Icon name="login" size={20} color="#006948" />
            <Text className="text-sm font-bold text-[#006948]">Existing User - Log In</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
