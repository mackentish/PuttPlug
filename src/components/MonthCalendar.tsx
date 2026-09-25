import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { localDayKey } from '@/lib/format';
import { Typography } from './Typography';

/*
    A hand-rolled month grid rather than a calendar dependency.

    Two reasons: every colour here resolves through the app's own theme tokens
    with no wrestling against a library's theme prop, and the only features
    needed are "which days have sessions" and "let me tap one" -- which is
    about forty lines of Date maths.
*/

export type DayMark = {
    /** How many sessions that day. */
    sessions: number;
    /** Total putts that day, used to weight the dot. */
    attempts: number;
};

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function startOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, delta: number): Date {
    return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

export function MonthCalendar({
    month,
    onChangeMonth,
    marks,
    selectedDay,
    onSelectDay,
}: {
    /** Any date within the month being shown. */
    month: Date;
    onChangeMonth: (month: Date) => void;
    /** Keyed by `localDayKey`. */
    marks: Record<string, DayMark>;
    selectedDay: string | null;
    onSelectDay: (day: string | null) => void;
}) {
    const colors = useColors();
    const todayKey = localDayKey(new Date());

    /*
        Six rows of seven always, padded with the neighbouring months' days, so
        the grid doesn't change height as the user pages through and shift the
        list underneath it.
    */
    const cells = useMemo(() => {
        const first = startOfMonth(month);
        const gridStart = new Date(first);
        gridStart.setDate(1 - first.getDay());

        return Array.from({ length: 42 }, (_, i) => {
            const date = new Date(
                gridStart.getFullYear(),
                gridStart.getMonth(),
                gridStart.getDate() + i
            );
            return {
                date,
                key: localDayKey(date),
                inMonth: date.getMonth() === month.getMonth(),
            };
        });
    }, [month]);

    // Busiest day this month sets the scale, so the dots are relative to how
    // much the user actually putts rather than an arbitrary constant.
    const busiest = useMemo(
        () =>
            Math.max(
                1,
                ...cells
                    .filter((c) => c.inMonth)
                    .map((c) => marks[c.key]?.attempts ?? 0)
            ),
        [cells, marks]
    );

    const monthLabel = month.toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
    });

    return (
        <View className="rounded-2xl border border-border bg-surface-raised p-3">
            <View className="mb-2 flex-row items-center justify-between">
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Previous month"
                    onPress={() => onChangeMonth(addMonths(month, -1))}
                    className="h-10 w-10 items-center justify-center rounded-xl active:bg-surface-sunken"
                >
                    <Ionicons
                        name="chevron-back"
                        size={20}
                        color={colors.content}
                    />
                </Pressable>

                <Typography variant="title">{monthLabel}</Typography>

                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Next month"
                    onPress={() => onChangeMonth(addMonths(month, 1))}
                    className="h-10 w-10 items-center justify-center rounded-xl active:bg-surface-sunken"
                >
                    <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={colors.content}
                    />
                </Pressable>
            </View>

            <View className="flex-row">
                {WEEKDAYS.map((day, i) => (
                    <View key={i} className="flex-1 items-center py-1">
                        <Typography variant="caption">{day}</Typography>
                    </View>
                ))}
            </View>

            <View className="flex-row flex-wrap">
                {cells.map((cell) => {
                    const mark = cell.inMonth ? marks[cell.key] : undefined;
                    const isToday = cell.key === todayKey;
                    const isSelected = cell.key === selectedDay;

                    return (
                        <Pressable
                            key={cell.key}
                            accessibilityRole="button"
                            accessibilityLabel={cell.date.toDateString()}
                            accessibilityState={{ selected: isSelected }}
                            disabled={!mark}
                            onPress={() =>
                                onSelectDay(isSelected ? null : cell.key)
                            }
                            className={`h-11 items-center justify-center rounded-xl ${
                                isSelected ? 'bg-primary' : ''
                            } ${isToday && !isSelected ? 'border border-primary' : ''}`}
                            style={{ width: `${100 / 7}%` }}
                        >
                            <Typography
                                variant="caption"
                                className={
                                    isSelected
                                        ? 'text-content-invert'
                                        : cell.inMonth
                                          ? 'text-content'
                                          : 'text-content-muted opacity-40'
                                }
                            >
                                {cell.date.getDate()}
                            </Typography>

                            <View className="mt-0.5 h-1.5">
                                {mark ? (
                                    <View
                                        className="h-1.5 w-1.5 rounded-full"
                                        style={{
                                            backgroundColor: isSelected
                                                ? colors['content-invert']
                                                : colors.primary,
                                            // Heavier practice days read
                                            // stronger, but never invisible.
                                            opacity:
                                                0.4 +
                                                0.6 * (mark.attempts / busiest),
                                        }}
                                    />
                                ) : null}
                            </View>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}
