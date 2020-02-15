import 'react-native-gesture-handler';

import * as Stores from './src/stores';

import { AppRegistry, SafeAreaView } from 'react-native';

import { Provider } from 'mobx-react';
import React from 'react';
import Routes from './src/routes';
import { name as appName } from './app.json';

const ProviderConfigured = () => (
    <Provider {...Stores}>
        <SafeAreaView style={{ flex: 1 }}>
            <Routes />
        </SafeAreaView>
    </Provider>
)

AppRegistry.registerComponent(appName, () => ProviderConfigured);
