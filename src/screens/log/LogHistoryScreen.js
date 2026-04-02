import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLogs } from '../../context/LogsContext';
import { useTheme } from '../../context/ThemeContext';
import { scoreColor, Spacing, FontSize, Radius } from '../../theme';

function ScoreBadge({ score, size = 30 }) {
  const color = scoreColor(score);
  return (
    <View style={{
      width: size, height: size,
      borderRadius: Radius.sm,
      borderWidth: 1,
      borderColor: color + '66',
      backgroundColor: color + '26',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Text style={{ color, fontSize: size * 0.38, fontWeight: '700' }}>{score}</Text>
    </View>
  );
}

export default function LogHistoryScreen({ navigation }) {
  const { logs }  = useLogs();
  const { theme } = useTheme();
  const s = makeStyles(theme);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <Text style={s.title}>History</Text>
        <View style={{ width: 30 }} />
      </View>

      <FlatList
        data={logs}
        keyExtractor={(item) => item.date}
        contentContainerStyle={s.list}
        ListEmptyComponent={
          <View style={s.empty}>
            <Text style={s.emptyText}>No logs yet</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={s.row}
            onPress={() => navigation.navigate('LogEntry', { date: item.date, log: item })}
          >
            <View style={{ flex: 1 }}>
              <Text style={s.rowDate}>{formatDate(item.date)}</Text>
              <View style={{ flexDirection: 'row', marginTop: 2 }}>
                {item.medicationTaken && <Text style={{ fontSize: 12, marginRight: 4 }}>💊</Text>}
                {item.note           && <Text style={{ fontSize: 12 }}>📝</Text>}
              </View>
            </View>
            <View style={s.badges}>
              <ScoreBadge score={item.mood}   size={28} />
              <ScoreBadge score={item.focus}  size={28} />
              <ScoreBadge score={item.sleep}  size={28} />
              <ScoreBadge score={item.energy} size={28} />
            </View>
            <Text style={s.chevron}>›</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const makeStyles = (t) => StyleSheet.create({
  safe:      { flex: 1, backgroundColor: t.bg },
  header:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: t.border },
  back:      { color: t.text, fontSize: 30, marginRight: 8 },
  title:     { color: t.text, fontSize: FontSize.lg, fontWeight: '600', flex: 1 },
  list:      { padding: Spacing.lg, gap: Spacing.sm },
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: t.card,
    borderRadius: Radius.md,
    borderWidth: 1, borderColor: t.border,
    padding: Spacing.md, gap: Spacing.sm,
  },
  rowDate:  { color: t.text, fontSize: FontSize.md, fontWeight: '500' },
  badges:   { flexDirection: 'row', gap: 4 },
  chevron:  { color: t.textMuted, fontSize: 20 },
  empty:    { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyText:{ color: t.textMuted, fontSize: FontSize.md },
});