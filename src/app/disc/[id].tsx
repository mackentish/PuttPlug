import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { PercentBar } from '@/components/PercentBar';
import { Screen } from '@/components/Screen';
import { Typography } from '@/components/Typography';
import { useColors } from '@/hooks/useColors';
import { useCompletedSessions, useData } from '@/hooks/useData';
import { CIRCLES, circlesForDisc, formatPct, tallyForDisc } from '@/lib/stats';

/**
 * Add or edit a disc.
 *
 * Only the name is required. Every other field parses to `undefined` when left
 * blank rather than defaulting to 0 — a blank turn is "not recorded", and a
 * turn of 0 is a real and very different flight number.
 */
export default function DiscScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const isNew = id === 'new';

    const { discById, addDisc, updateDisc, deleteDisc } = useData();
    const sessions = useCompletedSessions();
    const colors = useColors();

    const existing = isNew ? undefined : discById(id);

    const [name, setName] = useState(existing?.name ?? '');
    const [plastic, setPlastic] = useState(existing?.plastic ?? '');
    const [weight, setWeight] = useState(
        existing?.weightG !== undefined ? String(existing.weightG) : ''
    );
    const [speed, setSpeed] = useState(numToText(existing?.speed));
    const [glide, setGlide] = useState(numToText(existing?.glide));
    const [turn, setTurn] = useState(numToText(existing?.turn));
    const [fade, setFade] = useState(numToText(existing?.fade));
    const [error, setError] = useState<string | undefined>();

    if (!isNew && !existing) {
        return (
            <Screen title="Disc not found">
                <Typography variant="body">
                    This disc is no longer in your bag.
                </Typography>
                <Button className="mt-4" onPress={() => router.replace('/bag')}>
                    Back to bag
                </Button>
            </Screen>
        );
    }

    async function save() {
        const trimmed = name.trim();
        if (!trimmed) {
            setError('A name is required.');
            return;
        }

        const patch = {
            name: trimmed,
            plastic: plastic.trim() || undefined,
            weightG: textToNum(weight),
            speed: textToNum(speed),
            glide: textToNum(glide),
            turn: textToNum(turn),
            fade: textToNum(fade),
        };

        if (isNew) {
            await addDisc(patch);
        } else {
            await updateDisc(id, patch);
        }
        router.back();
    }

    function confirmDelete() {
        Alert.alert(
            `Remove ${existing?.name}?`,
            'Sessions you threw it in keep their data — the disc just stops showing up in your bag.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteDisc(id);
                        router.replace('/bag');
                    },
                },
            ]
        );
    }

    const tally = existing
        ? tallyForDisc(sessions, existing.id)
        : { makes: 0, attempts: 0, pct: null };
    const circles = existing ? circlesForDisc(sessions, existing.id) : null;

    return (
        <Screen
            title={isNew ? 'Add a disc' : (existing?.name ?? 'Disc')}
            subtitle={isNew ? 'Only the name is required' : undefined}
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
            <View className="gap-4">
                <Input
                    label="Name"
                    placeholder="e.g. Judge"
                    value={name}
                    error={error}
                    autoFocus={isNew}
                    onChangeText={(text) => {
                        setName(text);
                        if (error) setError(undefined);
                    }}
                />

                <View className="flex-row gap-3">
                    <Input
                        label="Plastic"
                        placeholder="Optional"
                        className="flex-1"
                        value={plastic}
                        onChangeText={setPlastic}
                    />
                    <Input
                        label="Weight (g)"
                        placeholder="Optional"
                        className="flex-1"
                        keyboardType="number-pad"
                        value={weight}
                        onChangeText={setWeight}
                    />
                </View>

                <View>
                    <Typography variant="label" className="mb-1.5">
                        Flight numbers
                    </Typography>
                    <View className="flex-row gap-2">
                        {(
                            [
                                ['Speed', speed, setSpeed],
                                ['Glide', glide, setGlide],
                                ['Turn', turn, setTurn],
                                ['Fade', fade, setFade],
                            ] as const
                        ).map(([label, value, setValue]) => (
                            <Input
                                key={label}
                                className="flex-1"
                                placeholder={label}
                                // Turn is routinely negative, so this can't be
                                // a plain number pad on iOS.
                                keyboardType="numbers-and-punctuation"
                                value={value}
                                onChangeText={setValue}
                            />
                        ))}
                    </View>
                    <Typography variant="caption" className="mt-1.5">
                        All optional. Leave blank if you don&apos;t know them.
                    </Typography>
                </View>

                <Button size="lg" onPress={save}>
                    {isNew ? 'Add to bag' : 'Save changes'}
                </Button>
            </View>

            {/* --- performance ------------------------------------------ */}
            {existing && circles ? (
                <>
                    <Typography variant="h3" className="mb-2 mt-8">
                        Putting with this disc
                    </Typography>

                    {tally.attempts === 0 ? (
                        <Typography variant="caption">
                            No putts logged with this disc yet. Pick it when you
                            start a session and its numbers will show up here.
                        </Typography>
                    ) : (
                        <View className="overflow-hidden rounded-2xl border border-border">
                            {CIRCLES.map((circle, index) => {
                                const circleTally = circles[circle.key];
                                return (
                                    <View
                                        key={circle.key}
                                        className={`bg-surface-raised px-4 py-3 ${
                                            index > 0
                                                ? 'border-t border-border'
                                                : ''
                                        }`}
                                    >
                                        <View className="flex-row items-center justify-between">
                                            <View className="shrink">
                                                <Typography variant="title">
                                                    {circle.label}
                                                </Typography>
                                                <Typography variant="caption">
                                                    {circle.description}
                                                </Typography>
                                            </View>
                                            <View className="items-end">
                                                <Typography variant="h3">
                                                    {circleTally.pct === null
                                                        ? '—'
                                                        : formatPct(
                                                              circleTally.pct
                                                          )}
                                                </Typography>
                                                <Typography variant="caption">
                                                    {circleTally.attempts === 0
                                                        ? 'not attempted'
                                                        : `${circleTally.makes}/${circleTally.attempts}`}
                                                </Typography>
                                            </View>
                                        </View>
                                        <PercentBar
                                            pct={circleTally.pct}
                                            className="mt-2"
                                        />
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    <Button
                        variant="danger"
                        className="mt-8"
                        onPress={confirmDelete}
                        icon={
                            <Ionicons
                                name="trash-outline"
                                size={16}
                                color={colors.danger}
                            />
                        }
                    >
                        Remove from bag
                    </Button>
                </>
            ) : null}
        </Screen>
    );
}

function numToText(value: number | undefined): string {
    return value === undefined ? '' : String(value);
}

/** Blank stays blank. `0` and `-1` are real flight numbers and must survive. */
function textToNum(text: string): number | undefined {
    const trimmed = text.trim();
    if (!trimmed) return undefined;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : undefined;
}
