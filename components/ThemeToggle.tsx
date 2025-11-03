import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

export const ThemeToggle = () => {
  const { theme, mode, toggleTheme } = useTheme();
  const animatedValue = useRef(new Animated.Value(mode === 'dark' ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: mode === 'dark' ? 1 : 0,
      useNativeDriver: true,
      friction: 8,
    }).start();
  }, [mode]);

  const rotate = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      style={[styles.container, { backgroundColor: theme.surfaceSecondary }]}
    >
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Ionicons
          name={mode === 'dark' ? 'moon' : 'sunny'}
          size={24}
          color={theme.primary}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});