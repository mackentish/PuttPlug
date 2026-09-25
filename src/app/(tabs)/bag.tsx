import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@/components/Button';
import { describeDisc } from '@/components/DiscPicker';
import { EmptyState } from '@/components/EmptyState';
import { Screen } from '@/components/Screen';
import { Typography } from '@/components/Typography';
import { useColors } from '@/hooks/useColors';
import { useActiveDiscs, useCompletedSessions } from '@/hooks/useData';
import { formatPct, tallyForDisc } from '@/lib/stats';

export default function BagScreen() {
    const discs = useActiveDiscs();
    const sessions = useCompletedSessions();
    const colors = useColors();

    return (
        <Screen
            title="Bag"
            subtitle={
                discs.length
                    ? `${discs.length} ${discs.length === 1 ? 'disc' : 'discs'}`
                    : undefined
            }
            right={
                <Button
                    onPress={() => router.push('/disc/new')}
                    icon={
                        <Ionicons
                            name="add"
                            size={18}
                            color={colors['content-invert']}
                        />
                    }
                >
                    Add
                </Button>
            }
        >
            {discs.length === 0 ? (
                <EmptyState
                    icon="disc-outline"
                    title="Your bag is empty"
                    body="Add a disc with just a name — flight numbers, plastic and weight are all optional and can wait."
                    action={
                        <Button onPress={() => router.push('/disc/new')}>
                            Add a disc
                        </Button>
                    }
                />
            ) : (
                <View className="gap-3">
                    {discs.map((disc) => {
                        const tally = tallyForDisc(sessions, disc.id);
                        const details = describeDisc(disc);

                        return (
                            <Link
                                key={disc.id}
                                href={`/disc/${disc.id}`}
                                asChild
                            >
                                <Pressable className="flex-row items-center justify-between gap-3 rounded-2xl border border-border bg-surface-raised p-4 active:bg-surface-sunken">
                                    <View className="shrink">
                                        <Typography variant="title">
                                            {disc.name}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            className="mt-0.5"
                                        >
                                            {details || 'No details yet'}
                                        </Typography>
                                    </View>

                                    <View className="flex-row items-center gap-2">
                                        <View className="items-end">
                                            <Typography variant="title">
                                                {tally.pct === null
                                                    ? '—'
                                                    : formatPct(tally.pct)}
                                            </Typography>
                                            <Typography variant="caption">
                                                {tally.attempts === 0
                                                    ? 'no putts'
                                                    : `${tally.attempts} putts`}
                                            </Typography>
                                        </View>
                                        <Ionicons
                                            name="chevron-forward"
                                            size={18}
                                            color={colors['content-muted']}
                                        />
                                    </View>
                                </Pressable>
                            </Link>
                        );
                    })}
                </View>
            )}
        </Screen>
    );
}
