import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import RSLogo from '../../components/RSLogo';
import { AddressSkeleton } from '../../components/Skeleton';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import { alertService, useAlertStore } from '../../services/alertService';

export default function AddressListScreen({ navigation }) {
  const { session } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState([]);

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

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    const loadAddresses = async () => {
      try {
        setLoading(true);
        const res = await api.getAddresses(session.user._id);
        const addressList = res || [];
        
        // Transform API response to match UI format
        const formattedAddresses = addressList.map((addr) => ({
          id: addr._id,
          title: addr.facilityName || 'Facility',
          address: addr.streetAddress,
          contact: addr.contactPhone || 'N/A',
          isDefault: addr.isDefault || false,
        }));
        
        if (isMounted) {
          setAddresses(formattedAddresses);
        }
      } catch (err) {
        console.error('[AddressList] Load error:', err.message);
        if (isMounted) {
          setAddresses([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadAddresses();
    
    return () => {
      isMounted = false;
    };
  }, [session]);

  const handleSetDefault = (id) => {
    const updatedAddresses = addresses.map((item) => ({
      ...item,
      isDefault: item.id === id,
    }));
    setAddresses(updatedAddresses);
    
    // Update on backend
    const selectedAddr = addresses.find(a => a.id === id);
    if (selectedAddr) {
      api.updateAddress(id, { isDefault: true }).catch(err => {
        console.error('[AddressList] Update default error:', err.message);
        // Revert on error
        setAddresses(addresses);
      });
    }
  };

  const handleDelete = (id) => {
    // Show custom confirmation dialog
    const handleConfirmDelete = async () => {
      try {
        await api.deleteAddress(id);
        setAddresses((prev) => prev.filter((item) => item.id !== id));
        alertService.success('Success', 'Address deleted successfully.');
      } catch (err) {
        alertService.error('Error', err.message || 'Failed to delete address');
      }
    };

    // Create a simple confirmation using alert service
    useAlertStore.getState().showAlert({
      title: 'Delete Address',
      message: 'Are you sure you want to remove this delivery facility?',
      type: 'warning',
      duration: 5000,
      buttons: [
        {
          text: 'Cancel',
          onPress: () => useAlertStore.getState().dismissAlert(),
        },
        {
          text: 'Delete',
          onPress: handleConfirmDelete,
          style: 'destructive',
        },
      ],
    });
  };

  if (!session) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-[#faf8ff]">
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
              className="w-9 h-9 rounded-full bg-[#f2f3ff] justify-center items-center border border-[#dae2fd]"
            >
              <Icon name="arrow-back" size={20} color="#131b2e" />
            </TouchableOpacity>
            <RSLogo size="sm" showText={false} />
            <Text className="text-base font-bold text-[#131b2e] ml-1">Shipping Addresses</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: 24, alignItems: 'center' }} className="flex-1">
          <View className="w-20 h-20 rounded-full bg-[#006948]/10 justify-center items-center mb-4 mt-8">
            <Icon name="location-on" size={44} color="#006948" />
          </View>
          <Text className="text-lg font-black text-[#131b2e] text-center">
            Log In to Manage Shipping Addresses
          </Text>
          <Text className="text-xs text-[#3d4a42] text-center mt-2 px-2 leading-relaxed">
            Please log in with your registered mobile number to save and manage your facility delivery addresses.
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login', { returnScreen: 'AddressList' })}
            activeOpacity={0.85}
            className="bg-[#006948] w-full rounded-2xl py-3.5 items-center justify-center flex-row gap-2 mt-8 shadow-md"
          >
            <Icon name="login" size={20} color="#ffffff" />
            <Text className="text-sm text-white font-extrabold">Log In / Register</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-[#faf8ff]">
      {/* Header */}
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
          <Text className="text-base font-bold text-[#131b2e] ml-1">Shipping Addresses</Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('AddAddress')}
          activeOpacity={0.7}
          className="bg-[#006948] px-3 py-1.5 rounded-full flex-row items-center gap-1 shadow-sm"
        >
          <Icon name="add" size={16} color="#ffffff" />
          <Text className="text-xs text-white font-bold">Add Address</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      >
        <Text className="text-xs font-black text-[#131b2e] uppercase tracking-wider mb-3">
          Saved Facilities & Warehouses ({addresses.length})
        </Text>

        {loading ? (
          <View className="gap-y-3">
            <AddressSkeleton />
            <AddressSkeleton />
            <AddressSkeleton />
          </View>
        ) : addresses.length > 0 ? (
          addresses.map((item) => (
            <View
              key={item.id}
              className={`bg-white rounded-2xl p-4 mb-3 shadow-sm border ${
                item.isDefault ? 'border-[#006948]' : 'border-[#eaedff]'
              }`}
            >
              <View className="flex-row justify-between items-start mb-1.5">
                <View className="flex-row items-center gap-2 flex-1 pr-2">
                  <Icon name="business" size={18} color="#006948" />
                  <Text className="text-xs font-bold text-[#131b2e]" numberOfLines={1}>
                    {item.title}
                  </Text>
                </View>
                {item.isDefault ? (
                  <View className="bg-[#85f8c4] px-2 py-0.5 rounded-md">
                    <Text className="text-[9px] text-[#002114] font-bold uppercase">Default</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => handleSetDefault(item.id)}
                    activeOpacity={0.7}
                    className="bg-[#f2f3ff] px-2 py-0.5 rounded-md"
                  >
                    <Text className="text-[9px] text-[#006948] font-bold">Set Default</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Text className="text-xs text-[#3d4a42] leading-relaxed mb-2">{item.address}</Text>

              <View className="flex-row justify-between items-center pt-2 border-t border-[#f2f3ff]">
                <Text className="text-[10px] text-[#6d7a72] font-semibold">Contact: {item.contact}</Text>

                <TouchableOpacity
                  onPress={() => handleDelete(item.id)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  className="p-1"
                >
                  <Icon name="delete-outline" size={18} color="#ba1a1a" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View className="py-12 bg-white/60 rounded-2xl items-center justify-center border border-dashed border-[#bccac0]/50 mt-4">
            <Icon name="location-off" size={32} color="#6d7a72" />
            <Text className="text-xs text-[#131b2e] font-bold mt-2">No saved addresses yet</Text>
            <Text className="text-[10px] text-[#6d7a72] mt-0.5">Tap 'Add Address' to save a delivery facility.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
