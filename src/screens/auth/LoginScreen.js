import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, KeyboardAvoidingView, Platform, TextInput,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { FontSize, Spacing } from '../../theme';

const BG     = '#FFFFFF';
const ACCENT = '#1A56DB';
const DARK   = '#111111';
const MUTED  = 'rgba(0,0,0,0.45)';
const LINE   = '#BDBDBD';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email,   setEmail]   = useState('');
  const [pin,     setPin]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const submit = async () => {
    if (!email.trim() || !pin) { setError('Please fill in all fields'); return; }
    if (!/^\d{4}$/.test(pin))  { setError('PIN must be 4 digits'); return; }
    setLoading(true); setError('');
    try {
      await login(email.trim().toLowerCase(), pin);
    } catch (e) {
      setError(e?.message ?? 'Invalid email or PIN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.bg}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Image
              source={require('../../../assets/images/focus_logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>FocusApp</Text>
            <Text style={styles.subtitle}>ADHD Daily Tracker</Text>
          </View>

          <View style={styles.fields}>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Field label="Email*" value={email} onChangeText={setEmail} keyboardType="email-address" />
            <Field label="Pin*"   value={pin}   onChangeText={(t) => setPin(t.replace(/\D/g, '').slice(0, 4))} keyboardType="number-pad" secureTextEntry />
          </View>

          <View style={{ height: Spacing.xl }} />

          <TouchableOpacity style={styles.btn} onPress={submit} activeOpacity={0.85}>
            <Text style={styles.btnText}>{loading ? '...' : 'LOG IN'}</Text>
          </TouchableOpacity>

          <View style={styles.links}>
            <Text style={styles.linkMuted}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.linkBold}>SIGN UP</Text>
            </TouchableOpacity>
            <View style={{ height: Spacing.lg }} />
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.linkBold}>FORGOTTEN YOUR PIN?</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Field({ label, value, onChangeText, keyboardType, secureTextEntry }) {
  return (
    <View style={f.wrap}>
      <Text style={f.label}>{label}</Text>
      <TextInput
        style={f.input}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        placeholderTextColor="rgba(0,0,0,0.25)"
        selectionColor={ACCENT}
      />
      <View style={f.line} />
    </View>
  );
}

const f = StyleSheet.create({
  wrap:  { width: '100%', marginBottom: Spacing.lg },
  label: { color: MUTED, fontSize: FontSize.md, fontWeight: '600', marginBottom: 6 },
  input: { color: DARK, fontSize: FontSize.md, fontWeight: '500', paddingBottom: 8, paddingHorizontal: 0 },
  line:  { height: 2, backgroundColor: LINE, width: '100%' },
});

const styles = StyleSheet.create({
  bg:     { flex: 1, backgroundColor: BG },
  scroll: { flexGrow: 1, paddingHorizontal: 30, paddingTop: 70, paddingBottom: 50 },
  header: { alignItems: 'center', marginBottom: 40 },
  logo:   { width: 150, height: 150, borderRadius: 75 },
  title:  { color: DARK, fontSize: 26, fontWeight: '700', marginTop: 16, letterSpacing: 0.5 },
  subtitle: { color: MUTED, fontSize: FontSize.xs, letterSpacing: 2, marginTop: 4 },
  fields: { width: '100%' },
  error:  { color: '#C62828', fontSize: FontSize.sm, marginBottom: Spacing.md },
  btn: {
    width: '100%',
    height: 56,
    backgroundColor: '#1A56DB',   // royal blue
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1A56DB',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  btnText:   { color: '#FFFFFF', fontSize: FontSize.md, fontWeight: '800', letterSpacing: 2 },
  links:     { alignItems: 'center', marginTop: Spacing.xxl },
  linkMuted: { color: MUTED, fontSize: FontSize.sm, fontWeight: '500' },
  linkBold:  { color: DARK, fontSize: FontSize.md, fontWeight: '700', letterSpacing: 1, marginTop: Spacing.sm },
});