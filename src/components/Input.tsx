import React from 'react';
import { TextInput, type TextInputProps, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Typography } from './Typography';

interface InputProps extends Omit<TextInputProps, 'style' | 'className'> {
    label?: string;
    /** Rendered under the field in muted text — used for "optional" hints. */
    hint?: string;
    error?: string;
    className?: string;
}

export function Input({
    label,
    hint,
    error,
    className = '',
    ...props
}: InputProps) {
    const colors = useColors();

    return (
        <View className={className}>
            {label ? (
                <Typography variant="label" className="mb-1.5">
                    {label}
                </Typography>
            ) : null}

            <TextInput
                autoComplete="off"
                autoCorrect={false}
                // No Tailwind equivalent in React Native, so it reads the
                // resolved palette directly.
                placeholderTextColor={colors['content-muted']}
                className={`rounded-xl border bg-surface-sunken px-4 py-3.5 text-base text-content ${
                    error ? 'border-danger' : 'border-border'
                }`}
                {...props}
            />

            {error ? (
                <Typography variant="caption" className="mt-1.5 text-danger">
                    {error}
                </Typography>
            ) : hint ? (
                <Typography variant="caption" className="mt-1.5">
                    {hint}
                </Typography>
            ) : null}
        </View>
    );
}
