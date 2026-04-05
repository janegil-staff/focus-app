import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Path, Rect, Line } from "react-native-svg";
import { useTheme } from "../../context/ThemeContext";
import { useLang } from "../../context/LangContext";
import { FontSize, Spacing } from "../../theme";

const STUDIES = [
  {
    title:   "ADHD in Adults: Diagnosis and Treatment",
    journal: "New England Journal of Medicine",
    year:    "2023",
    summary: "Comprehensive review of diagnostic criteria and treatment outcomes for adult ADHD, including medication efficacy and behavioral interventions.",
    tag:      "Treatment",
    tagColor: "#4a7ab5",
    url:      "https://www.nejm.org",
  },
  {
    title:   "Long-term Effects of Stimulant Medication on ADHD",
    journal: "JAMA Psychiatry",
    year:    "2022",
    summary: "Multi-year study following adults on methylphenidate and amphetamine-based treatments, assessing quality of life and symptom control.",
    tag:      "Medication",
    tagColor: "#22C55E",
    url:      "https://jamanetwork.com/journals/jamapsychiatry",
  },
  {
    title:   "Sleep Disorders and ADHD Comorbidity",
    journal: "Sleep Medicine Reviews",
    year:    "2023",
    summary: "Meta-analysis showing strong correlation between sleep disruption and ADHD symptom severity across 47 studies.",
    tag:      "Sleep",
    tagColor: "#7AABDB",
    url:      "https://www.sciencedirect.com/journal/sleep-medicine-reviews",
  },
  {
    title:   "Digital Self-Monitoring in ADHD Management",
    journal: "Journal of Attention Disorders",
    year:    "2024",
    summary: "Study demonstrating that daily mood and focus tracking apps improve treatment adherence and clinician communication.",
    tag:      "Digital Health",
    tagColor: "#FBBF24",
    url:      "https://journals.sagepub.com/home/jad",
  },
  {
    title:   "Cognitive Behavioral Therapy for Adult ADHD",
    journal: "Behaviour Research and Therapy",
    year:    "2023",
    summary: "Randomized controlled trial demonstrating significant symptom reduction in adults receiving structured CBT alongside medication.",
    tag:      "Therapy",
    tagColor: "#A78BFA",
    url:      "https://www.sciencedirect.com/journal/behaviour-research-and-therapy",
  },
  {
    title:   "Exercise and ADHD Symptom Reduction",
    journal: "Journal of Psychiatric Research",
    year:    "2022",
    summary: "Regular aerobic exercise shown to improve attention, reduce hyperactivity and support executive function in adults with ADHD.",
    tag:      "Lifestyle",
    tagColor: "#FB923C",
    url:      "https://www.sciencedirect.com/journal/journal-of-psychiatric-research",
  },
];

