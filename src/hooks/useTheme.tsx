import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { Appearance } from 'react-native';
import { KEYS, read, write } from '@/lib/storage';
import {
    type PaletteName,
    type ThemeMode,
    isPaletteName,
} from '@/styles/themeVars';
import { type Settings } from '@/types';

/*
    Two independent preferences: which palette, and light vs dark vs follow the
    OS. Both persist locally.

    Unlike a typical NativeWind app this does NOT call `colorScheme.set()`,
    because no `dark:` class variant is used anywhere. `resolvedMode` is fed
    straight into `varsForTheme()` on the root View, and every colour token
    changes value underneath the same class names.
*/

export type ModePreference = 'system' | 'light' | 'dark';

type ThemeContextValue = {
    palette: PaletteName;
    setPalette: (palette: PaletteName) => void;
    /** What the user chose. */
    mode: ModePreference;
    setMode: (mode: ModePreference) => void;
    /** What that actually resolves to right now. */
    resolvedMode: ThemeMode;
    /** False until stored preferences are read, so the first paint can wait. */
    isReady: boolean;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const DEFAULT_PALETTE: PaletteName = 'fairway';

function isModePreference(value: unknown): value is ModePreference {
    return value === 'system' || value === 'light' || value === 'dark';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [palette, setPaletteState] = useState<PaletteName>(DEFAULT_PALETTE);
    const [mode, setModeState] = useState<ModePreference>('system');
    const [systemMode, setSystemMode] = useState<ThemeMode>(
        Appearance.getColorScheme() === 'dark' ? 'dark' : 'light'
    );
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        let cancelled = false;

        (async () => {
            const stored = await read<Partial<Settings>>(KEYS.settings, {});
            if (cancelled) return;

            if (isPaletteName(stored.palette ?? null)) {
                setPaletteState(stored.palette as PaletteName);
            }
            if (isModePreference(stored.mode)) {
                setModeState(stored.mode);
            }
            setIsReady(true);
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    // Follow the OS switch live rather than only at launch, so flipping the
    // system appearance while on "System" updates the app immediately.
    useEffect(() => {
        const sub = Appearance.addChangeListener(({ colorScheme }) => {
            setSystemMode(colorScheme === 'dark' ? 'dark' : 'light');
        });
        return () => sub.remove();
    }, []);

    const persist = useCallback(async (patch: Partial<Settings>) => {
        const current = await read<Partial<Settings>>(KEYS.settings, {});
        await write(KEYS.settings, { ...current, ...patch });
    }, []);

    const setPalette = useCallback(
        (next: PaletteName) => {
            setPaletteState(next);
            void persist({ palette: next });
        },
        [persist]
    );

    const setMode = useCallback(
        (next: ModePreference) => {
            setModeState(next);
            void persist({ mode: next });
        },
        [persist]
    );

    const resolvedMode: ThemeMode = mode === 'system' ? systemMode : mode;

    const value = useMemo<ThemeContextValue>(
        () => ({
            palette,
            setPalette,
            mode,
            setMode,
            resolvedMode,
            isReady,
        }),
        [palette, setPalette, mode, setMode, resolvedMode, isReady]
    );

    return (
        <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    );
}

export function useTheme(): ThemeContextValue {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used inside a ThemeProvider');
    }
    return context;
}
