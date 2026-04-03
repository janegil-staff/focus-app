import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, KeyboardAvoidingView, Platform, TextInput,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FontSize, Spacing } from '../../theme';

export default function LoginScreen({ navigation }) {
  const { login }    = useAuth();
  const { theme }    = useTheme();
  const [email,   setEmail]   = useState('');
  const [pin,     setPin]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const s = makeStyles(theme);

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
    <View style={s.bg}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <View style={s.header}>
            <Image
              source={require('../../../assets/images/focus_logo.jpg')}
              style={s.logo}
              resizeMode="contain"
            />
            <Text style={s.title}>FocusApp</Text>
            <Text style={s.subtitle}>ADHD Daily Tracker</Text>
          </View>

          <View style={{ width: '100%' }}>
            {error ? <Text style={s.error}>{error}</Text> : null}
            <Field label="Email*" value={email} onChangeText={setEmail} keyboardType="email-address" theme={theme} />
            <Field label="Pin*"   value={pin}   onChangeText={(t) => setPin(t.replace(/\D/g, '').slice(0, 4))} keyboardType="number-pad" secureTextEntry theme={theme} />
          </View>

          <View style={{ height: Spacing.xl }} />

          <TouchableOpacity style={s.btn} onPress={submit} activeOpacity={0.85}>
            <Text style={s.btnText}>{loading ? '...' : 'LOG IN'}</Text>
          </TouchableOpacity>

          <View style={s.links}>
            <Text style={s.linkMuted}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={s.linkBold}>SIGN UP</Text>
            </TouchableOpacity>
            <View style={{ height: Spacing.lg }} />
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={s.linkBold}>FORGOTTEN YOUR PIN?</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Field({ label, value, onChangeText, keyboardType, secureTextEntry, theme }) {
  return (
    <View style={{ width: '100%', marginBottom: Spacing.lg }}>
      <Text style={{ color: theme.textSecondary, fontSize: FontSize.md, fontWeight: '600', marginBottom: 6 }}>
        {label}
      </Text>
      <TextInput
        style={{ color: theme.text, fontSize: FontSize.md, fontWeight: '500', paddingBottom: 8, paddingHorizontal: 0 }}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        placeholderTextColor={theme.textMuted}
        selectionColor={theme.accent}
      />
      <View style={{ height: 2, backgroundColor: theme.inputLine, width: '100%' }} />
    </View>
  );
}

const makeStyles = (t) => StyleSheet.create({
  bg:       { flex: 1, backgroundColor: t.bg },
  scroll:   { flexGrow: 1, paddingHorizontal: 30, paddingTop: 70, paddingBottom: 50, alignItems: 'center' },
  header:   { alignItems: 'center', marginBottom: 40, width: '100%' },
  logo:     { width: 150, height: 150, borderRadius: 0 },
  title:    { color: t.text, fontSize: 26, fontWeight: '700', marginTop: 16, letterSpacing: 0.5 },
  subtitle: { color: t.textMuted, fontSize: FontSize.xs, letterSpacing: 2, marginTop: 4 },
  error:    { color: '#C62828', fontSize: FontSize.sm, marginBottom: Spacing.md, width: '100%' },
  btn: {
    width: '100%', height: 56,
    backgroundColor: t.accent, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: t.accent, shadowOpacity: 0.4,
    shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  btnText:   { color: '#FFFFFF', fontSize: FontSize.md, fontWeight: '800', letterSpacing: 2 },
  links:     { alignItems: 'center', marginTop: Spacing.xxl },
  linkMuted: { color: t.textSecondary, fontSize: FontSize.sm, fontWeight: '500' },
  linkBold:  { color: t.text, fontSize: FontSize.md, fontWeight: '700', letterSpacing: 1, marginTop: Spacing.sm },
});