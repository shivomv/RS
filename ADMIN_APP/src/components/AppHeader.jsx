import React from 'react';
import { View, Text, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { navigate } from '../navigation/navigationRef';

export default function AppHeader({ activeTab, onOpenDrawer, onRefresh }) {
  return (
    <View className="bg-surface border-b border-border px-4 py-3 flex-row items-center justify-between shadow-sm">
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={onOpenDrawer}
          className="w-10 h-10 rounded-2xl bg-input justify-center items-center border border-border active:opacity-70"
        >
          <Icon name="menu" size={24} color="#006948" />
        </Pressable>
        <View>
          <Text className="text-base font-black text-ink tracking-wide">RS Admin Console</Text>
          <Text className="text-[10px] font-bold text-muted uppercase tracking-widest">
            {activeTab.toUpperCase()}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2">
        <Pressable
          onPress={() => navigate('Settings')}
          className="w-9 h-9 rounded-2xl bg-input justify-center items-center border border-border active:opacity-70"
        >
          <Icon name="notifications-none" size={20} color="#006948" />
        </Pressable>

        {onRefresh ? (
          <Pressable
            onPress={onRefresh}
            className="w-9 h-9 rounded-2xl bg-input justify-center items-center border border-border active:opacity-70"
          >
            <Icon name="refresh" size={20} color="#006948" />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
