import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StatusBar, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';

const API_URL = 'https://rs-gamma-olive.vercel.app/api';

const fallbackProducts = [
  { id: '1', name: 'Industrial Floor Cleaner', category: 'Floor Cleaners', price: 280, stockQuantity: 48, description: 'Heavy-duty cleaner for commercial floors.', imageUrl: '' },
  { id: '2', name: 'Bulk Glass Cleaner', category: 'Glass Cleaners', price: 190, stockQuantity: 32, description: 'Streak-free formula for large surfaces.', imageUrl: '' },
  { id: '3', name: 'Premium Detergent', category: 'Detergents', price: 420, stockQuantity: 65, description: 'High-performance detergent for daily operations.', imageUrl: '' },
  { id: '4', name: 'Warehouse Hardware Kit', category: 'Hardware', price: 760, stockQuantity: 14, description: 'Reliable essentials for maintenance teams.', imageUrl: '' },
];

export default function App() {
  const [screen, setScreen] = useState('splash');
  const [session, setSession] = useState(null);
  const [products, setProducts] = useState(fallbackProducts);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setScreen('login'), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!session) return;
    fetch(`${API_URL}/products`)
      .then((response) => (response.ok ? response.json() : []))
      .then((remoteProducts) => {
        if (Array.isArray(remoteProducts) && remoteProducts.length > 0) {
          setProducts(remoteProducts.map((product) => ({ ...product, id: product._id || product.id })));
        }
      })
      .catch(() => undefined);
  }, [session]);

  const login = (mobile, role) => {
    setSession({ mobile, role });
    setScreen(role === 'admin' ? 'admin' : 'home');
  };

  const logout = () => {
    setSession(null);
    setCart([]);
    setScreen('login');
  };

  const addToCart = (product) => {
    setCart((currentCart) => {
      const existing = currentCart.find((item) => item.id === product.id);
      if (existing) return currentCart.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...currentCart, { ...product, quantity: 1 }];
    });
  };

  if (screen === 'splash') return <SplashScreen />;
  if (screen === 'login' || screen === 'register') return <AuthScreen mode={screen} onLogin={login} onRegister={() => setScreen('login')} />;
  if (session?.role === 'admin') return <AdminShell screen={screen} setScreen={setScreen} onLogout={logout} products={products} />;
  return <BuyerShell screen={screen} setScreen={setScreen} products={products} cart={cart} selectedProduct={selectedProduct} setSelectedProduct={setSelectedProduct} addToCart={addToCart} onLogout={logout} />;
}

function SplashScreen() {
  return <SafeAreaProvider><SafeAreaView className="flex-1 bg-slate-950 items-center justify-center"><StatusBar barStyle="light-content" backgroundColor="#020617" /><View className="w-28 h-28 bg-blue-600 rounded-3xl items-center justify-center"><Icon name="shield" size={48} color="#fff" /><Text className="text-white font-black tracking-[4px] mt-1">RS</Text></View><Text className="text-white text-2xl font-black tracking-[5px] mt-10">RS INDUSTRIES</Text><Text className="text-slate-400 text-xs tracking-[2px] mt-3">DISTRIBUTION COMMAND</Text></SafeAreaView></SafeAreaProvider>;
+}

