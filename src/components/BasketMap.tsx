import { Image } from 'expo-image';
import React, { useState } from 'react';
import {
    type GestureResponderEvent,
    type LayoutChangeEvent,
    Pressable,
    View,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { clampSpot } from '@/lib/missMap';
import { type MissSpot } from '@/types';
import { Typography } from './Typography';

// Relative rather than aliased: Metro resolves this regardless of how
// tsconfig paths are wired up.
const BASKET = require('../../assets/images/basket.png');

/** The artwork's aspect ratio (1086x1448). Everything positions against this. */
const ASPECT = 3 / 4;

/**
 * The basket, with recorded miss locations drawn on top.
 *
 * Serves both jobs the app needs:
 *   - in a session, `onTapSpot` makes it the fastest way to log a miss — one
 *     tap records the miss AND where it hit
 *   - on the dashboard and session detail, it renders read-only as a hotspot
 *     map
 *
 * The hotspot effect is deliberately just overlapping translucent dots rather
 * than a smoothed density field: where the user putted twice, it is twice as
 * dark, and nothing is interpolated into places they never actually hit.
 */
export function BasketMap({
    spots,
    onTapSpot,
    dotSize = 26,
    className = '',
}: {
    spots: MissSpot[];
    /** Provide to make the basket tappable. */
    onTapSpot?: (spot: MissSpot) => void;
    dotSize?: number;
    className?: string;
}) {
    const colors = useColors();
    const [width, setWidth] = useState(0);
    const height = width / ASPECT;

    function onLayout(event: LayoutChangeEvent) {
        setWidth(event.nativeEvent.layout.width);
    }

    function onPress(event: GestureResponderEvent) {
        if (!onTapSpot || width === 0) return;
        const { locationX, locationY } = event.nativeEvent;
        onTapSpot(clampSpot({ x: locationX / width, y: locationY / height }));
    }

    const content = (
        <View
            className="relative w-full overflow-hidden rounded-2xl"
            style={{ aspectRatio: ASPECT }}
        >
            <Image
                source={BASKET}
                style={{ width: '100%', height: '100%' }}
                contentFit="contain"
                // The art is mid-grey line work on transparency, which reads
                // on both the light and dark surface, so no tint is needed.
            />

            {width > 0 ? (
                <View pointerEvents="none" className="absolute inset-0">
                    {spots.map((spot, index) => (
                        <View
                            // Spots are append-only and never reordered, so the
                            // index is a stable identity here.
                            key={index}
                            style={{
                                position: 'absolute',
                                left: spot.x * width - dotSize / 2,
                                top: spot.y * height - dotSize / 2,
                                width: dotSize,
                                height: dotSize,
                                borderRadius: dotSize / 2,
                                backgroundColor: colors.danger,
                                // Low alpha so overlap is what creates the
                                // heat — a single miss stays a faint mark.
                                opacity: 0.28,
                            }}
                        />
                    ))}
                </View>
            ) : null}
        </View>
    );

    return (
        <View className={className} onLayout={onLayout}>
            {onTapSpot ? (
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Tap the basket to log a miss where it hit"
                    onPress={onPress}
                >
                    {content}
                </Pressable>
            ) : (
                content
            )}
        </View>
    );
}

/** Shared caption for the map, spelling out that locations are a subset. */
export function BasketMapCaption({
    located,
    total,
}: {
    located: number;
    total: number;
}) {
    if (total === 0) {
        return (
            <Typography variant="caption" className="text-center">
                No misses logged yet.
            </Typography>
        );
    }

    return (
        <Typography variant="caption" className="text-center">
            {located === 0
                ? `${total} ${total === 1 ? 'miss' : 'misses'} logged, none with a location yet`
                : `${located} of ${total} ${total === 1 ? 'miss' : 'misses'} located`}
        </Typography>
    );
}
