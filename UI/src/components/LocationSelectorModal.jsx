import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  TextInput,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useLocationStore } from '../store/locationStore';
import { useAuthStore } from '../store/authStore';
import { api } from '../services/api';

export default function LocationSelectorModal() {
  const insets = useSafeAreaInsets();
  const {
    location,
    isModalOpen,
    closeModal,
    setPincode,
    detectGpsLocation,
    selectAddressLocation,
    isLoading,
    error,
  } = useLocationStore();

  const { session } = useAuthStore();
  const [pinInput, setPinInput] = useState(location?.pincode || '');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [fetchingAddresses, setFetchingAddresses] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      setPinInput(location?.pincode || '');
      loadUserAddresses();
    }
  }, [isModalOpen]);

  const loadUserAddresses = async () => {
    const sId = session?.user?._id || session?.user?.id;
    if (!sId) return;

    setFetchingAddresses(true);
    try {
      const res = await api.getAddresses(sId);
      const list = Array.isArray(res) ? res : res?.data || [];
      setSavedAddresses(list);
    } catch (err) {
      console.warn('[LocationModal] Could not fetch saved addresses:', err.message);
    } finally {
      setFetchingAddresses(false);
    }
  };

  const handleApplyPincode = async () => {
    if (!pinInput || pinInput.trim().length !== 6) return;
    await setPincode(pinInput.trim());
  };

  const handleGpsDetect = async () => {
    await detectGpsLocation();
  };

  const handleSelectAddress = (addr) => {
    selectAddressLocation(addr);
  };

  return (
    <Modal
      visible={isModalOpen}
      transparent
      animationType="slide"
      onRequestClose={closeModal}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end bg-black/60"
      >
        <Pressable className="flex-1" onPress={closeModal} />

        <View
          className="bg-white rounded-t-3xl p-5 max-h-[85%] border-t border-[#dae2fd] shadow-2xl"
          style={{ paddingBottom: Math.max(20, insets.bottom + 12) }}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between pb-3 border-b border-[#f0f2f5]">
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-full bg-[#eef2ff] justify-center items-center">
                <Icon name="place" size={20} color="#006948" />
              </View>
              <Text className="text-base font-bold text-[#131b2e]">Delivery Location</Text>
            </View>
            <Pressable
              onPress={closeModal}
              className="w-8 h-8 rounded-full bg-[#f2f3ff] justify-center items-center active:opacity-70"
            >
              <Icon name="close" size={18} color="#475569" />
            </Pressable>
          </View>

          <ScrollView className="mt-4" showsVerticalScrollIndicator={false}>
            {/* GPS Auto-Detect Button */}
            <Pressable
              onPress={handleGpsDetect}
              disabled={isLoading}
              className="flex-row items-center justify-between p-3.5 bg-[#eef2ff] border border-[#c7d2fe] rounded-2xl active:opacity-80"
            >
              <View className="flex-row items-center gap-3 flex-1">
                <View className="w-9 h-9 rounded-full bg-[#3b82f6] justify-center items-center">
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Icon name="my-location" size={18} color="#ffffff" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-[#1e3a8a]">Use Current Location (GPS)</Text>
                  <Text className="text-[11px] text-[#475569]">
                    Auto-detect area & check delivery availability
                  </Text>
                </View>
              </View>
              <Icon name="chevron-right" size={20} color="#3b82f6" />
            </Pressable>

            {/* Manual PIN Code Entry */}
            <View className="mt-4">
              <Text className="text-xs font-bold text-[#131b2e] mb-2">Or Enter 6-digit Pincode</Text>
              <View className="flex-row items-center gap-2.5">
                <View className="flex-1 flex-row items-center bg-[#f2f3ff] rounded-xl px-3 h-11 border border-[#e2e8f0]">
                  <Icon name="search" size={18} color="#64748b" />
                  <TextInput
                    placeholder="Enter pincode (e.g. 208001)"
                    placeholderTextColor="#94a3b8"
                    keyboardType="numeric"
                    maxLength={6}
                    value={pinInput}
                    onChangeText={setPinInput}
                    className="flex-1 ml-2 text-xs font-bold text-[#131b2e]"
                  />
                  {pinInput.length > 0 && (
                    <Pressable onPress={() => setPinInput('')}>
                      <Icon name="cancel" size={16} color="#94a3b8" />
                    </Pressable>
                  )}
                </View>

                {/* Apply Button with robust min-width to avoid any text cutoff */}
                <Pressable
                  onPress={handleApplyPincode}
                  disabled={isLoading || pinInput.length !== 6}
                  className={`h-11 w-20 rounded-xl justify-center items-center ${
                    pinInput.length === 6 && !isLoading ? 'bg-[#006948] active:opacity-90' : 'bg-[#006948]/40'
                  }`}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text className="text-xs font-bold text-white text-center">Apply</Text>
                  )}
                </Pressable>
              </View>
            </View>

            {/* Error Message */}
            {error && (
              <View className="mt-3 p-3 rounded-xl bg-[#fff1f2] border border-[#fecdd3] flex-row items-center gap-2">
                <Icon name="error" size={16} color="#e11d48" />
                <Text className="text-[11px] font-semibold text-[#9f1239] flex-1">{error}</Text>
              </View>
            )}

            {/* Current Active Location Display */}
            {location && (
              <View className="mt-4 p-3.5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0]">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <Icon
                      name={location.isServiceable ? 'check-circle' : 'location-off'}
                      size={18}
                      color={location.isServiceable ? '#15803d' : '#e11d48'}
                    />
                    <Text className="text-xs font-bold text-[#131b2e]">
                      {location.city || ''} ({location.pincode})
                    </Text>
                  </View>
                  <View
                    className={`px-2 py-0.5 rounded-full ${
                      location.isServiceable ? 'bg-[#dcfce7]' : 'bg-[#ffe4e6] border border-[#fecdd3]'
                    }`}
                  >
                    <Text
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        location.isServiceable ? 'text-[#15803d]' : 'text-[#e11d48]'
                      }`}
                    >
                      {location.isServiceable ? 'Serviceable' : 'Unavailable'}
                    </Text>
                  </View>
                </View>

                <Text className="text-[11px] text-[#64748b] mt-1">
                  {location.message || location.formattedAddress}
                </Text>

                {location.isServiceable && (
                  <View className="flex-row items-center gap-4 mt-2 pt-2 border-t border-[#f1f5f9]">
                    {location.hubName ? (
                      <Text className="text-[10px] text-[#475569]">
                        <Text className="font-bold">Hub:</Text> {location.hubName}
                      </Text>
                    ) : null}
                    {location.estimatedDays ? (
                      <Text className="text-[10px] text-[#475569]">
                        <Text className="font-bold">Estimated:</Text> {location.estimatedDays}
                      </Text>
                    ) : null}
                  </View>
                )}
              </View>
            )}

            {/* Saved Facilities / Addresses */}
            {savedAddresses.length > 0 && (
              <View className="mt-5 mb-2">
                <Text className="text-xs font-bold text-[#131b2e] mb-2.5">
                  Your Saved Warehouses & Facilities
                </Text>
                <View className="gap-2">
                  {savedAddresses.map((addr, idx) => {
                    const isSelected = String(location?.pincode) === String(addr.pincode);
                    return (
                      <Pressable
                        key={addr._id || addr.id || idx}
                        onPress={() => handleSelectAddress(addr)}
                        className={`p-3 rounded-2xl border flex-row items-center justify-between active:opacity-75 ${
                          isSelected
                            ? 'bg-[#ecfdf5] border-[#10b981]'
                            : 'bg-white border-[#e2e8f0]'
                        }`}
                      >
                        <View className="flex-1 mr-2">
                          <View className="flex-row items-center gap-1.5">
                            <Text className="text-xs font-bold text-[#131b2e]">
                              {addr.facilityName || addr.name || 'Warehouse'}
                            </Text>
                            <Text className="text-[11px] font-semibold text-[#006948]">
                              ({addr.pincode})
                            </Text>
                          </View>
                          <Text className="text-[11px] text-[#64748b] mt-0.5" numberOfLines={1}>
                            {addr.streetAddress || addr.fullAddress || `${addr.city}, ${addr.pincode}`}
                          </Text>
                        </View>
                        <Icon
                          name={isSelected ? 'radio-button-checked' : 'radio-button-unchecked'}
                          size={20}
                          color={isSelected ? '#10b981' : '#94a3b8'}
                        />
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
