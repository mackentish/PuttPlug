import * as Crypto from 'expo-crypto';
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { KEYS, read, write } from '@/lib/storage';
import { type Disc, type Session } from '@/types';

/*
    The whole data layer: discs, sessions, and the pointer to whichever session
    is currently in progress.

    Every mutation writes through to AsyncStorage immediately rather than
    batching or debouncing. That matters more than it looks: a session is
    logged tap by tap on a practice field, and the app getting killed or
    backgrounded mid-round must not cost the user their round.
*/

type DataContextValue = {
    discs: Disc[];
    sessions: Session[];
    activeSessionId: string | null;
    isReady: boolean;

    addDisc: (disc: Omit<Disc, 'id' | 'createdAt'>) => Promise<Disc>;
    updateDisc: (id: string, patch: Partial<Omit<Disc, 'id'>>) => Promise<void>;
    deleteDisc: (id: string) => Promise<void>;
    discById: (id: string) => Disc | undefined;

    /** Persists a new or changed session. Upserts by id. */
    saveSession: (session: Session) => Promise<void>;
    deleteSession: (id: string) => Promise<void>;
    sessionById: (id: string) => Session | undefined;

    setActiveSessionId: (id: string | null) => Promise<void>;
    lastDiscId: string | null;
    setLastDiscId: (id: string | null) => Promise<void>;

    /** Wipes everything. Used by Settings, and by the dev seeder. */
    replaceAll: (data: { discs: Disc[]; sessions: Session[] }) => Promise<void>;
};

const DataContext = createContext<DataContextValue | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
    const [discs, setDiscs] = useState<Disc[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [activeSessionId, setActiveSessionIdState] = useState<string | null>(
        null
    );
    const [lastDiscId, setLastDiscIdState] = useState<string | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            const [storedDiscs, storedSessions, storedSettings] =
                await Promise.all([
                    read<Disc[]>(KEYS.discs, []),
                    read<Session[]>(KEYS.sessions, []),
                    read<{
                        activeSessionId?: string | null;
                        lastDiscId?: string | null;
                    }>(KEYS.settings, {}),
                ]);

            if (cancelled) return;

            setDiscs(storedDiscs);
            setSessions(storedSessions);
            setActiveSessionIdState(storedSettings.activeSessionId ?? null);
            setLastDiscIdState(storedSettings.lastDiscId ?? null);
            setIsReady(true);
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    /*
        Settings is a single blob shared with the theme provider, so patching
        it always re-reads first. Read-modify-write rather than merging into
        React state: whoever wrote last should not clobber the other's keys.
    */
    const patchSettings = useCallback(
        async (patch: Record<string, unknown>) => {
            const current = await read<Record<string, unknown>>(
                KEYS.settings,
                {}
            );
            await write(KEYS.settings, { ...current, ...patch });
        },
        []
    );

    const persistDiscs = useCallback(async (next: Disc[]) => {
        setDiscs(next);
        await write(KEYS.discs, next);
    }, []);

    const persistSessions = useCallback(async (next: Session[]) => {
        setSessions(next);
        await write(KEYS.sessions, next);
    }, []);

    const addDisc = useCallback<DataContextValue['addDisc']>(
        async (input) => {
            const disc: Disc = {
                ...input,
                id: Crypto.randomUUID(),
                createdAt: new Date().toISOString(),
            };
            await persistDiscs([...discs, disc]);
            return disc;
        },
        [discs, persistDiscs]
    );

    const updateDisc = useCallback<DataContextValue['updateDisc']>(
        async (id, patch) => {
            await persistDiscs(
                discs.map((d) => (d.id === id ? { ...d, ...patch } : d))
            );
        },
        [discs, persistDiscs]
    );

    /*
        Deleting a disc that has been putted with would orphan every station
        referencing it, leaving past sessions unable to name the putter used.
        So a disc in use is archived (hidden from pickers, kept on disk) and
        only an unused one is really removed.
    */
    const deleteDisc = useCallback<DataContextValue['deleteDisc']>(
        async (id) => {
            const used = sessions.some((session) =>
                session.stations.some((station) => station.discId === id)
            );

            if (used) {
                await persistDiscs(
                    discs.map((d) =>
                        d.id === id ? { ...d, archived: true } : d
                    )
                );
            } else {
                await persistDiscs(discs.filter((d) => d.id !== id));
            }
        },
        [discs, sessions, persistDiscs]
    );

    const saveSession = useCallback<DataContextValue['saveSession']>(
        async (session) => {
            const exists = sessions.some((s) => s.id === session.id);
            await persistSessions(
                exists
                    ? sessions.map((s) => (s.id === session.id ? session : s))
                    : [...sessions, session]
            );
        },
        [sessions, persistSessions]
    );

    const deleteSession = useCallback<DataContextValue['deleteSession']>(
        async (id) => {
            await persistSessions(sessions.filter((s) => s.id !== id));
        },
        [sessions, persistSessions]
    );

    const setActiveSessionId = useCallback<
        DataContextValue['setActiveSessionId']
    >(
        async (id) => {
            setActiveSessionIdState(id);
            await patchSettings({ activeSessionId: id });
        },
        [patchSettings]
    );

    const setLastDiscId = useCallback<DataContextValue['setLastDiscId']>(
        async (id) => {
            setLastDiscIdState(id);
            await patchSettings({ lastDiscId: id });
        },
        [patchSettings]
    );

    const replaceAll = useCallback<DataContextValue['replaceAll']>(
        async (data) => {
            await Promise.all([
                persistDiscs(data.discs),
                persistSessions(data.sessions),
            ]);
            setActiveSessionIdState(null);
            await patchSettings({ activeSessionId: null });
        },
        [persistDiscs, persistSessions, patchSettings]
    );

    const discById = useCallback(
        (id: string) => discs.find((d) => d.id === id),
        [discs]
    );

    const sessionById = useCallback(
        (id: string) => sessions.find((s) => s.id === id),
        [sessions]
    );

    const value = useMemo<DataContextValue>(
        () => ({
            discs,
            sessions,
            activeSessionId,
            isReady,
            addDisc,
            updateDisc,
            deleteDisc,
            discById,
            saveSession,
            deleteSession,
            sessionById,
            setActiveSessionId,
            lastDiscId,
            setLastDiscId,
            replaceAll,
        }),
        [
            discs,
            sessions,
            activeSessionId,
            isReady,
            addDisc,
            updateDisc,
            deleteDisc,
            discById,
            saveSession,
            deleteSession,
            sessionById,
            setActiveSessionId,
            lastDiscId,
            setLastDiscId,
            replaceAll,
        ]
    );

    return (
        <DataContext.Provider value={value}>{children}</DataContext.Provider>
    );
}

export function useData(): DataContextValue {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used inside a DataProvider');
    }
    return context;
}

/** Discs offered in pickers: everything not archived, newest last. */
export function useActiveDiscs(): Disc[] {
    const { discs } = useData();
    return useMemo(() => discs.filter((d) => !d.archived), [discs]);
}

/** Completed sessions only, newest first. The in-progress one is excluded so
 *  it can't skew the dashboard mid-round. */
export function useCompletedSessions(): Session[] {
    const { sessions } = useData();
    return useMemo(
        () =>
            sessions
                .filter((s) => s.endedAt !== null)
                .sort(
                    (a, b) =>
                        new Date(b.startedAt).getTime() -
                        new Date(a.startedAt).getTime()
                ),
        [sessions]
    );
}
