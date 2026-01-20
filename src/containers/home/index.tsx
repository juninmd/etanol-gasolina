import { Button, Card, Input, Text, Layout, Icon } from '@ui-kitten/components';
import React, { Component, } from 'react';
import { inject, observer } from 'mobx-react';
import { StyleSheet, View } from 'react-native';

import HomeStore from '../../stores/home.store';
import StationsStore from '../../stores/stations.store';
import { Alert } from 'react-native';
import { reaction } from 'mobx';

interface Props {
    homeStore: HomeStore;
    stationsStore: StationsStore;
}

@inject('homeStore', 'stationsStore')
@observer
export default class Home extends Component<Props> {
    promoReaction: any;

    componentDidMount() {
        this.checkPromos();

        // Reactive check for future updates
        this.promoReaction = reaction(
            () => {
                const { favorites, stations } = this.props.stationsStore;
                // React if favorites change or if promo status of a favorite changes
                return stations
                    .filter(s => favorites.includes(s.id) && s.isPromo)
                    .map(s => s.id)
                    .join(',');
            },
            (promoIds) => {
                if (promoIds) {
                    this.checkPromos();
                }
            }
        );
    }

    componentWillUnmount() {
        if (this.promoReaction) {
            this.promoReaction();
        }
    }

    checkPromos = () => {
        const { favorites, stations } = this.props.stationsStore;
        if (favorites.length > 0) {
            const promoStations = stations.filter(s => favorites.includes(s.id) && s.isPromo);
            if (promoStations.length > 0) {
                const stationNames = promoStations.map(s => s.name).join(', ');
                Alert.alert(
                    'Promoção Detectada!',
                    `Os seguintes postos favoritos estão em promoção: ${stationNames}. Aproveite!`
                );
            }
        }
    }

    handleEtanolChange = (etanol: string) => {
        this.props.homeStore.handleForm({ etanol });
    }

    handleGasolinaChange = (gasolina: string) => {
        this.props.homeStore.handleForm({ gasolina });
    }

    handleEtanolConsumptionChange = (etanolConsumption: string) => {
        this.props.homeStore.handleForm({ etanolConsumption });
    }

    handleGasolinaConsumptionChange = (gasolinaConsumption: string) => {
        this.props.homeStore.handleForm({ gasolinaConsumption });
    }

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
        const { etanol, gasolina, etanolConsumption, gasolinaConsumption, handleForm } = this.props.homeStore;

        return (
            <Layout style={styles.container}>
                <Text category='h1' style={styles.title}>Calculadora Flex</Text>

                <Card style={styles.inputCard}>
                    <Text category='label' style={styles.label}>Preço do Etanol</Text>
                    <Input
                        placeholder='R$ 0.00'
                        value={etanol}
                        onChangeText={this.handleEtanolChange}
                        keyboardType='numeric'
                        style={styles.input}
                    />

                    <Text category='label' style={styles.label}>Preço da Gasolina</Text>
                    <Input
                        placeholder='R$ 0.00'
                        value={gasolina}
                        onChangeText={this.handleGasolinaChange}
                        keyboardType='numeric'
                        style={styles.input}
                    />
                </Card>

                <Card style={styles.inputCard}>
                    <Text category='h6' style={styles.cardTitle}>Consumo (Opcional)</Text>
                    <Text category='label' style={styles.label}>Km/l no Etanol</Text>
                    <Input
                        placeholder='Ex: 7.0'
                        value={etanolConsumption}
                        onChangeText={this.handleEtanolConsumptionChange}
                        keyboardType='numeric'
                        style={styles.input}
                    />

                    <Text category='label' style={styles.label}>Km/l na Gasolina</Text>
                    <Input
                        placeholder='Ex: 10.0'
                        value={gasolinaConsumption}
                        onChangeText={this.handleGasolinaConsumptionChange}
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
    cardTitle: {
        marginBottom: 15,
        textAlign: 'center',
        color: '#888',
    },
});
