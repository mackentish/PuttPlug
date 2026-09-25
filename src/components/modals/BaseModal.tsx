import React from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    View,
    useWindowDimensions,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { varsForTheme } from '@/styles/themeVars';
import { Typography } from '../Typography';

/*
    A React Native `Modal` renders into its own host view, OUTSIDE this
    component's place in the tree -- so the CSS variables set on the themed
    root in `src/app/_layout.tsx` do not reach it. They have to be applied
    again here, or every colour class inside the sheet resolves against
    undefined variables.
*/

export function BaseModal({
    visible,
    onClose,
    title,
    children,
}: {
    visible: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}) {
    const { palette, resolvedMode } = useTheme();
    const { height } = useWindowDimensions();

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View
                style={varsForTheme(palette, resolvedMode)}
                className="flex-1 justify-end"
            >
                <Pressable
                    accessibilityLabel="Close"
                    onPress={onClose}
                    className="absolute inset-0 bg-overlay/60"
                />

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    pointerEvents="box-none"
                >
                    {/* Capped in pixels rather than with `max-h-[85%]`: the
                        KeyboardAvoidingView above sizes to its content, so a
                        percentage would have no height to resolve against. */}
                    <View
                        style={{ maxHeight: height * 0.85 }}
                        className="rounded-t-3xl border-t border-border bg-surface pb-8 pt-3"
                    >
                        {/* Grabber, so the sheet reads as dismissible. */}
                        <View className="mb-2 h-1 w-10 self-center rounded-full bg-border" />

                        {title ? (
                            <Typography variant="h3" className="px-5 pb-2 pt-1">
                                {title}
                            </Typography>
                        ) : null}

                        <ScrollView
                            contentContainerClassName="px-5 pb-2"
                            keyboardShouldPersistTaps="handled"
                        >
                            {children}
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}
