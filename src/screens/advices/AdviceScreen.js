import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useLang } from "../../context/LangContext";
import { useAdvice } from "../../context/AdviceContext";
import { FontSize, Spacing } from "../../theme";
import api from "../../api/client";

// ── Badge ──────────────────────────────────────────────────────────────────────
function Badge({ type, t }) {
  const config = {
    new: { label: t.adviceBadgeNew ?? "New", bg: "#22C55E" },
    viewed: { label: t.adviceBadgeViewed ?? "Viewed", bg: "#c97060" },
    relevant: { label: t.adviceBadgeRelevant ?? "Relevant", bg: "#F97316" },
  }[type];
  if (!config) return null;
  return (
    <View style={[bs.wrap, { backgroundColor: config.bg }]}>
      <Text style={bs.text}>{config.label}</Text>
    </View>
  );
}
const bs = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: 0,
    right: 0,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 20,
  },
  text: { fontSize: 13, fontWeight: "700", color: "#fff" },
});

// ── Checkbox ───────────────────────────────────────────────────────────────────
function RelevantCheckbox({ checked, onToggle, label, PRIMARY }) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.7}
      style={[chk.row, { borderColor: checked ? PRIMARY : "#e0e8f0" }]}
    >
      <View
        style={[
          chk.box,
          { borderColor: PRIMARY, backgroundColor: checked ? PRIMARY : "#fff" },
        ]}
      >
        {checked && <Ionicons name="checkmark" size={14} color="#fff" />}
      </View>
      <Text style={[chk.label, { color: checked ? PRIMARY : "#555" }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
const chk = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 24,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { fontSize: 14, fontWeight: "600", flex: 1 },
});

// ── Advice card ────────────────────────────────────────────────────────────────
function AdviceCard({
  advice,
  viewed,
  userRelevant,
  onPress,
  PRIMARY,
  NAVY,
  t,
}) {
  const badgeType = !viewed ? "new" : userRelevant ? "relevant" : "viewed";
  return (
    <TouchableOpacity
      style={crd.card}
      onPress={() => onPress(advice)}
      activeOpacity={0.85}
    >
      <View style={{ paddingRight: 60 }}>
        <Text style={[crd.preview, { color: NAVY }]}>{advice.title}</Text>
        <Text style={[crd.readMore, { color: PRIMARY }]}>
          {t.adviceReadMore ?? "Read More >"}
        </Text>
      </View>
      <Badge type={badgeType} t={t} />
    </TouchableOpacity>
  );
}
const crd = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    overflow: "hidden",
  },
  preview: { fontSize: 14, fontWeight: "600", lineHeight: 20, marginBottom: 8 },
  readMore: { fontSize: 14, fontWeight: "700" },
});

// ── Detail view ────────────────────────────────────────────────────────────────
function AdviceDetail({
  advice,
  onBack,
  userRelevant,
  onToggleRelevant,
  PRIMARY,
  NAVY,
  t,
}) {
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity
        onPress={onBack}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          marginBottom: 16,
        }}
      >
        <Ionicons name="arrow-back" size={20} color={PRIMARY} />
        <Text style={{ color: PRIMARY, fontSize: 14, fontWeight: "600" }}>
          {t.adviceBack ?? "Back"}
        </Text>
      </TouchableOpacity>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          marginBottom: 16,
        }}
      >
        <View
          style={{
            backgroundColor: (advice.iconColor ?? "#4a7ab5") + "22",
            borderRadius: 12,
            padding: 10,
          }}
        >
          <Ionicons
            name={advice.icon ?? "bulb-outline"}
            size={24}
            color={advice.iconColor ?? "#4a7ab5"}
          />
        </View>
        <Text
          style={{
            color: advice.iconColor ?? "#4a7ab5",
            fontSize: 13,
            fontWeight: "700",
          }}
        >
          {advice.category}
        </Text>
      </View>

      <Text
        style={{
          color: NAVY,
          fontSize: 16,
          fontWeight: "700",
          lineHeight: 24,
          marginBottom: 16,
        }}
      >
        {advice.title}
      </Text>

      <Text style={{ color: "#444", fontSize: 14, lineHeight: 22 }}>
        {advice.body}
      </Text>

      <RelevantCheckbox
        checked={userRelevant}
        onToggle={onToggleRelevant}
        label={t.adviceMarkRelevant ?? "This is relevant for me"}
        PRIMARY={PRIMARY}
      />
    </ScrollView>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────────
