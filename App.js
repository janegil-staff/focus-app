import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { LangProvider } from './src/context/LangContext';
import { LogsProvider } from './src/context/LogsContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <LangProvider>
            <LogsProvider>
              <AppNavigator />
            </LogsProvider>
          </LangProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}