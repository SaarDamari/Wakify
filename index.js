/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { registerAlarmBackgroundHandler } from './src/services/alarmEvents';

// Must be registered before the app starts so alarms reschedule when killed.
registerAlarmBackgroundHandler();

AppRegistry.registerComponent(appName, () => App);
