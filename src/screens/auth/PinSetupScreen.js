import React from 'react';
import PinInputScreen from './PinInputScreen';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

export default function PinSetupScreen({ navigation, route }) {
  const onDone = route?.params?.onDone;

  const onEnterPin = (pin) => {
    // Navigate to confirm screen, passing the first pin
    navigation.navigate('PinConfirm', { firstPin: pin, onDone });
  };

  return (
    <PinInputScreen
      title="Choose a PIN"
      subtitle="Enter a 4-digit PIN to secure your app"
      onComplete={onEnterPin}
      onBack={() => navigation.goBack()}
    />
  );
}