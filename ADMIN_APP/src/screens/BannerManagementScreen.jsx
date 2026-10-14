import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Image, ActivityIndicator, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import { adminApi } from '../services/api';
import { BannerCardSkeleton, SkeletonList } from '../components/Skeletons';
import Alert from '../utils/alert';

export default function BannerManagementScreen({ banners: initialBanners = [], onRefresh }) {
  const [bannerList, setBannerList] = useState(initialBanners);
  const [loading, setLoading] = useState(initialBanners.length === 0);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBannersData = async () => {
    try {
      const res = await adminApi.getBanners().catch(() => []);
      setBannerList(Array.isArray(res) ? res : (res?.data || []));
    } catch (e) {
      console.error('[BannerManagementScreen] Fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBannersData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBannersData();
    if (typeof onRefresh === 'function') onRefresh();
  };

  const [activeView, setActiveView] = useState('list');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('Factory Wholesale Sale');
  const [imageUrl, setImageUrl] = useState('');
  const [targetCategory, setTargetCategory] = useState('Floor Cleaners');
  const [saving, setSaving] = useState(false);

  const handlePickBannerImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        includeBase64: true,
        quality: 0.6,
        maxWidth: 1024,
        maxHeight: 1024,
      });
      if (!result.didCancel && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const img = asset.base64
          ? `data:${asset.type || 'image/jpeg'};base64,${asset.base64}`
          : asset.uri;
        if (img) {
          setImageUrl(img);
        }
      }
    } catch (err) {
      Alert.alert('Gallery Error', 'Could not open gallery');
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !imageUrl.trim()) {
      Alert.alert('Validation Error', 'Title and Image URL are required.'); return;
    }
    setSaving(true);
    try {
      await adminApi.createBanner({
        title: title.trim(),
        subtitle: (subtitle || '').trim(),
        image: imageUrl.trim(),
        imageUrl: imageUrl.trim(),
        targetCategory: targetCategory.trim(),
      });
      Alert.alert('Published', `Banner "${title}" published.`);
      setTitle(''); setImageUrl('');
      setActiveView('list');
      fetchBannersData();
      if (typeof onRefresh === 'function') { onRefresh(); }
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to create banner');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id, banTitle) => {
    Alert.alert('Delete Banner', `Remove "${banTitle}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await adminApi.deleteBanner(id);
          fetchBannersData();
          if (typeof onRefresh === 'function') { onRefresh(); }
        } catch (err) { Alert.alert('Error', err.message); }
      }},
    ]);
  };

  /* ── EDITOR VIEW ── */
  if (activeView === 'editor') {
    return (
      <View className="flex-1 bg-background">
        <View className="bg-surface border-b border-border px-4 py-3 flex-row items-center gap-3">
          <Pressable
            onPress={() => setActiveView('list')}
            className="w-10 h-10 rounded-2xl bg-input justify-center items-center border border-border active:opacity-70"
          >
            <Icon name="arrow-back" size={22} color="#006948" />
          </Pressable>
          <View className="flex-1">
            <Text className="text-base font-black text-ink" numberOfLines={1}>Create Hero Banner</Text>
            <Text className="text-[10px] font-bold text-muted">Media Campaign Editor</Text>
          </View>
        </View>

        <ScrollView className="flex-1 p-5" contentContainerStyle={{ paddingBottom: 60 }}>
          <View className="bg-surface rounded-3xl p-5 mb-5 border border-border">
            <View className="mb-4">
              <Text className="text-[11px] font-bold text-muted mb-1 uppercase tracking-wider">Banner Headline *</Text>
              <TextInput value={title} onChangeText={setTitle} placeholder="e.g. Festival Mega Discount"
                placeholderTextColor="#94a3b8"
                className="bg-input rounded-2xl px-4 py-3.5 text-sm font-bold text-ink border border-border" />
            </View>
            <View className="mb-4">
              <Text className="text-[11px] font-bold text-muted mb-1 uppercase tracking-wider">Subtitle Tagline</Text>
              <TextInput value={subtitle} onChangeText={setSubtitle} placeholder="Subhead details..."
                placeholderTextColor="#94a3b8"
                className="bg-input rounded-2xl px-4 py-3.5 text-xs font-bold text-ink border border-border" />
            </View>
            <View className="mb-4">
              <Text className="text-[11px] font-bold text-muted mb-2 uppercase tracking-wider">Banner Graphic Media *</Text>
              
              {imageUrl ? (
                <View className="mb-3">
                  <Image source={{ uri: imageUrl }} className="w-full h-40 rounded-2xl bg-input border border-border mb-2.5" resizeMode="cover" />
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={handlePickBannerImage}
                      className="bg-brand px-3.5 py-2 rounded-xl flex-row items-center gap-1.5 active:opacity-90"
                    >
                      <Icon name="photo-library" size={16} color="#ffffff" />
                      <Text className="text-xs font-bold text-white">Change Banner Photo</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setImageUrl('')}
                      className="bg-red-500/10 px-3.5 py-2 rounded-xl border border-red-500/30 flex-row items-center gap-1.5 active:opacity-90"
                    >
                      <Icon name="delete" size={16} color="#ef4444" />
                      <Text className="text-xs font-bold text-red-500">Remove</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Pressable
                  onPress={handlePickBannerImage}
                  className="border-2 border-dashed border-border rounded-2xl p-6 items-center justify-center bg-input/50 mb-3 active:opacity-75"
                >
                  <Icon name="add-photo-alternate" size={36} color="#006948" />
                  <Text className="text-xs font-extrabold text-ink mt-2">Select Banner Photo from Gallery</Text>
                  <Text className="text-[10px] text-muted mt-0.5">High-resolution banner banner (16:9 ratio)</Text>
                </Pressable>
              )}

            </View>
            <View>
              <Text className="text-[11px] font-bold text-muted mb-1 uppercase tracking-wider">Target Category</Text>
              <TextInput value={targetCategory} onChangeText={setTargetCategory} placeholder="Floor Cleaners"
                placeholderTextColor="#94a3b8"
                className="bg-input rounded-2xl px-4 py-3.5 text-xs font-bold text-ink border border-border" />
            </View>
          </View>

          <Pressable onPress={handleSave} disabled={saving}
            className="bg-brand rounded-2xl py-4 items-center justify-center flex-row gap-2 active:opacity-90">
            {saving ? <ActivityIndicator size="small" color="#fff" /> : (
              <>
                <Icon name="check-circle" size={20} color="#fff" />
                <Text className="text-sm font-black text-white uppercase tracking-wider">Publish Hero Banner</Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  /* ── LIST VIEW ── */
  return (
    <View className="flex-1 bg-background">
      <View className="p-4 bg-surface border-b border-border flex-row items-center justify-between">
        <View>
          <Text className="text-base font-black text-ink">Hero Promo Banners</Text>
          <Text className="text-[10px] text-muted font-bold">Active: {bannerList.length}</Text>
        </View>
        <Pressable onPress={() => setActiveView('editor')}
          className="bg-brand px-4 py-2.5 rounded-2xl flex-row items-center gap-1.5 active:opacity-90">
          <Icon name="add" size={20} color="#fff" />
          <Text className="text-xs font-black text-white">Add Banner</Text>
        </Pressable>
      </View>

      <ScrollView
        className="flex-1 p-4"
        contentContainerStyle={{ paddingBottom: 60 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#006948" />}
      >
        {loading ? (
          <SkeletonList Component={BannerCardSkeleton} count={3} />
        ) : bannerList.length === 0 ? (
          <View className="py-16 items-center">
            <Icon name="collections" size={48} color="#cbd5e1" />
            <Text className="text-sm font-bold text-faint mt-3">No banners set</Text>
          </View>
        ) : (
          bannerList.map(ban => (
            <View key={ban._id || ban.title} className="bg-surface rounded-3xl p-3.5 mb-4 border border-border">
              <Image source={{ uri: ban.imageUrl || ban.image }} className="w-full h-36 rounded-2xl mb-3 bg-input" resizeMode="cover" />
              <View className="flex-row items-center justify-between px-1">
                <View className="flex-1 pr-2">
                  <Text className="text-sm font-black text-ink">{ban.title || 'Promotional Banner'}</Text>
                  {ban.subtitle ? <Text className="text-xs text-muted">{ban.subtitle}</Text> : null}
                </View>
                {ban._id ? (
                  <Pressable onPress={() => handleDelete(ban._id, ban.title)}
                    className="w-9 h-9 rounded-xl bg-red-50 justify-center items-center border border-red-100 active:opacity-70">
                    <Icon name="delete" size={18} color="#ef4444" />
                  </Pressable>
                ) : null}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
