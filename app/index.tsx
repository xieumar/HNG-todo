import React, { useState, useMemo, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Dimensions,
  StyleSheet, SafeAreaView, ActivityIndicator, ImageBackground, ScrollView, Platform
} from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import NetInfo from '@react-native-community/netinfo';
import Toast from 'react-native-toast-message';
import { useTheme } from '../hooks/useTheme';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { TodoItem } from '../components/TodoItem';
import { TodoForm } from '../components/TodoForm';
import { Id } from '../convex/_generated/dataModel';

const { width } = Dimensions.get('window');

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
  const deleteTodo = useMutation(api.todos.remove);
  const reorderTodos = useMutation(api.todos.reorder);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [formVisible, setFormVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [operationInProgress, setOperationInProgress] = useState(false);

  // Network monitoring
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected ?? false;
      const online = state.isInternetReachable ?? true;
      
      setIsConnected(connected);
      setIsOnline(online);

      if (!connected) {
        Toast.show({
          type: 'error',
          text1: 'No Internet Connection',
          text2: 'Please check your network settings',
          position: 'top',
          visibilityTime: 3000,
        });
      } else if (connected && !online) {
        Toast.show({
          type: 'info',
          text1: 'Limited Connectivity',
          text2: 'You may experience issues',
          position: 'top',
          visibilityTime: 2000,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Error handling for query failures
  useEffect(() => {
    if (todos === undefined && !isRetrying) {
      const timer = setTimeout(() => {
        setError('Failed to load todos. Please try again.');
      }, 10000); // Show error after 10 seconds of loading

      return () => clearTimeout(timer);
    } else if (todos !== undefined) {
      setError(null);
    }
  }, [todos, isRetrying]);

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

  const checkConnection = (): boolean => {
    if (!isConnected || !isOnline) {
      Toast.show({
        type: 'error',
        text1: 'No Internet Connection',
        text2: 'Please check your network and try again',
        position: 'top',
        visibilityTime: 3000,
      });
      return false;
    }
    return true;
  };

  const handleCreate = async (data: any) => {
    if (!checkConnection()) return;
    
    setOperationInProgress(true);
    try {
      await createTodo(data);
      Toast.show({
        type: 'success',
        text1: 'Todo Created',
        text2: 'Your todo has been added successfully',
        position: 'top',
        visibilityTime: 2000,
      });
      setFormVisible(false);
    } catch (err) {
      console.error('Create todo error:', err);
      Toast.show({
        type: 'error',
        text1: 'Failed to Create Todo',
        text2: err instanceof Error ? err.message : 'An unexpected error occurred',
        position: 'top',
        visibilityTime: 4000,
      });
    } finally {
      setOperationInProgress(false);
    }
  };

  const handleEdit = async (data: any) => {
    if (!checkConnection() || !editingTodo) return;

    setOperationInProgress(true);
    try {
      await updateTodo({ id: editingTodo._id, ...data });
      Toast.show({
        type: 'success',
        text1: 'Todo Updated',
        text2: 'Your changes have been saved',
        position: 'top',
        visibilityTime: 2000,
      });
      setEditingTodo(null);
      setFormVisible(false);
    } catch (err) {
      console.error('Update todo error:', err);
      Toast.show({
        type: 'error',
        text1: 'Failed to Update Todo',
        text2: err instanceof Error ? err.message : 'An unexpected error occurred',
        position: 'top',
        visibilityTime: 4000,
      });
    } finally {
      setOperationInProgress(false);
    }
  };

  const handleDelete = async (id: Id<"todos">) => {
    if (!checkConnection()) return;

    try {
      await deleteTodo({ id });
      Toast.show({
        type: 'success',
        text1: 'Todo Deleted',
        text2: 'The todo has been removed',
        position: 'top',
        visibilityTime: 2000,
      });
    } catch (err) {
      console.error('Delete todo error:', err);
      Toast.show({
        type: 'error',
        text1: 'Failed to Delete Todo',
        text2: err instanceof Error ? err.message : 'An unexpected error occurred',
        position: 'top',
        visibilityTime: 4000,
      });
    }
  };

  const handleClearCompleted = async () => {
    if (!todos || !checkConnection()) return;
    
    const completedTodos = todos.filter(t => t.completed);
    
    if (completedTodos.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'No Completed Todos',
        text2: 'There are no completed todos to clear',
        position: 'top',
        visibilityTime: 2000,
      });
      return;
    }

    setOperationInProgress(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (const todo of completedTodos) {
        try {
          await deleteTodo({ id: todo._id });
          successCount++;
        } catch (err) {
          console.error(`Failed to delete todo ${todo._id}:`, err);
          failCount++;
        }
      }

      if (successCount > 0 && failCount === 0) {
        Toast.show({
          type: 'success',
          text1: 'Completed Todos Cleared',
          text2: `${successCount} todo(s) removed successfully`,
          position: 'top',
          visibilityTime: 2000,
        });
      } else if (successCount > 0 && failCount > 0) {
        Toast.show({
          type: 'info',
          text1: 'Partially Cleared',
          text2: `${successCount} removed, ${failCount} failed`,
          position: 'top',
          visibilityTime: 3000,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to Clear Todos',
          text2: 'Could not remove completed todos',
          position: 'top',
          visibilityTime: 3000,
        });
      }
    } finally {
      setOperationInProgress(false);
    }
  };

  const handleDragEnd = async ({ data }: { data: Todo[] }) => {
    if (!checkConnection()) return;

    const updates = data.map((item, idx) => ({
      id: item._id,
      order: data.length - idx,
    }));

    try {
      await reorderTodos({ updates });
    } catch (err) {
      console.error('Reorder error:', err);
      Toast.show({
        type: 'error',
        text1: 'Failed to Reorder',
        text2: 'Could not save the new order',
        position: 'top',
        visibilityTime: 3000,
      });
    }
  };

  const handleRetry = () => {
    setIsRetrying(true);
    setError(null);
    
    // The query will automatically retry when the component re-renders
    setTimeout(() => {
      setIsRetrying(false);
    }, 2000);

    Toast.show({
      type: 'info',
      text1: 'Retrying...',
      text2: 'Attempting to reconnect',
      position: 'top',
      visibilityTime: 2000,
    });
  };

  const renderTodoItem = ({ item, drag, isActive }: RenderItemParams<Todo>) => (
    <ScaleDecorator>
      <TouchableOpacity
        onLongPress={drag}
        disabled={isActive || operationInProgress}
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
    </ScaleDecorator>
  );

  const gradientColors: readonly [string, string] = mode === 'light'
    ? ['rgba(55, 16, 189, 0.7)', 'rgba(164, 35, 149, 0.7)']
    : ['rgba(55, 16, 189, 0.9)', 'rgba(164, 35, 149, 0.9)'];

  const bgImage = mode === 'light'
    ? 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'
    : 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80';

  // Loading state
  if (todos === undefined && !error) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: mode === 'light' ? '#E0E7FF' : '#1E293B' }]}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={[styles.loadingText, { color: mode === 'light' ? '#4338CA' : '#818CF8' }]}>
          Loading your todos...
        </Text>
      </View>
    );
  }

  // Error state
  if (error && todos === undefined) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: mode === 'light' ? '#E0E7FF' : '#1E293B' }]}>
        <Ionicons 
          name="cloud-offline-outline" 
          size={64} 
          color={mode === 'light' ? '#DC2626' : '#EF4444'} 
        />
        <Text style={[styles.errorTitle, { color: mode === 'light' ? '#1F2937' : '#F9FAFB' }]}>
          Connection Error
        </Text>
        <Text style={[styles.errorText, { color: mode === 'light' ? '#6B7280' : '#D1D5DB' }]}>
          {error}
        </Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: '#6366F1' }]}
          onPress={handleRetry}
          disabled={isRetrying}
        >
          {isRetrying ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
              <Text style={styles.retryButtonText}>Retry</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={styles.container}>
        {/* Network status indicator */}
        {!isConnected && (
          <View style={styles.offlineBanner}>
            <Ionicons name="cloud-offline-outline" size={16} color="#FFFFFF" />
            <Text style={styles.offlineBannerText}>Offline Mode</Text>
          </View>
        )}

        <ImageBackground
          source={{ uri: bgImage }}
          style={styles.headerBg}
          resizeMode="cover"
        >
          <LinearGradient colors={gradientColors} style={styles.headerGradient}>
            <SafeAreaView style={styles.safeArea}>
              <View style={styles.headerWrapper}>
                <View style={[styles.header, Platform.OS === 'android' && { marginTop: 40 }]}>
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
                  style={[
                    styles.addButton, 
                    { backgroundColor: theme.inputBg },
                    operationInProgress && styles.buttonDisabled
                  ]}
                  onPress={() => setFormVisible(true)}
                  disabled={operationInProgress || !isConnected}
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
                  <Ionicons 
                    name="checkmark-done-circle-outline" 
                    size={64} 
                    color={theme.textTertiary} 
                  />
                  <Text style={[styles.emptyText, { color: theme.textTertiary }]}>
                    {search ? 'No todos found' : 'No todos yet'}
                  </Text>
                  <Text style={[styles.emptySubtext, { color: theme.textTertiary }]}>
                    {search ? 'Try a different search' : 'Tap above to create your first todo'}
                  </Text>
                </View>
              ) : (
                <>
                  <DraggableFlatList
                    data={filteredTodos}
                    renderItem={renderTodoItem}
                    keyExtractor={item => item._id}
                    onDragEnd={handleDragEnd}
                    showsVerticalScrollIndicator={true}
                    containerStyle={styles.flatListContainer}
                    contentContainerStyle={styles.flatListContent}
                  />

                  <View style={styles.bottomSection}>
                    <View style={styles.stats}>
                      <Text style={[styles.statsText, { color: theme.textTertiary }]}>
                        {stats.active} items left
                      </Text>
                      <TouchableOpacity 
                        onPress={handleClearCompleted}
                        disabled={operationInProgress || !isConnected}
                      >
                        <Text style={[
                          styles.clearCompleted, 
                          { color: theme.textTertiary },
                          (operationInProgress || !isConnected) && styles.textDisabled
                        ]}>
                          {operationInProgress ? 'Clearing...' : 'Clear Completed'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              )}
            </View>

            <View style={[styles.filterContainer, { backgroundColor: mode === 'light' ? '#F5F5F5' : mode === 'dark' ? '#1a1a1a' : '#F5F5F5' }]}>
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

        <Toast />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1 },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  offlineBanner: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  offlineBannerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  headerBg: {
    height: 250,
  },
  headerGradient: {
    flex: 1,
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
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
  addButton: {
    borderRadius: 5,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 20,
  },
  addButtonText: {
    fontSize: 18,
  },
  buttonDisabled: {
    opacity: 0.5,
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
    marginTop:
      Platform.OS === 'web'
        ? (width > 768 ? -70 : -60)
        : -50,
    overflow: 'hidden',
  },
  flatListContainer: {
    maxHeight: '80%',
  },
  flatListContent: {
    padding: 20,
    paddingBottom: 10,
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  statsText: {
    fontSize: 14,
  },
  clearCompleted: {
    fontSize: 14,
  },
  textDisabled: {
    opacity: 0.5,
  },
  filterContainer: {
    flex: 1/3,
    padding: 5,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filters: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 5,
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
});