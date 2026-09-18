import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RSLogo from '../../components/RSLogo';
import { useCartStore } from '../../store/cartStore';
import { api } from '../../services/api';

export default function CatalogScreen({ navigation, route }) {
  const { addItem } = useCartStore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(route?.params?.categoryId || 'Floor Cleaners');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const mainScrollRef = useRef(null);
  const sidebarScrollRef = useRef(null);
  const sectionPositions = useRef({});
  const sidebarPositions = useRef({});
  const isManualScrolling = useRef(false);
  const scrollTimer = useRef(null);

  // Default fallbacks if categories DB is empty
  const defaultCategories = [
    { id: 'Floor Cleaners', title: 'Floor Cleaners', icon: 'cleaning-services' },
    { id: 'Disinfectants', title: 'Disinfectants', icon: 'sanitizer' },
    { id: 'Dishwash & Degreaser', title: 'Dishwash & Degreaser', icon: 'flatware' },
    { id: 'Glass & Surface', title: 'Glass & Surface', icon: 'window' },
    { id: 'Handwash', title: 'Handwash', icon: 'wash' },
    { id: 'Bulk Drums', title: 'Bulk Drums', icon: 'inventory-2' },
  ];

  const categoryList = categories.length > 0
    ? categories.map((c) => ({
        id: c.name || c.title || c.slug || c._id,
        title: c.name || c.title,
        icon: c.icon || 'cleaning-services',
        img: c.img || c.image || c.iconUrl,
        slug: c.slug,
      }))
    : defaultCategories;

  // Sync route param category selection if present
  useEffect(() => {
    if (route?.params?.categoryId) {
      setSelectedCategory(route.params.categoryId);
    }
  }, [route?.params?.categoryId]);

  // Fetch product catalog & categories directly from Backend Database
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([
      api.getProducts().catch(() => []),
      api.getCategories().catch(() => []),
    ]).then(([prodData, catData]) => {
      if (isMounted) {
        setProducts(Array.isArray(prodData) ? prodData : []);
        if (Array.isArray(catData) && catData.length > 0) {
          setCategories(catData);
        }
        setLoading(false);
      }
    });

    return () => { isMounted = false; };
  }, []);

  // Flexible category product matching helper
  const getCategoryProducts = (cat) => {
    return products.filter((p) => {
      if (!p.category) return false;
      const pCat = String(p.category).trim().toLowerCase();
      const catId = String(cat.id || '').trim().toLowerCase();
      const catTitle = String(cat.title || '').trim().toLowerCase();
      const catSlug = String(cat.slug || '').trim().toLowerCase();
      return (
        pCat === catId ||
        pCat === catTitle ||
        pCat === catSlug ||
        catTitle.includes(pCat) ||
        pCat.includes(catTitle)
      );
    });
  };

  // Handle Sidebar Category Press -> Scroll Main View to Category Section & Auto Scroll Sidebar
  const handleSelectCategory = (catId) => {
    setSelectedCategory(catId);
    isManualScrolling.current = true;

    // Scroll Sidebar to center selected category
    const sidebarY = sidebarPositions.current[catId];
    if (sidebarY !== undefined && sidebarScrollRef.current) {
      sidebarScrollRef.current.scrollTo({ y: Math.max(0, sidebarY - 60), animated: true });
    }

    // Scroll Main Product View to target category section
    const yPos = sectionPositions.current[catId];
    if (yPos !== undefined && mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ y: Math.max(0, yPos - 5), animated: true });
    }

    if (scrollTimer.current) clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      isManualScrolling.current = false;
    }, 600);
  };

  // Handle Main List Scroll -> Auto Select Category in Sidebar & Auto Scroll Sidebar
  const handleMainScroll = (event) => {
    if (isManualScrolling.current || search.length > 0) return;

    const scrollY = event.nativeEvent.contentOffset.y;
    let currentCat = categoryList[0]?.id;

    for (let i = 0; i < categoryList.length; i++) {
      const catId = categoryList[i].id;
      const pos = sectionPositions.current[catId];
      if (pos !== undefined && scrollY >= pos - 70) {
        currentCat = catId;
      }
    }

    if (currentCat && currentCat !== selectedCategory) {
      setSelectedCategory(currentCat);

      const sidebarY = sidebarPositions.current[currentCat];
      if (sidebarY !== undefined && sidebarScrollRef.current) {
        sidebarScrollRef.current.scrollTo({ y: Math.max(0, sidebarY - 60), animated: true });
      }
    }
  };

  // Filter for Search Query
  const searchFilteredProducts = search
    ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : null;

  return (
    <SafeAreaView className="flex-1 bg-[#faf8ff]">
      {/* Top Header */}
      <View className="bg-white border-b border-[#dae2fd] px-4 py-3 shadow-sm">
        <View className="flex-row items-center justify-between mb-2.5">
          <RSLogo size="md" />
          <Pressable
            onPress={() => navigation.navigate('BulkPriceOptimizer')}
            className="flex-row items-center gap-1 bg-[#006948]/10 px-2.5 py-1 rounded-full active:opacity-80"
          >
            <Icon name="calculate" size={16} color="#006948" />
            <Text className="text-xs text-[#006948] font-bold">Bulk Calculator</Text>
          </Pressable>
        </View>

        {/* Search Input */}
        <View className="flex-row items-center bg-[#f2f3ff] rounded-xl px-3 h-10">
          <Icon name="search" size={18} color="#006948" />
          <TextInput
            placeholder="Search RS Industries catalog..."
            placeholderTextColor="#6d7a72"
            value={search}
            onChangeText={setSearch}
            className="flex-1 h-full ml-2 text-xs text-[#131b2e]"
          />
          {search ? (
            <Pressable onPress={() => setSearch('')}>
              <Icon name="close" size={16} color="#6d7a72" />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Main Split Layout: Left Sidebar + Right Products Grid */}
      <View className="flex-1 flex-row">
        {/* Left Side Panel (Category List - Compact Blinkit style) */}
        <View className="w-[78px] bg-[#f2f3ff] border-r border-[#dae2fd]">
          <ScrollView
            ref={sidebarScrollRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 4 }}
          >
            {categoryList.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => handleSelectCategory(cat.id)}
                  onLayout={(e) => {
                    sidebarPositions.current[cat.id] = e.nativeEvent.layout.y;
                  }}
                  className={`relative py-3 px-1 items-center justify-center border-b border-[#eaedff] ${
                    isSelected ? 'bg-white shadow-sm' : 'bg-transparent'
                  }`}
                >
                  {isSelected && (
                    <View className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#006948] rounded-r-md" />
                  )}
                  <View
                    className={`w-9 h-9 rounded-xl items-center justify-center mb-1 overflow-hidden ${
                      isSelected ? 'bg-[#006948]/10' : 'bg-white/70'
                    }`}
                  >
                    {cat.img || cat.image ? (
                      <Image source={{ uri: cat.img || cat.image }} className="w-full h-full rounded-md" resizeMode="contain" />
                    ) : (
                      <Icon
                        name={cat.icon || 'cleaning-services'}
                        size={18}
                        color={isSelected ? '#006948' : '#6d7a72'}
                      />
                    )}
                  </View>
                  <Text
                    numberOfLines={2}
                    className={`text-[9px] text-center leading-tight ${
                      isSelected ? 'text-[#006948] font-bold' : 'text-[#3d4a42] font-semibold'
                    }`}
                  >
                    {cat.title}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Right Main Panel (Products Grid continuous scroll) */}
        <View className="flex-1 bg-[#faf8ff]">
          {loading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#006948" />
              <Text className="text-xs text-[#3d4a42] mt-2 font-medium">Fetching catalog from Database...</Text>
            </View>
          ) : (
            <ScrollView
              ref={mainScrollRef}
              onScroll={handleMainScroll}
              scrollEventThrottle={16}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 60 }}
            >
              {search ? (
                // Search Mode View
                <View className="p-3">
                  <Text className="text-xs font-bold text-[#131b2e] mb-2">
                    Search Results ({searchFilteredProducts.length})
                  </Text>
                  <View className="flex-row flex-wrap justify-between gap-y-2.5">
                    {searchFilteredProducts.map((item) => (
                      <ProductCard key={item._id || item.id} item={item} navigation={navigation} addItem={addItem} />
                    ))}
                  </View>
                </View>
              ) : (
                // Section-by-Section Continuous Scroll View (Blinkit style)
                categoryList.map((cat) => {
                  const catProducts = getCategoryProducts(cat);

                  return (
                    <View
                      key={cat.id}
                      onLayout={(e) => {
                        sectionPositions.current[cat.id] = e.nativeEvent.layout.y;
                      }}
                      className="mb-5"
                    >
                      {/* Section Header */}
                      <View className="sticky top-0 z-10 px-3 py-2 bg-white/95 border-b border-[#eaedff] flex-row items-center justify-between mb-2">
                        <Text className="text-xs font-bold text-[#131b2e]">{cat.title}</Text>
                        <Text className="text-[10px] text-[#6d7a72] font-medium">
                          {catProducts.length} {catProducts.length === 1 ? 'Item' : 'Items'}
                        </Text>
                      </View>

                      {/* Section Product Cards Grid or Empty Notice */}
                      {catProducts.length > 0 ? (
                        <View className="flex-row flex-wrap justify-between px-2 gap-y-2.5">
                          {catProducts.map((item) => (
                            <ProductCard key={item._id || item.id} item={item} navigation={navigation} addItem={addItem} />
                          ))}
                        </View>
                      ) : (
                        <View className="px-3 py-4 bg-white/50 rounded-xl mx-2 items-center justify-center border border-dashed border-[#bccac0]/40">
                          <Icon name="inventory" size={20} color="#6d7a72" />
                          <Text className="text-[11px] text-[#6d7a72] mt-1 font-medium">
                            No items in {cat.title}
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                })
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

// Reusable Product Card Component
function ProductCard({ item, navigation, addItem }) {
  return (
    <View className="w-[48.5%] bg-white rounded-xl p-2.5 shadow-sm justify-between border border-[#eaedff]">
      <Pressable onPress={() => navigation.navigate('ProductDetail', { product: item })}>
        <View className="relative w-full h-24 rounded-lg bg-[#f2f3ff] justify-center items-center p-1.5 mb-1.5 overflow-hidden">
          <Image source={{ uri: item.image }} className="w-full h-full" resizeMode="contain" />
          {item.badge && (
            <View className="absolute top-1 left-1 z-10 bg-[#85f8c4] px-1 py-0.5 rounded shadow-sm">
              <Text className="text-[8px] text-[#002114] font-bold">{item.badge}</Text>
            </View>
          )}
        </View>
        <Text className="text-[11px] font-bold text-[#131b2e]" numberOfLines={1}>
          {item.name}
        </Text>
        <Text className="text-[9px] text-[#3d4a42]" numberOfLines={1}>
          {item.subtitle || item.description}
        </Text>
      </Pressable>

      <View className="flex-row items-center justify-between mt-2 pt-1.5 border-t border-[#f2f3ff]">
        <View className="flex-row items-baseline gap-0.5">
          <Text className="text-xs font-extrabold text-[#131b2e]">₹{item.price}</Text>
          {item.mrp && <Text className="text-[8px] text-[#6d7a72] line-through">₹{item.mrp}</Text>}
        </View>
        <Pressable
          onPress={() => addItem({ ...item, quantity: 1 })}
          className="h-6 px-2 bg-[#006948] rounded-md justify-center items-center shadow-sm active:opacity-80"
        >
          <Text className="text-[9px] text-white font-bold">ADD</Text>
        </Pressable>
      </View>
    </View>
  );
}
