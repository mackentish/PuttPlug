import {
    MISS_ZONES,
    type MissSpot,
    type MissZone,
    type Session,
    type Station,
} from '@/types';
import { zoneForSpot } from './missMap';

/*
    All putting maths lives here so the dashboard, the session detail screen
    and the disc detail screen can never disagree -- and, just as importantly,
    so the distance ranges shown to the user are read from the same constants
    that do the bucketing.
*/

export type CircleKey = 'c1' | 'c1x' | 'c2' | 'oc';

export type Circle = {
    key: CircleKey;
    /** Full name, for headings. */
    label: string;
    /** Abbreviation experienced players use. */
    short: string;
    /** Plain-English distance range, shown under every label so newcomers
     *  never have to know what "C1X" means. */
    description: string;
    minFt: number;
    maxFt: number;
};

/**
 * Note that C1X is a SUBSET of C1, not a sibling of it -- that is the real
 * disc golf definition, not a bug. A 20 ft putt counts toward both. C1X is the
 * more honest measure of putting skill because it excludes tap-ins.
 */
export const CIRCLES: Circle[] = [
    {
        key: 'c1',
        label: 'Circle 1',
        short: 'C1',
        description: '1 to 33 ft',
        minFt: 1,
        maxFt: 33,
    },
    {
        key: 'c1x',
        label: 'Circle 1X',
        short: 'C1X',
        description: '12 to 33 ft — Circle 1 excluding tap-ins',
        minFt: 12,
        maxFt: 33,
    },
    {
        key: 'c2',
        label: 'Circle 2',
        short: 'C2',
        description: '34 to 66 ft',
        minFt: 34,
        maxFt: 66,
    },
    {
        key: 'oc',
        label: 'Outside Circle',
        short: 'OC',
        description: '67 ft and beyond',
        minFt: 67,
        maxFt: Infinity,
    },
];

export const CIRCLE_BY_KEY = Object.fromEntries(
    CIRCLES.map((circle) => [circle.key, circle])
) as Record<CircleKey, Circle>;

export type Tally = {
    makes: number;
    attempts: number;
    /**
     * `null` when there are no attempts. Callers MUST render a placeholder for
     * null rather than coercing to 0 -- "no data" and "missed everything" are
     * very different things to show someone tracking their progress.
     */
    pct: number | null;
};

export const EMPTY_TALLY: Tally = { makes: 0, attempts: 0, pct: null };

function toTally(makes: number, attempts: number): Tally {
    return {
        makes,
        attempts,
        pct: attempts > 0 ? (makes / attempts) * 100 : null,
    };
}

export function inCircle(distanceFt: number, circle: Circle): boolean {
    return distanceFt >= circle.minFt && distanceFt <= circle.maxFt;
}

export function tallyStations(
    stations: Station[],
    predicate: (station: Station) => boolean = () => true
): Tally {
    let makes = 0;
    let attempts = 0;
    for (const station of stations) {
        if (!predicate(station)) continue;
        makes += station.makes;
        attempts += station.makes + station.misses;
    }
    return toTally(makes, attempts);
}

export function tallyCircle(stations: Station[], circle: Circle): Tally {
    return tallyStations(stations, (s) => inCircle(s.distanceFt, circle));
}

export type CircleTallies = Record<CircleKey, Tally>;

export function tallyAllCircles(stations: Station[]): CircleTallies {
    return Object.fromEntries(
        CIRCLES.map((circle) => [circle.key, tallyCircle(stations, circle)])
    ) as CircleTallies;
}

export function allStations(sessions: Session[]): Station[] {
    return sessions.flatMap((session) => session.stations);
}

/** Overall makes/attempts across a session, ignoring distance. */
export function sessionTotals(session: Session): Tally {
    return tallyStations(session.stations);
}

export function sessionAttempts(session: Session): number {
    return session.stations.reduce((n, s) => n + s.makes + s.misses, 0);
}

// --- time windows --------------------------------------------------------

/** `null` days means "all time". */
export type WindowDays = 7 | 30 | null;

