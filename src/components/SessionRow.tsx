import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useData } from '@/hooks/useData';
import {
    formatDuration,
    formatSessionDate,
    formatSessionTime,
} from '@/lib/format';
import { formatPct, sessionTotals } from '@/lib/stats';
import { type Session } from '@/types';
import { PercentBar } from './PercentBar';
import { Typography } from './Typography';

export function SessionRow({ session }: { session: Session }) {
    const colors = useColors();
    const { discById } = useData();
    const totals = sessionTotals(session);
    const duration = formatDuration(session.startedAt, session.endedAt);

    const putterNames = [
        ...new Set(
            session.stations
                .map((s) => discById(s.discId)?.name)
                .filter((name): name is string => !!name)
        ),
    ];

    const meta = [
        formatSessionTime(session.startedAt),
        duration,
        putterNames.join(', ') || null,
    ]
        .filter(Boolean)
        .join(' · ');

    return (
        <Link href={`/session/${session.id}`} asChild>
            <Pressable className="rounded-2xl border border-border bg-surface-raised p-4 active:bg-surface-sunken">
                <View className="flex-row items-center justify-between gap-3">
                    <View className="shrink">
                        <Typography variant="title">
                            {formatSessionDate(session.startedAt)}
                        </Typography>
                        <Typography variant="caption" className="mt-0.5">
                            {meta}
                        </Typography>
                    </View>

                    <View className="flex-row items-center gap-2">
                        <View className="items-end">
                            <Typography variant="h3">
                                {totals.pct === null
                                    ? '—'
                                    : formatPct(totals.pct)}
                            </Typography>
                            <Typography variant="caption">
                                {totals.makes}/{totals.attempts}
                            </Typography>
                        </View>
                        <Ionicons
                            name="chevron-forward"
                            size={18}
                            color={colors['content-muted']}
                        />
                    </View>
                </View>

                <PercentBar pct={totals.pct} className="mt-3" />
            </Pressable>
        </Link>
    );
}
