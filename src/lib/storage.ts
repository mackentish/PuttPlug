import AsyncStorage from '@react-native-async-storage/async-storage';

/*
    Every byte this app produces lives here, on the phone. There is no server,
    no account and no sync -- which is the point: putting practice happens on a
    field with no signal.

    The `v1` in each key leaves room to migrate the shape (or move to
    expo-sqlite if session volume ever justifies it) without touching callers.
*/

export const KEYS = {
    discs: 'puttplug:v1:discs',
    sessions: 'puttplug:v1:sessions',
    settings: 'puttplug:v1:settings',
} as const;

/**
 * Reads and parses a key, falling back to `fallback` if it is missing or the
 * stored JSON is unreadable. Practice data is never worth crashing over: a
 * corrupt blob degrades to "no history" rather than a broken app.
 */
export async function read<T>(key: string, fallback: T): Promise<T> {
    try {
        const raw = await AsyncStorage.getItem(key);
        if (raw === null) return fallback;
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}

export async function write<T>(key: string, value: T): Promise<void> {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Writing through on every tap means a single failure is not worth
        // interrupting a session for -- the next tap rewrites the whole blob.
    }
}

export async function remove(key: string): Promise<void> {
    try {
        await AsyncStorage.removeItem(key);
    } catch {
        // See above.
    }
}
