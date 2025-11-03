import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Modal, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView
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
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={[styles.container, { backgroundColor: theme.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              {initialData ? 'Edit Todo' : 'New Todo'}
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={28} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Title *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              value={title}
              onChangeText={setTitle}
              placeholder="What needs to be done?"
              placeholderTextColor={theme.textTertiary}
            />

            <Text style={[styles.label, { color: theme.textSecondary }]}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Add details..."
              placeholderTextColor={theme.textTertiary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Text style={[styles.label, { color: theme.textSecondary }]}>Due Date</Text>
            <TouchableOpacity
              style={[styles.dateButton, { backgroundColor: theme.background, borderColor: theme.border }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color={theme.textSecondary} />
              <Text style={[styles.dateText, { color: theme.text }]}>
                {dueDate ? dueDate.toLocaleDateString() : 'Select date'}
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
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { backgroundColor: theme.surfaceSecondary }]}
              onPress={handleClose}
            >
              <Text style={[styles.buttonText, { color: theme.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton, { backgroundColor: theme.primary }]}
              onPress={handleSubmit}
              disabled={!title.trim()}
            >
              <Text style={[styles.buttonText, { color: '#FFF' }]}>
                {initialData ? 'Update' : 'Create'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  container: { borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  form: { padding: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16 },
  textArea: { height: 100 },
  dateButton: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, borderWidth: 1 },
  dateText: { fontSize: 16 },
  footer: { flexDirection: 'row', gap: 12, padding: 20 },
  button: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
  cancelButton: {},
  submitButton: {},
  buttonText: { fontSize: 16, fontWeight: '600' },
});