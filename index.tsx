import {AppRegistry, Platform} from 'react-native';
import App from './src/App';

// O projeto nativo gerado pelo Expo registra o componente raiz como "main".
const appName = 'main';

AppRegistry.registerComponent(appName, () => App);

if (Platform.OS === 'web') {
  const rootTag =
    document.getElementById('root') || document.getElementById('main');
  AppRegistry.runApplication(appName, {rootTag});
}
