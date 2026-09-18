import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RSLogo from '../../components/RSLogo';
import { useCartStore } from '../../store/cartStore';

export default function BulkPriceOptimizerScreen({ navigation }) {
  const { addItem } = useCartStore();

  const [quantity, setQuantity] = useState(25);
  const baseMRP = 99.0;

  const tiers = [
    { id: 1, min: 1, max: 10, price: 99.0, title: 'Tier 1 · Starter Pack', range: '1 – 10 units', short: 'Tier 1 Active' },
    { id: 2, min: 11, max: 20, price: 90.0, title: 'Tier 2 · Small Business', range: '11 – 20 units', short: 'Tier 2 Active' },
    { id: 3, min: 21, max: 50, price: 85.0, title: 'Tier 3 · Facility Supply', range: '21 – 50 units', short: 'Tier 3 Active' },
    { id: 4, min: 51, max: 100, price: 80.0, title: 'Tier 4 · Enterprise Pro', range: '51 – 100 units', short: 'Tier 4 Active' },
    { id: 5, min: 101, max: 999, price: 75.0, title: 'Tier 5 · Factory Direct', range: '101+ units', short: 'Tier 5 Active' },
  ];

  const getCurrentTier = (qty) => {
    for (let i = 0; i < tiers.length; i++) {
      if (qty >= tiers[i].min && qty <= tiers[i].max) {
        return { current: tiers[i], index: i, next: tiers[i + 1] || null };
      }
    }
    return { current: tiers[0], index: 0, next: tiers[1] };
  };

  const { current: activeTier, next: nextTier } = getCurrentTier(quantity);
  const currentRate = activeTier.price;
  const subtotal = quantity * currentRate;
  const originalMRP = quantity * baseMRP;
  const totalSavings = originalMRP - subtotal;

  const handleAddBulkToCart = () => {
    addItem({
      _id: `bulk-opt-${quantity}`,
      name: `RS Pro Citrus Floor Cleaner (${quantity} units)`,
      price: currentRate,
      quantity: quantity,
    });
    navigation.navigate('Cart');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#faf8ff]">
      {/* Top Header Bar */}
      <View className="bg-white border-b border-[#dae2fd] px-4 py-3 flex-row items-center justify-between shadow-sm">
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full bg-[#f2f3ff] justify-center items-center"
          >
            <Icon name="arrow-back" size={20} color="#131b2e" />
          </Pressable>
          <RSLogo size="sm" showText={false} />
          <Text className="text-base font-bold text-[#131b2e] ml-1">Bulk Price Optimizer</Text>
        </View>

        <Pressable className="w-10 h-10 rounded-full bg-[#f2f3ff] justify-center items-center">
          <Icon name="help-outline" size={20} color="#3d4a42" />
        </Pressable>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Banner Context */}
        <View className="px-4 pt-4">
          <View className="flex-row items-center gap-1 mb-1">
            <Icon name="calculate" size={16} color="#006948" />
            <Text className="text-[10px] text-[#006948] font-bold uppercase tracking-wider">
              Bulk Price Optimizer
            </Text>
          </View>
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text className="text-base font-extrabold text-[#131b2e]">Choose Your Custom Quantity</Text>
              <Text className="text-xs text-[#3d4a42]">RS Pro Citrus Floor Cleaner (500ml)</Text>
            </View>
            <View className="w-12 h-12 rounded-xl bg-[#f2f3ff] p-1 border border-[#eaedff]">
              <Image
                source={{
                  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0ACmUFKmNKfoOxx7HcR56859XquEGCQO-fRkDnHy9t2Gdv4p_WhUwP8rYkfQHfgPxW4bvpfjAoVFuXA-Wl_IKykcmUJ3yvDuf_fCEA3iqAydAxQjdNF5T5qUrCJmOOhUIOqARiy5_oQKK-A-JCGGjShxRM2d0czTWrnQtWWYSJK3wCmWBp_9LLI5itwSxrrjSOvus__SnA2qZYeF5Ug0mcnR-gYtQi9hfBeraY-ghuIjuYmUysDD9',
                }}
                className="w-full h-full"
                resizeMode="contain"
              />
            </View>
          </View>
        </View>

        {/* Counter & Presets Card */}
        <View className="px-4 pt-4">
          <View className="bg-white p-4 rounded-2xl shadow-md border border-[#eaedff] gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-xs text-[#3d4a42] font-semibold">Selected Quantity</Text>
              <View className="bg-[#99efe5] px-2.5 py-0.5 rounded-full flex-row items-center gap-1">
                <Icon name="verified" size={12} color="#006f67" />
                <Text className="text-[10px] text-[#006f67] font-bold">{activeTier.short}</Text>
              </View>
            </View>

            {/* Large Counter */}
            <View className="flex-row items-center justify-between bg-[#f2f3ff] p-2 rounded-2xl">
              <Pressable
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 rounded-xl bg-white justify-center items-center shadow-sm"
              >
                <Icon name="remove" size={20} color="#131b2e" />
              </Pressable>

              <View className="flex-1 items-center py-1">
                <View className="flex-row items-baseline gap-1">
                  <TextInput
                    value={String(quantity)}
                    onChangeText={(val) => setQuantity(Math.max(1, parseInt(val, 10) || 1))}
                    keyboardType="numeric"
                    className="w-20 text-center font-extrabold text-2xl text-[#006948]"
                  />
                  <Text className="text-xs font-bold text-[#3d4a42]">units</Text>
                </View>
                <Text className="text-[9px] text-[#6d7a72]">Tap number to type</Text>
              </View>

              <Pressable
                onPress={() => setQuantity(quantity + 1)}
                className="w-12 h-12 rounded-xl bg-[#006948] justify-center items-center shadow-sm"
              >
                <Icon name="add" size={20} color="#ffffff" />
              </Pressable>
            </View>

            {/* Presets Horizontal Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pt-1">
              {[5, 15, 25, 60, 120].map((preset) => {
                const isActive = quantity === preset;
                return (
                  <Pressable
                    key={preset}
                    onPress={() => setQuantity(preset)}
                    className={`px-3 py-1.5 rounded-full mr-2 ${
                      isActive ? 'bg-[#006948]' : 'bg-[#eaedff]'
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        isActive ? 'text-white' : 'text-[#3d4a42]'
                      }`}
                    >
                      {preset} pcs
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>

        {/* Dynamic Pricing Calculation Card */}
        <View className="px-4 pt-3">
          <View className="bg-white p-4 rounded-2xl shadow-md border border-[#eaedff] gap-3 relative overflow-hidden">
            <View className="flex-row items-start justify-between">
              <View>
                <Text className="text-[10px] text-[#6d7a72] font-bold uppercase tracking-wider">
                  Rate Applied
                </Text>
                <View className="flex-row items-baseline gap-1 mt-0.5">
                  <Text className="text-xl font-extrabold text-[#006948]">
                    ₹{currentRate.toFixed(2)}
                  </Text>
                  <Text className="text-[10px] text-[#3d4a42]">/ piece</Text>
                </View>
              </View>

              <View className="items-end">
                <Text className="text-[10px] text-[#6d7a72] font-bold uppercase tracking-wider">
                  Calculated Subtotal
                </Text>
                <View className="flex-row items-baseline gap-1.5 mt-0.5">
                  <Text className="text-xs text-[#6d7a72] line-through">
                    ₹{originalMRP.toLocaleString('en-IN')}
                  </Text>
                  <Text className="text-xl font-extrabold text-[#131b2e]">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
            </View>

            {/* Celebratory Banner */}
            <View className="bg-[#006948]/10 p-3 rounded-xl flex-row items-center gap-2">
              <View className="w-7 h-7 rounded-full bg-[#006948] justify-center items-center">
                <Icon name="celebration" size={16} color="#ffffff" />
              </View>
              <Text className="text-xs text-[#006948] flex-1 leading-snug">
                You unlocked <Text className="font-bold">{activeTier.title.split('·')[0]}</Text> pricing!
                Total Savings: <Text className="font-bold">₹{totalSavings.toLocaleString('en-IN')}</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Wholesale Volume Step Ladder */}
        <View className="px-4 pt-4 gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-bold text-[#131b2e]">Wholesale Volume Ladder</Text>
            <Text className="text-xs text-[#006948] font-bold">Auto-Applies</Text>
          </View>

          <View className="bg-white p-3 rounded-2xl shadow-sm border border-[#eaedff] gap-2">
            {tiers.map((t) => {
              const isActive = activeTier.id === t.id;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => setQuantity(t.min)}
                  className={`p-2.5 rounded-xl flex-row items-center justify-between border ${
                    isActive
                      ? 'bg-[#006948]/10 border-[#006948]'
                      : 'bg-[#f2f3ff] border-transparent'
                  }`}
                >
                  <View className="flex-row items-center gap-2.5">
                    <View
                      className={`w-7 h-7 rounded-full justify-center items-center ${
                        isActive ? 'bg-[#006948]' : 'bg-[#e2e7ff]'
                      }`}
                    >
                      {isActive ? (
                        <Icon name="check" size={14} color="#ffffff" />
                      ) : (
                        <Text className="text-xs text-[#6d7a72] font-bold">{t.id}</Text>
                      )}
                    </View>
                    <View>
                      <View className="flex-row items-center gap-1.5">
                        <Text
                          className={`text-xs font-bold ${
                            isActive ? 'text-[#006948]' : 'text-[#131b2e]'
                          }`}
                        >
                          {t.title}
                        </Text>
                        {isActive && (
                          <View className="bg-[#006948] px-1 rounded">
                            <Text className="text-[8px] text-white font-bold">ACTIVE</Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-[10px] text-[#3d4a42]">{t.range}</Text>
                    </View>
                  </View>

                  <View className="items-end">
                    <Text
                      className={`text-xs font-bold ${
                        isActive ? 'text-[#006948]' : 'text-[#131b2e]'
                      }`}
                    >
                      ₹{t.price.toFixed(2)}
                    </Text>
                    <Text className="text-[9px] text-[#6d7a72]">/ pc</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Smart Upsell Banner */}
        {nextTier && (
          <View className="px-4 pt-3">
            <View className="bg-[#99efe5]/50 p-3.5 rounded-2xl flex-row items-start gap-2.5 border border-[#99efe5]">
              <Icon name="lightbulb" size={20} color="#006f67" />
              <View className="flex-1">
                <Text className="text-xs font-bold text-[#00201d]">Smart Bulk Optimization</Text>
                <Text className="text-[11px] text-[#00504a] mt-0.5 leading-snug">
                  Add {nextTier.min - quantity} more units to reach {nextTier.min} units and unlock ₹{nextTier.price.toFixed(2)}/piece!
                </Text>
                <Pressable
                  onPress={() => setQuantity(nextTier.min)}
                  className="mt-2 bg-[#006a63] px-3 py-1.5 rounded-full flex-row items-center gap-1 self-start shadow-sm"
                >
                  <Text className="text-[10px] text-white font-bold">Add {nextTier.min - quantity} Units</Text>
                  <Icon name="north-east" size={12} color="#ffffff" />
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* B2B Notice & Trust */}
        <View className="px-4 pt-4 gap-2">
          <View className="bg-[#f2f3ff] p-3 rounded-2xl flex-row items-center gap-3">
            <View className="w-9 h-9 rounded-xl bg-white justify-center items-center shadow-sm">
              <Icon name="receipt-long" size={20} color="#006948" />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-semibold text-[#131b2e]">18% Input Tax Credit (ITC)</Text>
              <Text className="text-[10px] text-[#3d4a42]">
                Enter corporate GSTIN at checkout for RS Industries GST invoice.
              </Text>
            </View>
          </View>

          <View className="flex-row gap-2 mt-1">
            <View className="flex-1 bg-white p-2.5 rounded-xl flex-row items-center gap-1.5 shadow-sm border border-[#eaedff]">
              <Icon name="science" size={16} color="#006948" />
              <Text className="text-[10px] text-[#131b2e] font-medium">Industrial Efficacy</Text>
            </View>
            <View className="flex-1 bg-white p-2.5 rounded-xl flex-row items-center gap-1.5 shadow-sm border border-[#eaedff]">
              <Icon name="local-shipping" size={16} color="#006a63" />
              <Text className="text-[10px] text-[#131b2e] font-medium">Dispatch in 24 Hrs</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Dock */}
      <View className="absolute bottom-0 inset-x-0 bg-white border-t border-[#dae2fd] px-4 py-3 shadow-xl z-40">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-[10px] text-[#3d4a42]">Instant Tier Savings Computed</Text>
          <Text className="text-[10px] text-[#006948] font-bold">Saved ₹{totalSavings} on MRP</Text>
        </View>

        <Pressable
          activeOpacity={0.9}
          onPress={handleAddBulkToCart}
          className="h-12 bg-[#006948] rounded-xl flex-row items-center justify-between px-4 shadow-md"
        >
          <View className="flex-row items-center gap-2">
            <Icon name="shopping-cart" size={20} color="#ffffff" />
            <Text className="text-xs font-bold text-white">Add {quantity} units to Cart</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Text className="text-base font-extrabold text-white">₹{subtotal.toLocaleString('en-IN')}</Text>
            <Icon name="arrow-forward" size={18} color="#ffffff" />
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
