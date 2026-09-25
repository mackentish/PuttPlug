import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

/**
 * A big make/miss target with its own −/+ underneath.
 *
 * The main face is oversized because it gets tapped with one thumb, outdoors,
 * between throws. The small −/+ row exists so a miscount can be fixed in place
 * rather than abandoning the station.
 */
export function CounterButton({
    label,
    count,
    tone,
    onPress,
    onIncrement,
    onDecrement,
}: {
    label: string;
    count: number;
    tone: 'success' | 'danger';
    onPress: () => void;
    onIncrement: () => void;
    onDecrement: () => void;
}) {
    const colors = useColors();

    const faceClass =
        tone === 'success'
            ? 'bg-success active:bg-success/80'
            : 'bg-danger active:bg-danger/80';

    return (
        <View className="flex-1">
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Add ${label.toLowerCase()}`}
                onPress={onPress}
                className={`items-center justify-center rounded-t-2xl py-7 ${faceClass}`}
            >
                <Text className="text-sm font-bold uppercase tracking-wider text-content-invert">
                    {label}
                </Text>
                <Text className="mt-1 text-5xl font-bold text-content-invert">
                    {count}
                </Text>
            </Pressable>

            <View className="flex-row rounded-b-2xl border-x border-b border-border bg-surface-sunken">
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Remove one ${label.toLowerCase()}`}
                    disabled={count === 0}
                    onPress={onDecrement}
                    className={`flex-1 items-center py-3 active:bg-surface-raised ${
                        count === 0 ? 'opacity-30' : ''
                    }`}
                >
                    <Ionicons name="remove" size={20} color={colors.content} />
                </Pressable>

                <View className="w-px bg-border" />

                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Add one ${label.toLowerCase()}`}
                    onPress={onIncrement}
                    className="flex-1 items-center py-3 active:bg-surface-raised"
                >
                    <Ionicons name="add" size={20} color={colors.content} />
                </Pressable>
            </View>
        </View>
    );
}
