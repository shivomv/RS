import React, { useState } from 'react';
import { View, Text, Modal, TextInput, Pressable, ActivityIndicator, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import Alert from '../utils/alert';

export default function CategoryModal({
  visible,
  onClose,
  onSave,
}) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('cleaning-services');
  const [image, setImage] = useState('');
  const [displayOrder, setDisplayOrder] = useState('1');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Category Name is required.');
      return;
    }

    setSaving(true);
    try {
      const slug = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
      await onSave({
        name: name.trim(),
        slug,
        icon: icon.trim() || 'cleaning-services',
        image: image.trim() || icon.trim() || 'cleaning-services',
        displayOrder: Number(displayOrder || 1),
      });

      setName('');
      setIcon('cleaning-services');
      setImage('');
      setDisplayOrder('1');
      onClose();
    } catch (err) {
      Alert.alert('Save Failed', err.message || 'Failed to create category');
    } finally {
      setSaving(false);
    }
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

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/70 justify-center items-center p-4">
        <View className="bg-[#131b2e] rounded-3xl w-full max-w-sm border border-[#232d46] shadow-2xl p-5">
          <View className="flex-row items-center justify-between mb-4 border-b border-[#232d46] pb-3">
            <View className="flex-row items-center gap-2">
              <Icon name="category" size={22} color="#006948" />
              <Text className="text-base font-black text-white">Create New Category</Text>
            </View>
            <Pressable
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-[#2d3a58] justify-center items-center"
            >
              <Icon name="close" size={18} color="#ffffff" />
            </Pressable>
          </View>

          <View className="mb-4">
            <Text className="text-[11px] font-bold text-[#8c9ba5] mb-1 uppercase tracking-wider">
              Category Name *
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Industrial Degreasers"
              placeholderTextColor="#5b6a82"
              className="bg-[#1c263d] rounded-2xl px-4 py-3 text-sm font-bold text-white border border-[#2d3a58]"
            />
          </View>

          <View className="mb-4">
            <Text className="text-[11px] font-bold text-[#8c9ba5] mb-1 uppercase tracking-wider">
              Material Icon Name
            </Text>
            <TextInput
              value={icon}
              onChangeText={setIcon}
              placeholder="cleaning-services, local-sanitizer, etc."
              placeholderTextColor="#5b6a82"
              className="bg-[#1c263d] rounded-2xl px-4 py-3 text-xs font-bold text-white border border-[#2d3a58]"
            />
          </View>

          <View className="mb-4">
            <Text className="text-[11px] font-bold text-[#8c9ba5] mb-2 uppercase tracking-wider">
              Category Image (Square Full-Size)
            </Text>
            
            {image ? (
              <View className="items-center mb-2">
                <View className="w-24 h-24 rounded-2xl bg-[#0f172a] border border-[#2d3a58] overflow-hidden mb-2.5">
                  <Image source={{ uri: image }} className="w-full h-full" resizeMode="cover" />
                </View>
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={handlePickCategoryImage}
                    className="bg-[#006948] px-3 py-1.5 rounded-xl flex-row items-center gap-1.5 active:opacity-90"
                  >
                    <Icon name="photo-library" size={15} color="#ffffff" />
                    <Text className="text-xs font-bold text-white">Change</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setImage('')}
                    className="bg-red-500/10 px-3 py-1.5 rounded-xl border border-red-500/30 flex-row items-center gap-1.5 active:opacity-90"
                  >
                    <Icon name="delete" size={15} color="#ef4444" />
                    <Text className="text-xs font-bold text-red-500">Remove</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={handlePickCategoryImage}
                className="border-2 border-dashed border-[#2d3a58] rounded-2xl p-5 items-center justify-center bg-[#1c263d]/50 mb-2 active:opacity-75"
              >
                <Icon name="add-photo-alternate" size={32} color="#006948" />
                <Text className="text-xs font-extrabold text-white mt-1.5">Upload Photo from Gallery</Text>
                <Text className="text-[10px] text-[#8c9ba5] mt-0.5">Auto-uploaded to S3 • Full size cover</Text>
              </Pressable>
            )}
          </View>

          <View className="mb-6">
            <Text className="text-[11px] font-bold text-[#8c9ba5] mb-1 uppercase tracking-wider">
              Display Sort Order
            </Text>
            <TextInput
              value={displayOrder}
              onChangeText={setDisplayOrder}
              placeholder="1"
              placeholderTextColor="#5b6a82"
              keyboardType="numeric"
              className="bg-[#1c263d] rounded-2xl px-4 py-3 text-xs font-bold text-white border border-[#2d3a58]"
            />
          </View>

          <Pressable
            onPress={handleSubmit}
            disabled={saving}
            className="bg-[#006948] rounded-2xl py-3.5 items-center justify-center flex-row gap-2 shadow-lg"
          >
            {saving ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Icon name="check-circle" size={18} color="#ffffff" />
                <Text className="text-xs font-extrabold text-white uppercase tracking-wider">
                  Save Category
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
