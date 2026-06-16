import { ThemeName } from '../types';
import { palette } from './palette';

export type ColorScheme = 'light' | 'dark';

export interface Theme {
  name: ThemeName;
  accent: string; // toggles ON, Save button, selected chips, picker band tint
  accentDeep: string; // gradient end / pressed
  bannerFrom: string;
  bannerTo: string;
  background: string;
  text: string;
  subtext: string;
  card: string;
  cardBorder: string;
  dayActive: string; // navy fill for active day circles
  disabled: string;
  trackOff: string;
}

// Accent-specific fields, shared across light/dark.
type AccentFields = Pick<
  Theme,
  'name' | 'accent' | 'accentDeep' | 'bannerFrom' | 'bannerTo'
>;

const accents: Record<ThemeName, AccentFields> = {
  coral: {
    name: 'coral',
    accent: palette.coralDeep,
    accentDeep: palette.coralDeep,
    bannerFrom: palette.coralLight,
    bannerTo: palette.coralDeep,
  },
  blue: {
    name: 'blue',
    accent: palette.blueAccent,
    accentDeep: palette.blueAccentDeep,
    bannerFrom: palette.blueLight,
    bannerTo: palette.blueAccent,
  },
  purple: {
    name: 'purple',
    accent: palette.purpleAccent,
    accentDeep: palette.purpleDeep,
    bannerFrom: palette.purpleLight,
    bannerTo: palette.purpleAccent,
  },
  green: {
    name: 'green',
    accent: palette.greenAccent,
    accentDeep: palette.greenDeep,
    bannerFrom: palette.greenLight,
    bannerTo: palette.greenAccent,
  },
  sunset: {
    name: 'sunset',
    accent: palette.sunsetAccent,
    accentDeep: palette.sunsetDeep,
    bannerFrom: palette.sunsetLight,
    bannerTo: palette.sunsetAccent,
  },
  pink: {
    name: 'pink',
    accent: palette.pinkAccent,
    accentDeep: palette.pinkDeep,
    bannerFrom: palette.pinkLight,
    bannerTo: palette.pinkAccent,
  },
  teal: {
    name: 'teal',
    accent: palette.tealAccent,
    accentDeep: palette.tealDeep,
    bannerFrom: palette.tealLight,
    bannerTo: palette.tealAccent,
  },
};

// Neutral (surface/text) fields, swapped by color scheme.
type NeutralFields = Omit<Theme, keyof AccentFields>;

const lightNeutrals: NeutralFields = {
  background: palette.bg,
  text: palette.text,
  subtext: palette.subtext,
  card: palette.white,
  cardBorder: palette.cardBorder,
  dayActive: palette.navy,
  disabled: palette.disabledGray,
  trackOff: palette.trackOff,
};

const darkNeutrals: NeutralFields = {
  background: palette.bgDark,
  text: palette.textDark,
  subtext: palette.subtextDark,
  card: palette.surfaceDark,
  cardBorder: palette.cardBorderDark,
  dayActive: palette.dayActiveDark,
  disabled: palette.disabledDark,
  trackOff: palette.trackOffDark,
};

export function getTheme(name: ThemeName, scheme: ColorScheme): Theme {
  return {
    ...accents[name],
    ...(scheme === 'dark' ? darkNeutrals : lightNeutrals),
  };
}
