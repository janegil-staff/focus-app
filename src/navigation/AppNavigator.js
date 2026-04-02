import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';

import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme';

import LoginScreen          from '../screens/auth/LoginScreen';
import RegisterScreen       from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import PinSetupScreen       from '../screens/auth/PinSetupScreen';
import PinConfirmScreen     from '../screens/auth/PinConfirmScreen';
import PinVerifyScreen      from '../screens/auth/PinVerifyScreen';
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
      <Stack.Screen name="LogEntry"    component={LogEntryScreen} />
      <Stack.Screen name="LogHistory"  component={LogHistoryScreen} />
      <Stack.Screen name="Profile"     component={ProfileScreen} />
      <Stack.Screen name="Medications" component={MedicationsScreen} />
      <Stack.Screen name="PinSetup"    component={PinSetupScreen} />
      <Stack.Screen name="PinConfirm"  component={PinConfirmScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();
  const [pinChecked, setPinChecked] = useState(false);
  const [needsPin,   setNeedsPin]   = useState(false);
  const [pinPassed,  setPinPassed]  = useState(false);

  useEffect(() => {
    if (!user) { setPinChecked(true); return; }
    SecureStore.getItemAsync('userPin').then((pin) => {
      setNeedsPin(!!pin);
      setPinChecked(true);
    });
  }, [user]);

  if (loading || !pinChecked) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  if (user && needsPin && !pinPassed) {
    return (
      <PinVerifyScreen
        onSuccess={() => setPinPassed(true)}
        onFallback={() => { setNeedsPin(false); setPinPassed(false); }}
      />
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}