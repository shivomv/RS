import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

const ShopkeeperManagementScreen = ({ navigation }) => {
  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 justify-center items-center bg-slate-50">
        <Text className="text-lg font-bold text-slate-950">Shopkeeper Management Screen</Text>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default ShopkeeperManagementScreen;
