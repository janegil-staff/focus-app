export const Colors = {
  accent:       '#1A56DB',
  accentDark:   '#1344B0',
  accentLight:  '#60A5FA',
  accentBg:     '#D6E4FF',
  accentBorder: '#1A56DB33',

  bg:           '#0A0F1E',
  surface:      '#111827',
  surfaceDim:   '#1E2A3A',
  card:         '#162040',
  border:       '#1A2E5C',
  borderLight:  '#1A56DB33',

  // 1 = best (green), 5 = worst (red)
  score1: '#22C55E',  // great / very calm
  score2: '#60A5FA',  // good
  score3: '#FBBF24',  // okay
  score4: '#FB923C',  // low / impulsive
  score5: '#EF4444',  // very bad / very impulsive

  text:          '#F0EEF8',
  textSecondary: '#A8B4CC',
  textMuted:     '#5A6A82',

  error:   '#EF4444',
  success: '#22C55E',
  white:   '#FFFFFF',
  btnColor: '#1A56DB',
};

// Returns color for a score where 1=best, 5=worst
export function scoreColor(score) {
  const colors = ['#22C55E', '#60A5FA', '#FBBF24', '#FB923C', '#EF4444'];
  return colors[(score ?? 3) - 1] ?? '#FBBF24';
}

export const Spacing = {
  xs:  4,
  sm:  8,
  md:  12,
  lg:  16,
  xl:  24,
  xxl: 32,
};

export const Radius = {
  sm:   8,
  md:   10,
  lg:   16,
  full: 100,
};

export const FontSize = {
  xs:  11,
  sm:  13,
  md:  15,
  lg:  18,
  xl:  22,
  xxl: 28,
};