import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { Spacing, FontSize } from "../../theme";
import client from "../../api/client";

const OPTIONS = [
  { label: "Never", value: 0 },
  { label: "Rarely", value: 1 },
  { label: "Sometimes", value: 2 },
  { label: "Often", value: 3 },
  { label: "Very Often", value: 4 },
];

const QUESTIONS = [
  // Part A (screening) — Q1–6
  {
    id: 1,
    part: "A",
    text: "How often do you have trouble wrapping up the final details of a project, once the challenging parts have been done?",
  },
  {
    id: 2,
    part: "A",
    text: "How often do you have difficulty getting things in order when you have to do a task that requires organization?",
  },
  {
    id: 3,
    part: "A",
    text: "How often do you have problems remembering appointments or obligations?",
  },
  {
    id: 4,
    part: "A",
    text: "When you have a task that requires a lot of thought, how often do you avoid or delay getting started?",
  },
  {
    id: 5,
    part: "A",
    text: "How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?",
  },
  {
    id: 6,
    part: "A",
    text: "How often do you feel overly active and compelled to do things, like you were driven by a motor?",
  },
  // Part B — Q7–18
  {
    id: 7,
    part: "B",
    text: "How often do you make careless mistakes when you have to work on a boring or difficult project?",
  },
  {
    id: 8,
    part: "B",
    text: "How often do you have difficulty keeping your attention when you are doing boring or repetitive work?",
  },
  {
    id: 9,
    part: "B",
    text: "How often do you have difficulty concentrating on what people say to you, even when they are speaking to you directly?",
  },
  {
    id: 10,
    part: "B",
    text: "How often do you misplace or have difficulty finding things at home or at work?",
  },
  {
    id: 11,
    part: "B",
    text: "How often are you distracted by activity or noise around you?",
  },
  {
    id: 12,
    part: "B",
    text: "How often do you leave your seat in meetings or other situations in which you are expected to remain seated?",
  },
  { id: 13, part: "B", text: "How often do you feel restless or fidgety?" },
  {
    id: 14,
    part: "B",
    text: "How often do you have difficulty unwinding and relaxing when you have time to yourself?",
  },
  {
    id: 15,
    part: "B",
    text: "How often do you find yourself talking too much when you are in social situations?",
  },
  {
    id: 16,
    part: "B",
    text: "When you're in a conversation, how often do you find yourself finishing the sentences of the people you are talking to?",
  },
  {
    id: 17,
    part: "B",
    text: "How often do you have difficulty waiting your turn in situations when turn taking is required?",
  },
  {
    id: 18,
    part: "B",
    text: "How often do you interrupt others when they are busy?",
  },
];

function getInterpretation(scoreA, scoreTotal) {
  if (scoreA >= 14)
    return {
      level: "high",
      title: "Highly consistent with ADHD",
      text: "Your Part A score suggests symptoms highly consistent with ADHD in adults. Consider discussing these results with a healthcare professional.",
      color: "#EF4444",
    };
  if (scoreA >= 9)
    return {
      level: "moderate",
      title: "Moderately consistent with ADHD",
      text: "Your scores suggest some symptoms consistent with ADHD. A healthcare professional can help clarify further.",
      color: "#FB923C",
    };
  return {
    level: "low",
    title: "Not strongly consistent with ADHD",
    text: "Your current scores do not strongly indicate ADHD symptoms. Continue tracking over time for a fuller picture.",
    color: "#22C55E",
  };
}

