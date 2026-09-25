import React from 'react';
import { View, type ViewProps } from 'react-native';

export function Card({
    className = '',
    children,
    ...props
}: ViewProps & { className?: string; children: React.ReactNode }) {
    return (
        <View
            className={`rounded-2xl border border-border bg-surface-raised p-4 ${className}`}
            {...props}
        >
            {children}
        </View>
    );
}
