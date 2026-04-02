import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useLogs } from '../../context/LogsContext';
import { Colors, Spacing, FontSize, Radius } from '../../theme';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { summary } = useLogs();

  const avgs   = summary?.averages ?? {};
  const medAdh = summary?.medicationAdherence ?? 0;
  const count  = summary?.count ?? 0;

  const initial = user?.name?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={styles.name}>{user?.name ?? ''}</Text>
          <Text style={styles.email}>{user?.email ?? ''}</Text>
          {user?.clinicianCode && (
            <View style={styles.codeBadge}>
              <Text style={styles.codeText}>Code: {user.clinicianCode}</Text>
            </View>
          )}
        </View>

        {/* Stats */}
        {count > 0 && (
          <>
            <Text style={styles.sectionLabel}>30-DAY SUMMARY</Text>
            {[
              ['Days logged',          `${count} days`],
              ['Avg mood',             (avgs.mood  ?? 0).toFixed(1)],
              ['Avg focus',            (avgs.focus ?? 0).toFixed(1)],
              ['Avg sleep',            (avgs.sleep ?? 0).toFixed(1)],
              ['Medication adherence', `${medAdh}%`],
            ].map(([label, value]) => (
              <View key={label} style={styles.statRow}>
                <Text style={styles.statLabel}>{label}</Text>
                <Text style={styles.statValue}>{value}</Text>
              </View>
            ))}
          </>
        )}

        {/* Settings */}
        <Text style={styles.sectionLabel}>SETTINGS</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Language</Text>
          <Text style={styles.settingValue}>{user?.language?.toUpperCase() ?? 'NO'}</Text>
        </View>
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Reminders</Text>
          <Text style={styles.settingValue}>On</Text>
        </View>

        <View style={{ height: Spacing.xl }} />

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={logout}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  back:        { color: Colors.text, fontSize: 30, marginRight: 8 },
  headerTitle: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '600', flex: 1 },
  scroll: { padding: Spacing.lg },
  avatarWrap: { alignItems: 'center', marginBottom: Spacing.xl },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.accentBg,
    borderWidth: 1, borderColor: Colors.accentBorder,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: { color: Colors.accent, fontSize: 28, fontWeight: '600' },
  name:  { color: Colors.text, fontSize: FontSize.xl, fontWeight: '600' },
  email: { color: Colors.textMuted, fontSize: FontSize.sm, marginTop: 2 },
  codeBadge: {
    backgroundColor: Colors.accentBg,
    borderRadius: Radius.full,
    borderWidth: 1, borderColor: Colors.accentBorder,
    paddingHorizontal: 10, paddingVertical: 4, marginTop: Spacing.sm,
  },
  codeText: { color: Colors.accent, fontSize: FontSize.xs, fontWeight: '600' },
  sectionLabel: {
    color: Colors.textMuted, fontSize: FontSize.xs,
    fontWeight: '700', letterSpacing: 1.2,
    marginTop: Spacing.lg, marginBottom: Spacing.sm,
  },
  statRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  statLabel: { color: Colors.textSecondary, fontSize: FontSize.md },
  statValue: { color: Colors.text, fontSize: FontSize.md, fontWeight: '600' },
  settingRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  settingLabel: { color: Colors.text, fontSize: FontSize.md },
  settingValue: { color: Colors.textMuted, fontSize: FontSize.md },
  signOutBtn: {
    borderWidth: 1, borderColor: Colors.accent,
    borderRadius: Radius.md, padding: Spacing.lg,
    alignItems: 'center',
  },
  signOutText: { color: Colors.accent, fontSize: FontSize.md, fontWeight: '600' },
});
