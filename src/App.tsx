import 'react-native-gesture-handler';
import React from 'react';
import { View } from 'react-native';
import { light as lightTheme, dark as darkTheme, mapping } from '@eva-design/eva';
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { Provider, observer } from 'mobx-react';
import * as Stores from './stores';
import Routes from './routes';

const ThemedApp = observer(() => {
    const { themeStore } = Stores;
    const currentTheme = themeStore.theme === 'light' ? lightTheme : darkTheme;
    const backgroundColor = themeStore.theme === 'light' ? '#ffffff' : '#222b45';

    return (
        <ApplicationProvider mapping={mapping} theme={currentTheme}>
            <View style={{ flex: 1, backgroundColor }}>
                <Routes />
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

export default App;
