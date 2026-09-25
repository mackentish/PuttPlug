import React from 'react';
import { Pressable, Text } from 'react-native';

export function Chip({
    label,
    selected = false,
    onPress,
    className = '',
}: {
    label: string;
    selected?: boolean;
    onPress?: () => void;
    className?: string;
}) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={onPress}
            className={`rounded-full border px-4 py-2 ${
                selected
                    ? 'border-primary bg-primary'
                    : 'border-border bg-surface-sunken active:bg-primary-soft'
            } ${className}`}
        >
            <Text
                className={`text-sm font-semibold ${
                    selected ? 'text-content-invert' : 'text-content'
                }`}
            >
                {label}
            </Text>
        </Pressable>
    );
}
