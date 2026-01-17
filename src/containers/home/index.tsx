import { Button, Card, Input, Text, Layout, Icon } from '@ui-kitten/components';
import React, { Component, } from 'react';
import { inject, observer } from 'mobx-react';
import { StyleSheet, View } from 'react-native';

import HomeStore from '../../stores/home.store';

interface Props {
    homeStore: HomeStore
}

@inject('homeStore')
@observer
export default class Home extends Component<Props> {

    renderResult = () => {
        const { resultado, recommendation } = this.props.homeStore;
        if (!resultado) return null;

        let status = 'basic';
        if (recommendation === 'ethanol') status = 'success';
        if (recommendation === 'gas') status = 'info';
        if (recommendation === 'equal') status = 'warning';

        return (
            <Card status={status} style={styles.resultCard}>
                <Text category='h5' style={styles.resultText}>{resultado}</Text>
                <Text category='s1' style={styles.resultSubText}>
                    {recommendation === 'ethanol' && 'O etanol está rendendo mais!'}
                    {recommendation === 'gas' && 'A gasolina está valendo mais a pena!'}
                    {recommendation === 'equal' && 'Ambos têm o mesmo custo-benefício.'}
                </Text>
            </Card>
        );
    }

    render() {
        const { etanol, gasolina, handleForm } = this.props.homeStore;

        return (
            <Layout style={styles.container}>
                <Text category='h1' style={styles.title}>Calculadora Flex</Text>

                <Card style={styles.inputCard}>
                    <Text category='label' style={styles.label}>Preço do Etanol</Text>
                    <Input
                        placeholder='R$ 0.00'
                        value={etanol}
                        onChangeText={(etanol) => handleForm({ etanol })}
                        keyboardType='numeric'
                        style={styles.input}
                    />

                    <Text category='label' style={styles.label}>Preço da Gasolina</Text>
                    <Input
                        placeholder='R$ 0.00'
                        value={gasolina}
                        onChangeText={(gasolina) => handleForm({ gasolina })}
                        keyboardType='numeric'
                        style={styles.input}
                    />
                </Card>

                {this.renderResult()}

            </Layout>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        textAlign: 'center',
        marginBottom: 30,
        color: '#3366FF'
    },
    inputCard: {
        marginBottom: 20,
    },
    label: {
        marginBottom: 5,
    },
    input: {
        marginBottom: 15,
    },
    resultCard: {
        marginTop: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    resultText: {
        textAlign: 'center',
        fontWeight: 'bold',
    },
    resultSubText: {
        textAlign: 'center',
        marginTop: 10,
        color: '#666'
    },
});
