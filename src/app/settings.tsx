import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Alert, Pressable, View } from 'react-native';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { SegmentedControl } from '@/components/SegmentedControl';
import { Typography } from '@/components/Typography';
import { useColors } from '@/hooks/useColors';
import { useData } from '@/hooks/useData';
import { type ModePreference, useTheme } from '@/hooks/useTheme';
import { buildSeedData } from '@/lib/seed';
import {
    type PaletteName,
    paletteLabels,
    paletteNames,
    paletteSwatch,
} from '@/styles/themeVars';

const MODES: { value: ModePreference; label: string }[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' },
];

export default function SettingsScreen() {
    const { palette, setPalette, mode, setMode } = useTheme();
    const { sessions, discs, replaceAll } = useData();
    const colors = useColors();

    function confirmClear() {
        Alert.alert(
            'Erase all data?',
            'Every session and disc on this device will be deleted. There is no backup — this app never sends anything anywhere.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Erase',
                    style: 'destructive',
                    onPress: () => void replaceAll({ discs: [], sessions: [] }),
                },
            ]
        );
    }

    return (
        <Screen
            title="Settings"
            right={
                <Button
                    variant="ghost"
                    onPress={() => router.back()}
                    icon={
                        <Ionicons
                            name="chevron-back"
                            size={16}
                            color={colors.content}
                        />
                    }
                >
                    Back
                </Button>
            }
        >
            <Typography variant="h3" className="mb-2">
                Appearance
            </Typography>

            <SegmentedControl
                segments={MODES}
                value={mode}
                onChange={setMode}
                className="mb-4"
            />

            <Typography variant="label" className="mb-2">
                Colour scheme
            </Typography>
            <View className="flex-row gap-3">
                {paletteNames.map((name: PaletteName) => {
                    const selected = name === palette;
                    return (
                        <Pressable
                            key={name}
                            accessibilityRole="radio"
                            accessibilityState={{ selected }}
                            accessibilityLabel={paletteLabels[name]}
                            onPress={() => setPalette(name)}
                            className={`flex-1 items-center gap-2 rounded-2xl border p-3 ${
                                selected
                                    ? 'border-primary bg-primary-soft'
                                    : 'border-border bg-surface-raised'
                            }`}
                        >
                            <View
                                className="h-8 w-8 rounded-full"
                                style={{
                                    backgroundColor: paletteSwatch(name),
                                }}
                            />
                            <Typography variant="caption">
                                {paletteLabels[name]}
                            </Typography>
                        </Pressable>
                    );
                })}
            </View>

            <Typography variant="h3" className="mb-2 mt-8">
                Your data
            </Typography>
            <Typography variant="caption">
                {sessions.length}{' '}
                {sessions.length === 1 ? 'session' : 'sessions'} and{' '}
                {discs.length} {discs.length === 1 ? 'disc' : 'discs'}, stored
                only on this phone. PuttPlug has no account and never uses the
                network.
            </Typography>

            <Button
                variant="danger"
                className="mt-4"
                onPress={confirmClear}
                icon={
                    <Ionicons
                        name="trash-outline"
                        size={16}
                        color={colors.danger}
                    />
                }
            >
                Erase all data
            </Button>

            {/* Development affordance only — never shipped in a release build. */}
            {__DEV__ ? (
                <View className="mt-10 rounded-2xl border border-dashed border-border p-4">
                    <Typography variant="label">Developer</Typography>
                    <Typography variant="caption" className="mb-3 mt-1">
                        Replaces everything with eight weeks of generated
                        practice, for checking the dashboard, calendar and heat
                        map without logging it all by hand.
                    </Typography>
                    <Button
                        variant="ghost"
                        onPress={() => void replaceAll(buildSeedData())}
                    >
                        Seed demo data
                    </Button>
                </View>
            ) : null}
        </Screen>
    );
}
