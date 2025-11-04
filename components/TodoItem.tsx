import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBg }]}>
      {/* Checkbox */}
      <TouchableOpacity onPress={toggleComplete} style={styles.checkbox}>
        <View style={[
          styles.checkboxCircle,
          { borderColor: completed ? theme.primary : theme.border },
          completed && { backgroundColor: theme.primary }
        ]}>
          {completed && (
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          )}
        </View>
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[
          styles.title,
          { color: theme.text },
          completed && { 
            textDecorationLine: 'line-through', 
            color: theme.completed 
          }
        ]}>
          {title}
        </Text>
        
        {description && (
          <Text style={[
            styles.description, 
            { color: theme.textSecondary },
            completed && { color: theme.completed }
          ]} numberOfLines={2}>
            {description}
          </Text>
        )}
        
        {dueDate && (
          <Text style={[
            styles.date, 
            { color: theme.textTertiary },
            completed && { color: theme.completed }
          ]}>
            {new Date(dueDate).toLocaleDateString()}
          </Text>
        )}
      </View>

      {/* Delete Button */}
      <TouchableOpacity
        onPress={() => deleteTodo({ id })}
        style={styles.deleteBtn}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="close" size={20} color={theme.textTertiary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 4,
  },
  checkbox: {
    marginRight: 12,
  },
  checkboxCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    marginTop: 4,
  },
  date: {
    fontSize: 12,
    marginTop: 4,
  },
  deleteBtn: {
    padding: 4,
  },
});