/*
    THE file to edit when iterating on the colour scheme.

    Two rules make this work:

    1. Every token is SEMANTIC (`surface`, `content`, `danger`) rather than
       literal (`green-500`). A component says what a colour is *for*, never
       what it looks like.

    2. Every palette declares a complete `light` map and a complete `dark` map
       using the exact same token names. Dark mode is a different set of VALUES
       behind the same names -- it is not a set of `dark:` class overrides. So
       a component writes `bg-surface-raised text-content` exactly once and it
       is correct in both modes.

    Adding a palette is just adding a key here: themeVars.ts, the settings
    picker and the Tailwind config all pick it up automatically.
*/

/** The token names every palette must define, in both modes. */
export type ColorToken =
    /** Screen background. */
    | 'surface'
    /** Cards and sheets sitting on top of `surface`. */
    | 'surface-raised'
    /** Inputs and inset rows recessed into `surface`. */
    | 'surface-sunken'
    /** Hairline dividers and card outlines. */
    | 'border'
    /** Primary text. */
    | 'content'
    /** Labels, captions, helper copy. */
    | 'content-muted'
    /** Text/icons sitting on `primary`, `success` or `danger` fills. */
    | 'content-invert'
    /** Brand colour: primary buttons, active tab, selected chip. */
    | 'primary'
    /** Pressed state for `primary`. */
    | 'primary-press'
    /** Tinted `primary` background for selected/emphasised surfaces. */
    | 'primary-soft'
    /** Makes. */
    | 'success'
    | 'success-soft'
    /** Misses, destructive actions. */
    | 'danger'
    | 'danger-soft'
    /** Cautionary emphasis. */
    | 'warning'
    | 'warning-soft'
    /** Modal scrim, always used at partial alpha (e.g. `bg-overlay/50`). */
    | 'overlay';

export type Palette = Record<ColorToken, string>;
export type ColorTheme = { light: Palette; dark: Palette };

const colorThemes = {
    fairway: {
        light: {
            surface: '#F5FAF6',
            'surface-raised': '#FFFFFF',
            'surface-sunken': '#E7F1EA',
            border: '#D2E4D8',
            content: '#0B1A11',
            'content-muted': '#5A6F61',
            'content-invert': '#FFFFFF',
            primary: '#0F7A46',
            'primary-press': '#0B5C35',
            'primary-soft': '#DAF0E3',
            success: '#15803D',
            'success-soft': '#DCFCE7',
            danger: '#C2321F',
            'danger-soft': '#FDE4E0',
            warning: '#B45309',
            'warning-soft': '#FCF0DC',
            overlay: '#06120B',
        },
        dark: {
            surface: '#07120C',
            'surface-raised': '#0F1F16',
            'surface-sunken': '#162C20',
            border: '#23402F',
            content: '#EAF5EE',
            'content-muted': '#93AC9E',
            'content-invert': '#06120B',
            primary: '#2FBE74',
            'primary-press': '#239A5D',
            'primary-soft': '#14301F',
            success: '#34D07A',
            'success-soft': '#10301D',
            danger: '#F2684F',
            'danger-soft': '#34160F',
            warning: '#F0A93C',
            'warning-soft': '#332411',
            overlay: '#000000',
        },
    },
    dusk: {
        light: {
            surface: '#F9F7FD',
            'surface-raised': '#FFFFFF',
            'surface-sunken': '#EEE9F8',
            border: '#DED6F0',
            content: '#16102A',
            'content-muted': '#655C82',
            'content-invert': '#FFFFFF',
            primary: '#6D40D9',
            'primary-press': '#552FB0',
            'primary-soft': '#E6DDFA',
            success: '#15803D',
            'success-soft': '#DCFCE7',
            danger: '#C2321F',
            'danger-soft': '#FDE4E0',
            warning: '#B45309',
            'warning-soft': '#FCF0DC',
            overlay: '#0D0820',
        },
        dark: {
            surface: '#0B0818',
            'surface-raised': '#151125',
            'surface-sunken': '#1E1833',
            border: '#2F2650',
            content: '#EFEBFA',
            'content-muted': '#A79CC6',
            'content-invert': '#0D0820',
            primary: '#9B78F0',
            'primary-press': '#7E58D9',
            'primary-soft': '#241B3D',
            success: '#34D07A',
            'success-soft': '#10301D',
            danger: '#F2684F',
            'danger-soft': '#34160F',
            warning: '#F0A93C',
            'warning-soft': '#332411',
            overlay: '#000000',
        },
    },
    clay: {
        light: {
            surface: '#FDF8F4',
            'surface-raised': '#FFFFFF',
            'surface-sunken': '#F6E9DF',
            border: '#EBD8C8',
            content: '#23150C',
            'content-muted': '#7A6455',
            'content-invert': '#FFFFFF',
            primary: '#C2541C',
            'primary-press': '#9C4115',
            'primary-soft': '#FAE3D3',
            success: '#15803D',
            'success-soft': '#DCFCE7',
            danger: '#B02418',
            'danger-soft': '#FBDDD9',
            warning: '#B45309',
            'warning-soft': '#FCF0DC',
            overlay: '#1A0F08',
        },
        dark: {
            surface: '#120B06',
            'surface-raised': '#1E140D',
            'surface-sunken': '#2B1E14',
            border: '#3F2D1F',
            content: '#F8EFE7',
            'content-muted': '#B79C88',
            'content-invert': '#1A0F08',
            primary: '#E87A3C',
            'primary-press': '#C85F26',
            'primary-soft': '#33200F',
            success: '#34D07A',
            'success-soft': '#10301D',
            danger: '#F2684F',
            'danger-soft': '#34160F',
            warning: '#F0A93C',
            'warning-soft': '#332411',
            overlay: '#000000',
        },
    },
} satisfies Record<string, ColorTheme>;

export default colorThemes;
