import { Button, Text, View } from 'react-native';
import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';

import HomeStore from '../../stores/home.store';

interface Props {
    homeStore: HomeStore
}

@inject('homeStore')
@observer
export default class Home extends Component<Props> {

    render() {
        const { numbers, increment, decrement, reset } = this.props.homeStore;

        return (<>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text>Home Screen</Text>
                <Text>{numbers}</Text>
                <Button onPress={() => increment()} title="Incrementar"></Button>
                <Button onPress={() => decrement()} title="Decrementar"></Button>
                <Button onPress={() => reset()} title="Zerar"></Button>
            </View>
        </>);
    }
}
