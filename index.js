/**
 * @format
 */

import { AppRegistry } from 'react-native';
import notifee from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';
import { initI18n } from './src/i18n';
import { registerAlarmBackgroundHandler } from './src/services/alarmEvents';

// Detect OS language + apply RTL before the React tree mounts.
initI18n();

// Must be registered before the app starts so alarms reschedule when killed.
registerAlarmBackgroundHandler();

// The alarm notification runs as a media foreground service (so audio + process
// survive Doze/background). This task keeps the service alive while ringing; it
// is ended by notifee.stopForegroundService() on Stop/Snooze (see App.tsx).
notifee.registerForegroundService(() => new Promise(() => {}));

AppRegistry.registerComponent(appName, () => App);
