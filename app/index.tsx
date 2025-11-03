import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator
} from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { TodoItem } from '../components/TodoItem';
import { TodoForm } from '../components/TodoForm';
import { ThemeToggle } from '../components/ThemeToggle';
import { Id } from '../convex/_generated/dataModel';

type Todo = {
  _id: Id<"todos">;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  order: number;
  createdAt: number;
};

export default function TodoScreen() {
  const { theme } = useTheme();
  const todos = useQuery(api.todos.list);
  const createTodo = useMutation(api.todos.create);
  const updateTodo = useMutation(api.todos.update);
  const reorderTodos = useMutation(api.todos.reorder);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [formVisible, setFormVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const filteredTodos = useMemo(() => {
    if (!todos) return [];
    
    let filtered = todos.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description?.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === 'all' ||
        (filter === 'active' && !t.completed) ||
        (filter === 'completed' && t.completed);
      return matchesSearch && matchesFilter;
    });

    return filtered.sort((a, b) => b.order - a.order);
  }, [todos, search, filter]);

  const stats = useMemo(() => {
    if (!todos) return { total: 0, active: 0, completed: 0 };
    return {
      total: todos.length,
      active: todos.filter(t => !t.completed).length,
      completed: todos.filter(t => t.completed).length,
    };
  }, [todos]);

  const handleCreate = (data: any) => createTodo(data);

  const handleEdit = (data: any) => {
    if (editingTodo) {
      updateTodo({ id: editingTodo._id, ...data });
      setEditingTodo(null);
    }
  };

  const handleDragEnd = ({ data }: { data: Todo[] }) => {
    const updates = data.map((item, idx) => ({
      id: item._id,
      order: data.length - idx,
    }));
    reorderTodos({ updates });
  };

  const renderTodoItem = ({ item, drag, isActive }: RenderItemParams<Todo>) => (
    <TouchableOpacity
      onLongPress={drag}
      disabled={isActive}
      style={{ opacity: isActive ? 0.5 : 1 }}
    >
      <TodoItem
        id={item._id}
        title={item.title}
        description={item.description}
        dueDate={item.dueDate}
        completed={item.completed}
        onEdit={() => {
          setEditingTodo(item);
          setFormVisible(true);
        }}
      />
    </TouchableOpacity>
  );

  if (todos === undefined) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerTitle, { color: theme.text }]}>My Tasks</Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              {stats.active} active · {stats.completed} completed
            </Text>
          </View>
          <ThemeToggle />
        </View>

        <View style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Ionicons name="search" size={20} color={theme.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search tasks..."
            placeholderTextColor={theme.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <View style={styles.filters}>
          {(['all', 'active', 'completed'] as const).map(f => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[
                styles.filterBtn,
                { borderColor: theme.border },
                filter === f && { backgroundColor: theme.primary, borderColor: theme.primary }
              ]}
            >
              <Text style={[
                styles.filterText,
                { color: theme.textSecondary },
                filter === f && { color: '#FFF', fontWeight: '600' }
              ]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {filteredTodos.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="checkmark-done-circle-outline" size={80} color={theme.textTertiary} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              {search ? 'No tasks found' : 'No tasks yet'}
            </Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              {search ? 'Try a different search' : 'Tap + to create your first task'}
            </Text>
          </View>
        ) : (
          <DraggableFlatList
            data={filteredTodos}
            renderItem={renderTodoItem}
            keyExtractor={item => item._id}
            onDragEnd={handleDragEnd}
            contentContainerStyle={styles.list}
          />
        )}

        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.primary }]}
          onPress={() => setFormVisible(true)}
        >
          <Ionicons name="add" size={32} color="#FFF" />
        </TouchableOpacity>

        <TodoForm
          visible={formVisible}
          onClose={() => {
            setFormVisible(false);
            setEditingTodo(null);
          }}
          onSubmit={editingTodo ? handleEdit : handleCreate}
          initialData={editingTodo || undefined}
        />
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 10 },
  headerTitle: { fontSize: 32, fontWeight: '800' },
  headerSubtitle: { fontSize: 14, marginTop: 4 },
  searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, padding: 12, borderRadius: 12, gap: 10, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 16 },
  filters: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingVertical: 16 },
  filterBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 14 },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginTop: 20 },
  emptyText: { fontSize: 14, textAlign: 'center', marginTop: 8 },
  fab: { position: 'absolute', bottom: 30, right: 20, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
});