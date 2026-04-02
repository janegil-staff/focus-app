import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { authApi } from '../../api';
import { UnderlineInput, PrimaryButton } from '../../components';
import { Colors, Spacing, FontSize } from '../../theme';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const submit = async () => {
    if (!email.trim()) { setError('Email is required'); return; }
    setLoading(true); setError('');
    try {
      await authApi.forgotPassword(email.trim().toLowerCase());
      Alert.alert('Check your email', 'A password reset link has been sent.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      setError('Could not send reset email. Please check your address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[Colors.gradientTop, Colors.gradientBottom]} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.back}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Forgot password</Text>
          </View>

          <Text style={styles.desc}>
            Enter your email address and we'll send you a link to reset your password.
          </Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <UnderlineInput
            label="Email*"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <View style={{ height: Spacing.xxl }} />
          <PrimaryButton label="SEND RESET LINK" onPress={submit} loading={loading} />
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: 30, paddingTop: 60, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xxl },
  back: { color: Colors.white, fontSize: 36, marginRight: 12, lineHeight: 40 },
  title: { color: Colors.white, fontSize: 22, fontWeight: '700' },
  desc: { color: 'rgba(255,255,255,0.8)', fontSize: FontSize.md, lineHeight: 22, marginBottom: Spacing.xl },
  error: { color: '#FFCDD2', fontSize: FontSize.sm, textAlign: 'center', marginBottom: Spacing.md },
});
