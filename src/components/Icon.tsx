import React from 'react';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';
import { useTheme } from '../context/SettingsContext';

export type IconName =
  | 'gear'
  | 'bell'
  | 'phone'
  | 'trendingUp'
  | 'calendar'
  | 'close'
  | 'plus'
  | 'clock'
  | 'palette'
  | 'music'
  | 'apple'
  | 'spotify'
  | 'play'
  | 'check'
  | 'chevronRight'
  | 'crown'
  | 'trash'
  | 'shield';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

// Minimal Feather-style line icons drawn with react-native-svg.
export function Icon({
  name,
  size = 22,
  color,
  strokeWidth = 2,
}: IconProps) {
  const theme = useTheme();
  // Default to the theme text color so icons adapt to light/dark.
  const stroke = color ?? theme.text;
  const common = {
    stroke,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'gear' && (
        <>
          <Circle cx={12} cy={12} r={3} {...common} />
          <Path
            d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
            {...common}
          />
        </>
      )}
      {name === 'bell' && (
        <>
          <Path
            d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
            {...common}
          />
          <Path d="M13.73 21a2 2 0 0 1-3.46 0" {...common} />
        </>
      )}
      {name === 'phone' && (
        <>
          <Rect x={5} y={2} width={14} height={20} rx={2} ry={2} {...common} />
          <Line x1={12} y1={18} x2={12} y2={18} {...common} />
        </>
      )}
      {name === 'trendingUp' && (
        <>
          <Polyline points="23 6 13.5 15.5 8.5 10.5 1 18" {...common} />
          <Polyline points="17 6 23 6 23 12" {...common} />
        </>
      )}
      {name === 'calendar' && (
        <>
          <Rect x={3} y={4} width={18} height={18} rx={2} ry={2} {...common} />
          <Line x1={16} y1={2} x2={16} y2={6} {...common} />
          <Line x1={8} y1={2} x2={8} y2={6} {...common} />
          <Line x1={3} y1={10} x2={21} y2={10} {...common} />
        </>
      )}
      {name === 'close' && (
        <>
          <Line x1={18} y1={6} x2={6} y2={18} {...common} />
          <Line x1={6} y1={6} x2={18} y2={18} {...common} />
        </>
      )}
      {name === 'plus' && (
        <>
          <Line x1={12} y1={5} x2={12} y2={19} {...common} />
          <Line x1={5} y1={12} x2={19} y2={12} {...common} />
        </>
      )}
      {name === 'clock' && (
        <>
          <Circle cx={12} cy={12} r={9} {...common} />
          <Polyline points="12 7 12 12 15 14" {...common} />
        </>
      )}
      {name === 'palette' && (
        <>
          <Path
            d="M12 2a10 10 0 0 0 0 20 2.5 2.5 0 0 0 2.5-2.5c0-.66-.26-1.26-.68-1.7a2.5 2.5 0 0 1 1.76-4.27H18a4 4 0 0 0 4-4c0-4.42-4.48-7.5-10-7.5z"
            {...common}
          />
          <Circle cx={7.5} cy={10.5} r={1} fill={stroke} stroke="none" />
          <Circle cx={9.5} cy={6.5} r={1} fill={stroke} stroke="none" />
          <Circle cx={14.5} cy={6.5} r={1} fill={stroke} stroke="none" />
        </>
      )}
      {name === 'music' && (
        <>
          <Path d="M9 18V5l12-2v13" {...common} />
          <Circle cx={6} cy={18} r={3} {...common} />
          <Circle cx={18} cy={16} r={3} {...common} />
        </>
      )}
      {name === 'apple' && (
        <Path
          d="M17.05 12.54c-.03-2.6 2.12-3.85 2.22-3.91-1.21-1.77-3.1-2.02-3.77-2.05-1.6-.16-3.13.94-3.94.94-.82 0-2.07-.92-3.41-.89-1.75.02-3.37 1.02-4.27 2.59-1.83 3.17-.47 7.86 1.31 10.43.87 1.26 1.9 2.67 3.25 2.62 1.31-.05 1.8-.84 3.38-.84 1.57 0 2.02.84 3.4.81 1.4-.02 2.29-1.28 3.15-2.55.99-1.46 1.4-2.88 1.42-2.95-.03-.01-2.72-1.04-2.75-4.13zM14.5 4.94c.72-.87 1.2-2.08 1.07-3.29-1.03.04-2.28.69-3.02 1.56-.66.77-1.24 2-1.09 3.18 1.15.09 2.32-.58 3.04-1.45z"
          fill={stroke}
          stroke="none"
        />
      )}
      {name === 'spotify' && (
        <>
          <Circle cx={12} cy={12} r={11} fill={stroke} stroke="none" />
          <Path
            d="M6.8 9.2c3.4-1 7.6-.8 10.6 1.05M7.4 12.4c2.8-.8 6-.6 8.5.95M8 15.4c2.2-.6 4.6-.45 6.5.8"
            stroke="#000000"
            strokeWidth={1.6}
            strokeLinecap="round"
            fill="none"
          />
        </>
      )}
      {name === 'play' && (
        <Path d="M7 5l12 7-12 7z" fill={stroke} stroke="none" />
      )}
      {name === 'check' && <Polyline points="20 6 9 17 4 12" {...common} />}
      {name === 'chevronRight' && (
        <Polyline points="9 6 15 12 9 18" {...common} />
      )}
      {name === 'crown' && (
        <Path
          d="M3 7l4.5 4L12 5l4.5 6L21 7l-1.5 11h-15zM4.5 20h15"
          {...common}
        />
      )}
      {name === 'trash' && (
        <>
          <Polyline points="3 6 5 6 21 6" {...common} />
          <Path
            d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
            {...common}
          />
          <Line x1={10} y1={11} x2={10} y2={17} {...common} />
          <Line x1={14} y1={11} x2={14} y2={17} {...common} />
        </>
      )}
      {name === 'shield' && (
        <Path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z" {...common} />
      )}
    </Svg>
  );
}
