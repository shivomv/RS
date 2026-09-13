import 'package:flutter/foundation.dart';

enum UserRole { user, admin }

class AuthProvider extends ChangeNotifier {
  String? _mobile;
  UserRole? _role;

  bool get isAuthenticated => _role != null;
  bool get isAdmin => _role == UserRole.admin;
  String? get mobile => _mobile;
  UserRole? get role => _role;

  void setSession({required String mobile, required UserRole role}) {
    _mobile = mobile;
    _role = role;
    notifyListeners();
  }

  void signInAsUser(String mobile) {
    setSession(mobile: mobile, role: UserRole.user);
  }

  void signOut() {
    _mobile = null;
    _role = null;
    notifyListeners();
  }
}