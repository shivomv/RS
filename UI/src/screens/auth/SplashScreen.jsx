import React, { useEffect } from 'react';
import { View, Text, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-slate-950 justify-center items-center">
        <StatusBar barStyle="light-content" backgroundColor="#020617" />

        <View className="w-28 h-28 bg-blue-600 rounded-3xl justify-center items-center">
          <Icon name="shield" size={48} color="white" />
          <Text className="text-white font-black tracking-widest mt-1 text-xs">RS</Text>
        </View>

        <Text className="text-white text-2xl font-black tracking-widest mt-10">RS INDUSTRIES</Text>
        <Text className="text-slate-400 text-xs tracking-widest mt-3">DISTRIBUTION COMMAND</Text>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default SplashScreen;
