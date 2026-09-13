import 'package:flutter/material.dart';
import 'app_route_names.dart';
import '../screens/auth/splash_screen.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/register_screen.dart';
import '../screens/dukandaar/catalog_screen.dart';
import '../screens/dukandaar/product_list_screen.dart';
import '../screens/dukandaar/product_detail_screen.dart';
import '../screens/dukandaar/cart_screen.dart';
import '../models/product.dart';
import '../screens/dukandaar/outstanding_screen.dart';
import '../screens/dukandaar/orders_screen.dart';
import '../screens/dukandaar/profile_screen.dart';
import '../screens/admin/admin_dashboard.dart';
import '../screens/admin/product_management.dart';
import '../screens/admin/shopkeeper_management.dart';
import '../providers/auth_provider.dart';

class AppRoutes {
  static const _publicRoutes = {
    AppRouteNames.splash,
    AppRouteNames.login,
    AppRouteNames.register,
  };

  static const _adminRoutes = {
    AppRouteNames.admin,
    AppRouteNames.adminProducts,
    AppRouteNames.adminShopkeepers,
  };

  static Route<dynamic> onGenerateRoute(RouteSettings settings, AuthProvider auth) {
    final name = settings.name ?? AppRouteNames.splash;

    if (!_publicRoutes.contains(name) && !auth.isAuthenticated) {
      return _route(const LoginScreen(), AppRouteNames.login);
    }
    if (_adminRoutes.contains(name) && !auth.isAdmin) {
      return _route(const CatalogScreen(), AppRouteNames.catalog);
    }
    if (_publicRoutes.contains(name) && auth.isAuthenticated && name != AppRouteNames.splash) {
      return _route(const CatalogScreen(), AppRouteNames.catalog);
    }

    switch (name) {
      case AppRouteNames.splash:
        return _route(const SplashScreen(), name);
      case AppRouteNames.login:
        return _route(const LoginScreen(), name);
      case AppRouteNames.register:
        return _route(const RegisterScreen(), name);
      case AppRouteNames.catalog:
        return _route(const CatalogScreen(), name);
      case AppRouteNames.productList:
        return _route(const ProductListScreen(), name);
      case AppRouteNames.productDetail:
        final product = settings.arguments as Product?;
        return product == null
            ? _route(const CatalogScreen(), AppRouteNames.catalog)
            : _route(ProductDetailScreen(product: product), name);
      case AppRouteNames.cart:
        return _route(const CartScreen(), name);
      case AppRouteNames.activeOutstanding:
        return _route(const OutstandingScreen(), name);
      case AppRouteNames.dukandaarOrders:
        return _route(const DukandaarOrdersScreen(), name);
      case AppRouteNames.profile:
        return _route(const DukandaarProfileScreen(), name);
      case AppRouteNames.admin:
        return _route(const AdminDashboard(), name);
      case AppRouteNames.adminProducts:
        return _route(const AdminProductManagement(), name);
      case AppRouteNames.adminShopkeepers:
        return _route(const AdminShopkeeperManagement(), name);
      default:
        return _route(const LoginScreen(), AppRouteNames.login);
    }
  }

  static MaterialPageRoute<dynamic> _route(Widget child, String name) {
    return MaterialPageRoute(builder: (_) => child, settings: RouteSettings(name: name));
  }
}
