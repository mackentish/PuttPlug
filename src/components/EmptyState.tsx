import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Typography } from './Typography';

export function EmptyState({
    icon = 'golf-outline',
    title,
    body,
    action,
}: {
    icon?: React.ComponentProps<typeof Ionicons>['name'];
    title: string;
    body: string;
    action?: React.ReactNode;
}) {
    const colors = useColors();

    return (
        <View className="items-center gap-2 rounded-2xl border border-dashed border-border bg-surface-raised px-6 py-10">
            <Ionicons name={icon} size={32} color={colors['content-muted']} />
            <Typography variant="title" className="mt-1 text-center">
                {title}
            </Typography>
            <Typography variant="caption" className="text-center">
                {body}
            </Typography>
            {action ? <View className="mt-3 w-full">{action}</View> : null}
        </View>
    );
}
