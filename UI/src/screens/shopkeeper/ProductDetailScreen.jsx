import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  BackHandler,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RSLogo from '../../components/RSLogo';
import { useCartStore } from '../../store/cartStore';

export default function ProductDetailScreen({ route, navigation }) {
  const { product } = route?.params || {};
  const { addItem } = useCartStore();

  const [toastMessage, setToastMessage] = useState(null);
  const [packQuantity, setPackQuantity] = useState(1);

  // Hardware Back Handler
  useEffect(() => {
    const onBackPress = () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
        return true;
      }
      navigation.navigate('ShopHome');
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [navigation]);

  // Extract available bundles for this variant (Bundles are the selectable options on this page)
  const bundlesList = useMemo(() => {
    if (Array.isArray(product?.bundles) && product.bundles.length > 0) {
      return product.bundles;
    }
    return [
      {
        bundleId: 'default-pack-1',
        label: 'Pack of 1',
        quantity: 1,
        price: product?.price || 10,
        mrp: product?.mrp || product?.price || 10,
        isDefault: true,
      },
    ];
  }, [product]);

  // Default bundle selection
  const initialBundle = useMemo(() => {
    return (
      product?.defaultBundle ||
      bundlesList.find((b) => b.isDefault) ||
      bundlesList[0]
    );
  }, [product, bundlesList]);

  const [selectedBundle, setSelectedBundle] = useState(initialBundle);

  useEffect(() => {
    if (initialBundle) {
      setSelectedBundle(initialBundle);
    }
  }, [initialBundle]);

  const triggerToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2200);
  }, []);

  const handleAddToCart = useCallback(() => {
    if (!product || !selectedBundle) return;

    const bundleId = selectedBundle.bundleId || selectedBundle.label || 'pack-1';
    const cartItemId = `${product._id}_${bundleId}`;

    addItem({
      _id: product._id,
      cartItemId,
      bundleId,
      productId: product.masterProductId || product._id,
      variantId: product.variantId || 'default',
      name: product.name,
      variantLabel: product.variantLabel || '',
      bundleLabel: selectedBundle.label || 'Pack of 1',
      title: `${product.name} (${selectedBundle.label || 'Pack of 1'})`,
      price: selectedBundle.price,
      mrp: selectedBundle.mrp || selectedBundle.price,
      quantity: packQuantity,
      image: selectedBundle.image || product.image,
    });

    const totalPrice = (selectedBundle.price || 0) * packQuantity;
    triggerToast(`Added ${packQuantity}x ${selectedBundle.label} (₹${totalPrice}) to cart!`);
  }, [addItem, product, selectedBundle, packQuantity, triggerToast]);

  const imageUri = selectedBundle?.image || product?.image;
  const totalPrice = (selectedBundle?.price || 0) * packQuantity;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-[#faf8ff]">
      {/* Top Header */}
      <View className="bg-white border-b border-[#dae2fd] px-4 py-3 flex-row items-center justify-between shadow-sm z-10">
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('ShopHome');
              }
            }}
            className="w-9 h-9 rounded-full bg-[#f2f3ff] justify-center items-center border border-[#dae2fd]"
          >
            <Icon name="arrow-back" size={20} color="#131b2e" />
          </Pressable>
          <RSLogo size="sm" showText={false} />
          <Text className="text-base font-black text-[#131b2e] ml-1">Product Details</Text>
        </View>

        <Pressable
          onPress={() => navigation.navigate('ShopHome')}
          className="px-3 py-1.5 rounded-full bg-[#006948]/10 border border-[#006948]/20 flex-row items-center gap-1"
        >
          <Icon name="home" size={16} color="#006948" />
          <Text className="text-xs font-bold text-[#006948]">Home</Text>
        </Pressable>
      </View>

      {/* Toast Notification */}
      {toastMessage && (
        <View className="absolute top-16 left-4 right-4 z-50 bg-[#006948] p-3 rounded-xl shadow-lg flex-row items-center gap-2">
          <Icon name="check-circle" size={18} color="#ffffff" />
          <Text className="text-xs text-white font-bold flex-1">{toastMessage}</Text>
        </View>
      )}

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Product Image Showcase */}
        <View className="bg-[#f2f3ff] px-4 pt-4 pb-6 items-center">
          <View className="w-full flex-row items-center justify-between gap-2 mb-3">
            <View className="bg-white px-2.5 py-1 rounded-full flex-row items-center gap-1 shadow-sm border border-[#dae2fd]">
              <Icon name="factory" size={14} color="#006948" />
              <Text className="text-[10px] text-[#006948] font-bold">Factory Wholesale</Text>
            </View>
            <View className="bg-[#99efe5] px-2.5 py-1 rounded-full flex-row items-center gap-1 shadow-sm">
              <Icon name="verified-user" size={14} color="#006f67" />
              <Text className="text-[10px] text-[#006f67] font-bold">Lab Certified</Text>
            </View>
          </View>

          {/* Product Image */}
          <View className="relative w-full h-56 rounded-2xl bg-white shadow-sm overflow-hidden justify-center items-center p-4 border border-[#eaedff]">
            {imageUri ? (
              <Image source={{ uri: imageUri }} className="w-full h-full" resizeMode="contain" />
            ) : (
              <Icon name="inventory-2" size={64} color="#bccac0" />
            )}

            {product?.badge && (
              <View className="absolute top-3 left-3 z-10 bg-[#006948] px-2.5 py-1 rounded-md shadow-sm">
                <Text className="text-[9px] text-white font-bold uppercase">{product.badge}</Text>
              </View>
            )}

            <View className="absolute top-3 right-3 z-10 bg-white/90 px-2 py-1 rounded-lg flex-row items-center gap-1 shadow-sm border border-[#dae2fd]">
              <Icon name="star" size={14} color="#f59e0b" />
              <Text className="text-xs font-bold text-[#131b2e]">4.9</Text>
            </View>
          </View>
        </View>

        {/* Master Product Name & Details */}
        <View className="px-4 pt-4 gap-2">
          {product?.variantLabel ? (
            <View className="flex-row items-center gap-2">
              <View className="bg-[#006948]/10 px-2 py-0.5 rounded border border-[#006948]/30">
                <Text className="text-[10px] text-[#006948] font-bold">
                  {product.variantLabel}
                </Text>
              </View>
            </View>
          ) : null}

          <Text className="text-lg font-black text-[#131b2e] leading-snug">
            {product?.name || 'Product'}
          </Text>

          <Text className="text-xs text-[#3d4a42] leading-relaxed">
            {product?.description ||
              'High efficacy cleaning formulation for marble, tiles, granite, and industrial surfaces.'}
          </Text>
        </View>

        {/* Bundle Options Selection */}
        <View className="px-4 pt-5 gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-black text-[#131b2e]">Select Quantity / Bundle Pack</Text>
            <Text className="text-[10px] text-[#006948] font-bold">
              {bundlesList.length} Options Available
            </Text>
          </View>

          <View className="gap-2.5">
            {bundlesList.map((bundle, idx) => {
              const bId = bundle.bundleId || bundle.label || `b-${idx}`;
              const isSelected = selectedBundle && (selectedBundle.bundleId === bId || selectedBundle.label === bundle.label);
              const savings = bundle.mrp && bundle.mrp > bundle.price ? bundle.mrp - bundle.price : 0;

              return (
                <Pressable
                  key={bId}
                  onPress={() => setSelectedBundle(bundle)}
                  className={`p-3.5 rounded-2xl flex-row items-center justify-between border shadow-sm ${
                    isSelected
                      ? 'bg-white border-[#006948] ring-2 ring-[#006948]/20'
                      : 'bg-white border-[#eaedff]'
                  }`}
                >
                  <View className="flex-row items-center gap-3 flex-1">
                    <View
                      className={`w-6 h-6 rounded-full items-center justify-center border ${
                        isSelected
                          ? 'bg-[#006948] border-[#006948]'
                          : 'bg-white border-[#bccac0]'
                      }`}
                    >
                      {isSelected && <Icon name="check" size={14} color="#ffffff" />}
                    </View>

                    <View className="flex-1">
                      <Text
                        className={`text-xs font-black ${
                          isSelected ? 'text-[#006948]' : 'text-[#131b2e]'
                        }`}
                      >
                        {bundle.label || `Pack of ${bundle.quantity}`}
                      </Text>
                      <Text className="text-[10px] text-[#6d7a72] font-semibold mt-0.5">
                        Quantity: {bundle.quantity || 1} {bundle.quantity === 1 ? 'Unit' : 'Units'}
                      </Text>
                    </View>
                  </View>

                  <View className="items-end">
                    <Text className="text-sm font-extrabold text-[#131b2e]">₹{bundle.price}</Text>
                    {bundle.mrp && bundle.mrp > bundle.price ? (
                      <View className="flex-row items-center gap-1 mt-0.5">
                        <Text className="text-[9px] text-[#6d7a72] line-through">₹{bundle.mrp}</Text>
                        <Text className="text-[9px] text-[#006948] font-bold">Save ₹{savings}</Text>
                      </View>
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Number of Packs Stepper Control */}
        <View className="px-4 pt-5">
          <View className="bg-white p-4 rounded-2xl border border-[#dae2fd] shadow-sm flex-row items-center justify-between">
            <View>
              <Text className="text-xs font-black text-[#131b2e]">Number of Packs</Text>
              <Text className="text-[10px] text-[#6d7a72] font-semibold mt-0.5">
                How many {selectedBundle?.label || 'packs'} do you want?
              </Text>
            </View>

            {/* Stepper Buttons */}
            <View className="flex-row items-center bg-[#f2f3ff] rounded-xl p-1 border border-[#dae2fd]">
              <TouchableOpacity
                onPress={() => setPackQuantity((q) => Math.max(1, q - 1))}
                activeOpacity={0.7}
                className="w-8 h-8 rounded-lg bg-white justify-center items-center border border-[#dae2fd] shadow-sm"
              >
                <Icon name="remove" size={16} color="#131b2e" />
              </TouchableOpacity>

              <Text className="w-10 text-center font-black text-sm text-[#006948]">
                {packQuantity}
              </Text>

              <TouchableOpacity
                onPress={() => setPackQuantity((q) => q + 1)}
                activeOpacity={0.7}
                className="w-8 h-8 rounded-lg bg-[#006948] justify-center items-center shadow-sm"
              >
                <Icon name="add" size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#dae2fd] p-4 shadow-lg flex-row items-center justify-between">
        <View>
          <Text className="text-[10px] uppercase font-bold text-[#6d7a72]">
            Total ({packQuantity} {packQuantity === 1 ? 'Pack' : 'Packs'})
          </Text>
          <View className="flex-row items-baseline gap-1">
            <Text className="text-xl font-black text-[#131b2e]">₹{totalPrice}</Text>
            {selectedBundle?.mrp > selectedBundle?.price && (
              <Text className="text-xs text-[#6d7a72] line-through">
                ₹{selectedBundle.mrp * packQuantity}
              </Text>
            )}
          </View>
        </View>

        <Pressable
          onPress={handleAddToCart}
          className="bg-[#006948] px-6 py-3.5 rounded-xl flex-row items-center gap-2 shadow-md active:opacity-90"
        >
          <Icon name="add-shopping-cart" size={18} color="#ffffff" />
          <Text className="text-xs font-bold text-white uppercase tracking-wider">Add to Cart</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
