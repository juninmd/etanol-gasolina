import 'react-native-gesture-handler';
import React from 'react';
import {View, StyleSheet} from 'react-native';
import {light as lightTheme, dark as darkTheme, mapping} from '@eva-design/eva';
import {ApplicationProvider, IconRegistry} from '@ui-kitten/components';
import {EvaIconsPack} from '@ui-kitten/eva-icons';
import {Provider, observer} from 'mobx-react';
import * as Stores from './stores';
import Routes from './routes';
import Celebration from './components/Celebration';
import CheckinPrompt from './components/CheckinPrompt';
import SmartAlert from './components/SmartAlert';

const ThemedApp = observer(() => {
  const {themeStore} = Stores;
  const currentTheme = themeStore.theme === 'light' ? lightTheme : darkTheme;
  const backgroundColor = themeStore.theme === 'light' ? '#ffffff' : '#222b45';

  return (
    <ApplicationProvider mapping={mapping} theme={currentTheme}>
      <View style={[styles.container, {backgroundColor}]}>
        <Routes />
        <Celebration />
        <CheckinPrompt />
        <SmartAlert />
      </View>
    </ApplicationProvider>
  );
});

const App = () => (
  <>
    <IconRegistry icons={EvaIconsPack} />
    <Provider {...Stores}>
      <ThemedApp />
    </Provider>
  </>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: '100vh',
    width: '100%',
  },
});

export default App;