function AuthScreen({ mode, onLogin, onRegister }) {
  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState('user');
  const [showOtp, setShowOtp] = useState(false);
  const submit = () => {
    if (mode === 'register') return onRegister();
    if (!showOtp) return setShowOtp(true);
    onLogin(mobile || '0000000000', role);
  };
  return <SafeAreaProvider><SafeAreaView className="flex-1 bg-slate-50"><StatusBar barStyle="dark-content" backgroundColor="#f8fafc" /><ScrollView className="flex-1 px-7" contentContainerStyle={{ paddingVertical: 44 }}><View className="flex-row items-center mb-16"><View className="w-1 h-12 bg-blue-600 mr-4" /><View><Text className="text-slate-950 text-xl font-black tracking-[3px]">RS INDUSTRIES</Text><Text className="text-slate-400 text-[10px] tracking-[2px] mt-1">LOGISTICS COMMAND V1.0</Text></View></View><Text className="text-slate-950 text-3xl font-black">{mode === 'login' ? 'PROCUREMENT PORTAL' : 'PARTNER REGISTRATION'}</Text><Text className="text-slate-500 mt-3 leading-6">Access the distribution ledger and manage your bulk inventory orders.</Text>{mode === 'login' && <View className="flex-row bg-slate-200 rounded-xl p-1 mt-9"><ModeButton active={role === 'user'} label="Partner access" onPress={() => setRole('user')} /><ModeButton active={role === 'admin'} label="Admin access" onPress={() => setRole('admin')} /></View>}<Text className="text-slate-500 text-[10px] font-black tracking-[2px] mt-10 mb-3">MOBILE CREDENTIALS</Text><View className="bg-white border-l-2 border-blue-600 px-4 py-1"><TextInput value={mobile} onChangeText={setMobile} keyboardType="phone-pad" placeholder="10-digit mobile number" placeholderTextColor="#94a3b8" className="text-slate-900 text-lg py-4" /></View>{showOtp && mode === 'login' && <View><Text className="text-slate-500 text-[10px] font-black tracking-[2px] mt-8 mb-3">VERIFICATION CODE</Text><TextInput keyboardType="number-pad" maxLength={6} placeholder="Enter OTP" placeholderTextColor="#94a3b8" className="bg-white border-l-2 border-blue-600 px-4 py-4 text-lg" /></View>}<PrimaryButton label={mode === 'register' ? 'SUBMIT REGISTRATION' : showOtp ? 'AUTHORIZE ACCESS' : 'REQUEST TOKEN'} onPress={submit} /><Pressable onPress={onRegister} className="items-center mt-7"><Text className="text-slate-400 text-xs">{mode === 'login' ? 'NEW PARTNER? ' : 'HAVE AN ACCOUNT? '}<Text className="text-blue-600 font-bold">{mode === 'login' ? 'ENROLL NOW' : 'LOGIN SECURELY'}</Text></Text></Pressable></ScrollView></SafeAreaView></SafeAreaProvider>;
}

function BuyerShell({ screen, setScreen, products, cart, selectedProduct, setSelectedProduct, addToCart, onLogout }) {
  const [category, setCategory] = useState('All');
  const categories = ['All', ...new Set(products.map((product) => product.category))];
  const filteredProducts = category === 'All' ? products : products.filter((product) => product.category === category);
  const openProduct = (product) => { setSelectedProduct(product); setScreen('product'); };
  return <SafeAreaProvider><SafeAreaView className="flex-1 bg-slate-50"><StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />{screen === 'home' && <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 120 }}><Header title="RS INDUSTRIES" subtitle="BULK PROCUREMENT PORTAL" /><View className="bg-blue-600 rounded-3xl p-6 mb-6"><Text className="text-blue-100 text-xs font-bold tracking-[2px]">PARTNER DASHBOARD</Text><Text className="text-white text-2xl font-black mt-2">Stock up. Move faster.</Text><Text className="text-blue-100 mt-2 leading-5">Reliable distribution for your next order cycle.</Text><View className="flex-row mt-6"><Stat label="ACTIVE ORDERS" value="03" /><Stat label="OUTSTANDING" value="₹12.4K" /></View></View><SectionTitle title="PRODUCT CATALOG" action="VIEW ALL" onPress={() => setScreen('catalog')} /><ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5">{categories.map((item) => <CategoryChip key={item} label={item} active={category === item} onPress={() => setCategory(item)} />)}</ScrollView><View className="flex-row flex-wrap justify-between">{filteredProducts.map((product) => <ProductCard key={product.id} product={product} onPress={() => openProduct(product)} />)}</View></ScrollView>}{screen === 'catalog' && <Catalog products={filteredProducts} categories={categories} category={category} setCategory={setCategory} onSelect={openProduct} />}{screen === 'product' && selectedProduct && <ProductDetail product={selectedProduct} onBack={() => setScreen('home')} addToCart={addToCart} />}{screen === 'cart' && <Cart cart={cart} setScreen={setScreen} />}{screen === 'orders' && <Orders />}{screen === 'outstanding' && <Outstanding />}{screen === 'profile' && <Profile onLogout={onLogout} setScreen={setScreen} />}<BuyerNav active={screen} setScreen={setScreen} cartCount={cart.length} /></SafeAreaView></SafeAreaProvider>;
}

