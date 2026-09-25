/** A disc in the user's digital bag. Only `name` is ever required. */
export type Disc = {
    id: string;
    /** The one required field. Everything else is optional by design. */
    name: string;
    /** Flight numbers. Undefined means "not recorded", which is not the same as 0. */
    speed?: number;
    glide?: number;
    turn?: number;
    fade?: number;
    plastic?: string;
    /** Grams. */
    weightG?: number;
    /** ISO timestamp. */
    createdAt: string;
    /**
     * Hidden from pickers but kept on disk, so historical sessions that
     * reference it still resolve to a name.
     */
    archived?: boolean;
};

/**
 * Where a putt hit the basket, as a normalised point on the basket artwork:
 * `x` runs 0 (left edge) to 1 (right edge), `y` runs 0 (top) to 1 (bottom).
 *
 * Stored as a free point rather than a bucket so the dashboard can draw a real
 * hotspot map. The six named zones below are DERIVED from the point (see
 * `zoneForSpot` in `src/lib/missMap.ts`), which keeps the readable summaries
 * without throwing away the precision.
 */
export type MissSpot = { x: number; y: number };

/**
 * Two columns (left/right) by three rows (high/center/low). Used for
 * human-readable summaries like "most misses: high right".
 */
export type MissZone =
    | 'high-left'
    | 'high-right'
    | 'center-left'
    | 'center-right'
    | 'low-left'
    | 'low-right';

export const MISS_ZONES: MissZone[] = [
    'high-left',
    'high-right',
    'center-left',
    'center-right',
    'low-left',
    'low-right',
];

export const MISS_ZONE_LABELS: Record<MissZone, string> = {
    'high-left': 'High left',
    'high-right': 'High right',
    'center-left': 'Center left',
    'center-right': 'Center right',
    'low-left': 'Low left',
    'low-right': 'Low right',
};

/**
 * A stretch of putting at one distance with one disc.
 *
 * A session is a list of these. Changing either the range or the putter
 * switches the active station; returning to a (distance, disc) pair already
 * used in this session resumes that station rather than creating a duplicate.
 */
export type Station = {
    id: string;
    distanceFt: number;
    discId: string;
    makes: number;
    misses: number;
    /**
     * One entry per miss, in the order they happened, holding where on the
     * basket it hit -- or `null` when the user didn't say. Recording a
     * location is always optional, so `null` means "not recorded", never
     * "dead centre".
     *
     * Kept exactly the same length as `misses` by the helpers in
     * `src/lib/session.ts`, which is what lets the "−" button unwind the right
     * spot instead of guessing which miss to drop.
     */
    missSpots: (MissSpot | null)[];
};

export type Session = {
    id: string;
    /** ISO timestamp, stamped the moment the user taps "Start Session". */
    startedAt: string;
    /** ISO timestamp, or null while the session is still in progress. */
    endedAt: string | null;
    stations: Station[];
    notes?: string;
};

export type Settings = {
    palette: string;
    mode: 'system' | 'light' | 'dark';
    /** Set while a session is in progress so it survives the app being killed. */
    activeSessionId: string | null;
    /** Remembered so the next session starts on the same putter. */
    lastDiscId: string | null;
};
