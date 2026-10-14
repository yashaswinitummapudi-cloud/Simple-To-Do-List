/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#1E382F',
    tint: '#3D735B',

    // Core surfaces
    background: '#F7F5EF',
    foreground: '#1E382F',

    // Cards / elevated surfaces
    card: '#FFFEFA',
    cardForeground: '#1E382F',

    // Primary action color (buttons, links, active states)
    primary: '#3D735B',
    primaryForeground: '#ffffff',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#EAECE3',
    secondaryForeground: '#355345',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#ECEAE2',
    mutedForeground: '#7C8479',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#F2E3D1',
    accentForeground: '#75543A',

    // Destructive actions (delete, error states)
    destructive: '#B95749',
    destructiveForeground: '#ffffff',

    // Borders and input outlines
    border: '#E6E3D9',
    input: '#E6E3D9',
  },
  dark: {
    text: '#F0F2E9',
    tint: '#A5C8A9',
    background: '#17251F',
    foreground: '#F0F2E9',
    card: '#22332B',
    cardForeground: '#F0F2E9',
    primary: '#A5C8A9',
    primaryForeground: '#17251F',
    secondary: '#2B3E34',
    secondaryForeground: '#E0E8DC',
    muted: '#2B3E34',
    mutedForeground: '#A4B0A3',
    accent: '#493B2D',
    accentForeground: '#F0D0A7',
    destructive: '#E18A7C',
    destructiveForeground: '#17251F',
    border: '#3A4C41',
    input: '#3A4C41',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 16,
};

export default colors;