export const WINDOW_OPTIONS: { value: WindowDays; label: string }[] = [
    { value: 7, label: '7 days' },
    { value: 30, label: '30 days' },
    { value: null, label: 'All time' },
];

function startOfWindow(now: Date, daysAgo: number): number {
    return now.getTime() - daysAgo * 24 * 60 * 60 * 1000;
}

export function sessionsInWindow(
    sessions: Session[],
    days: WindowDays,
    now: Date = new Date()
): Session[] {
    if (days === null) return sessions;
    const from = startOfWindow(now, days);
    return sessions.filter((s) => new Date(s.startedAt).getTime() >= from);
}

/**
 * The equal-length window immediately before the current one, which is what
 * the dashboard's ▲/▼ deltas compare against. Returns `[]` for "all time",
 * since there is nothing earlier to compare to.
 */
export function sessionsInPreviousWindow(
    sessions: Session[],
    days: WindowDays,
    now: Date = new Date()
): Session[] {
    if (days === null) return [];
    const to = startOfWindow(now, days);
    const from = startOfWindow(now, days * 2);
    return sessions.filter((s) => {
        const t = new Date(s.startedAt).getTime();
        return t >= from && t < to;
    });
}

/**
 * Percentage-point change between two tallies, or `null` when either side has
 * no data -- an improvement claim needs both halves to be real.
 */
export function delta(current: Tally, previous: Tally): number | null {
    if (current.pct === null || previous.pct === null) return null;
    return current.pct - previous.pct;
}

// --- miss locations ------------------------------------------------------

export type MissMapTally = {
    /** Every recorded point, for drawing the hotspot map. */
    spots: MissSpot[];
    /** Recorded points bucketed into the six readable zones. */
    counts: Record<MissZone, number>;
    /** Misses with a recorded location. */
    located: number;
    /** Every miss, located or not. */
    total: number;
    /** The single most-hit zone, or null on no data / an exact tie for first. */
    worst: MissZone | null;
};

/**
 * Collects miss locations for the hotspot map.
 *
 * `located` and `total` are reported separately on purpose: marking the basket
 * is optional, so the map is only ever showing a subset and the UI should say
 * so rather than implying it covers every miss.
 */
export function tallyMissMap(stations: Station[]): MissMapTally {
    const counts = Object.fromEntries(
        MISS_ZONES.map((zone) => [zone, 0])
    ) as Record<MissZone, number>;

    const spots: MissSpot[] = [];
    let total = 0;

    for (const station of stations) {
        total += station.misses;
        for (const spot of station.missSpots ?? []) {
            if (spot === null) continue;
            spots.push(spot);
            counts[zoneForSpot(spot)] += 1;
        }
    }

    let worst: MissZone | null = null;
    let best = 0;
    let tied = false;
    for (const zone of MISS_ZONES) {
        if (counts[zone] > best) {
            best = counts[zone];
            worst = zone;
            tied = false;
        } else if (counts[zone] === best && best > 0) {
            tied = true;
        }
    }

    return {
        spots,
        counts,
        located: spots.length,
        total,
        worst: tied ? null : worst,
    };
}

// --- per-disc ------------------------------------------------------------

export function tallyForDisc(sessions: Session[], discId: string): Tally {
    return tallyStations(allStations(sessions), (s) => s.discId === discId);
}

export function circlesForDisc(
    sessions: Session[],
    discId: string
): CircleTallies {
    const stations = allStations(sessions).filter((s) => s.discId === discId);
    return tallyAllCircles(stations);
}

// --- formatting ----------------------------------------------------------

/** `72.4` -> `"72%"`. Callers handle `null` themselves so the placeholder
 *  copy can be specific to where it appears. */
export function formatPct(pct: number): string {
    return `${Math.round(pct)}%`;
}

export function formatDelta(value: number): string {
    const rounded = Math.round(value);
    if (rounded === 0) return 'no change';
    return `${rounded > 0 ? '+' : '−'}${Math.abs(rounded)} pts`;
}
