import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Image, TextInput,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { FontSize, Spacing } from '../../theme';

const BG     = '#FFFFFF';
const ACCENT = '#1A56DB';
const DARK   = '#111111';
const MUTED  = 'rgba(0,0,0,0.45)';
const LINE   = '#BDBDBD';

export default function RegisterScreen({ navigation, route }) {
  const { register, setPinVerified } = useAuth();

  const [age,          setAge]          = useState('');
  const [email,        setEmail]        = useState('');
  const [emailConfirm, setEmailConfirm] = useState('');
  const [pin,          setPin]          = useState('');
  const [tncAccepted,  setTncAccepted]  = useState(false);
  const [infoAccepted, setInfoAccepted] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');

  // Restore form state when returning from PinSetup/PinConfirm
  useEffect(() => {
    const p = route?.params ?? {};
    if (p.pin)          setPin(p.pin);
    if (p.age)          setAge(p.age);
    if (p.email)        setEmail(p.email);
    if (p.emailConfirm) setEmailConfirm(p.emailConfirm);
    if (p.tncAccepted  !== undefined) setTncAccepted(p.tncAccepted);
    if (p.infoAccepted !== undefined) setInfoAccepted(p.infoAccepted);
  }, [route?.params]);

  const pinSet    = pin.length === 4;
  const canSubmit = tncAccepted && infoAccepted && pinSet;

  const goToPinSetup = () => {
    navigation.navigate('PinSetup', {
      returnParams: { age, email, emailConfirm, tncAccepted, infoAccepted },
    });
  };

  const submit = async () => {
    if (!age.trim())   { setError('Please enter your age'); return; }
    if (!email.trim()) { setError('Please enter your email'); return; }
    if (email.trim().toLowerCase() !== emailConfirm.trim().toLowerCase()) {
      setError('Email addresses do not match'); return;
    }
    if (!pinSet)                       { setError('Please create a PIN code'); return; }
    if (!tncAccepted || !infoAccepted) { setError('Please accept the terms'); return; }
console.log( parseInt(age));
    setLoading(true); setError('');
    try {
      await register({
        name:     email.split('@')[0],
        email:    email.trim().toLowerCase(),
        password: pin,
        language: 'no',
        age:      parseInt(age) || undefined,
      });
      // setPinVerified is called inside register()
      // AppNavigator switches to AppStack automatically
      // WelcomeScreen is the first screen shown (handled in AppNavigator)
    } catch (e) {
      setError(e?.response?.data?.error ?? e?.message ?? 'Registration failed');
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
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Image
              source={require('../../../assets/images/focus_logo.jpg')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Your personal{'\n'}Focus Diary</Text>
          </View>

          <View style={styles.fields}>
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Field label="Age*"           value={age}          onChangeText={(t) => setAge(t.replace(/[^0-9]/g, ''))} keyboardType="number-pad" />
            <Field label="Email*"         value={email}        onChangeText={setEmail} keyboardType="email-address" />
            <Field label="Confirm email*" value={emailConfirm} onChangeText={setEmailConfirm} keyboardType="email-address" />

            <TouchableOpacity style={styles.pinRow} onPress={goToPinSetup}>
              <Text style={styles.pinLabel}>PIN code*</Text>
              <View style={styles.pinRight}>
                <Text style={[styles.pinAction, pinSet && styles.pinDone]}>
                  {pinSet ? 'Created ✓' : 'Create'}
                </Text>
                {!pinSet && <Text style={styles.pinChevron}> ›</Text>}
              </View>
            </TouchableOpacity>
          </View>

          <View style={{ height: Spacing.lg }} />

          <TouchableOpacity style={styles.checkRow} onPress={() => setTncAccepted(!tncAccepted)}>
            <View style={[styles.checkbox, tncAccepted && styles.checkboxChecked]}>
              {tncAccepted && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkText}>
              I accept the <Text style={styles.checkLink}>Terms and Conditions</Text>
              {'\n'}(including the Privacy Policy)
            </Text>
          </TouchableOpacity>

          <View style={{ height: Spacing.md }} />

          <TouchableOpacity style={styles.checkRow} onPress={() => setInfoAccepted(!infoAccepted)}>
            <View style={[styles.checkbox, infoAccepted && styles.checkboxChecked]}>
              {infoAccepted && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkText}>
              I consent to KBB Medic AS processing information about my health, as described in the privacy policy. I am aware that I can withdraw this consent.
            </Text>
          </TouchableOpacity>

          <View style={{ height: Spacing.xl }} />

          <TouchableOpacity
            style={[styles.btn, !canSubmit && styles.btnDisabled]}
            onPress={canSubmit ? submit : undefined}
            activeOpacity={canSubmit ? 0.85 : 1}
          >
            <Text style={styles.btnText}>{loading ? '...' : 'CREATE ACCOUNT'}</Text>
          </TouchableOpacity>

          <View style={{ height: Spacing.xl }} />

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.alreadyText}>Already have an account?</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Field({ label, value, onChangeText, keyboardType, secureTextEntry, autoCapitalize }) {
  return (
    <View style={f.wrap}>
      <Text style={f.label}>{label}</Text>
      <TextInput
        style={f.input}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize ?? 'none'}
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
  header: { alignItems: 'center', marginBottom: 36 },
  logo:   { width: 120, height: 120, borderRadius: 0 },
  title:  { color: DARK, fontSize: 24, fontWeight: '700', textAlign: 'center', marginTop: 14, lineHeight: 32 },
  fields: { width: '100%' },
  error:  { color: '#C62828', fontSize: FontSize.sm, marginBottom: Spacing.md },
  pinRow: {
    width: '100%', flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: Spacing.lg,
    paddingBottom: 8, borderBottomWidth: 2, borderBottomColor: LINE,
  },
  pinLabel:   { color: MUTED, fontSize: FontSize.md, fontWeight: '600' },
  pinRight:   { flexDirection: 'row', alignItems: 'center' },
  pinAction:  { color: ACCENT, fontSize: FontSize.md, fontWeight: '700' },
  pinDone:    { color: '#2E7D32' },
  pinChevron: { color: ACCENT, fontSize: FontSize.lg, fontWeight: '700' },
  checkRow: { width: '100%', flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  checkbox: {
    width: 22, height: 22, borderRadius: 4,
    borderWidth: 2, borderColor: LINE,
    justifyContent: 'center', alignItems: 'center',
    marginTop: 2, flexShrink: 0,
  },
  checkboxChecked: { backgroundColor: ACCENT, borderColor: ACCENT },
  checkmark:       { color: '#FFFFFF', fontSize: 13, fontWeight: '700', lineHeight: 16 },
  checkText:       { color: DARK, fontSize: FontSize.sm, lineHeight: 20, flex: 1 },
  checkLink:       { color: DARK, fontWeight: '700', textDecorationLine: 'underline' },
  btn: {
    width: '100%', height: 56, backgroundColor: ACCENT, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: ACCENT, shadowOpacity: 0.4, shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  btnDisabled: { opacity: 0.4 },
  btnText:     { color: '#FFFFFF', fontSize: FontSize.md, fontWeight: '800', letterSpacing: 2 },
  alreadyText: { color: MUTED, fontSize: FontSize.md, fontWeight: '600', textAlign: 'center' },
});