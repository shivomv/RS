import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/app_theme.dart';
import 'core/app_routes.dart';
import 'core/app_route_names.dart';
import 'providers/cart_provider.dart';
import 'providers/product_provider.dart';
import 'providers/shopkeeper_provider.dart';
import 'providers/order_provider.dart';
import 'providers/auth_provider.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => CartProvider()),
        ChangeNotifierProvider(create: (_) => ProductProvider()),
        ChangeNotifierProvider(create: (_) => ShopkeeperProvider()),
        ChangeNotifierProvider(create: (_) => OrderProvider()),
        ChangeNotifierProvider(create: (_) => AuthProvider()),
      ],
      child: const RSIndustriesApp(),
    ),
  );
}

class RSIndustriesApp extends StatelessWidget {
  const RSIndustriesApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'RS Industries',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      initialRoute: AppRouteNames.splash,
      onGenerateRoute: (settings) => AppRoutes.onGenerateRoute(
        settings,
        context.read<AuthProvider>(),
      ),
    );
  }
}
