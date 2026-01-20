import 'react-native-gesture-handler';
import React from 'react';
import { View } from 'react-native';
import { light as lightTheme, mapping } from '@eva-design/eva';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { Provider } from 'mobx-react';
import * as Stores from './stores';
import Routes from './routes';

const App = () => (
    <>
        <IconRegistry icons={EvaIconsPack} />
        <Provider {...Stores}>
            <ApplicationProvider mapping={mapping} theme={lightTheme}>
                <View style={{ flex: 1 }}>
                    <Routes />
                </View>
            </ApplicationProvider>
        </Provider>
    </>
);

export default App;
