import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import RSLogo from '../../components/RSLogo';
import { useAuthStore } from '../../store/authStore';
import { promptGoogleSignIn } from '../../services/googleAuth';

export default function SignupScreen({ navigation, route }) {
  const { googleLogin, isLoading } = useAuthStore();
  const [errorMsg, setErrorMsg] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  const returnScreen = route?.params?.returnScreen;

  const handleGoogleSignup = async () => {
    try {
      setErrorMsg('');
      setLocalLoading(true);

      const realGoogleProfile = await promptGoogleSignIn();

      const res = await googleLogin(realGoogleProfile);
      setLocalLoading(false);

      if (res && res.success) {
        const cleanMob = String(res.user?.mobile || '').replace(/\D/g, '').slice(-10);
        const shouldPromptMobile = res.isNewUser || cleanMob.length !== 10;

        if (shouldPromptMobile) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'CompleteProfile', params: { returnScreen } }],
          });
        } else if (returnScreen) {
          navigation.navigate(returnScreen);
        } else {
          navigation.reset({ index: 0, routes: [{ name: 'Shopkeeper' }] });
        }
      } else {
        setErrorMsg(res?.error || 'Google signup failed');
      }
    } catch (err) {
      setLocalLoading(false);
      if (err.code === 'SIGN_IN_CANCELLED' || err.message?.includes('cancelled')) {
        setErrorMsg('Sign-up cancelled');
      } else {
        setErrorMsg(err.message || 'Google signup failed');
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#faf8ff]">
      <StatusBar barStyle="dark-content" backgroundColor="#faf8ff" />

      {/* Header */}
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

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="items-center mb-8">
          <Image
            source={require('../../assets/logo.png')}
            style={{ width: 210, height: 95 }}
            resizeMode="contain"
          />

          <Text className="text-xl font-extrabold text-[#131b2e] tracking-tight text-center mt-4">
            Join RS Wholesale
          </Text>

          <Text className="text-xs text-[#3d4a42] text-center mt-1 px-6 leading-relaxed">
            Direct Factory Procurement • Zero Middlemen Margin
          </Text>
        </View>

        {/* Card */}
        <View className="bg-white rounded-3xl p-6 shadow-sm mb-6 border border-[#eaedff]">
          <Text className="text-sm font-extrabold text-[#131b2e] mb-1">Instant Google Signup</Text>
          <Text className="text-xs text-[#6d7a72] mb-5 leading-relaxed">
            All accounts are created securely through Google. Your contact mobile number is only required at checkout.
          </Text>

          {errorMsg ? (
            <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex-row items-center gap-2">
              <Icon name="error-outline" size={18} color="#ba1a1a" />
              <Text className="text-xs text-[#ba1a1a] font-bold flex-1">{errorMsg}</Text>
            </View>
          ) : null}

          {/* Primary Action: Official Google Sign-Up Button */}
          <View className="items-center w-full">
            <GoogleSigninButton
              size={GoogleSigninButton.Size.Wide}
              color={GoogleSigninButton.Color.Dark}
              onPress={handleGoogleSignup}
              disabled={localLoading || isLoading}
              style={{ width: '100%', height: 56, borderRadius: 16 }}
            />
            {localLoading || isLoading ? (
              <View className="flex-row items-center gap-2 mt-3">
                <ActivityIndicator color="#006948" size="small" />
                <Text className="text-xs font-bold text-[#006948]">Creating Account with Google...</Text>
              </View>
            ) : null}
          </View>

          <View className="mt-4 pt-3 border-t border-[#f2f3ff] flex-row items-center justify-center gap-1.5">
            <Icon name="check-circle" size={14} color="#006948" />
            <Text className="text-[11px] font-bold text-[#6d7a72]">
              Instant activation for all retail shopkeepers
            </Text>
          </View>
        </View>

        {/* Already have account */}
        <View className="items-center">
          <Text className="text-xs text-[#6d7a72]">
            Already registered?{' '}
            <Text
              onPress={() => navigation.navigate('Login')}
              className="font-bold text-[#006948]"
            >
              Sign In
            </Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
