import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
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
  const [displayOrder, setDisplayOrder] = useState('1');
  const [saving, setSaving] = useState(false);

  const openEditor = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setName(cat.name || '');
      setIcon(cat.icon || 'cleaning-services');
      setDisplayOrder(String(cat.displayOrder || '1'));
    } else {
      setEditingCategory(null);
      setName('');
      setIcon('cleaning-services');
      setDisplayOrder(String(categoryList.length + 1));
    }
    setActiveView('editor');
  };

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Validation Error', 'Category Name is required.'); return; }
    setSaving(true);
    try {
      const slug = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
      const payload = { name: name.trim(), slug, icon: icon.trim() || 'cleaning-services', displayOrder: Number(displayOrder || 1) };
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
                <View className="w-12 h-12 rounded-2xl bg-brand/10 justify-center items-center border border-brand/20">
                  <Icon name={cat.icon || 'cleaning-services'} size={24} color="#006948" />
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
