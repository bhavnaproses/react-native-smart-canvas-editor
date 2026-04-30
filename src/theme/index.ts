export const COLORS = {
  dark: {
    bg: '#000000',
    panel: '#1C1C1E',
    card: '#2C2C2E',
    text: '#FFFFFF',
    sub: '#8E8E93',
    border: '#3A3A3C',
    primary: '#6366F1',
    accent: '#818CF8',
    canvas: '#FFFFFF',
    canvasBorder: '#E5E7EB',
    gridColor: '#E5E7EB',
  },
  light: {
    bg: '#F2F2F7',
    panel: '#FFFFFF',
    card: '#FFFFFF',
    text: '#000000',
    sub: '#8E8E93',
    border: '#E5E5EA',
    primary: '#4F46E5',
    accent: '#6366F1',
    canvas: '#FFFFFF',
    canvasBorder: '#D1D1D6',
    gridColor: '#D1D1D6',
  },
};

export type Theme = typeof COLORS.light;

export const BREAKPOINTS = {
  tablet: 768,
};

export const getTheme = (isDark: boolean): Theme => {
  return isDark ? COLORS.dark : COLORS.light;
};
