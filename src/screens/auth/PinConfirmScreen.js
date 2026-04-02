import React from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import PinInputScreen from './PinInputScreen';

export default function PinConfirmScreen({ navigation, route }) {
  const { firstPin } = route.params ?? {};
  const { savePin }  = useAuth();

  const onConfirm = async (pin) => {
    if (pin !== firstPin) {
      Alert.alert(
        'PINs do not match',
        'Please try again.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      return;
    }
    // Save PIN to device via AuthContext
    await savePin(pin);
    // Return to Register with pinSet flag
    navigation.navigate('Register', { pinSet: true });
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