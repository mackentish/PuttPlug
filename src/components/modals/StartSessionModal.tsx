import { router } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { Button } from '@/components/Button';
import { DiscPicker } from '@/components/DiscPicker';
import { Typography } from '@/components/Typography';
import { useData } from '@/hooks/useData';
import { newSession } from '@/lib/session';
import { type Disc } from '@/types';
import { BaseModal } from './BaseModal';

/**
 * Picking a putter is the only thing standing between "I want to practise" and
 * the logging screen, so it defaults to whatever was used last and Start is
 * one tap away for a returning user.
 */
export function StartSessionModal({
    visible,
    onClose,
}: {
    visible: boolean;
    onClose: () => void;
}) {
    const { saveSession, setActiveSessionId, lastDiscId, setLastDiscId } =
        useData();

    /*
        Selection is derived rather than copied into state on open. `pickedId`
        holds only what the user touched this time round; everything else falls
        back to the remembered putter. That way the default re-arms every time
        the sheet opens, and it still lands correctly if `lastDiscId` is read
        back from storage after this component first renders.
    */
    const [pickedId, setPickedId] = useState<string | null>(null);
    const selectedId = pickedId ?? lastDiscId;

    function onSelect(disc: Disc) {
        setPickedId(disc.id);
    }

    function close() {
        setPickedId(null);
        onClose();
    }

    async function start() {
        if (!selectedId) return;

        const session = newSession();
        await saveSession(session);
        await setActiveSessionId(session.id);
        await setLastDiscId(selectedId);

        close();
        router.push({
            pathname: '/session/active',
            params: { discId: selectedId },
        });
    }

    return (
        <BaseModal visible={visible} onClose={close} title="Start a session">
            <Typography variant="label" className="mb-3">
                Which putter are you throwing?
            </Typography>

            <DiscPicker selectedId={selectedId} onSelect={onSelect} />

            <View className="mt-5">
                <Button size="lg" disabled={!selectedId} onPress={start}>
                    Start session
                </Button>
                {!selectedId ? (
                    <Typography variant="caption" className="mt-2 text-center">
                        Pick a putter to get going. You can switch mid-session.
                    </Typography>
                ) : null}
            </View>
        </BaseModal>
    );
}
