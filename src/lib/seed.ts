import * as Crypto from 'expo-crypto';
import { type Disc, type MissSpot, type Session, type Station } from '@/types';
import { zoneForSpot } from './missMap';

/*
    Development-only demo data.

    Hand-logging a few hundred putts to check that the dashboard windows, the
    sort orders, the calendar dots and the hotspot map all behave is not a
    reasonable way to test them -- this fills in a plausible eight weeks of
    practice instead.

    It is deliberately NOT random-flat: the fake player is better up close than
    far away and pulls misses low-left, so the stats and the heat map have
    something real to show. Circle 2 and beyond are practised rarely, which
    also exercises the "no data yet" placeholders.
*/

/** Deterministic PRNG so repeated seeds are comparable between runs. */
function mulberry32(seed: number) {
    return function random() {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/** Roughly how a real player's make rate falls off with distance. */
function makeChance(distanceFt: number, skill: number): number {
    const base = 0.97 - 0.021 * (distanceFt - 5);
    return Math.max(0.04, Math.min(0.99, base + skill));
}

export function buildSeedData(now: Date = new Date()): {
    discs: Disc[];
    sessions: Session[];
} {
    const random = mulberry32(20260925);

    const discs: Disc[] = [
        {
            id: Crypto.randomUUID(),
            name: 'Judge',
            plastic: 'Classic Blend',
            weightG: 174,
            speed: 2,
            glide: 4,
            turn: 0,
            fade: 1,
            createdAt: new Date(now.getTime() - 60 * 864e5).toISOString(),
        },
        {
            id: Crypto.randomUUID(),
            name: 'Zone',
            plastic: 'Z',
            weightG: 173,
            createdAt: new Date(now.getTime() - 40 * 864e5).toISOString(),
        },
    ];

    const sessions: Session[] = [];

    // Practice on roughly two days in three, going back eight weeks.
    for (let daysAgo = 56; daysAgo >= 0; daysAgo--) {
        if (random() > 0.36) continue;

        const start = new Date(now.getTime() - daysAgo * 864e5);
        start.setHours(17, Math.floor(random() * 50), 0, 0);

        // A slow, steady improvement so the 7d/30d deltas have a real trend.
        const skill = 0.11 * (1 - daysAgo / 56) + (random() - 0.5) * 0.05;
        const disc = discs[random() < 0.75 ? 0 : 1];

        const ranges: number[] = [15, 20, 25];
        if (random() < 0.55) ranges.push(10);
        if (random() < 0.45) ranges.push(30);
        if (random() < 0.22) ranges.push(40);
        // Long range is rare, which is the point: the OC card should spend
        // most of its life showing the placeholder.
        if (random() < 0.08) ranges.push(70);

        const stations: Station[] = ranges.map((distanceFt) => {
            const putts = 10 + Math.floor(random() * 15);
            const chance = makeChance(distanceFt, skill);

            let makes = 0;
            const missSpots: (MissSpot | null)[] = [];

            for (let i = 0; i < putts; i++) {
                if (random() < chance) {
                    makes += 1;
                } else {
                    // Marking the basket is optional in the app, so only some
                    // misses carry a location here too.
                    missSpots.push(
                        random() < 0.7 ? randomMissSpot(random) : null
                    );
                }
            }

            return {
                id: Crypto.randomUUID(),
                distanceFt,
                discId: disc.id,
                makes,
                misses: missSpots.length,
                missSpots,
            };
        });

        const end = new Date(start.getTime() + (12 + random() * 25) * 60_000);

        sessions.push({
            id: Crypto.randomUUID(),
            startedAt: start.toISOString(),
            endedAt: end.toISOString(),
            stations,
        });
    }

    return { discs, sessions };
}

/** Biased low-left, the classic pull miss, with a scatter of everything else. */
function randomMissSpot(random: () => number): MissSpot {
    const biased = random() < 0.45;

    const spot = biased
        ? { x: 0.26 + random() * 0.18, y: 0.62 + random() * 0.2 }
        : { x: 0.12 + random() * 0.76, y: 0.2 + random() * 0.66 };

    // Sanity: the seeder's own bias should land in the zone it claims.
    if (__DEV__ && biased && zoneForSpot(spot) !== 'low-left') {
        console.warn('[seed] biased miss landed outside low-left', spot);
    }

    return spot;
}
