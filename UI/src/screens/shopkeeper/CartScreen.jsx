import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RSLogo from '../../components/RSLogo';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';

export default function CartScreen({ navigation }) {
  const { session } = useAuthStore();
  const { clearCart } = useCartStore();

  const [gstRequested, setGstRequested] = useState(true);
  const [couponApplied] = useState(false);
  const [floorCleanerQty, setFloorCleanerQty] = useState(1);
  const [disinfectantQty, setDisinfectantQty] = useState(2);

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

  const floorCleanerTotal = floorCleanerQty * 1700;
  const disinfectantTotal = disinfectantQty * 125;
  const itemsMRP = 2230;
  const bulkDiscount = 280;
  const couponDiscount = couponApplied ? 100 : 0;
  const totalPayable = floorCleanerTotal + disinfectantTotal - couponDiscount;
  const totalSavings = bulkDiscount + couponDiscount;

  const handleCheckout = () => {
    if (!session) {
      Alert.alert(
        'Login Required',
        'Please log in or create an account to proceed to checkout.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Log In / Register',
            onPress: () => navigation.navigate('Login', { returnScreen: 'CheckoutPayment' }),
          },
        ]
      );
      return;
    }
    navigation.navigate('CheckoutPayment');
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-[#faf8ff]">
      {/* Top Header */}
      <View className="bg-white border-b border-[#dae2fd] px-4 py-3 flex-row items-center justify-between shadow-sm z-10">
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
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            className="w-9 h-9 rounded-full bg-[#f2f3ff] justify-center items-center border border-[#dae2fd]"
          >
            <Icon name="arrow-back" size={20} color="#131b2e" />
          </TouchableOpacity>
          <RSLogo size="sm" showText={false} />
          <Text className="text-base font-bold text-[#131b2e] ml-1">View Cart</Text>
        </View>

        <View className="flex-row items-center gap-2">
          <TouchableOpacity activeOpacity={0.7} className="w-9 h-9 rounded-full bg-[#f2f3ff] justify-center items-center border border-[#dae2fd]">
            <Icon name="help-outline" size={20} color="#3d4a42" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
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
                  <View className="w-1 h-1 rounded-full bg-[#006948]" />
                  <Text className="text-[10px] text-[#006f67] font-semibold">25 Mins to Hub</Text>
                </View>
                <Text className="text-xs font-bold text-[#131b2e]">
                  Dispatching to Indiranagar Store #4
                </Text>
              </View>
            </View>
            <TouchableOpacity activeOpacity={0.7} className="px-2.5 py-1 bg-[#f2f3ff] rounded-lg">
              <Text className="text-xs font-bold text-[#006948]">Change</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* B2B Cart Items */}
        <View className="px-4 pt-3">
          <View className="bg-white rounded-2xl p-4 shadow-sm border border-[#eaedff]">
            <View className="flex-row justify-between items-center pb-3 border-b border-[#f2f3ff]">
              <Text className="text-xs font-extrabold text-[#131b2e] uppercase tracking-wider">
                Cart Items (2 SKUs)
              </Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => clearCart()}>
                <Text className="text-xs font-bold text-[#ba1a1a]">Clear Cart</Text>
              </TouchableOpacity>
            </View>

            {/* Item 1 */}
            <View className="py-3 border-b border-[#f2f3ff] flex-row gap-3">
              <View className="w-16 h-16 rounded-xl bg-[#f2f3ff] justify-center items-center p-1 border border-[#eaedff]">
                <Image
                  source={{
                    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCNr66zlhIrUzGurptkQYA93OEcc1VXgahlM0JmA9InCJ5rctZ9LPlbSqKW9fyIn2_fxSCMsqGRkevrp7nz_q7tgLC54K6avCWzJf3cakk1BW7pW_ZAfSAh236c2jX-FlvFGyOUYW2JjWHwCTZjA_CTo2mwx7N2IHZPmWju2U6rmSgu-p8xmxHftLVHGWFWMQYAr-M1lnB7jGJZM6zomx7eff2qIizM7_yTELQsxDNP58neTP3xdD4P',
                  }}
                  className="w-full h-full"
                  resizeMode="contain"
                />
              </View>
              <View className="flex-1 justify-between">
                <View>
                  <Text className="text-xs font-bold text-[#131b2e]">
                    RS Pro Citrus Floor Cleaner (5L Bucket)
                  </Text>
                  <Text className="text-[10px] text-[#3d4a42]">
                    Industrial Grade • Bulk Barrel Formulation
                  </Text>
                </View>

                <View className="flex-row justify-between items-end mt-2">
                  <View>
                    <Text className="text-xs font-extrabold text-[#131b2e]">
                      ₹{floorCleanerTotal}
                    </Text>
                    <Text className="text-[9px] text-[#006948] font-semibold">Tier Rate: ₹1,700/unit</Text>
                  </View>

                  <View className="h-7 bg-[#006948] rounded-lg flex-row items-center px-1">
                    <TouchableOpacity
                      onPress={() => setFloorCleanerQty(Math.max(1, floorCleanerQty - 1))}
                      activeOpacity={0.7}
                      className="w-6 h-full justify-center items-center"
                    >
                      <Icon name="remove" size={14} color="#ffffff" />
                    </TouchableOpacity>
                    <Text className="px-2 text-xs font-bold text-white">{floorCleanerQty}</Text>
                    <TouchableOpacity
                      onPress={() => setFloorCleanerQty(floorCleanerQty + 1)}
                      activeOpacity={0.7}
                      className="w-6 h-full justify-center items-center"
                    >
                      <Icon name="add" size={14} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {/* Item 2 */}
            <View className="py-3 flex-row gap-3">
              <View className="w-16 h-16 rounded-xl bg-[#f2f3ff] justify-center items-center p-1 border border-[#eaedff]">
                <Image
                  source={{
                    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5hqxVZb8BQ6Oe46KWidiOLut43Pum3zC3-lJtEJfOXhXiLqWWMqdnqU7RYaEMcUBFpdpSePhDEXYyICHqNuIeWDk6jacFoAWkNcoc_0f-XJDeD7xRJiiSalNqLgbn6REwgwHQWvN1LDFG1iffMiK4cma4hYi7CPIaiDt3f2uaLh1uyjPadJnMvH_0gBbaQgqxY1BmTu433rKnoA0uLvaitQE6hOFZ5DTh1cyefo517XoRAJU4pEtF',
                  }}
                  className="w-full h-full"
                  resizeMode="contain"
                />
              </View>
              <View className="flex-1 justify-between">
                <View>
                  <Text className="text-xs font-bold text-[#131b2e]">
                    Active Bleach 10X Sanitizer (1L Bottle)
                  </Text>
                  <Text className="text-[10px] text-[#3d4a42]">
                    High Surface Contact Cleaner
                  </Text>
                </View>

                <View className="flex-row justify-between items-end mt-2">
                  <View>
                    <Text className="text-xs font-extrabold text-[#131b2e]">
                      ₹{disinfectantTotal}
                    </Text>
                    <Text className="text-[9px] text-[#006948] font-semibold">Base Rate: ₹125/unit</Text>
                  </View>

                  <View className="h-7 bg-[#006948] rounded-lg flex-row items-center px-1">
                    <TouchableOpacity
                      onPress={() => setDisinfectantQty(Math.max(1, disinfectantQty - 1))}
                      activeOpacity={0.7}
                      className="w-6 h-full justify-center items-center"
                    >
                      <Icon name="remove" size={14} color="#ffffff" />
                    </TouchableOpacity>
                    <Text className="px-2 text-xs font-bold text-white">{disinfectantQty}</Text>
                    <TouchableOpacity
                      onPress={() => setDisinfectantQty(disinfectantQty + 1)}
                      activeOpacity={0.7}
                      className="w-6 h-full justify-center items-center"
                    >
                      <Icon name="add" size={14} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* GST Invoice Toggle */}
        <View className="px-4 pt-3">
          <View className="bg-white rounded-2xl p-4 shadow-sm border border-[#eaedff] flex-row items-center justify-between">
            <View className="flex-row items-center gap-3 flex-1 pr-2">
              <View className="w-10 h-10 rounded-full bg-[#99efe5]/40 justify-center items-center">
                <Icon name="receipt" size={20} color="#006f67" />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-bold text-[#131b2e]">GST Invoice Claim (18% Input Tax)</Text>
                <Text className="text-[10px] text-[#3d4a42]">GSTIN: 29AAAAA0000A1Z5 registered</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => setGstRequested(!gstRequested)}
              activeOpacity={0.7}
              className={`w-6 h-6 rounded-md items-center justify-center border ${
                gstRequested ? 'bg-[#006948] border-[#006948]' : 'bg-white border-[#bccac0]'
              }`}
            >
              {gstRequested && <Icon name="check" size={16} color="#ffffff" />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Bill Summary */}
        <View className="px-4 pt-3">
          <View className="bg-white rounded-2xl p-4 shadow-sm border border-[#eaedff]">
            <Text className="text-xs font-extrabold text-[#131b2e] uppercase tracking-wider pb-2 border-b border-[#f2f3ff]">
              Payment Summary
            </Text>

            <View className="py-2.5 gap-2 border-b border-[#f2f3ff]">
              <View className="flex-row justify-between">
                <Text className="text-xs text-[#3d4a42]">Items Total (MRP)</Text>
                <Text className="text-xs text-[#131b2e] font-bold">₹{itemsMRP}</Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-xs text-[#006948] font-bold">Tier Discount</Text>
                <Text className="text-xs text-[#006948] font-bold">-₹{bulkDiscount}</Text>
              </View>

              {couponApplied && (
                <View className="flex-row justify-between">
                  <Text className="text-xs text-[#006948] font-bold">Wholesale Promo (RSBULK100)</Text>
                  <Text className="text-xs text-[#006948] font-bold">-₹100</Text>
                </View>
              )}

              <View className="flex-row justify-between">
                <Text className="text-xs text-[#3d4a42]">Estimated GST (18% Claimable)</Text>
                <Text className="text-xs text-[#131b2e] font-bold">₹{Math.round(totalPayable * 0.18)}</Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-xs text-[#3d4a42]">Delivery & Handling</Text>
                <Text className="text-xs text-[#006948] font-bold">FREE</Text>
              </View>
            </View>

            <View className="pt-3 flex-row justify-between items-center">
              <View>
                <Text className="text-sm font-extrabold text-[#131b2e]">Total Amount</Text>
                <Text className="text-[10px] text-[#006948] font-bold">You Save ₹{totalSavings}</Text>
              </View>
              <Text className="text-lg font-black text-[#131b2e]">
                ₹{totalPayable.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Checkout Bottom Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#dae2fd] p-4 flex-row items-center justify-between shadow-xl z-30">
        <View>
          <Text className="text-[10px] text-[#3d4a42] font-semibold uppercase">Net Payable</Text>
          <Text className="text-lg font-black text-[#131b2e]">₹{totalPayable.toLocaleString('en-IN')}</Text>
        </View>

        <TouchableOpacity
          onPress={handleCheckout}
          activeOpacity={0.85}
          className="bg-[#006948] px-6 py-3 rounded-xl flex-row items-center gap-2 shadow-md active:bg-[#005238]"
        >
          <Text className="text-xs font-bold text-white uppercase tracking-wider">Proceed to Checkout</Text>
          <Icon name="arrow-forward" size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
