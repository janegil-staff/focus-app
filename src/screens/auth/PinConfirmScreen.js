import React from 'react';
import { Alert } from 'react-native';
import PinInputScreen from './PinInputScreen';

export default function PinConfirmScreen({ navigation, route }) {
  const { firstPin } = route.params ?? {};

  const onConfirm = (pin) => {
    if (pin !== firstPin) {
      Alert.alert(
        'PINs do not match',
        'Please try again.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      return;
    }
    // Pass confirmed PIN back to Register screen
    navigation.navigate('Register', { pin });
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