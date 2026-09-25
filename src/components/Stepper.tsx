import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Typography } from './Typography';

/** −/+ control around a value. Used for the range, in feet. */
export function Stepper({
    value,
    suffix = '',
    onDecrement,
    onIncrement,
    canDecrement = true,
    canIncrement = true,
    accessibilityLabel,
}: {
    value: number | string;
    suffix?: string;
    onDecrement: () => void;
    onIncrement: () => void;
    canDecrement?: boolean;
    canIncrement?: boolean;
    accessibilityLabel?: string;
}) {
    const colors = useColors();

    return (
        <View
            className="flex-row items-center justify-between rounded-2xl border border-border bg-surface-sunken px-2 py-2"
            accessibilityLabel={accessibilityLabel}
        >
            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Decrease"
                disabled={!canDecrement}
                onPress={onDecrement}
                className={`h-12 w-12 items-center justify-center rounded-xl bg-surface-raised active:bg-primary-soft ${
                    canDecrement ? '' : 'opacity-30'
                }`}
            >
                <Ionicons name="remove" size={24} color={colors.content} />
            </Pressable>

            <Typography variant="h2">
                {value}
                {suffix ? (
                    <Typography variant="label"> {suffix}</Typography>
                ) : null}
            </Typography>

            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Increase"
                disabled={!canIncrement}
                onPress={onIncrement}
                className={`h-12 w-12 items-center justify-center rounded-xl bg-surface-raised active:bg-primary-soft ${
                    canIncrement ? '' : 'opacity-30'
                }`}
            >
                <Ionicons name="add" size={24} color={colors.content} />
            </Pressable>
        </View>
    );
}
