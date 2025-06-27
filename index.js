/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
// import { OneSignal } from 'react-native-onesignal';

// OneSignal.initialize('64fd0b66-e4fe-431f-b95f-1ef857e1adfd');
// //YÊU CẦU QUYỀN gửi thông báo từ người dùng
// OneSignal.Notifications.requestPermission(true);

AppRegistry.registerComponent(appName, () => App);
