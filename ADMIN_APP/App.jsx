import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import CustomAlertModal from './src/components/CustomAlertModal';
import { registerDeviceToken, initNotificationListeners } from './src/services/notificationService';

export default function App() {
  useEffect(() => {
    // 1. Register FCM device token with backend
    registerDeviceToken();

    // 2. Setup notification listeners for foreground, background, and cold start
    const cleanup = initNotificationListeners((orderData) => {
      console.log('[App] New order notification handled:', orderData);
    });

    return () => {
      if (typeof cleanup === 'function') cleanup();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <RootNavigator />
      <CustomAlertModal />
    </SafeAreaProvider>
  );
}

