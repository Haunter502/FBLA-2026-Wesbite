// Color palette from the provided design
export const colors = {
  primary: {
    light: '#00F2DE', // Teal
    DEFAULT: '#00A799', // Mid teal
    dark: '#005049', // Dark teal
  },
  accent: {
    blue: '#0066FF',
    purple: '#7B61FF',
    pink: '#FF006B',
  },
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  black: '#000000',
  white: '#FFFFFF',
};

// Numera brand
export const brand = {
  name: 'Numera', // Use π symbol in UI
  slogan: 'Math Hub for Algebra 1 — Learn, Practice, Track, Win.',
  colors: {
    primary: colors.primary.DEFAULT,
    primaryLight: colors.primary.light,
    primaryDark: colors.primary.dark,
  },
};

// Animation constants
export const animation = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  easing: {
    default: [0.4, 0, 0.2, 1],
    in: [0.4, 0, 1, 1],
    out: [0, 0, 0.2, 1],
    inOut: [0.4, 0, 0.2, 1],
  },
};

// Accessibility
export const reducedMotion = {
  transition: 'none',
  animation: 'none',
};
