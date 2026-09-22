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

export default function SignupScreen({ navigation }) {
  const { verifyOtpBackend, requestOtpBackend, isLoading } = useAuthStore();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('12345');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  const handleMobileChange = (text) => {
    const cleaned = text.replace(/\D/g, '');
    setMobile(cleaned);
  };

  const handleClear = () => {
    setMobile('');
  };

  const handleSendOtp = async () => {
    if (!name.trim()) {
      setErrorMsg('Please enter your name');
      return;
    }
    if (mobile.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }
    if (localLoading) return;

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

  const handleVerifyOtp = async () => {
    try {
      setErrorMsg('');
      setLocalLoading(true);
      const res = await verifyOtpBackend(mobile, otp);
      console.log('[Signup] OTP Verified, navigating...');
      
      setLocalLoading(false);
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Shopkeeper' }],
        });
      }, 500);
    } catch (err) {
      setLocalLoading(false);
      console.error('[Signup] Verify error:', err.message);
      setErrorMsg(err.message || 'Invalid OTP. Please enter 12345');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#faf8ff]">
      <StatusBar barStyle="dark-content" backgroundColor="#faf8ff" />

      <View className="bg-white/85 border-b border-[#dae2fd] px-4 py-3 flex-row items-center justify-between shadow-sm">
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full bg-[#f2f3ff] justify-center items-center"
          >
            <Icon name="arrow-back" size={20} color="#131b2e" />
          </Pressable>
          <RSLogo size="sm" showText={false} />
          <Text className="text-base font-bold text-[#131b2e] ml-1">Create Account</Text>
        </View>

        <View className="w-8 h-8 rounded-full bg-[#006948] justify-center items-center">
          <Icon name="person-add" size={18} color="#ffffff" />
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
          {/* Hero Section */}
          <View className="items-center text-center mb-6 pt-6">
            <View className="relative mb-3">
              <View className="w-16 h-16 rounded-2xl bg-[#00855d]/10 justify-center items-center shadow-sm">
                <Icon name="water-drop" size={32} color="#006948" />
              </View>
            </View>

            <Text className="text-xl font-extrabold text-[#131b2e] tracking-tight text-center">
              Sign Up Now
            </Text>

            <Text className="text-xs text-[#3d4a42] text-center mt-1 px-4 leading-relaxed">
              Create your account to unlock tier pricing and express delivery
            </Text>
          </View>

          {/* Main Card */}
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
                  maxLength={5}
                  placeholder="12345"
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
                (showOtpInput ? otp.length !== 5 : !name.trim() || mobile.length !== 10)
              }
              onPress={showOtpInput ? handleVerifyOtp : handleSendOtp}
              className={`w-full h-12 rounded-xl flex-row items-center justify-center gap-2 shadow-md ${
                (localLoading || isLoading || (showOtpInput ? otp.length !== 5 : !name.trim() || mobile.length !== 10)) ? 'bg-[#00855d]/40' : 'bg-[#006948]'
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
                    {showOtpInput ? 'Verify & Create Account' : 'Send OTP'}
                  </Text>
                  <Icon name="arrow-forward" size={18} color="#ffffff" />
                </>
              )}
            </Pressable>
          </View>

          {/* Already have account */}
          <View className="items-center pt-2">
            <Text className="text-xs text-[#6d7a72]">
              Already have an account?{' '}
              <Text 
                onPress={() => navigation.navigate('Login')}
                className="font-bold text-[#006948]"
              >
                Log In
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
