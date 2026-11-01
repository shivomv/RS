import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Pressable,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { adminApi } from '../services/api';
import { OrderCardSkeleton, SkeletonList } from '../components/Skeletons';
import Alert from '../utils/alert';

const formatDate = (dateStr) => {
  if (!dateStr) return 'Recent Order';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(dateStr);
  }
};

const getFullAddress = (ord) => {
  if (!ord) return 'Address not specified';
  const snap = ord.deliveryAddressSnapshot;
  if (snap && snap.fullAddress) {
    const parts = [
      snap.facilityName,
      snap.fullAddress,
      snap.city,
      snap.pincode ? `PIN: ${snap.pincode}` : '',
    ].filter(Boolean);
    return parts.join(', ');
  }
  return ord.deliveryAddress || 'Address not specified';
};

const getItemBundleLabel = (item) => {
  return (
    item.bundleName ||
    item.bundleLabel ||
    item.bundle?.label ||
    item.variantLabel ||
    item.subtitle ||
    (item.bundleQuantity ? `Pack of ${item.bundleQuantity}` : null) ||
    (item.size ? `Size: ${item.size}` : 'Standard Pack')
  );
};

const PAGE_SIZE = 10;

export default function OrderManagementScreen({ orders: initialOrders = [], onRefresh, route }) {
  const [orderList, setOrderList] = useState(initialOrders);
  const [loading, setLoading] = useState(initialOrders.length === 0);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [activeView, setActiveView] = useState('list');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [updating, setUpdating] = useState(false);

  const fetchOrdersData = async (offset = 0, append = false, status = statusFilter) => {
    if (append) {
      setLoadingMore(true);
    } else if (offset === 0 && !refreshing) {
      setLoading(true);
    }

    try {
      const res = await adminApi.getOrders({
        limit: PAGE_SIZE,
        offset,
        status: status !== 'ALL' ? status : undefined,
      }).catch(() => []);

      const list = Array.isArray(res) ? res : res?.data || [];

      if (list.length < PAGE_SIZE) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      setOrderList((prev) => {
        if (!append) return list;
        const existingIds = new Set(prev.map((o) => String(o.orderId || o.id || o._id)));
        const newItems = list.filter((o) => !existingIds.has(String(o.orderId || o.id || o._id)));
        return [...prev, ...newItems];
      });
    } catch (e) {
      console.error('[OrderManagementScreen] Fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchOrdersData(0, false, 'ALL');
  }, []);

  useEffect(() => {
    if (route?.params?.selectedOrder) {
      openOrderView(route.params.selectedOrder);
    } else if (route?.params?.orderId) {
      const targetId = String(route.params.orderId);
      const match = orderList.find(
        (o) => String(o.orderId || o.id || o._id) === targetId
      );
      if (match) {
        openOrderView(match);
      } else {
        adminApi.getOrders({ limit: PAGE_SIZE, offset: 0 }).then((res) => {
          const list = Array.isArray(res) ? res : res?.data || [];
          setOrderList(list);
          const found = list.find(
            (o) => String(o.orderId || o.id || o._id) === targetId
          );
          if (found) openOrderView(found);
        }).catch(() => {});
      }
    }
  }, [route?.params?.selectedOrder, route?.params?.orderId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrdersData(0, false, statusFilter);
    if (typeof onRefresh === 'function') onRefresh();
  };

  const handleLoadMore = () => {
    if (loading || loadingMore || !hasMore || refreshing) return;
    fetchOrdersData(orderList.length, true, statusFilter);
  };

  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    setHasMore(true);
    fetchOrdersData(0, false, newStatus);
  };

  const openOrderView = (ord) => {
    setSelectedOrder(ord);
    setDriverName(ord.driverName || '');
    setDriverPhone(ord.driverPhone || '');
    setActiveView('view');
  };

  const statusColor = (st) => {
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
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      const id = selectedOrder._id || selectedOrder.orderId;
      await adminApi.updateOrderDetails(id, {
        status: newStatus,
        driverName: driverName.trim(),
        driverPhone: driverPhone.trim(),
      });
      Alert.alert('Order Updated', `Order marked as ${newStatus.toUpperCase()}`);
      setSelectedOrder((prev) => ({
        ...prev,
        status: newStatus,
        driverName: driverName.trim(),
        driverPhone: driverPhone.trim(),
      }));
      setOrderList((prev) =>
        prev.map((o) =>
          String(o.orderId || o.id || o._id) === String(id)
            ? { ...o, status: newStatus, driverName: driverName.trim(), driverPhone: driverPhone.trim() }
            : o
        )
      );
      if (typeof onRefresh === 'function') onRefresh();
    } catch (err) {
      Alert.alert('Update Failed', err.message || 'Failed to update order');
    } finally {
      setUpdating(false);
    }
  };

  const filtered = orderList.filter((o) => {
    const st = String(o.status || 'pending').toLowerCase();
    const matchStatus = statusFilter === 'ALL' || st === statusFilter.toLowerCase();
    const q = searchQuery.trim().toLowerCase();
    const matchQ =
      !q ||
      String(o.orderId || o._id || '').toLowerCase().includes(q) ||
      String(o.buyerSnapshot?.name || o.buyerName || '').toLowerCase().includes(q) ||
      String(getFullAddress(o)).toLowerCase().includes(q);
    return matchStatus && matchQ;
  });

  /* ── ORDER DETAIL VIEW ── */
  if (activeView === 'view' && selectedOrder) {
    const st = String(selectedOrder.status || 'pending').toLowerCase();
    const bc = statusColor(st);
    const items = selectedOrder.items || [];
    const buyerName =
      selectedOrder.buyerSnapshot?.name || selectedOrder.buyerName || 'Shopkeeper Account';
    const buyerMobile =
      selectedOrder.buyerSnapshot?.mobile || selectedOrder.buyerPhone || 'N/A';
    const buyerRole = selectedOrder.buyerSnapshot?.role || 'B2B Wholesale Buyer';
    const fullAddress = getFullAddress(selectedOrder);

    // Financial calculations
    const calculatedSubtotal = items.reduce(
      (sum, it) => sum + (it.lineTotal || (it.quantity || 1) * (it.unitPrice || it.price || 0)),
      0
    );
    const subtotal =
      selectedOrder.financialSnapshot?.subtotal || selectedOrder.subtotal || calculatedSubtotal;
    const gstAmount =
      selectedOrder.financialSnapshot?.gstAmount ??
      selectedOrder.gstAmount ??
      0; // Zero GST wholesale
    const deliveryFee =
      selectedOrder.financialSnapshot?.deliveryFee ?? selectedOrder.deliveryFee ?? 0;
    const discountAmount =
      selectedOrder.financialSnapshot?.discountAmount ?? selectedOrder.discountAmount ?? 0;
    const grandTotal =
      selectedOrder.financialSnapshot?.totalAmount ||
      selectedOrder.totalAmount ||
      selectedOrder.total ||
      subtotal + gstAmount + deliveryFee - discountAmount;
    const paymentMethod =
      selectedOrder.paymentMethod || 'Cash on Delivery (COD)';
    const paymentStatus =
      String(selectedOrder.paymentStatus || 'pending').toUpperCase();

    return (
      <View className="flex-1 bg-background">
        {/* Header */}
        <View className="bg-surface border-b border-border px-4 py-3 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3 flex-1 pr-2">
            <Pressable
              onPress={() => setActiveView('list')}
              className="w-10 h-10 rounded-2xl bg-input justify-center items-center border border-border active:opacity-70"
            >
              <Icon name="arrow-back" size={22} color="#006948" />
            </Pressable>
            <View className="flex-1">
              <Text className="text-base font-black text-ink" numberOfLines={1}>
                Order #{selectedOrder.orderId || selectedOrder._id}
              </Text>
              <Text className="text-[10px] font-bold text-muted">
                {formatDate(selectedOrder.createdAt)}
              </Text>
            </View>
          </View>

          <View
            className="px-3 py-1 rounded-full border flex-row items-center gap-1.5"
            style={{ backgroundColor: `${bc}15`, borderColor: `${bc}40` }}
          >
            <View className="w-2 h-2 rounded-full" style={{ backgroundColor: bc }} />
            <Text className="text-xs font-black uppercase tracking-wider" style={{ color: bc }}>
              {st}
            </Text>
          </View>
        </View>

        <ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 60 }}>
          {/* Status & Overview Bar */}
          <View className="bg-surface rounded-3xl p-4 mb-4 border border-border flex-row items-center justify-between">
            <View>
              <Text className="text-[10px] font-bold text-muted uppercase tracking-wider">Payment Status</Text>
              <View className="flex-row items-center gap-1.5 mt-0.5">
                <View
                  className={`px-2 py-0.5 rounded-md ${
                    paymentStatus === 'PAID' ? 'bg-emerald-500/15' : 'bg-amber-500/15'
                  }`}
                >
                  <Text
                    className={`text-[10px] font-black ${
                      paymentStatus === 'PAID' ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {paymentStatus}
                  </Text>
                </View>
                <Text className="text-xs font-bold text-ink">{paymentMethod}</Text>
              </View>
            </View>

            <View className="items-end">
              <Text className="text-[10px] font-bold text-muted uppercase tracking-wider">Overall Bill</Text>
              <Text className="text-base font-black text-brand-dim mt-0.5">
                ₹{grandTotal.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>

          {/* Buyer & Contact Card */}
          <View className="bg-surface rounded-3xl p-5 mb-4 border border-border shadow-sm">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-2">
                <View className="w-8 h-8 rounded-xl bg-brand/10 items-center justify-center">
                  <Icon name="person" size={18} color="#006948" />
                </View>
                <Text className="text-xs font-black text-ink uppercase tracking-wider">
                  Buyer Information
                </Text>
              </View>
              <View className="bg-input px-2.5 py-0.5 rounded-full border border-border">
                <Text className="text-[9px] font-bold text-muted">{buyerRole}</Text>
              </View>
            </View>

            <Text className="text-base font-black text-ink mb-1">{buyerName}</Text>
            <View className="flex-row items-center gap-1.5">
              <Icon name="phone" size={14} color="#006948" />
              <Text className="text-xs font-bold text-brand-dim">{buyerMobile}</Text>
            </View>
          </View>

          {/* Full Delivery Address Card */}
          <View className="bg-surface rounded-3xl p-5 mb-4 border border-border shadow-sm">
            <View className="flex-row items-center gap-2 mb-3">
              <View className="w-8 h-8 rounded-xl bg-blue-500/10 items-center justify-center">
                <Icon name="location-on" size={18} color="#3b82f6" />
              </View>
              <Text className="text-xs font-black text-ink uppercase tracking-wider">
                Full Delivery Address
              </Text>
            </View>

            {selectedOrder.deliveryAddressSnapshot?.facilityName ? (
              <Text className="text-xs font-extrabold text-ink mb-1">
                🏢 {selectedOrder.deliveryAddressSnapshot.facilityName}
              </Text>
            ) : null}

            <Text className="text-xs text-secondary leading-relaxed font-medium">
              {fullAddress}
            </Text>

            {selectedOrder.deliveryAddressSnapshot?.pincode ? (
              <View className="mt-2.5 pt-2.5 border-t border-border flex-row items-center justify-between">
                <Text className="text-[10px] font-bold text-muted">PINCODE / REGION</Text>
                <Text className="text-xs font-black text-ink">
                  {selectedOrder.deliveryAddressSnapshot.pincode}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Itemized Products with Images & Bundles */}
          <View className="bg-surface rounded-3xl p-5 mb-4 border border-border shadow-sm">
            <View className="flex-row items-center justify-between mb-3.5">
              <View className="flex-row items-center gap-2">
                <View className="w-8 h-8 rounded-xl bg-brand/10 items-center justify-center">
                  <Icon name="inventory-2" size={18} color="#006948" />
                </View>
                <Text className="text-xs font-black text-ink uppercase tracking-wider">
                  Ordered Products ({items.length})
                </Text>
              </View>
              <Text className="text-[10px] font-bold text-muted">
                {items.reduce((s, i) => s + (Number(i.quantity) || 1), 0)} Total Packs
              </Text>
            </View>

            {items.map((item, idx) => {
              const qty = Number(item.quantity) || 1;
              const unitPrice = Number(item.unitPrice || item.price || 0);
              const lineTotal = qty * unitPrice;
              const bundleLabel = getItemBundleLabel(item);

              return (
                <View
                  key={idx}
                  className={`flex-row items-start gap-3 py-3.5 ${
                    idx !== items.length - 1 ? 'border-b border-border' : ''
                  }`}
                >
                  {/* Product Image */}
                  {item.image ? (
                    <Image
                      source={{ uri: item.image }}
                      className="w-16 h-16 rounded-2xl bg-input border border-border"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="w-16 h-16 rounded-2xl bg-input border border-border items-center justify-center">
                      <Icon name="inventory-2" size={24} color="#94a3b8" />
                    </View>
                  )}

                  {/* Product Details */}
                  <View className="flex-1">
                    <Text className="text-xs font-black text-ink leading-tight mb-1" numberOfLines={2}>
                      {item.name || 'Industrial Liquid SKU'}
                    </Text>

                    {/* Bundle / Tier Badge */}
                    <View className="self-start bg-brand/10 border border-brand/25 px-2 py-0.5 rounded-md mb-1.5">
                      <Text className="text-[10px] font-black text-brand-dim">
                        📦 {bundleLabel}
                      </Text>
                    </View>

                    {/* Quantity & Unit Price */}
                    <Text className="text-[11px] font-bold text-muted">
                      {qty} × ₹{unitPrice.toLocaleString('en-IN')}
                    </Text>
                  </View>

                  {/* Line Total */}
                  <View className="items-end pt-1">
                    <Text className="text-sm font-black text-brand-dim">
                      ₹{lineTotal.toLocaleString('en-IN')}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Financial Breakdown / Overall Bill Card */}
          <View className="bg-surface rounded-3xl p-5 mb-4 border border-border shadow-sm">
            <Text className="text-xs font-black text-ink uppercase tracking-wider mb-3">
              Bill & Payment Summary
            </Text>

            <View className="flex-row justify-between py-1.5 border-b border-border">
              <Text className="text-xs text-muted">Items Subtotal</Text>
              <Text className="text-xs font-bold text-ink">₹{subtotal.toLocaleString('en-IN')}</Text>
            </View>

            <View className="flex-row justify-between py-1.5 border-b border-border">
              <Text className="text-xs text-muted">GST Taxes</Text>
              <Text className="text-xs font-bold text-emerald-600">₹0 (Zero GST Wholesale)</Text>
            </View>

            <View className="flex-row justify-between py-1.5 border-b border-border">
              <Text className="text-xs text-muted">Delivery & Logistics</Text>
              <Text className="text-xs font-bold text-brand-dim">
                {deliveryFee > 0 ? `₹${deliveryFee}` : 'FREE Factory Dispatch'}
              </Text>
            </View>

            {discountAmount > 0 ? (
              <View className="flex-row justify-between py-1.5 border-b border-border">
                <Text className="text-xs text-muted">Bulk Discount</Text>
                <Text className="text-xs font-bold text-emerald-600">
                  -₹{discountAmount.toLocaleString('en-IN')}
                </Text>
              </View>
            ) : null}

            <View className="flex-row justify-between pt-3 mt-1 items-center">
              <View>
                <Text className="text-xs font-black text-ink uppercase tracking-wider">
                  Grand Total Overall
                </Text>
                <Text className="text-[10px] text-muted">Includes all taxes and delivery</Text>
              </View>
              <Text className="text-xl font-black text-brand-dim">
                ₹{grandTotal.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>

          {/* Status Progression Section */}
          <View className="mt-2 mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-[11px] font-black text-muted uppercase tracking-wider">
                Step-Wise Fulfillment Progression
              </Text>
              {st !== 'cancelled' && (
                <Text className="text-[10px] font-bold text-brand-dim">
                  {st === 'pending'
                    ? 'Step 1 of 4: Placed'
                    : st === 'confirmed'
                    ? 'Step 2 of 4: Confirmed'
                    : st === 'dispatching'
                    ? 'Step 3 of 4: Dispatching'
                    : 'Step 4 of 4: Delivered'}
                </Text>
              )}
            </View>

            {/* Visual Step Tracker */}
            {st !== 'cancelled' && (
              <View className="bg-surface rounded-3xl p-4 mb-4 border border-border shadow-sm">
                <View className="flex-row items-center justify-between">
                  {[
                    { key: 'pending', label: 'Placed', icon: 'receipt-long' },
                    { key: 'confirmed', label: 'Confirmed', icon: 'check-circle' },
                    { key: 'dispatching', label: 'Dispatching', icon: 'local-shipping' },
                    { key: 'delivered', label: 'Delivered', icon: 'task-alt' },
                  ].map((step, idx) => {
                    const stepOrder = { pending: 0, confirmed: 1, dispatching: 2, delivered: 3 };
                    const curIdx = stepOrder[st] ?? 0;
                    const isDone = idx < curIdx;
                    const isCurrent = idx === curIdx;

                    let circleBg = 'bg-input border-border';
                    let iconColor = '#94a3b8';
                    let iconName = step.icon;
                    if (isDone) {
                      circleBg = 'bg-emerald-500 border-emerald-500';
                      iconColor = '#ffffff';
                      iconName = 'check';
                    } else if (isCurrent) {
                      circleBg = 'bg-[#006948] border-[#006948] shadow-sm';
                      iconColor = '#ffffff';
                    }

                    return (
                      <View key={step.key} className="items-center flex-1">
                        <View
                          className={`w-8 h-8 rounded-full border-2 items-center justify-center mb-1.5 ${circleBg}`}
                        >
                          <Icon name={iconName} size={15} color={iconColor} />
                        </View>
                        <Text
                          className={`text-[9px] font-black uppercase text-center ${
                            isCurrent
                              ? 'text-[#006948]'
                              : isDone
                              ? 'text-emerald-700'
                              : 'text-muted'
                          }`}
                        >
                          {step.label}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Cancelled Order Banner */}
            {st === 'cancelled' && (
              <View className="bg-red-500/10 border border-red-500/30 rounded-3xl p-5 mb-4 items-center">
                <View className="w-12 h-12 rounded-full bg-red-500/20 items-center justify-center mb-2">
                  <Icon name="cancel" size={26} color="#ef4444" />
                </View>
                <Text className="text-sm font-black text-red-500 uppercase tracking-wider">
                  Order Cancelled
                </Text>
                <Text className="text-xs text-muted text-center mt-1">
                  This wholesale order has been cancelled and reserved stock restored.
                </Text>
              </View>
            )}

            {/* Driver Assignment Card (editable during confirmed or dispatching) */}
            {(st === 'confirmed' || st === 'dispatching') && (
              <View className="bg-surface rounded-3xl p-4 mb-4 border border-border shadow-sm">
                <View className="flex-row items-center gap-2 mb-3">
                  <View className="w-7 h-7 rounded-lg bg-purple-500/10 items-center justify-center">
                    <Icon name="local-shipping" size={16} color="#8b5cf6" />
                  </View>
                  <Text className="text-xs font-black text-ink uppercase tracking-wider">
                    Logistics & Delivery Representative
                  </Text>
                </View>
                <View className="mb-2.5">
                  <Text className="text-[10px] font-bold text-muted mb-1 uppercase">Assigned Driver Name</Text>
                  <TextInput
                    value={driverName}
                    onChangeText={setDriverName}
                    placeholder="e.g. Ramesh Kumar / Factory Van 04"
                    placeholderTextColor="#94a3b8"
                    className="bg-input rounded-xl px-3 py-2 text-xs font-bold text-ink border border-border"
                  />
                </View>
                <View>
                  <Text className="text-[10px] font-bold text-muted mb-1 uppercase">Driver Phone Number</Text>
                  <TextInput
                    value={driverPhone}
                    onChangeText={setDriverPhone}
                    placeholder="e.g. 9876543210"
                    placeholderTextColor="#94a3b8"
                    keyboardType="phone-pad"
                    className="bg-input rounded-xl px-3 py-2 text-xs font-bold text-ink border border-border"
                  />
                </View>
              </View>
            )}

            {/* Step-by-Step Progressive Actions */}
            {updating ? (
              <ActivityIndicator size="small" color="#006948" className="my-4" />
            ) : (
              <View className="gap-2.5 mb-6">
                {/* STEP 1 -> STEP 2: Only show when status is pending */}
                {st === 'pending' && (
                  <Pressable
                    onPress={() => handleUpdateStatus('confirmed')}
                    className="bg-blue-600 rounded-2xl py-3.5 px-4 items-center flex-row justify-center gap-2 active:opacity-90 shadow-sm"
                  >
                    <Icon name="check-circle" size={18} color="#fff" />
                    <View className="items-center">
                      <Text className="text-xs font-black text-white uppercase tracking-wider">
                        Confirm & Accept Order
                      </Text>
                      <Text className="text-[10px] text-blue-100 font-medium">
                        Advance to Step 2: Accept for warehouse packing
                      </Text>
                    </View>
                  </Pressable>
                )}

                {/* STEP 2 -> STEP 3: Only show when status is confirmed */}
                {st === 'confirmed' && (
                  <Pressable
                    onPress={() => handleUpdateStatus('dispatching')}
                    className="bg-purple-600 rounded-2xl py-3.5 px-4 items-center flex-row justify-center gap-2 active:opacity-90 shadow-sm"
                  >
                    <Icon name="local-shipping" size={18} color="#fff" />
                    <View className="items-center">
                      <Text className="text-xs font-black text-white uppercase tracking-wider">
                        Mark Order Dispatching
                      </Text>
                      <Text className="text-[10px] text-purple-100 font-medium">
                        Advance to Step 3: Out for delivery with driver
                      </Text>
                    </View>
                  </Pressable>
                )}

                {/* STEP 3 -> STEP 4: Only show when status is dispatching */}
                {st === 'dispatching' && (
                  <Pressable
                    onPress={() => handleUpdateStatus('delivered')}
                    className="bg-emerald-600 rounded-2xl py-3.5 px-4 items-center flex-row justify-center gap-2 active:opacity-90 shadow-sm"
                  >
                    <Icon name="task-alt" size={18} color="#fff" />
                    <View className="items-center">
                      <Text className="text-xs font-black text-white uppercase tracking-wider">
                        Mark Order Delivered & Fulfilled
                      </Text>
                      <Text className="text-[10px] text-emerald-100 font-medium">
                        Advance to Step 4: Confirm delivery & COD collected
                      </Text>
                    </View>
                  </Pressable>
                )}

                {/* STEP 4: Terminal status - Delivered */}
                {st === 'delivered' && (
                  <View className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-5 items-center">
                    <View className="w-12 h-12 rounded-full bg-emerald-500/20 items-center justify-center mb-2">
                      <Icon name="task-alt" size={26} color="#10b981" />
                    </View>
                    <Text className="text-sm font-black text-emerald-700 uppercase tracking-wider">
                      Order Fully Delivered & Fulfilled
                    </Text>
                    <Text className="text-xs text-muted text-center mt-1">
                      This wholesale order has been successfully fulfilled.
                    </Text>
                  </View>
                )}

                {/* Cancel Button: Allowed only before order is delivered or already cancelled */}
                {st !== 'delivered' && st !== 'cancelled' && (
                  <Pressable
                    onPress={() => {
                      Alert.alert(
                        'Cancel Order',
                        `Are you sure you want to cancel Order #${selectedOrder.orderId || selectedOrder._id}? Stock will be restored to inventory.`,
                        [
                          { text: 'Keep Order', style: 'cancel' },
                          {
                            text: 'Yes, Cancel Order',
                            style: 'destructive',
                            onPress: () => handleUpdateStatus('cancelled'),
                          },
                        ]
                      );
                    }}
                    className="rounded-2xl py-3 items-center flex-row justify-center gap-2 active:opacity-90 mt-1 border border-red-500/30 bg-red-500/10"
                  >
                    <Icon name="cancel" size={16} color="#ef4444" />
                    <Text className="text-xs font-black text-red-500 uppercase tracking-wider">
                      Cancel Order
                    </Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

  /* ── ORDER LIST VIEW ── */
  return (
    <View className="flex-1 bg-background">
      {/* Top Header & Search */}
      <View className="p-4 bg-surface border-b border-border">
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-base font-black text-ink">Orders Fulfillment</Text>
            <Text className="text-[10px] text-muted font-bold">
              {filtered.length} of {orderList.length} Total Orders
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-input rounded-2xl px-3.5 py-2.5 border border-border mb-3">
          <Icon name="search" size={18} color="#94a3b8" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search Order ID, Buyer, or Address..."
            placeholderTextColor="#94a3b8"
            className="flex-1 text-xs font-bold text-ink p-0 ml-2"
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')}>
              <Icon name="close" size={16} color="#94a3b8" />
            </Pressable>
          ) : null}
        </View>

        {/* Status Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['ALL', 'pending', 'confirmed', 'dispatching', 'delivered', 'cancelled'].map((k) => {
            const isActive = statusFilter === k;
            return (
              <Pressable
                key={k}
                onPress={() => handleStatusFilterChange(k)}
                className={`px-3.5 py-1.5 rounded-full mr-2 border ${
                  isActive ? 'bg-brand border-brand' : 'bg-input border-border active:bg-border'
                }`}
              >
                <Text
                  className={`text-xs font-bold uppercase ${
                    isActive ? 'text-white font-extrabold' : 'text-muted'
                  }`}
                >
                  {k}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Orders List with Infinite Scroll (10 per batch) */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.orderId || item.id || item._id)}
        renderItem={({ item: ord }) => {
          const st = String(ord.status || 'pending').toLowerCase();
          const bc = statusColor(st);
          const items = ord.items || [];
          const fullAddress = getFullAddress(ord);
          const total = ord.totalAmount || ord.total || 0;
          const buyerName = ord.buyerSnapshot?.name || ord.buyerName || 'Shopkeeper Account';
          const buyerMobile = ord.buyerSnapshot?.mobile || ord.buyerPhone || '';

          return (
            <Pressable
              key={ord._id || ord.orderId}
              onPress={() => openOrderView(ord)}
              className="bg-surface rounded-3xl p-4 mb-3.5 border border-border shadow-sm active:opacity-90"
            >
              {/* Header Row: ID, Date, Status */}
              <View className="flex-row items-center justify-between mb-2">
                <View>
                  <Text className="text-xs font-black text-ink">
                    Order #{ord.orderId || ord._id}
                  </Text>
                  <Text className="text-[10px] text-muted font-medium">
                    {formatDate(ord.createdAt)}
                  </Text>
                </View>

                <View
                  className="px-2.5 py-0.5 rounded-full border flex-row items-center gap-1"
                  style={{ backgroundColor: `${bc}15`, borderColor: `${bc}30` }}
                >
                  <View className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: bc }} />
                  <Text
                    className="text-[10px] font-black uppercase tracking-wider"
                    style={{ color: bc }}
                  >
                    {st}
                  </Text>
                </View>
              </View>

              {/* Buyer & Address Row */}
              <View className="bg-input/60 rounded-2xl p-3 mb-3 border border-border/60">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-xs font-black text-ink">{buyerName}</Text>
                  {buyerMobile ? (
                    <Text className="text-[10px] font-bold text-brand-dim">📞 {buyerMobile}</Text>
                  ) : null}
                </View>
                <Text className="text-[11px] text-secondary leading-snug font-medium" numberOfLines={2}>
                  📍 {fullAddress}
                </Text>
              </View>

              {/* Footer: Item Count and Overall Bill */}
              <View className="flex-row items-center justify-between border-t border-border pt-2.5">
                <Text className="text-[11px] font-bold text-muted">
                  {items.length} Product{items.length !== 1 ? 's' : ''} • {ord.paymentMethod || 'COD'}
                </Text>
                <View className="flex-row items-baseline gap-1">
                  <Text className="text-[10px] font-bold text-muted uppercase">Total:</Text>
                  <Text className="text-base font-black text-brand-dim">
                    ₹{total.toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        }}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#006948" />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          loading ? (
            <SkeletonList Component={OrderCardSkeleton} count={4} />
          ) : (
            <View className="py-16 items-center">
              <Icon name="receipt-long" size={48} color="#cbd5e1" />
              <Text className="text-sm font-bold text-muted mt-3">No orders found</Text>
            </View>
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <View className="py-4 items-center justify-center flex-row gap-2">
              <ActivityIndicator size="small" color="#006948" />
              <Text className="text-xs text-muted font-bold">Loading older orders (10)...</Text>
            </View>
          ) : !hasMore && orderList.length > 0 ? (
            <View className="py-4 items-center">
              <Text className="text-[11px] text-muted font-medium">All {orderList.length} orders loaded</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}
