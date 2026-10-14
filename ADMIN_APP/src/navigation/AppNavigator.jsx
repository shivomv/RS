import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import ProductManagementScreen from '../screens/ProductManagementScreen';
import OrderManagementScreen from '../screens/OrderManagementScreen';
import CategoryManagementScreen from '../screens/CategoryManagementScreen';
import BuyerManagementScreen from '../screens/BuyerManagementScreen';
import SupportTicketScreen from '../screens/SupportTicketScreen';
import BannerManagementScreen from '../screens/BannerManagementScreen';
import AboutManagementScreen from '../screens/AboutManagementScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#f1f5f9' },
      }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="ProductList" component={ProductManagementScreen} />
      <Stack.Screen name="OrderList" component={OrderManagementScreen} />
      <Stack.Screen name="CategoryList" component={CategoryManagementScreen} />
      <Stack.Screen name="BuyerList" component={BuyerManagementScreen} />
      <Stack.Screen name="TicketList" component={SupportTicketScreen} />
      <Stack.Screen name="BannerList" component={BannerManagementScreen} />
      <Stack.Screen name="AboutList" component={AboutManagementScreen} />
    </Stack.Navigator>
  );
}
