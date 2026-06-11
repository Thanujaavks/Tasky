import React, { useState } from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';

interface DatePickerProps {
  label?: string;
  value: string; // YYYY-MM-DD or ''
  onChange: (date: string) => void;
  error?: string;
  placeholder?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function DatePicker({
  label,
  value,
  onChange,
  error,
  placeholder = 'Select a date',
}: DatePickerProps) {
  const today = new Date();
  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() =>
    value ? parseInt(value.split('-')[0]) : today.getFullYear()
  );
  const [viewMonth, setViewMonth] = useState(() =>
    value ? parseInt(value.split('-')[1]) - 1 : today.getMonth()
  );

  const prevMonth = () => {
    const d = new Date(viewYear, viewMonth - 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };
  const nextMonth = () => {
    const d = new Date(viewYear, viewMonth + 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const totalCells = Math.ceil((firstDayOfWeek + daysInMonth) / 7) * 7;
  const cells: (number | null)[] = Array.from({ length: totalCells }, (_, i) => {
    const day = i - firstDayOfWeek + 1;
    return day > 0 && day <= daysInMonth ? day : null;
  });
  const rows = totalCells / 7;

  const displayValue = value
    ? new Date(value + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const handleDayPress = (day: number) => {
    onChange(toDateStr(viewYear, viewMonth, day));
    setOpen(false);
  };

  const handleOpen = () => {
    if (value) {
      setViewYear(parseInt(value.split('-')[0]));
      setViewMonth(parseInt(value.split('-')[1]) - 1);
    }
    setOpen(true);
  };

  return (
    <View className="mb-4">
      {label && (
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
        </Text>
      )}

      <TouchableOpacity
        onPress={handleOpen}
        className={`flex-row items-center bg-white dark:bg-gray-800 border rounded-xl px-3 py-3 ${
          error ? 'border-red-400' : 'border-gray-200 dark:border-gray-600'
        }`}
      >
        <Text className="mr-2 text-base">📅</Text>
        <Text className={`flex-1 text-base ${value ? 'text-gray-900 dark:text-white' : 'text-[#9ca3af]'}`}>
          {displayValue || placeholder}
        </Text>
        {value ? (
          <TouchableOpacity
            onPress={() => onChange('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text className="text-gray-400 text-base">✕</Text>
          </TouchableOpacity>
        ) : (
          <Text className="text-gray-400 text-base">›</Text>
        )}
      </TouchableOpacity>

      {error && <Text className="text-xs text-red-500 mt-1">{error}</Text>}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}
          onPress={() => setOpen(false)}
        >
          {/* Inner press does nothing — stops backdrop close */}
          <Pressable onPress={() => {}}>
            <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-xl" style={{ width: 316 }}>

              {/* Month / year nav */}
              <View className="flex-row items-center justify-between mb-3">
                <TouchableOpacity onPress={prevMonth} className="px-3 py-1">
                  <Text className="text-blue-600 text-xl font-bold">‹</Text>
                </TouchableOpacity>
                <Text className="text-base font-bold text-gray-900 dark:text-white">
                  {MONTHS[viewMonth]} {viewYear}
                </Text>
                <TouchableOpacity onPress={nextMonth} className="px-3 py-1">
                  <Text className="text-blue-600 text-xl font-bold">›</Text>
                </TouchableOpacity>
              </View>

              {/* Day-of-week headers */}
              <View className="flex-row mb-1">
                {DAY_HEADERS.map(d => (
                  <View key={d} style={{ flex: 1 }} className="items-center py-1">
                    <Text className="text-xs font-semibold text-gray-400">{d}</Text>
                  </View>
                ))}
              </View>

              {/* Calendar grid */}
              {Array.from({ length: rows }, (_, row) => (
                <View key={row} className="flex-row">
                  {cells.slice(row * 7, row * 7 + 7).map((day, col) => {
                    if (day === null) {
                      return <View key={col} style={{ flex: 1 }} className="py-2" />;
                    }
                    const dateStr = toDateStr(viewYear, viewMonth, day);
                    const isSelected = dateStr === value;
                    const isToday = dateStr === todayStr;
                    return (
                      <TouchableOpacity
                        key={col}
                        onPress={() => handleDayPress(day)}
                        style={{ flex: 1 }}
                        className={`items-center py-2 mx-0.5 rounded-full ${
                          isSelected
                            ? 'bg-blue-600'
                            : isToday
                            ? 'bg-blue-50 dark:bg-blue-900/30'
                            : ''
                        }`}
                      >
                        <Text
                          className={`text-sm font-medium ${
                            isSelected
                              ? 'text-white'
                              : isToday
                              ? 'text-blue-600'
                              : 'text-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {day}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}

              {/* Footer */}
              <TouchableOpacity
                onPress={() => setOpen(false)}
                className="mt-3 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 items-center"
              >
                <Text className="text-sm font-semibold text-gray-600 dark:text-gray-300">Cancel</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
