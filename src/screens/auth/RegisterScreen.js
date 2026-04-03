import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, Image, TextInput,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLang } from '../../context/LangContext';
import { FontSize, Spacing } from '../../theme';

export default function RegisterScreen({ navigation, route }) {
  const { register }      = useAuth();
  const { theme }         = useTheme();
  const { t }             = useLang();

  const [age,          setAge]          = useState('');
  const [email,        setEmail]        = useState('');
  const [emailConfirm, setEmailConfirm] = useState('');
  const [pin,          setPin]          = useState('');
  const [tncAccepted,  setTncAccepted]  = useState(false);
  const [infoAccepted, setInfoAccepted] = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');

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
    if (!age.trim())   { setError(t.age + ' is required'); return; }
    if (!email.trim()) { setError(t.email + ' is required'); return; }
    if (email.trim().toLowerCase() !== emailConfirm.trim().toLowerCase()) {
      setError('Email addresses do not match'); return;
    }
    if (!pinSet)                       { setError(t.pinCode + ' is required'); return; }
    if (!tncAccepted || !infoAccepted) { setError('Please accept the terms'); return; }

    setLoading(true); setError('');
    try {
      await register({
        name:     email.split('@')[0],
        email:    email.trim().toLowerCase(),
        password: pin,
        language: 'no',
        age:      parseInt(age) || undefined,
      });
    } catch (e) {
      setError(e?.response?.data?.error ?? e?.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const s = makeStyles(theme);

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
            <Text style={s.title}>{t.yourDiary}</Text>
          </View>

          <View style={s.fields}>
            {error ? <Text style={s.error}>{error}</Text> : null}

            <Field label={`${t.age}*`}          value={age}          onChangeText={(v) => setAge(v.replace(/[^0-9]/g, ''))} keyboardType="number-pad"    theme={theme} />
            <Field label={`${t.email}*`}         value={email}        onChangeText={setEmail}         keyboardType="email-address" theme={theme} />
            <Field label={`${t.confirmEmail}*`}  value={emailConfirm} onChangeText={setEmailConfirm}  keyboardType="email-address" theme={theme} />

            {/* PIN row */}
            <TouchableOpacity style={s.pinRow} onPress={goToPinSetup}>
              <Text style={s.pinLabel}>{`${t.pinCode}*`}</Text>
              <View style={s.pinRight}>
                <Text style={[s.pinAction, pinSet && s.pinDone]}>
                  {pinSet ? t.pinCreated : t.createPin}
                </Text>
                {!pinSet && <Text style={s.pinChevron}> ›</Text>}
              </View>
            </TouchableOpacity>
          </View>

          <View style={{ height: Spacing.lg }} />

          {/* Terms checkbox */}
          <TouchableOpacity style={s.checkRow} onPress={() => setTncAccepted(!tncAccepted)}>
            <View style={[s.checkbox, tncAccepted && s.checkboxChecked]}>
              {tncAccepted && <Text style={s.checkmark}>✓</Text>}
            </View>
            <Text style={s.checkText}>
              {t.acceptTerms} <Text style={s.checkLink}>{t.termsLink}</Text>
              {'\n'}{t.includingPrivacy}
            </Text>
          </TouchableOpacity>

          <View style={{ height: Spacing.md }} />

          {/* Consent checkbox */}
          <TouchableOpacity style={s.checkRow} onPress={() => setInfoAccepted(!infoAccepted)}>
            <View style={[s.checkbox, infoAccepted && s.checkboxChecked]}>
              {infoAccepted && <Text style={s.checkmark}>✓</Text>}
            </View>
            <Text style={s.checkText}>{t.consentText}</Text>
          </TouchableOpacity>

          <View style={{ height: Spacing.xl }} />

          <TouchableOpacity
            style={[s.btn, !canSubmit && s.btnDisabled]}
            onPress={canSubmit ? submit : undefined}
            activeOpacity={canSubmit ? 0.85 : 1}
          >
            <Text style={s.btnText}>{loading ? '...' : t.createAccount}</Text>
          </TouchableOpacity>

          <View style={{ height: Spacing.xl }} />

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={s.alreadyText}>{t.alreadyAccount}</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
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
  bg:     { flex: 1, backgroundColor: t.bg },
  scroll: { flexGrow: 1, paddingHorizontal: 30, paddingTop: 70, paddingBottom: 50 },
  header: { alignItems: 'center', marginBottom: 36 },
  logo:   { width: 120, height: 120 },
  title:  { color: t.text, fontSize: 24, fontWeight: '700', textAlign: 'center', marginTop: 14, lineHeight: 32 },
  fields: { width: '100%' },
  error:  { color: '#C62828', fontSize: FontSize.sm, marginBottom: Spacing.md },

  pinRow: {
    width: '100%', flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: Spacing.lg,
    paddingBottom: 8, borderBottomWidth: 2, borderBottomColor: t.inputLine,
  },
  pinLabel:   { color: t.textSecondary, fontSize: FontSize.md, fontWeight: '600' },
  pinRight:   { flexDirection: 'row', alignItems: 'center' },
  pinAction:  { color: t.accent, fontSize: FontSize.md, fontWeight: '700' },
  pinDone:    { color: '#2E7D32' },
  pinChevron: { color: t.accent, fontSize: FontSize.lg, fontWeight: '700' },

  checkRow: { width: '100%', flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  checkbox: {
    width: 22, height: 22, borderRadius: 4,
    borderWidth: 2, borderColor: t.border,
    justifyContent: 'center', alignItems: 'center',
    marginTop: 2, flexShrink: 0,
  },
  checkboxChecked: { backgroundColor: t.accent, borderColor: t.accent },
  checkmark:       { color: '#FFFFFF', fontSize: 13, fontWeight: '700', lineHeight: 16 },
  checkText:       { color: t.text, fontSize: FontSize.sm, lineHeight: 20, flex: 1 },
  checkLink:       { color: t.text, fontWeight: '700', textDecorationLine: 'underline' },

  btn: {
    width: '100%', height: 56, backgroundColor: t.accent, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: t.accent, shadowOpacity: 0.4, shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }, elevation: 6,
  },
  btnDisabled:  { opacity: 0.4 },
  btnText:      { color: '#FFFFFF', fontSize: FontSize.md, fontWeight: '800', letterSpacing: 2 },
  alreadyText:  { color: t.textSecondary, fontSize: FontSize.md, fontWeight: '600', textAlign: 'center' },
});