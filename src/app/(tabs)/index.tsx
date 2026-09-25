import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { MissSummary } from '@/components/MissSummary';
import { Screen } from '@/components/Screen';
import { SegmentedControl } from '@/components/SegmentedControl';
import { SessionRow } from '@/components/SessionRow';
import { StatCard } from '@/components/StatCard';
import { Typography } from '@/components/Typography';
import { StartSessionModal } from '@/components/modals/StartSessionModal';
import { useColors } from '@/hooks/useColors';
import { useCompletedSessions, useData } from '@/hooks/useData';
import {
    CIRCLES,
    WINDOW_OPTIONS,
    type WindowDays,
    allStations,
    delta,
    sessionsInPreviousWindow,
    sessionsInWindow,
    tallyAllCircles,
    tallyMissMap,
} from '@/lib/stats';

export default function DashboardScreen() {
    const colors = useColors();
    const sessions = useCompletedSessions();
    const { activeSessionId } = useData();

    const [window, setWindow] = useState<WindowDays>(30);
    const [starting, setStarting] = useState(false);

    const { circles, deltas, missMap, windowSessions } = useMemo(() => {
        const current = sessionsInWindow(sessions, window);
        const previous = sessionsInPreviousWindow(sessions, window);

        const currentCircles = tallyAllCircles(allStations(current));
        const previousCircles = tallyAllCircles(allStations(previous));

        return {
            windowSessions: current,
            circles: currentCircles,
            deltas: Object.fromEntries(
                CIRCLES.map((circle) => [
                    circle.key,
                    delta(
                        currentCircles[circle.key],
                        previousCircles[circle.key]
                    ),
                ])
            ),
            missMap: tallyMissMap(allStations(current)),
        };
    }, [sessions, window]);

    const hasAnyData = sessions.length > 0;

    return (
        <Screen
            title="PuttPlug"
            subtitle={
                hasAnyData
                    ? `${sessions.length} ${sessions.length === 1 ? 'session' : 'sessions'} logged`
                    : 'Track your putting, offline'
            }
            right={
                <Link href="/settings" asChild>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Settings"
                        className="h-10 w-10 items-center justify-center rounded-xl active:bg-surface-sunken"
                    >
                        <Ionicons
                            name="settings-outline"
                            size={22}
                            color={colors['content-muted']}
                        />
                    </Pressable>
                </Link>
            }
        >
            {activeSessionId ? (
                <Button
                    size="lg"
                    className="mb-4"
                    onPress={() => router.push('/session/active')}
                    icon={
                        <Ionicons
                            name="play"
                            size={20}
                            color={colors['content-invert']}
                        />
                    }
                >
                    Resume session
                </Button>
            ) : (
                <Button
                    size="lg"
                    className="mb-4"
                    onPress={() => setStarting(true)}
                    icon={
                        <Ionicons
                            name="golf"
                            size={20}
                            color={colors['content-invert']}
                        />
                    }
                >
                    Start putting session
                </Button>
            )}

            {!hasAnyData ? (
                <EmptyState
                    title="No putts logged yet"
                    body="Start a session, pick a range, and tap makes and misses as you throw. Your percentages will show up here."
                />
            ) : (
                <>
                    <SegmentedControl
                        segments={WINDOW_OPTIONS}
                        value={window}
                        onChange={setWindow}
                        className="mb-4"
                    />

                    {windowSessions.length === 0 ? (
                        <EmptyState
                            icon="time-outline"
                            title="Nothing in this window"
                            body="You have history, just not in the last stretch. Switch to All time to see it."
                        />
                    ) : (
                        <View className="gap-3">
                            {CIRCLES.map((circle) => (
                                <StatCard
                                    key={circle.key}
                                    circle={circle}
                                    tally={circles[circle.key]}
                                    delta={deltas[circle.key]}
                                />
                            ))}
                        </View>
                    )}

                    {missMap.total > 0 ? (
                        <View className="mt-4">
                            <MissSummary tally={missMap} />
                        </View>
                    ) : null}

                    {sessions.length > 0 ? (
                        <View className="mt-6 gap-3">
                            <View className="flex-row items-center justify-between">
                                <Typography variant="h3">Recent</Typography>
                                <Link href="/sessions" asChild>
                                    <Pressable
                                        accessibilityRole="button"
                                        className="active:opacity-60"
                                    >
                                        <Typography
                                            variant="label"
                                            className="text-primary"
                                        >
                                            See all
                                        </Typography>
                                    </Pressable>
                                </Link>
                            </View>

                            {sessions.slice(0, 5).map((session) => (
                                <SessionRow
                                    key={session.id}
                                    session={session}
                                />
                            ))}
                        </View>
                    ) : null}
                </>
            )}

            <StartSessionModal
                visible={starting}
                onClose={() => setStarting(false)}
            />
        </Screen>
    );
}
