export const lightTheme = {
  background: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceSecondary: '#F8F9FA',
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  text: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  border: '#E5E7EB',
  error: '#EF4444',
  success: '#10B981',
  completed: '#D1D5DB',
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const darkTheme = {
  background: '#0F172A',
  surface: '#1E293B',
  surfaceSecondary: '#334155',
  primary: '#818CF8',
  primaryDark: '#6366F1',
  text: '#F1F5F9',
  textSecondary: '#CBD5E1',
  textTertiary: '#64748B',
  border: '#334155',
  error: '#F87171',
  success: '#34D399',
  completed: '#475569',
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.7)',
};

export type Theme = typeof lightTheme;