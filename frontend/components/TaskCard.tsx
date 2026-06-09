import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Badge } from './ui/Badge';
import { Task } from '@/types';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
  showAssignee?: boolean;
}

const priorityBorder: Record<string, string> = {
  high: 'border-l-4 border-l-red-500',
  medium: 'border-l-4 border-l-orange-400',
  low: 'border-l-4 border-l-gray-300',
};

export function TaskCard({ task, onPress, showAssignee = false }: TaskCardProps) {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm mb-3 overflow-hidden ${priorityBorder[task.priority]}`}
      activeOpacity={0.7}
    >
      <View className="p-4">
        <View className="flex-row items-start justify-between mb-2">
          <Text className="text-base font-semibold text-gray-900 dark:text-white flex-1 mr-2" numberOfLines={2}>
            {task.title}
          </Text>
          <Badge variant={task.status} />
        </View>

        {task.description ? (
          <Text className="text-sm text-gray-500 dark:text-gray-400 mb-3" numberOfLines={2}>
            {task.description}
          </Text>
        ) : null}

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <Badge variant={task.priority} />
            {showAssignee && task.assigned_to_name ? (
              <View className="flex-row items-center bg-gray-100 dark:bg-gray-700 rounded-full px-2.5 py-0.5">
                <Text className="text-xs text-gray-600 dark:text-gray-300">👤 {task.assigned_to_name}</Text>
              </View>
            ) : null}
          </View>

          {task.due_date ? (
            <Text className={`text-xs font-medium ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
              {isOverdue ? '⚠️ ' : '📅 '}
              {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}