export default function ASRSScreen() {
  const { theme } = useTheme();
  const [step, setStep] = useState("intro"); // intro | questions | result
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const scrollRef = useRef(null);

  const s = makeStyles(theme);

  const answer = (qId, value) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  };

  const allAnswered = QUESTIONS.every((q) => answers[q.id] !== undefined);

  const submit = async () => {
    if (!allAnswered) {
      Alert.alert(
        "Not complete",
        "Please answer all 18 questions before submitting.",
      );
      return;
    }
    const scoreA = QUESTIONS.filter((q) => q.part === "A").reduce(
      (s, q) => s + answers[q.id],
      0,
    );
    const scoreTotal = QUESTIONS.reduce((s, q) => s + answers[q.id], 0);
    const interp = getInterpretation(scoreA, scoreTotal);

    setSaving(true);
    try {
      await client.post("/api/patient/asrs", {
        answers,
        scoreA,
        scoreTotal,
        level: interp.level,
      });
    } catch (e) {
      console.log("ASRS save error:", e?.response?.data ?? e?.message);
    } finally {
      setSaving(false);
    }

    setResult({ scoreA, scoreTotal, interp });
    setStep("result");
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  // ── Intro ──────────────────────────────────────────────────────────────────
  if (step === "intro") {
    return (
      <SafeAreaView style={s.safe} edges={["top"]}>
        <ScrollView contentContainerStyle={s.introContainer}>
          <View style={s.introIcon}>
            <Ionicons name="clipboard" size={48} color={theme.accent} />
          </View>
          <Text style={s.introTitle}>ASRS-v1.1</Text>
          <Text style={s.introSubtitle}>Adult ADHD Self-Report Scale</Text>
          <Text style={s.introBody}>
            This is the WHO-endorsed screening tool for adult ADHD. It takes
            about 5 minutes to complete and consists of 18 questions about how
            you have felt and conducted yourself over the past 6 months.
          </Text>

          <View style={s.infoCard}>
            <View style={s.infoRow}>
              <Ionicons
                name="help-circle-outline"
                size={20}
                color={theme.accent}
              />
              <Text style={s.infoText}>18 questions in 2 parts</Text>
            </View>
            <View style={s.infoRow}>
              <Ionicons name="time-outline" size={20} color={theme.accent} />
              <Text style={s.infoText}>Takes about 5 minutes</Text>
            </View>
            <View style={s.infoRow}>
              <Ionicons
                name="bar-chart-outline"
                size={20}
                color={theme.accent}
              />
              <Text style={s.infoText}>Results saved to your history</Text>
            </View>
            <View style={s.infoRow}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={theme.accent}
              />
              <Text style={s.infoText}>Not a clinical diagnosis</Text>
            </View>
          </View>

          <TouchableOpacity
            style={s.startBtn}
            onPress={() => setStep("questions")}
          >
            <Text style={s.startBtnText}>Start Assessment</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Result ─────────────────────────────────────────────────────────────────
  if (step === "result") {
    const { scoreA, scoreTotal, interp } = result;
    return (
      <SafeAreaView style={s.safe} edges={["top"]}>
        <ScrollView ref={scrollRef} contentContainerStyle={s.resultContainer}>
          <View
            style={[
              s.resultBadge,
              {
                borderColor: interp.color,
                backgroundColor: interp.color + "18",
              },
            ]}
          >
            <Ionicons
              name={
                interp.level === "high"
                  ? "alert-circle"
                  : interp.level === "moderate"
                    ? "warning"
                    : "checkmark-circle"
              }
              size={48}
              color={interp.color}
            />
          </View>

          <Text style={s.resultTitle}>{interp.title}</Text>
          <Text style={s.resultBody}>{interp.text}</Text>

          {/* Scores */}
          <View style={s.scoresRow}>
            <View style={[s.scoreCard, { borderColor: interp.color }]}>
              <Text style={[s.scoreValue, { color: interp.color }]}>
                {scoreA}
              </Text>
              <Text style={s.scoreLabel}>Part A score{"\n"}(max 24)</Text>
            </View>
            <View style={[s.scoreCard, { borderColor: theme.border }]}>
              <Text style={[s.scoreValue, { color: theme.accent }]}>
                {scoreTotal}
              </Text>
              <Text style={s.scoreLabel}>Total score{"\n"}(max 72)</Text>
            </View>
          </View>

          {/* Part A threshold bar */}
          <View style={s.thresholdCard}>
            <Text style={s.thresholdTitle}>Part A Screening Threshold</Text>
            <View style={s.thresholdBar}>
              <View
                style={[
                  s.thresholdFill,
                  {
                    width: `${(scoreA / 24) * 100}%`,
                    backgroundColor: interp.color,
                  },
                ]}
              />
              <View
                style={[s.thresholdLine, { left: `${(14 / 24) * 100}%` }]}
              />
            </View>
            <View style={s.thresholdLabels}>
              <Text style={[s.thresholdLabel, { color: theme.textMuted }]}>
                0
              </Text>
              <Text style={[s.thresholdLabel, { color: "#EF4444" }]}>
                14 = threshold
              </Text>
              <Text style={[s.thresholdLabel, { color: theme.textMuted }]}>
                24
              </Text>
            </View>
          </View>

          {/* Breakdown by part */}
          <View style={s.breakdownCard}>
            <Text style={s.breakdownTitle}>Answer breakdown</Text>
            {["A", "B"].map((part) => (
              <View key={part} style={s.partSection}>
                <Text style={s.partLabel}>Part {part}</Text>
                <View style={s.breakdownGrid}>
                  {OPTIONS.map((opt) => {
                    const count = QUESTIONS.filter(
                      (q) => q.part === part,
                    ).filter((q) => answers[q.id] === opt.value).length;
                    return (
                      <View key={opt.value} style={s.breakdownItem}>
                        <Text
                          style={[
                            s.breakdownCount,
                            {
                              color: count > 0 ? theme.accent : theme.textMuted,
                            },
                          ]}
                        >
                          {count}
                        </Text>
                        <Text style={s.breakdownOptLabel}>{opt.label}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>

          <Text style={s.disclaimer}>
            This assessment is for informational purposes only and is not a
            substitute for professional medical advice, diagnosis, or treatment.
          </Text>

          <TouchableOpacity
            style={s.retakeBtn}
            onPress={() => {
              setAnswers({});
              setStep("intro");
            }}
          >
            <Ionicons name="refresh" size={18} color={theme.accent} />
            <Text style={s.retakeBtnText}>Take again</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Questions ──────────────────────────────────────────────────────────────
  const answeredCount = Object.keys(answers).length;
  const progress = answeredCount / QUESTIONS.length;

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => setStep("intro")}>
          <Ionicons name="close" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>ASRS Assessment</Text>
        <Text style={s.headerCount}>{answeredCount}/18</Text>
      </View>

      {/* Progress bar */}
      <View style={s.progressBg}>
        <View style={[s.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={{ paddingBottom: 40 }}>
        {["A", "B"].map((part) => (
          <View key={part}>
            <View style={s.partHeader}>
              <Text style={s.partHeaderTitle}>Part {part}</Text>
              <Text style={s.partHeaderSub}>
                {part === "A"
                  ? "Screening questions (6)"
                  : "Extended questions (12)"}
              </Text>
            </View>

            {QUESTIONS.filter((q) => q.part === part).map((q, idx) => {
              const answered = answers[q.id] !== undefined;
              return (
                <View key={q.id} style={[s.qCard, answered && s.qCardAnswered]}>
                  <Text style={s.qNumber}>Q{q.id}</Text>
                  <Text style={s.qText}>{q.text}</Text>
                  <View style={s.optionsRow}>
                    {OPTIONS.map((opt) => {
                      const selected = answers[q.id] === opt.value;
                      return (
                        <TouchableOpacity
                          key={opt.value}
                          style={[s.optBtn, selected && s.optBtnActive]}
                          onPress={() => answer(q.id, opt.value)}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              s.optBtnText,
                              selected && s.optBtnTextActive,
                            ]}
                          >
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        ))}

        {/* Submit */}
        <TouchableOpacity
          style={[s.submitBtn, !allAnswered && s.submitBtnDisabled]}
          onPress={submit}
          disabled={!allAnswered || saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={s.submitBtnText}>See Results</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </>
          )}
        </TouchableOpacity>

        {!allAnswered && (
          <Text style={s.unansweredNote}>
            {18 - answeredCount} question{18 - answeredCount !== 1 ? "s" : ""}{" "}
            remaining
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(t) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.bg },

    // Intro
    introContainer: {
      padding: Spacing.lg,
      alignItems: "center",
      paddingBottom: 60,
    },
    introIcon: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: t.accentBg,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 32,
      marginBottom: 16,
    },
    introTitle: {
      color: t.text,
      fontSize: 28,
      fontWeight: "800",
      marginBottom: 4,
    },
    introSubtitle: {
      color: t.accent,
      fontSize: FontSize.md,
      fontWeight: "600",
      marginBottom: 16,
    },
    introBody: {
      color: t.textSecondary,
      fontSize: FontSize.md,
      textAlign: "center",
      lineHeight: 22,
      marginBottom: 24,
    },
    infoCard: {
      width: "100%",
      backgroundColor: t.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: t.border,
      padding: Spacing.lg,
      gap: 12,
      marginBottom: 32,
    },
    infoRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    infoText: { color: t.text, fontSize: FontSize.md },
    startBtn: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: t.accent,
      borderRadius: 14,
      paddingVertical: 16,
      paddingHorizontal: 32,
      gap: 8,
    },
    startBtnText: { color: "#fff", fontSize: FontSize.lg, fontWeight: "700" },

    // Header
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: t.border,
    },
    headerTitle: { color: t.text, fontSize: FontSize.md, fontWeight: "700" },
    headerCount: {
      color: t.textMuted,
      fontSize: FontSize.sm,
      fontWeight: "600",
      minWidth: 36,
      textAlign: "right",
    },

    // Progress
    progressBg: { height: 3, backgroundColor: t.border },
    progressFill: { height: 3, backgroundColor: t.accent },

    // Part header
    partHeader: {
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.lg,
      paddingBottom: Spacing.sm,
    },
    partHeaderTitle: {
      color: t.text,
      fontSize: FontSize.lg,
      fontWeight: "800",
    },
    partHeaderSub: { color: t.textMuted, fontSize: FontSize.sm },

    // Question card
    qCard: {
      marginHorizontal: Spacing.lg,
      marginBottom: Spacing.sm,
      backgroundColor: t.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: t.border,
      padding: Spacing.md,
    },
    qCardAnswered: { borderColor: t.accentBorder },
    qNumber: {
      color: t.accent,
      fontSize: FontSize.sm,
      fontWeight: "700",
      marginBottom: 6,
    },
    qText: {
      color: t.text,
      fontSize: FontSize.md,
      lineHeight: 22,
      marginBottom: 14,
    },
    optionsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
    optBtn: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.bg,
    },
    optBtnActive: { backgroundColor: t.accent, borderColor: t.accent },
    optBtnText: { color: t.textMuted, fontSize: 12, fontWeight: "500" },
    optBtnTextActive: { color: "#fff", fontWeight: "700" },

    // Submit
    submitBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: t.accent,
      borderRadius: 14,
      marginHorizontal: Spacing.lg,
      marginTop: Spacing.lg,
      paddingVertical: 16,
      gap: 8,
    },
    submitBtnDisabled: { opacity: 0.4 },
    submitBtnText: { color: "#fff", fontSize: FontSize.lg, fontWeight: "700" },
    unansweredNote: {
      color: t.textMuted,
      textAlign: "center",
      fontSize: FontSize.sm,
      marginTop: 8,
    },

    // Result
    resultContainer: {
      padding: Spacing.lg,
      alignItems: "center",
      paddingBottom: 60,
    },
    resultBadge: {
      width: 100,
      height: 100,
      borderRadius: 50,
      borderWidth: 2,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 24,
      marginBottom: 16,
    },
    resultTitle: {
      color: t.text,
      fontSize: FontSize.lg,
      fontWeight: "800",
      textAlign: "center",
      marginBottom: 8,
    },
    resultBody: {
      color: t.textSecondary,
      fontSize: FontSize.md,
      textAlign: "center",
      lineHeight: 22,
      marginBottom: 24,
    },
    scoresRow: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 20,
      width: "100%",
    },
    scoreCard: {
      flex: 1,
      backgroundColor: t.surface,
      borderRadius: 14,
      borderWidth: 2,
      padding: Spacing.md,
      alignItems: "center",
    },
    scoreValue: { fontSize: 36, fontWeight: "800" },
    scoreLabel: {
      color: t.textMuted,
      fontSize: 11,
      textAlign: "center",
      marginTop: 4,
    },
    thresholdCard: {
      width: "100%",
      backgroundColor: t.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: t.border,
      padding: Spacing.md,
      marginBottom: 16,
    },
    thresholdTitle: {
      color: t.text,
      fontSize: FontSize.sm,
      fontWeight: "700",
      marginBottom: 12,
    },
    thresholdBar: {
      height: 10,
      backgroundColor: t.border,
      borderRadius: 5,
      overflow: "visible",
      position: "relative",
      marginBottom: 6,
    },
    thresholdFill: { height: "100%", borderRadius: 5 },
    thresholdLine: {
      position: "absolute",
      top: -4,
      width: 2,
      height: 18,
      backgroundColor: "#EF4444",
    },
    thresholdLabels: { flexDirection: "row", justifyContent: "space-between" },
    thresholdLabel: { fontSize: 11 },
    breakdownCard: {
      width: "100%",
      backgroundColor: t.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: t.border,
      padding: Spacing.md,
      marginBottom: 16,
    },
    breakdownTitle: {
      color: t.text,
      fontSize: FontSize.sm,
      fontWeight: "700",
      marginBottom: 12,
    },
    partSection: { marginBottom: 12 },
    partLabel: {
      color: t.textMuted,
      fontSize: FontSize.sm,
      fontWeight: "600",
      marginBottom: 8,
    },
    breakdownGrid: { flexDirection: "row", justifyContent: "space-between" },
    breakdownItem: { alignItems: "center", flex: 1 },
    breakdownCount: { fontSize: 18, fontWeight: "800" },
    breakdownOptLabel: {
      color: t.textMuted,
      fontSize: 9,
      textAlign: "center",
      marginTop: 2,
    },
    disclaimer: {
      color: t.textMuted,
      fontSize: 11,
      textAlign: "center",
      lineHeight: 16,
      marginBottom: 20,
    },
    retakeBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: t.accent,
    },
    retakeBtnText: {
      color: t.accent,
      fontSize: FontSize.md,
      fontWeight: "600",
    },
  });
}
