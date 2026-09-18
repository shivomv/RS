import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RSLogo from '../../components/RSLogo';
import { useAuthStore } from '../../store/authStore';

export default function SplashScreen({ navigation }) {
  const { session } = useAuthStore();
  const [progress, setProgress] = useState(45);
  const [statusText, setStatusText] = useState('Locating nearest dark-store...');

  useEffect(() => {
    const steps = [
      { text: 'Locating nearest dark-store...', percent: 45 },
      { text: 'Syncing direct volume wholesale rates...', percent: 68 },
      { text: 'Connecting to Indiranagar Factory Hub...', percent: 84 },
      { text: 'Factory Hub Ready • Express active', percent: 100 },
    ];
    let idx = 0;
    // Pre-fetch catalog in background while splash animates
    api.getProducts().catch(() => {});
    api.getCategories().catch(() => {});

    const interval = setInterval(() => {
      idx++;
      if (idx < steps.length) {
        setProgress(steps[idx].percent);
        setStatusText(steps[idx].text);
      } else {
        clearInterval(interval);
        // Fast auto-proceed after progress reaches 100%
        setTimeout(() => {
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
        }, 300);
      }
    }, 150);

    return () => clearInterval(interval);
  }, [navigation, session]);

  const handleProceed = () => {
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
  };

  const handleWholesaleSignIn = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#e8fbf4] justify-between">
      <StatusBar barStyle="dark-content" backgroundColor="#e8fbf4" />

      {/* Top Header Bar */}
      <View className="px-5 pt-2 flex-row items-center justify-between z-10">
        {/* Direct Factory Node Pill */}
        <View className="bg-white/90 px-3 py-1.5 rounded-full shadow-sm flex-row items-center gap-2 border border-[#85f8c4]">
          <View className="w-2 h-2 rounded-full bg-[#006948]" />
          <Text className="text-[10px] font-extrabold text-[#006948] uppercase tracking-wider">
            Direct Factory Node
          </Text>
        </View>

        {/* Live Hyperlocal Hub Indicator */}
        <View className="bg-white/80 px-3 py-1.5 rounded-full shadow-sm flex-row items-center gap-1 border border-[#85f8c4]/60">
          <Text className="text-xs">📍</Text>
          <Text className="text-[10px] font-bold text-[#131b2e]">
            Indiranagar Hub • <Text className="text-[#006948]">Active</Text>
          </Text>
        </View>
      </View>

      {/* Center Identity Section */}
      <View className="flex-1 justify-center items-center px-5 my-auto">
        {/* Concentric Aura & Emblem */}
        <View className="relative items-center justify-center my-4">
          <View className="absolute w-40 h-40 rounded-full bg-[#85f8c4]/40" />
          <View className="absolute w-32 h-32 rounded-full border border-[#85f8c4] bg-white/40" />

          {/* Logo Card */}
          <View className="w-24 h-24 rounded-3xl p-2 bg-white shadow-lg border border-[#85f8c4] justify-center items-center">
            <Image
              source={{
                uri: 'https://lh3.googleusercontent.com/aida/AEtjO1XDSl5jGhlvtLtsjbCejh5glvJmc3G5YnGF0um-AZme9UWzoPeb7s2gvKq3AvadZhKdluURyPVOSSZ1FKW8wwpWUPPi3efLTTsDu56MsNuQBC25f_rBKLH9qj-bnuP8RLY4aaZS9zGm9NQgR6fzHKV69fHgD-jHV28EShw133tooQ05zmB58VWfZJAVE4ieEeRoa-_BlTKuxOp_7XLPVCUenZ3mjG3z0MPZm9-qIh0rdNKmivLr2Beni2o',
              }}
              className="w-full h-full rounded-2xl"
              resizeMode="contain"
            />
          </View>

          {/* Micro Badges */}
          <View className="absolute -top-1 -right-2 bg-white rounded-full p-1.5 shadow-md border border-[#85f8c4]">
            <Icon name="auto-awesome" size={16} color="#006948" />
          </View>
          <View className="absolute -bottom-1 -left-2 bg-white rounded-full p-1.5 shadow-md border border-[#85f8c4]">
            <Icon name="eco" size={16} color="#006a63" />
          </View>
        </View>

        {/* Title & Tagline */}
        <View className="items-center mt-2">
          <RSLogo size="lg" />

          <View className="mt-2 bg-[#006948] px-3 py-1 rounded-full flex-row items-center gap-1 shadow-sm">
            <Icon name="precision-manufacturing" size={12} color="#ffffff" />
            <Text className="text-[10px] font-extrabold text-white uppercase tracking-wider">
              Direct Factory to Consumer & B2B
            </Text>
          </View>

          <Text className="text-xl font-extrabold text-[#131b2e] mt-3">
            Clean. Simple. Delivered.
          </Text>
          <Text className="text-xs text-[#3d4a42] text-center mt-1 font-medium px-4 leading-relaxed">
            Direct from Factory • Ultra-Pure Formulations • Express 25-Min & Bulk Fleet
          </Text>
        </View>

        {/* Micro Bento Cards */}
        <View className="flex-row gap-2 w-full mt-6">
          <View className="flex-1 bg-white/90 p-2.5 rounded-2xl border border-[#85f8c4]/80 shadow-sm items-center">
            <View className="w-8 h-8 rounded-xl bg-[#e8fbf4] justify-center items-center mb-1">
              <Icon name="health-and-safety" size={18} color="#006948" />
            </View>
            <Text className="text-[10px] font-bold text-[#131b2e] text-center">
              Eco-Active
            </Text>
            <Text className="text-[9px] text-[#006948] font-bold">99.9% Shield</Text>
          </View>

          <View className="flex-1 bg-white/90 p-2.5 rounded-2xl border border-[#85f8c4]/80 shadow-sm items-center">
            <View className="w-8 h-8 rounded-xl bg-[#99efe5]/30 justify-center items-center mb-1">
              <Icon name="price-check" size={18} color="#006a63" />
            </View>
            <Text className="text-[10px] font-bold text-[#131b2e] text-center">
              Factory Price
            </Text>
            <Text className="text-[9px] text-[#006a63] font-bold">Zero Markup</Text>
          </View>

          <View className="flex-1 bg-white/90 p-2.5 rounded-2xl border border-[#85f8c4]/80 shadow-sm items-center">
            <View className="w-8 h-8 rounded-xl bg-[#eaedff] justify-center items-center mb-1">
              <Icon name="bolt" size={18} color="#006948" />
            </View>
            <Text className="text-[10px] font-bold text-[#131b2e] text-center">
              Lightning 25m
            </Text>
            <Text className="text-[9px] text-[#006948] font-bold">Bulk Fleet</Text>
          </View>
        </View>
      </View>

      {/* Footer & Actions */}
      <View className="px-5 pb-4 gap-3 z-10">
        {/* Progress bar */}
        <View className="w-full gap-1">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-1">
              <Icon name="sync" size={12} color="#006948" />
              <Text className="text-[10px] text-[#006948] font-semibold">{statusText}</Text>
            </View>
            <Text className="text-[10px] text-[#006948] font-bold">{progress}%</Text>
          </View>
          <View className="w-full h-1.5 bg-[#85f8c4]/40 rounded-full overflow-hidden">
            <View
              className="h-full bg-[#006948] rounded-full"
              style={{ width: `${progress}%` }}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View className="gap-2 pt-1">
          <Pressable
            onPress={handleProceed}
            className="w-full h-12 bg-[#006948] rounded-2xl flex-row items-center justify-center gap-2 shadow-lg active:opacity-90"
          >
            <Text className="text-sm font-bold text-white">Get Started / Explore Catalog</Text>
            <Icon name="arrow-forward" size={18} color="#ffffff" />
          </Pressable>

          <Pressable
            onPress={handleWholesaleSignIn}
            className="py-1 items-center flex-row justify-center gap-1 active:opacity-80"
          >
            <Text className="text-xs text-[#006948] font-bold">Sign In for Wholesale Tiers</Text>
            <Icon name="arrow-outward" size={14} color="#006948" />
          </Pressable>
        </View>

        {/* Trust Footer */}
        <View className="items-center pt-2 border-t border-[#85f8c4]/60">
          <Text className="text-[10px] font-semibold text-[#6d7a72]">
            Made in India 🇮🇳 • ISO 9001:2015 • Non-Toxic & Pet Safe
          </Text>
          <Text className="text-[9px] text-[#6d7a72] mt-0.5">
            RS Industries Pvt Ltd • GST B2B Compliant
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
