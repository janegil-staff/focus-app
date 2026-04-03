import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLang } from '../../context/LangContext';
import { Spacing, FontSize, Radius } from '../../theme';
import api from '../../api/client';

export default function PersonalSettingsScreen({ navigation }) {
  const { user, updateUser, logout } = useAuth();
  const { theme, override, setTheme } = useTheme();
  const { t } = useLang();
  const insets = useSafeAreaInsets();

  // ── Toggle states ──────────────────────────────────────────────────────────
  const [reminderEnabled,   setReminderEnabled]   = useState(user?.settings?.reminderEnabled   ?? false);
  const [reminderTime,      setReminderTime]       = useState(user?.settings?.reminderTime      ?? '20:00');
  const [darkMode,          setDarkMode]           = useState(override === 'dark');
  const [requirePin,        setRequirePin]         = useState(user?.settings?.requirePin        ?? true);
  const [trackImpulsivity,  setTrackImpulsivity]   = useState(user?.settings?.trackImpulsivity  ?? true);
  const [trackScreenTime,   setTrackScreenTime]    = useState(user?.settings?.trackScreenTime   ?? true);
  const [trackMedication,   setTrackMedication]    = useState(user?.settings?.trackMedication   ?? true);
  const [trackSleep,        setTrackSleep]         = useState(user?.settings?.trackSleep        ?? true);
  const [trackEnergy,       setTrackEnergy]        = useState(user?.settings?.trackEnergy       ?? true);
  const [weeklyReport,      setWeeklyReport]       = useState(user?.settings?.weeklyReport      ?? false);
  const [shareWithDoctor,   setShareWithDoctor]    = useState(user?.settings?.shareWithDoctor   ?? false);

  const handleDarkMode = (val) => {
    setDarkMode(val);
    setTheme(val ? 'dark' : 'light');
  };

  const saveSettings = async (key, value) => {
    try {
      await api.put('/api/patient/profile', { settings: { [key]: value } });
    } catch {
      // fail silently — state is already updated optimistically
    }
  };

  const toggle = (setter, key) => (val) => {
    setter(val);
    saveSettings(key, val);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This cannot be undone.',
      [
        { text: t.cancel, style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete('/api/patient/account');
              logout();
            } catch {
              Alert.alert('Error', 'Could not delete account. Please try again.');
            }
          },
        },
      ]
    );
  };

  const s = makeStyles(theme, insets);

  return (
    <View style={s.root}>

      {/* Header */}
      <LinearGradient
        colors={[theme.accent, theme.accentDark ?? '#2D4A6E']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={s.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.headerBtn}>
          <Text style={s.headerBack}>‹</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t.personalSettings}</Text>
        <View style={s.headerBtn} />
      </LinearGradient>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Section 1: App behaviour ── */}
        <View style={s.section}>

          <ToggleRow
            label="Activate reminder"
            subtitle={reminderEnabled ? `Reminder at ${reminderTime}` : 'Get a daily reminder to log'}
            value={reminderEnabled}
            onValueChange={toggle(setReminderEnabled, 'reminderEnabled')}
            theme={theme}
            extra={reminderEnabled ? (
              <TouchableOpacity style={s.editBadge} onPress={() => {}}>
                <Text style={[s.editBadgeText, { color: theme.accent }]}>Edit</Text>
              </TouchableOpacity>
            ) : null}
          />

          <ToggleRow
            label="Dark mode"
            subtitle="Activate dark mode if you are sensitive to light."
            value={darkMode}
            onValueChange={handleDarkMode}
            theme={theme}
          />

          <ToggleRow
            label="Require PIN to use app"
            value={requirePin}
            onValueChange={toggle(setRequirePin, 'requirePin')}
            theme={theme}
            last
          />
        </View>

        <View style={s.divider} />

        {/* ── Section 2: ADHD tracking fields ── */}
        <View style={s.section}>

          <ToggleRow
            label="Track impulsivity"
            subtitle="Log impulsive urges and behaviours each day."
            value={trackImpulsivity}
            onValueChange={toggle(setTrackImpulsivity, 'trackImpulsivity')}
            theme={theme}
          />

          <ToggleRow
            label="Track screen time"
            subtitle="Record daily screen time as part of your ADHD pattern."
            value={trackScreenTime}
            onValueChange={toggle(setTrackScreenTime, 'trackScreenTime')}
            theme={theme}
          />

          <ToggleRow
            label="Track medication"
            subtitle="Log whether you took your medication each day."
            value={trackMedication}
            onValueChange={toggle(setTrackMedication, 'trackMedication')}
            theme={theme}
          />

          <ToggleRow
            label="Track sleep quality"
            subtitle="Poor sleep strongly affects ADHD symptoms — track it daily."
            value={trackSleep}
            onValueChange={toggle(setTrackSleep, 'trackSleep')}
            theme={theme}
          />

          <ToggleRow
            label="Track energy levels"
            subtitle="Low energy is a common ADHD symptom. Log it each day."
            value={trackEnergy}
            onValueChange={toggle(setTrackEnergy, 'trackEnergy')}
            theme={theme}
            last
          />
        </View>

        <View style={s.divider} />

        {/* ── Section 3: Sharing ── */}
        <View style={s.section}>

          <ToggleRow
            label="Weekly summary report"
            subtitle="Receive a weekly overview of your mood, focus and sleep trends."
            value={weeklyReport}
            onValueChange={toggle(setWeeklyReport, 'weeklyReport')}
            theme={theme}
          />

          <ToggleRow
            label="Share data with doctor"
            subtitle="Allow your clinician to view your logs and trends."
            value={shareWithDoctor}
            onValueChange={toggle(setShareWithDoctor, 'shareWithDoctor')}
            theme={theme}
            last
          />
        </View>

        <View style={s.divider} />

        {/* ── Delete account ── */}
        <View style={s.section}>
          <TouchableOpacity style={s.deleteRow} onPress={handleDeleteAccount}>
            <Text style={s.deleteText}>Delete Account</Text>
            <Text style={s.deleteChevron}>›</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

