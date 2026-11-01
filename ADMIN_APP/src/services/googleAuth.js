import { GoogleSignin } from '@react-native-google-signin/google-signin';

const WEB_CLIENT_ID = '501792961564-43g03e5a90rnihr7r4gnt9ecik9625aq.apps.googleusercontent.com';

let isConfigured = false;

export function configureGoogleSignIn() {
  if (isConfigured) return;
  try {
    GoogleSignin.configure({
      webClientId: WEB_CLIENT_ID,
      offlineAccess: false,
      forceCodeForRefreshToken: false,
    });
    isConfigured = true;
    console.log('[GoogleAuth Admin] Google Sign-In configured successfully.');
  } catch (err) {
    console.warn('[GoogleAuth Admin] GoogleSignin.configure error:', err.message);
  }
}

export async function promptGoogleSignIn() {
  configureGoogleSignIn();

  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  // If already signed in, sign out first to let user choose account
  try {
    await GoogleSignin.signOut();
  } catch (_) {}

  const response = await GoogleSignin.signIn();

  // Handle both v12+ and v13+ response structures
  const user = response?.data?.user || response?.user || response;
  const idToken = response?.data?.idToken || response?.idToken || null;

  if (!user || !user.email) {
    throw new Error('Could not retrieve Google account details. Please try again.');
  }

  return {
    email: user.email.toLowerCase().trim(),
    name: user.name || user.givenName || 'Google Admin',
    googleId: user.id || idToken || `admin_gid_${Date.now()}`,
    avatarUrl: user.photo || null,
    idToken,
  };
}