function Catalog({ products, categories, category, setCategory, onSelect }) { return <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 110 }}><Header title="CATALOG" subtitle="READY TO SHIP INVENTORY" /><ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5">{categories.map((item) => <CategoryChip key={item} label={item} active={category === item} onPress={() => setCategory(item)} />)}</ScrollView><View className="flex-row flex-wrap justify-between">{products.map((product) => <ProductCard key={product.id} product={product} onPress={() => onSelect(product)} />)}</View></ScrollView>; }
function ProductDetail({ product, onBack, addToCart }) { return <ScrollView className="flex-1 px-5"><Pressable onPress={onBack} className="flex-row items-center mt-5 mb-6"><Icon name="arrow-left" size={20} color="#0f172a" /><Text className="text-slate-900 font-bold ml-3">BACK TO CATALOG</Text></Pressable><ProductImage product={product} large /><Text className="text-slate-400 text-xs font-bold tracking-[2px] mt-7">{product.category}</Text><Text className="text-slate-950 text-3xl font-black mt-2">{product.name}</Text><Text className="text-blue-600 text-2xl font-black mt-4">₹{product.price}</Text><Text className="text-slate-500 leading-6 mt-5">{product.description}</Text><PrimaryButton label="ADD TO ORDER" onPress={() => addToCart(product)} /></ScrollView>; }
function Cart({ cart, setScreen }) { const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0); return <ScrollView className="flex-1 px-5"><Header title="ORDER CART" subtitle="REVIEW YOUR PROCUREMENT" />{cart.length === 0 ? <EmptyState icon="shopping-cart" text="Your cart is ready for inventory." /> : cart.map((item) => <View key={item.id} className="bg-white rounded-2xl p-4 mb-3 flex-row items-center"><ProductImage product={item} small /><View className="flex-1 ml-4"><Text className="text-slate-900 font-bold">{item.name}</Text><Text className="text-slate-500 mt-1">{item.quantity} × ₹{item.price}</Text></View><Text className="text-blue-600 font-black">₹{item.price * item.quantity}</Text></View>)}{cart.length > 0 && <View className="border-t border-slate-200 pt-5 mt-3"><View className="flex-row justify-between"><Text className="text-slate-500">TOTAL</Text><Text className="text-slate-950 text-xl font-black">₹{total}</Text></View><PrimaryButton label="PLACE ORDER" onPress={() => setScreen('orders')} /></View>}</ScrollView>; }
function Orders() { return <ScrollView className="flex-1 px-5"><Header title="ORDERS" subtitle="TRACK YOUR DISTRIBUTION CYCLE" /><OrderRow number="RS-1048" status="IN TRANSIT" amount="₹8,420" /><OrderRow number="RS-1042" status="DELIVERED" amount="₹4,180" /><OrderRow number="RS-1039" status="PROCESSING" amount="₹12,760" /></ScrollView>; }
function Outstanding() { return <ScrollView className="flex-1 px-5"><Header title="OUTSTANDING" subtitle="ACCOUNT BALANCE" /><View className="bg-slate-950 rounded-3xl p-6"><Text className="text-slate-400 text-xs font-bold tracking-[2px]">CURRENT BALANCE</Text><Text className="text-white text-4xl font-black mt-3">₹12,400</Text><Text className="text-amber-300 text-xs font-bold mt-3">PAYMENT DUE IN 12 DAYS</Text></View><SectionTitle title="LEDGER ACTIVITY" /><ProfileRow icon="arrow-up-right" label="Invoice RS-1048" value="₹8,420 · 04 Sep 2026" /><ProfileRow icon="check-circle" label="Payment received" value="₹4,180 · 28 Aug 2026" /><ProfileRow icon="arrow-up-right" label="Invoice RS-1039" value="₹12,760 · 21 Aug 2026" /></ScrollView>; }
function Profile({ onLogout, setScreen }) { return <ScrollView className="flex-1 px-5"><Header title="MY ACCOUNT" subtitle="PARTNER PROFILE" /><View className="items-center py-8"><View className="w-24 h-24 rounded-full bg-blue-100 items-center justify-center"><Text className="text-blue-600 text-3xl font-black">SV</Text></View><Text className="text-slate-950 text-2xl font-black mt-4">Suresh Kumar</Text><Text className="text-slate-500 mt-1">Suresh Kirana Store</Text></View><ProfileRow icon="phone" label="Mobile" value="+91 9876543210" /><ProfileRow icon="map-pin" label="Delivery address" value="Shop No. 12, Main Market, Delhi" /><ProfileRow icon="award" label="Account tier" value="Gold partner" /><Pressable onPress={() => setScreen('outstanding')} className="flex-row items-center justify-between bg-white rounded-2xl p-4 mt-2"><View className="flex-row items-center"><Icon name="credit-card" size={20} color="#2563eb" /><Text className="text-slate-900 font-bold ml-4">View outstanding balance</Text></View><Icon name="chevron-right" size={18} color="#94a3b8" /></Pressable><Pressable onPress={onLogout} className="flex-row items-center justify-center mt-6 py-4 border border-red-200 rounded-xl"><Icon name="log-out" size={18} color="#dc2626" /><Text className="text-red-600 font-bold ml-2">LOG OUT</Text></Pressable></ScrollView>; }

