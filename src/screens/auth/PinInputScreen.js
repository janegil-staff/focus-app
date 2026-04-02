import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, StatusBar, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontSize, Spacing } from '../../theme';

export default function PinInputScreen({ title, subtitle, onComplete, onBack }) {
  const inputRef = useRef(null);
  const [pin, setPin] = useState('');
  const insets = useSafeAreaInsets();

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(Colors.accentDark);
      StatusBar.setTranslucent(false);
    }
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (text) => {
    const digits = text.replace(/[^0-9]/g, '').slice(0, 4);
    setPin(digits);
    if (digits.length === 4) {
      inputRef.current?.blur();
      setTimeout(() => onComplete(digits), 150);
    }
  };

  return (
    <View style={styles.container}>

      {/* Status bar fill — covers the system menu area with accentDark */}
      <View style={[styles.statusBarFill, { height: insets.top }]} />

      {/* Header bar */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>Back</Text>
      </View>

      {/* Hidden system keyboard input */}
      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        keyboardType="number-pad"
        maxLength={4}
        onChangeText={handleChange}
        value={pin}
        caretHidden
        autoFocus
      />

      {/* Body */}
      <TouchableOpacity
        style={styles.body}
        activeOpacity={1}
        onPress={() => inputRef.current?.focus()}
      >
        <Text style={styles.title}>{title ?? 'Enter PIN'}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

        <View style={styles.slots}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={styles.slot}>
              <Text style={styles.digit}>{pin[i] ?? ''}</Text>
              <View style={[
                styles.underline,
                i < pin.length && styles.underlineActive,
              ]} />
            </View>
          ))}
        </View>

        <Text style={styles.hint}>Tap to open keyboard</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  statusBarFill: {
    width: '100%',
    backgroundColor: Colors.accentDark,
  },

  header: {
    backgroundColor: Colors.accentDark,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  backArrow: {
    color: Colors.white,
    fontSize: 34,
    lineHeight: 40,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: '600',
  },

  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },

  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 60,
    backgroundColor: '#ffffff',
  },

  title: {
    color: '#111827',
    fontSize: FontSize.xl,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    color: '#6B7280',
    fontSize: FontSize.sm,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },

  slots: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 32,
    marginBottom: 32,
  },
  slot: {
    width: 52,
    alignItems: 'center',
  },
  digit: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.accentDark,
    height: 44,
    lineHeight: 44,
    textAlign: 'center',
  },
  underline: {
    width: '100%',
    height: 3,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    marginTop: 4,
  },
  underlineActive: {
    backgroundColor: Colors.accentDark,
  },

  hint: {
    color: '#9CA3AF',
    fontSize: 13,
    textAlign: 'center',
  },
});