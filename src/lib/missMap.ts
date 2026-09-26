import { type MissSpot, type MissZone } from '@/types';

/*
    Geometry shared by the interactive basket, the dashboard hotspot map and
    the zone summaries.

    These bands are the contract between assets/images/basket.png and the app.
    Measured against the current 1086x1448 artwork, as fractions of the image
    height:

        0.163  top rim ring starts (the hanger above it is not a target)
        0.232  rim ends, chains begin
        0.637  chains disappear behind the cage; cage rim starts
        0.896  bottom of the cage

    So `high` is the rim plus the top half of the chains, `center` is the
    bottom half of the chains, and `low` is the cage. If you swap in different
    basket art, re-measure those four landmarks rather than guessing.
*/

/** Fractions of the image height where each row of the basket starts/ends. */
export const ROW_BANDS = {
    high: { from: 0.16, to: 0.44 },
    center: { from: 0.44, to: 0.64 },
    low: { from: 0.64, to: 0.9 },
} as const;

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
