import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

export function Skeleton({ width, height, borderRadius = 12, style, className = '' }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width,
          height: height,
          borderRadius: borderRadius,
          backgroundColor: '#e2e7ff',
          opacity: opacity,
        },
        style,
      ]}
      className={className}
    />
  );
}

// Category Pill Skeleton
export function CategorySkeleton() {
  return (
    <View className="items-center mr-4 w-[74px]">
      <Skeleton width={64} height={64} borderRadius={16} className="mb-1.5" />
      <Skeleton width={50} height={10} borderRadius={4} />
    </View>
  );
}

// Vertical Sidenav Category Item Skeleton
export function CategoryItemSkeleton() {
  return (
    <View className="py-4 px-2 items-center">
      <Skeleton width={44} height={44} borderRadius={12} className="mb-2" />
      <Skeleton width={50} height={10} borderRadius={4} />
    </View>
  );
}

// Product Grid Card Skeleton (Matching RS 2-column layout)
export function ProductCardSkeleton() {
  return (
    <View className="w-[48.5%] bg-white rounded-2xl p-3 shadow-sm justify-between border border-[#eaedff]">
      <View>
        <Skeleton width="100%" height={112} borderRadius={12} className="mb-2" />
        <Skeleton width="85%" height={12} borderRadius={4} className="mb-1" />
        <Skeleton width="50%" height={10} borderRadius={4} className="mb-2" />
      </View>
      <View className="flex-row items-center justify-between pt-2 border-t border-[#f2f3ff] mt-2">
        <Skeleton width={45} height={16} borderRadius={4} />
        <Skeleton width={50} height={28} borderRadius={8} />
      </View>
    </View>
  );
}

// Banner Skeleton
export function BannerSkeleton() {
  return (
    <View className="px-4 pb-3">
      <Skeleton width="100%" height={44} borderRadius={12} />
    </View>
  );
}

// Order List Card Skeleton
export function OrderCardSkeleton() {
  return (
    <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-[#eaedff]">
      <View className="flex-row justify-between items-start mb-3">
        <View className="gap-1">
          <Skeleton width={110} height={14} borderRadius={4} />
          <Skeleton width={80} height={10} borderRadius={4} />
        </View>
        <Skeleton width={70} height={20} borderRadius={10} />
      </View>
      <View className="py-2.5 border-y border-[#f2f3ff] my-1 flex-row justify-between items-center">
        <Skeleton width={130} height={12} borderRadius={4} />
        <Skeleton width={60} height={16} borderRadius={4} />
      </View>
      <View className="pt-2 flex-row justify-between items-center">
        <Skeleton width={100} height={10} borderRadius={4} />
        <Skeleton width={16} height={16} borderRadius={8} />
      </View>
    </View>
  );
}

// Product Detail Screen Skeleton
export function ProductDetailSkeleton() {
  return (
    <View className="p-4 gap-y-4">
      <Skeleton width="100%" height={220} borderRadius={20} />
      <Skeleton width="75%" height={22} borderRadius={6} />
      <Skeleton width="45%" height={14} borderRadius={4} />
      <View className="flex-row gap-2 py-2">
        <Skeleton width={70} height={36} borderRadius={10} />
        <Skeleton width={70} height={36} borderRadius={10} />
        <Skeleton width={70} height={36} borderRadius={10} />
      </View>
      <Skeleton width="100%" height={100} borderRadius={16} />
    </View>
  );
}

// Financial Ledger Summary Skeleton
export function LedgerSkeleton() {
  return (
    <View className="p-4 gap-y-3">
      <Skeleton width="100%" height={110} borderRadius={20} />
      <Skeleton width="100%" height={60} borderRadius={14} />
      <Skeleton width="100%" height={60} borderRadius={14} />
      <Skeleton width="100%" height={60} borderRadius={14} />
    </View>
  );
}

// Support Ticket List Skeleton
export function TicketSkeleton() {
  return (
    <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-[#eaedff]">
      <View className="flex-row justify-between items-center mb-2">
        <Skeleton width={140} height={14} borderRadius={4} />
        <Skeleton width={60} height={18} borderRadius={10} />
      </View>
      <Skeleton width="90%" height={12} borderRadius={4} className="mb-2" />
      <Skeleton width="60%" height={10} borderRadius={4} />
    </View>
  );
}

// Address Item Skeleton
export function AddressSkeleton() {
  return (
    <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-[#eaedff]">
      <View className="flex-row justify-between items-center mb-2">
        <Skeleton width={100} height={14} borderRadius={4} />
        <Skeleton width={50} height={16} borderRadius={6} />
      </View>
      <Skeleton width="95%" height={12} borderRadius={4} className="mb-1" />
      <Skeleton width="70%" height={12} borderRadius={4} />
    </View>
  );
}
