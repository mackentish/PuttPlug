/** @type {import('tailwindcss').Config} */

/*
    Every colour resolves through a CSS variable that the root View sets at
    runtime (see src/styles/themeVars.ts). The tokens are semantic, and each
    one already holds the correct value for the active light/dark mode -- which
    is why there is no `darkMode` key here and no `dark:` variant anywhere in
    the app. Changing palette or mode re-points the variables; class strings
    never change.
*/
const themed = (name) => `rgb(var(--color-${name}) / <alpha-value>)`;

const tokens = [
    'surface',
    'surface-raised',
    'surface-sunken',
    'border',
    'content',
    'content-muted',
    'content-invert',
    'primary',
    'primary-press',
    'primary-soft',
    'success',
    'success-soft',
    'danger',
    'danger-soft',
    'warning',
    'warning-soft',
    'overlay',
];

module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    presets: [require('nativewind/preset')],
    theme: {
        extend: {
            colors: Object.fromEntries(
                tokens.map((token) => [token, themed(token)])
            ),
            // `border-border` needs the token available as a border colour too,
            // which the `colors` entry above already provides.
        },
    },
    plugins: [],
};
