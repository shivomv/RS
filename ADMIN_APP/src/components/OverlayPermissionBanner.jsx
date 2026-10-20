import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, AppState, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { floatingOverlayService } from '../services/floatingOverlayService';

export default function OverlayPermissionBanner() {
  const [hasPermission, setHasPermission] = useState(true);
  const [checking, setChecking] = useState(true);

  const checkStatus = async () => {
    if (Platform.OS !== 'android') return;
    const permitted = await floatingOverlayService.checkPermission();
    setHasPermission(permitted);
    setChecking(false);
  };

  useEffect(() => {
    checkStatus();

    // Re-check whenever admin returns from system settings
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        checkStatus();
      }
    });

    return () => sub.remove();
  }, []);

  const handleEnable = () => {
    floatingOverlayService.requestPermission();
  };

  const [triggering, setTriggering] = useState(false);

  const handleLiveTestOrder = async () => {
    try {
      setTriggering(true);
      const ENV = require('../config/env').default;
      const res = await fetch(`${ENV.API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerName: 'Live Order Test Buyer',
          buyerPhone: '+919999999999',
          totalAmount: 2450,
          items: [
            {
              name: 'Industrial Floor Cleaner 5L',
              unitPrice: 490,
              quantity: 5,
            },
          ],
        }),
      });
      const data = await res.json();
      console.log('Real order created on backend:', data.orderId || data.id);
    } catch (e) {
      console.warn('Live test order error:', e.message);
    } finally {
      setTriggering(false);
    }
  };

  if (checking || Platform.OS !== 'android') return null;

  if (!hasPermission) {
    return (
      <View className="mb-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 flex-row items-center justify-between shadow-sm">
        <View className="flex-1 pr-3">
          <View className="flex-row items-center gap-1.5 mb-1">
            <Icon name="layers" size={16} color="#d97706" />
            <Text className="text-xs font-black text-amber-800">
              Floating Order Alerts Disabled
            </Text>
          </View>
          <Text className="text-[11px] text-amber-900/80 font-medium leading-4">
            Allow "Display over other apps" to see floating order cards even while on WhatsApp or Home Screen.
          </Text>
        </View>

        <Pressable
          onPress={handleEnable}
          className="bg-amber-600 px-3 py-2 rounded-xl active:opacity-80"
        >
          <Text className="text-xs font-bold text-white">Enable Now</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="mb-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 flex-row items-center justify-between">
      <View className="flex-row items-center gap-2 flex-1">
        <View className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
        <Text className="text-[11px] font-bold text-emerald-800">
          Floating Order Alerts Active (Draw Over Apps Enabled)
        </Text>
      </View>

      <Pressable
        onPress={handleLiveTestOrder}
        disabled={triggering}
        className="bg-brand px-3 py-1.5 rounded-lg active:opacity-80 flex-row items-center gap-1"
      >
        <Icon name="bolt" size={14} color="#ffffff" />
        <Text className="text-[10px] font-bold text-white">
          {triggering ? 'Creating...' : 'Live Test Order'}
        </Text>
      </Pressable>
    </View>
  );
}
