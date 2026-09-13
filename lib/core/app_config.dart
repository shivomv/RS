import 'package:flutter/foundation.dart';

class AppConfig {
  // Use http://10.0.2.2:5000 for Android Emulator
  // Use http://localhost:5000 for iOS, Web or Desktop
  static String get baseUrl {
    if (kIsWeb) {
      return "http://localhost:5000/api";
    } else {
      // Assuming Android emulator. For real device, use machine IP.
      return "http://10.0.2.2:5000/api";
    }
  }
}

