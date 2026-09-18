import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { useProductStore } from '../../store/productStore';

const ProductManagementScreen = ({ navigation }) => {
  const { products, fetchProducts, addProduct, deleteProduct } = useProductStore();
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddProduct = () => {
    if (!newName || !newPrice || !newCategory) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    const item = {
      _id: Date.now().toString(),
      name: newName,
      price: parseFloat(newPrice),
      category: newCategory,
      image: '📦',
      stockQuantity: 100,
    };
    addProduct(item);
    setNewName('');
    setNewPrice('');
    setNewCategory('');
    setModalVisible(false);
    Alert.alert('Success', 'Product added successfully!');
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
        <View className="px-5 py-4 flex-row items-center border-b border-slate-800">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
            <Icon name="arrow-left" size={24} color="#60a5fa" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold flex-1">Product Management</Text>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="bg-blue-600 px-3 py-2 rounded-lg flex-row items-center gap-1"
          >
            <Icon name="plus" size={16} color="white" />
            <Text className="text-white font-semibold text-xs">ADD</Text>
          </TouchableOpacity>
        </View>

        <View className="px-5 py-3">
          <View className="flex-row items-center bg-slate-900 rounded-lg px-3 py-2 border border-slate-800">
            <Icon name="search" size={18} color="#64748b" />
            <TextInput
              className="flex-1 ml-2 text-white py-1"
              placeholder="Search products..."
              placeholderTextColor="#64748b"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-3 flex-row items-center">
              <Text className="text-3xl mr-3">{item.image}</Text>
              <View className="flex-1">
                <Text className="text-white font-bold">{item.name}</Text>
                <Text className="text-slate-400 text-xs mt-1">
                  Category: {item.category} • Stock: {item.stockQuantity || 100}
                </Text>
                <Text className="text-blue-400 font-bold mt-1">₹{item.price}</Text>
              </View>
              <TouchableOpacity
                onPress={() => deleteProduct(item._id)}
                className="p-2"
              >
                <Icon name="trash-2" size={20} color="#f87171" />
              </TouchableOpacity>
            </View>
          )}
        />

        {/* Add Product Modal */}
        <Modal visible={modalVisible} animationType="slide" transparent>
          <View className="flex-1 justify-end bg-black/70">
            <View className="bg-slate-900 border-t border-slate-800 rounded-t-3xl p-6">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-white text-xl font-bold">Add New Product</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Icon name="x" size={24} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              <Text className="text-slate-400 mb-1">Product Name</Text>
              <TextInput
                className="bg-slate-800 text-white rounded-lg px-4 py-3 mb-3 border border-slate-700"
                placeholder="e.g. Sugar Crystals"
                placeholderTextColor="#64748b"
                value={newName}
                onChangeText={setNewName}
              />

              <Text className="text-slate-400 mb-1">Price (₹)</Text>
              <TextInput
                className="bg-slate-800 text-white rounded-lg px-4 py-3 mb-3 border border-slate-700"
                placeholder="e.g. 45"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
                value={newPrice}
                onChangeText={setNewPrice}
              />

              <Text className="text-slate-400 mb-1">Category</Text>
              <TextInput
                className="bg-slate-800 text-white rounded-lg px-4 py-3 mb-6 border border-slate-700"
                placeholder="e.g. grains, spices"
                placeholderTextColor="#64748b"
                value={newCategory}
                onChangeText={setNewCategory}
              />

              <TouchableOpacity
                onPress={handleAddProduct}
                className="bg-blue-600 rounded-lg py-3"
              >
                <Text className="text-white text-center font-bold text-lg">Save Product</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
  );
};

export default ProductManagementScreen;
