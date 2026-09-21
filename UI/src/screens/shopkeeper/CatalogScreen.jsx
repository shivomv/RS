import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { api } from '../../services/api';

export default function CatalogScreen({ navigation, route }) {
  const initialCategory = route?.params?.categoryId;

  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);

  const [products, setProducts] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // ==========================================
  // LOAD CATEGORIES
  // ==========================================

  useEffect(() => {
    let mounted = true;

    const loadCategories = async () => {
      try {
        setLoadingCategories(true);

        const res = await api.getCategories();
        const list = Array.isArray(res) ? res : [];

        if (!mounted) return;

        setCategories(list);

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
          '[Catalog] Category error:',
          error?.message
        );
      } finally {
        if (mounted) {
          setLoadingCategories(false);
        }
      }
    };

    loadCategories();

    return () => {
      mounted = false;
    };
  }, [initialCategory]);

  // ==========================================
  // LOAD PRODUCTS
  // ==========================================

  useEffect(() => {
    if (!selectedCat?._id) {
      setProducts([]);
      return;
    }

    let mounted = true;

    const loadProducts = async () => {
      try {
        setLoadingProducts(true);

        const res = await api.getProductsByCategory(
          selectedCat._id
        );

        if (!mounted) return;

        setProducts(Array.isArray(res) ? res : []);
      } catch (error) {
        console.warn(
          '[Catalog] Product error:',
          error?.message
        );

        if (mounted) {
          setProducts([]);
        }
      } finally {
        if (mounted) {
          setLoadingProducts(false);
        }
      }
    };

    loadProducts();

    return () => {
      mounted = false;
    };
  }, [selectedCat]);

  // ==========================================
  // CATEGORY CLICK
  // ==========================================

  const handleCategoryPress = (category) => {
    setSelectedCat(category);
  };

  // ==========================================
  // PRODUCT CLICK
  // ==========================================

  const handleProductPress = (product) => {
    navigation.navigate('ProductView', {
      productId: product._id,
      product,
    });
  };

  // ==========================================
  // PRODUCT CARD
  // ==========================================

  const renderProduct = ({ item }) => {
    const image =
      item.baseImages?.[0] ||
      item.images?.[0] ||
      item.image ||
      item.img;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => handleProductPress(item)}
        className="flex-1 bg-white rounded-2xl border border-[#e2e7e3] overflow-hidden"
        style={{
          marginHorizontal: 4,
          marginBottom: 10,
        }}
      >
        {/* Product Image */}
        <View className="h-28 bg-[#f5f7f6] items-center justify-center">

          {image ? (
            <Image
              source={{ uri: image }}
              className="w-full h-full"
              resizeMode="contain"
            />
          ) : (
            <Icon
              name="inventory-2"
              size={38}
              color="#9aa59f"
            />
          )}

          {/* Featured */}
          {item.isFeatured && (
            <View className="absolute top-2 left-2 bg-[#006948] px-1.5 py-1 rounded-full">
              <Text className="text-[7px] font-bold text-white">
                FEATURED
              </Text>
            </View>
          )}
        </View>

        {/* Details */}
        <View className="p-2.5">

          {/* Brand */}
          {item.brand && (
            <Text
              className="text-[8px] font-bold text-[#006948] uppercase"
              numberOfLines={1}
            >
              {item.brand}
            </Text>
          )}

          {/* Product Name */}
          <Text
            className="text-[11px] font-black text-[#131b2e] mt-1 leading-tight"
            numberOfLines={2}
          >
            {item.name || item.title || 'Product'}
          </Text>

          {/* Subtitle */}
          {item.subtitle && (
            <Text
              className="text-[8px] text-[#6d7a72] mt-1"
              numberOfLines={2}
            >
              {item.subtitle}
            </Text>
          )}

          {/* Price */}
          <View className="flex-row items-center justify-between mt-2.5">

            <View>
              <Text className="text-[7px] text-[#7a857f]">
                Starting
              </Text>

              <Text className="text-xs font-black text-[#131b2e]">
                ₹{item.basePrice ?? item.price ?? 0}
              </Text>
            </View>

            {/* Arrow */}
            <View className="w-7 h-7 rounded-lg bg-[#006948] items-center justify-center">
              <Icon
                name="arrow-forward"
                size={15}
                color="#ffffff"
              />
            </View>

          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loadingCategories) {
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

  // ==========================================
  // SCREEN
  // ==========================================

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      className="flex-1 bg-[#faf8ff]"
    >

      {/* ======================================
          HEADER
      ====================================== */}

      <View className="bg-white px-4 py-3 border-b border-[#e2e7e3]">

        <View className="flex-row items-center">

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-9 h-9 rounded-full bg-[#f3f5f4] items-center justify-center"
          >
            <Icon
              name="arrow-back"
              size={20}
              color="#131b2e"
            />
          </TouchableOpacity>

          <View className="ml-3">
            <Text className="text-lg font-black text-[#131b2e]">
              Shop
            </Text>

            <Text className="text-[9px] text-[#6d7a72]">
              Browse products
            </Text>
          </View>

        </View>
      </View>

      {/* ======================================
          MAIN CONTENT
      ====================================== */}

      <View className="flex-1 flex-row">

        {/* ====================================
            LEFT CATEGORY SIDEBAR
        ==================================== */}

        <View className="w-[27%] bg-white border-r border-[#e2e7e3]">

          <FlatList
            data={categories}
            keyExtractor={(item, index) =>
              String(
                item._id ||
                  item.slug ||
                  `category-${index}`
              )
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingVertical: 8,
            }}
            renderItem={({ item }) => {

              const isSelected =
                selectedCat &&
                String(selectedCat._id) ===
                  String(item._id);

              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() =>
                    handleCategoryPress(item)
                  }
                  className={`py-4 px-2 items-center ${
                    isSelected
                      ? 'bg-[#006948]/10'
                      : 'bg-white'
                  }`}
                >

                  {/* Active indicator */}
                  {isSelected && (
                    <View className="absolute left-0 top-0 bottom-0 w-1 bg-[#006948]" />
                  )}

                  {/* Category image/icon */}
                  <View
                    className={`w-11 h-11 rounded-xl items-center justify-center overflow-hidden ${
                      isSelected
                        ? 'bg-[#006948]/15'
                        : 'bg-[#f3f5f4]'
                    }`}
                  >
                    {item.image || item.img ? (
                      <Image
                        source={{
                          uri:
                            item.image ||
                            item.img,
                        }}
                        className="w-full h-full"
                        resizeMode="contain"
                      />
                    ) : (
                      <Icon
                        name={
                          item.icon ||
                          'cleaning-services'
                        }
                        size={23}
                        color={
                          isSelected
                            ? '#006948'
                            : '#7a857f'
                        }
                      />
                    )}
                  </View>

                  {/* Category name */}
                  <Text
                    className={`text-[9px] text-center mt-2 font-semibold ${
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

        {/* ====================================
            RIGHT PRODUCT AREA
        ==================================== */}

        <View className="flex-1">

          {/* Category title */}
          <View className="px-3 pt-3 pb-2">

            <Text
              className="text-base font-black text-[#131b2e]"
              numberOfLines={1}
            >
              {selectedCat?.name ||
                selectedCat?.title ||
                'Products'}
            </Text>

            <Text className="text-[9px] text-[#6d7a72] mt-0.5">
              {products.length} products
            </Text>

          </View>

          {/* Products loading */}
          {loadingProducts ? (

            <View className="flex-1 items-center justify-center">

              <ActivityIndicator
                size="small"
                color="#006948"
              />

              <Text className="text-[10px] text-[#6d7a72] mt-2">
                Loading products...
              </Text>

            </View>

          ) : (

            /* ==================================
               2 COLUMN PRODUCT GRID
            ================================== */

            <FlatList
              data={products}
              numColumns={2}
              keyExtractor={(item, index) =>
                String(
                  item._id ||
                    item.slug ||
                    `product-${index}`
                )
              }
              renderItem={renderProduct}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 6,
                paddingBottom: 30,
              }}
              columnWrapperStyle={{
                marginBottom: 0,
              }}

              ListEmptyComponent={
                <View className="items-center justify-center py-20 px-4">

                  <Icon
                    name="inventory-2"
                    size={40}
                    color="#9aa59f"
                  />

                  <Text className="text-sm font-bold text-[#131b2e] mt-3">
                    No products found
                  </Text>

                  <Text className="text-[9px] text-[#6d7a72] text-center mt-1">
                    There are no products available
                    in this category.
                  </Text>

                </View>
              }
            />

          )}

        </View>

      </View>

    </SafeAreaView>
  );
}