// ── Tab icons (same as ShareScreen) ──────────────────────────────────────────
function IconCode({ color, size = 24 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="5" width="18" height="14" rx="2" stroke={color} strokeWidth="1.8" />
      <Line x1="3" y1="9" x2="21" y2="9" stroke={color} strokeWidth="1.5" />
      <Line x1="7" y1="13" x2="10" y2="13" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="7" y1="16" x2="14" y2="16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}

function IconASRS({ color, size = 24 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="4" y="3" width="16" height="18" rx="2" stroke={color} strokeWidth="1.8" />
      <Line x1="8" y1="8" x2="16" y2="8" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="8" y1="12" x2="16" y2="12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="8" y1="16" x2="12" y2="16" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Circle cx="19" cy="19" r="4" fill={color} opacity="0.15" stroke={color} strokeWidth="1.5" />
      <Line x1="19" y1="17" x2="19" y2="19" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Circle cx="19" cy="20.5" r="0.6" fill={color} />
    </Svg>
  );
}

function IconStudies({ color, size = 24 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3 L22 8 L12 13 L2 8 Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" fill="none" />
      <Path d="M6 10.5 L6 16 C6 16 9 19 12 19 C15 19 18 16 18 16 L18 10.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <Line x1="22" y1="8" x2="22" y2="14" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

export default function StudiesScreen({ navigation }) {
  const { theme }  = useTheme();
  const { t }      = useLang();
  const insets     = useSafeAreaInsets();
  const PRIMARY    = theme?.accent   ?? "#4a7ab5";
  const NAVY       = "#2d4a6e";
  const MUTED      = "#8fa8c8";

  const tabs = [
    { key: "code",    label: t.shareTabCode    ?? "Code",    Icon: IconCode },
    { key: "asrs",    label: t.shareTabASRS    ?? "ASRS",    Icon: IconASRS },
    { key: "studies", label: t.shareTabStudies ?? "Studies", Icon: IconStudies },
  ];

  const handleTab = (key) => {
    if (key === "code")    navigation.navigate("Share");
    if (key === "asrs")    navigation.navigate("ASRSInfo");
    // studies stays here
  };

  return (
    <View style={[s.root, { backgroundColor: theme.bgSecondary ?? "#F0F4F8" }]}>

      {/* Header */}
      <LinearGradient
        colors={[theme.accent, theme.accentDark ?? "#2D4A6E"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[s.header, { paddingTop: insets.top + Spacing.sm }]}
      >
        <TouchableOpacity onPress={() => navigation.navigate("Home")} style={s.headerBtn}>
          <Text style={s.headerBack}>‹</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t.shareData ?? "Share Data"}</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro card */}
        <View style={s.introCard}>
          <Text style={[s.introTitle, { color: NAVY }]}>Research & Studies</Text>
          <Text style={[s.introSub, { color: MUTED }]}>
            Recent peer-reviewed research relevant to ADHD tracking and treatment.
          </Text>
        </View>

        {/* Study cards */}
        {STUDIES.map((study, i) => (
          <TouchableOpacity
            key={i}
            style={s.card}
            activeOpacity={0.75}
            onPress={() => study.url && Linking.openURL(study.url)}
          >
            <View style={s.cardTop}>
              <View style={[s.tag, { backgroundColor: study.tagColor + "22" }]}>
                <Text style={[s.tagText, { color: study.tagColor }]}>{study.tag}</Text>
              </View>
              <Text style={[s.year, { color: MUTED }]}>{study.year}</Text>
            </View>
            <Text style={[s.cardTitle, { color: NAVY }]}>{study.title}</Text>
            <Text style={[s.cardJournal, { color: PRIMARY }]}>{study.journal}</Text>
            <Text style={[s.cardSummary]}>{study.summary}</Text>
            <View style={s.readMore}>
              <Text style={[s.readMoreText, { color: PRIMARY }]}>Read more →</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bottom tab bar */}
      <View style={s.tabBarWrapper}>
        <View style={[s.tabBar, { paddingBottom: insets.bottom + 8 }]}>
          {tabs.map(({ key, label, Icon }) => {
            const active = key === "studies";
            return (
              <TouchableOpacity
                key={key}
                style={s.tabBtn}
                onPress={() => handleTab(key)}
                activeOpacity={0.7}
              >
                <Icon color={active ? PRIMARY : "#a0b8d0"} size={24} />
                <Text style={[s.tabLabel, { color: active ? PRIMARY : "#a0b8d0", fontWeight: active ? "700" : "500" }]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

    </View>
  );
}

const s = StyleSheet.create({
  root:       { flex: 1 },
  header:     { paddingBottom: Spacing.lg, paddingHorizontal: Spacing.lg, flexDirection: "row", alignItems: "center" },
  headerBtn:  { width: 40 },
  headerBack: { color: "#fff", fontSize: 28, lineHeight: 34 },
  headerTitle:{ flex: 1, color: "#fff", fontSize: FontSize.lg, fontWeight: "600", textAlign: "center" },

  introCard:  { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  introTitle: { fontSize: 15, fontWeight: "700", marginBottom: 4 },
  introSub:   { fontSize: 13, lineHeight: 18 },

  card:        { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  cardTop:     { flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 8 },
  tag:         { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  tagText:     { fontSize: 11, fontWeight: "700" },
  year:        { fontSize: 11 },
  cardTitle:   { fontSize: 14, fontWeight: "700", marginBottom: 4 },
  cardJournal: { fontSize: 12, fontWeight: "500", marginBottom: 8 },
  cardSummary: { color: "#555", fontSize: 13, lineHeight: 19 },
  readMore:    { marginTop: 10, alignItems: "flex-end" },
  readMoreText:{ fontSize: 12, fontWeight: "600" },

  tabBarWrapper: { backgroundColor: "#fff", paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1.5, borderTopColor: "#a0b8d0" },
  tabBar:        { flexDirection: "row", paddingTop: 10 },
  tabBtn:        { flex: 1, alignItems: "center", gap: 4 },
  tabLabel:      { fontSize: 11 },
});
