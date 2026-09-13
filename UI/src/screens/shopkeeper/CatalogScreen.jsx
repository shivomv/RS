import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Pressable,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useProductStore } from '../../store/productStore';
import { useCartStore } from '../../store/cartStore';
import apiService from '../../services/api';

const CatalogScreen = ({ navigation }) => {
  const { products, isLoading, setProducts, setLoading, setError } = useProductStore();
  const { items: cartItems } = useCartStore();
  const [category, setCategory] = useState('All');

  const categories = ['All', ...new Set(products.map((p) => p.category))];
  const filteredProducts = category === 'All' ? products : products.filter((p) => p.category === category);

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await apiService.getProducts();
      setProducts(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      setError(err?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading && products.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#003E6F" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-slate-50">
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

        <View className="px-5 py-4 flex-row justify-between items-center">
          <View>
            <Text className="text-xs tracking-widest font-bold text-slate-500">CATALOG</Text>
            <Text className="text-2xl font-black text-slate-950 mt-1">READY TO SHIP INVENTORY</Text>
          </View>
          <Pressable className="relative">
            <Icon name="shopping-cart" size={24} color="#003E6F" />
            {cartItems.length > 0 && (
              <View className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 justify-center items-center">
                <Text className="text-white text-xs font-black">{cartItems.length}</Text>
              </View>
            )}
          </Pressable>
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-5 mb-4"
          contentContainerStyle={{ gap: 8 }}
        >
          {categories.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => setCategory(cat)}
              className={`px-4 py-2 rounded-lg ${
                category === cat ? 'bg-blue-600' : 'bg-white border border-slate-200'
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  category === cat ? 'text-white' : 'text-slate-500'
                }`}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Products Grid */}
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item._id || item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 12 }}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => navigation.navigate('ProductDetail', { product: item })}
            />
          )}
          ListEmptyComponent={
            <View className="items-center py-20 w-full">
              <Text className="text-slate-500">No products found</Text>
            </View>
          }
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const ProductCard = ({ product, onPress }) => (
  <Pressable
    onPress={onPress}
    className="w-[48%] bg-white rounded-2xl p-3 mb-4 shadow-sm"
  >
    <View className="w-full h-32 bg-blue-50 rounded-xl justify-center items-center mb-3">
      <Icon name="box" size={34} color="#2563eb" />
    </View>
    <Text
      className="text-xs font-bold text-slate-400"
      numberOfLines={1}
    >
      {product.category}
    </Text>
    <Text
      className="text-sm font-bold text-slate-950 mt-1"
      numberOfLines={2}
    >
      {product.name}
    </Text>
    <Text className="text-blue-600 font-black mt-2">
      ₹{product.price}
    </Text>
  </Pressable>
);

export default CatalogScreen;
