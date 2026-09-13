import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  // Brand Colors
  static const Color primaryColor = Color(0xFF003E6F);
  static const Color primaryContainer = Color(0xFF004D86); // For gradient
  static const Color secondaryColor = Color(0xFF006B5F);
  
  // Surface Hierarchy
  static const Color surface = Color(0xFFF8F9FA);
  static const Color surfaceContainerLowest = Color(0xFFFFFFFF);
  static const Color surfaceContainerHigh = Color(0xFFE7E8E9);
  static const Color onSurface = Color(0xFF191C1D);
  static const Color onSurfaceVariant = Color(0xFF40484B);
  static const Color outlineVariant = Color(0x2640484B); // 15% opacity

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: surface,
      colorScheme: const ColorScheme.light(
        primary: primaryColor,
        secondary: secondaryColor,
        surface: surface,
        onSurface: onSurface,
        onSurfaceVariant: onSurfaceVariant,
        surfaceContainerLowest: surfaceContainerLowest,
        surfaceContainerHigh: surfaceContainerHigh,
      ),
      
      // Typography: Inter
      textTheme: TextTheme(
        displayLarge: GoogleFonts.inter(
          fontSize: 32,
          fontWeight: FontWeight.w900,
          letterSpacing: -0.02 * 32,
          color: onSurface,
        ),
        displayMedium: GoogleFonts.inter(
          fontSize: 28,
          fontWeight: FontWeight.w800,
          letterSpacing: -0.02 * 28,
          color: onSurface,
        ),
        titleMedium: GoogleFonts.inter(
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: onSurfaceVariant,
        ),
        bodyMedium: GoogleFonts.inter(
          fontSize: 14, // 0.875rem
          fontWeight: FontWeight.normal,
          color: onSurface,
        ),
        labelSmall: GoogleFonts.inter(
          fontSize: 11,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.05 * 11,
          color: onSurfaceVariant,
        ),
      ),

      appBarTheme: const AppBarTheme(
        backgroundColor: surface,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: onSurface,
          fontSize: 20,
          fontWeight: FontWeight.w900,
        ),
        iconTheme: IconThemeData(color: onSurface),
      ),

      // Buttons
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryColor,
          foregroundColor: Colors.white,
          minimumSize: const Size(double.infinity, 56),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)), // rounded-md (0.375rem)
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        ),
      ),

      // Input Fields: Minimalist "Flat" style
      inputDecorationTheme: const InputDecorationTheme(
        filled: true,
        fillColor: surfaceContainerHigh,
        border: UnderlineInputBorder(
          borderSide: BorderSide.none,
          borderRadius: BorderRadius.vertical(top: Radius.circular(8)),
        ),
        enabledBorder: UnderlineInputBorder(
          borderSide: BorderSide.none,
          borderRadius: BorderRadius.vertical(top: Radius.circular(8)),
        ),
        focusedBorder: UnderlineInputBorder(
          borderSide: BorderSide(color: primaryColor, width: 2),
          borderRadius: BorderRadius.vertical(top: Radius.circular(8)),
        ),
        labelStyle: TextStyle(fontSize: 14, fontWeight: FontWeight.normal, color: onSurfaceVariant),
        floatingLabelStyle: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: primaryColor),
      ),
      
      // Chip Theme for "Quick-Add"
      chipTheme: ChipThemeData(
        backgroundColor: surfaceContainerLowest,
        selectedColor: secondaryColor.withOpacity(0.1),
        labelStyle: const TextStyle(color: onSurface),
        secondaryLabelStyle: const TextStyle(color: secondaryColor, fontWeight: FontWeight.bold),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        side: BorderSide.none,
      ),
    );
  }

  // Hero Button Decoration (Gradient)
  static BoxDecoration get heroButtonDecoration => BoxDecoration(
    gradient: const LinearGradient(
      colors: [primaryColor, primaryContainer],
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    ),
    borderRadius: BorderRadius.circular(6),
  );

  // Ambient Shadow
  static List<BoxShadow> get ambientShadow => [
    BoxShadow(
      blurRadius: 24,
      spreadRadius: -4,
      color: onSurface.withOpacity(0.06),
      offset: const Offset(0, 8),
    ),
  ];
}

