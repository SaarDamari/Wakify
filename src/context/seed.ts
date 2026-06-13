import { Alarm } from '../types';
import { generateId } from '../utils/id';

// Sample alarms shown on first launch so the list matches the mockup.
export function seedAlarms(): Alarm[] {
  return [
    {
      id: generateId(),
      hour: 6,
      minute: 30,
      label: 'Work Morning',
      days: [0, 1, 2, 3, 4], // Mon-Fri
      enabled: true,
      vibrateEnabled: true,
      vibratePattern: 'medium',
      nudgingEnabled: true,
      nudgeInterval: 5,
    },
    {
      id: generateId(),
      hour: 8,
      minute: 0,
      label: 'Weekend Breakfast',
      days: [5, 6], // Sat-Sun
      enabled: false,
      vibrateEnabled: true,
      vibratePattern: 'gentle',
      nudgingEnabled: false,
      nudgeInterval: 10,
    },
    {
      id: generateId(),
      hour: 7,
      minute: 15,
      label: 'Gym Session',
      days: [0, 2, 4], // Mon, Wed, Fri
      enabled: true,
      vibrateEnabled: true,
      vibratePattern: 'strong',
      nudgingEnabled: true,
      nudgeInterval: 5,
      genres: ['rock', 'electronic'],
    },
  ];
}
