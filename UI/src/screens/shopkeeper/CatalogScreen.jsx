import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { api } from '../../services/api';

export default function CatalogScreen({ route }) {
  const initialCategory = route?.params?.categoryId;

  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadCategories = async () => {
      try {
        setLoading(true);

        const res = await api.getCategories();
        const list = Array.isArray(res) ? res : [];

        if (!mounted) return;

        setCategories(list);

        // Select category from route if provided
        if (list.length > 0) {
          if (initialCategory) {
            const found = list.find(
              (cat) =>
                String(cat._id) === String(initialCategory) ||
                String(cat.slug).toLowerCase() ===
                  String(initialCategory).toLowerCase()
            );

            setSelectedCat(found || list[0]);
          } else {
            setSelectedCat(list[0]);
          }
        }
      } catch (error) {
        console.warn(
          '[CatalogScreen] Category error:',
          error?.message
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      mounted = false;
    };
  }, [initialCategory]);

  const handleCategoryPress = (category) => {
    setSelectedCat(category);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#faf8ff] items-center justify-center">
        <ActivityIndicator
          size="large"
          color="#006948"
        />

        <Text className="mt-3 text-sm text-[#6d7a72]">
          Loading categories...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      className="flex-1 bg-[#faf8ff]"
    >
      {/* Header */}
      <View className="bg-white px-4 py-4 border-b border-[#e2e7e3]">
        <Text className="text-xl font-black text-[#131b2e]">
          Shop
        </Text>

        <Text className="text-xs text-[#6d7a72] mt-1">
          Browse products by category
        </Text>
      </View>

      {/* Main Content */}
      <View className="flex-1 flex-row">

        {/* LEFT CATEGORY SIDEBAR */}
        <View className="w-[27%] bg-white border-r border-[#e2e7e3]">
          <FlatList
            data={categories}
            keyExtractor={(item, index) =>
              String(item._id || item.slug || index)
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingVertical: 8,
            }}
            renderItem={({ item }) => {
              const isSelected =
                selectedCat &&
                String(selectedCat._id) === String(item._id);

              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleCategoryPress(item)}
                  className={`py-4 px-2 items-center ${
                    isSelected
                      ? 'bg-[#006948]/10'
                      : 'bg-white'
                  }`}
                >
                  {/* Active Indicator */}
                  {isSelected && (
                    <View className="absolute left-0 top-0 bottom-0 w-1 bg-[#006948]" />
                  )}

                  {/* Category Icon */}
                  <View
                    className={`w-12 h-12 rounded-xl items-center justify-center ${
                      isSelected
                        ? 'bg-[#006948]/15'
                        : 'bg-[#f3f5f4]'
                    }`}
                  >
                    <Icon
                      name={
                        item.icon ||
                        'cleaning-services'
                      }
                      size={25}
                      color={
                        isSelected
                          ? '#006948'
                          : '#7a857f'
                      }
                    />
                  </View>

                  {/* Category Name */}
                  <Text
                    className={`text-[10px] text-center mt-2 font-semibold ${
                      isSelected
                        ? 'text-[#006948]'
                        : 'text-[#4f5b55]'
                    }`}
                    numberOfLines={2}
                  >
                    {item.name ||
                      item.title ||
                      'Category'}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* RIGHT CONTENT */}
        <View className="flex-1">
          {selectedCat ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                padding: 16,
              }}
            >
              {/* Selected Category Header */}
              <View className="bg-white rounded-2xl p-4 border border-[#e2e7e3]">

                <Text className="text-xs text-[#6d7a72] font-semibold">
                  SELECTED CATEGORY
                </Text>

                <Text className="text-xl font-black text-[#131b2e] mt-1">
                  {selectedCat.name ||
                    selectedCat.title ||
                    'Category'}
                </Text>

                <View className="h-[1px] bg-[#e2e7e3] my-4" />

                {/* Temporary Debug Details */}
                <Text className="text-xs font-bold text-[#006948] mb-2">
                  Category Details
                </Text>

                <Text className="text-xs text-[#4f5b55] mb-1">
                  ID: {String(selectedCat._id || '-')}
                </Text>

                <Text className="text-xs text-[#4f5b55] mb-1">
                  Name: {selectedCat.name || '-'}
                </Text>

                <Text className="text-xs text-[#4f5b55] mb-1">
                  Slug: {selectedCat.slug || '-'}
                </Text>

                <Text className="text-xs text-[#4f5b55] mb-1">
                  Icon: {selectedCat.icon || '-'}
                </Text>

                <Text className="text-xs text-[#4f5b55]">
                  Image: {selectedCat.image || '-'}
                </Text>
              </View>

              {/* Future Products Area */}
              <View className="mt-4 bg-white rounded-2xl p-5 border border-dashed border-[#bccac0] items-center">
                <Icon
                  name="inventory-2"
                  size={32}
                  color="#9aa59f"
                />

                <Text className="text-sm font-bold text-[#131b2e] mt-2">
                  Products will appear here
                </Text>

                <Text className="text-[11px] text-[#6d7a72] text-center mt-1">
                  Currently showing selected category
                  details only.
                </Text>
              </View>
            </ScrollView>
          ) : (
            <View className="flex-1 items-center justify-center">
              <Icon
                name="category"
                size={40}
                color="#9aa59f"
              />

              <Text className="text-sm font-bold text-[#131b2e] mt-2">
                Select a category
              </Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}