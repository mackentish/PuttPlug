import { type MissSpot, type MissZone } from '@/types';

/*
    Geometry shared by the interactive basket, the dashboard hotspot map and
    the zone summaries.

    These bands are the contract between assets/images/basket.png and the app:
    they line up with the chains, rim and lower cage in the artwork. If you
    swap in different basket art, re-check these numbers (and the note at the
    top of scripts/generate-basket-placeholder.js) rather than guessing.
*/

/** Fractions of the image height where each row of the basket starts/ends. */
export const ROW_BANDS = {
    high: { from: 0.16, to: 0.44 },
    center: { from: 0.44, to: 0.64 },
    low: { from: 0.64, to: 0.9 },
} as const;

/** The part of the image that is actually basket, horizontally. */
export const BASKET_X = { from: 0.08, to: 0.92 } as const;

/** Derives the readable zone for a tapped point. */
export function zoneForSpot(spot: MissSpot): MissZone {
    const column = spot.x < 0.5 ? 'left' : 'right';
    const row =
        spot.y < ROW_BANDS.high.to
            ? 'high'
            : spot.y < ROW_BANDS.center.to
              ? 'center'
              : 'low';
    return `${row}-${column}` as MissZone;
}

/** Keeps a tap inside the image even if the gesture lands a pixel outside. */
export function clampSpot(spot: MissSpot): MissSpot {
    return {
        x: Math.min(1, Math.max(0, spot.x)),
        y: Math.min(1, Math.max(0, spot.y)),
    };
}
