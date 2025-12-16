/**
 * Identra Color Palette
 * Based on user specifications:
 * Light: background: #FFFFFF, foreground: #000000, surface: #F6F6F6, secondary: #E0E0E0, accent: #00C4A7
 * Dark: background: #000000, foreground: #FFFFFF, surface: #1A1A1A, secondary: #2A2A2A, accent: #46FFD8
 */

const tintColorLight = '#00C4A7';
const tintColorDark = '#46FFD8';

export const Colors = {
  light: {
    // Base colors
    text: '#000000',
    textSecondary: '#687076',
    background: '#FFFFFF',
    surface: '#F6F6F6',
    secondary: '#E0E0E0',
    card: '#FFFFFF',
    border: '#E0E0E0',

    // Accent colors
    tint: tintColorLight,
    accent: tintColorLight,

    // Icon colors
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,

    // Status colors
    success: '#00C4A7',
    warning: '#FF9500',
    error: '#FF3B30',
    info: '#007AFF',

    // Quick action colors
    actionManage: '#5C6BC0',
    actionShare: '#FF7043',

    // Overlay colors
    overlay: 'rgba(0,0,0,0.5)',
    overlayLight: 'rgba(0,0,0,0.1)',

    // Gradient backgrounds
    gradientPrimary: ['#1A2B3C', '#0F1724'],
    gradientSecondary: ['#0A4D5C', '#063844'],
    gradientPassport: ['#0A1930', '#050B15'],
    gradientExpiring: ['#3E1015', '#2A0A0E'],
    gradientNIC: ['#00C4A7', '#00A890'],

    // Shadow
    shadow: '#000',

    // Badge backgrounds (light mode)
    badgeSuccess: '#E8F5E9',
    badgeInfo: '#E0F7FA',
    badgeWarning: '#FFF8E1',
    badgeError: '#FFEBEE',
    badgeNeutral: '#ECEFF1',
    badgePurple: '#F3E5F5',
    badgeTeal: '#E0F2F1',
    badgeBlue: '#E3F2FD',
  },
  dark: {
    // Base colors
    text: '#FFFFFF',
    textSecondary: '#9BA1A6',
    background: '#000000',
    surface: '#1A1A1A',
    secondary: '#2A2A2A',
    card: '#2A2A2A',
    border: '#2A2A2A',

    // Accent colors
    tint: tintColorDark,
    accent: tintColorDark,

    // Icon colors
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,

    // Status colors
    success: '#46FFD8',
    warning: '#FF9500',
    error: '#FF453A',
    info: '#0A84FF',

    // Quick action colors
    actionManage: '#5C6BC0',
    actionShare: '#FF7043',

    // Overlay colors
    overlay: 'rgba(255,255,255,0.5)',
    overlayLight: 'rgba(255,255,255,0.1)',

    // Gradient backgrounds
    gradientPrimary: ['#1A2B3C', '#0F1724'],
    gradientSecondary: ['#0A4D5C', '#063844'],
    gradientPassport: ['#0A1930', '#050B15'],
    gradientExpiring: ['#3E1015', '#2A0A0E'],
    gradientNIC: ['#00C4A7', '#00A890'],

    // Shadow
    shadow: '#000',

    // Badge backgrounds (dark mode - with transparency)
    badgeSuccess: 'rgba(0,196,167,0.2)',
    badgeInfo: 'rgba(0,229,255,0.15)',
    badgeWarning: 'rgba(255,193,7,0.15)',
    badgeError: 'rgba(244,67,54,0.15)',
    badgeNeutral: 'rgba(96,125,139,0.15)',
    badgePurple: 'rgba(156,39,176,0.15)',
    badgeTeal: 'rgba(0,150,136,0.2)',
    badgeBlue: 'rgba(41,98,255,0.15)',
  },
};
