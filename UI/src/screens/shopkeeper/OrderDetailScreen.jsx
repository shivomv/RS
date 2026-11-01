import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, Linking, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RSLogo from '../../components/RSLogo';
import { api } from '../../services/api';

export default function OrderDetailScreen({ route, navigation }) {
  const { order } = route.params || {};
  const [currentOrder, setCurrentOrder] = useState(order);
  const [cancelling, setCancelling] = useState(false);

  if (!currentOrder) {
    return (
      <SafeAreaView className="flex-1 bg-[#faf8ff] justify-center items-center px-6">
        <Icon name="receipt-long" size={64} color="#6d7a72" />
        <Text className="text-base font-bold text-[#131b2e] mt-4">Order Not Found</Text>
        <Text className="text-xs text-[#6d7a72] text-center mt-1 mb-6">
          The requested order details could not be retrieved.
        </Text>
        <Pressable
          onPress={() => navigation.goBack()}
          className="bg-[#006948] px-6 py-2.5 rounded-xl active:opacity-80"
        >
          <Text className="text-xs text-white font-bold">Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const orderData = currentOrder;
  const orderId = orderData.orderId || orderData._id || orderData.id || 'N/A';
  const orderDate = orderData.date || (orderData.createdAt ? new Date(orderData.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '');

  const handleDownloadInvoice = () => {
    const url = api.getOrderInvoiceUrl(orderId);
    Linking.openURL(url).catch(() => {
      Alert.alert('Invoice', `Viewing official GST Tax Invoice for Order #${orderId}`);
    });
  };

  const handleCancelOrder = () => {
    Alert.alert(
      'Cancel Order',
      `Are you sure you want to cancel Order #${orderId}? Stock will be released back to factory inventory.`,
      [
        { text: 'Keep Order', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setCancelling(true);
            try {
              const res = await api.cancelOrder(orderId, 'Cancelled by customer');
              if (res.success) {
                Alert.alert('Order Cancelled', 'Your order was successfully cancelled.');
                setCurrentOrder((prev) => ({ ...prev, status: 'cancelled' }));
              }
            } catch (err) {
              Alert.alert('Cancellation Failed', err.message || 'Unable to cancel order.');
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  // Build real dynamic status events
  const historyEvents = Array.isArray(orderData.statusHistory) && orderData.statusHistory.length > 0
    ? orderData.statusHistory
    : [
        {
          status: 'pending',
          timestamp: orderData.createdAt,
          note: 'Order placed via Cash on Delivery (COD)',
        },
      ];

  const st = String(orderData.status || 'pending').toLowerCase();
  const isCancellable = st === 'pending' || st === 'confirmed';

  return (
    <SafeAreaView className="flex-1 bg-[#faf8ff]">
      {/* Header */}
      <View className="bg-white border-b border-[#dae2fd] px-4 py-3 flex-row items-center justify-between shadow-sm">
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => navigation.goBack()}
            className="w-9 h-9 rounded-full bg-[#f2f3ff] justify-center items-center active:opacity-70"
          >
            <Icon name="arrow-back" size={20} color="#131b2e" />
          </Pressable>
          <View>
            <Text className="text-base font-bold text-[#131b2e]">Order #{orderId}</Text>
            {orderDate ? <Text className="text-[10px] text-[#6d7a72]">{orderDate}</Text> : null}
          </View>
        </View>
        <RSLogo size="sm" showText={false} />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Live Delivery Status Timeline */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-[#eaedff]">
          <View className="flex-row items-center justify-between mb-3 pb-2 border-b border-[#f2f3ff]">
            <View className="flex-row items-center gap-1.5">
              <Icon name="local-shipping" size={20} color="#006948" />
              <Text className="text-sm font-bold text-[#131b2e]">Order Status Timeline</Text>
            </View>
            <View className={`px-2.5 py-0.5 rounded-full ${st === 'cancelled' ? 'bg-red-100' : 'bg-[#85f8c4]'}`}>
              <Text className={`text-[10px] font-bold uppercase ${st === 'cancelled' ? 'text-red-700' : 'text-[#002114]'}`}>
                {orderData.status || 'Pending'}
              </Text>
            </View>
          </View>

          {/* Dynamic Event History */}
          <View className="pl-2">
            {historyEvents.map((step, idx) => {
              const stepTime = step.timestamp
                ? new Date(step.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                : '';
              const isLast = idx === historyEvents.length - 1;

              return (
                <View key={idx} className="flex-row items-start mb-3 relative">
                  {!isLast && (
                    <View className="absolute left-2.5 top-5 bottom-0 w-0.5 bg-[#006948]" />
                  )}
                  <View className="w-5 h-5 rounded-full justify-center items-center z-10 bg-[#006948]">
                    <Icon name="check" size={12} color="#ffffff" />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-xs font-bold text-[#131b2e] uppercase">
                      {step.status}
                    </Text>
                    <Text className="text-[10px] text-[#3d4a42]">{step.note || 'Status updated'}</Text>
                    {stepTime ? <Text className="text-[9px] text-[#6d7a72]">{stepTime}</Text> : null}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Assigned Dispatch Partner */}
        <View className="bg-[#e2e7ff] rounded-2xl p-3.5 mb-4 flex-row items-center justify-between shadow-sm">
          <View className="flex-row items-center gap-3 flex-1 mr-2">
            <View className="w-10 h-10 rounded-full bg-[#006948] justify-center items-center">
              <Icon name="person" size={22} color="#ffffff" />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-bold text-[#131b2e]">
                {orderData.driverName || 'Dispatch Partner Pending Assignment'}
              </Text>
              <Text className="text-[10px] text-[#3d4a42]">
                {orderData.driverName ? 'Express Wholesale Delivery Representative' : 'Will be assigned upon warehouse dispatch'}
              </Text>
            </View>
          </View>
          {orderData.driverPhone ? (
            <Pressable
              onPress={() => Alert.alert('Contact Delivery Partner', `Call ${orderData.driverPhone}?`)}
              className="bg-[#006948] px-3 py-1.5 rounded-lg flex-row items-center gap-1 active:opacity-80"
            >
              <Icon name="call" size={14} color="#ffffff" />
              <Text className="text-[10px] text-white font-bold">Call</Text>
            </Pressable>
          ) : null}
        </View>

        {/* Delivery Address Snapshot */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-[#eaedff]">
          <View className="flex-row items-center gap-1.5 mb-1.5">
            <Icon name="location-on" size={18} color="#006948" />
            <Text className="text-xs font-bold text-[#131b2e]">Delivery Destination (Snapshot)</Text>
          </View>
          <Text className="text-xs text-[#3d4a42] leading-relaxed">
            {orderData.deliveryAddressSnapshot?.fullAddress || orderData.deliveryAddress || 'Factory Pickup / Local Delivery'}
          </Text>
        </View>

        {/* Itemized Product Snapshot Breakdown */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-[#eaedff]">
          <Text className="text-xs font-bold text-[#131b2e] mb-3">
            Items Ordered ({orderData.items?.length || 0}) • Verified Wholesale Snapshot
          </Text>

          {(orderData.items || []).map((item, idx) => {
            const itemQty = item.qty || item.quantity || 1;
            const itemPrice = item.unitPrice || item.price || 99;
            const lineTotal = item.lineTotal || (itemPrice * itemQty);
            const subTitleText = item.bundleLabel || item.subtitle || item.size || '';

            return (
              <View key={item.id || item._id || idx} className="flex-row items-center justify-between py-2 border-b border-[#f2f3ff]">
                <View className="flex-1 pr-2">
                  <Text className="text-xs font-bold text-[#131b2e]">{item.name || 'Product'}</Text>
                  <Text className="text-[10px] text-[#6d7a72]">
                    {subTitleText ? `${subTitleText} • ` : ''}Rate: ₹{itemPrice} • Qty: {itemQty}
                  </Text>
                </View>
                <Text className="text-xs font-extrabold text-[#131b2e]">₹{lineTotal.toLocaleString('en-IN')}</Text>
              </View>
            );
          })}

          {/* Payment Financial Snapshot */}
          <View className="mt-3 pt-2 gap-1.5">
            <View className="flex-row justify-between">
              <Text className="text-xs text-[#6d7a72]">Items Subtotal</Text>
              <Text className="text-xs font-semibold text-[#131b2e]">
                ₹{(orderData.financialSnapshot?.subtotal || orderData.subtotal || 0).toLocaleString('en-IN')}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs text-[#6d7a72]">Delivery Charges</Text>
              <Text className="text-xs font-bold text-[#006948]">FREE (Wholesale Delivery)</Text>
            </View>
            <View className="flex-row justify-between pt-2 border-t border-[#f2f3ff] mt-1">
              <Text className="text-sm font-bold text-[#131b2e]">Total Amount (COD)</Text>
              <Text className="text-base font-extrabold text-[#006948]">
                ₹{(orderData.financialSnapshot?.totalAmount || orderData.totalAmount || orderData.total || 0).toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons: Download Invoice & Cancel Order */}
        <View className="gap-2.5">
          <Pressable
            onPress={handleDownloadInvoice}
            className="bg-[#006948] rounded-xl py-3.5 flex-row items-center justify-center gap-2 shadow-sm active:opacity-90"
          >
            <Icon name="receipt" size={18} color="#ffffff" />
            <Text className="text-white font-bold text-xs uppercase tracking-wider">View / Download Invoice</Text>
          </Pressable>

          {isCancellable && (
            <Pressable
              onPress={handleCancelOrder}
              disabled={cancelling}
              className="bg-red-50 border border-red-200 rounded-xl py-3 flex-row items-center justify-center gap-2 active:opacity-90"
            >
              {cancelling ? (
                <ActivityIndicator size="small" color="#ef4444" />
              ) : (
                <>
                  <Icon name="cancel" size={18} color="#ef4444" />
                  <Text className="text-red-600 font-bold text-xs uppercase tracking-wider">Cancel Order</Text>
                </>
              )}
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
