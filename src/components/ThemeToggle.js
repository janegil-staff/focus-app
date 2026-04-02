import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { FontSize, Spacing, Radius } from '../theme';

export default function ThemeToggle() {
  const { scheme, override, setTheme, theme } = useTheme();

  const options = [
    { value: 'light',  label: '☀️  Light' },
    { value: 'system', label: '⚙️  System' },
    { value: 'dark',   label: '🌙  Dark' },
  ];

  const current = override ?? 'system';

  return (
    <View style={styles.wrap}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          style={[
            styles.btn,
            { borderColor: theme.border, backgroundColor: theme.bgSecondary },
            current === opt.value && { backgroundColor: theme.accent, borderColor: theme.accent },
          ]}
          onPress={() => setTheme(opt.value)}
        >
          <Text style={[
            styles.label,
            { color: theme.textSecondary },
            current === opt.value && { color: '#FFFFFF', fontWeight: '700' },
          ]}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', gap: 8 },
  btn: {
    flex: 1, paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  label: { fontSize: FontSize.sm },
});
