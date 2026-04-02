import React from 'react';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import PinInputScreen from './PinInputScreen';

export default function PinVerifyScreen({ onSuccess, onFallback }) {
  const verify = async (pin) => {
    const savedPin = await SecureStore.getItemAsync('userPin');
    if (pin === savedPin) {
      onSuccess();
    } else {
      Alert.alert(
        'Incorrect PIN',
        'Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <PinInputScreen
      title="Enter PIN"
      subtitle="Enter your PIN to continue"
      onComplete={verify}
      onBack={onFallback}
    />
  );
}