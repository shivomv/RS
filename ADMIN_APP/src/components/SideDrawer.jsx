import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Animated,
  Dimensions,
  PanResponder,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAdminAuth } from '../store/adminAuthStore';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(width * 0.85, 360);

export default function SideDrawer({
  visible,
  onClose,
  onOpen,
  activeTab,
  onSelectTab,
  stats = {},
}) {
  const { logout, session } = useAdminAuth();

  // Slide animation: -DRAWER_WIDTH (hidden) -> 0 (fully open)
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const [isRendered, setIsRendered] = useState(visible);

  // Sync state when `visible` prop changes from outside (e.g. Hamburger button tap)
  useEffect(() => {
    if (visible) {
      setIsRendered(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsRendered(false);
      });
    }
  }, [visible, slideAnim, backdropAnim]);

  // Real-time finger tracking PanResponder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        if (!visible && evt.nativeEvent.pageX < 35) {
          return true;
        }
        if (visible && gestureState.dx < -5) {
          return true;
        }
        return false;
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const isEdgeSwipe = !visible && evt.nativeEvent.pageX < 35 && gestureState.dx > 8;
        const isCloseSwipe = visible && gestureState.dx < -8;
        return (isEdgeSwipe || isCloseSwipe) && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderGrant: () => {
        setIsRendered(true);
      },
      onPanResponderMove: (evt, gestureState) => {
        const startX = visible ? 0 : -DRAWER_WIDTH;
        const newX = Math.min(0, Math.max(-DRAWER_WIDTH, startX + gestureState.dx));
        slideAnim.setValue(newX);

        // Backdrop opacity tracks finger move ratio: 0 (closed) to 1 (open)
        const progress = (newX + DRAWER_WIDTH) / DRAWER_WIDTH;
        backdropAnim.setValue(progress);
      },
      onPanResponderRelease: (evt, gestureState) => {
        const currentPos = visible ? 0 + gestureState.dx : -DRAWER_WIDTH + gestureState.dx;
        const shouldOpen = currentPos > -DRAWER_WIDTH * 0.65 || gestureState.vx > 0.3;

        if (shouldOpen) {
          if (onOpen) { onOpen(); }
          Animated.parallel([
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(backdropAnim, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        } else {
          if (onClose) { onClose(); }
          Animated.parallel([
            Animated.timing(slideAnim, {
              toValue: -DRAWER_WIDTH,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(backdropAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start(() => {
            setIsRendered(false);
          });
        }
      },
    })
  ).current;

  const pendingOrd = stats.pendingOrders || 0;
  const prodCount = stats.totalProducts || 0;
  const buyerCount = stats.totalBuyers || 0;

  const menuItems = [
    { key: 'dashboard', label: 'Dashboard', icon: 'dashboard', badge: null },
    { key: 'products', label: 'Products Catalog', icon: 'inventory-2', badge: prodCount > 0 ? `${prodCount}` : null },
    { key: 'orders', label: 'Orders Center', icon: 'shopping-bag', badge: pendingOrd > 0 ? `${pendingOrd} Pending` : null, badgeColor: '#ef4444' },
    { key: 'categories', label: 'Categories & Brands', icon: 'category', badge: null },
    { key: 'buyers', label: 'Registered Buyers', icon: 'storefront', badge: buyerCount > 0 ? `${buyerCount}` : null },
    { key: 'tickets', label: 'Support Desk', icon: 'headset-mic', badge: null },
    { key: 'banners', label: 'Hero Banners', icon: 'view-carousel', badge: null },
    { key: 'about', label: 'Company Profile', icon: 'info', badge: null },
  ];

  if (!visible && !isRendered) {
    // Touch region edge listener overlay when closed so finger drag is detected right at screen edge
    return (
      <View
        className="absolute left-0 top-0 bottom-0 w-8 z-40"
        {...panResponder.panHandlers}
      />
    );
  }

  return (
    <View
      className="absolute inset-0 z-50 flex-row"
      pointerEvents={isRendered ? 'auto' : 'none'}
      {...panResponder.panHandlers}
    >
      {/* Dimmed Backdrop */}
      <Animated.View
        className="absolute inset-0 bg-black/40"
        style={{ opacity: backdropAnim }}
      >
        <Pressable className="flex-1" onPress={onClose} />
      </Animated.View>

      {/* Slide-In Drawer Panel with Finger Tracking */}
      <Animated.View
        className="bg-surface h-full border-r border-border shadow-2xl z-50"
        style={{
          width: DRAWER_WIDTH,
          transform: [{ translateX: slideAnim }],
        }}
      >
        {/* Drawer Header */}
        <View className="p-5 pt-12 bg-subtle border-b border-border">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-3 flex-1 pr-2">
              <View className="w-12 h-12 rounded-2xl bg-brand justify-center items-center shadow-sm">
                <Icon name="admin-panel-settings" size={26} color="#ffffff" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-black text-ink tracking-wide" numberOfLines={1}>
                  {session?.user?.name || 'RS Admin Director'}
                </Text>
                <Text className="text-[11px] font-bold text-brand mt-0.5" numberOfLines={1}>
                  ● Active Session
                </Text>
              </View>
            </View>

            <Pressable
              onPress={onClose}
              className="w-9 h-9 rounded-full bg-input justify-center items-center border border-border active:opacity-70"
            >
              <Icon name="close" size={20} color="#475569" />
            </Pressable>
          </View>
        </View>

        {/* Menu Items */}
        <ScrollView className="flex-1 p-3" showsVerticalScrollIndicator={false}>
          <Text className="text-[11px] font-black text-faint uppercase tracking-wider px-2 my-2">
            Console Management
          </Text>

          {menuItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <Pressable
                key={item.key}
                onPress={() => {
                  onSelectTab(item.key);
                  if (onClose) { onClose(); }
                }}
                className={`flex-row items-center justify-between px-3.5 py-3.5 rounded-2xl mb-1.5 border ${
                  isActive
                    ? 'bg-brand border-brand'
                    : 'bg-subtle border-border active:bg-input'
                }`}
              >
                <View className="flex-row items-center gap-3 flex-1 pr-2">
                  <Icon name={item.icon} size={22} color={isActive ? '#ffffff' : '#64748b'} />
                  <Text
                    numberOfLines={1}
                    className={`text-xs font-bold flex-1 ${
                      isActive ? 'text-white font-extrabold' : 'text-secondary'
                    }`}
                  >
                    {item.label}
                  </Text>
                </View>

                {item.badge ? (
                  <View
                    className="px-2.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: item.badgeColor
                        ? `${item.badgeColor}20`
                        : isActive ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                    }}
                  >
                    <Text
                      className="text-[10px] font-extrabold"
                      style={{
                        color: item.badgeColor && !isActive ? item.badgeColor : isActive ? '#ffffff' : '#64748b',
                      }}
                    >
                      {item.badge}
                    </Text>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Logout Footer */}
        <View className="p-4 border-t border-border bg-surface">
          <Pressable
            onPress={() => {
              if (onClose) { onClose(); }
              logout();
            }}
            className="flex-row items-center justify-center gap-2 py-3.5 bg-red-500/10 rounded-2xl border border-red-500/30 active:opacity-80"
          >
            <Icon name="logout" size={20} color="#ef4444" />
            <Text className="text-xs font-extrabold text-red-500">Logout Console Session</Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}
