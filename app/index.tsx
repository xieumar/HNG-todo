import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator, ImageBackground
} from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../hooks/useTheme';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { TodoItem } from '../components/TodoItem';
import { TodoForm } from '../components/TodoForm';
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
  const { theme, mode, toggleTheme } = useTheme();
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
      const matchesSearch = search === '' ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
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
      style={{ opacity: isActive ? 0.7 : 1 }}
      activeOpacity={0.9}
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
  const gradientColors: readonly [string, string] = mode === 'light'
    ? ['rgba(55, 16, 189, 0.7)', 'rgba(164, 35, 149, 0.7)'] as const // Lighter opacity for light mode
    : ['rgba(55, 16, 189, 0.9)', 'rgba(164, 35, 149, 0.9)'] as const;  // Darker opacity for dark mode

  // Background image URL - you can replace with your own image
  const bgImage = mode === 'light'
    ? 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80' // Mountains light
    : 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80'; // Mountains dark

  if (todos === undefined) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: mode === 'light' ? '#E0E7FF' : '#1E293B' }]}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={styles.container}>
        <ImageBackground
          source={{ uri: bgImage }}
          style={styles.headerBg}
          resizeMode="cover"
        >
          <LinearGradient colors={gradientColors} style={styles.headerGradient}>
            <SafeAreaView style={styles.safeArea}>
              <View style={styles.headerWrapper}>
                <View style={styles.header}>
                  <Text style={styles.title}>TODO</Text>
                  <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
                    <Ionicons
                      name={mode === 'light' ? 'moon-outline' : 'sunny-outline'}
                      size={26}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
                </View>

               <TouchableOpacity
                      style={[styles.addButton, { backgroundColor: theme.inputBg }]}
                      onPress={() => setFormVisible(true)}
                    >
                      <Text style={[styles.addButtonText, { color: theme.textPlaceholder }]}>
                        Create a new todo...
                      </Text>
                    </TouchableOpacity>
              </View>
            </SafeAreaView>
          </LinearGradient>
        </ImageBackground>

        <View style={[styles.contentArea, { backgroundColor: mode === 'light' ? '#F5F5F5' : '#1a1a1a' }]}>
          <View style={styles.contentWrapper}>
            <View style={[styles.contentCard, { backgroundColor: theme.surface }]}>
              {filteredTodos.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyText, { color: theme.textTertiary }]}>
                    {search ? 'No todos found' : 'No todos yet'}
                  </Text>
                </View>
              ) : (
                <>
                  <View style={styles.todoContainer}>
                    <DraggableFlatList
                      data={filteredTodos}
                      renderItem={renderTodoItem}
                      keyExtractor={item => item._id}
                      onDragEnd={handleDragEnd}
                      contentContainerStyle={styles.todoList}
                      showsVerticalScrollIndicator={false}
                    />

                    <View style={styles.stats}>
                      <Text style={[styles.statsText, { color: theme.textTertiary }]}>
                        {stats.active} items left
                      </Text>
                      <TouchableOpacity>
                        <Text style={[styles.clearCompleted, { color: theme.textTertiary }]}>
                          Clear Completed
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.filters}>
                      {(['all', 'active', 'completed'] as const).map(f => (
                        <TouchableOpacity
                          key={f}
                          onPress={() => setFilter(f)}
                          style={styles.filterBtn}
                        >
                          <Text style={[
                            styles.filterText,
                            { color: filter === f ? theme.filterActive : theme.filterInactive },
                            filter === f && styles.filterTextActive
                          ]}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <Text style={[styles.dragHint, { color: theme.textTertiary }]}>
                      Drag and drop to reorder list
                    </Text>

                    
                  </View>
                </>
              )}

            </View>
          </View>
        </View>

        <TodoForm
          visible={formVisible}
          onClose={() => {
            setFormVisible(false);
            setEditingTodo(null);
          }}
          onSubmit={editingTodo ? handleEdit : handleCreate}
          initialData={editingTodo || undefined}
        />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBg: {
    height: 250,
  },
  headerGradient: {
    flex: 1,
    alignItems: 'center',
  },
  headerWrapper: {
    width: '100%',
    maxWidth: 540,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 10,
  },
  themeToggle: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  searchContainer: {
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  searchInput: {
    fontSize: 18,
    fontWeight: '400',
  },
  contentArea: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 540,
    flex: 1,
    paddingHorizontal: 20,
  },
  contentCard: {
    flex: 1,
    borderRadius: 5,
    padding: 20,
    marginTop: -70,
  },
  todoContainer: {
    flex: 1,
  },
  todoList: {
    flexGrow: 1,  // Change from just paddingBottom
    paddingBottom: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    marginTop: 10,
  },
  statsText: {
    fontSize: 14,
  },
  clearCompleted: {
    fontSize: 14,
  },
  filters: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 12,
  },
  filterBtn: {
    paddingVertical: 4,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    fontWeight: '700',
  },
  dragHint: {
    textAlign: 'center',
    fontSize: 14,
    paddingVertical: 12,
  },
  addButton: {
    borderRadius: 5,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginTop: 10,
  },
  addButtonText: {
    fontSize: 18,
  },
});