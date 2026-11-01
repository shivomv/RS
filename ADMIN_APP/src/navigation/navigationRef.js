import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

let tabListener = null;

export function setTabListener(fn) {
  tabListener = fn;
  return () => {
    tabListener = null;
  };
}

const TAB_MAP = {
  Dashboard: 'dashboard',
  ProductList: 'products',
  OrderList: 'orders',
  CategoryList: 'categories',
  BuyerList: 'buyers',
  TicketList: 'tickets',
  BannerList: 'banners',
  AboutList: 'about',
  AdminList: 'admins',
  Settings: 'settings',
};

export function navigate(name, params) {
  if (TAB_MAP[name] && tabListener) {
    tabListener(TAB_MAP[name], params);
    return;
  }
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}
