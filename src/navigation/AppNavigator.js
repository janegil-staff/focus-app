import React from "react";
import { ActivityIndicator, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";
import PinSetupScreen from "../screens/auth/PinSetupScreen";
import PinConfirmScreen from "../screens/auth/PinConfirmScreen";
import PinVerifyScreen from "../screens/auth/PinVerifyScreen";
import WelcomeScreen from "../screens/onboarding/WelcomeScreen";
import HomeScreen from "../screens/home/HomeScreen";
import LogEntryScreen from "../screens/log/LogEntryScreen";
import LogHistoryScreen from "../screens/log/LogHistoryScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import LanguageScreen from "../screens/profile/LanguageScreen";
import PersonalSettingsScreen from "../screens/profile/PersonalSettingsScreen";
import MedicationsScreen from "../screens/medications/MedicationsScreen";
import ShareScreen from "../screens/share/ShareScreen";
import ASRSInfoScreen from "../screens/asrs/ASRSInfoScreen";
import ASRSScreen from "../screens/asrs/ASRSScreen";
import StudiesScreen from "../screens/share/StudiesScreen";
import AdviceScreen from "../screens/advices/AdviceScreen";
const Stack = createNativeStackNavigator();

// ── Auth stack ────────────────────────────────────────────────────────────────
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="PinSetup" component={PinSetupScreen} />
      <Stack.Screen name="PinConfirm" component={PinConfirmScreen} />
    </Stack.Navigator>
  );
}

// ── App stack ─────────────────────────────────────────────────────────────────
function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Advice" component={AdviceScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Share" component={ShareScreen} />
      <Stack.Screen name="Studies" component={StudiesScreen} />
      <Stack.Screen name="LogEntry" component={LogEntryScreen} />
      <Stack.Screen name="LogHistory" component={LogHistoryScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Language" component={LanguageScreen} />
      <Stack.Screen
        name="PersonalSettings"
        component={PersonalSettingsScreen}
      />
      <Stack.Screen name="Medications" component={MedicationsScreen} />
      <Stack.Screen name="ASRSInfo" component={ASRSInfoScreen} />
      <Stack.Screen name="ASRS" component={ASRSScreen} />
      <Stack.Screen name="PinSetup" component={PinSetupScreen} />
      <Stack.Screen name="PinConfirm" component={PinConfirmScreen} />
    </Stack.Navigator>
  );
}

// ── Root navigator ────────────────────────────────────────────────────────────
function RootNavigator() {
  const { user, pinVerified, setPinVerified, isNewUser } = useAuth();

  if (!user) return <AuthStack />;
  if (!pinVerified)
    return (
      <PinVerifyScreen
        onSuccess={() => setPinVerified(true)}
        onFallback={() => setPinVerified(true)}
      />
    );
  if (isNewUser) return <WelcomeScreen standalone />;

  return <AppStack />;
}

// ── App navigator ─────────────────────────────────────────────────────────────
export default function AppNavigator() {
  const { loading } = useAuth();
  const { scheme } = useTheme();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0A0F1E",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator color="#4A7AB5" size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <RootNavigator />
    </NavigationContainer>
  );
}
