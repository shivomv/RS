import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  BackHandler,
  TextInput,
  Modal,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAuthStore } from '../../store/authStore';

/**
 * Blinkit-Style Account & Profile Screen
 * - Clean white card sections with subtle borders
 * - Verified B2B Customer badge
 * - Instant access to addresses, orders, support, and company details
 */
export default function ProfileScreen({ navigation }) {
  const { session, logout, updateProfile } = useAuthStore();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(session?.user?.name || session?.user?.shopName || '');
  const [editMobile, setEditMobile] = useState(session?.mobile || session?.user?.mobile || '');
  const [updating, setUpdating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Hardware Back Handler
  useEffect(() => {
    const onBackPress = () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
        return true;
      }
      navigation.navigate('ShopHome');
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [navigation]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out from RS Industries?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: () => {
          logout();
          navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
        style: 'destructive',
      },
    ]);
  };

  const handlePickProfileImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        includeBase64: true,
        quality: 0.7,
        maxWidth: 600,
        maxHeight: 600,
      });

      if (!result.didCancel && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const base64Data = asset.base64
          ? `data:${asset.type || 'image/jpeg'};base64,${asset.base64}`
          : asset.uri;

        setUploadingImage(true);
        await updateProfile({ avatarUrl: base64Data });
        Alert.alert('Success', 'Profile picture updated successfully!');
      }
    } catch (err) {
      Alert.alert('Upload Error', err.message || 'Could not update profile picture.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Name cannot be empty.');
      return;
    }
    const cleanMobile = editMobile.replace(/\D/g, '').slice(-10);
    if (!cleanMobile || cleanMobile.length !== 10) {
      Alert.alert('Invalid Mobile', 'Please provide a valid 10-digit mobile number.');
      return;
    }

    setUpdating(true);
    try {
      await updateProfile({
        name: editName.trim(),
        shopName: editName.trim(),
        mobile: cleanMobile,
      });
      setEditModalVisible(false);
      Alert.alert('Success', 'Profile details updated.');
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update profile.');
    } finally {
      setUpdating(false);
    }
  };

  if (!session) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-[#f8fafc]">
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View className="bg-white border-b border-[#e2e8f0] px-4 py-3 flex-row items-center justify-between shadow-xs">
          <Text className="text-base font-black text-[#0f172a]">My Account</Text>
        </View>

        <ScrollView contentContainerStyle={{ padding: 24, alignItems: 'center' }} className="flex-1">
          <View className="w-18 h-18 rounded-full bg-[#f1f5f9] justify-center items-center mb-3 mt-12 border border-[#e2e8f0]">
            <Icon name="person-outline" size={36} color="#94a3b8" />
          </View>
          <Text className="text-base font-black text-[#0f172a] text-center">
            Welcome to RS Industries
          </Text>
          <Text className="text-xs text-[#64748b] text-center mt-1 px-4 leading-relaxed">
            Log in to manage wholesale orders, check saved delivery addresses, and track real-time dispatches.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
            className="mt-6 bg-[#006948] px-6 py-2.5 rounded-xl shadow-xs"
          >
            <Text className="text-xs font-black text-white uppercase tracking-wider">Log In / Register</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const avatarUri = session.user?.avatarUrl || session.user?.avatar || null;
  const userMobile = session.mobile || session.user?.mobile || '';

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-[#f8fafc]">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Top Header */}
      <View className="bg-white border-b border-[#e2e8f0] px-4 py-2.5 flex-row items-center justify-between shadow-xs">
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 rounded-lg bg-[#006948] justify-center items-center">
            <Icon name="person" size={18} color="#ffffff" />
          </View>
          <View>
            <Text className="text-sm font-black text-[#0f172a]">My Account</Text>
            <Text className="text-[10px] text-[#64748b]">B2B Wholesale Partner</Text>
          </View>
        </View>
        <View className="bg-[#f0fdf4] border border-[#bbf7d0] px-2.5 py-0.5 rounded-full">
          <Text className="text-[10px] font-black text-[#006948]">Verified Buyer</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ padding: 12, paddingBottom: 60 }}
      >
        {/* Blinkit Profile Identity Card */}
        <View className="bg-white rounded-2xl p-4 border border-[#e2e8f0] shadow-xs mb-3 flex-row items-center gap-3.5">
          <TouchableOpacity
            onPress={handlePickProfileImage}
            activeOpacity={0.8}
            className="relative"
          >
            <View className="w-16 h-16 rounded-full overflow-hidden bg-[#f1f5f9] border border-[#cbd5e1] justify-center items-center">
              {uploadingImage ? (
                <ActivityIndicator size="small" color="#006948" />
              ) : avatarUri ? (
                <Image source={{ uri: avatarUri }} className="w-full h-full" resizeMode="cover" />
              ) : (
                <Icon name="person" size={32} color="#94a3b8" />
              )}
            </View>
            <View className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-[#006948] justify-center items-center border border-white">
              <Icon name="photo-camera" size={10} color="#ffffff" />
            </View>
          </TouchableOpacity>

          <View className="flex-1">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-black text-[#0f172a]" numberOfLines={1}>
                {session.user?.name || session.user?.shopName || 'Registered Customer'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setEditName(session.user?.name || session.user?.shopName || '');
                  setEditMobile(session.mobile || session.user?.mobile || '');
                  setEditModalVisible(true);
                }}
                className="p-1 bg-[#f1f5f9] rounded-lg"
              >
                <Icon name="edit" size={14} color="#006948" />
              </TouchableOpacity>
            </View>
            <Text className="text-xs text-[#006948] font-bold mt-0.5">
              📞 {userMobile ? `+91 ${userMobile}` : 'Mobile not set'}
            </Text>
            <Text className="text-[10px] text-[#64748b] mt-0.5" numberOfLines={1}>
              ✉️ {session.user?.email || 'Google Account'}
            </Text>
          </View>
        </View>

        {/* Quick Account Links */}
        <View className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs mb-3 overflow-hidden">
          <TouchableOpacity
            onPress={() => navigation.navigate('AddressList')}
            activeOpacity={0.7}
            className="flex-row items-center justify-between p-3.5 border-b border-[#f1f5f9]"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] justify-center items-center">
                <Icon name="place" size={18} color="#006948" />
              </View>
              <View>
                <Text className="text-xs font-black text-[#0f172a]">Manage Delivery Addresses</Text>
                <Text className="text-[10px] text-[#64748b]">Set wholesale warehouse and retail shops</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={20} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Orders')}
            activeOpacity={0.7}
            className="flex-row items-center justify-between p-3.5 border-b border-[#f1f5f9]"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] justify-center items-center">
                <Icon name="receipt" size={18} color="#006948" />
              </View>
              <View>
                <Text className="text-xs font-black text-[#0f172a]">Your Orders</Text>
                <Text className="text-[10px] text-[#64748b]">Track current dispatches and invoices</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={20} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Support')}
            activeOpacity={0.7}
            className="flex-row items-center justify-between p-3.5 border-b border-[#f1f5f9]"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] justify-center items-center">
                <Icon name="support-agent" size={18} color="#006948" />
              </View>
              <View>
                <Text className="text-xs font-black text-[#0f172a]">Customer Support & Queries</Text>
                <Text className="text-[10px] text-[#64748b]">Chat with RS chemical experts</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={20} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('AboutUs')}
            activeOpacity={0.7}
            className="flex-row items-center justify-between p-3.5"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-xl bg-[#f0fdf4] border border-[#bbf7d0] justify-center items-center">
                <Icon name="business" size={18} color="#006948" />
              </View>
              <View>
                <Text className="text-xs font-black text-[#0f172a]">About RS Industries</Text>
                <Text className="text-[10px] text-[#64748b]">Certifications, plants, and wholesale policies</Text>
              </View>
            </View>
            <Icon name="chevron-right" size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.8}
          className="bg-white rounded-2xl p-3.5 border border-[#fecdd3] shadow-xs flex-row items-center justify-center gap-2"
        >
          <Icon name="logout" size={18} color="#e11d48" />
          <Text className="text-xs font-black text-[#e11d48] uppercase tracking-wider">Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-center items-center px-4">
          <View className="bg-white rounded-3xl p-5 w-full max-w-sm border border-[#e2e8f0]">
            <Text className="text-base font-black text-[#0f172a] mb-1">Edit Account Info</Text>
            <Text className="text-xs text-[#64748b] mb-4">Update your business name and mobile</Text>

            <Text className="text-[11px] font-bold text-[#0f172a] mb-1">Full Name / Shop Name</Text>
            <TextInput
              value={editName}
              onChangeText={setEditName}
              className="bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-3 h-11 text-xs font-semibold text-[#0f172a] mb-3"
            />

            <Text className="text-[11px] font-bold text-[#0f172a] mb-1">10-Digit Mobile Number</Text>
            <TextInput
              value={editMobile}
              onChangeText={setEditMobile}
              keyboardType="phone-pad"
              maxLength={10}
              className="bg-[#f8fafc] border border-[#cbd5e1] rounded-xl px-3 h-11 text-xs font-semibold text-[#0f172a] mb-5"
            />

            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#f1f5f9] items-center"
              >
                <Text className="text-xs font-bold text-[#64748b]">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveProfile}
                disabled={updating}
                className="flex-1 py-2.5 rounded-xl bg-[#006948] items-center"
              >
                {updating ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text className="text-xs font-black text-white">Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
