import React from 'react';
import { View, Text, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';

const OutstandingScreen = ({ navigation }) => {
  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-slate-50">
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

        <ScrollView className="flex-1 px-5">
          <View className="py-4">
            <Text className="text-xs tracking-widest font-bold text-slate-500">OUTSTANDING</Text>
            <Text className="text-2xl font-black text-slate-950 mt-1">ACCOUNT BALANCE</Text>
          </View>

          {/* Balance Card */}
          <View className="bg-slate-950 rounded-3xl px-6 py-8 mb-6">
            <Text className="text-xs font-bold text-slate-400 tracking-widest">CURRENT BALANCE</Text>
            <Text className="text-4xl font-black text-white mt-4">₹0</Text>
            <Text className="text-xs font-bold text-amber-300 mt-4">ALL PAYMENTS UP TO DATE</Text>
          </View>

          {/* Ledger Activity */}
          <View>
            <Text className="text-base font-black text-slate-950 mb-4">LEDGER ACTIVITY</Text>
            <Text className="text-slate-500 text-center py-8">No transactions yet</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default OutstandingScreen;
