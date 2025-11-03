import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';

interface TodoItemProps {
  id: Id<"todos">;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  onEdit: () => void;
}

export const TodoItem = ({ id, title, description, dueDate, completed, onEdit }: TodoItemProps) => {
  const { theme } = useTheme();
  const updateTodo = useMutation(api.todos.update);
  const deleteTodo = useMutation(api.todos.remove);

  const toggleComplete = () => updateTodo({ id, completed: !completed });

  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>) => {
    const trans = progress.interpolate({ inputRange: [0, 1], outputRange: [100, 0] });
    
    return (
      <Animated.View style={[styles.rightActions, { transform: [{ translateX: trans }] }]}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.primary }]}
          onPress={onEdit}
        >
          <Ionicons name="pencil" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.error }]}
          onPress={() => deleteTodo({ id })}
        >
          <Ionicons name="trash" size={24} color="#FFF" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <TouchableOpacity onPress={toggleComplete} style={styles.checkbox}>
          <View style={[
            styles.checkboxBox,
            { borderColor: completed ? theme.primary : theme.border },
            completed && { backgroundColor: theme.primary }
          ]}>
            {completed && <Ionicons name="checkmark" size={16} color="#FFF" />}
          </View>
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={[
            styles.title,
            { color: theme.text },
            completed && { textDecorationLine: 'line-through', color: theme.textTertiary }
          ]}>
            {title}
          </Text>
          {description && (
            <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={2}>
              {description}
            </Text>
          )}
          {dueDate && (
            <View style={styles.dateContainer}>
              <Ionicons name="calendar-outline" size={14} color={theme.textTertiary} />
              <Text style={[styles.date, { color: theme.textTertiary }]}>
                {new Date(dueDate).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  checkbox: { marginRight: 12, justifyContent: 'center' },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  description: { fontSize: 14, marginBottom: 6 },
  dateContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  date: { fontSize: 12 },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 60,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
});