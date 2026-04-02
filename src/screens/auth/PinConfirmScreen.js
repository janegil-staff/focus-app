import React from 'react';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import PinInputScreen from './PinInputScreen';

export default function PinConfirmScreen({ navigation, route }) {
  const { firstPin, onDone } = route.params ?? {};

  const onConfirm = async (pin) => {
    if (pin !== firstPin) {
      Alert.alert(
        'PINs do not match',
        'Please try again.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      return;
    }

    await SecureStore.setItemAsync('userPin', pin);

    if (onDone) onDone(pin);

    navigation.navigate('Welcome');
  };

  return (
    <PinInputScreen
      title="Confirm PIN"
      subtitle="Enter your PIN again to confirm"
      onComplete={onConfirm}
      onBack={() => navigation.goBack()}
    />
  );
}