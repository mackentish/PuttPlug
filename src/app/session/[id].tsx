import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Alert, View } from 'react-native';
import { Button } from '@/components/Button';
import { MissSummary } from '@/components/MissSummary';
import { PercentBar } from '@/components/PercentBar';
import { Screen } from '@/components/Screen';
import { Typography } from '@/components/Typography';
import { useColors } from '@/hooks/useColors';
import { useData } from '@/hooks/useData';
import {
    formatDuration,
    formatSessionDate,
    formatSessionTime,
} from '@/lib/format';
import {
    CIRCLES,
    formatPct,
    sessionTotals,
    tallyAllCircles,
    tallyMissMap,
    tallyStations,
} from '@/lib/stats';

export default function SessionDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { sessionById, discById, deleteSession } = useData();
    const colors = useColors();

    const session = sessionById(id);

    if (!session) {
        return (
            <Screen title="Session not found">
                <Typography variant="body">
                    This session is no longer saved on this device.
                </Typography>
                <Button className="mt-4" onPress={() => router.replace('/')}>
                    Back to dashboard
                </Button>
            </Screen>
        );
    }

    const totals = sessionTotals(session);
    const circles = tallyAllCircles(session.stations);
    const missMap = tallyMissMap(session.stations);
    const duration = formatDuration(session.startedAt, session.endedAt);

    function confirmDelete() {
        Alert.alert(
            'Delete this session?',
            'The putts logged in it will be removed from your stats. This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteSession(session!.id);
                        router.replace('/sessions');
                    },
                },
            ]
        );
    }

    return (
        <Screen
            title={formatSessionDate(session.startedAt)}
            subtitle={[formatSessionTime(session.startedAt), duration]
                .filter(Boolean)
                .join(' · ')}
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
            {/* --- headline --------------------------------------------- */}
            <View className="rounded-2xl border border-border bg-surface-raised p-4">
                <View className="flex-row items-end justify-between">
                    <Typography variant="label">Session total</Typography>
                    <Typography variant="h1">
                        {totals.pct === null ? '—' : formatPct(totals.pct)}
                    </Typography>
                </View>
                <PercentBar pct={totals.pct} className="mt-3" />
                <Typography variant="caption" className="mt-2">
                    {totals.makes} of {totals.attempts} made across{' '}
                    {session.stations.length}{' '}
                    {session.stations.length === 1 ? 'range' : 'ranges'}
                </Typography>
            </View>

            {/* --- by circle -------------------------------------------- */}
            <Typography variant="h3" className="mb-2 mt-6">
                By circle
            </Typography>
            <View className="overflow-hidden rounded-2xl border border-border">
                {CIRCLES.map((circle, index) => {
                    const tally = circles[circle.key];
                    return (
                        <View
                            key={circle.key}
                            className={`flex-row items-center justify-between bg-surface-raised px-4 py-3 ${
                                index > 0 ? 'border-t border-border' : ''
                            }`}
                        >
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
                                    {tally.pct === null
                                        ? '—'
                                        : formatPct(tally.pct)}
                                </Typography>
                                <Typography variant="caption">
                                    {tally.attempts === 0
                                        ? 'not attempted'
                                        : `${tally.makes}/${tally.attempts}`}
                                </Typography>
                            </View>
                        </View>
                    );
                })}
            </View>

            {/* --- by range --------------------------------------------- */}
            <Typography variant="h3" className="mb-2 mt-6">
                By range
            </Typography>
            <View className="overflow-hidden rounded-2xl border border-border">
                {session.stations.map((station, index) => {
                    const tally = tallyStations([station]);
                    return (
                        <View
                            key={station.id}
                            className={`flex-row items-center justify-between bg-surface-raised px-4 py-3 ${
                                index > 0 ? 'border-t border-border' : ''
                            }`}
                        >
                            <View>
                                <Typography variant="title">
                                    {station.distanceFt} ft
                                </Typography>
                                <Typography variant="caption">
                                    {discById(station.discId)?.name ??
                                        'Unknown putter'}
                                </Typography>
                            </View>
                            <View className="items-end">
                                <Typography variant="h3">
                                    {tally.pct === null
                                        ? '—'
                                        : formatPct(tally.pct)}
                                </Typography>
                                <Typography variant="caption">
                                    {tally.makes}/{tally.attempts}
                                </Typography>
                            </View>
                        </View>
                    );
                })}
            </View>

            {missMap.total > 0 ? (
                <View className="mt-6">
                    <MissSummary tally={missMap} title="Misses this session" />
                </View>
            ) : null}

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
                Delete session
            </Button>
        </Screen>
    );
}
