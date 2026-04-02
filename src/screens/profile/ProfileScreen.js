import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useLogs } from '../../context/LogsContext';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, FontSize, Radius } from '../../theme';

const LANGUAGES = [
  { code: 'no', label: 'Norwegian', flag: '🇳🇴' },
  { code: 'en', label: 'English',   flag: '🇬🇧' },
  { code: 'sv', label: 'Swedish',   flag: '🇸🇪' },
  { code: 'da', label: 'Danish',    flag: '🇩🇰' },
  { code: 'de', label: 'German',    flag: '🇩🇪' },
  { code: 'fr', label: 'French',    flag: '🇫🇷' },
];

// SVG-style gender icons as simple RN shapes
function FemaleIcon({ color }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 40, height: 40 }}>
      {/* Head */}
      <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2.5, borderColor: color, marginBottom: 2 }} />
      {/* Body — dress shape */}
      <View style={{ width: 28, height: 16, borderTopLeftRadius: 4, borderTopRightRadius: 4, borderWidth: 2.5, borderColor: color, borderBottomWidth: 0 }} />
      <View style={{ width: 36, height: 8, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, borderWidth: 2.5, borderColor: color, borderTopWidth: 0, marginTop: -1 }} />
    </View>
  );
}

function MaleIcon({ color }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 40, height: 40 }}>
      {/* Head */}
      <View style={{ width: 18, height: 18, borderRadius: 9, borderWidth: 2.5, borderColor: color, marginBottom: 2 }} />
      {/* Body — rectangle */}
      <View style={{ width: 28, height: 20, borderRadius: 4, borderWidth: 2.5, borderColor: color }} />
    </View>
  );
}

function UndefinedIcon({ color }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 40, height: 40 }}>
      <Text style={{ color, fontSize: 28, fontWeight: '300', lineHeight: 32 }}>?</Text>
    </View>
  );
}

const GENDERS = [
  { value: 'female',    label: 'Female',    Icon: FemaleIcon },
  { value: 'male',      label: 'Male',      Icon: MaleIcon },
  { value: 'undefined', label: 'Undefined', Icon: UndefinedIcon },
];

