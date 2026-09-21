import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RSLogo from '../../components/RSLogo';
import { useCartStore } from '../../store/cartStore';

export default function ProductDetailScreen({ route, navigation }) {
  const { product } = route?.params || {};
  const { addItem } = useCartStore();

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

  // Compute available size variants dynamically from Product DB record
  const availableVariants = useMemo(() => {
    if (Array.isArray(product?.variants) && product.variants.length > 0) {
      return product.variants.map((v) => ({
        id: v._id || v.sku || v.size,
        size: v.size || 'Standard',
        price: v.price || product?.price || 99,
        mrp: v.mrp || product?.mrp || (v.price ? Math.round(v.price * 1.25) : 125),
        label: v.label || (v.isDefault ? 'Default' : ''),
        isDefault: !!v.isDefault,
        stockQuantity: typeof v.stockQuantity === 'number' ? v.stockQuantity : 100,
        image: v.image || product?.image,
      }));
    }

    // Default variant generation from base product if variants array is not populated
    const baseP = product?.price || 99;
    const baseM = product?.mrp || Math.round(baseP * 1.25);
    return [
      { id: 'var-500', size: '500ml', price: baseP, mrp: baseM, label: 'Standard', isDefault: true },
      { id: 'var-1l', size: '1L', price: Math.round(baseP * 1.8), mrp: Math.round(baseM * 1.8), label: 'Refill Pack', isDefault: false },
      { id: 'var-5l', size: '5L', price: Math.round(baseP * 7.5), mrp: Math.round(baseM * 7.5), label: 'Bulk Saver', isDefault: false },
    ];
  }, [product]);

  // Find default variant (isDefault === true or first item)
  const defaultVariantObj = useMemo(() => {
    return availableVariants.find((v) => v.isDefault) || availableVariants[0];
  }, [availableVariants]);

  const [selectedVariant, setSelectedVariant] = useState(defaultVariantObj);
  const [quantity, setQuantity] = useState(1);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (defaultVariantObj) {
      setSelectedVariant(defaultVariantObj);
    }
  }, [defaultVariantObj]);

  const handleSelectVariant = useCallback((variant) => {
    setSelectedVariant(variant);
  }, []);

  const triggerToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2400);
  }, []);

  // Compute dynamic pack options (including Single Unit 1 pc / No Bundle) based on selected variant
  const bundles = useMemo(() => {
    const unitP = selectedVariant?.price || product?.price || 99;
    const sz = selectedVariant?.size || 'Unit';

    return [
      {
        count: 1,
        title: `Single Unit (1 × ${sz})`,
        ratePerUnit: unitP,
        totalPrice: unitP,
        savings: 0,
        badge: 'Single Pack',
        isSingle: true,
      },
      {
        count: 10,
        title: `Pack of 10 (${10} × ${sz})`,
        ratePerUnit: Math.round(unitP * 0.9), // 10% discount
        totalPrice: Math.round(unitP * 10 * 0.9),
        savings: Math.round(unitP * 10 * 0.1),
        badge: 'Save 10%',
      },
      {
        count: 20,
        title: `Pack of 20 (${20} × ${sz})`,
        ratePerUnit: Math.round(unitP * 0.85), // 15% discount
        totalPrice: Math.round(unitP * 20 * 0.85),
        savings: Math.round(unitP * 20 * 0.15),
        badge: 'Best Value',
      },
      {
        count: 50,
        title: `Pack of 50 (${50} × ${sz})`,
        ratePerUnit: Math.round(unitP * 0.80), // 20% discount
        totalPrice: Math.round(unitP * 50 * 0.80),
        savings: Math.round(unitP * 50 * 0.20),
        badge: 'Save 20%',
      },
      {
        count: 100,
        title: `Pack of 100 (${100} × ${sz})`,
        ratePerUnit: Math.round(unitP * 0.75), // 25% discount
        totalPrice: Math.round(unitP * 100 * 0.75),
        savings: Math.round(unitP * 100 * 0.25),
        badge: 'Wholesale Tier',
      },
    ];
  }, [selectedVariant, product]);

  const handleAddBundle = useCallback(
    (bundle) => {
      addItem({
        _id: `${product?._id || 'prod'}-bundle-${bundle.count}-${selectedVariant.size}`,
        name: `${product?.name || 'Product'} (${bundle.title})`,
        price: bundle.totalPrice,
        size: `${bundle.count} × ${selectedVariant.size}`,
        quantity: 1,
      });
      triggerToast(`Added ${bundle.title} (₹${bundle.totalPrice}) to cart!`);
    },
    [addItem, product, selectedVariant, triggerToast]
  );

  const handleAddToCart = useCallback(() => {
    const itemTotal = (selectedVariant?.price || 99) * quantity;
    addItem({
      _id: `${product?._id || 'prod'}-${selectedVariant.size}`,
      name: product?.name || 'Industrial Cleaner',
      price: selectedVariant?.price || 99,
      size: selectedVariant?.size || 'Standard',
      quantity,
    });
    triggerToast(`Added ${quantity} × ${selectedVariant.size} (₹${itemTotal}) to cart!`);
  }, [addItem, product, quantity, selectedVariant, triggerToast]);

  const displayImage = selectedVariant?.image || product?.image;

  return (
    <SafeAreaView className="flex-1 bg-[#faf8ff]">
      {/* Header */}
      <View className="bg-white border-b border-[#dae2fd] px-4 py-3 flex-row items-center justify-between shadow-sm">
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full bg-[#f2f3ff] justify-center items-center"
          >
            <Icon name="arrow-back" size={20} color="#131b2e" />
          </Pressable>
          <RSLogo size="sm" showText={false} />
          <Text className="text-base font-bold text-[#131b2e] ml-1">Product Detail</Text>
        </View>

        <View className="flex-row items-center gap-2">
          <Pressable className="w-10 h-10 rounded-full bg-[#f2f3ff] justify-center items-center">
            <Icon name="help-outline" size={20} color="#3d4a42" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 110 }}
      >
        {/* Showcase Image & Trust Badges */}
        <View className="bg-[#f2f3ff] px-4 pt-4 pb-6 items-center">
          <View className="w-full flex-row items-center justify-between gap-2 mb-3">
            <View className="bg-white px-2.5 py-1 rounded-full flex-row items-center gap-1 shadow-sm">
              <Icon name="factory" size={14} color="#006948" />
              <Text className="text-[10px] text-[#006948] font-bold">Direct from Factory</Text>
            </View>
            <View className="bg-[#99efe5] px-2.5 py-1 rounded-full flex-row items-center gap-1 shadow-sm">
              <Icon name="verified-user" size={14} color="#006f67" />
              <Text className="text-[10px] text-[#006f67] font-bold">Lab Certified Efficacy</Text>
            </View>
          </View>

          {/* Product Image */}
          <View className="relative w-full h-64 rounded-2xl bg-white shadow-sm overflow-hidden justify-center items-center p-4">
            {displayImage ? (
              <Image
                source={{ uri: displayImage }}
                className="w-full h-full"
                resizeMode="contain"
              />
            ) : (
              <Icon name="inventory-2" size={72} color="#bccac0" />
            )}

            {/* Default Variant Tag */}
            {selectedVariant?.isDefault && (
              <View className="absolute top-3 left-3 z-10 bg-[#006948] px-2.5 py-0.5 rounded-md shadow-sm">
                <Text className="text-[9px] text-white font-bold uppercase">Default Variant</Text>
              </View>
            )}

            {/* Rating badge */}
            <View className="absolute top-3 right-3 z-10 bg-white/90 px-2 py-1 rounded-lg flex-row items-center gap-1 shadow-sm">
              <Icon name="star" size={14} color="#f59e0b" />
              <Text className="text-xs font-bold text-[#131b2e]">4.9</Text>
              <Text className="text-[10px] text-[#3d4a42]">(Verified)</Text>
            </View>
          </View>
        </View>

        {/* Main Info */}
        <View className="px-4 pt-4 gap-2">
          <View className="flex-row items-center gap-2">
            <View className="bg-[#85f8c4] px-2 py-0.5 rounded">
              <Text className="text-[10px] text-[#002114] font-bold">
                {product?.badge || 'ECO-CERTIFIED'}
              </Text>
            </View>
            <Text className="text-xs text-[#006a63] font-semibold">
              {product?.subtitle || 'Industrial Formulation'}
            </Text>
          </View>

          <Text className="text-lg font-extrabold text-[#131b2e] leading-snug">
            {product?.name || 'Industrial Disinfectant Cleaner'}
          </Text>
          <Text className="text-xs text-[#3d4a42] leading-relaxed">
            {product?.description ||
              'High efficacy cleaning formulation for marble, tiles, granite, and industrial floors.'}
          </Text>
        </View>

        {/* Variant Selection Grid (1 Variant marked as Default) */}
        <View className="px-4 pt-4 gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-bold text-[#131b2e]">Select Variant Pack Size</Text>
            <Text className="text-[10px] text-[#006948] font-bold">
              Default: {defaultVariantObj?.size}
            </Text>
          </View>

          <View className="flex-row flex-wrap gap-2">
            {availableVariants.map((v) => {
              const isSelected = selectedVariant?.id === v.id || selectedVariant?.size === v.size;
              return (
                <Pressable
                  key={v.id}
                  onPress={() => handleSelectVariant(v)}
                  className={`w-[48%] p-3 rounded-2xl flex-row items-center justify-between border ${
                    isSelected
                      ? 'bg-[#006948] border-[#006948] shadow-md'
                      : 'bg-[#f2f3ff] border-transparent'
                  }`}
                >
                  <View className="flex-1 pr-1">
                    <View className="flex-row items-center gap-1">
                      <Text
                        className={`text-xs font-bold ${
                          isSelected ? 'text-white' : 'text-[#131b2e]'
                        }`}
                      >
                        {v.size}
                      </Text>
                      {v.isDefault && (
                        <View
                          className={`px-1 py-0.2 rounded ${
                            isSelected ? 'bg-white/20' : 'bg-[#006948]/10'
                          }`}
                        >
                          <Text
                            className={`text-[7px] font-bold ${
                              isSelected ? 'text-white' : 'text-[#006948]'
                            }`}
                          >
                            DEFAULT
                          </Text>
                        </View>
                      )}
                    </View>
                    {v.label ? (
                      <Text
                        className={`text-[9px] ${
                          isSelected ? 'text-white/80' : 'text-[#3d4a42]'
                        }`}
                        numberOfLines={1}
                      >
                        {v.label}
                      </Text>
                    ) : null}
                  </View>
                  <Text
                    className={`text-sm font-bold ${
                      isSelected ? 'text-white' : 'text-[#131b2e]'
                    }`}
                  >
                    ₹{v.price}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Predefined Bulk Bundles Computed Dynamic per Selected Variant */}
        <View className="px-4 pt-4">
          <View className="bg-[#f2f3ff] p-3.5 rounded-2xl gap-3">
            <View>
              <Text className="text-sm font-bold text-[#131b2e]">
                Predefined Bulk Bundles
              </Text>
              <Text className="text-[10px] text-[#3d4a42]">
                Volume discount bundles for selected variant ({selectedVariant?.size})
              </Text>
            </View>

            <View className="gap-2">
              {bundles.map((b) => (
                <View
                  key={`bundle-${b.count}`}
                  className="bg-white p-3 rounded-xl flex-row items-center justify-between shadow-sm border border-[#eaedff]"
                >
                  <View className="flex-1 pr-2">
                    <View className="flex-row items-center gap-1.5">
                      <Text className="text-xs font-bold text-[#131b2e]">{b.title}</Text>
                      <View className="bg-[#006948]/10 px-1.5 py-0.2 rounded">
                        <Text className="text-[8px] text-[#006948] font-bold uppercase">
                          {b.badge}
                        </Text>
                      </View>
                    </View>
                    <View className="flex-row items-center gap-2 mt-0.5">
                      <Text className="text-sm font-bold text-[#131b2e]">₹{b.totalPrice}</Text>
                      <View className="bg-[#eaedff] px-1.5 py-0.2 rounded">
                        <Text className="text-[9px] text-[#006948] font-bold">
                          ₹{b.ratePerUnit} / pc
                        </Text>
                      </View>
                      <Text className="text-[10px] text-[#006a63]">Save ₹{b.savings}</Text>
                    </View>
                  </View>

                  <Pressable
                    onPress={() => handleAddBundle(b)}
                    className="bg-[#006948] px-3 py-1.5 rounded-lg"
                  >
                    <Text className="text-xs text-white font-bold">Add Pack</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Toast Notification */}
      {toastMessage && (
        <View className="absolute bottom-20 left-6 right-6 bg-[#283044] px-4 py-2.5 rounded-full flex-row items-center justify-center gap-2 shadow-xl z-50">
          <Icon name="check-circle" size={16} color="#68fcbf" />
          <Text className="text-xs text-white font-semibold">{toastMessage}</Text>
        </View>
      )}

      {/* Sticky Bottom Dock */}
      <View className="absolute bottom-0 inset-x-0 bg-white border-t border-[#dae2fd] px-4 py-3 shadow-xl flex-row items-center justify-between gap-3">
        <View>
          <View className="flex-row items-baseline gap-1">
            <Text className="text-xl font-extrabold text-[#131b2e]">
              ₹{((selectedVariant?.price || 99) * quantity).toLocaleString('en-IN')}
            </Text>
            <Text className="text-[10px] text-[#3d4a42]">
              ({quantity} × {selectedVariant?.size})
            </Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Icon name="bolt" size={12} color="#006948" />
            <Text className="text-[10px] text-[#006948] font-bold">Ready to dispatch</Text>
          </View>
        </View>

        <View className="flex-row items-center gap-2">
          {/* Stepper */}
          <View className="flex-row items-center bg-[#f2f3ff] rounded-xl p-0.5">
            <Pressable
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 justify-center items-center"
            >
              <Text className="text-base font-bold text-[#131b2e]">-</Text>
            </Pressable>
            <Text className="px-2 text-xs font-bold text-[#131b2e]">{quantity}</Text>
            <Pressable
              onPress={() => setQuantity(quantity + 1)}
              className="w-8 h-8 justify-center items-center"
            >
              <Text className="text-base font-bold text-[#131b2e]">+</Text>
            </Pressable>
          </View>

          <Pressable
            activeOpacity={0.9}
            onPress={handleAddToCart}
            className="h-11 px-4 bg-[#006948] rounded-xl flex-row items-center gap-1.5 shadow-md justify-center"
          >
            <Icon name="shopping-bag" size={18} color="#ffffff" />
            <Text className="text-xs font-bold text-white">Add</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
