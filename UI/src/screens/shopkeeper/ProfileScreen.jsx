import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import RSLogo from '../../components/RSLogo';
import { useAuthStore } from '../../store/authStore';

export default function ProfileScreen({ navigation }) {
  const { session, logout, updateProfile } = useAuthStore();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState(session?.user?.name || session?.user?.shopName || '');
  const [editMobile, setEditMobile] = useState(session?.mobile || session?.user?.mobile || '');
  const [updating, setUpdating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

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

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout from RS Industries?', [
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
          : null;

        if (!base64Data) {
          Alert.alert('Error', 'Could not read image file.');
          return;
        }

        setUploadingImage(true);
        const res = await updateProfile({ avatarUrl: base64Data });
        if (res && res.success) {
          Alert.alert('Success', 'Profile picture updated successfully!');
        }
      }
    } catch (err) {
      Alert.alert('Upload Failed', err.message || 'Could not upload profile picture.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    const cleanedMobile = editMobile ? String(editMobile).replace(/\D/g, '').slice(-10) : '';
    if (cleanedMobile && cleanedMobile.length !== 10) {
      Alert.alert('Error', 'Mobile number must be a valid 10-digit number.');
      return;
    }

    setUpdating(true);
    try {
      await updateProfile({
        name: editName.trim(),
        mobile: cleanedMobile,
      });
      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  // Render Guest Account Login Required View if user is not logged in
  if (!session) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-[#faf8ff]">
        {/* Top Header */}
        <View className="bg-white border-b border-[#dae2fd] px-4 py-3 flex-row items-center justify-between shadow-sm z-10">
          <RSLogo size="md" />
          <TouchableOpacity
            onPress={() => navigation.navigate('Login', { returnScreen: 'Profile' })}
            activeOpacity={0.7}
            className="bg-[#006948] px-3.5 py-1.5 rounded-full flex-row items-center gap-1 shadow-sm"
          >
            <Icon name="login" size={16} color="#ffffff" />
            <Text className="text-xs text-white font-bold">Log In</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          className="flex-1 px-4 pt-6"
        >
          {/* Guest Account Banner Card */}
          <View className="bg-white rounded-3xl p-6 items-center shadow-sm border border-[#eaedff] mb-4">
            <View className="w-20 h-20 rounded-full bg-[#006948]/10 justify-center items-center mb-4">
              <Icon name="person-outline" size={44} color="#006948" />
            </View>
            <Text className="text-lg font-black text-[#131b2e] text-center">
              Welcome to RS Industries Portal
            </Text>
            <Text className="text-xs text-[#3d4a42] text-center mt-1.5 px-2 leading-relaxed">
              Log in with your Google account to track dispatches, inspect GST invoices, and access your profile.
            </Text>

            <TouchableOpacity
              onPress={() => navigation.navigate('Login', { returnScreen: 'Profile' })}
              activeOpacity={0.85}
              className="bg-[#006948] w-full rounded-2xl py-3.5 items-center justify-center flex-row gap-2 mt-6 shadow-md"
            >
              <Icon name="login" size={20} color="#ffffff" />
              <Text className="text-sm text-white font-extrabold">Log In / Register with Google</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const avatarUri = session.user?.avatarUrl || session.user?.avatar || null;

  const userMobile = session.mobile || session.user?.mobile || '';

  // Render Full User Profile View for Authenticated Partners
  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-[#faf8ff]">
      {/* Top Header */}
      <View className="bg-white border-b border-[#dae2fd] px-4 py-3 flex-row items-center justify-between shadow-sm z-10">
        <RSLogo size="md" />
        <View className="bg-[#99efe5] px-2.5 py-1 rounded-full border border-[#006f67]/20">
          <Text className="text-xs text-[#006f67] font-bold">GST Verified</Text>
        </View>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* User Card */}
        <View className="bg-[#006948] px-6 py-6 items-center relative">
          {/* Avatar with Camera Upload Badge */}
          <View className="relative mb-3">
            <View className="w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-md bg-white/20 justify-center items-center">
              {uploadingImage ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Image
                  source={{ uri: avatarUri }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              )}
            </View>

            <TouchableOpacity
              onPress={handlePickProfileImage}
              disabled={uploadingImage}
              activeOpacity={0.8}
              className="absolute bottom-0 right-0 bg-[#002114] w-8 h-8 rounded-full border-2 border-white items-center justify-center shadow"
            >
              <Icon name="photo-camera" size={16} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handlePickProfileImage}
            disabled={uploadingImage}
            className="mb-2"
          >
            <Text className="text-[11px] text-[#85f8c4] font-bold">
              📷 Tap to change profile picture
            </Text>
          </TouchableOpacity>

          <View className="flex-row items-center gap-2 justify-center">
            <Text className="text-white text-lg font-bold">
              {session.user?.name || session.user?.shopName || 'Registered Customer'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setEditName(session.user?.name || session.user?.shopName || '');
                setEditMobile(session.mobile || session.user?.mobile || '');
                setEditModalVisible(true);
              }}
              className="bg-white/20 p-1.5 rounded-full"
            >
              <Icon name="edit" size={14} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <Text className="text-[#85f8c4] text-xs font-semibold mt-0.5">
            {userMobile ? `Mobile: ${userMobile}` : 'Mobile: Not Set (Required for Orders)'} • {session.user?.email || 'Google Account'}
          </Text>
        </View>

        {/* Quick Settings Links */}
        <View className="px-4 py-2">
          <View className="bg-white rounded-2xl p-2 shadow-sm border border-[#eaedff]">
            <TouchableOpacity
              onPress={() => navigation.navigate('AddressList')}
              activeOpacity={0.7}
              className="flex-row items-center justify-between p-3 border-b border-[#f2f3ff]"
            >
              <View className="flex-row items-center gap-3">
                <Icon name="location-on" size={20} color="#006948" />
                <Text className="text-xs font-bold text-[#131b2e]">Manage Delivery Address</Text>
              </View>
              <Icon name="chevron-right" size={20} color="#006948" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('AboutUs')}
              activeOpacity={0.7}
              className="flex-row items-center justify-between p-3 border-b border-[#f2f3ff]"
            >
              <View className="flex-row items-center gap-3">
                <Icon name="info" size={20} color="#006948" />
                <Text className="text-xs font-bold text-[#131b2e]">About RS Industries</Text>
              </View>
              <Icon name="chevron-right" size={20} color="#006948" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Support')}
              activeOpacity={0.7}
              className="flex-row items-center justify-between p-3"
            >
              <View className="flex-row items-center gap-3">
                <Icon name="headset-mic" size={20} color="#3d4a42" />
                <Text className="text-xs font-bold text-[#131b2e]">Support & Ticket Helpdesk</Text>
              </View>
              <Icon name="chevron-right" size={20} color="#6d7a72" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Action */}
        <View className="px-4 pt-4">
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.85}
            className="bg-[#ba1a1a]/10 rounded-2xl py-3.5 items-center border border-[#ba1a1a]/20"
          >
            <Text className="text-xs font-bold text-[#ba1a1a]">Logout Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Profile Modal (Name & Mobile Number) */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-lg">
            <Text className="text-lg font-bold text-[#131b2e] mb-1">Edit Profile Details</Text>
            <Text className="text-xs text-[#6d7a72] mb-4">
              Your 10-digit mobile number is mandatory to place orders.
            </Text>

            <View className="mb-3">
              <Text className="text-[10px] font-bold text-[#6d7a72] mb-1 uppercase">Full Name</Text>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter your name"
                placeholderTextColor="#6d7a72"
                className="bg-[#f2f3ff] rounded-xl px-4 py-2.5 text-[#131b2e] font-semibold text-sm"
                editable={!updating}
              />
            </View>

            <View className="mb-5">
              <Text className="text-[10px] font-bold text-[#6d7a72] mb-1 uppercase">
                10-Digit Mobile Number (Mandatory for Orders)
              </Text>
              <TextInput
                value={editMobile}
                onChangeText={(t) => setEditMobile(t.replace(/\D/g, '').slice(0, 10))}
                keyboardType="phone-pad"
                maxLength={10}
                placeholder="e.g. 9876543210"
                placeholderTextColor="#6d7a72"
                className="bg-[#f2f3ff] rounded-xl px-4 py-2.5 text-[#131b2e] font-semibold text-sm"
                editable={!updating}
              />
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                disabled={updating}
                className="flex-1 bg-[#f2f3ff] rounded-xl py-3 items-center"
              >
                <Text className="text-[#131b2e] font-bold text-xs">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveProfile}
                disabled={updating}
                className="flex-1 bg-[#006948] rounded-xl py-3 items-center flex-row justify-center gap-2"
              >
                {updating ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <>
                    <Icon name="check" size={16} color="#ffffff" />
                    <Text className="text-white font-bold text-xs">Save</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