export default function ProfileScreen({ navigation }) {
  const { user, logout, logoutAndClearPin } = useAuth();
  const { theme, override, setTheme } = useTheme();
  const insets = useSafeAreaInsets();

  const [gender, setGender] = useState(user?.gender ?? 'undefined');

  const lang = LANGUAGES.find((l) => l.code === (user?.language ?? 'no')) ?? LANGUAGES[0];
  const age  = user?.age ?? '—';
  const email = user?.email ?? '—';

  const s = makeStyles(theme, insets);

  const themeLabel = override === 'dark' ? '🌙 Dark' : override === 'light' ? '☀️ Light' : '⚙️ System';
  const cycleTheme = () => {
    if (!override || override === 'system') setTheme('light');
    else if (override === 'light')          setTheme('dark');
    else                                    setTheme('system');
  };

  const handleLogout = () => Alert.alert(
    'Sign out',
    'You can sign back in with your email and PIN.',
    [{ text: 'Cancel', style: 'cancel' }, { text: 'Sign out', style: 'destructive', onPress: logout }]
  );

  const handleClearPin = () => Alert.alert(
    'Sign out and clear PIN',
    'This will remove your PIN from this device.',
    [{ text: 'Cancel', style: 'cancel' }, { text: 'Clear & sign out', style: 'destructive', onPress: logoutAndClearPin }]
  );

  return (
    <View style={s.root}>
      {/* Blue header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.headerBtn}>
          <Text style={s.headerBack}>‹</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Settings</Text>
        <TouchableOpacity style={s.headerBtn} onPress={handleLogout}>
          <Text style={s.headerLogout}>⎋</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 50 }}>

        {/* Gender */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Choose your gender</Text>
          <View style={s.genderRow}>
            {GENDERS.map(({ value, label, Icon }) => {
              const selected = gender === value;
              const iconColor = selected ? '#FFFFFF' : '#1A56DB';
              return (
                <TouchableOpacity key={value} style={s.genderItem} onPress={() => setGender(value)}>
                  <View style={[s.genderCircle, selected && s.genderCircleActive]}>
                    <Icon color={iconColor} />
                  </View>
                  <Text style={[s.genderLabel, selected && s.genderLabelActive]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={s.gap} />

        {/* Age */}
        <View style={s.section}>
          <View style={s.fieldWrap}>
            <Text style={s.fieldLabel}>Age</Text>
            <Text style={s.fieldValue}>{age}</Text>
          </View>
          <View style={s.fieldLine} />

          {/* Email */}
          <View style={s.fieldWrap}>
            <View>
              <Text style={s.fieldLabel}>Email</Text>
              <Text style={s.fieldValue}>{email}</Text>
            </View>
            <TouchableOpacity>
              <Text style={s.fieldChange}>Change ›</Text>
            </TouchableOpacity>
          </View>
          <View style={s.fieldLine} />
        </View>

        <View style={s.gap} />

        {/* Settings rows */}
        <View style={s.section}>
          <Row label="Personal settings" value="Change" onPress={() => {}}         theme={theme} />
          <Row label="Appearance"        value={themeLabel} onPress={cycleTheme}   theme={theme} />
          <Row label="Language"          value={`${lang.flag} ${lang.label}`} onPress={() => {}} theme={theme} />
          <Row label="PIN"               value="Change" onPress={() => navigation.navigate('PinSetup')} theme={theme} />
          <Row label="Terms and Conditions" value="View" onPress={() => {}}        theme={theme} />
          <Row label="About"             value="Read More" onPress={() => {}}      theme={theme} last />
        </View>

        <View style={s.gap} />

        {/* Sign out */}
        <View style={s.section}>
          <TouchableOpacity style={s.signOutRow} onPress={handleLogout}>
            <Text style={s.signOutText}>Sign out</Text>
          </TouchableOpacity>
          <View style={s.fieldLine} />
          <TouchableOpacity style={s.signOutRow} onPress={handleClearPin}>
            <Text style={s.clearText}>Sign out and clear PIN</Text>
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
        paddingHorizontal: 20,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: theme.border,
      }}
    >
      <Text style={{ color: theme.text, fontSize: FontSize.md }}>{label}</Text>
      <Text style={{ color: theme.textMuted, fontSize: FontSize.md }}>{value} ›</Text>
    </TouchableOpacity>
  );
}

const makeStyles = (t, insets) => StyleSheet.create({
  root: { flex: 1, backgroundColor: t.bgSecondary },

  header: {
    backgroundColor: '#1A56DB',
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

  section: { backgroundColor: t.bg },
  gap:     { height: Spacing.lg, backgroundColor: t.bgSecondary },

  sectionTitle: {
    color: t.text,
    fontSize: FontSize.md,
    fontWeight: '500',
    paddingHorizontal: 20,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },

  genderRow:  { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20, paddingBottom: Spacing.xl },
  genderItem: { alignItems: 'center', gap: 8 },
  genderCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: t.accentBg,
    justifyContent: 'center', alignItems: 'center',
  },
  genderCircleActive: { backgroundColor: '#1A56DB' },
  genderLabel:        { color: t.textSecondary, fontSize: FontSize.md },
  genderLabelActive:  { color: t.text, fontWeight: '700' },

  fieldWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 10,
  },
  fieldLabel:  { color: t.textMuted, fontSize: FontSize.sm, marginBottom: 2 },
  fieldValue:  { color: t.text, fontSize: FontSize.lg, fontWeight: '500' },
  fieldLine:   { height: 1, backgroundColor: t.border, marginLeft: 20 },
  fieldChange: { color: t.textMuted, fontSize: FontSize.md },

  signOutRow: { paddingVertical: 15, paddingHorizontal: 20 },
  signOutText:{ color: '#1A56DB', fontSize: FontSize.md, fontWeight: '500' },
  clearText:  { color: '#EF4444', fontSize: FontSize.md },
});