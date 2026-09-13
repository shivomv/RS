import 'package:flutter/material.dart';
import '../../core/app_theme.dart';
import '../../core/app_route_names.dart';
import '../../providers/auth_provider.dart';
import 'package:provider/provider.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _fullNameController = TextEditingController();
  final _shopNameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _cityController = TextEditingController();
  final _addressController = TextEditingController();

  @override
  void dispose() {
    _fullNameController.dispose();
    _shopNameController.dispose();
    _phoneController.dispose();
    _cityController.dispose();
    _addressController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      backgroundColor: Colors.white,
      body: Stack(
        children: [
          // Background subtle pattern
          Positioned(
            bottom: -50,
            left: -50,
            child: Icon(Icons.precision_manufacturing_outlined, size: 300, color: AppTheme.primaryColor.withOpacity(0.02)),
          ),
          
          SafeArea(
            child: Column(
              children: [
                // Top Industrial Bar
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                  child: Row(
                    children: [
                      IconButton(
                        onPressed: () => Navigator.pop(context),
                        icon: const Icon(Icons.arrow_back_ios, size: 18, color: AppTheme.primaryColor),
                      ),
                      const Spacer(),
                      Text("ENROLLMENT PROTOCOL", style: theme.textTheme.labelSmall?.copyWith(letterSpacing: 2, fontWeight: FontWeight.bold)),
                      const Spacer(),
                      const SizedBox(width: 48), // Balancing
                    ],
                  ),
                ),
                
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.all(32.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text("Partner Registration", style: theme.textTheme.displayMedium?.copyWith(fontSize: 32, fontWeight: FontWeight.w900, color: AppTheme.primaryColor)),
                        const SizedBox(height: 12),
                        Text("Register your business to access primary distribution benefits and SKU management.", style: theme.textTheme.bodyMedium?.copyWith(color: Colors.grey)),
                        
                        const SizedBox(height: 48),
                        
                        _buildInputField("LEGAL FULL NAME", _fullNameController, Icons.person_outline),
                        const SizedBox(height: 24),
                        _buildInputField("BUSINESS / SHOP NAME", _shopNameController, Icons.storefront_outlined),
                        const SizedBox(height: 24),
                        _buildInputField("DIRECT CONTACT", _phoneController, Icons.phone_outlined, keyboardType: TextInputType.phone),
                        const SizedBox(height: 24),
                        _buildInputField("DISTRIBUTION CITY", _cityController, Icons.location_city_outlined),
                        const SizedBox(height: 24),
                        _buildInputField("FULL WAREHOUSE ADDRESS", _addressController, Icons.location_on_outlined, maxLines: 2),
                        
                        const SizedBox(height: 48),
                        
                        GestureDetector(
                          onTap: () {
                            // Handle Registration completion
                            context.read<AuthProvider>().signInAsUser(_phoneController.text.trim());
                            Navigator.pushReplacementNamed(context, AppRouteNames.catalog);
                          },
                          child: Container(
                            height: 64,
                            width: double.infinity,
                            decoration: BoxDecoration(
                              color: AppTheme.primaryColor,
                              borderRadius: BorderRadius.circular(4),
                              boxShadow: [BoxShadow(color: AppTheme.primaryColor.withOpacity(0.2), blurRadius: 20, offset: const Offset(0, 10))],
                            ),
                            child: const Center(
                              child: Text(
                                "SUBMIT REGISTRATION",
                                style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, letterSpacing: 2, fontSize: 13),
                              ),
                            ),
                          ),
                        ),
                        
                        const SizedBox(height: 32),
                        Center(
                          child: TextButton(
                            onPressed: () => Navigator.pop(context),
                            child: RichText(
                              text: TextSpan(
                                text: "HAVE AN ACCOUNT? ",
                                style: theme.textTheme.labelSmall?.copyWith(color: Colors.grey),
                                children: [
                                  TextSpan(
                                    text: "LOGIN SECURELY",
                                    style: TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(height: 40),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInputField(String label, TextEditingController controller, IconData icon, {TextInputType keyboardType = TextInputType.text, int maxLines = 1}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 1, color: Colors.grey)),
        const SizedBox(height: 8),
        Container(
          decoration: BoxDecoration(
            color: AppTheme.surfaceContainerHigh.withOpacity(0.3),
            border: const Border(bottom: BorderSide(color: AppTheme.primaryColor, width: 1)),
          ),
          child: Row(
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Icon(icon, size: 20, color: AppTheme.primaryColor),
              ),
              Expanded(
                child: TextField(
                  controller: controller,
                  keyboardType: keyboardType,
                  maxLines: maxLines,
                  style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                  decoration: const InputDecoration(
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(vertical: 16),
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
