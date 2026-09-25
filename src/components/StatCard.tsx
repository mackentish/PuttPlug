import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { type Circle, type Tally, formatDelta, formatPct } from '@/lib/stats';
import { PercentBar } from './PercentBar';
import { Typography } from './Typography';

/**
 * One circle's percentage on the dashboard.
 *
 * The distance range is always shown under the label — a newcomer shouldn't
 * have to already know what "C1X" means to use this app.
 *
 * When there are no attempts the card shows an explicit placeholder rather
 * than 0%: "we have no data" and "you missed everything" must not look alike
 * to someone tracking their progress.
 */
export function StatCard({
    circle,
    tally,
    delta,
}: {
    circle: Circle;
    tally: Tally;
    /** Percentage-point change vs. the previous window, or null if unknown. */
    delta: number | null;
}) {
    const colors = useColors();
    const hasData = tally.pct !== null;

    const deltaColor =
        delta === null || Math.round(delta) === 0
            ? colors['content-muted']
            : delta > 0
              ? colors.success
              : colors.danger;

    return (
        <View className="rounded-2xl border border-border bg-surface-raised p-4">
            <View className="flex-row items-start justify-between gap-3">
                <View className="shrink">
                    <Typography variant="title">
                        {circle.label}{' '}
                        <Typography variant="caption">
                            ({circle.short})
                        </Typography>
                    </Typography>
                    <Typography variant="caption" className="mt-0.5">
                        {circle.description}
                    </Typography>
                </View>

                <View className="items-end">
                    {hasData ? (
                        <Typography variant="h2">
                            {formatPct(tally.pct as number)}
                        </Typography>
                    ) : (
                        <Typography variant="h2" className="text-content-muted">
                            —
                        </Typography>
                    )}
                </View>
            </View>

            <PercentBar pct={tally.pct} className="mt-3" />

            <View className="mt-2 flex-row items-center justify-between gap-2">
                <Typography variant="caption">
                    {hasData
                        ? `${tally.makes} of ${tally.attempts} made`
                        : 'No putts logged in this range yet'}
                </Typography>

                {delta !== null ? (
                    <View className="flex-row items-center gap-1">
                        <Ionicons
                            name={
                                Math.round(delta) === 0
                                    ? 'remove'
                                    : delta > 0
                                      ? 'arrow-up'
                                      : 'arrow-down'
                            }
                            size={12}
                            color={deltaColor}
                        />
                        <Typography
                            variant="caption"
                            style={{ color: deltaColor }}
                        >
                            {formatDelta(delta)}
                        </Typography>
                    </View>
                ) : null}
            </View>
        </View>
    );
}
