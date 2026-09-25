import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { EmptyState } from '@/components/EmptyState';
import { type DayMark, MonthCalendar } from '@/components/MonthCalendar';
import { Screen } from '@/components/Screen';
import { SegmentedControl } from '@/components/SegmentedControl';
import { SessionRow } from '@/components/SessionRow';
import { Typography } from '@/components/Typography';
import { useCompletedSessions } from '@/hooks/useData';
import { localDayKey } from '@/lib/format';
import { sessionAttempts, sessionTotals } from '@/lib/stats';
import { type Session } from '@/types';

type ViewMode = 'list' | 'calendar';
type Sort = 'newest' | 'oldest' | 'best' | 'worst';

const VIEWS = [
    { value: 'list' as const, label: 'List' },
    { value: 'calendar' as const, label: 'Calendar' },
];

const SORTS = [
    { value: 'newest' as const, label: 'Newest' },
    { value: 'oldest' as const, label: 'Oldest' },
    { value: 'best' as const, label: 'Best %' },
    { value: 'worst' as const, label: 'Worst %' },
];

function sortSessions(sessions: Session[], sort: Sort): Session[] {
    const copy = [...sessions];

    switch (sort) {
        case 'newest':
            return copy.sort(
                (a, b) =>
                    new Date(b.startedAt).getTime() -
                    new Date(a.startedAt).getTime()
            );
        case 'oldest':
            return copy.sort(
                (a, b) =>
                    new Date(a.startedAt).getTime() -
                    new Date(b.startedAt).getTime()
            );
        // Sessions with no attempts can't be ranked by percentage, so they
        // sink to the bottom of both orders rather than pretending to be 0%.
        case 'best':
            return copy.sort(
                (a, b) =>
                    (sessionTotals(b).pct ?? -1) - (sessionTotals(a).pct ?? -1)
            );
        case 'worst':
            return copy.sort(
                (a, b) =>
                    (sessionTotals(a).pct ?? 101) -
                    (sessionTotals(b).pct ?? 101)
            );
    }
}

export default function SessionsScreen() {
    const sessions = useCompletedSessions();

    const [view, setView] = useState<ViewMode>('list');
    const [sort, setSort] = useState<Sort>('newest');
    const [month, setMonth] = useState(() => new Date());
    const [selectedDay, setSelectedDay] = useState<string | null>(null);

    const sorted = useMemo(
        () => sortSessions(sessions, sort),
        [sessions, sort]
    );

    const marks = useMemo(() => {
        const result: Record<string, DayMark> = {};
        for (const session of sessions) {
            const key = localDayKey(session.startedAt);
            const existing = result[key] ?? { sessions: 0, attempts: 0 };
            result[key] = {
                sessions: existing.sessions + 1,
                attempts: existing.attempts + sessionAttempts(session),
            };
        }
        return result;
    }, [sessions]);

    const daySessions = useMemo(
        () =>
            selectedDay
                ? sessions.filter(
                      (s) => localDayKey(s.startedAt) === selectedDay
                  )
                : [],
        [sessions, selectedDay]
    );

    if (sessions.length === 0) {
        return (
            <Screen title="Sessions">
                <EmptyState
                    icon="calendar-outline"
                    title="No sessions yet"
                    body="Finished sessions show up here, sortable by date or percentage, or laid out on a calendar."
                />
            </Screen>
        );
    }

    return (
        <Screen title="Sessions" subtitle={`${sessions.length} logged`}>
            <SegmentedControl
                segments={VIEWS}
                value={view}
                onChange={setView}
                className="mb-4"
            />

            {view === 'list' ? (
                <>
                    <SegmentedControl
                        segments={SORTS}
                        value={sort}
                        onChange={setSort}
                        className="mb-4"
                    />
                    <View className="gap-3">
                        {sorted.map((session) => (
                            <SessionRow key={session.id} session={session} />
                        ))}
                    </View>
                </>
            ) : (
                <>
                    <MonthCalendar
                        month={month}
                        onChangeMonth={setMonth}
                        marks={marks}
                        selectedDay={selectedDay}
                        onSelectDay={setSelectedDay}
                    />

                    <View className="mt-4 gap-3">
                        {selectedDay === null ? (
                            <Typography
                                variant="caption"
                                className="text-center"
                            >
                                Tap a marked day to see that day&apos;s
                                sessions.
                            </Typography>
                        ) : (
                            daySessions.map((session) => (
                                <SessionRow
                                    key={session.id}
                                    session={session}
                                />
                            ))
                        )}
                    </View>
                </>
            )}
        </Screen>
    );
}
