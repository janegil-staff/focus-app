import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize } from '../../theme';

export default function MedicationsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Medications</Text>
        <View style={{ width: 30 }} />
      </View>
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No medications added yet</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: Colors.bg },
  header:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  back:      { color: Colors.text, fontSize: 30, marginRight: 8 },
  title:     { color: Colors.text, fontSize: FontSize.lg, fontWeight: '600', flex: 1 },
  empty:     { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: Colors.textMuted, fontSize: FontSize.md },
});
