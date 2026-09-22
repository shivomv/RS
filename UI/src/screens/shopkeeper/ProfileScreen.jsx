import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RSLogo from '../../components/RSLogo';
import { useAuthStore } from '../../store/authStore';

export default function ProfileScreen({ navigation }) {
  const { session, logout } = useAuthStore();

  // Hardware Android Back Button Handler
  useEffect(() => {
    const onBackPress = () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
        return true;
      }
      navigation.navigate('ShopHome');
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [navigation]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout from RS Industries?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: () => {
          logout();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
        style: 'destructive',
      },
    ]);
  };

  // Render Guest Account Login Required View if user is not logged in
  if (!session) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-[#faf8ff]">
        {/* Top Header */}
        <View className="bg-white border-b border-[#dae2fd] px-4 py-3 flex-row items-center justify-between shadow-sm z-10">
          <RSLogo size="md" />
          <TouchableOpacity
            onPress={() => navigation.navigate('Login', { returnScreen: 'Profile' })}
            activeOpacity={0.7}
            className="bg-[#006948] px-3.5 py-1.5 rounded-full flex-row items-center gap-1 shadow-sm"
          >
            <Icon name="login" size={16} color="#ffffff" />
            <Text className="text-xs text-white font-bold">Log In</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          className="flex-1 px-4 pt-6"
        >
          {/* Guest Account Banner Card */}
          <View className="bg-white rounded-3xl p-6 items-center shadow-sm border border-[#eaedff] mb-4">
            <View className="w-20 h-20 rounded-full bg-[#006948]/10 justify-center items-center mb-4">
              <Icon name="person-outline" size={44} color="#006948" />
            </View>
            <Text className="text-lg font-black text-[#131b2e] text-center">
              Welcome to RS Industries Portal
            </Text>
            <Text className="text-xs text-[#3d4a42] text-center mt-1.5 px-2 leading-relaxed">
              Log in with your registered mobile number to track dispatches, inspect GST tax invoices, and access your profile.
            </Text>

            <TouchableOpacity
              onPress={() => navigation.navigate('Login', { returnScreen: 'Profile' })}
              activeOpacity={0.85}
              className="bg-[#006948] w-full rounded-2xl py-3.5 items-center justify-center flex-row gap-2 mt-6 shadow-md"
            >
              <Icon name="login" size={20} color="#ffffff" />
              <Text className="text-sm text-white font-extrabold">Log In / Register</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Render Full User Profile View for Authenticated Partners
  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-[#faf8ff]">
      {/* Top Header */}
      <View className="bg-white border-b border-[#dae2fd] px-4 py-3 flex-row items-center justify-between shadow-sm z-10">
        <RSLogo size="md" />
        <View className="bg-[#99efe5] px-2.5 py-1 rounded-full border border-[#006f67]/20">
          <Text className="text-xs text-[#006f67] font-bold">GST Verified</Text>
        </View>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* User Card */}
        <View className="bg-[#006948] px-6 py-6 items-center">
          <View className="w-20 h-20 rounded-full overflow-hidden border-2 border-white mb-3 shadow-md bg-white/20 justify-center items-center">
            <Image
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDO2ijUAJMNwM-QODTNqSRCuJgJck70ZUjFztadUdQ6FY5QFQu1PRfZXrHv48QsDfm2odixXZVku1HckHrgpzBJXDjUuSQvqGsjB-N20z0l40gEeMYHfDd2UGxvKusUOYDZockQrFLPsfy6Mrv8tAG9ouXqm6-sobkEwc13Pinr0UynpcUjCcmLovh45QuDwt8IRv9A2Z1Yh6Uxjz6IeRLO0kDvVPUD7AcwYTdY6Ts-67cMaQugjx_D',
              }}
              className="w-full h-full"
            />
          </View>
          <Text className="text-white text-lg font-bold">
            {session.user?.name || session.user?.shopName || 'Registered Customer'}
          </Text>
          <Text className="text-[#85f8c4] text-xs font-semibold mt-0.5">
            Mobile: {session.mobile || session.user?.mobile} • Role: {session.role || session.user?.role || 'buyer'}
          </Text>
        </View>

        {/* Quick Settings Links */}
        <View className="px-4 py-2">
          <View className="bg-white rounded-2xl p-2 shadow-sm border border-[#eaedff]">
            <TouchableOpacity
              onPress={() => navigation.navigate('AddressList')}
              activeOpacity={0.7}
              className="flex-row items-center justify-between p-3 border-b border-[#f2f3ff]"
            >
              <View className="flex-row items-center gap-3">
                <Icon name="location-on" size={20} color="#006948" />
                <Text className="text-xs font-bold text-[#131b2e]">Manage Delivery Address</Text>
              </View>
              <Icon name="chevron-right" size={20} color="#006948" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Support')}
              activeOpacity={0.7}
              className="flex-row items-center justify-between p-3"
            >
              <View className="flex-row items-center gap-3">
                <Icon name="headset-mic" size={20} color="#3d4a42" />
                <Text className="text-xs font-bold text-[#131b2e]">Support & Ticket Helpdesk</Text>
              </View>
              <Icon name="chevron-right" size={20} color="#6d7a72" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Action */}
        <View className="px-4 pt-4">
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.85}
            className="bg-[#ba1a1a]/10 rounded-2xl py-3.5 items-center border border-[#ba1a1a]/20"
          >
            <Text className="text-xs font-bold text-[#ba1a1a]">Logout Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
