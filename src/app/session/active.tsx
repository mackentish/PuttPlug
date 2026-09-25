import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { BasketMap, BasketMapCaption } from '@/components/BasketMap';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { CounterButton } from '@/components/CounterButton';
import { DiscPicker } from '@/components/DiscPicker';
import { Screen } from '@/components/Screen';
import { Stepper } from '@/components/Stepper';
import { Typography } from '@/components/Typography';
import { BaseModal } from '@/components/modals/BaseModal';
import { useColors } from '@/hooks/useColors';
import { useData } from '@/hooks/useData';
import { formatElapsed } from '@/lib/format';
import {
    addMake,
    addMiss,
    ensureStation,
    findStation,
    finishSession,
    pruneEmptyStations,
    removeMake,
    removeMiss,
} from '@/lib/session';
import { formatPct, tallyMissMap, tallyStations } from '@/lib/stats';
import { type MissSpot, type Session } from '@/types';

/** Distances a putting drill actually uses. Anything else goes via the stepper. */
const QUICK_RANGES = [10, 15, 20, 25, 30, 35];

const MIN_FT = 1;
const MAX_FT = 120;

export default function ActiveSessionScreen() {
    const colors = useColors();
    const params = useLocalSearchParams<{ discId?: string }>();
    const {
        activeSessionId,
        sessionById,
        saveSession,
        setActiveSessionId,
        deleteSession,
        discById,
        lastDiscId,
        setLastDiscId,
    } = useData();

    const session = activeSessionId ? sessionById(activeSessionId) : undefined;

    const [switchingPutter, setSwitchingPutter] = useState(false);

    /*
        Range and putter are DERIVED, not copied into state on mount.

        `picked*` holds only what the user has touched since this screen
        opened; with nothing picked, the screen falls back to the last station
        of the session. That is what makes resuming work: reopen a session
        killed mid-round and you land back on the range and putter you were
        already throwing, without an effect racing the session load.
    */
    const [pickedDistanceFt, setPickedDistanceFt] = useState<number | null>(
        null
    );
    const [pickedDiscId, setPickedDiscId] = useState<string | null>(null);

    const lastStation = session?.stations[session.stations.length - 1];

    const distanceFt = pickedDistanceFt ?? lastStation?.distanceFt ?? 20;
    const discId =
        pickedDiscId ?? params.discId ?? lastStation?.discId ?? lastDiscId;

    // Ticking `now` rather than a formatted string keeps the effect to a pure
    // subscription, with the formatting derived during render.
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 30_000);
        return () => clearInterval(id);
    }, []);

    const elapsed = session
        ? formatElapsed(now - new Date(session.startedAt).getTime())
        : '0m';

    const station = useMemo(
        () =>
            session && discId
                ? findStation(session, distanceFt, discId)
                : undefined,
        [session, distanceFt, discId]
    );

    const sessionTally = useMemo(
        () => (session ? tallyStations(session.stations) : null),
        [session]
    );

    const missMap = useMemo(
        () => (session ? tallyMissMap(session.stations) : null),
        [session]
    );

    // A session with no active id (finished in another tab, or cleared) has
    // nothing to show — bounce rather than render a broken screen.
    if (!session || !discId) {
        return (
            <Screen title="No active session">
                <Typography variant="body">
                    This session has already been finished.
                </Typography>
                <Button className="mt-4" onPress={() => router.replace('/')}>
                    Back to dashboard
                </Button>
            </Screen>
        );
    }

    /**
     * Every counter tap routes through here: open (or resume) the station for
     * the current range + putter, apply the change, and write straight to
     * disk. No debounce — losing a round to a crash is worse than a write.
     */
    async function mutate(
        apply: (session: Session, stationId: string) => Session
    ) {
        if (!session || !discId) return;
        const { session: withStation, station: target } = ensureStation(
            session,
            distanceFt,
            discId
        );
        await saveSession(apply(withStation, target.id));
    }

    async function onMake() {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await mutate(addMake);
    }

    async function onMiss(spot: MissSpot | null) {
        void Haptics.impactAsync(
            spot
                ? Haptics.ImpactFeedbackStyle.Medium
                : Haptics.ImpactFeedbackStyle.Light
        );
        await mutate((s, id) => addMiss(s, id, spot));
    }

    function confirmFinish() {
        const pruned = pruneEmptyStations(session!);

        if (pruned.stations.length === 0) {
            Alert.alert(
                'Discard this session?',
                "You haven't logged any putts, so there's nothing to save.",
                [
                    { text: 'Keep putting', style: 'cancel' },
                    {
                        text: 'Discard',
                        style: 'destructive',
                        onPress: async () => {
                            await deleteSession(session!.id);
                            await setActiveSessionId(null);
                            router.replace('/');
                        },
                    },
                ]
            );
            return;
        }

        void (async () => {
            const finished = finishSession(pruned);
            await saveSession(finished);
            await setActiveSessionId(null);
            router.replace(`/session/${finished.id}`);
        })();
    }

    const stationTally = station
        ? tallyStations([station])
        : { makes: 0, attempts: 0, pct: null };

    const putterName = discById(discId)?.name ?? 'Putter';

    return (
        <Screen
            title="Session"
            subtitle={`Running ${elapsed}`}
            right={
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Change putter"
                    onPress={() => setSwitchingPutter(true)}
                    className="flex-row items-center gap-1.5 rounded-xl border border-border bg-surface-raised px-3 py-2 active:bg-surface-sunken"
                >
                    <Ionicons name="disc" size={16} color={colors.primary} />
                    <Typography variant="label" className="text-content">
                        {putterName}
                    </Typography>
                    <Ionicons
                        name="chevron-down"
                        size={14}
                        color={colors['content-muted']}
                    />
                </Pressable>
            }
        >
            {/* --- range ------------------------------------------------ */}
            <Typography variant="label" className="mb-2">
                Range
            </Typography>

            <View className="mb-3 flex-row flex-wrap gap-2">
                {QUICK_RANGES.map((ft) => (
                    <Chip
                        key={ft}
                        label={`${ft} ft`}
                        selected={ft === distanceFt}
                        onPress={() => setPickedDistanceFt(ft)}
                    />
                ))}
            </View>

            <Stepper
                value={distanceFt}
                suffix="ft"
                accessibilityLabel="Putting range in feet"
                canDecrement={distanceFt > MIN_FT}
                canIncrement={distanceFt < MAX_FT}
                onDecrement={() =>
                    setPickedDistanceFt(Math.max(MIN_FT, distanceFt - 1))
                }
                onIncrement={() =>
                    setPickedDistanceFt(Math.min(MAX_FT, distanceFt + 1))
                }
            />

            {/* --- counters --------------------------------------------- */}
            <View className="mt-4 flex-row gap-3">
                <CounterButton
                    label="Make"
                    tone="success"
                    count={station?.makes ?? 0}
                    onPress={onMake}
                    onIncrement={onMake}
                    onDecrement={() => void mutate(removeMake)}
                />
                <CounterButton
                    label="Miss"
                    tone="danger"
                    count={station?.misses ?? 0}
                    onPress={() => void onMiss(null)}
                    onIncrement={() => void onMiss(null)}
                    onDecrement={() => void mutate(removeMiss)}
                />
            </View>

            <Typography variant="caption" className="mt-2 text-center">
                {stationTally.pct === null
                    ? `Nothing logged at ${distanceFt} ft yet`
                    : `${formatPct(stationTally.pct)} at ${distanceFt} ft · ${stationTally.makes}/${stationTally.attempts}`}
            </Typography>

            {/* --- miss location ---------------------------------------- */}
            <View className="mt-5 rounded-2xl border border-border bg-surface-raised p-4">
                <Typography variant="title">Where did it hit?</Typography>
                <Typography variant="caption" className="mt-0.5">
                    Optional. Tapping the basket logs the miss and its spot in
                    one go.
                </Typography>

                <BasketMap
                    spots={missMap?.spots ?? []}
                    showGuides
                    onTapSpot={(spot) => void onMiss(spot)}
                    className="mt-3 self-center"
                />

                <View className="mt-2">
                    <BasketMapCaption
                        located={missMap?.located ?? 0}
                        total={missMap?.total ?? 0}
                    />
                </View>
            </View>

            {/* --- stations so far -------------------------------------- */}
            {session.stations.length > 0 ? (
                <View className="mt-5">
                    <View className="mb-2 flex-row items-center justify-between">
                        <Typography variant="h3">This session</Typography>
                        {sessionTally?.pct !== null && sessionTally !== null ? (
                            <Typography
                                variant="label"
                                className="text-content"
                            >
                                {sessionTally.makes}/{sessionTally.attempts} ·{' '}
                                {formatPct(sessionTally.pct as number)}
                            </Typography>
                        ) : null}
                    </View>

                    <View className="overflow-hidden rounded-2xl border border-border">
                        {session.stations.map((s, index) => {
                            const tally = tallyStations([s]);
                            const isCurrent = s.id === station?.id;
                            return (
                                <Pressable
                                    key={s.id}
                                    accessibilityRole="button"
                                    accessibilityLabel={`Switch to ${s.distanceFt} feet`}
                                    onPress={() => {
                                        setPickedDistanceFt(s.distanceFt);
                                        setPickedDiscId(s.discId);
                                    }}
                                    className={`flex-row items-center justify-between px-4 py-3 active:bg-surface-sunken ${
                                        isCurrent
                                            ? 'bg-primary-soft'
                                            : 'bg-surface-raised'
                                    } ${index > 0 ? 'border-t border-border' : ''}`}
                                >
                                    <View>
                                        <Typography variant="title">
                                            {s.distanceFt} ft
                                        </Typography>
                                        <Typography variant="caption">
                                            {discById(s.discId)?.name ??
                                                'Unknown putter'}
                                        </Typography>
                                    </View>
                                    <Typography
                                        variant="label"
                                        className="text-content"
                                    >
                                        {tally.makes}/{tally.attempts}
                                        {tally.pct !== null
                                            ? ` · ${formatPct(tally.pct)}`
                                            : ''}
                                    </Typography>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>
            ) : null}

            <Button
                variant="secondary"
                size="lg"
                className="mt-6"
                onPress={confirmFinish}
            >
                Finish session
            </Button>

            {/* --- putter switcher -------------------------------------- */}
            <BaseModal
                visible={switchingPutter}
                onClose={() => setSwitchingPutter(false)}
                title="Switch putter"
            >
                <Typography variant="caption" className="mb-3">
                    Your putts so far are kept against the putter you threw them
                    with.
                </Typography>
                <DiscPicker
                    selectedId={discId}
                    onSelect={(disc) => {
                        setPickedDiscId(disc.id);
                        void setLastDiscId(disc.id);
                        setSwitchingPutter(false);
                    }}
                />
            </BaseModal>
        </Screen>
    );
}
