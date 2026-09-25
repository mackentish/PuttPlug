import React from 'react';
import { Pressable, Text, View } from 'react-native';

export type Segment<T> = { value: T; label: string };

/** Single-select pill row. Used for the dashboard time window, the history
 *  list/calendar switch and the sort order. */
export function SegmentedControl<T extends string | number | null>({
    segments,
    value,
    onChange,
    className = '',
}: {
    segments: Segment<T>[];
    value: T;
    onChange: (value: T) => void;
    className?: string;
}) {
    return (
        <View
            className={`flex-row rounded-2xl border border-border bg-surface-sunken p-1 ${className}`}
        >
            {segments.map((segment) => {
                const selected = segment.value === value;
                return (
                    <Pressable
                        key={String(segment.value)}
                        accessibilityRole="tab"
                        accessibilityState={{ selected }}
                        onPress={() => onChange(segment.value)}
                        className={`flex-1 items-center rounded-xl py-2 ${
                            selected ? 'bg-primary' : ''
                        }`}
                    >
                        <Text
                            className={`text-sm font-semibold ${
                                selected
                                    ? 'text-content-invert'
                                    : 'text-content-muted'
                            }`}
                        >
                            {segment.label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}
