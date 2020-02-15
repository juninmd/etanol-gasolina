import { Button, Card, Text } from '@ui-kitten/components';
import React, { Component, } from 'react';
import { StyleSheet, View } from 'react-native';
import { inject, observer } from 'mobx-react';

import HomeStore from '../../stores/home.store';
import { TextInput } from 'react-native-gesture-handler';

interface Props {
    homeStore: HomeStore
}

@inject('homeStore')
@observer
export default class Home extends Component<Props> {

    render() {
        const { etanol, gasolina, resultado, calculate, handleForm } = this.props.homeStore;

        return (<>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Card>
                    <Text>Etanol:</Text>
                    <TextInput value={etanol.toString()} onChangeText={(etanol) => handleForm({ etanol })} />
                    <Text>Gasolina:</Text>
                    <TextInput value={gasolina.toString()} onChangeText={(gasolina) => handleForm({ gasolina })} />

                    <Button onPress={() => calculate()}>Calcular</Button>
                    <Text style={styles.paragraph}>{resultado}</Text>
                </Card>
            </View>
        </>);
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingTop: '10',
        padding: 8,
    },
    paragraph: {
        margin: 24,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});
