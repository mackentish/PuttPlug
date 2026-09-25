import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from './Typography';

/**
 * Standard screen chrome: themed background, safe-area padding, optional
 * title block, and a content column capped for tablets.
 *
 * The background is repeated here rather than relying solely on the themed
 * root in `_layout`, because each navigator renders its screens inside its own
 * opaque scene container.
 */
export function Screen({
    title,
    subtitle,
    right,
    scroll = true,
    className = '',
    children,
}: {
    title?: string;
    subtitle?: string;
    right?: React.ReactNode;
    scroll?: boolean;
    className?: string;
    children: React.ReactNode;
}) {
    const insets = useSafeAreaInsets();

    const header = title ? (
        <View className="mb-5 flex-row items-end justify-between gap-3">
            <View className="shrink">
                <Typography variant="h1">{title}</Typography>
                {subtitle ? (
                    <Typography variant="label" className="mt-1">
                        {subtitle}
                    </Typography>
                ) : null}
            </View>
            {right}
        </View>
    ) : null;

    const body = (
        <View className={`w-full max-w-2xl self-center ${className}`}>
            {header}
            {children}
        </View>
    );

    if (!scroll) {
        return (
            <View
                className="flex-1 bg-surface px-4"
                style={{ paddingTop: insets.top + 8 }}
            >
                {body}
            </View>
        );
    }

    return (
        <ScrollView
            className="flex-1 bg-surface"
            // Everything in one prop: NativeWind compiles
            // `contentContainerClassName` down into `contentContainerStyle`,
            // so setting both risks one silently winning over the other.
            contentContainerStyle={{
                paddingTop: insets.top + 8,
                paddingBottom: insets.bottom + 32,
                paddingHorizontal: 16,
            }}
            keyboardShouldPersistTaps="handled"
        >
            {body}
        </ScrollView>
    );
}
