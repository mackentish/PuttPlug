import React from 'react';
import { View } from 'react-native';

/** Slim progress track. `null` renders an empty track, which is what "no data
 *  yet" should look like — not a full-width bar at 0%. */
export function PercentBar({
    pct,
    className = '',
}: {
    pct: number | null;
    className?: string;
}) {
    return (
        <View
            className={`h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken ${className}`}
        >
            {pct === null ? null : (
                <View
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.max(2, Math.min(100, pct))}%` }}
                />
            )}
        </View>
    );
}
