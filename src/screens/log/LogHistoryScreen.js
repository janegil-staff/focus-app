import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLogs } from '../../context/LogsContext';
import { ScoreBadge, EmptyState } from '../../components';
import { Colors, Spacing, FontSize, Radius } from '../../theme';

export default function LogHistoryScreen({ navigation }) {
  const { logs } = useLogs();

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>History</Text>
        <View style={{ width: 30 }} />
      </View>

      <FlatList
        data={logs}
        keyExtractor={(item) => item.date}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<EmptyState message="No logs yet" />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('LogEntry', { date: item.date, log: item })}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.rowDate}>{formatDate(item.date)}</Text>
              <View style={styles.rowIcons}>
                {item.medicationTaken && <Text style={{ fontSize: 12 }}>💊 </Text>}
                {item.note           && <Text style={{ fontSize: 12 }}>📝</Text>}
              </View>
            </View>
            <View style={styles.badges}>
              <ScoreBadge score={item.mood}   size={28} />
              <ScoreBadge score={item.focus}  size={28} />
              <ScoreBadge score={item.sleep}  size={28} />
              <ScoreBadge score={item.energy} size={28} />
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  back:  { color: Colors.text, fontSize: 30, marginRight: 8 },
  title: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '600', flex: 1 },
  list: { padding: Spacing.lg, gap: Spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  rowDate: { color: Colors.text, fontSize: FontSize.md, fontWeight: '500' },
  rowIcons: { flexDirection: 'row', marginTop: 2 },
  badges: { flexDirection: 'row', gap: 4 },
  chevron: { color: Colors.textMuted, fontSize: 20 },
});
