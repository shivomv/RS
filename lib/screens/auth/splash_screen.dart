import 'package:flutter/material.dart';
import '../../core/app_theme.dart';
import '../../core/app_route_names.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    _navigateToLogin();
  }

  _navigateToLogin() async {
    await Future.delayed(const Duration(milliseconds: 2500), () {});
    if (mounted) {
      Navigator.pushReplacementNamed(context, AppRouteNames.login);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      backgroundColor: AppTheme.surface,
      body: Stack(
        children: [
          // Background subtle vertical bands logic (can be simulated with a gradient or simple containers)
          Positioned.fill(
            child: Row(
              children: List.generate(4, (index) => Expanded(
                child: Container(
                  color: index % 2 == 0 ? Colors.transparent : Colors.black.withOpacity(0.01),
                ),
              )),
            ),
          ),
          
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Logo Container
                Container(
                  width: 140,
                  height: 140,
                  decoration: BoxDecoration(
                    color: AppTheme.primaryColor,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.primaryColor.withOpacity(0.2),
                        blurRadius: 40,
                        offset: const Offset(0, 20),
                      ),
                    ],
                  ),
                  child: const Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.shield_outlined, color: Colors.white, size: 48),
                        SizedBox(height: 8),
                        Text(
                          "RS",
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 2,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 48),
                
                // Title
                Text(
                  "RS INDUSTRIES",
                  style: theme.textTheme.displayMedium?.copyWith(
                    color: AppTheme.primaryColor,
                  ),
                ),
                const SizedBox(height: 12),
                
                // Divider
                Container(
                  width: 60,
                  height: 1,
                  color: AppTheme.secondaryColor.withOpacity(0.3),
                ),
                const SizedBox(height: 24),
                
                // Subtitle
                Text(
                  "BUSINESS-TO-BUSINESS DISTRIBUTOR PLATFORM",
                  style: theme.textTheme.labelSmall?.copyWith(
                    letterSpacing: 1.5,
                    color: AppTheme.onSurfaceVariant.withOpacity(0.6),
                  ),
                ),
                const SizedBox(height: 60),
                
                // Loading indicators (dots)
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(3, (index) => Container(
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    width: 6,
                    height: 6,
                    decoration: BoxDecoration(
                      color: AppTheme.secondaryColor.withOpacity(index == 1 ? 0.6 : 0.2),
                      shape: BoxShape.circle,
                    ),
                  )),
                ),
              ],
            ),
          ),
          
          // Version Footer
          Positioned(
            bottom: 40,
            left: 0,
            right: 0,
            child: Center(
              child: Text(
                "VERSION 1.0",
                style: theme.textTheme.labelSmall?.copyWith(
                  letterSpacing: 3,
                  color: AppTheme.onSurfaceVariant.withOpacity(0.4),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
