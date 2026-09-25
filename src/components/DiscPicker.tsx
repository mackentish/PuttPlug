import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useActiveDiscs, useData } from '@/hooks/useData';
import { type Disc } from '@/types';
import { Button } from './Button';
import { Input } from './Input';
import { Typography } from './Typography';

/**
 * Choose a putter, or create one on the spot with just a name.
 *
 * The quick-create matters: a putter is required to start a session, and
 * making someone fill in flight numbers before they can throw their first putt
 * would put a form between the user and the one thing this app is for. Details
 * can be added later from the Bag.
 */
export function DiscPicker({
    selectedId,
    onSelect,
}: {
    selectedId: string | null;
    onSelect: (disc: Disc) => void;
}) {
    const discs = useActiveDiscs();
    const { addDisc } = useData();
    const colors = useColors();

    const [creating, setCreating] = useState(discs.length === 0);
    const [name, setName] = useState('');
    const [error, setError] = useState<string | undefined>();

    async function create() {
        const trimmed = name.trim();
        if (!trimmed) {
            setError('Give your putter a name.');
            return;
        }
        const disc = await addDisc({ name: trimmed });
        setName('');
        setError(undefined);
        setCreating(false);
        onSelect(disc);
    }

    return (
        <View className="gap-2">
            {discs.map((disc) => {
                const selected = disc.id === selectedId;
                return (
                    <Pressable
                        key={disc.id}
                        accessibilityRole="radio"
                        accessibilityState={{ selected }}
                        onPress={() => onSelect(disc)}
                        className={`flex-row items-center justify-between rounded-2xl border p-4 ${
                            selected
                                ? 'border-primary bg-primary-soft'
                                : 'border-border bg-surface-raised active:bg-surface-sunken'
                        }`}
                    >
                        <View className="shrink">
                            <Typography variant="title">{disc.name}</Typography>
                            <Typography variant="caption">
                                {describeDisc(disc) || 'No details yet'}
                            </Typography>
                        </View>

                        {selected ? (
                            <Ionicons
                                name="checkmark-circle"
                                size={24}
                                color={colors.primary}
                            />
                        ) : null}
                    </Pressable>
                );
            })}

            {creating ? (
                <View className="gap-3 rounded-2xl border border-dashed border-border bg-surface-raised p-4">
                    <Input
                        label="Putter name"
                        hint="That's all you need — add flight numbers later in your bag."
                        placeholder="e.g. Judge"
                        value={name}
                        error={error}
                        autoFocus
                        returnKeyType="done"
                        onChangeText={(text) => {
                            setName(text);
                            if (error) setError(undefined);
                        }}
                        onSubmitEditing={create}
                    />
                    <View className="flex-row gap-2">
                        <Button
                            variant="ghost"
                            className="flex-1"
                            onPress={() => {
                                setCreating(false);
                                setName('');
                                setError(undefined);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button className="flex-1" onPress={create}>
                            Add putter
                        </Button>
                    </View>
                </View>
            ) : (
                <Button
                    variant="ghost"
                    onPress={() => setCreating(true)}
                    icon={
                        <Ionicons name="add" size={18} color={colors.content} />
                    }
                >
                    New putter
                </Button>
            )}
        </View>
    );
}

/** `"Star · 174g · 2/4/0/1"` — only the parts that were actually filled in. */
export function describeDisc(disc: Disc): string {
    const parts: string[] = [];
    if (disc.plastic) parts.push(disc.plastic);
    if (disc.weightG !== undefined) parts.push(`${disc.weightG}g`);

    const flight = [disc.speed, disc.glide, disc.turn, disc.fade];
    if (flight.some((n) => n !== undefined)) {
        parts.push(flight.map((n) => (n === undefined ? '–' : n)).join(' / '));
    }

    return parts.join(' · ');
}
