import {AppRegistry} from 'react-native';
import App from './App';
import appJson from './app.json';

const appName = appJson.name;

console.log('App starting...', appName);

AppRegistry.registerComponent(appName, () => App);
AppRegistry.runApplication(appName, {
  rootTag: document.getElementById('root'),
});
