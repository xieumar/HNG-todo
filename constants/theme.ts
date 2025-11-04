export const lightTheme = {
  // Backgrounds
  background: 'linear-gradient(180deg, #B794F6 0%, #7DD3FC 100%)',
  backgroundSolid: '#E0E7FF',
  surface: '#FFFFFF',
  cardBg: '#FFFFFF',
  inputBg: '#FFFFFF',
  
  // Text
  text: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textPlaceholder: '#D1D5DB',

  //scrolbar
  scrollbarThumb: '#999',
  scrollbarTrack: '#EEE',

  // Primary
  primary: '#6366F1',
  primaryLight: '#818CF8',
  
  // States
  completed: '#9CA3AF',
  completedBg: '#F3F4F6',
  
  // UI Elements
  border: '#E5E7EB',
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.4)',
  
  // Filter tabs
  filterActive: '#6366F1',
  filterInactive: '#6B7280',
  
  // Icon
  icon: '#1F2937',
  iconSecondary: '#9CA3AF',
};

export const darkTheme = {
  // Backgrounds
  background: 'linear-gradient(180deg, #5B21B6 0%, #1E3A8A 100%)',
  backgroundSolid: '#1E293B',
  surface: '#2D3748',
  cardBg: '#2D3748',
  inputBg: '#374151',
  
  // Text
  text: '#F9FAFB',
  textSecondary: '#D1D5DB',
  textTertiary: '#9CA3AF',
  textPlaceholder: '#6B7280',

  //scrollbar
  scrollbarThumb: '#FFF',
  scrollbarTrack: '#333',
  
  // Primary
  primary: '#818CF8',
  primaryLight: '#A5B4FC',
  
  // States
  completed: '#6B7280',
  completedBg: '#374151',
  
  // UI Elements
  border: '#4B5563',
  shadow: 'rgba(0, 0, 0, 0.3)',
  overlay: 'rgba(0, 0, 0, 0.6)',
  
  // Filter tabs
  filterActive: '#818CF8',
  filterInactive: '#9CA3AF',
  
  // Icon
  icon: '#F9FAFB',
  iconSecondary: '#9CA3AF',
};

export type Theme = typeof lightTheme;