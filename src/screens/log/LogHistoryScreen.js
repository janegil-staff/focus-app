import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { useLogs } from "../../context/LogsContext";
import { useTheme } from "../../context/ThemeContext";
import { useLang } from "../../context/LangContext";
import { Spacing, FontSize, Radius } from "../../theme";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Path } from "react-native-svg";

// 1 = best (green), 5 = worst (red)
const SCORE_COLORS = {
  1: "#22C55E",
  2: "#7AABDB",
  3: "#FBBF24",
  4: "#FB923C",
  5: "#EF4444",
};

// Medication name lookup
const ADHD_MEDICATIONS = [
  { id: "methylphenidate", name: "Methylphenidate" },
  { id: "lisdexamfetamine", name: "Lisdexamfetamine" },
  { id: "amphetamine", name: "Amphetamine" },
  { id: "dextroamphetamine", name: "Dextroamphetamine" },
  { id: "atomoxetine", name: "Atomoxetine" },
  { id: "guanfacine", name: "Guanfacine" },
  { id: "clonidine", name: "Clonidine" },
  { id: "bupropion", name: "Bupropion" },
  { id: "viloxazine", name: "Viloxazine" },
  { id: "modafinil", name: "Modafinil" },
  { id: "dexmethylphenidate", name: "Dexmethylphenidate" },
  { id: "other", name: "Other" },
];

function medNames(ids) {
  if (!ids || !ids.length) return null;
  return ids
    .map((id) => ADHD_MEDICATIONS.find((m) => m.id === id)?.name ?? id)
    .join(", ");
}

function scoreToLabel(score, labels) {
  if (!score || !labels) return score;
  // score 1=best, score 5=worst — labels[0] = best label
  return labels[score - 1] ?? score;
}

function avgScore(log) {
  const vals = [
    log.mood,
    log.focus,
    log.sleep,
    log.energy,
    log.impulsivity,
  ].filter(Boolean);
  if (!vals.length) return null;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function firstWeekday(year, month) {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

function toDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// ── Score badge ────────────────────────────────────────────────────────────────
function ScoreBadge({ score, size = 28 }) {
  if (!score) return <View style={{ width: size, height: size }} />;
  const color = SCORE_COLORS[score];
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1.5,
        borderColor: color,
        backgroundColor: color + "26",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ color, fontSize: size * 0.38, fontWeight: "700" }}>
        {score}
      </Text>
    </View>
  );
}

