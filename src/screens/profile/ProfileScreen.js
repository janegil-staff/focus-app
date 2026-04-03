import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Line, Rect, Ellipse, G } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLang } from '../../context/LangContext';
import { Spacing, FontSize, Radius } from '../../theme';
import api from '../../api/client';

const ALL_LANGUAGES = [
  { code: 'en', label: 'English',    flag: '🇬🇧' },
  { code: 'no', label: 'Norsk',      flag: '🇳🇴' },
  { code: 'sv', label: 'Svenska',    flag: '🇸🇪' },
  { code: 'da', label: 'Dansk',      flag: '🇩🇰' },
  { code: 'de', label: 'Deutsch',    flag: '🇩🇪' },
  { code: 'fr', label: 'Français',   flag: '🇫🇷' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  { code: 'it', label: 'Italiano',   flag: '🇮🇹' },
  { code: 'es', label: 'Español',    flag: '🇪🇸' },
  { code: 'pt', label: 'Português',  flag: '🇵🇹' },
  { code: 'fi', label: 'Suomi',      flag: '🇫🇮' },
];

// ── Gender SVG icons ───────────────────────────────────────────────────────────
function FemaleSvg({ color, size = 48 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      {/* Head */}
      <Circle cx="24" cy="14" r="8" stroke={color} strokeWidth="2" />
      {/* Hair */}
      <Path d="M16 14 Q16 6 24 6 Q32 6 32 14" stroke={color} strokeWidth="2" fill="none" />
      {/* Shoulders / body */}
      <Path d="M10 38 C10 28 38 28 38 38" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Dress shape */}
      <Path d="M17 26 L14 38 M31 26 L34 38" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function MaleSvg({ color, size = 48 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      {/* Head */}
      <Circle cx="24" cy="14" r="8" stroke={color} strokeWidth="2" />
      {/* Shoulders */}
      <Path d="M10 38 C10 28 38 28 38 38" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Shirt collar */}
      <Path d="M20 26 L24 30 L28 26" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

function UndefinedSvg({ color, size = 48 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Text style={{ color, fontSize: 28, textAlign: 'center' }}>?</Text>
      <Path d="M20 18 C20 14 28 14 28 19 C28 22 24 23 24 26" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <Circle cx="24" cy="31" r="1.5" fill={color} />
    </Svg>
  );
}

const GENDERS = [
  { value: 'female',    labelKey: 'female',    Svg: FemaleSvg },
  { value: 'male',      labelKey: 'male',      Svg: MaleSvg },
  { value: 'undefined', labelKey: 'undefined', Svg: UndefinedSvg },
];

// ── Warning icon ───────────────────────────────────────────────────────────────
function WarningIcon({ size = 20 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path d="M10 2 L18 17 L2 17 Z" stroke="#E53935" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
      <Line x1="10" y1="8" x2="10" y2="12" stroke="#E53935" strokeWidth="1.5" strokeLinecap="round" />
      <Circle cx="10" cy="14.5" r="0.8" fill="#E53935" />
    </Svg>
  );
}

export default function ProfileScreen({ navigation }) {
  const { user, logout, logoutAndClearPin, updateUser } = useAuth();
  const { theme, override, setTheme } = useTheme();
  const { t } = useLang();
  const insets = useSafeAreaInsets();

  const [gender, setGender] = useState(user?.gender ?? 'undefined');
  const [ageVal, setAgeVal] = useState(String(user?.age ?? ''));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/api/patient/profile').then((res) => {
      if (res.data?.data) {
        updateUser(res.data.data);
        setGender(res.data.data.gender ?? 'undefined');
        setAgeVal(String(res.data.data.age ?? ''));
      }
    }).catch(() => {});
  }, []);

  const originalAge    = String(user?.age ?? '');
  const originalGender = user?.gender ?? 'undefined';
  const isDirty = ageVal !== originalAge || gender !== originalGender;

  const currentLang = ALL_LANGUAGES.find((l) => l.code === (user?.language ?? 'no')) ?? ALL_LANGUAGES[1];
  const email = user?.email ?? '—';
  const emailVerified = user?.emailVerified ?? false;

  const saveChanges = async () => {
    setSaving(true);
    try {
      const body = {};
      if (ageVal) body.age = parseInt(ageVal);
      if (gender && gender !== 'undefined') body.gender = gender;
      const res = await api.put('/api/patient/profile', body);
      if (res.data?.data) updateUser(res.data.data);
      Alert.alert(t.saved, t.profileUpdated);
    } catch {
      Alert.alert('Error', 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (isDirty) {
      Alert.alert(t.saveChanges, t.unsavedChanges, [
        { text: t.discard, style: 'destructive', onPress: () => navigation.goBack() },
        { text: t.save,    style: 'default',     onPress: async () => { await saveChanges(); navigation.goBack(); } },
        { text: t.cancel,  style: 'cancel' },
      ]);
    } else {
      navigation.goBack();
    }
  };

  const themeLabel = override === 'dark' ? '🌙 Dark' : override === 'light' ? '☀️ Light' : '⚙️ System';
  const cycleTheme = () => {
    if (!override || override === 'system') setTheme('light');
    else if (override === 'light')          setTheme('dark');
    else                                    setTheme('system');
  };

  const handleLogout = () => Alert.alert(t.signOut, t.signOutMsg, [
    { text: t.cancel,  style: 'cancel' },
    { text: t.signOut, style: 'destructive', onPress: logout },
  ]);

  const handleClearPin = () => Alert.alert(t.signOutClearPin, t.clearPinMsg, [
    { text: t.cancel,          style: 'cancel' },
    { text: t.signOutClearPin, style: 'destructive', onPress: logoutAndClearPin },
  ]);

  const s = makeStyles(theme, insets);

  return (
    <View style={s.root}>

      {/* Header — horizontal gradient */}
      <LinearGradient
        colors={[theme.accent, theme.accentDark ?? '#2D4A6E']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={s.header}
      >
        <TouchableOpacity onPress={handleBack} style={s.headerBtn}>
          <Text style={s.headerBack}>‹</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t.settings}</Text>
        <TouchableOpacity style={s.headerBtn} onPress={handleLogout}>
          <Text style={s.headerLogout}>⎋</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 50 }} showsVerticalScrollIndicator={false}>

        {/* ── Gender ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>{t.chooseGender}</Text>
          <View style={s.genderRow}>
            {GENDERS.map(({ value, labelKey, Svg: GenderSvg }) => {
              const isSelected = gender === value;
              const iconColor  = isSelected ? '#FFFFFF' : theme.accent;
              return (
                <TouchableOpacity key={value} style={s.genderItem} onPress={() => setGender(value)}>
                  <View style={[s.genderCircle, isSelected && s.genderCircleActive]}>
                    <GenderSvg color={iconColor} size={44} />
                  </View>
                  <Text style={[s.genderLabel, isSelected && s.genderLabelActive]}>{t[labelKey]}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={s.divider} />

        {/* ── Age ── */}
        <View style={s.section}>
          <View style={s.fieldWrap}>
            <Text style={s.fieldLabel}>{t.age}</Text>
            <TextInput
              style={s.fieldInput}
              value={ageVal}
              onChangeText={(v) => setAgeVal(v.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              placeholder="—"
              placeholderTextColor={theme.textMuted}
              selectionColor={theme.accent}
            />
          </View>
          <View style={s.fieldLine} />

          {/* ── Email ── */}
          <View style={s.fieldRowWrap}>
            <View>
              <Text style={s.fieldLabel}>{t.email}</Text>
              <Text style={s.fieldValue}>{email}</Text>
            </View>
            <TouchableOpacity>
              <Text style={s.fieldChange}>{t.change} ›</Text>
            </TouchableOpacity>
          </View>
          <View style={s.fieldLine} />
        </View>

        {/* ── Email warning banner ── */}
        {!emailVerified && (
          <View style={s.warningBanner}>
            <View style={s.warningLeft}>
              <WarningIcon size={22} />
              <View style={s.warningTextWrap}>
                <Text style={s.warningTitle}>Your email address is not verified</Text>
                <Text style={s.warningBody}>
                  To be able to reset your password, you should make sure that your email address is correct. Please confirm your email address.
                </Text>
              </View>
            </View>
            <TouchableOpacity style={s.warningConfirm}>
              <Text style={s.warningConfirmText}>Confirm ›</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={s.divider} />

        {/* ── Settings rows ── */}
        <View style={s.section}>
          <Row label={t.personalSettings} value={t.change}                            onPress={() => navigation.navigate('PersonalSettings')}                theme={theme} />
          <Row label={t.appearance}       value={themeLabel}                          onPress={cycleTheme}                                  theme={theme} />
          <Row label={t.language}         value={`${currentLang.flag} ${currentLang.label}`} onPress={() => navigation.navigate('Language')} theme={theme} />
          <Row label={t.pin}              value={t.change}                            onPress={() => navigation.navigate('PinSetup')}       theme={theme} />
          <Row label={t.termsConditions}  value={t.view}                              onPress={() => {}}                                    theme={theme} />
          <Row label={t.about}            value={t.readMore}                          onPress={() => {}}                                    theme={theme} last />
        </View>

        <View style={s.divider} />

        {/* ── Sign out ── */}
        <View style={s.section}>
          <TouchableOpacity style={s.signOutRow} onPress={handleLogout}>
            <Text style={s.signOutText}>{t.signOut}</Text>
          </TouchableOpacity>
          <View style={s.fieldLine} />
          <TouchableOpacity style={s.signOutRow} onPress={handleClearPin}>
            <Text style={s.clearText}>{t.signOutClearPin}</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

function Row({ label, value, onPress, theme, last }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: Spacing.lg,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: theme.border,
      }}
    >
      <Text style={{ color: theme.text,      fontSize: FontSize.md }}>{label}</Text>
      <Text style={{ color: theme.textMuted, fontSize: FontSize.md }}>{value} ›</Text>
    </TouchableOpacity>
  );
}

const makeStyles = (t, insets) => StyleSheet.create({
  root: { flex: 1, backgroundColor: t.bgSecondary ?? '#F0F4F8' },

  // Header
  header: {
    paddingTop: insets.top + Spacing.sm,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBtn:    { width: 40 },
  headerBack:   { color: '#FFFFFF', fontSize: 28, lineHeight: 34 },
  headerLogout: { color: '#FFFFFF', fontSize: 22, textAlign: 'right' },
  headerTitle:  { flex: 1, color: '#FFFFFF', fontSize: FontSize.lg, fontWeight: '600', textAlign: 'center' },

  divider: { height: Spacing.md, backgroundColor: t.bgSecondary ?? '#F0F4F8' },
  section: { backgroundColor: t.bg ?? '#FFFFFF' },

  // Gender
  sectionTitle: {
    color: t.text,
    fontSize: FontSize.md,
    fontWeight: '500',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  genderRow:  { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  genderItem: { alignItems: 'center', gap: 8 },
  genderCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: t.accentBg ?? '#D6E8F7',
    justifyContent: 'center', alignItems: 'center',
  },
  genderCircleActive: { backgroundColor: t.accent },
  genderLabel:        { color: t.textSecondary, fontSize: FontSize.md },
  genderLabelActive:  { color: t.text, fontWeight: '700' },

  // Fields
  fieldWrap:    { paddingHorizontal: Spacing.lg, paddingTop: 14, paddingBottom: 0 },
  fieldLabel:   { color: t.textMuted, fontSize: FontSize.sm, marginBottom: 2 },
  fieldInput:   { color: t.text, fontSize: FontSize.lg, fontWeight: '500', paddingBottom: 10, paddingHorizontal: 0 },
  fieldRowWrap: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingTop: 14, paddingBottom: 10 },
  fieldValue:   { color: t.text, fontSize: FontSize.lg, fontWeight: '500' },
  fieldLine:    { height: 1, backgroundColor: t.border, marginHorizontal: Spacing.lg },
  fieldChange:  { color: t.textMuted, fontSize: FontSize.md },

  // Warning banner
  warningBanner: {
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.md,
    borderWidth: 1.5,
    borderColor: '#E53935',
    borderRadius: Radius.md,
    backgroundColor: '#FFF5F5',
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  warningLeft:       { flexDirection: 'row', flex: 1, gap: Spacing.sm, alignItems: 'flex-start' },
  warningTextWrap:   { flex: 1 },
  warningTitle:      { color: '#E53935', fontSize: FontSize.sm, fontWeight: '700', marginBottom: 4 },
  warningBody:       { color: '#555', fontSize: FontSize.xs, lineHeight: 18 },
  warningConfirm:    { justifyContent: 'center', paddingLeft: Spacing.sm },
  warningConfirmText:{ color: t.accent, fontSize: FontSize.sm, fontWeight: '600' },

  // Sign out
  signOutRow:  { paddingVertical: 15, paddingHorizontal: Spacing.lg },
  signOutText: { color: t.accent, fontSize: FontSize.md, fontWeight: '500' },
  clearText:   { color: '#EF4444', fontSize: FontSize.md },
});