function AdminShell({ screen, setScreen, onLogout, products }) { return <SafeAreaProvider><SafeAreaView className="flex-1 bg-slate-950"><StatusBar barStyle="light-content" backgroundColor="#020617" />{screen === 'admin' && <AdminDashboard products={products} setScreen={setScreen} />}{screen === 'adminProducts' && <AdminList title="PRODUCT MANAGEMENT" items={products.map((product) => product.name)} onBack={() => setScreen('admin')} />}{screen === 'adminShopkeepers' && <AdminList title="SHOPKEEPER MANAGEMENT" items={['Suresh Kirana Store', 'Shakti Supermarket', 'Metro Wholesale']} onBack={() => setScreen('admin')} />}<View className="border-t border-slate-800 flex-row justify-around py-4"><AdminNav icon="grid" label="Overview" active={screen === 'admin'} onPress={() => setScreen('admin')} /><AdminNav icon="package" label="Products" active={screen === 'adminProducts'} onPress={() => setScreen('adminProducts')} /><AdminNav icon="users" label="Partners" active={screen === 'adminShopkeepers'} onPress={() => setScreen('adminShopkeepers')} /><AdminNav icon="log-out" label="Exit" onPress={onLogout} /></View></SafeAreaView></SafeAreaProvider>; }
function AdminDashboard({ products, setScreen }) { return <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 30 }}><Text className="text-blue-400 text-xs font-black tracking-[3px] mt-8">RS INDUSTRIES / ADMIN</Text><Text className="text-white text-3xl font-black mt-3">Operations overview</Text><Text className="text-slate-400 mt-2">Monitor inventory, partners, and fulfilment.</Text><View className="flex-row flex-wrap justify-between mt-8"><AdminStat label="ORDERS TODAY" value="24" /><AdminStat label="REVENUE" value="₹84.2K" /><AdminStat label="PARTNERS" value="128" /><AdminStat label="LOW STOCK" value="07" /></View><SectionTitle title="MANAGEMENT" dark /><AdminAction icon="package" label="Product catalog" detail={`${products.length} active SKUs`} onPress={() => setScreen('adminProducts')} /><AdminAction icon="users" label="Shopkeepers" detail="Manage partner accounts" onPress={() => setScreen('adminShopkeepers')} /><AdminAction icon="truck" label="Order queue" detail="12 orders need attention" onPress={() => {}} /></ScrollView>; }
function AdminList({ title, items, onBack }) { return <ScrollView className="flex-1 px-5"><Pressable onPress={onBack} className="flex-row items-center mt-8"><Icon name="arrow-left" size={20} color="#93c5fd" /><Text className="text-blue-300 font-bold ml-3">OVERVIEW</Text></Pressable><Text className="text-white text-2xl font-black mt-8 mb-6">{title}</Text>{items.map((item, index) => <View key={`${item}-${index}`} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-3 flex-row items-center"><View className="w-10 h-10 bg-blue-950 rounded-xl items-center justify-center"><Icon name={title.includes('PRODUCT') ? 'package' : 'user'} size={18} color="#60a5fa" /></View><Text className="text-white font-bold ml-4 flex-1">{item}</Text><Icon name="chevron-right" size={18} color="#64748b" /></View>)}</ScrollView>; }

function Header({ title, subtitle }) { return <View className="pt-6 pb-7"><Text className="text-blue-600 text-xs font-black tracking-[3px]">{subtitle}</Text><Text className="text-slate-950 text-3xl font-black mt-2">{title}</Text></View>; }
function SectionTitle({ title, action, onPress, dark = false }) { return <View className="flex-row justify-between items-center mb-4"><Text className={`${dark ? 'text-white' : 'text-slate-950'} text-lg font-black`}>{title}</Text>{action ? <Pressable onPress={onPress}><Text className="text-blue-600 text-xs font-bold">{action}</Text></Pressable> : null}</View>; }
function ModeButton({ active, label, onPress }) { return <Pressable onPress={onPress} className={`flex-1 py-3 rounded-lg items-center ${active ? 'bg-white shadow-sm' : ''}`}><Text className={`text-xs font-bold ${active ? 'text-blue-600' : 'text-slate-500'}`}>{label}</Text></Pressable>; }
function PrimaryButton({ label, onPress }) { return <Pressable onPress={onPress} className="bg-blue-600 rounded-xl py-4 items-center mt-8 shadow-lg shadow-blue-300"><Text className="text-white font-black tracking-[2px] text-xs">{label}</Text></Pressable>; }
function Stat({ label, value }) { return <View className="mr-8"><Text className="text-blue-200 text-[9px] font-bold tracking-wider">{label}</Text><Text className="text-white text-xl font-black mt-1">{value}</Text></View>; }
function CategoryChip({ label, active, onPress }) { return <Pressable onPress={onPress} className={`px-4 py-3 rounded-xl mr-2 ${active ? 'bg-blue-600' : 'bg-white border border-slate-200'}`}><Text className={`text-xs font-bold ${active ? 'text-white' : 'text-slate-500'}`}>{label}</Text></Pressable>; }
function ProductCard({ product, onPress }) { return <Pressable onPress={onPress} className="bg-white rounded-2xl p-3 mb-4 w-[48%] shadow-sm"><ProductImage product={product} /><Text className="text-slate-400 text-[10px] font-bold mt-3" numberOfLines={1}>{product.category}</Text><Text className="text-slate-900 font-bold mt-1" numberOfLines={2}>{product.name}</Text><Text className="text-blue-600 font-black mt-2">₹{product.price}</Text></Pressable>; }
function ProductImage({ product, small = false, large = false }) { if (product.imageUrl) return <Image source={{ uri: product.imageUrl }} className={`${large ? 'h-64' : small ? 'w-14 h-14' : 'h-32'} w-full rounded-xl`} resizeMode="cover" />; return <View className={`${large ? 'h-64' : small ? 'w-14 h-14' : 'h-32'} ${small ? '' : 'w-full'} bg-blue-50 rounded-xl items-center justify-center`}><Icon name="box" size={large ? 58 : small ? 22 : 34} color="#2563eb" /></View>; }
function BuyerNav({ active, setScreen, cartCount }) { return <View className="absolute bottom-0 left-0 right-0 h-20 bg-white border-t border-slate-200 flex-row justify-around items-center"><NavItem icon="home" label="Home" active={active === 'home'} onPress={() => setScreen('home')} /><NavItem icon="grid" label="Catalog" active={active === 'catalog'} onPress={() => setScreen('catalog')} /><NavItem icon="shopping-cart" label={`Cart${cartCount ? ` (${cartCount})` : ''}`} active={active === 'cart'} onPress={() => setScreen('cart')} /><NavItem icon="clipboard" label="Orders" active={active === 'orders'} onPress={() => setScreen('orders')} /><NavItem icon="user" label="Profile" active={active === 'profile'} onPress={() => setScreen('profile')} /></View>; }
function NavItem({ icon, label, active, onPress }) { return <Pressable onPress={onPress} className="items-center px-2"><Icon name={icon} size={20} color={active ? '#2563eb' : '#94a3b8'} /><Text className={`text-[9px] mt-1 font-bold ${active ? 'text-blue-600' : 'text-slate-400'}`}>{label}</Text></Pressable>; }
function OrderRow({ number, status, amount }) { return <View className="bg-white rounded-2xl p-4 mb-3 flex-row items-center"><View className="w-11 h-11 bg-blue-50 rounded-xl items-center justify-center"><Icon name="truck" size={20} color="#2563eb" /></View><View className="flex-1 ml-4"><Text className="text-slate-900 font-bold">{number}</Text><Text className="text-slate-400 text-xs mt-1">{status}</Text></View><Text className="text-slate-900 font-black">{amount}</Text></View>; }
function ProfileRow({ icon, label, value }) { return <View className="bg-white rounded-2xl p-4 mb-3 flex-row items-center"><Icon name={icon} size={20} color="#2563eb" /><View className="ml-4"><Text className="text-slate-400 text-xs">{label}</Text><Text className="text-slate-900 font-bold mt-1">{value}</Text></View></View>; }
function EmptyState({ icon, text }) { return <View className="items-center py-20"><Icon name={icon} size={42} color="#94a3b8" /><Text className="text-slate-500 mt-4">{text}</Text></View>; }
function AdminStat({ label, value }) { return <View className="bg-slate-900 border border-slate-800 rounded-2xl p-4 w-[48%] mb-3"><Text className="text-slate-500 text-[9px] font-bold tracking-wider">{label}</Text><Text className="text-white text-2xl font-black mt-2">{value}</Text></View>; }
function AdminAction({ icon, label, detail, onPress }) { return <Pressable onPress={onPress} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-3 flex-row items-center"><View className="w-11 h-11 bg-blue-950 rounded-xl items-center justify-center"><Icon name={icon} size={20} color="#60a5fa" /></View><View className="ml-4 flex-1"><Text className="text-white font-bold">{label}</Text><Text className="text-slate-500 text-xs mt-1">{detail}</Text></View><Icon name="chevron-right" size={18} color="#64748b" /></Pressable>; }
function AdminNav({ icon, label, active, onPress }) { return <Pressable onPress={onPress} className="items-center"><Icon name={icon} size={19} color={active ? '#60a5fa' : '#64748b'} /><Text className={`text-[9px] mt-1 ${active ? 'text-blue-300' : 'text-slate-500'}`}>{label}</Text></Pressable>; }
