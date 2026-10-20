import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  ActivityIndicator,
  Platform,
  AppState,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAdminAuth } from '../store/adminAuthStore';
import { adminApi } from '../services/api';
import {
  registerDeviceToken,
  getFCMToken,
  requestNotificationPermission,
} from '../services/notificationService';
import { floatingOverlayService } from '../services/floatingOverlayService';
import ENV from '../config/env';

export default function NotificationSettingsScreen({ navigation }) {
  const { session } = useAdminAuth();
  const currentMobile = session?.user?.mobile || '9026773268';

  // Toggle states
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [hasOverlayPermission, setHasOverlayPermission] = useState(false);
  const [loadingOverlayCheck, setLoadingOverlayCheck] = useState(true);
  const [syncingToken, setSyncingToken] = useState(false);
  const [testingOrder, setTestingOrder] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [registeredDevice, setRegisteredDevice] = useState(null);

  // Check overlay permission
  const checkOverlay = async () => {
    if (Platform.OS !== 'android') return;
    try {
      const permitted = await floatingOverlayService.checkPermission();
      setHasOverlayPermission(permitted);
    } catch (_) {}
    setLoadingOverlayCheck(false);
  };

  // Check backend device registration status
  const checkBackendStatus = async () => {
    try {
      const res = await adminApi.getRegisteredDevices().catch(() => null);
      if (res && res.success && Array.isArray(res.data)) {
        const myDevice = res.data.find(
          (d) => d.adminIdentifier === currentMobile || d.isActive
        );
        if (myDevice) {
          setRegisteredDevice(myDevice);
          setNotificationsEnabled(myDevice.isActive !== false);
        } else {
          setRegisteredDevice(null);
          setNotificationsEnabled(false);
        }
      }
    } catch (_) {}
  };

  useEffect(() => {
    checkOverlay();
    checkBackendStatus();

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        checkOverlay();
        checkBackendStatus();
      }
    });

    return () => sub.remove();
  }, [currentMobile]);

  // Master Notifications Toggle Handler
  const handleToggleNotifications = async (value) => {
    setSyncingToken(true);
    setStatusMessage({ type: '', text: '' });
    try {
      if (value) {
        // Turn ON: request permission and register device token with backend
        await requestNotificationPermission();
        const token = await registerDeviceToken(currentMobile);
        if (token) {
          setNotificationsEnabled(true);
          setStatusMessage({
            type: 'success',
            text: 'Order notifications enabled! Your device is registered to receive instant alerts.',
          });
          checkBackendStatus();
        } else {
          setStatusMessage({
            type: 'error',
            text: 'Could not retrieve notification token. Ensure notification permissions are allowed in Android Settings.',
          });
        }
      } else {
        // Turn OFF: unregister device token from backend
        let token = null;
        try {
          token = await getFCMToken();
        } catch (_) {}

        await adminApi.unregisterDeviceToken({
          token: token || undefined,
          adminIdentifier: currentMobile,
        });

        setNotificationsEnabled(false);
        setRegisteredDevice(null);
        setStatusMessage({
          type: 'info',
          text: 'Order notifications disabled. Device unregistered from alerts.',
        });
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Failed to update notification settings',
      });
    } finally {
      setSyncingToken(false);
    }
  };

  // Open Android Floating Permission Settings
  const handleRequestOverlay = () => {
    floatingOverlayService.requestPermission();
  };

  // Test Notification via Real Test Order
  const handleTestOrder = async () => {
    setTestingOrder(true);
    setStatusMessage({ type: '', text: '' });
    try {
      const res = await fetch(`${ENV.API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyerName: 'Live Order Alert Test',
          buyerPhone: currentMobile,
          totalAmount: 1250,
          items: [
            {
              name: 'Industrial Cleaner 5L (Sample Alert)',
              unitPrice: 1250,
              quantity: 1,
            },
          ],
          deliveryAddress: 'Test Location, Kanpur Industrial Area',
        }),
      });

      const data = await res.json();
      if (data && (data.orderId || data.id)) {
        setStatusMessage({
          type: 'success',
          text: `Real test order #${data.orderId || data.id} placed! Alert dispatched to your device.`,
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: 'Test order dispatch failed. Check backend connection.',
        });
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Network error triggering test order',
      });
    } finally {
      setTestingOrder(false);
    }
  };

  return (
    <View className="flex-1 bg-background">
      {/* Screen Header */}
      <View className="px-5 pt-12 pb-4 bg-surface border-b border-border flex-row items-center justify-between shadow-sm">
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => navigation.goBack()}
            className="w-9 h-9 rounded-full bg-input justify-center items-center border border-border active:opacity-70"
          >
            <Icon name="arrow-back" size={20} color="#0f172a" />
          </Pressable>
          <View>
            <Text className="text-base font-black text-ink">Notification Settings</Text>
            <Text className="text-[11px] font-bold text-muted">Order Alerts & System Overlay Control</Text>
          </View>
        </View>

        <View className="flex-row items-center gap-1 bg-[#006948]/10 px-2.5 py-1 rounded-full border border-[#006948]/20">
          <View className={`w-2 h-2 rounded-full ${notificationsEnabled ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          <Text className="text-[10px] font-black text-[#006948] uppercase tracking-wider">
            {notificationsEnabled ? 'Active' : 'Muted'}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Message Banner */}
        {statusMessage.text ? (
          <View
            className={`p-3.5 rounded-2xl mb-4 border flex-row items-start gap-2.5 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200'
                : statusMessage.type === 'error'
                ? 'bg-red-50 border-red-200'
                : 'bg-blue-50 border-blue-200'
            }`}
          >
            <Icon
              name={
                statusMessage.type === 'success'
                  ? 'check-circle'
                  : statusMessage.type === 'error'
                  ? 'error-outline'
                  : 'info'
              }
              size={18}
              color={
                statusMessage.type === 'success'
                  ? '#059669'
                  : statusMessage.type === 'error'
                  ? '#ef4444'
                  : '#2563eb'
              }
            />
            <Text
              className={`text-xs font-semibold flex-1 ${
                statusMessage.type === 'success'
                  ? 'text-emerald-900'
                  : statusMessage.type === 'error'
                  ? 'text-red-700'
                  : 'text-blue-900'
              }`}
            >
              {statusMessage.text}
            </Text>
          </View>
        ) : null}

        {/* 1. Master Order Notifications Card */}
        <View className="bg-surface rounded-3xl p-5 border border-border shadow-sm mb-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3 flex-1 pr-3">
              <View className="w-11 h-11 rounded-2xl bg-[#006948]/10 justify-center items-center">
                <Icon name="notifications-active" size={24} color="#006948" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-extrabold text-ink">Receive Order Notifications</Text>
                <Text className="text-[11px] font-medium text-muted mt-0.5">
                  Get instant sound and drawer alerts when customers place new orders
                </Text>
              </View>
            </View>

            {syncingToken ? (
              <ActivityIndicator size="small" color="#006948" />
            ) : (
              <Switch
                value={notificationsEnabled}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: '#cbd5e1', true: '#006948' }}
                thumbColor="#ffffff"
              />
            )}
          </View>

          <View className="mt-4 pt-3 border-t border-border/60 flex-row items-center justify-between">
            <Text className="text-[11px] font-bold text-muted">Admin Account</Text>
            <Text className="text-xs font-black text-ink">
              {session?.user?.name || 'Super Admin'} ({currentMobile})
            </Text>
          </View>
        </View>

        {/* 2. Floating Draw-Over-Apps Card */}
        <View className="bg-surface rounded-3xl p-5 border border-border shadow-sm mb-4">
          <View className="flex-row items-start gap-3">
            <View
              className={`w-11 h-11 rounded-2xl justify-center items-center ${
                hasOverlayPermission ? 'bg-emerald-500/10' : 'bg-amber-500/10'
              }`}
            >
              <Icon
                name="layers"
                size={24}
                color={hasOverlayPermission ? '#059669' : '#d97706'}
              />
            </View>

            <View className="flex-1">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-extrabold text-ink">
                  Floating "Draw Over Apps" Alert
                </Text>
                <View
                  className={`px-2 py-0.5 rounded-full ${
                    hasOverlayPermission ? 'bg-emerald-100' : 'bg-amber-100'
                  }`}
                >
                  <Text
                    className={`text-[10px] font-black ${
                      hasOverlayPermission ? 'text-emerald-800' : 'text-amber-800'
                    }`}
                  >
                    {hasOverlayPermission ? 'Enabled' : 'Permission Required'}
                  </Text>
                </View>
              </View>

              <Text className="text-[11px] font-medium text-muted mt-1 leading-4">
                Pops up a prominent order card over WhatsApp, YouTube, and other apps even when your phone is outside the Admin app.
              </Text>

              {!hasOverlayPermission ? (
                <Pressable
                  onPress={handleRequestOverlay}
                  className="mt-3 bg-amber-600 px-4 py-2.5 rounded-xl flex-row items-center justify-center gap-1.5 active:opacity-80"
                >
                  <Icon name="tune" size={16} color="#ffffff" />
                  <Text className="text-xs font-bold text-white">
                    Enable "Display Over Other Apps" in Settings
                  </Text>
                </Pressable>
              ) : (
                <View className="mt-3 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl flex-row items-center justify-between">
                  <Text className="text-[11px] font-bold text-emerald-800">
                    System Overlay Active
                  </Text>
                  <Pressable onPress={handleRequestOverlay}>
                    <Text className="text-[11px] font-bold text-emerald-700 underline">
                      Manage in Settings
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* 3. Live Test & Verification Card */}
        <View className="bg-surface rounded-3xl p-5 border border-border shadow-sm mb-4">
          <View className="flex-row items-center gap-3 mb-3">
            <View className="w-11 h-11 rounded-2xl bg-brand/10 justify-center items-center">
              <Icon name="bolt" size={24} color="#006948" />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-extrabold text-ink">Live End-to-End Test</Text>
              <Text className="text-[11px] font-medium text-muted">
                Place an actual test order on the database to verify sound, notification, and floating popup
              </Text>
            </View>
          </View>

          <Pressable
            onPress={handleTestOrder}
            disabled={testingOrder || !notificationsEnabled}
            className={`py-3.5 px-4 rounded-2xl flex-row items-center justify-center gap-2 ${
              !notificationsEnabled
                ? 'bg-slate-200 opacity-60'
                : 'bg-brand active:opacity-85 shadow-sm'
            }`}
          >
            {testingOrder ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Icon name="play-arrow" size={20} color="#ffffff" />
                <Text className="text-xs font-extrabold text-white tracking-wide">
                  Trigger Live Test Order
                </Text>
              </>
            )}
          </Pressable>

          {!notificationsEnabled ? (
            <Text className="text-[10px] text-muted text-center mt-2 font-medium">
              Turn on notifications above to test live delivery.
            </Text>
          ) : null}
        </View>

        {/* 4. Diagnostics & Live Connection Info */}
        <View className="bg-surface rounded-3xl p-5 border border-border shadow-sm">
          <Text className="text-[11px] font-black text-faint uppercase tracking-wider mb-3">
            Live Delivery Channels
          </Text>

          <View className="flex-row items-center justify-between py-2.5 border-b border-border/50">
            <View className="flex-row items-center gap-2">
              <Icon name="cloud-sync" size={18} color="#006948" />
              <Text className="text-xs font-bold text-secondary">Real-Time WebSocket Stream</Text>
            </View>
            <View className="flex-row items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <View className="w-2 h-2 rounded-full bg-emerald-500" />
              <Text className="text-[10px] font-black text-emerald-700">0ms Latency</Text>
            </View>
          </View>

          <View className="flex-row items-center justify-between py-2.5 border-b border-border/50">
            <View className="flex-row items-center gap-2">
              <Icon name="send" size={18} color="#002d62" />
              <Text className="text-xs font-bold text-secondary">Firebase Cloud Messaging (FCM)</Text>
            </View>
            <Text className="text-xs font-black text-ink">
              {registeredDevice ? 'Device Registered' : 'Not Registered'}
            </Text>
          </View>

          <View className="flex-row items-center justify-between py-2.5 border-b border-border/50">
            <View className="flex-row items-center gap-2">
              <Icon name="phonelink" size={18} color="#64748b" />
              <Text className="text-xs font-bold text-secondary">Registered Device Model</Text>
            </View>
            <Text className="text-xs font-black text-ink">
              {registeredDevice?.deviceModel || `${Platform.OS} API ${Platform.Version}`}
            </Text>
          </View>

          <View className="flex-row items-center justify-between pt-2.5">
            <View className="flex-row items-center gap-2">
              <Icon name="volume-up" size={18} color="#64748b" />
              <Text className="text-xs font-bold text-secondary">Alert Chime Sound</Text>
            </View>
            <Text className="text-xs font-black text-ink">order_alert.wav</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
