import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RSLogo from '../../components/RSLogo';
import { useAuthStore } from '../../store/authStore';

export default function LoginScreen({ route, navigation }) {
  const { verifyOtpBackend, requestOtpBackend, login, isLoading } = useAuthStore();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('12345');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  const returnScreen = route?.params?.returnScreen;
  const returnParams = route?.params?.returnParams;

  const handleMobileChange = (text) => {
    const cleaned = text.replace(/\D/g, '');
    setMobile(cleaned);
  };

  const handleClear = () => {
    setMobile('');
  };



  const handleMobileNext = async () => {
    if (mobile.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }
    try {
      setErrorMsg('');
      setLocalLoading(true);
      await requestOtpBackend(mobile, name);
      setShowOtpInput(true);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send OTP');
      setShowOtpInput(true);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    if (returnScreen) {
      if (navigation.canGoBack()) {
        navigation.goBack();
        if (
          returnScreen !== 'Profile' &&
          returnScreen !== 'Orders' &&
          returnScreen !== 'ShopHome' &&
          returnScreen !== 'Cart' &&
          returnScreen !== 'Catalog'
        ) {
          navigation.navigate(returnScreen, returnParams || {});
        }
      } else {
        if (
          returnScreen !== 'ShopHome' &&
          returnScreen !== 'Profile' &&
          returnScreen !== 'Orders' &&
          returnScreen !== 'Cart' &&
          returnScreen !== 'Catalog'
        ) {
          navigation.reset({
            index: 0,
            routes: [
              { name: 'Shopkeeper' },
              { name: returnScreen, params: returnParams || {} },
            ],
          });
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Shopkeeper' }],
          });
        }
      }
    } else {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Shopkeeper' }],
        });
      }
    }
  };

  const handleLogin = () => {
    login(mobile || '9876543210', 'buyer', 'token-guest');
    handleLoginSuccess();
  };

  const handleVerifyOtp = async () => {
    try {
      setErrorMsg('');
      setLocalLoading(true);
      await verifyOtpBackend(mobile, otp);
      setLocalLoading(false);
      handleLoginSuccess();
    } catch (err) {
      setLocalLoading(false);
      setErrorMsg(err.message || 'Invalid OTP. Please enter 12345');
    }
  };

  const isComplete = mobile.length === 10;

  return (
    <SafeAreaView className="flex-1 bg-[#faf8ff]">
      <StatusBar barStyle="dark-content" backgroundColor="#faf8ff" />

      {/* Top Navigation Header */}
      <View className="bg-white/85 border-b border-[#dae2fd] px-4 py-3 flex-row items-center justify-between shadow-sm">
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full bg-[#f2f3ff] justify-center items-center"
          >
            <Icon name="arrow-back" size={20} color="#131b2e" />
          </Pressable>
          <RSLogo size="sm" showText={false} />
          <Text className="text-base font-bold text-[#131b2e] ml-1">Sign In</Text>
        </View>

        <View className="w-8 h-8 rounded-full bg-[#006948] justify-center items-center">
          <Icon name="person" size={18} color="#ffffff" />
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >


          {/* Hero Value Showcase */}
          <View className="items-center text-center mb-6">
            <View className="relative mb-3">
              <View className="w-16 h-16 rounded-2xl bg-[#00855d]/10 justify-center items-center shadow-sm">
                <Icon name="water-drop" size={32} color="#006948" />
              </View>
              <View className="absolute -bottom-1 -right-1 bg-[#99efe5] px-1.5 py-0.5 rounded-full flex-row items-center gap-0.5 shadow-sm">
                <Icon name="verified" size={10} color="#006f67" />
                <Text className="text-[9px] text-[#006f67] font-bold">Direct</Text>
              </View>
            </View>

            <Text className="text-xl font-extrabold text-[#131b2e] tracking-tight text-center">
              India’s #1 Factory Cleaning Hub
            </Text>

            <Text className="text-xs text-[#3d4a42] text-center mt-1 px-4 leading-relaxed">
              Log in or sign up to unlock tier pricing and hyper-local 25-minute dispatch.
            </Text>

            {/* Live Dispatch Pill */}
            <View className="mt-3 bg-[#f2f3ff] px-3 py-1.5 rounded-full flex-row items-center gap-2 shadow-sm">
              <View className="w-2 h-2 rounded-full bg-[#006948]" />
              <Text className="text-[10px] text-[#131b2e]">
                Warehouses active in <Text className="font-bold text-[#006948]">14,200+ Pincodes</Text>
              </Text>
            </View>
          </View>

          {/* Main Login Card */}
          <View className="bg-white rounded-2xl p-4 shadow-sm mb-4 border border-[#eaedff]">
            {/* NAME INPUT */}
            <View className="mb-3">
              <Text className="text-xs font-bold text-[#131b2e] mb-1">Your Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                placeholderTextColor="#6d7a72"
                editable={!showOtpInput}
                className="bg-[#f2f3ff] rounded-xl px-3 h-11 text-base font-bold text-[#131b2e]"
              />
            </View>

            {/* MOBILE INPUT */}
            <View className="mb-3">
              <Text className="text-xs font-bold text-[#131b2e] mb-1">Mobile Number</Text>
              <View className="flex-row items-center bg-[#f2f3ff] rounded-xl px-3 py-1">
                <View className="flex-row items-center gap-1 pr-2 border-r border-[#bccac0]/50">
                  <Text className="text-sm">🇮🇳</Text>
                  <Text className="text-xs font-bold text-[#131b2e]">+91</Text>
                </View>

                <TextInput
                  value={mobile}
                  onChangeText={handleMobileChange}
                  keyboardType="numeric"
                  maxLength={10}
                  placeholder="98450 12345"
                  placeholderTextColor="#6d7a72"
                  editable={!showOtpInput}
                  className="flex-1 h-11 pl-2 text-base font-bold text-[#131b2e]"
                />

                {mobile.length > 0 && !showOtpInput && (
                  <Pressable onPress={handleClear} className="px-1">
                    <Icon name="cancel" size={18} color="#6d7a72" />
                  </Pressable>
                )}
              </View>
            </View>

            {/* OTP INPUT - Shows after Send OTP clicked */}
            {showOtpInput && (
              <View className="mb-3">
                <Text className="text-xs font-bold text-[#131b2e] mb-1">Enter OTP</Text>
                <Text className="text-[10px] text-[#3d4a42] mb-2">
                  Code sent to +91 {mobile.slice(-4)}
                </Text>
                <TextInput
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="numeric"
                  maxLength={6}
                  placeholder="123456"
                  placeholderTextColor="#6d7a72"
                  className="bg-[#f2f3ff] rounded-xl px-3 h-11 text-base font-bold text-[#006948] tracking-widest text-center"
                />
                <Text className="text-[9px] text-[#6d7a72] mt-1 text-center">
                  Test OTP: 12345
                </Text>
              </View>
            )}

            {errorMsg ? (
              <Text className="text-xs text-[#ba1a1a] mb-2 font-bold">{errorMsg}</Text>
            ) : null}

            {/* BUTTON - Send OTP or Verify */}
            <Pressable
              activeOpacity={0.9}
              disabled={
                localLoading || isLoading || 
                (!showOtpInput && (name.length === 0 || mobile.length !== 10)) ||
                (showOtpInput && otp.length !== 6)
              }
              onPress={showOtpInput ? handleVerifyOtp : handleMobileNext}
              className={`w-full h-12 rounded-xl flex-row items-center justify-center gap-2 shadow-md ${
                localLoading || isLoading ? 'bg-[#00855d]/40' : 'bg-[#006948]'
              }`}
            >
              {localLoading || isLoading ? (
                <>
                  <ActivityIndicator color="#ffffff" size="small" />
                  <Text className="text-sm font-bold text-white">
                    {showOtpInput ? 'Verifying...' : 'Sending OTP...'}
                  </Text>
                </>
              ) : (
                <>
                  <Text className="text-sm font-bold text-white">
                    {showOtpInput ? 'Verify & Login' : 'Send OTP'}
                  </Text>
                  <Icon name="arrow-forward" size={18} color="#ffffff" />
                </>
              )}
            </Pressable>

            {/* Back button when OTP is showing */}
            {showOtpInput && (
              <Pressable
                activeOpacity={0.9}
                onPress={() => {
                  setShowOtpInput(false);
                  setOtp('12345');
                  setErrorMsg('');
                }}
                className="mt-2 h-10 rounded-xl border-2 border-[#006948] flex-row items-center justify-center"
              >
                <Icon name="arrow-back" size={18} color="#006948" />
                <Text className="text-sm font-bold text-[#006948] ml-1">Back</Text>
              </Pressable>
            )}
          </View>

          {/* Skip for now - alternative action */}
          {!showOtpInput && (
            <>
              <View className="flex-row items-center py-2 mb-4">
                <View className="flex-1 h-px bg-[#e2e7ff]" />
                <Text className="mx-3 text-[10px] text-[#3d4a42] font-semibold">
                  or continue as guest
                </Text>
                <View className="flex-1 h-px bg-[#e2e7ff]" />
              </View>

              <Pressable
                onPress={handleLogin}
                className="w-full h-12 rounded-xl bg-white shadow-sm flex-row items-center justify-center gap-2 border border-[#eaedff] mb-4"
              >
                <Icon name="person-outline" size={18} color="#006948" />
                <Text className="text-xs font-bold text-[#131b2e]">Continue as Guest</Text>
              </Pressable>
            </>
          )}

          {/* Divider */}
          {step === 'name' && (
            <View className="flex-row items-center py-2 mb-4">
              <View className="flex-1 h-px bg-[#e2e7ff]" />
              <Text className="mx-3 text-[10px] text-[#3d4a42] font-semibold">
                quick sign-in options
              </Text>
              <View className="flex-1 h-px bg-[#e2e7ff]" />
            </View>
          )}

          {/* Social Buttons */}
          {step === 'name' && (
            <View className="flex-row gap-3 mb-4">
              <Pressable
                onPress={handleLogin}
                className="flex-1 h-12 rounded-xl bg-white shadow-sm flex-row items-center justify-center gap-2 border border-[#eaedff]"
              >
                <Icon name="g-translate" size={20} color="#ea4335" />
                <Text className="text-xs font-bold text-[#131b2e]">Google</Text>
              </Pressable>

              <Pressable
                onPress={handleLogin}
                className="flex-1 h-12 rounded-xl bg-white shadow-sm flex-row items-center justify-center gap-2 border border-[#eaedff]"
              >
                <Icon name="chat-bubble" size={18} color="#006948" />
                <Text className="text-xs font-bold text-[#131b2e]">WhatsApp</Text>
              </Pressable>
            </View>
          )}

          {/* B2B Procurement Card */}
          <View className="bg-[#f2f3ff] rounded-2xl p-4 shadow-sm mb-6 border border-[#e2e7ff]">
            <View className="flex-row items-start gap-3">
              <View className="w-10 h-10 rounded-xl bg-[#006948] justify-center items-center shadow-sm">
                <Icon name="corporate-fare" size={22} color="#ffffff" />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-1.5 mb-0.5">
                  <Text className="text-xs font-bold text-[#131b2e]">Facility & Society Buyer?</Text>
                  <View className="bg-[#68fcbf] px-1.5 py-0.2 rounded">
                    <Text className="text-[8px] font-bold text-[#002114]">18% ITC</Text>
                  </View>
                </View>
                <Text className="text-[10px] text-[#3d4a42] leading-relaxed mb-2">
                  Procuring for hotels, hospitals, or corporate offices? Save up to 40% on bulk 50L concentrates with automated GST invoices.
                </Text>
                <Pressable
                  onPress={handleLogin}
                  className="flex-row items-center gap-0.5"
                >
                  <Text className="text-xs font-bold text-[#006948]">
                    Explore Institutional Catalog
                  </Text>
                  <Icon name="chevron-right" size={16} color="#006948" />
                </Pressable>
              </View>
            </View>
          </View>

          {/* Compliance & Trust Footer */}
          <View className="items-center text-center gap-1">
            <View className="flex-row items-center gap-1">
              <Icon name="verified-user" size={14} color="#006948" />
              <Text className="text-[10px] font-semibold text-[#3d4a42]">
                256-Bit SSL Encrypted Banking-Grade Checkout
              </Text>
            </View>
            <Text className="text-[9px] text-[#6d7a72] text-center px-4 leading-normal">
              By tapping continue, you agree to RS Industries’{' '}
              <Text className="underline text-[#131b2e]">Terms of Use</Text> &{' '}
              <Text className="underline text-[#131b2e]">Privacy Policy</Text>.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
