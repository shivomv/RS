import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useAuthStore } from '../store/authStore';
import { COLORS } from '../config/theme';

// Auth Screens
import SplashScreen from '../screens/auth/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Shopkeeper Screens
import HomeScreen from '../screens/shopkeeper/HomeScreen';
import CatalogScreen from '../screens/shopkeeper/CatalogScreen';
import CartScreen from '../screens/shopkeeper/CartScreen';
import OrdersScreen from '../screens/shopkeeper/OrdersScreen';
import ProfileScreen from '../screens/shopkeeper/ProfileScreen';
import ProductDetailScreen from '../screens/shopkeeper/ProductDetailScreen';
import OutstandingScreen from '../screens/shopkeeper/OutstandingScreen';

// Admin Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import ProductManagementScreen from '../screens/admin/ProductManagementScreen';
import ShopkeeperManagementScreen from '../screens/admin/ShopkeeperManagementScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Splash" component={SplashScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const ShopkeeperTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === 'HomeTab') iconName = 'home';
        else if (route.name === 'CatalogTab') iconName = 'grid';
        else if (route.name === 'CartTab') iconName = 'shopping-cart';
        else if (route.name === 'OrdersTab') iconName = 'clipboard';
        else if (route.name === 'ProfileTab') iconName = 'user';
        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: '#94a3b8',
      tabBarStyle: {
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        paddingVertical: 8,
        height: 64,
      },
      tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
    })}
  >
    <Tab.Screen
      name="HomeTab"
      component={HomeScreen}
      options={{ tabBarLabel: 'Home' }}
    />
    <Tab.Screen
      name="CatalogTab"
      component={CatalogScreen}
      options={{ tabBarLabel: 'Catalog' }}
    />
    <Tab.Screen
      name="CartTab"
      component={CartScreen}
      options={{ tabBarLabel: 'Cart' }}
    />
    <Tab.Screen
      name="OrdersTab"
      component={OrdersScreen}
      options={{ tabBarLabel: 'Orders' }}
    />
    <Tab.Screen
      name="ProfileTab"
      component={ProfileScreen}
      options={{ tabBarLabel: 'Profile' }}
    />
  </Tab.Navigator>
);

const ShopkeeperStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="ShopkeeperTabs" component={ShopkeeperTabs} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <Stack.Screen name="Outstanding" component={OutstandingScreen} />
  </Stack.Navigator>
);

const AdminStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
    <Stack.Screen name="ProductManagement" component={ProductManagementScreen} />
    <Stack.Screen name="ShopkeeperManagement" component={ShopkeeperManagementScreen} />
  </Stack.Navigator>
);

export const RootNavigator = () => {
  const { session, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.surface }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!session ? (
        <AuthStack />
      ) : session.role === 'admin' ? (
        <AdminStack />
      ) : (
        <ShopkeeperStack />
      )}
    </NavigationContainer>
  );
};
