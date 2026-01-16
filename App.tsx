
import React, { Component } from 'react';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { mapping, light as lightTheme } from '@eva-design/eva';
import { Provider } from 'mobx-react';
import * as store from './src/stores';
import Routes from './src/routes';
import 'react-native-gesture-handler';

export default class App extends Component {
  render() {
    return (
      <>
        <IconRegistry icons={EvaIconsPack} />
        <Provider {...store}>
          <ApplicationProvider mapping={mapping} theme={lightTheme}>
            <Routes />
          </ApplicationProvider>
        </Provider>
      </>
    );
  }
}