// ── Toggle row component ───────────────────────────────────────────────────────
function ToggleRow({ label, subtitle, value, onValueChange, theme, last, extra }) {
  return (
    <View style={{
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      borderBottomWidth: last ? 0 : 1,
      borderBottomColor: theme.border,
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: Spacing.md,
    }}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.text, fontSize: FontSize.md, fontWeight: '500', marginBottom: subtitle ? 3 : 0 }}>
          {label}
        </Text>
        {subtitle ? (
          <Text style={{ color: theme.textSecondary, fontSize: FontSize.sm, lineHeight: 18 }}>
            {subtitle}
          </Text>
        ) : null}
        {extra ? <View style={{ marginTop: 6 }}>{extra}</View> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#D1D5DB', true: '#4CAF50' }}
        thumbColor="#FFFFFF"
        ios_backgroundColor="#D1D5DB"
        style={{ marginTop: 2 }}
      />
    </View>
  );
}

const makeStyles = (t, insets) => StyleSheet.create({
  root: { flex: 1, backgroundColor: t.bgSecondary ?? '#F0F4F8' },

  header: {
    paddingTop: insets.top + Spacing.sm,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBtn:   { width: 40 },
  headerBack:  { color: '#FFFFFF', fontSize: 28, lineHeight: 34 },
  headerTitle: { flex: 1, color: '#FFFFFF', fontSize: FontSize.lg, fontWeight: '600', textAlign: 'center' },

  divider: { height: Spacing.md, backgroundColor: t.bgSecondary ?? '#F0F4F8' },
  section: { backgroundColor: t.bg ?? '#FFFFFF' },

  editBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: t.accent,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 3,
  },
  editBadgeText: { fontSize: FontSize.sm, fontWeight: '500' },

  deleteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 16,
  },
  deleteText:    { color: '#E53935', fontSize: FontSize.md, fontWeight: '500' },
  deleteChevron: { color: '#E53935', fontSize: FontSize.lg },
});
