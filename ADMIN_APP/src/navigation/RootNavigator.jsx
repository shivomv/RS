import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAdminAuth } from '../store/adminAuthStore';
import { navigationRef } from './navigationRef';

import AdminLoginScreen from '../screens/AdminLoginScreen';
import MainApp from '../screens/MainApp';

const Stack = createNativeStackNavigator();

function SplashLoadingScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#001a40', justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#ffffff" />
    </View>
  );
}

export default function RootNavigator() {
  const { session } = useAdminAuth();

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {!session.initialized ? (
          <Stack.Screen name="SplashLoading" component={SplashLoadingScreen} />
        ) : !session.isAuthenticated ? (
          <Stack.Screen name="Login" component={AdminLoginScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainApp} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
