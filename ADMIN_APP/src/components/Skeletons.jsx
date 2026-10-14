import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

// Pulse Animation Wrapper
function PulsingView({ className = '', children }) {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <Animated.View className={className} style={{ opacity: pulseAnim }}>
      {children}
    </Animated.View>
  );
}

// 1. Product Card Skeleton
export function ProductCardSkeleton() {
  return (
    <PulsingView className="bg-surface rounded-3xl p-4 mb-4 border border-border shadow-sm">
      <View className="flex-row items-center gap-3.5 mb-3">
        <View className="w-16 h-16 rounded-2xl bg-input" />
        <View className="flex-1">
          <View className="w-3/4 h-4 bg-input rounded-lg mb-2" />
          <View className="w-1/2 h-3 bg-input rounded-lg mb-1" />
          <View className="w-1/3 h-3 bg-input rounded-lg" />
        </View>
      </View>
      <View className="flex-row items-center justify-between border-t border-border pt-3 mt-1">
        <View className="w-20 h-4 bg-input rounded-lg" />
        <View className="w-16 h-6 bg-input rounded-full" />
      </View>
    </PulsingView>
  );
}

// 2. Order Card Skeleton
export function OrderCardSkeleton() {
  return (
    <PulsingView className="bg-surface rounded-2xl p-4 mb-3 border border-border shadow-sm">
      <View className="flex-row items-center justify-between mb-2">
        <View className="w-28 h-4 bg-input rounded-md" />
        <View className="w-16 h-5 bg-input rounded-full" />
      </View>
      <View className="w-44 h-3.5 bg-input rounded-md mb-2" />
      <View className="w-32 h-3 bg-input rounded-md mb-3" />
      <View className="flex-row items-center justify-between border-t border-border pt-2">
        <View className="w-24 h-3 bg-input rounded-md" />
        <View className="w-14 h-4 bg-input rounded-md" />
      </View>
    </PulsingView>
  );
}

// 3. Category Card Skeleton
export function CategoryCardSkeleton() {
  return (
    <PulsingView className="bg-surface rounded-2xl p-4 mb-3 border border-border flex-row items-center justify-between shadow-sm">
      <View className="flex-row items-center gap-3">
        <View className="w-12 h-12 rounded-2xl bg-input" />
        <View>
          <View className="w-32 h-4 bg-input rounded-md mb-2" />
          <View className="w-20 h-3 bg-input rounded-md" />
        </View>
      </View>
      <View className="w-12 h-4 bg-input rounded-md" />
    </PulsingView>
  );
}

// 4. Buyer Card Skeleton
export function BuyerCardSkeleton() {
  return (
    <PulsingView className="bg-surface rounded-2xl p-4 mb-3 border border-border shadow-sm">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2">
          <View className="w-5 h-5 rounded-full bg-input" />
          <View className="w-36 h-4 bg-input rounded-md" />
        </View>
        <View className="w-16 h-5 bg-input rounded-full" />
      </View>
      <View className="w-28 h-3.5 bg-input rounded-md mb-2" />
      <View className="w-32 h-3 bg-input rounded-md mb-3" />
      <View className="flex-row items-center justify-between border-t border-border pt-2">
        <View className="w-40 h-3 bg-input rounded-md" />
        <View className="w-20 h-3 bg-input rounded-md" />
      </View>
    </PulsingView>
  );
}

// 5. Support Ticket Skeleton
export function TicketCardSkeleton() {
  return (
    <PulsingView className="bg-surface rounded-2xl p-4 mb-3 border border-border shadow-sm">
      <View className="flex-row items-center justify-between mb-2">
        <View className="w-32 h-4 bg-input rounded-md" />
        <View className="w-14 h-5 bg-input rounded-full" />
      </View>
      <View className="w-full h-3.5 bg-input rounded-md mb-1.5" />
      <View className="w-2/3 h-3.5 bg-input rounded-md mb-3" />
      <View className="flex-row items-center justify-between border-t border-border pt-2">
        <View className="w-28 h-3 bg-input rounded-md" />
        <View className="w-20 h-3 bg-input rounded-md" />
      </View>
    </PulsingView>
  );
}

// 6. Hero Banner Skeleton
export function BannerCardSkeleton() {
  return (
    <PulsingView className="bg-surface rounded-3xl p-3.5 mb-4 border border-border shadow-sm">
      <View className="w-full h-36 rounded-2xl bg-input mb-3" />
      <View className="flex-row items-center justify-between px-1">
        <View className="flex-1 pr-2">
          <View className="w-40 h-4 bg-input rounded-md mb-1.5" />
          <View className="w-28 h-3 bg-input rounded-md" />
        </View>
        <View className="w-9 h-9 rounded-xl bg-input" />
      </View>
    </PulsingView>
  );
}

// Reusable List Helper: Renders N instances of any skeleton component
export function SkeletonList({ Component, count = 4 }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <Component key={index} />
      ))}
    </View>
  );
}
