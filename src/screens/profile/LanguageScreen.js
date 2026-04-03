import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FontSize, Spacing } from '../../theme';
import api from '../../api/client';
import { useLang } from '../../context/LangContext';

const LANGUAGES = [
  { code: 'en', label: 'English',    native: 'English',    flag: '🇬🇧' },
  { code: 'nl', label: 'Dutch',      native: 'Nederlands', flag: '🇳🇱' },
  { code: 'fr', label: 'French',     native: 'Français',   flag: '🇫🇷' },
  { code: 'de', label: 'German',     native: 'Deutsch',    flag: '🇩🇪' },
  { code: 'it', label: 'Italian',    native: 'Italiano',   flag: '🇮🇹' },
  { code: 'pt', label: 'Portuguese', native: 'Português',  flag: '🇵🇹' },
  { code: 'es', label: 'Spanish',    native: 'Español',    flag: '🇪🇸' },
  { code: 'no', label: 'Norwegian',  native: 'Norsk',      flag: '🇳🇴' },
  { code: 'sv', label: 'Swedish',    native: 'Svenska',    flag: '🇸🇪' },
  { code: 'da', label: 'Danish',     native: 'Dansk',      flag: '🇩🇰' },
  { code: 'fi', label: 'Finnish',    native: 'Suomi',      flag: '🇫🇮' },
  { code: 'is', label: 'Icelandic',  native: 'Íslenska',   flag: '🇮🇸' },
  { code: 'et', label: 'Estonian',   native: 'Eesti',      flag: '🇪🇪' },
  { code: 'pl', label: 'Polish',     native: 'Polski',     flag: '🇵🇱' },
];

export default function LanguageScreen({ navigation }) {
  const { user, updateUser } = useAuth();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { t }  = useLang();

  const [selected, setSelected] = useState(user?.language ?? 'no');
  const [saving,   setSaving]   = useState(false);

  const ACCENT = '#4879BB';
  const isDark = theme.mode === 'dark';

  const save = async (code) => {
    setSelected(code);
    // Update locally immediately — don't wait for API
    updateUser({ language: code });
    setSaving(true);
    try {
      await api.put('/api/patient/profile', { language: code });
    } catch {
      Alert.alert('Error', 'Could not save language');
      // Revert on failure
      updateUser({ language: user?.language ?? 'no' });
      setSelected(user?.language ?? 'no');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? theme.bg : '#F4F7FC' }}>
      {/* Blue header */}
      <View style={[s.header, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>‹</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Language</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingVertical: Spacing.md }}>
        {LANGUAGES.map((lang, index) => {
          const isSelected = selected === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              style={[
                s.row,
                {
                  backgroundColor: isDark ? theme.surface : '#FFFFFF',
                  borderBottomColor: isDark ? theme.border : '#EBEBEB',
                  borderBottomWidth: index === LANGUAGES.length - 1 ? 0 : 1,
                },
              ]}
              onPress={() => save(lang.code)}
              activeOpacity={0.7}
            >
              {/* Radio button */}
              <View style={[s.radio, isSelected && { borderColor: ACCENT }]}>
                {isSelected && <View style={[s.radioInner, { backgroundColor: ACCENT }]} />}
              </View>

              {/* Flag */}
              <Text style={s.flag}>{lang.flag}</Text>

              {/* Label */}
              <Text style={[s.label, { color: isDark ? theme.text : '#1A1A2E' }]}>
                {lang.native}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    backgroundColor: '#4879BB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  backBtn:     { width: 40 },
  backText:    { color: '#FFFFFF', fontSize: 30, lineHeight: 36 },
  headerTitle: { flex: 1, color: '#FFFFFF', fontSize: FontSize.lg, fontWeight: '600', textAlign: 'center' },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  radio: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 2, borderColor: '#BBBBBB',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 16,
  },
  radioInner: {
    width: 12, height: 12, borderRadius: 6,
  },
  flag:  { fontSize: 24, marginRight: 14 },
  label: { fontSize: FontSize.md, fontWeight: '400' },
});