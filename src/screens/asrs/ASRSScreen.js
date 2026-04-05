import React, { useState, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useLang } from "../../context/LangContext";
import { Spacing, FontSize } from "../../theme";
import client from "../../api/client";

function getInterpretation(scoreA, t) {
  if (scoreA >= 14) return {
    level: "high",
    title: t.asrsHighTitle ?? "Highly consistent with ADHD",
    text:  t.asrsHighBody  ?? "Your Part A score suggests symptoms highly consistent with ADHD in adults.",
    color: "#EF4444", icon: "alert-circle",
  };
  if (scoreA >= 9) return {
    level: "moderate",
    title: t.asrsModTitle ?? "Moderately consistent with ADHD",
    text:  t.asrsModBody  ?? "Your scores suggest some symptoms consistent with ADHD.",
    color: "#FB923C", icon: "warning",
  };
  return {
    level: "low",
    title: t.asrsLowTitle ?? "Not strongly consistent with ADHD",
    text:  t.asrsLowBody  ?? "Your current scores do not strongly indicate ADHD symptoms.",
    color: "#22C55E", icon: "checkmark-circle",
  };
}

function GradientHeader({ theme, insets, onBack, title, right = null }) {
  return (
    <LinearGradient
      colors={[theme.accent, theme.accentDark ?? "#2D4A6E"]}
      start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
      style={[sh.header, { paddingTop: insets.top + 10 }]}
    >
      <TouchableOpacity onPress={onBack} style={{ width: 40 }}>
        <Text style={sh.headerBack}>‹</Text>
      </TouchableOpacity>
      <Text style={sh.headerTitle}>{title}</Text>
      <View style={{ width: 40, alignItems: "flex-end" }}>{right}</View>
    </LinearGradient>
  );
}

