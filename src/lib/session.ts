import * as Crypto from 'expo-crypto';
import { type MissSpot, type Session, type Station } from '@/types';

/*
    Pure helpers for mutating a session. They always return new objects so the
    hooks layer can write through to storage and re-render in one step.

    The invariant every helper here preserves: `station.missSpots.length` is
    always exactly `station.misses`. That is what makes the "−" button able to
    unwind the right miss location instead of guessing.
*/

export function newSession(): Session {
    return {
        id: Crypto.randomUUID(),
        startedAt: new Date().toISOString(),
        endedAt: null,
        stations: [],
    };
}

export function newStation(distanceFt: number, discId: string): Station {
    return {
        id: Crypto.randomUUID(),
        distanceFt,
        discId,
        makes: 0,
        misses: 0,
        missSpots: [],
    };
}

/**
 * The station a session is currently logging into: the one matching the
 * selected range AND putter.
 *
 * Returning to a pair already used in this session resumes that station rather
 * than opening a second one, so 20 ft → 30 ft → back to 20 ft aggregates into
 * a single 20 ft row instead of splitting the user's data in half.
 */
export function findStation(
    session: Session,
    distanceFt: number,
    discId: string
): Station | undefined {
    return session.stations.find(
        (s) => s.distanceFt === distanceFt && s.discId === discId
    );
}

function mapStation(
    session: Session,
    stationId: string,
    fn: (station: Station) => Station
): Session {
    return {
        ...session,
        stations: session.stations.map((s) => (s.id === stationId ? fn(s) : s)),
    };
}

export function ensureStation(
    session: Session,
    distanceFt: number,
    discId: string
): { session: Session; station: Station } {
    const existing = findStation(session, distanceFt, discId);
    if (existing) return { session, station: existing };

    const station = newStation(distanceFt, discId);
    return {
        session: { ...session, stations: [...session.stations, station] },
        station,
    };
}

export function addMake(session: Session, stationId: string): Session {
    return mapStation(session, stationId, (s) => ({
        ...s,
        makes: s.makes + 1,
    }));
}

export function removeMake(session: Session, stationId: string): Session {
    return mapStation(session, stationId, (s) => ({
        ...s,
        makes: Math.max(0, s.makes - 1),
    }));
}

/**
 * Records a miss. `spot` is `null` when the user tapped the plain MISS button
 * and didn't say where it hit -- marking the basket is always optional.
 */
export function addMiss(
    session: Session,
    stationId: string,
    spot: MissSpot | null = null
): Session {
    return mapStation(session, stationId, (s) => ({
        ...s,
        misses: s.misses + 1,
        missSpots: [...s.missSpots, spot],
    }));
}

/** Undoes the most recent miss, dropping its location with it. */
export function removeMiss(session: Session, stationId: string): Session {
    return mapStation(session, stationId, (s) => {
        if (s.misses === 0) return s;
        return {
            ...s,
            misses: s.misses - 1,
            missSpots: s.missSpots.slice(0, -1),
        };
    });
}

export function finishSession(session: Session): Session {
    return { ...session, endedAt: new Date().toISOString() };
}

/** Drops stations that were opened but never putted at, so a session's
 *  history isn't cluttered with empty rows from fiddling with the range. */
export function pruneEmptyStations(session: Session): Session {
    return {
        ...session,
        stations: session.stations.filter((s) => s.makes + s.misses > 0),
    };
}
