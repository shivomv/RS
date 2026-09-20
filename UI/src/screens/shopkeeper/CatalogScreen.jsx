import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RSLogo from '../../components/RSLogo';
import { ProductCardSkeleton } from '../../components/Skeleton';
import { useCartStore } from '../../store/cartStore';
import { api } from '../../services/api';

// Helper to extract category label cleanly
const getCatTitle = (cat) => {
  if (!cat) return '';
  if (typeof cat === 'string') return cat;
  return cat.name || cat.title || cat.slug || '';
};

export default function CatalogScreen({ navigation, route }) {
  const { addItem } = useCartStore();

  const routeCat = route?.params?.categoryId;
  const initialCategory = routeCat ? String(routeCat).trim() : 'ALL';

  // 1. useState Hooks
  const [selectedCatId, setSelectedCatId] = useState(initialCategory);
  const [rawCategories, setRawCategories] = useState([]);
  const [rawProducts, setRawProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. useMemo Hooks
  const categoryList = useMemo(() => {
    const list = [
      { id: 'ALL', title: 'All Products', icon: 'grid-view', slug: 'ALL' },
    ];

    if (Array.isArray(rawCategories)) {
      rawCategories.forEach((cat, index) => {
        const title = getCatTitle(cat);
        const catId = cat.slug || cat._id || title || `cat-${index}`;
        list.push({
          id: catId,
          title: title || 'Category',
          icon: cat.icon || 'cleaning-services',
          image: cat.image || cat.img || cat.iconUrl,
          slug: cat.slug || title,
        });
      });
    }

    return list;
  }, [rawCategories]);

  const activeCategoryObj = useMemo(() => {
    return categoryList.find(
      (c) => String(c.id).toLowerCase() === String(selectedCatId).toLowerCase()
    ) || categoryList[0];
  }, [categoryList, selectedCatId]);

  // 3. useCallback Hooks
  const handleCategoryPress = useCallback((catId) => {
    console.log('🔥 Category clicked:', catId);
    setSelectedCatId(catId);
  }, []);

  const handleProductPress = useCallback(
    (product) => {
      // Pro Tip: If 'product' is a massive object, consider passing only product.id 
      // and fetching details on the next screen to prevent navigation serialization lag.
      navigation.navigate('ProductDetail', { product });
    },
    [navigation]
  );

  // 4. useEffect Hooks
  useEffect(() => {
    if (routeCat) {
      setSelectedCatId(String(routeCat).trim());
    }
  }, [routeCat]);

  useEffect(() => {
    const onBack = () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
        return true;
      }
      navigation.navigate('ShopHome');
      return true;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [navigation]);

  useEffect(() => {
    let active = true;

    api.getCategories()
      .then((catRes) => {
        if (active && Array.isArray(catRes)) {
          setRawCategories(catRes);
        }
      })
      .catch((err) => {
        console.warn('[CatalogScreen] Categories load error:', err?.message);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);

    const queryCat = selectedCatId === 'ALL' ? '' : selectedCatId;

    api.getProducts(queryCat)
      .then((prodRes) => {
        if (active) {
          setRawProducts(Array.isArray(prodRes) ? prodRes : []);
          setLoading(false);
          console.log('✅ Products loaded:', prodRes?.length);
        }
      })
      .catch((err) => {
        console.warn('[CatalogScreen] Products load error:', err?.message);
        if (active) {
          setRawProducts([]);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [selectedCatId]);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-[#faf8ff]">
      {/* Navigation Header */}
      <View className="bg-white border-b border-[#dae2fd] px-4 py-3 shadow-sm z-10">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  navigation.navigate('ShopHome');
                }
              }}
              activeOpacity={0.7}
              className="w-9 h-9 rounded-full bg-[#f2f3ff] items-center justify-center border border-[#dae2fd]"
            >
              <Icon name="arrow-back" size={20} color="#131b2e" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('ShopHome')}
              activeOpacity={0.7}
              className="flex-row items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-[#006948]/10 border border-[#006948]/20"
            >
              <Icon name="home" size={16} color="#006948" />
              <Text className="text-xs font-bold text-[#006948]">Home</Text>
            </TouchableOpacity>

            <RSLogo size="md" />
          </View>
        </View>
      </View>

      {/* Main Split Body: Left Category Sidebar + Right Product Grid */}
      <View className="flex-1 flex-row">
        {/* Left Category Sidebar */}
        <View className="w-[88px] bg-[#f2f3ff] border-r border-[#dae2fd]">
          <View className="flex-1" style={{ paddingVertical: 6 }}>
            {categoryList.map((cat) => {
              const isSelected =
                String(cat.id).toLowerCase() === String(selectedCatId).toLowerCase();

              return (
                <TouchableOpacity
                  key={String(cat.id)}
                  onPress={() => {
                    console.log('DEBUG: TouchableOpacity pressed, catId:', cat.id);
                    handleCategoryPress(cat.id);
                  }}
                  activeOpacity={0.7}
                  className={`relative py-3 px-1 items-center justify-center border-b border-[#eaedff] ${
                    isSelected ? 'bg-white shadow-sm' : 'bg-transparent'
                  }`}
                >
                  {isSelected && (
                    <View className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#006948] rounded-r-md" />
                  )}
                  <View
                    className={`w-10 h-10 rounded-xl items-center justify-center mb-1 overflow-hidden ${
                      isSelected ? 'bg-[#006948]/10 border border-[#006948]/30' : 'bg-white/80'
                    }`}
                  >
                    {cat.image ? (
                      <Image
                        source={{ uri: cat.image }}
                        className="w-full h-full rounded-md"
                        resizeMode="contain"
                      />
                    ) : (
                      <Icon
                        name={cat.icon || 'cleaning-services'}
                        size={20}
                        color={isSelected ? '#006948' : '#6d7a72'}
                      />
                    )}
                  </View>
                  <Text
                    numberOfLines={2}
                    className={`text-[9.5px] text-center leading-tight ${
                      isSelected ? 'text-[#006948] font-bold' : 'text-[#3d4a42] font-semibold'
                    }`}
                  >
                    {cat.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Right Main Product Section */}
        <View className="flex-1 bg-[#faf8ff]">
          {loading ? (
            // Keep ScrollView for Skeleton loading state to match original layout
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
            >
              <View className="flex-row items-center justify-between mb-3 pb-2 border-b border-[#dae2fd]">
                <View className="flex-1 pr-2">
                  <View className="h-4 w-32 bg-[#eaedff] rounded mb-2" />
                  <View className="h-3 w-24 bg-[#eaedff] rounded" />
                </View>
              </View>
              <View className="flex-row flex-wrap justify-between gap-y-3">
                <ProductCardSkeleton />
                <ProductCardSkeleton />
                <ProductCardSkeleton />
                <ProductCardSkeleton />
              </View>
            </ScrollView>
          ) : (
            // USE FLATLIST FOR ACTUAL DATA TO PREVENT JS THREAD FREEZE
            <FlatList
              data={rawProducts}
              keyExtractor={(item, idx) => String(item._id || item.id || `prod-${idx}`)}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 12 }}
              contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                <View className="flex-row items-center justify-between mb-3 pb-2 border-b border-[#dae2fd]">
                  <View className="flex-1 pr-2">
                    <Text className="text-xs font-black text-[#131b2e]" numberOfLines={1}>
                      {activeCategoryObj?.title || 'Catalog'}
                    </Text>
                    <Text className="text-[10px] text-[#6d7a72] font-semibold mt-0.5">
                      {rawProducts.length} {rawProducts.length === 1 ? 'Product' : 'Products'} Available
                    </Text>
                  </View>
                </View>
              }
              renderItem={({ item }) => (
                <View className="w-[48.5%]">
                  <ProductCardItem
                    item={item}
                    onPress={handleProductPress}
                    onAdd={addItem}
                  />
                </View>
              )}
              ListEmptyComponent={
                <View className="py-12 bg-white/60 rounded-2xl items-center justify-center border border-dashed border-[#bccac0]/50 mt-4">
                  <Icon name="inventory" size={32} color="#6d7a72" />
                  <Text className="text-xs text-[#131b2e] font-bold mt-2">
                    No products found
                  </Text>
                  <Text className="text-[10px] text-[#6d7a72] mt-0.5">
                    Select another category from the sidebar menu.
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

// Memoized Product Card Item (Already perfect, no changes needed)
const ProductCardItem = React.memo(function ProductCardItem({ item, onPress, onAdd }) {
  const imageUri = item?.image || item?.imageUrl || item?.img;

  return (
    <View className="w-full bg-white rounded-xl p-2.5 shadow-sm justify-between border border-[#eaedff]">
      <TouchableOpacity
        onPress={() => onPress(item)}
        activeOpacity={0.7}
      >
        <View className="relative w-full h-24 rounded-lg bg-[#f2f3ff] justify-center items-center p-1.5 mb-1.5 overflow-hidden border border-[#eaedff]/60">
          {imageUri ? (
            <Image source={{ uri: imageUri }} className="w-full h-full" resizeMode="contain" />
          ) : (
            <Icon name="inventory-2" size={36} color="#bccac0" />
          )}
          {item?.badge && (
            <View className="absolute top-1 left-1 z-10 bg-[#85f8c4] px-1.5 py-0.5 rounded shadow-sm">
              <Text className="text-[8px] text-[#002114] font-bold">{item.badge}</Text>
            </View>
          )}
        </View>
        <Text className="text-[11px] font-bold text-[#131b2e]" numberOfLines={1}>
          {item?.name || item?.title || 'Unnamed Product'}
        </Text>
        <Text className="text-[9px] text-[#3d4a42]" numberOfLines={1}>
          {item?.subtitle || item?.description || ''}
        </Text>
      </TouchableOpacity>

      <View className="flex-row items-center justify-between mt-2 pt-1.5 border-t border-[#f2f3ff]">
        <View className="flex-row items-baseline gap-0.5">
          <Text className="text-xs font-extrabold text-[#131b2e]">₹{item?.price || 0}</Text>
          {item?.mrp && <Text className="text-[8px] text-[#6d7a72] line-through">₹{item.mrp}</Text>}
        </View>
        <TouchableOpacity
          onPress={() => onAdd({ ...item, quantity: 1 })}
          activeOpacity={0.7}
          className="h-6 px-2.5 bg-[#006948] rounded-md justify-center items-center shadow-sm"
        >
          <Text className="text-[9px] text-white font-bold">ADD</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});