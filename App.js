import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { LogsProvider } from './src/context/LogsContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <LogsProvider>
          <StatusBar style="light" />
          <AppNavigator />
        </LogsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
