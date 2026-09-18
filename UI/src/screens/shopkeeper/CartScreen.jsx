import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RSLogo from '../../components/RSLogo';
import { useCartStore } from '../../store/cartStore';
import { useOrderStore } from '../../store/orderStore';

export default function CartScreen({ navigation }) {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const { addOrder } = useOrderStore();

  const [gstRequested, setGstRequested] = useState(true);
  const [couponApplied, setCouponApplied] = useState(true);
  const [floorCleanerQty, setFloorCleanerQty] = useState(1);
  const [disinfectantQty, setDisinfectantQty] = useState(2);

  const floorCleanerTotal = floorCleanerQty * 1700;
  const disinfectantTotal = disinfectantQty * 125;
  const itemsMRP = 2230;
  const bulkDiscount = 280;
  const couponDiscount = couponApplied ? 100 : 0;
  const totalPayable = floorCleanerTotal + disinfectantTotal - couponDiscount;
  const totalSavings = bulkDiscount + couponDiscount;

  const handleCheckout = () => {
    navigation.navigate('CheckoutPayment');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#faf8ff]">
      {/* Top Header */}
      <View className="bg-white border-b border-[#dae2fd] px-4 py-3 flex-row items-center justify-between shadow-sm">
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full bg-[#f2f3ff] justify-center items-center"
          >
            <Icon name="arrow-back" size={20} color="#131b2e" />
          </Pressable>
          <RSLogo size="sm" showText={false} />
          <Text className="text-base font-bold text-[#131b2e] ml-1">View Cart</Text>
        </View>

        <View className="flex-row items-center gap-2">
          <Pressable className="w-10 h-10 rounded-full bg-[#f2f3ff] justify-center items-center">
            <Icon name="help-outline" size={20} color="#3d4a42" />
          </Pressable>
          <Pressable className="w-9 h-9 rounded-full overflow-hidden border border-[#bccac0]">
            <Image
              source={{
                uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBRrN6w1MXsyfuCnCoFsD-GZsEKLYa-DZ3F2Se-uOklyZdfvA7pxYn5X6QU2im8oIgPpYxwfcuzrJ1lfhh38-tLS5SMbgLgVcnGNWMb2gYEGAQBk2bN7FEXnVqrj0Vzt-tuhn654b6uLqj2iyMWfSaMjLx82cqYgG-P8nBA6y8Rjkpo-SvvSQuyQM8zVuaqdLQYNXqCh53AbcqLYUc-wUS0x-U-rWULTOvUf_P1qAfvTtH3_f9Zs9X',
              }}
              className="w-full h-full"
            />
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Delivery & Speed Notice Bar */}
        <View className="px-4 pt-4">
          <View className="bg-white rounded-2xl p-3 shadow-sm flex-row items-center justify-between border border-[#eaedff]">
            <View className="flex-row items-center gap-3 flex-1">
              <View className="w-10 h-10 rounded-full bg-[#99efe5]/40 justify-center items-center">
                <Icon name="electric-moped" size={22} color="#006a63" />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center gap-1.5">
                  <Text className="text-[10px] font-bold text-[#006948] uppercase tracking-wider">
                    Fast Dispatch
                  </Text>
                  <View className="w-1.5 h-1.5 rounded-full bg-[#006948]" />
                  <Text className="text-[10px] text-[#3d4a42] font-semibold">25 Mins</Text>
                </View>
                <Text className="text-xs text-[#131b2e] font-medium" numberOfLines={1}>
                  Delivering to: <Text className="font-bold">Indiranagar, Bengaluru</Text>
                </Text>
              </View>
            </View>
            <Pressable className="bg-[#e2e7ff] px-3 py-1 rounded-full">
              <Text className="text-[11px] text-[#131b2e] font-bold">Change</Text>
            </Pressable>
          </View>
        </View>

        {/* Cart Header Sub-bar */}
        <View className="px-4 pt-4 pb-2 flex-row items-center justify-between">
          <View className="flex-row items-baseline gap-1.5">
            <Text className="text-base font-bold text-[#131b2e]">Your Shopping Cart</Text>
            <Text className="text-xs text-[#3d4a42] font-medium">(3 items)</Text>
          </View>
          <View className="flex-row items-center gap-1 bg-[#85f8c4]/30 px-2 py-0.5 rounded-full">
            <Icon name="verified" size={12} color="#006948" />
            <Text className="text-[10px] text-[#006948] font-bold">GST Verified</Text>
          </View>
        </View>

        {/* Cart Items Section */}
        <View className="px-4 gap-3">
          {/* Item 1 */}
          <View className="bg-white rounded-2xl p-3 shadow-sm border border-[#eaedff]">
            <View className="flex-row gap-3">
              <View className="w-20 h-20 rounded-xl bg-[#f2f3ff] overflow-hidden justify-center items-center relative">
                <Image
                  source={{
                    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAt744DfU_SwVjbIfNACgFfQilwpUMGzTRLEy8uhGxRLaS0JDUtZFvjDF4-Jp7uQFb68fUaKlD8G0xlrKNjDUnnWmIT-08iU9_sQ9dMAtmO8uVubcir9tFFMNC-E-Ep355YMFMIafUE5cEw-etVXI_-kfEwR8YOGvqqh2RtWV89JZdj9JS7j1vtUosFrvukCKGzc06Y8KXwOYIuXw3530L5IwzLx1NH4BhbhF5UiDLDAl21qAaQfCLs',
                  }}
                  className="w-full h-full"
                  resizeMode="contain"
                />
                <View className="absolute bottom-0 inset-x-0 bg-[#006948]/90 py-0.5">
                  <Text className="text-[9px] text-white text-center font-bold">Pack of 20</Text>
                </View>
              </View>

              <View className="flex-1 justify-between">
                <View>
                  <View className="flex-row items-start justify-between">
                    <Text className="text-xs font-bold text-[#131b2e] flex-1 pr-1" numberOfLines={1}>
                      Ultra-Clean Citrus Floor Cleaner
                    </Text>
                    <Pressable onPress={() => setFloorCleanerQty(0)}>
                      <Icon name="close" size={16} color="#3d4a42" />
                    </Pressable>
                  </View>
                  <Text className="text-[10px] text-[#3d4a42]">500ml Bottle • Institutional Grade</Text>
                </View>

                <View className="flex-row items-center gap-1.5 flex-wrap mt-1">
                  <View className="bg-[#99efe5]/50 px-2 py-0.5 rounded-full flex-row items-center gap-1">
                    <Icon name="savings" size={10} color="#006f67" />
                    <Text className="text-[10px] text-[#006f67] font-bold">₹85 / pc</Text>
                  </View>
                  <Text className="text-[10px] text-[#3d4a42] line-through">₹99/pc</Text>
                  <View className="bg-[#006948]/10 px-1.5 py-0.5 rounded">
                    <Text className="text-[9px] text-[#006948] font-bold">14% OFF</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Config & Stepper */}
            <View className="mt-3 pt-2 bg-[#f2f3ff]/50 p-2 rounded-xl flex-row items-center justify-between">
              <Pressable className="flex-row items-center gap-0.5">
                <Text className="text-[11px] text-[#006948] font-bold">Pack of 20 (20 × 500ml)</Text>
                <Icon name="keyboard-arrow-down" size={16} color="#006948" />
              </Pressable>

              <View className="flex-row items-center gap-3">
                <View className="flex-row items-center bg-[#006948] rounded-full px-1">
                  <Pressable
                    onPress={() => setFloorCleanerQty(Math.max(1, floorCleanerQty - 1))}
                    className="w-7 h-7 justify-center items-center"
                  >
                    <Icon name="remove" size={14} color="#ffffff" />
                  </Pressable>
                  <Text className="px-2 text-xs font-bold text-white">{floorCleanerQty}</Text>
                  <Pressable
                    onPress={() => setFloorCleanerQty(floorCleanerQty + 1)}
                    className="w-7 h-7 justify-center items-center"
                  >
                    <Icon name="add" size={14} color="#ffffff" />
                  </Pressable>
                </View>
                <View className="items-end">
                  <Text className="text-sm font-extrabold text-[#131b2e]">₹{floorCleanerTotal.toLocaleString('en-IN')}</Text>
                  <Text className="text-[9px] text-[#006948] font-bold">Saved ₹280</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Item 2 */}
          <View className="bg-white rounded-2xl p-3 shadow-sm border border-[#eaedff]">
            <View className="flex-row gap-3">
              <View className="w-20 h-20 rounded-xl bg-[#f2f3ff] overflow-hidden justify-center items-center relative">
                <Image
                  source={{
                    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjEhl2pk-G56mxpC8FLQOXXuOPwSVUQzqJVmfePzGlgPzFJcJhFpy2QVzQA9s35YGBS3w6Wm9qCQ9A3rmdfIYmQng4uyNF-lmlrrjLv1RCOc3r3iID0q7ijW4EOVEuSNXF7suOT7iVXrLiP8hdDmfrMOCMIaw0Ak5VeASut-ZIrRPg38e099i7lnIkQWhjQfV87Rd28N9g83ICKUxwX0yrw1gL5REw8oylW2pvPUjLOLhT_E0lTTz0',
                  }}
                  className="w-full h-full"
                  resizeMode="contain"
                />
                <View className="absolute bottom-0 inset-x-0 bg-[#d2d9f4]/80 py-0.5">
                  <Text className="text-[9px] text-[#131b2e] text-center font-bold">Single</Text>
                </View>
              </View>

              <View className="flex-1 justify-between">
                <View>
                  <View className="flex-row items-start justify-between">
                    <Text className="text-xs font-bold text-[#131b2e] flex-1 pr-1" numberOfLines={1}>
                      PowerShield Surface Disinfectant
                    </Text>
                    <Pressable onPress={() => setDisinfectantQty(0)}>
                      <Icon name="close" size={16} color="#3d4a42" />
                    </Pressable>
                  </View>
                  <Text className="text-[10px] text-[#3d4a42]">500ml Trigger Spray • 99.9% Shield</Text>
                </View>

                <View className="flex-row items-center gap-1.5 flex-wrap mt-1">
                  <Text className="text-[10px] text-[#131b2e] font-bold">₹125 / piece</Text>
                  <View className="bg-[#e2e7ff] px-1.5 py-0.5 rounded">
                    <Text className="text-[9px] text-[#3d4a42]">Standard MRP</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Config & Stepper */}
            <View className="mt-3 pt-2 bg-[#f2f3ff]/50 p-2 rounded-xl flex-row items-center justify-between">
              <Pressable className="flex-row items-center gap-0.5">
                <Text className="text-[11px] text-[#006948] font-bold">Single Unit (500ml)</Text>
                <Icon name="keyboard-arrow-down" size={16} color="#006948" />
              </Pressable>

              <View className="flex-row items-center gap-3">
                <View className="flex-row items-center bg-[#006948] rounded-full px-1">
                  <Pressable
                    onPress={() => setDisinfectantQty(Math.max(1, disinfectantQty - 1))}
                    className="w-7 h-7 justify-center items-center"
                  >
                    <Icon name="remove" size={14} color="#ffffff" />
                  </Pressable>
                  <Text className="px-2 text-xs font-bold text-white">{disinfectantQty}</Text>
                  <Pressable
                    onPress={() => setDisinfectantQty(disinfectantQty + 1)}
                    className="w-7 h-7 justify-center items-center"
                  >
                    <Icon name="add" size={14} color="#ffffff" />
                  </Pressable>
                </View>
                <View className="items-end">
                  <Text className="text-sm font-extrabold text-[#131b2e]">₹{disinfectantTotal}</Text>
                  <Text className="text-[9px] text-[#3d4a42]">2 × ₹125</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Tier Savings Recommendation / Bulk Volume Nudge Card */}
        <View className="px-4 pt-4">
          <View className="bg-[#85f8c4]/20 rounded-2xl p-3.5 border border-[#85f8c4] relative overflow-hidden">
            <View className="flex-row items-start gap-3">
              <View className="w-9 h-9 rounded-full bg-[#006948] justify-center items-center shadow-sm">
                <Icon name="trending-up" size={20} color="#ffffff" />
              </View>

              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <Text className="text-xs font-bold text-[#006948] uppercase">
                    Unlock Tier 2 Wholesale
                  </Text>
                  <View className="bg-[#006948] px-2 py-0.5 rounded-full">
                    <Text className="text-[9px] text-white font-extrabold">Save Extra ₹150</Text>
                  </View>
                </View>
                <Text className="text-[11px] text-[#131b2e] mt-1 leading-tight">
                  Add <Text className="font-bold">10 more bottles</Text> of Citrus Floor Cleaner to trigger{' '}
                  <Text className="font-bold text-[#006948]">₹80/piece</Text> instead of ₹85!
                </Text>

                {/* Progress bar */}
                <View className="mt-2 flex-row items-center gap-2">
                  <View className="flex-1 h-2 bg-[#e2e7ff] rounded-full overflow-hidden">
                    <View className="h-full bg-[#006948] rounded-full w-[66%]" />
                  </View>
                  <Pressable
                    onPress={() => setFloorCleanerQty(floorCleanerQty + 1)}
                    className="bg-[#006948] px-3 py-1.5 rounded-full flex-row items-center gap-1 shadow-sm"
                  >
                    <Icon name="add" size={12} color="#ffffff" />
                    <Text className="text-[10px] text-white font-bold">Add Now</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Active Applied Coupon Pill */}
        <View className="px-4 pt-3">
          <View className="bg-white rounded-2xl p-3 shadow-sm flex-row items-center justify-between border border-[#eaedff]">
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-full bg-[#99efe5] justify-center items-center">
                <Icon name="confirmation-number" size={18} color="#006f67" />
              </View>
              <View>
                <View className="flex-row items-center gap-1.5">
                  <Text className="text-xs font-extrabold text-[#131b2e]">RSBULK100</Text>
                  <View className="bg-[#006948]/10 px-1.5 rounded">
                    <Text className="text-[9px] text-[#006948] font-bold">Applied</Text>
                  </View>
                </View>
                <Text className="text-[10px] text-[#3d4a42]">₹100 Instant Bulk Procurement Off</Text>
              </View>
            </View>
            <Pressable onPress={() => setCouponApplied(!couponApplied)}>
              <Text className="text-xs text-[#ba1a1a] font-bold">
                {couponApplied ? 'Remove' : 'Apply'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Business GST Invoice Toggle Card */}
        <View className="px-4 pt-3">
          <Pressable
            onPress={() => setGstRequested(!gstRequested)}
            activeOpacity={0.9}
            className="bg-white rounded-2xl p-3 shadow-sm flex-row items-start gap-3 border border-[#eaedff]"
          >
            <View
              className={`w-5 h-5 rounded border mt-0.5 justify-center items-center ${
                gstRequested ? 'bg-[#006948] border-[#006948]' : 'border-[#6d7a72]'
              }`}
            >
              {gstRequested && <Icon name="check" size={14} color="#ffffff" />}
            </View>
            <View className="flex-1">
              <View className="flex-row items-center gap-1.5">
                <Text className="text-xs font-bold text-[#131b2e]">Request GST Tax Invoice</Text>
                <View className="bg-[#9cf2e8] px-1.5 rounded">
                  <Text className="text-[9px] text-[#00201d] font-bold">B2B ITC</Text>
                </View>
              </View>
              <Text className="text-[10px] text-[#3d4a42] mt-0.5 leading-relaxed">
                Claim 18% Input Tax Credit on this purchase. GSTIN registered to RS Industries Ltd (29AABCU9603R1ZM).
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Bill Details Breakdown Card */}
        <View className="px-4 pt-4 pb-4">
          <View className="bg-white rounded-2xl p-4 shadow-sm border border-[#eaedff] gap-2.5">
            <View className="flex-row items-center justify-between pb-1 border-b border-[#f2f3ff]">
              <Text className="text-base font-bold text-[#131b2e]">Bill Details</Text>
              <Text className="text-[10px] text-[#3d4a42] font-semibold uppercase">INR Summary</Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-xs text-[#3d4a42]">Items Total (MRP)</Text>
              <Text className="text-xs text-[#131b2e] font-semibold">₹{itemsMRP.toLocaleString('en-IN')}</Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-xs text-[#006948] font-medium">Bulk Quantity Discount</Text>
              <Text className="text-xs text-[#006948] font-bold">-₹{bulkDiscount}</Text>
            </View>

            {couponApplied && (
              <View className="flex-row justify-between">
                <Text className="text-xs text-[#006948] font-medium">Coupon Savings (RSBULK100)</Text>
                <Text className="text-xs text-[#006948] font-bold">-₹100</Text>
              </View>
            )}

            <View className="flex-row justify-between">
              <View className="flex-row items-center gap-1">
                <Text className="text-xs text-[#3d4a42]">Delivery Fee</Text>
                <View className="bg-[#006948]/10 px-1 rounded">
                  <Text className="text-[9px] text-[#006948] font-bold">Orders above ₹499</Text>
                </View>
              </View>
              <View className="flex-row items-center gap-1">
                <Text className="text-[10px] text-[#3d4a42] line-through">₹60</Text>
                <Text className="text-xs text-[#006948] font-bold">FREE</Text>
              </View>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-xs text-[#3d4a42]">Packaging & Drum Handling</Text>
              <Text className="text-xs text-[#131b2e] font-semibold">₹0</Text>
            </View>

            <View className="h-px bg-[#eaedff] my-1" />

            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-sm font-extrabold text-[#131b2e]">Total Payable</Text>
                <Text className="text-[10px] text-[#3d4a42]">Inclusive of all taxes & GST</Text>
              </View>
              <Text className="text-xl font-extrabold text-[#131b2e]">
                ₹{totalPayable.toLocaleString('en-IN')}
              </Text>
            </View>

            <View className="mt-1 bg-[#006948]/10 p-2.5 rounded-xl flex-row items-center justify-center gap-1.5">
              <Icon name="celebration" size={16} color="#006948" />
              <Text className="text-xs font-bold text-[#006948]">
                You are saving ₹{totalSavings} on this order!
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Dock */}
      <View className="absolute bottom-0 inset-x-0 bg-white border-t border-[#dae2fd] px-4 py-3 shadow-xl flex-row items-center justify-between gap-3">
        <View>
          <View className="flex-row items-baseline gap-1">
            <Text className="text-xl font-extrabold text-[#131b2e]">
              ₹{totalPayable.toLocaleString('en-IN')}
            </Text>
            <Text className="text-[10px] text-[#3d4a42] line-through">₹{itemsMRP}</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Text className="text-[10px] text-[#006948] font-bold">Saved ₹{totalSavings}</Text>
            <View className="w-1 h-1 rounded-full bg-[#006948]" />
            <Text className="text-[10px] text-[#3d4a42]">3 items</Text>
          </View>
        </View>

        <Pressable
          activeOpacity={0.9}
          onPress={handleCheckout}
          className="flex-1 h-12 bg-[#006948] rounded-xl flex-row items-center justify-center gap-1.5 shadow-md"
        >
          <Text className="text-sm font-bold text-white">Proceed to Checkout</Text>
          <Icon name="arrow-forward" size={18} color="#ffffff" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