const sh = StyleSheet.create({
  header:      { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
  headerBack:  { color: "#fff", fontSize: 30, lineHeight: 34 },
  headerTitle: { color: "#fff", fontSize: FontSize.md, fontWeight: "700", flex: 1, textAlign: "center" },
  headerCount: { color: "rgba(255,255,255,0.8)", fontSize: FontSize.sm, fontWeight: "600", textAlign: "right" },
});

export default function ASRSScreen({ navigation }) {
  const { theme }  = useTheme();
  const { t }      = useLang();
  const insets     = useSafeAreaInsets();
  const scrollRef  = useRef(null);

  const [step, setStep]       = useState("questions");
  const [answers, setAnswers] = useState({});
  const [saving, setSaving]   = useState(false);
  const [result, setResult]   = useState(null);

  const s = makeStyles(theme);

  // ── Questions built from translations ────────────────────────────────────
  const QUESTIONS = [
    { id: 1,  part: "A", text: t.asrsQ1  ?? "How often do you have trouble wrapping up the final details of a project, once the challenging parts have been done?" },
    { id: 2,  part: "A", text: t.asrsQ2  ?? "How often do you have difficulty getting things in order when you have to do a task that requires organization?" },
    { id: 3,  part: "A", text: t.asrsQ3  ?? "How often do you have problems remembering appointments or obligations?" },
    { id: 4,  part: "A", text: t.asrsQ4  ?? "When you have a task that requires a lot of thought, how often do you avoid or delay getting started?" },
    { id: 5,  part: "A", text: t.asrsQ5  ?? "How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?" },
    { id: 6,  part: "A", text: t.asrsQ6  ?? "How often do you feel overly active and compelled to do things, like you were driven by a motor?" },
    { id: 7,  part: "B", text: t.asrsQ7  ?? "How often do you make careless mistakes when you have to work on a boring or difficult project?" },
    { id: 8,  part: "B", text: t.asrsQ8  ?? "How often do you have difficulty keeping your attention when you are doing boring or repetitive work?" },
    { id: 9,  part: "B", text: t.asrsQ9  ?? "How often do you have difficulty concentrating on what people say to you, even when they are speaking to you directly?" },
    { id: 10, part: "B", text: t.asrsQ10 ?? "How often do you misplace or have difficulty finding things at home or at work?" },
    { id: 11, part: "B", text: t.asrsQ11 ?? "How often are you distracted by activity or noise around you?" },
    { id: 12, part: "B", text: t.asrsQ12 ?? "How often do you leave your seat in meetings or other situations in which you are expected to remain seated?" },
    { id: 13, part: "B", text: t.asrsQ13 ?? "How often do you feel restless or fidgety?" },
    { id: 14, part: "B", text: t.asrsQ14 ?? "How often do you have difficulty unwinding and relaxing when you have time to yourself?" },
    { id: 15, part: "B", text: t.asrsQ15 ?? "How often do you find yourself talking too much when you are in social situations?" },
    { id: 16, part: "B", text: t.asrsQ16 ?? "How often do you find yourself finishing the sentences of the people you are talking to?" },
    { id: 17, part: "B", text: t.asrsQ17 ?? "How often do you have difficulty waiting your turn in situations when turn taking is required?" },
    { id: 18, part: "B", text: t.asrsQ18 ?? "How often do you interrupt others when they are busy?" },
  ];

  const optionLabels = [
    t.asrsNever     ?? "Never",
    t.asrsRarely    ?? "Rarely",
    t.asrsSometimes ?? "Sometimes",
    t.asrsOften     ?? "Often",
    t.asrsVeryOften ?? "Very Often",
  ];

  const answer       = (qId, value) => setAnswers(prev => ({ ...prev, [qId]: value }));
  const allAnswered   = QUESTIONS.every(q => answers[q.id] !== undefined);
  const answeredCount = Object.keys(answers).length;
  const progress      = answeredCount / QUESTIONS.length;
  const goBack        = () => navigation.navigate("Home");

  const submit = async () => {
    if (!allAnswered) {
      Alert.alert("Not complete", `${18 - answeredCount} ${t.asrsRemaining ?? "questions remaining"}.`);
      return;
    }
    const scoreA     = QUESTIONS.filter(q => q.part === "A").reduce((acc, q) => acc + answers[q.id], 0);
    const scoreTotal = QUESTIONS.reduce((acc, q) => acc + answers[q.id], 0);
    const interp     = getInterpretation(scoreA, t);

    setSaving(true);
    try {
      await client.post("/api/patient/asrs", { answers, scoreA, scoreTotal, level: interp.level });
    } catch (e) {
      console.log("ASRS save error:", e?.response?.data ?? e?.message);
    } finally {
      setSaving(false);
    }

    setResult({ scoreA, scoreTotal, interp });
    setStep("result");
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const reset = () => { setAnswers({}); setResult(null); setStep("questions"); };

  // ── RESULT ──────────────────────────────────────────────────────────────────
  if (step === "result") {
    const { scoreA, scoreTotal, interp } = result;
    return (
      <View style={s.safe}>
        <GradientHeader theme={theme} insets={insets} onBack={goBack} title={t.asrsTitle ?? "ASRS Assessment"} />
        <ScrollView ref={scrollRef} contentContainerStyle={s.resultContainer} showsVerticalScrollIndicator={false}>
          <View style={[s.resultBadge, { borderColor: interp.color, backgroundColor: interp.color + "18" }]}>
            <Ionicons name={interp.icon} size={52} color={interp.color} />
          </View>
          <Text style={s.resultTitle}>{interp.title}</Text>
          <Text style={s.resultBody}>{interp.text}</Text>

          <View style={s.scoresRow}>
            <View style={[s.scoreCard, { borderColor: interp.color }]}>
              <Text style={[s.scoreValue, { color: interp.color }]}>{scoreA}</Text>
              <Text style={s.scoreLabel}>{t.asrsPartAScore ?? "Part A score\n(max 24)"}</Text>
            </View>
            <View style={[s.scoreCard, { borderColor: theme.border }]}>
              <Text style={[s.scoreValue, { color: theme.accent }]}>{scoreTotal}</Text>
              <Text style={s.scoreLabel}>{t.asrsTotalScore ?? "Total score\n(max 72)"}</Text>
            </View>
          </View>

          <View style={s.thresholdCard}>
            <Text style={s.thresholdTitle}>{t.asrsThreshold ?? "Part A Screening Threshold"}</Text>
            <View style={s.thresholdBarBg}>
              <View style={[s.thresholdFill, { width: `${Math.min((scoreA / 24) * 100, 100)}%`, backgroundColor: interp.color }]} />
              <View style={[s.thresholdLine, { left: `${(14 / 24) * 100}%` }]} />
            </View>
            <View style={s.thresholdLabels}>
              <Text style={[s.thresholdLabel, { color: theme.textMuted }]}>0</Text>
              <Text style={[s.thresholdLabel, { color: "#EF4444" }]}>14 = threshold</Text>
              <Text style={[s.thresholdLabel, { color: theme.textMuted }]}>24</Text>
            </View>
          </View>

          <View style={s.breakdownCard}>
            <Text style={s.breakdownTitle}>{t.asrsAnswerBreakdown ?? "Answer breakdown"}</Text>
            {["A", "B"].map(part => (
              <View key={part} style={s.partSection}>
                <Text style={s.partSectionLabel}>
                  {part === "A" ? (t.asrsPartA ?? "Part A") : (t.asrsPartB ?? "Part B")}
                </Text>
                <View style={s.breakdownGrid}>
                  {optionLabels.map((label, idx) => {
                    const count = QUESTIONS.filter(q => q.part === part).filter(q => answers[q.id] === idx).length;
                    return (
                      <View key={idx} style={s.breakdownItem}>
                        <Text style={[s.breakdownCount, { color: count > 0 ? theme.accent : theme.textMuted }]}>{count}</Text>
                        <Text style={s.breakdownOptLabel}>{label}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>

          <Text style={s.fullDisclaimer}>{t.asrsFullDisclaimer ?? "This assessment is for informational purposes only."}</Text>

          <TouchableOpacity style={s.retakeBtn} onPress={reset}>
            <Ionicons name="refresh" size={18} color={theme.accent} />
            <Text style={s.retakeBtnText}>{t.asrsTakeAgain ?? "Take again"}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ── QUESTIONS ────────────────────────────────────────────────────────────────
  return (
    <View style={s.safe}>
      <GradientHeader
        theme={theme} insets={insets} onBack={goBack}
        title={t.asrsTitle ?? "ASRS Assessment"}
        right={<Text style={sh.headerCount}>{answeredCount}/18</Text>}
      />
      <View style={s.progressBg}>
        <View style={[s.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {["A", "B"].map(part => (
          <View key={part}>
            <View style={s.partHeader}>
              <Text style={s.partHeaderTitle}>
                {part === "A" ? (t.asrsPartA ?? "Part A") : (t.asrsPartB ?? "Part B")}
              </Text>
              <Text style={s.partHeaderSub}>
                {part === "A"
                  ? (t.asrsPartASub ?? "Screening questions (6)")
                  : (t.asrsPartBSub ?? "Extended questions (12)")}
              </Text>
            </View>

            {QUESTIONS.filter(q => q.part === part).map(q => {
              const answered = answers[q.id] !== undefined;
              return (
                <View key={q.id} style={[s.qCard, answered && s.qCardAnswered]}>
                  <Text style={s.qNumber}>Q{q.id}</Text>
                  <Text style={s.qText}>{q.text}</Text>
                  <View style={s.optionsRow}>
                    {optionLabels.map((label, idx) => {
                      const selected = answers[q.id] === idx;
                      return (
                        <TouchableOpacity
                          key={idx}
                          style={[s.optBtn, selected && s.optBtnActive]}
                          onPress={() => answer(q.id, idx)}
                          activeOpacity={0.7}
                        >
                          <Text style={[s.optBtnText, selected && s.optBtnTextActive]}>{label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        ))}

        <TouchableOpacity
          style={[s.submitBtn, (!allAnswered || saving) && s.submitBtnDisabled]}
          onPress={submit}
          disabled={!allAnswered || saving}
        >
          {saving
            ? <ActivityIndicator color="#fff" />
            : <>
                <Text style={s.submitBtnText}>{t.asrsSeeResults ?? "See Results"}</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </>
          }
        </TouchableOpacity>

        {!allAnswered && (
          <Text style={s.unansweredNote}>
            {18 - answeredCount} {t.asrsRemaining ?? "questions remaining"}
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

function makeStyles(t) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.bg },
    progressBg:   { height: 3, backgroundColor: t.border },
    progressFill: { height: 3, backgroundColor: t.accent },
    partHeader:      { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.sm },
    partHeaderTitle: { color: t.text, fontSize: FontSize.lg, fontWeight: "800" },
    partHeaderSub:   { color: t.textMuted, fontSize: FontSize.sm },
    qCard:            { marginHorizontal: Spacing.lg, marginBottom: Spacing.sm, backgroundColor: t.surface, borderRadius: 14, borderWidth: 1, borderColor: t.border, padding: Spacing.md },
    qCardAnswered:    { borderColor: t.accentBorder },
    qNumber:          { color: t.accent, fontSize: FontSize.sm, fontWeight: "700", marginBottom: 6 },
    qText:            { color: t.text, fontSize: FontSize.md, lineHeight: 22, marginBottom: 14 },
    optionsRow:       { flexDirection: "row", flexWrap: "wrap", gap: 6 },
    optBtn:           { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: t.border, backgroundColor: t.bg },
    optBtnActive:     { backgroundColor: t.accent, borderColor: t.accent },
    optBtnText:       { color: t.textMuted, fontSize: 12, fontWeight: "500" },
    optBtnTextActive: { color: "#fff", fontWeight: "700" },
    submitBtn:         { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: t.accent, borderRadius: 14, marginHorizontal: Spacing.lg, marginTop: Spacing.lg, paddingVertical: 16, gap: 8 },
    submitBtnDisabled: { opacity: 0.4 },
    submitBtnText:     { color: "#fff", fontSize: FontSize.lg, fontWeight: "700" },
    unansweredNote:    { color: t.textMuted, textAlign: "center", fontSize: FontSize.sm, marginTop: 8 },
    resultContainer: { padding: Spacing.lg, alignItems: "center", paddingBottom: 60 },
    resultBadge:     { width: 100, height: 100, borderRadius: 50, borderWidth: 2, alignItems: "center", justifyContent: "center", marginTop: 24, marginBottom: 16 },
    resultTitle:     { color: t.text, fontSize: FontSize.lg, fontWeight: "800", textAlign: "center", marginBottom: 8 },
    resultBody:      { color: t.textSecondary, fontSize: FontSize.md, textAlign: "center", lineHeight: 22, marginBottom: 24 },
    scoresRow:  { flexDirection: "row", gap: 12, marginBottom: 20, width: "100%" },
    scoreCard:  { flex: 1, backgroundColor: t.surface, borderRadius: 14, borderWidth: 2, padding: Spacing.md, alignItems: "center" },
    scoreValue: { fontSize: 36, fontWeight: "800" },
    scoreLabel: { color: t.textMuted, fontSize: 11, textAlign: "center", marginTop: 4 },
    thresholdCard:   { width: "100%", backgroundColor: t.surface, borderRadius: 14, borderWidth: 1, borderColor: t.border, padding: Spacing.md, marginBottom: 16 },
    thresholdTitle:  { color: t.text, fontSize: FontSize.sm, fontWeight: "700", marginBottom: 12 },
    thresholdBarBg:  { height: 10, backgroundColor: t.border, borderRadius: 5, overflow: "visible", position: "relative", marginBottom: 6 },
    thresholdFill:   { height: "100%", borderRadius: 5 },
    thresholdLine:   { position: "absolute", top: -4, width: 2, height: 18, backgroundColor: "#EF4444" },
    thresholdLabels: { flexDirection: "row", justifyContent: "space-between" },
    thresholdLabel:  { fontSize: 11 },
    breakdownCard:     { width: "100%", backgroundColor: t.surface, borderRadius: 14, borderWidth: 1, borderColor: t.border, padding: Spacing.md, marginBottom: 16 },
    breakdownTitle:    { color: t.text, fontSize: FontSize.sm, fontWeight: "700", marginBottom: 12 },
    partSection:       { marginBottom: 12 },
    partSectionLabel:  { color: t.textMuted, fontSize: FontSize.sm, fontWeight: "600", marginBottom: 8 },
    breakdownGrid:     { flexDirection: "row", justifyContent: "space-between" },
    breakdownItem:     { alignItems: "center", flex: 1 },
    breakdownCount:    { fontSize: 18, fontWeight: "800" },
    breakdownOptLabel: { color: t.textMuted, fontSize: 9, textAlign: "center", marginTop: 2 },
    fullDisclaimer: { color: t.textMuted, fontSize: 11, textAlign: "center", lineHeight: 16, marginBottom: 20 },
    retakeBtn:      { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, borderWidth: 1, borderColor: t.accent },
    retakeBtnText:  { color: t.accent, fontSize: FontSize.md, fontWeight: "600" },
  });
}