export default function AdviceScreen({ navigation }) {
  const { theme } = useTheme();
  const { t } = useLang();
  const insets = useSafeAreaInsets();
  const PRIMARY = theme?.accent ?? "#4a7ab5";
  const NAVY = "#2d4a6e";

  const { viewed, userRelevant, markViewed, toggleRelevant } = useAdvice();

  const [filter, setFilter] = useState("all");
  const [detail, setDetail] = useState(null);
  const [advice, setAdvice] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdvice = async () => {
      try {
        const res = await api.get("/api/advice");
        setAdvice(res.data.data);
      } catch (err) {
        setError(
          t.adviceLoadError ?? "Could not load advice. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchAdvice();
  }, []);

  const handlePress = useCallback(
    (item) => {
      markViewed(item._id);
      setDetail(item);
    },
    [markViewed],
  );

  const categories = [...new Set(advice.map((a) => a.category))];

  const visibleAdvice =
    filter === "relevant"
      ? advice.filter((a) => userRelevant.has(a._id))
      : advice;

  const grouped = categories.reduce((acc, cat) => {
    const items = visibleAdvice.filter((a) => a.category === cat);
    if (items.length) acc[cat] = items;
    return acc;
  }, {});

  return (
    <View
      style={[ss.root, { backgroundColor: theme.bgSecondary ?? "#F0F4F8" }]}
    >
      <LinearGradient
        colors={[PRIMARY, theme.accentDark ?? "#2D4A6E"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[ss.header, { paddingTop: insets.top + Spacing.sm }]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={ss.headerBtn}
        >
          <Text style={ss.headerBack}>‹</Text>
        </TouchableOpacity>
        <Text style={ss.headerTitle}>{t.adviceTitle ?? "Advice"}</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {detail ? (
        <AdviceDetail
          advice={detail}
          onBack={() => setDetail(null)}
          userRelevant={userRelevant.has(detail._id)}
          onToggleRelevant={() => toggleRelevant(detail._id)}
          PRIMARY={PRIMARY}
          NAVY={NAVY}
          t={t}
        />
      ) : (
        <>
          <View style={ss.toggleRow}>
            <TouchableOpacity
              style={[
                ss.toggleBtn,
                filter === "all" && { backgroundColor: PRIMARY },
              ]}
              onPress={() => setFilter("all")}
            >
              <Text
                style={[
                  ss.toggleText,
                  { color: filter === "all" ? "#fff" : "#888" },
                ]}
              >
                {t.adviceAll ?? "ALL"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                ss.toggleBtn,
                filter === "relevant" && { backgroundColor: PRIMARY },
              ]}
              onPress={() => setFilter("relevant")}
            >
              <Text
                style={[
                  ss.toggleText,
                  { color: filter === "relevant" ? "#fff" : "#888" },
                ]}
              >
                {t.adviceRelevantForMe ?? "RELEVANT FOR ME"}
              </Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color={PRIMARY} style={{ marginTop: 40 }} />
          ) : error ? (
            <Text style={ss.emptyNote}>{error}</Text>
          ) : (
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
            >
              {filter === "relevant" && userRelevant.size === 0 && (
                <Text style={ss.emptyNote}>
                  {t.adviceNoRelevant ??
                    'Open an advice and tick "This is relevant for me" to see it here.'}
                </Text>
              )}
              {Object.entries(grouped).map(([category, items]) => (
                <View key={category}>
                  <Text style={[ss.categoryHeader, { color: PRIMARY }]}>
                    {category}
                  </Text>
                  {items.map((item) => (
                    <AdviceCard
                      key={item._id}
                      advice={item}
                      viewed={viewed.has(item._id)}
                      userRelevant={userRelevant.has(item._id)}
                      onPress={handlePress}
                      PRIMARY={PRIMARY}
                      NAVY={NAVY}
                      t={t}
                    />
                  ))}
                </View>
              ))}
            </ScrollView>
          )}
        </>
      )}
    </View>
  );
}

const ss = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
  },
  headerBtn: { width: 40 },
  headerBack: { color: "#fff", fontSize: 28, lineHeight: 34 },
  headerTitle: {
    flex: 1,
    color: "#fff",
    fontSize: FontSize.lg,
    fontWeight: "600",
    textAlign: "center",
  },
  toggleRow: { flexDirection: "row", margin: 16, gap: 10 },
  toggleBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#ccc",
  },
  toggleText: { fontSize: 13, fontWeight: "800", letterSpacing: 0.5 },
  categoryHeader: {
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
    marginTop: 8,
  },
  emptyNote: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 40,
    fontSize: 14,
    lineHeight: 22,
    paddingHorizontal: 20,
  },
});
