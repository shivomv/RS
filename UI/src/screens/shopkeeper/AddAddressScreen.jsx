import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator, PermissionsAndroid, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Geolocation from '@react-native-community/geolocation';
import RSLogo from '../../components/RSLogo';
import { api } from '../../services/api';
import { alertService } from '../../services/alertService';
import { useAuthStore } from '../../store/authStore';

export default function AddAddressScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { session } = useAuthStore();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);
  const [fetchingPin, setFetchingPin] = useState(false);
  const [serviceStatus, setServiceStatus] = useState(null);

  // Auto-fill address via GPS using Backend Reverse-Geocode
  const handleDetectGPS = async () => {
    setDetectingGps(true);
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'RS Industries Location Permission',
            message: 'Allow location access to autofill your warehouse address and verify delivery serviceability.',
            buttonNeutral: 'Ask Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'Allow',
          }
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          alertService.warning('Permission Denied', 'Please type your 6-digit pincode manually.');
          setDetectingGps(false);
          return;
        }
      }

      Geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // All third-party calls handled strictly by RS Backend
            const res = await api.reverseGeocode(latitude, longitude);

            if (res.success) {
              if (res.pincode) setPincode(res.pincode);
              if (res.city) setCity(res.city);
              if (res.state) setState(res.state);
              if (res.streetAddress) setAddress(res.streetAddress);
              if (res.landmark) setLandmark(res.landmark);

              setServiceStatus({
                isServiceable: res.isServiceable,
                message: res.isServiceable
                  ? `Service Available in ${res.city} (${res.estimatedDays || '1-2 Days'})`
                  : `RS Industries delivery is currently not available in ${res.city} (${res.pincode || ''}).`,
              });
            }
          } catch (err) {
            alertService.error('GPS Lookup Error', err.message || 'Failed to resolve location address.');
          } finally {
            setDetectingGps(false);
          }
        },
        (error) => {
          console.warn('[GPS] Error:', error);
          alertService.error('GPS Signal Unavailable', 'Could not detect GPS. Please enter your pincode manually.');
          setDetectingGps(false);
        },
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
      );
    } catch (err) {
      alertService.error('Location Error', err.message);
      setDetectingGps(false);
    }
  };

  // Auto-fetch City & State on 6-digit Pincode change via Backend API
  const handlePincodeChange = async (val) => {
    const clean = val.replace(/\D/g, '').slice(0, 6);
    setPincode(clean);

    if (clean.length === 6) {
      setFetchingPin(true);
      try {
        const res = await api.getPincodeDetails(clean);
        if (res.success) {
          if (res.city) setCity(res.city);
          if (res.state) setState(res.state);
          setServiceStatus({
            isServiceable: res.isServiceable,
            message: res.isServiceable
              ? `Delivery available in ${res.city} (${res.estimatedDays})`
              : `Delivery not available in ${res.city} (${clean}).`,
          });
        }
      } catch (err) {
        console.warn('[Pincode Lookup Error]:', err.message);
      } finally {
        setFetchingPin(false);
      }
    } else {
      setServiceStatus(null);
    }
  };

  const handleSave = async () => {
    if (!name || !address || !pincode) {
      alertService.warning('Missing Fields', 'Please enter Facility Name, Street Address, and Pincode.');
      return;
    }

    if (!session?.user?._id && !session?.user?.id) {
      alertService.error('Error', 'Please log in to save an address.');
      return;
    }

    setLoading(true);
    try {
      const sId = session.user._id || session.user.id;
      const addressData = {
        shopkeeper: sId,
        shopkeeperId: sId,
        fullAddress: `${address}, ${city}, ${state} - ${pincode}`,
        streetAddress: address,
        facilityName: name,
        city: city || '',
        state: state || 'Uttar Pradesh',
        pincode: pincode || '',
        landmark: landmark || '',
        contactPhone: phone || session?.user?.mobile || '',
      };
      const res = await api.addAddress(addressData);
      const newAddressId = res?.data?._id || res?.data?.id || res?._id || res?.id;
      alertService.success('Success', `Delivery facility "${name}" saved successfully.`, () => {
        navigation.navigate('CheckoutPayment', { selectedAddressId: String(newAddressId || '') });
      });
    } catch (err) {
      alertService.error('Error', err.message || 'Failed to save address');
    } finally {
      setLoading(false);
    }
  };

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
          <Text className="text-base font-bold text-[#131b2e]">Add New Facility</Text>
        </View>
        <RSLogo size="sm" showText={false} />
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 40 + insets.bottom }}>
        {/* GPS Auto-Detect Banner */}
        <Pressable
          onPress={handleDetectGPS}
          disabled={detectingGps}
          className="bg-[#eef2ff] border border-[#c7d2fe] rounded-2xl p-3.5 mb-4 flex-row items-center justify-between active:opacity-80"
        >
          <View className="flex-row items-center gap-3 flex-1">
            <View className="w-10 h-10 rounded-full bg-[#3b82f6] justify-center items-center">
              {detectingGps ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Icon name="my-location" size={20} color="#ffffff" />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-xs font-bold text-[#1e3a8a]">Auto-Detect via GPS</Text>
              <Text className="text-[11px] text-[#475569]">
                {detectingGps ? 'Locating via satellite...' : 'Tap to automatically fill street, city & pincode'}
              </Text>
            </View>
          </View>
          <Icon name="chevron-right" size={20} color="#3b82f6" />
        </Pressable>

        <View className="bg-white rounded-2xl p-4 shadow-sm border border-[#eaedff] gap-4">
          <View>
            <Text className="text-xs font-bold text-[#131b2e] mb-1.5">Facility / Godown Name *</Text>
            <TextInput
              placeholder="e.g. Kanpur Godown No. 2"
              value={name}
              onChangeText={setName}
              className="bg-[#f2f3ff] rounded-xl px-3 h-11 text-xs text-[#131b2e]"
            />
          </View>

          <View>
            <Text className="text-xs font-bold text-[#131b2e] mb-1.5">Full Street Address *</Text>
            <TextInput
              placeholder="Plot/Shed No, Road Name, Industrial Area"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={3}
              className="bg-[#f2f3ff] rounded-xl px-3 py-2 text-xs text-[#131b2e] min-h-[70px]"
            />
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-xs font-bold text-[#131b2e] mb-1.5">Landmark</Text>
              <TextInput
                placeholder="e.g. Near Industrial Substation"
                value={landmark}
                onChangeText={setLandmark}
                className="bg-[#f2f3ff] rounded-xl px-3 h-11 text-xs text-[#131b2e]"
              />
            </View>
            <View className="w-32">
              <View className="flex-row items-center justify-between mb-1.5">
                <Text className="text-xs font-bold text-[#131b2e]">Pincode *</Text>
                {fetchingPin && <ActivityIndicator size="small" color="#006948" />}
              </View>
              <TextInput
                placeholder="6-digit PIN"
                placeholderTextColor="#6d7a72"
                keyboardType="numeric"
                maxLength={6}
                value={pincode}
                onChangeText={handlePincodeChange}
                className="bg-[#f2f3ff] rounded-xl px-3 h-11 text-xs text-[#131b2e]"
              />
            </View>
          </View>

          {/* Serviceability Alert for this pincode */}
          {serviceStatus && (
            <View
              className={`p-3 rounded-xl flex-row items-center gap-2.5 ${
                serviceStatus.isServiceable ? 'bg-[#dcfce7] border border-[#86efac]' : 'bg-[#fff1f2] border border-[#fecdd3]'
              }`}
            >
              <Icon
                name={serviceStatus.isServiceable ? 'check-circle' : 'location-off'}
                size={18}
                color={serviceStatus.isServiceable ? '#15803d' : '#e11d48'}
              />
              <Text
                className={`text-[11px] font-semibold flex-1 ${
                  serviceStatus.isServiceable ? 'text-[#15803d]' : 'text-[#9f1239]'
                }`}
              >
                {serviceStatus.message}
              </Text>
            </View>
          )}

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-xs font-bold text-[#131b2e] mb-1.5">City</Text>
              <TextInput
                placeholder="City (Auto-filled)"
                placeholderTextColor="#6d7a72"
                value={city}
                onChangeText={setCity}
                className="bg-[#f2f3ff] rounded-xl px-3 h-11 text-xs text-[#131b2e]"
              />
            </View>
            <View className="flex-1">
              <Text className="text-xs font-bold text-[#131b2e] mb-1.5">State</Text>
              <TextInput
                placeholder="State"
                placeholderTextColor="#6d7a72"
                value={state}
                onChangeText={setState}
                className="bg-[#f2f3ff] rounded-xl px-3 h-11 text-xs text-[#131b2e]"
              />
            </View>
          </View>

          <View>
            <Text className="text-xs font-bold text-[#131b2e] mb-1.5">Facility Contact Phone</Text>
            <TextInput
              placeholder="+91 98765 00000"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              className="bg-[#f2f3ff] rounded-xl px-3 h-11 text-xs text-[#131b2e]"
            />
          </View>

          <Pressable
            onPress={handleSave}
            disabled={loading}
            className={`rounded-xl py-3.5 mt-2 items-center shadow-sm active:opacity-90 flex-row justify-center gap-2 ${
              loading ? 'bg-[#006948]/40' : 'bg-[#006948]'
            }`}
          >
            {loading ? (
              <>
                <ActivityIndicator color="#ffffff" size="small" />
                <Text className="text-white font-bold text-xs uppercase tracking-wider">Saving...</Text>
              </>
            ) : (
              <Text className="text-white font-bold text-xs uppercase tracking-wider">Save Delivery Facility</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
