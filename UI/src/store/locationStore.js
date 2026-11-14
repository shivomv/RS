import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { api } from '../services/api';

const LOCATION_STORAGE_KEY = 'rs_buyer_selected_location';

export const useLocationStore = create((set, get) => ({
  location: null,
  isModalOpen: false,
  isLoading: false,
  error: null,
  initialized: false,

  openModal: () => set({ isModalOpen: true, error: null }),
  closeModal: () => set({ isModalOpen: false, error: null }),

  initLocation: async () => {
    try {
      const saved = await AsyncStorage.getItem(LOCATION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        set({ location: parsed, initialized: true });
        return;
      }
    } catch (err) {
      console.warn('[LocationStore] Failed to read saved location:', err);
    }
    set({ location: null, initialized: true });
  },

  setPincode: async (pincode) => {
    const cleanPincode = String(pincode || '').replace(/\D/g, '').slice(0, 6);
    if (!cleanPincode || cleanPincode.length !== 6) {
      set({ error: 'Please enter a valid 6-digit PIN code.' });
      return false;
    }

    set({ isLoading: true, error: null });
    try {
      const res = await api.checkServiceability(cleanPincode);
      const newLoc = {
        pincode: cleanPincode,
        city: res.city || '',
        state: res.state || '',
        area: res.district || res.city || '',
        formattedAddress: [res.city, res.state, cleanPincode].filter(Boolean).join(', '),
        isServiceable: Boolean(res.isServiceable),
        hubName: res.hubName || '',
        estimatedDays: res.estimatedDays || '',
        message: res.message || '',
        source: 'manual',
      };

      await AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(newLoc));
      set({ location: newLoc, isLoading: false, isModalOpen: false, error: null });
      return true;
    } catch (err) {
      set({ isLoading: false, error: err.message || 'Failed to check PIN code.' });
      return false;
    }
  },

  detectGpsLocation: async () => {
    set({ isLoading: true, error: null });

    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'RS Industries requires GPS access to check delivery serviceability.',
            buttonNeutral: 'Ask Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'Allow',
          }
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          set({
            isLoading: false,
            error: 'Location permission was denied. Enter 6-digit PIN code manually.',
          });
          return false;
        }
      }

      return new Promise((resolve) => {
        Geolocation.getCurrentPosition(
          async (pos) => {
            try {
              const { latitude, longitude } = pos.coords;
              const res = await api.reverseGeocode(latitude, longitude);

              const cleanPin = res.pincode || '';
              const newLoc = {
                pincode: cleanPin,
                city: res.city || '',
                state: res.state || '',
                area: res.area || '',
                formattedAddress: res.formattedAddress || '',
                streetAddress: res.streetAddress || '',
                isServiceable: Boolean(res.isServiceable),
                hubName: res.hubName || '',
                estimatedDays: res.estimatedDays || '',
                message: res.message || '',
                source: 'gps',
                latitude,
                longitude,
              };

              await AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(newLoc));
              set({ location: newLoc, isLoading: false, isModalOpen: false, error: null });
              resolve(true);
            } catch (err) {
              set({
                isLoading: false,
                error: err.message || 'Could not resolve address from GPS.',
              });
              resolve(false);
            }
          },
          (err) => {
            console.warn('[LocationStore] Geolocation error:', err);
            set({
              isLoading: false,
              error: 'GPS signal unavailable. Please enter PIN code manually.',
            });
            resolve(false);
          },
          { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
        );
      });
    } catch (err) {
      set({ isLoading: false, error: err.message || 'GPS location detection failed.' });
      return false;
    }
  },

  selectAddressLocation: async (address) => {
    if (!address || !address.pincode) return;
    const cleanPincode = String(address.pincode).replace(/\D/g, '').slice(0, 6);

    set({ isLoading: true, error: null });
    try {
      const res = await api.checkServiceability(cleanPincode);
      const newLoc = {
        pincode: cleanPincode,
        city: address.city || res.city || '',
        state: address.state || res.state || '',
        area: address.streetAddress || address.facilityName || '',
        formattedAddress: address.fullAddress || `${address.city || res.city} - ${cleanPincode}`,
        isServiceable: Boolean(res.isServiceable),
        hubName: res.hubName || '',
        estimatedDays: res.estimatedDays || '',
        message: res.message || '',
        source: 'address',
      };

      await AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(newLoc));
      set({ location: newLoc, isLoading: false, isModalOpen: false, error: null });
    } catch (err) {
      set({ isLoading: false, error: err.message });
    }
  },
}));
