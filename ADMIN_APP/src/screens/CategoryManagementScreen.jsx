import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator, RefreshControl, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import { adminApi } from '../services/api';
import { CategoryCardSkeleton, SkeletonList } from '../components/Skeletons';
import Alert from '../utils/alert';

export default function CategoryManagementScreen({ categories: initialCategories = [], onRefresh }) {
  const [categoryList, setCategoryList] = useState(initialCategories);
  const [loading, setLoading] = useState(initialCategories.length === 0);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCategoriesData = async () => {
    try {
      const res = await adminApi.getCategories().catch(() => []);
      setCategoryList(Array.isArray(res) ? res : (res?.data || []));
    } catch (e) {
      console.error('[CategoryManagementScreen] Fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCategoriesData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCategoriesData();
    if (typeof onRefresh === 'function') onRefresh();
  };

  const [activeView, setActiveView] = useState('list');
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('cleaning-services');
  const [image, setImage] = useState('');
  const [displayOrder, setDisplayOrder] = useState('1');
  const [saving, setSaving] = useState(false);

  const openEditor = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setName(cat.name || '');
      setIcon(cat.icon || 'cleaning-services');
      setImage(cat.image || '');
      setDisplayOrder(String(cat.displayOrder || '1'));
    } else {
      setEditingCategory(null);
      setName('');
      setIcon('cleaning-services');
      setImage('');
      setDisplayOrder(String(categoryList.length + 1));
    }
    setActiveView('editor');
  };

  const handlePickCategoryImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        includeBase64: true,
        quality: 0.7,
        maxWidth: 800,
        maxHeight: 800,
      });
      if (!result.didCancel && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const img = asset.base64
          ? `data:${asset.type || 'image/jpeg'};base64,${asset.base64}`
          : asset.uri;
        if (img) {
          setImage(img);
        }
      }
    } catch (err) {
      Alert.alert('Gallery Error', 'Could not open device gallery');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Validation Error', 'Category Name is required.'); return; }
    setSaving(true);
    try {
      const slug = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
      const payload = {
        name: name.trim(),
        slug,
        icon: icon.trim() || 'cleaning-services',
        image: image.trim() || icon.trim() || 'cleaning-services',
        displayOrder: Number(displayOrder || 1)
      };
      if (editingCategory?._id) {
        await adminApi.updateCategory(editingCategory._id, payload);
        Alert.alert('Saved', `Updated ${name} successfully.`);
      } else {
        await adminApi.createCategory(payload);
        Alert.alert('Created', `Category ${name} added.`);
      }
      setActiveView('list');
      fetchCategoriesData();
      if (typeof onRefresh === 'function') { onRefresh(); }
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
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
            <Text className="text-base font-black text-ink" numberOfLines={1}>
              {editingCategory ? `Edit: ${editingCategory.name}` : 'Create New Category'}
            </Text>
            <Text className="text-[10px] font-bold text-muted">Category Taxonomy Editor</Text>
          </View>
        </View>

        <ScrollView className="flex-1 p-5" contentContainerStyle={{ paddingBottom: 60 }}>
          <View className="bg-surface rounded-3xl p-5 mb-5 border border-border">
            <View className="mb-4">
              <Text className="text-[11px] font-bold text-muted mb-1 uppercase tracking-wider">Category Name *</Text>
              <TextInput value={name} onChangeText={setName} placeholder="e.g. Industrial Degreasers"
                placeholderTextColor="#94a3b8"
                className="bg-input rounded-2xl px-4 py-3.5 text-sm font-bold text-ink border border-border" />
            </View>
            <View className="mb-4">
              <Text className="text-[11px] font-bold text-muted mb-1 uppercase tracking-wider">Material Icon Name</Text>
              <TextInput value={icon} onChangeText={setIcon} placeholder="cleaning-services"
                placeholderTextColor="#94a3b8"
                className="bg-input rounded-2xl px-4 py-3.5 text-xs font-bold text-ink border border-border" />
              <Text className="text-[10px] text-faint mt-1">Icon name from Google MaterialIcons set.</Text>
            </View>
            <View className="mb-4">
              <Text className="text-[11px] font-bold text-muted mb-2 uppercase tracking-wider">
                Category Image (Square Full-Size)
              </Text>
              
              {image ? (
                <View className="items-center mb-2">
                  <View className="w-28 h-28 rounded-2xl bg-input border border-border overflow-hidden mb-3">
                    <Image source={{ uri: image }} className="w-full h-full" resizeMode="cover" />
                  </View>
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={handlePickCategoryImage}
                      className="bg-brand px-3.5 py-2 rounded-xl flex-row items-center gap-1.5 active:opacity-90"
                    >
                      <Icon name="photo-library" size={16} color="#ffffff" />
                      <Text className="text-xs font-bold text-white">Change Photo</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setImage('')}
                      className="bg-red-500/10 px-3.5 py-2 rounded-xl border border-red-500/30 flex-row items-center gap-1.5 active:opacity-90"
                    >
                      <Icon name="delete" size={16} color="#ef4444" />
                      <Text className="text-xs font-bold text-red-500">Remove</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Pressable
                  onPress={handlePickCategoryImage}
                  className="border-2 border-dashed border-border rounded-2xl p-6 items-center justify-center bg-input/50 mb-2 active:opacity-75"
                >
                  <Icon name="add-photo-alternate" size={36} color="#006948" />
                  <Text className="text-xs font-extrabold text-ink mt-2">Upload Image from Gallery</Text>
                  <Text className="text-[10px] text-muted mt-0.5">Auto-centered square crop • Full size</Text>
                </Pressable>
              )}
            </View>
            <View>
              <Text className="text-[11px] font-bold text-muted mb-1 uppercase tracking-wider">Display Sort Order</Text>
              <TextInput value={displayOrder} onChangeText={setDisplayOrder} placeholder="1"
                placeholderTextColor="#94a3b8" keyboardType="numeric"
                className="bg-input rounded-2xl px-4 py-3.5 text-xs font-bold text-ink border border-border" />
            </View>
          </View>

          <Pressable onPress={handleSave} disabled={saving}
            className="bg-brand rounded-2xl py-4 items-center justify-center flex-row gap-2 active:opacity-90">
            {saving ? <ActivityIndicator size="small" color="#fff" /> : (
              <>
                <Icon name="check-circle" size={20} color="#fff" />
                <Text className="text-sm font-black text-white uppercase tracking-wider">
                  {editingCategory ? 'Save Changes' : 'Publish Category'}
                </Text>
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
          <Text className="text-base font-black text-ink">Categories & Taxonomy</Text>
          <Text className="text-[10px] text-muted font-bold">Total: {categoryList.length}</Text>
        </View>
        <Pressable onPress={() => openEditor(null)}
          className="bg-brand px-4 py-2.5 rounded-2xl flex-row items-center gap-1.5 active:opacity-90">
          <Icon name="add" size={20} color="#fff" />
          <Text className="text-xs font-black text-white uppercase tracking-wider">Create</Text>
        </Pressable>
      </View>

      <ScrollView
        className="flex-1 p-4"
        contentContainerStyle={{ paddingBottom: 60 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#006948" />}
      >
        {loading ? (
          <SkeletonList Component={CategoryCardSkeleton} count={4} />
        ) : categoryList.length === 0 ? (
          <View className="py-16 items-center">
            <Icon name="category" size={48} color="#cbd5e1" />
            <Text className="text-sm font-bold text-faint mt-3">No categories found</Text>
          </View>
        ) : (
          categoryList.map(cat => (
            <Pressable key={cat._id || cat.name} onPress={() => openEditor(cat)}
              className="bg-surface rounded-2xl p-4 mb-3 border border-border flex-row items-center justify-between active:opacity-90">
              <View className="flex-row items-center gap-3">
                <View className="w-12 h-12 rounded-2xl bg-[#006948]/10 justify-center items-center border border-border overflow-hidden">
                  {cat.image && (cat.image.startsWith('http') || cat.image.startsWith('data:')) ? (
                    <Image source={{ uri: cat.image }} className="w-full h-full" resizeMode="cover" />
                  ) : (
                    <Icon name={cat.icon || cat.image || 'cleaning-services'} size={24} color="#006948" />
                  )}
                </View>
                <View>
                  <Text className="text-sm font-black text-ink">{cat.name}</Text>
                  <Text className="text-xs text-muted">Slug: /{cat.slug || 'cat'}</Text>
                </View>
              </View>
              <View className="flex-row items-center gap-2">
                <Text className="text-xs font-bold text-faint">Order #{cat.displayOrder || 1}</Text>
                <Icon name="chevron-right" size={20} color="#94a3b8" />
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}
