import React from 'react';
import {
  TouchableOpacity, Text, StyleSheet, ActivityIndicator,
  TextInput, View, Pressable,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize } from '../theme';

// ── GradientButton (red, full width) ─────────────────────────────────────────
export function PrimaryButton({ label, onPress, loading, style }) {
  return (
    <TouchableOpacity
      style={[styles.primaryBtn, style]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={loading}
    >
      {loading
        ? <ActivityIndicator color={Colors.white} />
        : <Text style={styles.primaryBtnText}>{label}</Text>}
    </TouchableOpacity>
  );
}

// ── Underline text field (for auth screens) ───────────────────────────────────
export function UnderlineInput({
  label, value, onChangeText, secureTextEntry,
  keyboardType, autoCapitalize = 'none', error,
}) {
  return (
    <View style={styles.underlineWrap}>
      <Text style={styles.underlineLabel}>{label}</Text>
      <TextInput
        style={[styles.underlineInput, error && styles.underlineError]}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        placeholderTextColor="rgba(255,255,255,0.4)"
        selectionColor={Colors.white}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

// ── Score badge ───────────────────────────────────────────────────────────────
export function ScoreBadge({ score, size = 32 }) {
  const color = score >= 4 ? Colors.scoreHigh : score === 3 ? Colors.scoreMid : Colors.scoreLow;
  return (
    <View style={[styles.badge, { width: size, height: size, borderColor: color + '66', backgroundColor: color + '26' }]}>
      <Text style={[styles.badgeText, { color, fontSize: size * 0.38 }]}>{score}</Text>
    </View>
  );
}

// ── Section header ────────────────────────────────────────────────────────────
export function SectionHeader({ label, right }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionLabel}>{label}</Text>
      {right}
    </View>
  );
}

// ── Menu button (home screen) ─────────────────────────────────────────────────
export function MenuButton({ icon, label, onPress }) {
  return (
    <Pressable style={styles.menuBtn} onPress={onPress}>
      <View style={styles.menuIconWrap}>
        <Text style={styles.menuIcon}>{icon}</Text>
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
    </Pressable>
  );
}

// ── Score slider ──────────────────────────────────────────────────────────────
export function ScoreRow({ label, value, onChange, labels }) {
  const color = value >= 4 ? Colors.scoreHigh : value === 3 ? Colors.scoreMid : Colors.scoreLow;
  const scoreLabels = labels ?? ['Very low', 'Low', 'Okay', 'Good', 'Great'];
  return (
    <View style={styles.scoreRowWrap}>
      <View style={styles.scoreRowHeader}>
        <Text style={styles.scoreRowLabel}>{label}</Text>
        <View style={[styles.scorePill, { borderColor: color + '66', backgroundColor: color + '26' }]}>
          <Text style={[styles.scorePillText, { color }]}>{scoreLabels[value - 1]}</Text>
        </View>
      </View>
      <View style={styles.scoreButtons}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable
            key={n}
            style={[
              styles.scoreBtn,
              value === n && { backgroundColor: color, borderColor: color },
            ]}
            onPress={() => onChange(n)}
          >
            <Text style={[styles.scoreBtnText, value === n && { color: Colors.white }]}>{n}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function EmptyState({ message }) {
  return (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  primaryBtn: {
    backgroundColor: Colors.btnRed,
    borderRadius: Radius.lg,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  primaryBtnText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  underlineWrap: { marginBottom: Spacing.lg },
  underlineLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: FontSize.md,
    fontWeight: '600',
    marginBottom: 6,
  },
  underlineInput: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: '500',
    borderBottomWidth: 1.2,
    borderBottomColor: 'rgba(255,255,255,0.4)',
    paddingBottom: 8,
  },
  underlineError: { borderBottomColor: '#FFCDD2' },
  errorText: { color: '#FFCDD2', fontSize: FontSize.xs, marginTop: 4 },
  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.lg,
  },
  badge: {
    borderRadius: Radius.sm,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: { fontWeight: '700' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  sectionLabel: {
    color: Colors.textMuted,
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  menuBtn: { alignItems: 'center', width: 72 },
  menuIconWrap: {
    width: 52, height: 52,
    backgroundColor: Colors.card,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: { fontSize: 24 },
  menuLabel: { color: Colors.textMuted, fontSize: 10, marginTop: 6 },
  scoreRowWrap: { marginBottom: Spacing.lg },
  scoreRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  scoreRowLabel: { color: Colors.text, fontSize: FontSize.md, fontWeight: '500' },
  scorePill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  scorePillText: { fontSize: FontSize.xs, fontWeight: '600' },
  scoreButtons: { flexDirection: 'row', gap: 8 },
  scoreBtn: {
    flex: 1, height: 36,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surfaceDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreBtnText: { color: Colors.textMuted, fontWeight: '600' },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { color: Colors.textMuted, fontSize: FontSize.md, textAlign: 'center' },
});
