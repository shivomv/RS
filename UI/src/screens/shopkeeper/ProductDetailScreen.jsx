import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
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

  const [selectedSize, setSelectedSize] = useState('500ml');
  const [basePrice, setBasePrice] = useState(product?.price || 99);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('packs'); // 'packs' or 'calc'
  const [customQty, setCustomQty] = useState('35');
  const [toastMessage, setToastMessage] = useState(null);

  // Hardware Android Back Button Handler
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

  const sizes = [
    { size: '250ml', price: 55, label: 'Trial Bottle' },
    { size: '500ml', price: 99, label: 'Most Popular' },
    { size: '1L', price: 175, label: 'Refill Pack' },
    { size: '5L', price: 699, label: 'Save 29%' },
  ];

  const handleSelectSize = (sz, pr) => {
    setSelectedSize(sz);
    setBasePrice(pr);
  };

  const handleAddBundle = (packCount, packPrice) => {
    addItem({
      _id: `bundle-${packCount}`,
      name: `Ultra-Clean Citrus Floor Cleaner (Pack of ${packCount})`,
      price: packPrice,
      quantity: 1,
    });
    triggerToast(`Added Pack of ${packCount} (₹${packPrice}) to cart!`);
  };

  const computeCustom = () => {
    const qty = parseInt(customQty, 10) || 1;
    let rate = 95;
    if (qty >= 100) rate = 75;
    else if (qty >= 50) rate = 80;
    else if (qty >= 20) rate = 85;
    else if (qty >= 10) rate = 90;

    const total = qty * rate;
    const baseTotal = qty * 99;
    const savings = baseTotal - total;
    return { rate, total, savings };
  };

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2400);
  };

  const handleAddToCart = () => {
    const itemTotal = basePrice * quantity;
    addItem({
      _id: product?._id || 'citrus-cleaner',
      name: product?.name || 'Ultra-Clean Citrus Disinfectant Floor Cleaner',
      price: basePrice,
      size: selectedSize,
      quantity,
    });
    triggerToast(`Added ${quantity} × ${selectedSize} (₹${itemTotal}) to cart!`);
  };

  const customCalcData = computeCustom();

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
          <Pressable className="w-9 h-9 rounded-full overflow-hidden border border-[#bccac0]">
            <Image
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDLeDyueZlbltTvpYJh6dXpFSuXwXbe35r3tRlI9Fam1hMUSIFgEOkkjhle6CwaIpR6ip1TnEpF-A0ccTlOS-i8u8xMJN_GGjNrG0dnkuZeMyzFHNyeiJ-d0sJcusma6q_Ke2EVTZLa3_A2VYg4xjFxolYUMw-EFjCWXCY9_cLFD28C2rlLibhY0lTjcTvtqxrhCbnUjWoYfHI6NfpAYFDGCRSDoGiBehNIO9Dq4Gea812pXDgiP7jl',
              }}
              className="w-full h-full"
            />
          </Pressable>
        </View>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} className="flex-1" contentContainerStyle={{ paddingBottom: 110 }}>
        {/* Showcase Image & Trust Badges */}
        <View className="bg-[#f2f3ff] px-4 pt-4 pb-6 items-center">
          <View className="w-full flex-row items-center justify-between gap-2 mb-3">
            <View className="bg-white px-2.5 py-1 rounded-full flex-row items-center gap-1 shadow-sm">
              <Icon name="factory" size={14} color="#006948" />
              <Text className="text-[10px] text-[#006948] font-bold">Direct from Factory</Text>
            </View>
            <View className="bg-[#99efe5] px-2.5 py-1 rounded-full flex-row items-center gap-1 shadow-sm">
              <Icon name="verified-user" size={14} color="#006f67" />
              <Text className="text-[10px] text-[#006f67] font-bold">Hospital Grade 99.9%</Text>
            </View>
          </View>

          {/* Product Image */}
          <View className="relative w-full h-64 rounded-2xl bg-white shadow-sm overflow-hidden justify-center items-center p-4">
            <Image
              source={{
                uri: product?.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAIw-TAjiHlWD16OjJyycbxeArhF8FiWFTbsY2wRK9W-8UUJQQ1DZHTMVGKxQJAweFpWakM8x960IgKesdpY5JHosY4JGvLBbCqTETyPkk8BzCq--5MQDbzR8bE1KlN46AksKGM2Z0a1hKoUAoDcJyLHBumSu39P7JF6MgKwXglZvt_VbcT7x2G61BMFadloi72MFFb39IyXunZ1GZAI-j-rxrhMer3cf3wX5dt8aJXVledXZR2n3fw',
              }}
              className="w-full h-full"
              resizeMode="contain"
            />
            {/* Dots */}
            <View className="absolute bottom-3 flex-row items-center gap-1 bg-white/80 px-2 py-1 rounded-full">
              <View className="w-2 h-2 rounded-full bg-[#006948]" />
              <View className="w-1.5 h-1.5 rounded-full bg-[#bccac0]" />
              <View className="w-1.5 h-1.5 rounded-full bg-[#bccac0]" />
              <View className="w-1.5 h-1.5 rounded-full bg-[#bccac0]" />
            </View>

            {/* Rating badge */}
            <View className="absolute top-3 right-3 z-10 bg-white/90 px-2 py-1 rounded-lg flex-row items-center gap-1 shadow-sm">
              <Icon name="star" size={14} color="#f59e0b" />
              <Text className="text-xs font-bold text-[#131b2e]">4.8</Text>
              <Text className="text-[10px] text-[#3d4a42]">(1,420)</Text>
            </View>
          </View>
        </View>

        {/* Main Info */}
        <View className="px-4 pt-4 gap-2">
          <View className="flex-row items-center gap-2">
            <View className="bg-[#85f8c4] px-2 py-0.5 rounded">
              <Text className="text-[10px] text-[#002114] font-bold">ECO-CERTIFIED</Text>
            </View>
            <Text className="text-xs text-[#006a63] font-semibold">Concentrated Formulation</Text>
          </View>

          <Text className="text-lg font-extrabold text-[#131b2e] leading-snug">
            {product?.name || 'Ultra-Clean Citrus Disinfectant Floor Cleaner'}
          </Text>
          <Text className="text-xs text-[#3d4a42] leading-relaxed">
            Powerful enzymatic germ-shield formula designed for marble, tiles, and commercial flooring. Safe around pets and children.
          </Text>
        </View>

        {/* Micro Highlights Ribbon */}
        <View className="px-4 py-3">
          <View className="flex-row gap-2">
            <View className="flex-1 bg-[#eaedff] p-2 rounded-xl items-center justify-center">
              <Icon name="format-color-fill" size={18} color="#006948" />
              <Text className="text-[10px] text-[#131b2e] font-semibold mt-1">Non-Corrosive</Text>
            </View>
            <View className="flex-1 bg-[#eaedff] p-2 rounded-xl items-center justify-center">
              <Icon name="eco" size={18} color="#006948" />
              <Text className="text-[10px] text-[#131b2e] font-semibold mt-1">Bio Actives</Text>
            </View>
            <View className="flex-1 bg-[#eaedff] p-2 rounded-xl items-center justify-center">
              <Icon name="biotech" size={18} color="#006948" />
              <Text className="text-[10px] text-[#131b2e] font-semibold mt-1">MSDS Certified</Text>
            </View>
            <View className="flex-1 bg-[#eaedff] p-2 rounded-xl items-center justify-center">
              <Icon name="pets" size={18} color="#006948" />
              <Text className="text-[10px] text-[#131b2e] font-semibold mt-1">Pet Safe</Text>
            </View>
          </View>
        </View>

        {/* Size Selection Grid */}
        <View className="px-4 pt-2 gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-bold text-[#131b2e]">Choose Size</Text>
            <Text className="text-[10px] text-[#006948] font-bold">Standard Cap Dispenser</Text>
          </View>

          <View className="flex-row flex-wrap gap-2">
            {sizes.map((s) => {
              const isSelected = selectedSize === s.size;
              return (
                <Pressable
                  key={s.size}
                  onPress={() => handleSelectSize(s.size, s.price)}
                  className={`w-[48%] p-3 rounded-2xl flex-row items-center justify-between border ${
                    isSelected
                      ? 'bg-[#006948] border-[#006948] shadow-md'
                      : 'bg-[#f2f3ff] border-transparent'
                  }`}
                >
                  <View>
                    <View className="flex-row items-center gap-1">
                      <Text
                        className={`text-xs font-bold ${
                          isSelected ? 'text-white' : 'text-[#131b2e]'
                        }`}
                      >
                        {s.size}
                      </Text>
                      {isSelected && <Icon name="check-circle" size={14} color="#ffffff" />}
                    </View>
                    <Text
                      className={`text-[10px] ${
                        isSelected ? 'text-white/80' : 'text-[#3d4a42]'
                      }`}
                    >
                      {s.label}
                    </Text>
                  </View>
                  <Text
                    className={`text-sm font-bold ${
                      isSelected ? 'text-white' : 'text-[#131b2e]'
                    }`}
                  >
                    ₹{s.price}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* How much do you need? (Bulk Packs & Calculator) */}
        <View className="px-4 pt-4">
          <View className="bg-[#f2f3ff] p-3.5 rounded-2xl gap-3">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-sm font-bold text-[#131b2e]">How much do you need?</Text>
                <Text className="text-[10px] text-[#3d4a42]">
                  Volume discounts computed for {selectedSize}
                </Text>
              </View>
              <Pressable
                onPress={() => navigation.navigate('BulkPriceOptimizer')}
                className="flex-row items-center gap-1 bg-[#006948]/10 px-2 py-1 rounded-full"
              >
                <Icon name="calculate" size={14} color="#006948" />
                <Text className="text-[10px] text-[#006948] font-bold">Optimizer</Text>
              </Pressable>
            </View>

            {/* Segmented Tabs */}
            <View className="flex-row bg-[#e2e7ff] p-1 rounded-xl">
              <Pressable
                onPress={() => setActiveTab('packs')}
                className={`flex-1 py-1.5 rounded-lg justify-center items-center ${
                  activeTab === 'packs' ? 'bg-white shadow-sm' : ''
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    activeTab === 'packs' ? 'text-[#006948]' : 'text-[#3d4a42]'
                  }`}
                >
                  Predefined Bulk Packs
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setActiveTab('calc')}
                className={`flex-1 py-1.5 rounded-lg justify-center items-center ${
                  activeTab === 'calc' ? 'bg-white shadow-sm' : ''
                }`}
              >
                <Text
                  className={`text-xs font-bold ${
                    activeTab === 'calc' ? 'text-[#006948]' : 'text-[#3d4a42]'
                  }`}
                >
                  Custom Calculator
                </Text>
              </Pressable>
            </View>

            {activeTab === 'packs' ? (
              <View className="gap-2">
                {/* Pack 10 */}
                <View className="bg-white p-3 rounded-xl flex-row items-center justify-between shadow-sm">
                  <View>
                    <Text className="text-xs font-bold text-[#131b2e]">
                      Pack of 10 <Text className="text-[10px] font-normal text-[#3d4a42]">(10 × 500ml)</Text>
                    </Text>
                    <View className="flex-row items-center gap-2 mt-0.5">
                      <Text className="text-sm font-bold text-[#131b2e]">₹900</Text>
                      <View className="bg-[#eaedff] px-1.5 py-0.2 rounded">
                        <Text className="text-[9px] text-[#006948] font-bold">₹90 / pc</Text>
                      </View>
                      <Text className="text-[10px] text-[#006a63]">Save ₹90</Text>
                    </View>
                  </View>
                  <Pressable
                    onPress={() => handleAddBundle(10, 900)}
                    className="bg-[#006948] px-3 py-1.5 rounded-lg"
                  >
                    <Text className="text-xs text-white font-bold">Add Pack</Text>
                  </Pressable>
                </View>

                {/* Pack 20 (Best Value) */}
                <View className="bg-white p-3 rounded-xl flex-row items-center justify-between shadow-sm border border-[#99efe5]">
                  <View>
                    <View className="flex-row items-center gap-1.5">
                      <Text className="text-xs font-bold text-[#131b2e]">Pack of 20</Text>
                      <View className="bg-[#006a63] px-1.5 rounded">
                        <Text className="text-[8px] text-white font-bold uppercase">Best Value</Text>
                      </View>
                    </View>
                    <View className="flex-row items-center gap-2 mt-0.5">
                      <Text className="text-sm font-bold text-[#131b2e]">₹1,700</Text>
                      <View className="bg-[#99efe5] px-1.5 py-0.2 rounded">
                        <Text className="text-[9px] text-[#006f67] font-bold">₹85 / pc</Text>
                      </View>
                      <Text className="text-[10px] text-[#006a63] font-bold">Save ₹280</Text>
                    </View>
                  </View>
                  <Pressable
                    onPress={() => handleAddBundle(20, 1700)}
                    className="bg-[#006948] px-3 py-1.5 rounded-lg"
                  >
                    <Text className="text-xs text-white font-bold">Add Pack</Text>
                  </Pressable>
                </View>

                {/* Pack 50 */}
                <View className="bg-white p-3 rounded-xl flex-row items-center justify-between shadow-sm">
                  <View>
                    <Text className="text-xs font-bold text-[#131b2e]">Pack of 50</Text>
                    <View className="flex-row items-center gap-2 mt-0.5">
                      <Text className="text-sm font-bold text-[#131b2e]">₹4,000</Text>
                      <View className="bg-[#eaedff] px-1.5 py-0.2 rounded">
                        <Text className="text-[9px] text-[#006948] font-bold">₹80 / pc</Text>
                      </View>
                      <Text className="text-[10px] text-[#006a63]">Save ₹950</Text>
                    </View>
                  </View>
                  <Pressable
                    onPress={() => handleAddBundle(50, 4000)}
                    className="bg-[#006948] px-3 py-1.5 rounded-lg"
                  >
                    <Text className="text-xs text-white font-bold">Add Pack</Text>
                  </Pressable>
                </View>

                {/* Pack 100 */}
                <View className="bg-white p-3 rounded-xl flex-row items-center justify-between shadow-sm">
                  <View>
                    <Text className="text-xs font-bold text-[#131b2e]">Pack of 100</Text>
                    <View className="flex-row items-center gap-2 mt-0.5">
                      <Text className="text-sm font-bold text-[#131b2e]">₹7,500</Text>
                      <View className="bg-[#85f8c4] px-1.5 py-0.2 rounded">
                        <Text className="text-[9px] text-[#002114] font-bold">₹75 / pc</Text>
                      </View>
                      <Text className="text-[10px] text-[#006948] font-bold">Save ₹2,400</Text>
                    </View>
                  </View>
                  <Pressable
                    onPress={() => handleAddBundle(100, 7500)}
                    className="bg-[#006948] px-3 py-1.5 rounded-lg"
                  >
                    <Text className="text-xs text-white font-bold">Add Pack</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View className="bg-white p-4 rounded-xl gap-3 shadow-sm">
                <Text className="text-xs font-bold text-[#131b2e]">Enter Target Units Needed</Text>
                <View className="flex-row items-center gap-3">
                  <TextInput
                    value={customQty}
                    onChangeText={setCustomQty}
                    keyboardType="numeric"
                    className="w-20 bg-[#f2f3ff] rounded-lg text-center font-bold text-base text-[#131b2e] py-1.5"
                  />
                  <View>
                    <Text className="text-sm font-bold text-[#006948]">
                      ₹{customCalcData.total.toLocaleString('en-IN')} Total
                    </Text>
                    <Text className="text-[10px] text-[#3d4a42]">
                      ₹{customCalcData.rate}/piece • Save ₹{customCalcData.savings.toLocaleString('en-IN')}
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => handleAddBundle(parseInt(customQty, 10) || 1, customCalcData.total)}
                  className="bg-[#006a63] py-2.5 rounded-lg items-center flex-row justify-center gap-1"
                >
                  <Icon name="calculate" size={16} color="#ffffff" />
                  <Text className="text-xs text-white font-bold">Add Custom Bulk Lot</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>

        {/* Institutional & Corporate Procurement */}
        <View className="px-4 pt-4">
          <View className="bg-white p-4 rounded-2xl shadow-sm gap-2 border border-[#eaedff]">
            <View className="flex-row items-center gap-2">
              <Icon name="domain" size={20} color="#006948" />
              <Text className="text-xs font-bold text-[#131b2e]">
                RS Industries Facility Procurement
              </Text>
            </View>
            <Text className="text-[11px] text-[#3d4a42] leading-relaxed">
              Instant GST tax invoices generated upon dispatch. Need scheduled recurrent deliveries or 200L barrels for corporate complexes?
            </Text>
            <View className="flex-row items-center gap-2 pt-1">
              <Pressable className="bg-[#f2f3ff] px-3 py-1.5 rounded-lg flex-row items-center gap-1">
                <Icon name="download" size={14} color="#3d4a42" />
                <Text className="text-[10px] text-[#3d4a42] font-semibold">MSDS Sheet</Text>
              </Pressable>
              <Pressable className="bg-[#f2f3ff] px-3 py-1.5 rounded-lg flex-row items-center gap-1">
                <Icon name="receipt-long" size={14} color="#3d4a42" />
                <Text className="text-[10px] text-[#3d4a42] font-semibold">GST Rebate Calc</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Verified Feedback */}
        <View className="px-4 pt-4 pb-4 gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-bold text-[#131b2e]">Customer Verified Feedback</Text>
            <Text className="text-xs text-[#006948] font-bold">View all 1,420</Text>
          </View>

          <View className="bg-white p-3 rounded-2xl shadow-sm border border-[#eaedff] gap-1.5">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <View className="w-7 h-7 rounded-full bg-[#99efe5] justify-center items-center">
                  <Text className="text-[10px] font-bold text-[#006f67]">RK</Text>
                </View>
                <View>
                  <Text className="text-xs font-bold text-[#131b2e]">Rajesh K. (Hotel Apex)</Text>
                  <Text className="text-[9px] text-[#3d4a42]">Verified Facility Buyer • 50L Tier</Text>
                </View>
              </View>
              <View className="flex-row">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Icon key={i} name="star" size={12} color="#f59e0b" />
                ))}
              </View>
            </View>
            <Text className="text-[11px] text-[#3d4a42] italic leading-relaxed">
              "Replaced our traditional chlorine cleaner with this RS citrus enzymatic concentrate. No strong chemical odor in our lobby, leaves stone floors mirror-clean without residue."
            </Text>
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
              ₹{(basePrice * quantity).toLocaleString('en-IN')}
            </Text>
            <Text className="text-[10px] text-[#3d4a42]">({quantity} × {selectedSize})</Text>
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
