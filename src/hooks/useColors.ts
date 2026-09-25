import colorThemes, { type Palette } from '@/styles/colorThemes';
import { useTheme } from './useTheme';

/**
 * The active palette as raw hex.
 *
 * Styling goes through Tailwind classes almost everywhere; this is for the
 * handful of React Native props that take a colour string and can't be driven
 * by a className -- `placeholderTextColor`, tab bar tint colours, and the
 * `color` prop on `@expo/vector-icons`.
 */
export function useColors(): Palette {
    const { palette, resolvedMode } = useTheme();
    return colorThemes[palette][resolvedMode];
}
