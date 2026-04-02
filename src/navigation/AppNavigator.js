import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

import LoginScreen          from '../screens/auth/LoginScreen';
import RegisterScreen       from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import PinSetupScreen       from '../screens/auth/PinSetupScreen';
import PinConfirmScreen     from '../screens/auth/PinConfirmScreen';
import PinVerifyScreen      from '../screens/auth/PinVerifyScreen';
import WelcomeScreen        from '../screens/onboarding/WelcomeScreen';
import HomeScreen           from '../screens/home/HomeScreen';
import LogEntryScreen       from '../screens/log/LogEntryScreen';
import LogHistoryScreen     from '../screens/log/LogHistoryScreen';
import ProfileScreen        from '../screens/profile/ProfileScreen';
import MedicationsScreen    from '../screens/medications/MedicationsScreen';

const Stack = createNativeStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login"          component={LoginScreen} />
      <Stack.Screen name="Register"       component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="PinSetup"       component={PinSetupScreen} />
      <Stack.Screen name="PinConfirm"     component={PinConfirmScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home"        component={HomeScreen} />
      <Stack.Screen name="Welcome"     component={WelcomeScreen} />
      <Stack.Screen name="LogEntry"    component={LogEntryScreen} />
      <Stack.Screen name="LogHistory"  component={LogHistoryScreen} />
      <Stack.Screen name="Profile"     component={ProfileScreen} />
      <Stack.Screen name="Medications" component={MedicationsScreen} />
      <Stack.Screen name="PinSetup"    component={PinSetupScreen} />
      <Stack.Screen name="PinConfirm"  component={PinConfirmScreen} />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const { user, pinVerified, setPinVerified, isNewUser } = useAuth();

  if (!user) return <AuthStack />;

  if (!pinVerified) {
    return (
      <PinVerifyScreen
        onSuccess={() => setPinVerified(true)}
        onFallback={() => setPinVerified(true)}
      />
    );
  }

  // New user — show Welcome directly without navigation
  if (isNewUser) return <WelcomeScreen standalone />;

  return <AppStack />;
}

export default function AppNavigator() {
  const { loading } = useAuth();
  const { scheme }  = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0A0F1E', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#1A56DB" size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <RootNavigator />
    </NavigationContainer>
  );
}