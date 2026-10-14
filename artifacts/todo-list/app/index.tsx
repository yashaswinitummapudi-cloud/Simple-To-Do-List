import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { KeyboardAvoidingView as ControllerKeyboardAvoidingView } from 'react-native-keyboard-controller';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

type Task = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
};

type Filter = 'all' | 'open' | 'done';

const STORAGE_KEY = '@simple-todo-list/tasks';
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'To do' },
  { key: 'done', label: 'Done' },
];

function formatToday(date: Date) {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export default function TodoScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [draft, setDraft] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [storageError, setStorageError] = useState<string | null>(null);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (!active) return;
        if (saved) {
          const parsed: unknown = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setTasks(
              parsed.filter(
                (item): item is Task =>
                  typeof item?.id === 'string' &&
                  typeof item?.title === 'string' &&
                  typeof item?.completed === 'boolean' &&
                  typeof item?.createdAt === 'number',
              ),
            );
          }
        }
      })
      .catch(() => {
        if (active) {
          setStorageError('Your saved tasks could not be opened. Try loading them again.');
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (isLoading || storageError) return;

    const serialized = JSON.stringify(tasks);
    saveQueue.current = saveQueue.current
      .then(() => AsyncStorage.setItem(STORAGE_KEY, serialized))
      .then(() => setStorageError(null))
      .catch(() => {
        setStorageError('Could not save your changes. Check your device storage and try again.');
      });
  }, [isLoading, storageError, tasks]);

  const visibleTasks = useMemo(
    () =>
      tasks.filter((task) => {
        if (filter === 'open') return !task.completed;
        if (filter === 'done') return task.completed;
        return true;
      }),
    [filter, tasks],
  );
  const completeCount = tasks.filter((task) => task.completed).length;
  const remainingCount = tasks.length - completeCount;
  const todayLabel = useMemo(() => formatToday(new Date()), []);
  const webInsets = Platform.OS === 'web' ? { paddingTop: 67, paddingBottom: 34 } : null;

  function addTask() {
    const title = draft.trim();
    if (!title || isLoading) return;

    const task: Task = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
      title,
      completed: false,
      createdAt: Date.now(),
    };
    setTasks((current) => [task, ...current]);
    setDraft('');
    Keyboard.dismiss();
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function toggleTask(id: string) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
    void Haptics.selectionAsync();
  }

  function deleteTask(id: string) {
    setTasks((current) => current.filter((task) => task.id !== id));
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  function retryStorage() {
    setIsLoading(true);
    setStorageError(null);
    AsyncStorage.getItem(STORAGE_KEY)
      .then((saved) => {
        if (saved) {
          const parsed: unknown = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setTasks(
              parsed.filter(
                (item): item is Task =>
                  typeof item?.id === 'string' &&
                  typeof item?.title === 'string' &&
                  typeof item?.completed === 'boolean' &&
                  typeof item?.createdAt === 'number',
              ),
            );
          }
        }
        setIsLoading(false);
      })
      .catch(() => {
        setStorageError('Your saved tasks could not be opened. Try loading them again.');
        setIsLoading(false);
      });
  }

  const styles = createStyles(colors);

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, webInsets]}
    >
      <ControllerKeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <View>
                <Text style={styles.date}>{todayLabel}</Text>
                <Text style={styles.title}>A little more{'\n'}room to think.</Text>
              </View>
              <View style={styles.headerMark} accessibilityLabel="To-do list">
                <Feather name="check" size={22} color={colors.primaryForeground} />
              </View>
            </View>

            <View style={styles.summary}>
              <View style={styles.summaryCopy}>
                <Text style={styles.summaryTitle}>
                  {remainingCount === 0
                    ? tasks.length === 0
                      ? 'Start with one thing'
                      : 'You’re all caught up'
                    : `${remainingCount} ${remainingCount === 1 ? 'thing' : 'things'} to do`}
                </Text>
                <Text style={styles.summarySubtitle}>
                  {tasks.length === 0
                    ? 'Small steps count.'
                    : `${completeCount} of ${tasks.length} complete`}
                </Text>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${tasks.length ? (completeCount / tasks.length) * 100 : 0}%`,
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <TextInput
                accessibilityLabel="New task"
                autoCorrect
                editable={!isLoading}
                onChangeText={setDraft}
                onSubmitEditing={addTask}
                placeholder="What needs doing?"
                placeholderTextColor={colors.mutedForeground}
                returnKeyType="done"
                style={styles.input}
                testID="task-input"
                value={draft}
              />
              <Pressable
                accessibilityLabel="Add task"
                accessibilityRole="button"
                disabled={!draft.trim() || isLoading}
                onPress={addTask}
                style={({ pressed }) => [
                  styles.addButton,
                  (!draft.trim() || isLoading) && styles.addButtonDisabled,
                  pressed && draft.trim() ? styles.pressed : null,
                ]}
                testID="add-task-button"
              >
                <Feather name="plus" size={22} color={colors.primaryForeground} />
              </Pressable>
            </View>

            {storageError ? (
              <View style={styles.errorBox} accessibilityRole="alert">
                <Text style={styles.errorText}>{storageError}</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={retryStorage}
                  style={styles.retryButton}
                  testID="retry-storage-button"
                >
                  <Text style={styles.retryText}>Try again</Text>
                </Pressable>
              </View>
            ) : null}

            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>Your list</Text>
              <Text style={styles.taskCount}>
                {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
              </Text>
            </View>

            <View style={styles.filters} accessibilityRole="tablist">
              {FILTERS.map((item) => {
                const selected = filter === item.key;
                return (
                  <Pressable
                    accessibilityRole="tab"
                    accessibilityState={{ selected }}
                    key={item.key}
                    onPress={() => setFilter(item.key)}
                    style={[styles.filter, selected && styles.filterSelected]}
                    testID={`filter-${item.key}`}
                  >
                    <Text style={[styles.filterText, selected && styles.filterTextSelected]}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {isLoading ? (
              <View style={styles.loading}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : visibleTasks.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Feather
                    name={filter === 'done' ? 'check-circle' : 'sun'}
                    size={22}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.emptyTitle}>
                  {filter === 'done'
                    ? 'Nothing checked off yet'
                    : filter === 'open' && tasks.length > 0
                      ? 'No open tasks'
                      : 'Your list is clear'}
                </Text>
                <Text style={styles.emptyText}>
                  {filter === 'done'
                    ? 'Finish a task and it will show up here.'
                    : filter === 'open' && tasks.length > 0
                      ? 'Enjoy the breathing room.'
                      : 'Add a task above when something comes to mind.'}
                </Text>
              </View>
            ) : (
              <View style={styles.taskList}>
                {visibleTasks.map((task, index) => (
                  <View
                    key={task.id}
                    style={[
                      styles.taskRow,
                      index === visibleTasks.length - 1 && styles.lastTaskRow,
                    ]}
                  >
                    <Pressable
                      accessibilityLabel={
                        task.completed
                          ? `Mark ${task.title} as not done`
                          : `Mark ${task.title} as done`
                      }
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: task.completed }}
                      onPress={() => toggleTask(task.id)}
                      style={({ pressed }) => [
                        styles.checkButton,
                        task.completed && styles.checkButtonDone,
                        pressed && styles.pressed,
                      ]}
                      testID={`toggle-task-${task.id}`}
                    >
                      {task.completed ? (
                        <Feather name="check" size={14} color={colors.primaryForeground} />
                      ) : null}
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Toggle completion for ${task.title}`}
                      onPress={() => toggleTask(task.id)}
                      style={styles.taskTextButton}
                    >
                      <Text
                        numberOfLines={3}
                        style={[styles.taskText, task.completed && styles.taskTextDone]}
                      >
                        {task.title}
                      </Text>
                    </Pressable>
                    <Pressable
                      accessibilityLabel={`Delete ${task.title}`}
                      accessibilityRole="button"
                      hitSlop={10}
                      onPress={() => deleteTask(task.id)}
                      style={({ pressed }) => [
                        styles.deleteButton,
                        pressed && styles.pressed,
                      ]}
                      testID={`delete-task-${task.id}`}
                    >
                      <Feather name="trash-2" size={17} color={colors.mutedForeground} />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            <Text style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 18) }]}>
              Saved on this device
            </Text>
          </ScrollView>
      </ControllerKeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(colors: ReturnType<typeof useColors>) {
  return StyleSheet.create({
    flex: { flex: 1 },
    safeArea: { flex: 1, backgroundColor: colors.background },
    content: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingTop: Platform.OS === 'web' ? 0 : 20,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 27,
    },
    date: {
      color: colors.primary,
      fontFamily: 'Inter_600SemiBold',
      fontSize: 12,
      letterSpacing: 1.25,
      textTransform: 'uppercase',
      marginBottom: 12,
    },
    title: {
      color: colors.foreground,
      fontFamily: 'Inter_700Bold',
      fontSize: 34,
      lineHeight: 39,
      letterSpacing: -1.2,
    },
    headerMark: {
      width: 42,
      height: 42,
      borderRadius: 15,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 3,
    },
    summary: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 20,
      padding: 17,
      marginBottom: 18,
    },
    summaryCopy: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      gap: 8,
      marginBottom: 14,
    },
    summaryTitle: {
      color: colors.foreground,
      fontFamily: 'Inter_600SemiBold',
      fontSize: 15,
    },
    summarySubtitle: {
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
      fontSize: 12,
    },
    progressTrack: {
      height: 6,
      overflow: 'hidden',
      borderRadius: 4,
      backgroundColor: colors.secondary,
    },
    progressFill: {
      height: '100%',
      borderRadius: 4,
      backgroundColor: colors.primary,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 29,
    },
    input: {
      flex: 1,
      minHeight: 54,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.input,
      paddingHorizontal: 17,
      color: colors.foreground,
      backgroundColor: colors.card,
      fontFamily: 'Inter_400Regular',
      fontSize: 15,
    },
    addButton: {
      width: 54,
      height: 54,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      borderRadius: 17,
    },
    addButtonDisabled: { opacity: 0.45 },
    pressed: { opacity: 0.75, transform: [{ scale: 0.97 }] },
    errorBox: {
      backgroundColor: colors.accent,
      borderRadius: 14,
      padding: 14,
      marginBottom: 20,
      gap: 8,
    },
    errorText: {
      color: colors.accentForeground,
      fontFamily: 'Inter_400Regular',
      fontSize: 13,
      lineHeight: 19,
    },
    retryButton: { alignSelf: 'flex-start', paddingVertical: 2 },
    retryText: {
      color: colors.primary,
      fontFamily: 'Inter_600SemiBold',
      fontSize: 13,
    },
    listHeader: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      marginBottom: 13,
    },
    listTitle: {
      color: colors.foreground,
      fontFamily: 'Inter_700Bold',
      fontSize: 20,
      letterSpacing: -0.4,
    },
    taskCount: {
      color: colors.mutedForeground,
      fontFamily: 'Inter_500Medium',
      fontSize: 12,
    },
    filters: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 12,
    },
    filter: {
      minHeight: 34,
      paddingHorizontal: 14,
      justifyContent: 'center',
      borderRadius: 12,
      backgroundColor: colors.secondary,
    },
    filterSelected: { backgroundColor: colors.primary },
    filterText: {
      color: colors.secondaryForeground,
      fontFamily: 'Inter_500Medium',
      fontSize: 12,
    },
    filterTextSelected: { color: colors.primaryForeground },
    taskList: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      paddingHorizontal: 16,
    },
    taskRow: {
      minHeight: 64,
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      gap: 12,
    },
    lastTaskRow: { borderBottomWidth: 0 },
    checkButton: {
      width: 23,
      height: 23,
      borderWidth: 1.5,
      borderColor: colors.primary,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkButtonDone: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    taskTextButton: { flex: 1, paddingVertical: 14 },
    taskText: {
      color: colors.foreground,
      fontFamily: 'Inter_500Medium',
      fontSize: 14,
      lineHeight: 20,
    },
    taskTextDone: {
      color: colors.mutedForeground,
      textDecorationLine: 'line-through',
    },
    deleteButton: {
      width: 34,
      height: 42,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loading: { paddingVertical: 38 },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 33,
      paddingHorizontal: 18,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
    },
    emptyIcon: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 15,
      backgroundColor: colors.secondary,
      marginBottom: 12,
    },
    emptyTitle: {
      color: colors.foreground,
      fontFamily: 'Inter_600SemiBold',
      fontSize: 15,
      marginBottom: 5,
    },
    emptyText: {
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
      fontSize: 13,
      lineHeight: 19,
      textAlign: 'center',
    },
    footer: {
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
      fontSize: 11,
      textAlign: 'center',
      paddingTop: 24,
    },
  });
}
