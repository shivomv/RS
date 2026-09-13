import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';
import '../../core/app_theme.dart';
import '../../core/app_route_names.dart';
import '../../core/app_config.dart';
import '../../providers/auth_provider.dart';
import 'package:provider/provider.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _phoneController = TextEditingController();
  bool _isLoading = false;
  bool _showOTPFields = false;
  final List<TextEditingController> _otpControllers = List.generate(6, (index) => TextEditingController());
  final List<FocusNode> _otpFocusNodes = List.generate(6, (index) => FocusNode());

  @override
  void dispose() {
    _phoneController.dispose();
    for (var controller in _otpControllers) controller.dispose();
    for (var node in _otpFocusNodes) node.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_showOTPFields) {
      setState(() => _showOTPFields = true);
      return;
    }
    
    final mobile = _phoneController.text.trim();
    if (mobile.length != 10) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Valid 10-digit mobile required")));
      return;
    }

    setState(() => _isLoading = true);
    // Simple mock login / reverse OTP flow for now
    await Future.delayed(const Duration(seconds: 2));
    if (mounted) {
      context.read<AuthProvider>().signInAsUser(mobile);
      Navigator.pushReplacementNamed(context, AppRouteNames.catalog);
    }
  }

  void _onOtpChanged(int index, String value) {
    if (value.length == 1 && index < 5) {
      _otpFocusNodes[index + 1].requestFocus();
    } else if (value.isEmpty && index > 0) {
      _otpFocusNodes[index - 1].requestFocus();
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final size = MediaQuery.of(context).size;

    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          // Background "Industrial Ledger" subtle pattern
          Positioned(
            top: -100,
            right: -50,
            child: Icon(Icons.shield_outlined, size: 400, color: AppTheme.primaryColor.withOpacity(0.03)),
          ),
          
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: ConstrainedBox(
                constraints: BoxConstraints(minHeight: size.height - MediaQuery.of(context).padding.top - MediaQuery.of(context).padding.bottom),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 20),
                    // Industrial Header
                    Row(
                      children: [
                        Container(
                          width: 4,
                          height: 48,
                          color: AppTheme.primaryColor,
                        ),
                        const SizedBox(width: 16),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text("RS INDUSTRIES", style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w900, letterSpacing: 4, color: AppTheme.primaryColor)),
                            Text("LOGISTICS COMMAND v1.0", style: theme.textTheme.labelSmall?.copyWith(letterSpacing: 2, color: Colors.grey)),
                          ],
                        ),
                      ],
                    ),
                    
                    const SizedBox(height: 80),
                    
                    Text("PROCUREMENT PORTAL", style: theme.textTheme.displayMedium?.copyWith(fontSize: 28, height: 1.1)),
                    const SizedBox(height: 12),
                    Text("Access the distribution ledger and manage your bulk inventory orders.", style: theme.textTheme.bodyMedium?.copyWith(color: Colors.grey)),
                    
                    const SizedBox(height: 48),
                    
                    // Input Section - Integrated (No card box)
                    Text("MOBILE CREDENTIALS", style: theme.textTheme.labelSmall?.copyWith(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 16),
                    _buildInputWrapper(
                      Row(
                        children: [
                          const Padding(
                            padding: EdgeInsets.symmetric(horizontal: 16),
                            child: Text("+91", style: TextStyle(fontWeight: FontWeight.w900, fontSize: 18)),
                          ),
                          Expanded(
                            child: TextField(
                              controller: _phoneController,
                              keyboardType: TextInputType.phone,
                              style: const TextStyle(fontSize: 18, letterSpacing: 2, fontWeight: FontWeight.bold),
                              decoration: const InputDecoration(
                                border: InputBorder.none,
                                hintText: "00000 00000",
                                hintStyle: TextStyle(color: Colors.grey, fontWeight: FontWeight.normal),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    
                    if (_showOTPFields) ...[
                      const SizedBox(height: 32),
                      Text("VERIFICATION CODE", style: theme.textTheme.labelSmall?.copyWith(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 16),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: List.generate(6, (index) => _buildOtpBox(index)),
                      ),
                    ],
                    
                    const SizedBox(height: 40),
                    
                    // Action Button
                    GestureDetector(
                      onTap: _isLoading ? null : _handleLogin,
                      child: Container(
                        height: 64,
                        decoration: BoxDecoration(
                          color: AppTheme.primaryColor,
                          borderRadius: BorderRadius.circular(4), // Sharp industrial corners
                          boxShadow: [
                            BoxShadow(color: AppTheme.primaryColor.withOpacity(0.2), blurRadius: 20, offset: const Offset(0, 10)),
                          ],
                        ),
                        child: Center(
                          child: _isLoading 
                            ? const CircularProgressIndicator(color: Colors.white, strokeWidth: 2)
                            : Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(
                                    _showOTPFields ? "AUTHORIZE ACCESS" : "REQUEST TOKEN",
                                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, letterSpacing: 2, fontSize: 12),
                                  ),
                                  const SizedBox(width: 12),
                                  const Icon(Icons.arrow_forward_ios, color: Colors.white, size: 14),
                                ],
                              ),
                        ),
                      ),
                    ),
                    
                    const SizedBox(height: 32),
                    
                    Center(
                      child: TextButton(
                        onPressed: () => Navigator.pushNamed(context, AppRouteNames.register),
                        child: RichText(
                          text: TextSpan(
                            text: "NEW PARTNER? ",
                            style: theme.textTheme.labelSmall?.copyWith(color: Colors.grey),
                            children: [
                              TextSpan(
                                text: "ENROLL NOW",
                                style: TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.bold, decoration: TextDecoration.underline),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                    
                    const SizedBox(height: 40),
                    
                    // Trust Indicators
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        _buildFooterStat("ENCRYPTED", Icons.lock_outline),
                        _buildFooterStat("ESTABLISHED 1994", Icons.verified_outlined),
                      ],
                    ),
                    const SizedBox(height: 20),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInputWrapper(Widget child) {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.surfaceContainerHigh.withOpacity(0.3),
        border: Border(left: BorderSide(color: AppTheme.primaryColor, width: 2)),
      ),
      child: child,
    );
  }

  Widget _buildOtpBox(int index) {
    return Container(
      width: 48,
      height: 56,
      decoration: BoxDecoration(
        color: AppTheme.surfaceContainerHigh.withOpacity(0.3),
        borderRadius: BorderRadius.circular(4),
      ),
      child: TextField(
        controller: _otpControllers[index],
        focusNode: _otpFocusNodes[index],
        textAlign: TextAlign.center,
        keyboardType: TextInputType.number,
        maxLength: 1,
        onChanged: (v) => _onOtpChanged(index, v),
        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        decoration: const InputDecoration(
          counterText: "",
          border: InputBorder.none,
        ),
      ),
    );
  }

  Widget _buildFooterStat(String text, IconData icon) {
    return Row(
      children: [
        Icon(icon, size: 12, color: Colors.grey),
        const SizedBox(width: 8),
        Text(text, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1)),
      ],
    );
  }
}
