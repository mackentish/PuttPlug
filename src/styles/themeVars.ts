import { vars } from 'nativewind';
import colorThemes, { type ColorToken, type Palette } from './colorThemes';

export type PaletteName = keyof typeof colorThemes;
export type ThemeMode = 'light' | 'dark';

export const paletteNames = Object.keys(colorThemes) as PaletteName[];

/** Human-readable names for the settings picker. */
export const paletteLabels: Record<PaletteName, string> = {
    fairway: 'Fairway',
    dusk: 'Dusk',
    clay: 'Clay',
};

/**
 * The colour shown in the settings swatch for each palette. Derived rather
 * than hardcoded so a palette edit can never leave the picker out of date.
 */
export const paletteSwatch = (name: PaletteName) =>
    colorThemes[name].light.primary;

/** `#0F7A46` -> `15 122 70`, the space-separated form `rgb(var(--x))` needs. */
function hexToRgbTriplet(hex: string): string {
    const value = hex.replace('#', '');
    const r = parseInt(value.slice(0, 2), 16);
    const g = parseInt(value.slice(2, 4), 16);
    const b = parseInt(value.slice(4, 6), 16);
    return `${r} ${g} ${b}`;
}

function varsForPalette(palette: Palette) {
    return vars(
        Object.fromEntries(
            (Object.entries(palette) as [ColorToken, string][]).map(
                ([token, hex]) => [`--color-${token}`, hexToRgbTriplet(hex)]
            )
        )
    );
}

/*
    One `vars()` object per (palette, mode) pair, built once at module load.

    Unlike the usual NativeWind setup, mode is baked in here rather than left
    to the `dark:` variant. That is deliberate: it means no component ever
    writes `bg-surface dark:bg-black`, because `--color-surface` already holds
    the right value for the active mode. Swapping either the palette or the
    mode is a single style change on the root View.
*/
const themeVars = Object.fromEntries(
    paletteNames.map((name) => [
        name,
        {
            light: varsForPalette(colorThemes[name].light),
            dark: varsForPalette(colorThemes[name].dark),
        },
    ])
) as Record<PaletteName, Record<ThemeMode, ReturnType<typeof vars>>>;

/**
 * The style object to spread onto a root `View`. Every descendant resolves its
 * Tailwind colour classes against these variables.
 *
 * Remember that a React Native `<Modal>` renders into its own host view
 * OUTSIDE the React tree's style cascade, so any modal root has to apply this
 * again -- see `src/components/modals/BaseModal.tsx`.
 */
export function varsForTheme(palette: PaletteName, mode: ThemeMode) {
    return themeVars[palette][mode];
}

export function isPaletteName(value: string | null): value is PaletteName {
    return !!value && (paletteNames as string[]).includes(value);
}

export default themeVars;
