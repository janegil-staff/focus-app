import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme';

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
      <Stack.Screen name="Welcome"        component={WelcomeScreen} />
    </Stack.Navigator>
  );
}

function PinVerifyStack() {
  const { setPinVerified } = useAuth();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PinVerify">
        {() => (
          <PinVerifyScreen
            onSuccess={() => setPinVerified(true)}
            onFallback={() => setPinVerified(true)}
          />
        )}
      </Stack.Screen>
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

function RootNavigator() {
  const { user, pinVerified } = useAuth();

  if (!user) return <AuthStack />;
  if (!pinVerified) return <PinVerifyStack />;
  return <AppStack />;
}

export default function AppNavigator() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}