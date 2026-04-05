import React from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Path, Rect, Line } from "react-native-svg";
import { useTheme } from "../../context/ThemeContext";
import { useLang } from "../../context/LangContext";
import { Spacing, FontSize } from "../../theme";

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

export default function ASRSInfoScreen({ navigation }) {
  const { theme }  = useTheme();
  const { t }      = useLang();
  const insets     = useSafeAreaInsets();
  const PRIMARY    = theme.accent ?? "#4A7AB5";

  const tabs = [
    { key: "code",    label: t.shareTabCode    ?? "Code",    Icon: IconCode },
    { key: "asrs",    label: t.shareTabASRS    ?? "ASRS",    Icon: IconASRS },
    { key: "studies", label: t.shareTabStudies ?? "Studies", Icon: IconStudies },
  ];

  const handleTab = (key) => {
    if (key === "code")    navigation.navigate("Share");
    if (key === "studies") navigation.navigate("Studies");
    // asrs stays here
  };

  return (
    <View style={[s.root, { backgroundColor: theme.bgSecondary ?? "#F0F4F8" }]}>

      {/* Header */}
      <LinearGradient
        colors={[PRIMARY, theme.accentDark ?? "#2D4A6E"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[s.header, { paddingTop: insets.top + 10 }]}
      >
        <TouchableOpacity onPress={() => navigation.navigate("Home")} style={s.headerBtn}>
          <Text style={s.headerBack}>‹</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t.shareData ?? "Share Data"}</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {/* Content */}
      <ScrollView contentContainerStyle={s.container} showsVerticalScrollIndicator={false}>

        {/* 1. Headline */}
        <Text style={s.headline}>
          {t.yourAsrsRecord ?? "Your ASRS Record"}
        </Text>

        {/* 2. Explanation in accent color */}
        <Text style={s.explanation}>
          {t.asrsInfoExplanation ??
            "This questionnaire is designed to help you describe how you feel and what your ADHD symptoms prevent you from doing. The form provides a solid basis for you to discuss your ADHD with your doctor."}
        </Text>

        {/* 3. Doctor image */}
        <Image
          source={require("../../../assets/images/informative.png")}
          style={s.doctorImage}
          resizeMode="contain"
        />
      </ScrollView>

      {/* 4. Gradient button */}
      <View style={s.btnContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate("ASRS")}
          activeOpacity={0.85}
          style={s.btnWrapper}
        >
          <LinearGradient
            colors={[theme.accent, theme.accentDark ?? "#2D4A6E"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.btn}
          >
            <Text style={s.btnText}>
              {(t.registerAsrsRecord ?? "Register ASRS Record").toUpperCase()}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* 5. Bottom tab bar */}
      <View style={s.tabBarWrapper}>
        <View style={[s.tabBar, { paddingBottom: insets.bottom + 8 }]}>
          {tabs.map(({ key, label, Icon }) => {
            const active = key === "asrs";
            return (
              <TouchableOpacity
                key={key}
                style={s.tabBtn}
                onPress={() => handleTab(key)}
                activeOpacity={0.7}
              >
                <Icon color={active ? PRIMARY : "#a0b8d0"} size={24} />
                <Text style={[s.tabLabel, {
                  color: active ? PRIMARY : "#a0b8d0",
                  fontWeight: active ? "700" : "500",
                }]}>
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

  container:   { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: 20, alignItems: "center" },

  headline: {
    color:        "#111",
    fontSize:     22,
    fontWeight:   "700",
    textAlign:    "center",
    marginBottom: Spacing.lg,
  },

  explanation: {
    color:        "#22C55E",
    fontSize:     FontSize.md,
    lineHeight:   26,
    fontWeight:   "500",
    width:        "100%",
    marginBottom: Spacing.lg,
  },

  doctorImage: { width: 280, height: 320, marginTop: Spacing.sm },

  btnContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop:        Spacing.md,
    paddingBottom:     Spacing.sm,
    backgroundColor:   "#F0F4F8",
  },
  btnWrapper: {
    borderRadius:  12,
    overflow:      "hidden",
    shadowOpacity: 0.4,
    shadowRadius:  12,
    shadowOffset:  { width: 0, height: 6 },
    elevation:     8,
  },
  btn:     { paddingVertical: 18, alignItems: "center", justifyContent: "center" },
  btnText: { color: "#fff", fontSize: FontSize.md, fontWeight: "800", letterSpacing: 1.5 },

  tabBarWrapper: { backgroundColor: "#fff", paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1.5, borderTopColor: "#a0b8d0" },
  tabBar:        { flexDirection: "row", paddingTop: 10 },
  tabBtn:        { flex: 1, alignItems: "center", gap: 4 },
  tabLabel:      { fontSize: 11 },
});