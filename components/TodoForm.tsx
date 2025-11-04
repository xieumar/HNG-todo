import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Modal, StyleSheet,
  KeyboardAvoidingView, Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

interface TodoFormProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description?: string; dueDate?: string }) => void;
  initialData?: { title: string; description?: string; dueDate?: string };
}

export const TodoForm = ({ visible, onClose, onSubmit, initialData }: TodoFormProps) => {
  const { theme } = useTheme();
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [dueDate, setDueDate] = useState<Date | undefined>(
    initialData?.dueDate ? new Date(initialData.dueDate) : undefined
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate: dueDate?.toISOString(),
    });
    handleClose();
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setDueDate(undefined);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={[styles.container, { backgroundColor: theme.surface }]}>
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: theme.text }]}>
                {initialData ? 'Edit Todo' : 'Create a new todo'}
              </Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={theme.icon} />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    backgroundColor: theme.inputBg, 
                    color: theme.text,
                    borderColor: theme.border 
                  }
                ]}
                value={title}
                onChangeText={setTitle}
                placeholder="Todo title"
                placeholderTextColor={theme.textPlaceholder}
                autoFocus
              />

              <TextInput
                style={[
                  styles.input, 
                  styles.textArea, 
                  { 
                    backgroundColor: theme.inputBg, 
                    color: theme.text,
                    borderColor: theme.border 
                  }
                ]}
                value={description}
                onChangeText={setDescription}
                placeholder="Description (optional)"
                placeholderTextColor={theme.textPlaceholder}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={[
                  styles.dateButton, 
                  { 
                    backgroundColor: theme.inputBg,
                    borderColor: theme.border 
                  }
                ]}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color={theme.iconSecondary} />
                <Text style={[styles.dateText, { color: dueDate ? theme.text : theme.textPlaceholder }]}>
                  {dueDate ? dueDate.toLocaleDateString() : 'Set due date (optional)'}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={dueDate || new Date()}
                  mode="date"
                  display="default"
                  onChange={(e, date) => {
                    setShowDatePicker(false);
                    if (date) setDueDate(date);
                  }}
                />
              )}
            </View>

            <View style={styles.footer}>
              <TouchableOpacity
                style={[
                  styles.button, 
                  styles.submitButton, 
                  { backgroundColor: theme.primary },
                  !title.trim() && { opacity: 0.5 }
                ]}
                onPress={handleSubmit}
                disabled={!title.trim()}
              >
                <Text style={styles.submitButtonText}>
                  {initialData ? 'Update' : 'Add Todo'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  keyboardView: {
    width: '100%',
    maxWidth: 500,
  },
  container: {
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  form: {
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
  },
  textArea: {
    height: 100,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  dateText: {
    fontSize: 16,
  },
  footer: {
    marginTop: 20,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButton: {},
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});