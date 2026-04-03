import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import { FontSize, Spacing, Radius } from '../../theme';
import api from '../../api/client';

const LANGUAGES = [
  { code: 'en', label: 'English',    nativeLabel: 'English',     flag: '🇬🇧' },
  { code: 'no', label: 'Norwegian',  nativeLabel: 'Norsk',       flag: '🇳🇴' },
  { code: 'sv', label: 'Swedish',    nativeLabel: 'Svenska',     flag: '🇸🇪' },
  { code: 'da', label: 'Danish',     nativeLabel: 'Dansk',       flag: '🇩🇰' },
  { code: 'de', label: 'German',     nativeLabel: 'Deutsch',     flag: '🇩🇪' },
  { code: 'fr', label: 'French',     nativeLabel: 'Français',    flag: '🇫🇷' },
  { code: 'nl', label: 'Dutch',      nativeLabel: 'Nederlands',  flag: '🇳🇱' },
  { code: 'it', label: 'Italian',    nativeLabel: 'Italiano',    flag: '🇮🇹' },
  { code: 'es', label: 'Spanish',    nativeLabel: 'Español',     flag: '🇪🇸' },
  { code: 'pt', label: 'Portuguese', nativeLabel: 'Português',   flag: '🇵🇹' },
  { code: 'fi', label: 'Finnish',    nativeLabel: 'Suomi',       flag: '🇫🇮' },
];

export default function LanguageScreen({ navigation }) {
  const { theme }             = useTheme();
  const { user, updateUser }  = useAuth();
  const { t }                 = useLang();
  const insets                = useSafeAreaInsets();

  const [selected, setSelected] = useState(user?.language ?? 'no');
  const [saving,   setSaving]   = useState(false);

  const handleSelect = async (code) => {
    if (code === selected) return;
    setSelected(code);
    setSaving(true);
    try {
      const res = await api.put('/api/patient/profile', { language: code });
      if (res.data?.data) updateUser(res.data.data);
    } catch {
      Alert.alert('Error', 'Could not save language.');
      setSelected(user?.language ?? 'no'); // revert on failure
    } finally {
      setSaving(false);
    }
  };

  const s = makeStyles(theme, insets);

  return (
    <View style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.headerBtn}>
          <Text style={s.headerBack}>‹</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t.languageTitle}</Text>
        <View style={s.headerBtn} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
      >
        {LANGUAGES.map((lang, index) => {
          const isSelected = lang.code === selected;
          const isLast     = index === LANGUAGES.length - 1;
          return (
            <TouchableOpacity
              key={lang.code}
              style={[s.row, isLast && s.rowLast]}
              onPress={() => handleSelect(lang.code)}
              activeOpacity={0.7}
              disabled={saving}
            >
              {/* Radio button */}
              <View style={[s.radio, isSelected && s.radioSelected]}>
                {isSelected && <View style={s.radioDot} />}
              </View>

              {/* Flag */}
              <Text style={s.flag}>{lang.flag}</Text>

              {/* Labels */}
              <View style={s.labelWrap}>
                <Text style={s.langLabel}>{lang.nativeLabel}</Text>
                {lang.nativeLabel !== lang.label && (
                  <Text style={s.langSub}>{lang.label}</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const makeStyles = (t, insets) => StyleSheet.create({
  root: { flex: 1, backgroundColor: t.bgSecondary },

  header: {
    backgroundColor: t.accent,
    paddingTop: insets.top + Spacing.sm,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBtn:   { width: 40 },
  headerBack:  { color: '#FFFFFF', fontSize: 28, lineHeight: 34 },
  headerTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: FontSize.lg,
    fontWeight: '600',
    textAlign: 'center',
  },

  list: {
    backgroundColor: t.bg,
    marginTop: Spacing.lg,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    backgroundColor: t.bg,
    borderBottomWidth: 1,
    borderBottomColor: t.border,
  },
  rowLast: {
    borderBottomWidth: 0,
  },

  // Radio
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: t.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
  },
  radioSelected: {
    borderColor: t.accent,
  },
  radioDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: t.accent,
  },

  flag: {
    fontSize: 26,
    marginRight: Spacing.md,
  },

  labelWrap: {
    flex: 1,
  },
  langLabel: {
    color: t.text,
    fontSize: FontSize.md,
    fontWeight: '500',
  },
  langSub: {
    color: t.textMuted,
    fontSize: FontSize.sm,
    marginTop: 1,
  },
});