// ── Calendar tab ───────────────────────────────────────────────────────────────
function CalendarTab({ logs, loading, navigation, t, theme }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const PRIMARY = theme?.accent ?? "#4a7ab5";
  const NAVY = "#2d4a6e";
  const MUTED = "#8fa8c8";

  const scoreMap = {};
  logs.forEach((log) => {
    const s = avgScore(log);
    if (s) scoreMap[log.date] = s;
  });

  const goBack = () => {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else setMonth((m) => m - 1);
  };
  const goForward = () => {
    if (year === now.getFullYear() && month === now.getMonth()) return;
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else setMonth((m) => m + 1);
  };
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  const totalDays = daysInMonth(year, month);
  const startOffset = firstWeekday(year, month);
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);

  const monthLogs = logs.filter((l) => {
    const [ly, lm] = l.date.split("-").map(Number);
    return ly === year && lm === month + 1;
  });
  const totalLogged = monthLogs.length;
  const avgAll = totalLogged
    ? Math.round(
        monthLogs.reduce((s, l) => s + (avgScore(l) ?? 0), 0) / totalLogged,
      )
    : null;

  // scoreLabels index matches score: [0]=score1=best, [4]=score5=worst
  const scoreLabels = [
    t.scores?.mood?.[0] ?? t.scoreExcellent ?? "Excellent",
    t.scoreGood ?? "Good",
    t.scoreModerate ?? "Moderate",
    t.scoreLow ?? "Low",
    t.scoreVeryLow ?? "Very low",
  ];

  // Show best (1=green) first, worst (5=red) last
  const countByScore = [1, 2, 3, 4, 5].map((s) => ({
    score: s,
    count: monthLogs.filter((l) => avgScore(l) === s).length,
    label: scoreLabels[s - 1],
    color: SCORE_COLORS[s],
  }));

  const today = toDateStr(now.getFullYear(), now.getMonth(), now.getDate());
  const months = t.months ?? [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const weekdays = t.weekdays ?? [
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun",
  ];

  return (
    <View style={{ flex: 1 }}>
      <View style={cal.monthNav}>
        <TouchableOpacity onPress={goBack} style={cal.navBtn}>
          <Text style={[cal.navArrow, { color: NAVY }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[cal.monthTitle, { color: NAVY }]}>
          {(months[month] ?? "").toUpperCase()}
          {"  "}
          {year}
        </Text>
        <TouchableOpacity
          onPress={goForward}
          style={[cal.navBtn, isCurrentMonth && { opacity: 0.3 }]}
          disabled={isCurrentMonth}
        >
          <Text
            style={[cal.navArrow, { color: isCurrentMonth ? "#ccc" : NAVY }]}
          >
            ›
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[cal.card, { backgroundColor: "#fff" }]}>
        <View style={cal.weekdayRow}>
          {weekdays.map((d, i) => (
            <Text key={i} style={[cal.weekdayLabel, { color: MUTED }]}>
              {d}
            </Text>
          ))}
        </View>
        {loading ? (
          <ActivityIndicator color={PRIMARY} style={{ marginVertical: 24 }} />
        ) : (
          <View style={cal.grid}>
            {cells.map((day, i) => {
              if (!day) return <View key={`e-${i}`} style={cal.cell} />;
              const dateStr = toDateStr(year, month, day);
              const score = scoreMap[dateStr];
              const isToday = dateStr === today;
              const isFuture = dateStr > today;
              const existingLog = logs.find((l) => l.date === dateStr) ?? null;
              const bgColor = score ? SCORE_COLORS[score] : undefined;
              return (
                <TouchableOpacity
                  key={dateStr}
                  style={cal.cell}
                  onPress={() =>
                    !isFuture &&
                    navigation.navigate("LogEntry", {
                      date: dateStr,
                      log: existingLog,
                    })
                  }
                  activeOpacity={isFuture ? 1 : 0.7}
                >
                  <View
                    style={[
                      cal.cellInner,
                      isFuture && { borderWidth: 0 },
                      !isFuture &&
                        !score && { borderColor: "#a0b8d0", borderWidth: 2 },
                      bgColor && {
                        backgroundColor: bgColor,
                        borderColor: bgColor,
                      },
                      isToday &&
                        !score && { borderColor: PRIMARY, borderWidth: 2 },
                    ]}
                  >
                    <Text
                      style={[
                        cal.cellText,
                        { color: score ? "#fff" : NAVY },
                        isToday &&
                          !score && { color: PRIMARY, fontWeight: "800" },
                      ]}
                    >
                      {day}
                    </Text>
                    {existingLog?.medicationTaken && (
                      <Image
                        source={require("../../../assets/images/ico_intensity_medicine.png")}
                        style={cal.medIcon}
                        resizeMode="contain"
                      />
                    )}
                    {!!(
                      existingLog &&
                      existingLog.note &&
                      existingLog.note.trim().length > 0
                    ) && (
                      <View style={cal.noteIcon}>
                        <Svg width="18" height="18" viewBox="0 0 24 24">
                          <Circle
                            cx="12"
                            cy="12"
                            r="10"
                            fill="none"
                            stroke="#4a7ab5"
                            strokeWidth="2.5"
                          />
                          <Path
                            d="M7 8 Q7 6 9 6 L15 6 Q17 6 17 8 L17 14 Q17 16 15 16 L13.5 16 L15.5 19.5 L11.5 16 L9 16 Q7 16 7 14 Z"
                            fill="#4a7ab5"
                          />
                        </Svg>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      <View style={[cal.card, { backgroundColor: "#fff" }]}>
        <Text style={[cal.sectionTitle, { color: NAVY }]}>
          {t.monthSummary ?? "Month summary"}
        </Text>
        <View style={cal.summaryRow}>
          <View style={cal.summaryItem}>
            <Text style={[cal.summaryValue, { color: PRIMARY }]}>
              {totalLogged}
            </Text>
            <Text style={[cal.summarySubLabel, { color: MUTED }]}>
              {t.daysLoggedShort ?? "Days logged"}
            </Text>
          </View>
          <View style={[cal.divider, { backgroundColor: "#e8eef5" }]} />
          <View style={cal.summaryItem}>
            <Text
              style={[
                cal.summaryValue,
                { color: avgAll ? SCORE_COLORS[avgAll] : MUTED },
              ]}
            >
              {avgAll ? scoreLabels[avgAll - 1] : "—"}
            </Text>
            <Text style={[cal.summarySubLabel, { color: MUTED }]}>
              {t.avgScore ?? "Avg. score"}
            </Text>
          </View>
          <View style={[cal.divider, { backgroundColor: "#e8eef5" }]} />
          <View style={cal.summaryItem}>
            <Text style={[cal.summaryValue, { color: PRIMARY }]}>
              {totalDays - totalLogged}
            </Text>
            <Text style={[cal.summarySubLabel, { color: MUTED }]}>
              {t.missing ?? "Missing"}
            </Text>
          </View>
        </View>
      </View>

      <View style={[cal.card, { backgroundColor: "#fff", marginBottom: 40 }]}>
        <Text style={[cal.sectionTitle, { color: NAVY }]}>
          {t.scoreBreakdown ?? "Score breakdown"}
        </Text>
        {countByScore.map(({ score, count, label, color }) => (
          <View key={score} style={cal.breakdownRow}>
            <View style={[cal.breakdownDot, { backgroundColor: color }]} />
            <Text style={[cal.breakdownLabel, { color: NAVY }]}>{label}</Text>
            <View style={[cal.breakdownBarBg, { backgroundColor: "#e8eef5" }]}>
              <View
                style={[
                  cal.breakdownBar,
                  {
                    backgroundColor: color,
                    width: totalLogged
                      ? `${Math.round((count / totalLogged) * 100)}%`
                      : "0%",
                  },
                ]}
              />
            </View>
            <Text style={[cal.breakdownCount, { color: MUTED }]}>{count}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const cal = StyleSheet.create({
  monthNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  navBtn: { padding: 8 },
  navArrow: { fontSize: 28, fontWeight: "300" },
  monthTitle: { fontSize: 16, fontWeight: "800", letterSpacing: 1 },
  card: {
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionTitle: { fontSize: 14, fontWeight: "700", marginBottom: 12 },
  weekdayRow: { flexDirection: "row", marginBottom: 6 },
  weekdayLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "700",
  },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    paddingHorizontal: 7,
    paddingVertical: 5,
  },
  cellInner: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#2d4a6e",
    overflow: "visible",
  },
  cellText: { fontSize: 13, fontWeight: "600" },
  medIcon: { position: "absolute", top: -6, right: -6, width: 20, height: 20 },
  noteIcon: {
    position: "absolute",
    bottom: -6,
    right: -6,
    width: 18,
    height: 18,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 16,
    marginBottom: 12,
    flexWrap: "wrap",
    gap: 4,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 10, fontWeight: "500" },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  summaryItem: { alignItems: "center", flex: 1 },
  summaryValue: { fontSize: 20, fontWeight: "800" },
  summarySubLabel: { fontSize: 11, marginTop: 2 },
  divider: { width: 1, height: 40 },
  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  breakdownDot: { width: 10, height: 10, borderRadius: 5 },
  breakdownLabel: { fontSize: 12, fontWeight: "500", width: 80 },
  breakdownBarBg: { flex: 1, height: 8, borderRadius: 4, overflow: "hidden" },
  breakdownBar: { height: "100%", borderRadius: 4 },
  breakdownCount: {
    fontSize: 12,
    fontWeight: "600",
    width: 24,
    textAlign: "right",
  },
});

// ── Month view (diary grouped by month) ───────────────────────────────────────
function MonthView({ logs, navigation, t, theme, PRIMARY, formatDate }) {
  const MUTED = "#8fa8c8";
  const NAVY = "#2d4a6e";
  const [collapsed, setCollapsed] = React.useState({});
  const toggleCollapse = (key) =>
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  const months = t.months ?? [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const grouped = {};
  logs.forEach((log) => {
    const key = log.date.slice(0, 7);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(log);
  });

  const sections = Object.keys(grouped)
    .sort((a, b) => b.localeCompare(a))
    .map((key) => {
      const [y, m] = key.split("-").map(Number);
      const monthLogs = grouped[key];
      const scores = monthLogs.map((l) => avgScore(l)).filter(Boolean);
      const avg = scores.length
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : null;
      return { key, year: y, month: m - 1, logs: monthLogs, avg };
    });

  const pillColors = {
    1: { bg: "#BBF7D0", text: "#14532D" }, // 1=best=green
    2: { bg: "#BAE6FD", text: "#0C4A6E" },
    3: { bg: "#FEF9C3", text: "#854D0E" },
    4: { bg: "#FED7AA", text: "#9A3412" },
    5: { bg: "#FECACA", text: "#991B1B" }, // 5=worst=red
  };

  // score 1=green=Excellent(best), score 5=red=Severe(worst)
  const scoreLabels = [
    t.scoreExcellent ?? "Excellent", // score 1
    t.scoreGood ?? "Good",
    t.scoreModerate ?? "Moderate",
    t.scorePoor ?? "Poor",
    t.scoreSevere ?? "Severe", // score 5
  ];

  const shortDate = (dateStr) => {
    const d = new Date(dateStr);
    const day = d.getDate();
    const mo = (months[d.getMonth()] ?? "").slice(0, 3);
    const yr = String(d.getFullYear()).slice(2);
    return `${day} ${mo}'${yr}`;
  };

  return (
    <FlatList
      data={sections}
      keyExtractor={(item) => item.key}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 40,
      }}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const pill = item.avg
          ? pillColors[item.avg]
          : { bg: "#e8eef5", text: NAVY };
        return (
          <View style={{ marginBottom: 20 }}>
            {/* Month pill header — tap to collapse/expand */}
            <TouchableOpacity
              style={{
                backgroundColor: pill.bg,
                borderRadius: 30,
                paddingVertical: 14,
                paddingHorizontal: 20,
                alignItems: "center",
                marginBottom: 12,
                flexDirection: "row",
                justifyContent: "center",
              }}
              onPress={() => toggleCollapse(item.key)}
              activeOpacity={0.8}
            >
              <View style={{ alignItems: "center", flex: 1 }}>
                <Text
                  style={{ color: pill.text, fontSize: 20, fontWeight: "800" }}
                >
                  {months[item.month]} {item.year}
                </Text>
                <Text
                  style={{
                    color: pill.text,
                    fontSize: 13,
                    marginTop: 2,
                    opacity: 0.8,
                  }}
                >
                  {t.avgScore ?? "Avg. score"}:{" "}
                  {item.avg ? scoreLabels[item.avg - 1] : "—"}
                </Text>
              </View>
              <Text
                style={{
                  color: pill.text,
                  fontSize: 20,
                  opacity: 0.7,
                  marginLeft: 8,
                }}
              >
                {collapsed[item.key] === false ? "‹" : "›"}
              </Text>
            </TouchableOpacity>

            {/* Log cards — hidden when collapsed */}
            {collapsed[item.key] === false &&
              item.logs.map((log) => {
                const score = avgScore(log);
                const dotColor = score ? SCORE_COLORS[score] : "#b3cde8";
                return (
                  <View
                    key={log.date}
                    style={{
                      backgroundColor: "#EEF3F8",
                      borderRadius: 16,
                      marginBottom: 10,
                      padding: 14,
                      flexDirection: "row",
                      alignItems: "flex-start",
                      gap: 12,
                    }}
                  >
                    {/* Left: colored rounded square with date number + icons below */}
                    <View style={{ alignItems: "center" }}>
                      <View
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 14,
                          backgroundColor: dotColor,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            color: "#fff",
                            fontSize: 18,
                            fontWeight: "800",
                          }}
                        >
                          {new Date(log.date).getDate()}
                        </Text>
                      </View>
                      {/* Medicine icon — top right of circle */}
                      {log.medicationTaken && (
                        <Image
                          source={require("../../../assets/images/ico_intensity_medicine.png")}
                          style={{
                            position: "absolute",
                            top: -6,
                            right: -6,
                            width: 20,
                            height: 20,
                          }}
                          resizeMode="contain"
                        />
                      )}
                      {/* Note icon — bottom right of circle */}
                      {!!(log.note && log.note.trim().length > 0) && (
                        <View
                          style={{
                            position: "absolute",
                            bottom: -6,
                            right: -6,
                            width: 18,
                            height: 18,
                          }}
                        >
                          <Svg width="18" height="18" viewBox="0 0 24 24">
                            <Circle
                              cx="12"
                              cy="12"
                              r="10"
                              fill="none"
                              stroke="#4a7ab5"
                              strokeWidth="2.5"
                            />
                            <Path
                              d="M7 8 Q7 6 9 6 L15 6 Q17 6 17 8 L17 14 Q17 16 15 16 L13.5 16 L15.5 19.5 L11.5 16 L9 16 Q7 16 7 14 Z"
                              fill="#4a7ab5"
                            />
                          </Svg>
                        </View>
                      )}
                    </View>

                    {/* Content */}
                    <View style={{ flex: 1 }}>
                      {log.mood != null && (
                        <Text
                          style={{
                            color: "#444",
                            fontSize: 13,
                            marginBottom: 2,
                          }}
                        >
                          <Text style={{ fontWeight: "700" }}>
                            {t.mood ?? "Mood"}:
                          </Text>{" "}
                          {scoreToLabel(log.mood, t.scores?.mood)}
                        </Text>
                      )}
                      {log.focus != null && (
                        <Text
                          style={{
                            color: "#444",
                            fontSize: 13,
                            marginBottom: 2,
                          }}
                        >
                          <Text style={{ fontWeight: "700" }}>
                            {t.focus ?? "Focus"}:
                          </Text>{" "}
                          {scoreToLabel(log.focus, t.scores?.focus)}
                        </Text>
                      )}
                      {log.sleep != null && (
                        <Text
                          style={{
                            color: "#444",
                            fontSize: 13,
                            marginBottom: 2,
                          }}
                        >
                          <Text style={{ fontWeight: "700" }}>
                            {t.sleepQuality ?? "Sleep"}:
                          </Text>{" "}
                          {scoreToLabel(log.sleep, t.scores?.sleep)}
                        </Text>
                      )}
                      {log.energy != null && (
                        <Text
                          style={{
                            color: "#444",
                            fontSize: 13,
                            marginBottom: 2,
                          }}
                        >
                          <Text style={{ fontWeight: "700" }}>
                            {t.energy ?? "Energy"}:
                          </Text>{" "}
                          {scoreToLabel(log.energy, t.scores?.energy)}
                        </Text>
                      )}
                      {log.impulsivity != null && (
                        <Text
                          style={{
                            color: "#444",
                            fontSize: 13,
                            marginBottom: 2,
                          }}
                        >
                          <Text style={{ fontWeight: "700" }}>
                            {t.impulsivity ?? "Impulsivity"}:
                          </Text>{" "}
                          {scoreToLabel(log.impulsivity, t.scores?.impulsivity)}
                        </Text>
                      )}
                      {log.medicationTaken && (
                        <Text
                          style={{
                            color: "#444",
                            fontSize: 13,
                            marginBottom: 2,
                          }}
                        >
                          <Text style={{ fontWeight: "700" }}>
                            {t.medicationSec ?? "Medication"}:
                          </Text>{" "}
                          {medNames(log.medicationNames) ?? "✓"}
                        </Text>
                      )}
                      {log.note?.trim() ? (
                        <Text
                          style={{ color: "#444", fontSize: 13 }}
                          numberOfLines={2}
                        >
                          <Text style={{ fontWeight: "700" }}>
                            {t.notes ?? "Note"}:
                          </Text>{" "}
                          {log.note}
                        </Text>
                      ) : null}
                    </View>

                    {/* Right: date + edit icon */}
                    <View
                      style={{
                        alignItems: "flex-end",
                        justifyContent: "space-between",
                        minHeight: 52,
                      }}
                    >
                      <Text
                        style={{
                          color: MUTED,
                          fontSize: 12,
                          fontWeight: "500",
                        }}
                      >
                        {shortDate(log.date)}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate("LogEntry", {
                            date: log.date,
                            log,
                          })
                        }
                        style={{ marginTop: 8 }}
                      >
                        <Svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <Path
                            d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"
                            fill="none"
                            stroke="#7AABDB"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <Path
                            d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                            fill="none"
                            stroke="#7AABDB"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </Svg>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
          </View>
        );
      }}
    />
  );
}

// ── Main screen ────────────────────────────────────────────────────────────────
export default function LogHistoryScreen({ navigation, route }) {
  const [activeTab, setActiveTab] = useState(
    route?.params?.initialTab ?? "calendar",
  );
  const [diaryView, setDiaryView] = useState("day");
  const { logs, loading, fetchLogs } = useLogs();
  const { theme } = useTheme();
  const { t } = useLang();
  const insets = useSafeAreaInsets();
  const PRIMARY = theme?.accent ?? "#4a7ab5";

  useFocusEffect(
    useCallback(() => {
      fetchLogs();
    }, [fetchLogs]),
  );

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const s = makeStyles(theme, insets);

  return (
    <View style={[s.root, { backgroundColor: theme.bgSecondary ?? "#F0F4F8" }]}>
      {/* Blue header */}
      <View
        style={[
          s.header,
          { backgroundColor: PRIMARY, paddingTop: insets.top + 10 },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.back}>‹</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t.myDiary ?? "My Diary"}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Calendar / Diary tab buttons */}
      <View style={s.tabBar}>
        {["calendar", "diary"].map((tab) => {
          const isActive = activeTab === tab;
          const label =
            tab === "calendar"
              ? (t.calendar ?? "Calendar")
              : (t.diary ?? "Diary");
          return (
            <TouchableOpacity
              key={tab}
              style={[s.tab, isActive && s.tabActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              {isActive ? (
                <LinearGradient
                  colors={[
                    theme.accent ?? "#4a7ab5",
                    theme.accentDark ?? "#2D4A6E",
                  ]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={s.tabGradient}
                >
                  <Text style={s.tabTextActive}>{label}</Text>
                </LinearGradient>
              ) : (
                <Text style={s.tabText}>{label}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Calendar tab content */}
      {activeTab === "calendar" && (
        <FlatList
          data={[]}
          renderItem={null}
          ListHeaderComponent={
            <CalendarTab
              logs={logs}
              loading={loading}
              navigation={navigation}
              t={t}
              theme={theme}
            />
          }
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Diary tab content */}
      {activeTab === "diary" && (
        <View style={{ flex: 1 }}>
          {/* Day / Month sub-buttons */}
          <View style={s.subTabBar}>
            {["day", "month"].map((v) => {
              const isActive = diaryView === v;
              const label =
                v === "day" ? (t.dayView ?? "Day") : (t.monthView ?? "Month");
              return (
                <TouchableOpacity
                  key={v}
                  style={[
                    s.subTab,
                    isActive && {
                      backgroundColor: "#fff",
                      shadowColor: "#000",
                      shadowOpacity: 0.08,
                      shadowRadius: 4,
                      shadowOffset: { width: 0, height: 1 },
                      elevation: 2,
                    },
                  ]}
                  onPress={() => setDiaryView(v)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      s.subTabText,
                      isActive && { color: "#4a6a8a", fontWeight: "600" },
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Day view */}
          {diaryView === "day" &&
            (() => {
              // Group logs by month for separators
              const months = t.months ?? [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ];
              const items = [];
              let lastKey = null;
              logs.forEach((log) => {
                const key = log.date.slice(0, 7);
                if (key !== lastKey) {
                  const [y, m] = key.split("-").map(Number);
                  const scores = logs
                    .filter((l) => l.date.startsWith(key))
                    .map((l) => avgScore(l))
                    .filter(Boolean);
                  const avg = scores.length
                    ? Math.round(
                        scores.reduce((a, b) => a + b, 0) / scores.length,
                      )
                    : null;
                  // Use actual score color with opacity for pill bg, solid for text
                  const pillBg = avg ? SCORE_COLORS[avg] + "33" : "#e8eef5";
                  const pillText = avg ? SCORE_COLORS[avg] : "#2d4a6e";
                  items.push({
                    type: "header",
                    key,
                    year: y,
                    month: m - 1,
                    avg,
                    bg: pillBg,
                    text: pillText,
                  });
                  lastKey = key;
                }
                items.push({ type: "log", key: log.date, log });
              });
              return (
                <FlatList
                  data={items}
                  keyExtractor={(item) => item.key + item.type}
                  contentContainerStyle={s.list}
                  showsVerticalScrollIndicator={false}
                  ListEmptyComponent={
                    <View style={s.empty}>
                      <Text style={[s.emptyText, { color: theme.textMuted }]}>
                        {t.noLogs ?? "No logs yet"}
                      </Text>
                    </View>
                  }
                  renderItem={({ item }) => {
                    const months = t.months ?? [
                      "Jan",
                      "Feb",
                      "Mar",
                      "Apr",
                      "May",
                      "Jun",
                      "Jul",
                      "Aug",
                      "Sep",
                      "Oct",
                      "Nov",
                      "Dec",
                    ];
                    if (item.type === "header") {
                      const dayScoreLabels = [
                        t.scoreExcellent ?? "Excellent",
                        t.scoreGood ?? "Good",
                        t.scoreModerate ?? "Moderate",
                        t.scorePoor ?? "Poor",
                        t.scoreSevere ?? "Severe",
                      ];
                      return (
                        <View
                          style={{
                            backgroundColor: item.bg,
                            borderRadius: 30,
                            paddingVertical: 12,
                            paddingHorizontal: 20,
                            alignItems: "center",
                            marginBottom: 10,
                            marginTop: 4,
                          }}
                        >
                          <Text
                            style={{
                              color: item.text,
                              fontSize: 18,
                              fontWeight: "800",
                            }}
                          >
                            {months[item.month]} {item.year}
                          </Text>
                          {item.avg ? (
                            <Text
                              style={{
                                color: item.text,
                                fontSize: 13,
                                marginTop: 2,
                                opacity: 0.85,
                              }}
                            >
                              {t.avgScore ?? "Avg. score"}:{" "}
                              {dayScoreLabels[item.avg - 1]}
                            </Text>
                          ) : null}
                        </View>
                      );
                    }
                    if (!item.log) return null;
                    const logItem = item.log;
                    const score = avgScore(logItem);
                    const dotColor = score ? SCORE_COLORS[score] : "#b3cde8";
                    const MUTED = "#8fa8c8";
                    const shortDate = (() => {
                      const d = new Date(logItem.date);
                      return `${d.getDate()} ${(months[d.getMonth()] ?? "").slice(0, 3)}'${String(d.getFullYear()).slice(2)}`;
                    })();
                    return (
                      <TouchableOpacity
                        style={{
                          backgroundColor: "#fff",
                          borderRadius: 16,
                          marginBottom: 10,
                          padding: 14,
                          flexDirection: "row",
                          alignItems: "flex-start",
                          gap: 12,
                          shadowColor: "#000",
                          shadowOpacity: 0.06,
                          shadowRadius: 8,
                          shadowOffset: { width: 0, height: 2 },
                          elevation: 2,
                        }}
                        onPress={() =>
                          navigation.navigate("LogEntry", {
                            date: logItem.date,
                            log: logItem,
                          })
                        }
                        activeOpacity={0.75}
                      >
                        {/* Colored rounded square with day number + icons */}
                        <View
                          style={{
                            width: 52,
                            height: 52,
                            borderRadius: 14,
                            backgroundColor: dotColor,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text
                            style={{
                              color: "#fff",
                              fontSize: 18,
                              fontWeight: "800",
                            }}
                          >
                            {new Date(logItem.date).getDate()}
                          </Text>
                          {logItem.medicationTaken && (
                            <Image
                              source={require("../../../assets/images/ico_intensity_medicine.png")}
                              style={{
                                position: "absolute",
                                top: -6,
                                right: -6,
                                width: 20,
                                height: 20,
                              }}
                              resizeMode="contain"
                            />
                          )}
                          {!!(
                            logItem.note && logItem.note.trim().length > 0
                          ) && (
                            <View
                              style={{
                                position: "absolute",
                                bottom: -6,
                                right: -6,
                                width: 18,
                                height: 18,
                              }}
                            >
                              <Svg width="18" height="18" viewBox="0 0 24 24">
                                <Circle
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  fill="none"
                                  stroke="#4a7ab5"
                                  strokeWidth="2.5"
                                />
                                <Path
                                  d="M7 8 Q7 6 9 6 L15 6 Q17 6 17 8 L17 14 Q17 16 15 16 L13.5 16 L15.5 19.5 L11.5 16 L9 16 Q7 16 7 14 Z"
                                  fill="#4a7ab5"
                                />
                              </Svg>
                            </View>
                          )}
                        </View>

                        {/* Fields */}
                        <View style={{ flex: 1 }}>
                          {logItem.mood != null && (
                            <Text
                              style={{
                                color: "#444",
                                fontSize: 13,
                                marginBottom: 2,
                              }}
                            >
                              <Text style={{ fontWeight: "700" }}>
                                {t.mood ?? "Mood"}:
                              </Text>{" "}
                              {scoreToLabel(logItem.mood, t.scores?.mood)}
                            </Text>
                          )}
                          {logItem.focus != null && (
                            <Text
                              style={{
                                color: "#444",
                                fontSize: 13,
                                marginBottom: 2,
                              }}
                            >
                              <Text style={{ fontWeight: "700" }}>
                                {t.focus ?? "Focus"}:
                              </Text>{" "}
                              {scoreToLabel(logItem.focus, t.scores?.focus)}
                            </Text>
                          )}
                          {logItem.energy != null && (
                            <Text
                              style={{
                                color: "#444",
                                fontSize: 13,
                                marginBottom: 2,
                              }}
                            >
                              <Text style={{ fontWeight: "700" }}>
                                {t.energy ?? "Energy"}:
                              </Text>{" "}
                              {scoreToLabel(logItem.energy, t.scores?.energy)}
                            </Text>
                          )}
                          {logItem.impulsivity != null && (
                            <Text
                              style={{
                                color: "#444",
                                fontSize: 13,
                                marginBottom: 2,
                              }}
                            >
                              <Text style={{ fontWeight: "700" }}>
                                {t.impulsivity ?? "Impulsivity"}:
                              </Text>{" "}
                              {scoreToLabel(
                                logItem.impulsivity,
                                t.scores?.impulsivity,
                              )}
                            </Text>
                          )}
                          {logItem.sleep != null && (
                            <Text
                              style={{
                                color: "#444",
                                fontSize: 13,
                                marginBottom: 2,
                              }}
                            >
                              <Text style={{ fontWeight: "700" }}>
                                {t.sleepQuality ?? "Sleep"}:
                              </Text>{" "}
                              {scoreToLabel(logItem.sleep, t.scores?.sleep)}
                            </Text>
                          )}
                          {logItem.medicationTaken && (
                            <Text
                              style={{
                                color: "#444",
                                fontSize: 13,
                                marginBottom: 2,
                              }}
                            >
                              <Text style={{ fontWeight: "700" }}>
                                {t.medicationSec ?? "Medication"}:
                              </Text>{" "}
                              {medNames(logItem.medicationNames) ?? "✓"}
                            </Text>
                          )}
                          {logItem.note?.trim() ? (
                            <Text
                              style={{ color: "#444", fontSize: 13 }}
                              numberOfLines={2}
                            >
                              <Text style={{ fontWeight: "700" }}>
                                {t.notes ?? "Note"}:
                              </Text>{" "}
                              {logItem.note}
                            </Text>
                          ) : null}
                        </View>

                        {/* Date + edit icon */}
                        <View
                          style={{
                            alignItems: "flex-end",
                            justifyContent: "space-between",
                            minHeight: 52,
                          }}
                        >
                          <Text
                            style={{
                              color: MUTED,
                              fontSize: 12,
                              fontWeight: "500",
                            }}
                          >
                            {shortDate}
                          </Text>
                          <TouchableOpacity
                            onPress={() =>
                              navigation.navigate("LogEntry", {
                                date: logItem.date,
                                log: logItem,
                              })
                            }
                            style={{ marginTop: 8 }}
                          >
                            <Svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <Path
                                d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"
                                fill="none"
                                stroke="#7AABDB"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <Path
                                d="M20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
                                fill="none"
                                stroke="#7AABDB"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </Svg>
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>
                    );
                  }}
                />
              );
            })()}

          {/* Month view */}
          {diaryView === "month" && (
            <MonthView
              logs={logs}
              navigation={navigation}
              t={t}
              theme={theme}
              PRIMARY={PRIMARY}
              formatDate={formatDate}
            />
          )}
        </View>
      )}
    </View>
  );
}

const makeStyles = (t, insets) =>
  StyleSheet.create({
    root: { flex: 1 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingBottom: 8,
    },
    backBtn: { width: 40 },
    back: { color: "#fff", fontSize: 30 },
    headerTitle: {
      flex: 1,
      color: "#fff",
      fontSize: FontSize.md,
      fontWeight: "600",
      textAlign: "center",
    },
    tabBar: {
      flexDirection: "row",
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 8,
      backgroundColor: "#fff",
      borderBottomWidth: 1,
      borderBottomColor: t.border ?? "#e8eef5",
    },
    tab: {
      flex: 1,
      borderRadius: 6,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#fff",
      borderWidth: 1,
      borderColor: t.border ?? "#dde5ee",
      paddingVertical: 16,
      shadowColor: "#000",
      shadowOpacity: 0.22,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 5 },
      elevation: 8,
    },
    tabActive: {
      borderColor: t.accent ?? "#4a7ab5",
      shadowOpacity: 0,
      elevation: 0,
      overflow: "hidden",
      paddingVertical: 0,
    },
    tabGradient: {
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
    },
    tabText: {
      color: t.textMuted ?? "#8fa8c8",
      fontSize: FontSize.sm,
      fontWeight: "600",
    },
    tabTextActive: { color: "#fff", fontWeight: "700" },

    subTabBar: {
      flexDirection: "row",
      paddingHorizontal: 4,
      paddingVertical: 4,
      gap: 0,
      backgroundColor: "#dde8f0",
      borderRadius: 10,
      marginHorizontal: 16,
      marginVertical: 10,
    },
    subTab: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: "center",
      borderWidth: 0,
      backgroundColor: "#dde8f0",
    },
    subTabText: { fontSize: FontSize.sm, fontWeight: "500", color: "#6b8aaa" },

    list: { padding: 16, paddingTop: 8, paddingBottom: 40 },
    row: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: Radius.md,
      borderWidth: 1,
      padding: Spacing.md,
      gap: Spacing.sm,
    },
    scoreRing: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: "#e0e7ef",
      alignItems: "center",
      justifyContent: "center",
    },
    scoreRingText: { fontSize: 15, fontWeight: "800" },
    rowDate: { fontSize: FontSize.md, fontWeight: "500" },
    chevron: { fontSize: 20 },
    empty: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingTop: 80,
    },
    emptyText: { fontSize: FontSize.md },
  });
