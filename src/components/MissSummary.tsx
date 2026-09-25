import React from 'react';
import { View } from 'react-native';
import { BasketMap, BasketMapCaption } from '@/components/BasketMap';
import { Typography } from '@/components/Typography';
import { type MissMapTally } from '@/lib/stats';
import { MISS_ZONE_LABELS } from '@/types';

/**
 * Read-only hotspot map plus the one-line takeaway.
 *
 * The takeaway is the whole point of collecting locations: "you miss high
 * right" is directly actionable in a way that a raw percentage isn't.
 */
export function MissSummary({
    tally,
    title = 'Where you miss',
}: {
    tally: MissMapTally;
    title?: string;
}) {
    const share =
        tally.worst && tally.located > 0
            ? Math.round((tally.counts[tally.worst] / tally.located) * 100)
            : null;

    return (
        <View className="rounded-2xl border border-border bg-surface-raised p-4">
            <Typography variant="title">{title}</Typography>

            {tally.located > 0 ? (
                <Typography variant="caption" className="mt-0.5">
                    {tally.worst
                        ? `Most often: ${MISS_ZONE_LABELS[tally.worst].toLowerCase()} (${share}% of located misses)`
                        : 'No single spot stands out yet'}
                </Typography>
            ) : (
                <Typography variant="caption" className="mt-0.5">
                    Tap the basket while logging a miss to build this map.
                </Typography>
            )}

            <BasketMap
                spots={tally.spots}
                showGuides
                className="mt-3 self-center"
            />

            <View className="mt-2">
                <BasketMapCaption located={tally.located} total={tally.total} />
            </View>
        </View>
    );
}
