import React, { useState, useEffect } from 'react';
import { View, Text, Modal, ScrollView, Pressable, TextInput, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { adminApi } from '../services/api';
import Alert from '../utils/alert';

export default function OrderDetailModal({
  visible,
  onClose,
  order = null,
  onStatusUpdated,
}) {
  const [driverName, setDriverName] = useState('Ramesh Kumar (RS Dispatch)');
  const [driverPhone, setDriverPhone] = useState('+919876512345');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (order) {
      setDriverName(order.driverName || 'Ramesh Kumar (RS Dispatch)');
      setDriverPhone(order.driverPhone || '+919876512345');
    }
  }, [order]);

  if (!order) return null;

  const getStatusColor = (st) => {
    switch (String(st || '').toLowerCase()) {
      case 'confirmed':
        return '#3b82f6';
      case 'dispatching':
        return '#8b5cf6';
      case 'delivered':
        return '#10b981';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#f59e0b';
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      const orderIdToUse = order._id || order.orderId;
      await adminApi.updateOrderDetails(orderIdToUse, {
        status: newStatus,
        driverName,
        driverPhone,
      });

      if (typeof onStatusUpdated === 'function') {
        onStatusUpdated(orderIdToUse, newStatus, driverName, driverPhone);
      }

      Alert.alert('Order Updated', `Order #${order.orderId || orderIdToUse} status changed to ${newStatus.toUpperCase()}`);
      onClose();
    } catch (err) {
      Alert.alert('Update Failed', err.message || 'Failed to update order');
    } finally {
      setUpdating(false);
    }
  };

  const currentStatus = String(order.status || 'pending').toLowerCase();
  const items = order.items || [];
  const total = order.totalAmount || order.total || 0;
  const buyerName = order.buyerSnapshot?.name || order.buyerName || 'Shopkeeper Account';
  const buyerMobile = order.buyerSnapshot?.mobile || order.buyerPhone || 'N/A';
  const deliveryAddress = order.deliveryAddressSnapshot?.fullAddress || order.deliveryAddress || 'Indiranagar, Bengaluru';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/70 justify-center items-center p-4">
        <View className="bg-[#131b2e] rounded-3xl w-full max-w-lg border border-[#232d46] shadow-2xl overflow-hidden max-h-[92%]">
          {/* Header */}
          <View className="bg-[#1c263d] px-5 py-4 flex-row items-center justify-between border-b border-[#232d46]">
            <View className="flex-row items-center gap-2">
              <Icon name="receipt-long" size={22} color="#006948" />
              <View>
                <Text className="text-base font-black text-white">Order #{order.orderId || order._id}</Text>
                <Text className="text-[10px] text-[#8c9ba5]">{order.date || 'Today'}</Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3">
              <View
                className="px-3 py-1 rounded-full"
                style={{ backgroundColor: `${getStatusColor(currentStatus)}20` }}
              >
                <Text
                  className="text-xs font-black uppercase tracking-wider"
                  style={{ color: getStatusColor(currentStatus) }}
                >
                  {currentStatus}
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                className="w-8 h-8 rounded-full bg-[#2d3a58] justify-center items-center active:opacity-70"
              >
                <Icon name="close" size={18} color="#ffffff" />
              </Pressable>
            </View>
          </View>

          {/* Modal Body */}
          <ScrollView className="p-5">
            {/* Buyer Snapshot Info Card */}
            <View className="bg-[#1c263d] rounded-2xl p-4 mb-4 border border-[#2d3a58]">
              <View className="flex-row items-center gap-2 mb-2">
                <Icon name="person" size={18} color="#006948" />
                <Text className="text-xs font-black text-white uppercase tracking-wider">
                  Buyer Account Details
                </Text>
              </View>
              <Text className="text-sm font-extrabold text-white mb-0.5">{buyerName}</Text>
              <Text className="text-xs font-bold text-[#10b981] mb-2">📞 {buyerMobile}</Text>

              <View className="border-t border-[#2d3a58] pt-2 flex-row items-start gap-2">
                <Icon name="location-on" size={16} color="#8c9ba5" className="mt-0.5" />
                <Text className="text-xs text-[#cbd5e1] flex-1 leading-relaxed">{deliveryAddress}</Text>
              </View>
            </View>

            {/* Itemized Order Products */}
            <View className="bg-[#1c263d] rounded-2xl p-4 mb-4 border border-[#2d3a58]">
              <Text className="text-xs font-black text-white uppercase tracking-wider mb-3">
                Itemized Products ({items.length})
              </Text>

              {items.map((item, idx) => {
                const itemQty = item.quantity || item.qty || 1;
                const itemPrice = item.unitPrice || item.price || 99;
                const lineTotal = item.lineTotal || itemQty * itemPrice;

                return (
                  <View
                    key={idx}
                    className={`flex-row items-center justify-between py-2.5 ${
                      idx !== items.length - 1 ? 'border-b border-[#2d3a58]' : ''
                    }`}
                  >
                    <View className="flex-1 pr-2">
                      <Text className="text-xs font-bold text-white mb-0.5" numberOfLines={1}>
                        {item.name || 'Floor Cleaner SKU'}
                      </Text>
                      <Text className="text-[10px] text-[#8c9ba5]">
                        Qty: {itemQty} • ₹{itemPrice} / unit
                      </Text>
                    </View>

                    <Text className="text-xs font-extrabold text-[#10b981]">₹{lineTotal}</Text>
                  </View>
                );
              })}

              <View className="border-t border-[#2d3a58] pt-3 mt-2 flex-row justify-between items-center">
                <Text className="text-xs font-black text-white">Total Order Value</Text>
                <Text className="text-base font-black text-[#10b981]">₹{total}</Text>
              </View>
            </View>

            {/* Dispatch Driver Assignment */}
            <View className="bg-[#1c263d] rounded-2xl p-4 mb-5 border border-[#2d3a58]">
              <Text className="text-xs font-black text-white uppercase tracking-wider mb-3">
                RS Dispatch Logistics Driver
              </Text>

              <View className="mb-3">
                <Text className="text-[10px] font-bold text-[#8c9ba5] mb-1">Assigned Driver Name</Text>
                <TextInput
                  value={driverName}
                  onChangeText={setDriverName}
                  placeholder="Driver Name"
                  placeholderTextColor="#5b6a82"
                  className="bg-[#131b2e] rounded-xl px-3.5 py-2.5 text-xs font-bold text-white border border-[#2d3a58]"
                />
              </View>

              <View>
                <Text className="text-[10px] font-bold text-[#8c9ba5] mb-1">Driver Phone Number</Text>
                <TextInput
                  value={driverPhone}
                  onChangeText={setDriverPhone}
                  placeholder="Driver Phone"
                  placeholderTextColor="#5b6a82"
                  keyboardType="phone-pad"
                  className="bg-[#131b2e] rounded-xl px-3.5 py-2.5 text-xs font-bold text-white border border-[#2d3a58]"
                />
              </View>
            </View>

            {/* Status Change Action Buttons */}
            <Text className="text-[11px] font-black text-[#8c9ba5] uppercase tracking-wider mb-2">
              Update Fulfillment Status
            </Text>

            {updating ? (
              <ActivityIndicator size="small" color="#006948" className="my-4" />
            ) : (
              <View className="gap-2 mb-6">
                {currentStatus !== 'confirmed' && currentStatus !== 'delivered' && (
                  <Pressable
                    onPress={() => handleUpdateStatus('confirmed')}
                    className="bg-[#3b82f6] rounded-2xl py-3 items-center justify-center flex-row gap-2 active:opacity-90"
                  >
                    <Icon name="check" size={18} color="#ffffff" />
                    <Text className="text-xs font-black text-white uppercase">Confirm & Accept Order</Text>
                  </Pressable>
                )}

                {currentStatus !== 'dispatching' && currentStatus !== 'delivered' && (
                  <Pressable
                    onPress={() => handleUpdateStatus('dispatching')}
                    className="bg-[#8b5cf6] rounded-2xl py-3 items-center justify-center flex-row gap-2 active:opacity-90"
                  >
                    <Icon name="local-shipping" size={18} color="#ffffff" />
                    <Text className="text-xs font-black text-white uppercase">Mark Dispatching</Text>
                  </Pressable>
                )}

                {currentStatus !== 'delivered' && (
                  <Pressable
                    onPress={() => handleUpdateStatus('delivered')}
                    className="bg-[#10b981] rounded-2xl py-3 items-center justify-center flex-row gap-2 active:opacity-90"
                  >
                    <Icon name="task-alt" size={18} color="#ffffff" />
                    <Text className="text-xs font-black text-white uppercase">Mark Delivered & Completed</Text>
                  </Pressable>
                )}

                {currentStatus !== 'cancelled' && (
                  <Pressable
                    onPress={() => handleUpdateStatus('cancelled')}
                    className="bg-[#ef4444]/20 border border-[#ef4444]/40 rounded-2xl py-2.5 items-center justify-center flex-row gap-2 active:opacity-90 mt-1"
                  >
                    <Icon name="cancel" size={18} color="#ef4444" />
                    <Text className="text-xs font-extrabold text-[#ef4444]">Cancel Order</Text>
                  </Pressable>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
