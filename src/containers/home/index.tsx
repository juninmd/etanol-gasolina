import { Button, Card, Input, Text, Layout, Icon, Modal } from '@ui-kitten/components';
import React, { Component, } from 'react';
import { inject, observer } from 'mobx-react';
import { StyleSheet, View, ScrollView } from 'react-native';

import HomeStore from '../../stores/home.store';
import StationsStore from '../../stores/stations.store';
import { Alert } from 'react-native';
import { reaction } from 'mobx';

interface Props {
    homeStore: HomeStore;
    stationsStore: StationsStore;
    navigation: any;
}

interface State {
    showTripCalculator: boolean;
    tripDistance: string;
    tripCost: string;
}

@inject('homeStore', 'stationsStore')
@observer
export default class Home extends Component<Props, State> {
    promoReaction: any;

    state: State = {
        showTripCalculator: false,
        tripDistance: '',
        tripCost: '',
    };

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

    calculateTripCost = () => {
        const { tripDistance } = this.state;
        const { bestStation } = this.props.stationsStore;
        const { etanolConsumption, gasolinaConsumption } = this.props.homeStore;

        if (!tripDistance || !bestStation) return;

        const distance = parseFloat(tripDistance.replace(',', '.'));
        const gasCons = parseFloat(gasolinaConsumption.replace(',', '.')) || 10; // Default 10km/l
        const ethCons = parseFloat(etanolConsumption.replace(',', '.')) || 7;   // Default 7km/l

        if (isNaN(distance)) return;

        // Calculate cost using best station prices
        const costGas = (distance / gasCons) * bestStation.priceGas;
        const costEth = (distance / ethCons) * bestStation.priceEthanol;

        const bestOption = costEth < costGas ? 'Etanol' : 'Gasolina';
        const bestPrice = Math.min(costGas, costEth);

        this.setState({
            tripCost: `R$ ${bestPrice.toFixed(2)} com ${bestOption}`
        });
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
        const { totalSavings, bestStation, checkinStation, dismissCheckin, points } = this.props.stationsStore;

        return (
            <Layout style={styles.container}>
                <View style={styles.header}>
                    <Text category='h1' style={styles.title}>Calculadora Flex</Text>
                    <View style={styles.pointsBadge}>
                        <Icon name='award' width={20} height={20} fill='#FFD700' />
                        <Text style={styles.pointsText}>{points} pts</Text>
                    </View>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Card style={styles.inputCard}>
                        <Text category='label' style={styles.label}>Preço do Etanol</Text>
                        <Input
                            placeholder='R$ 0.00'
                            value={etanol}
                            onChangeText={(etanol) => handleForm('etanol', etanol)}
                            keyboardType='numeric'
                            style={styles.input}
                        />

                        <Text category='label' style={styles.label}>Preço da Gasolina</Text>
                        <Input
                            placeholder='R$ 0.00'
                            value={gasolina}
                            onChangeText={(gasolina) => handleForm('gasolina', gasolina)}
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
                            onChangeText={(etanolConsumption) => handleForm('etanolConsumption', etanolConsumption)}
                            keyboardType='numeric'
                            style={styles.input}
                        />

                        <Text category='label' style={styles.label}>Km/l na Gasolina</Text>
                        <Input
                            placeholder='Ex: 10.0'
                            value={gasolinaConsumption}
                            onChangeText={(gasolinaConsumption) => handleForm('gasolinaConsumption', gasolinaConsumption)}
                            keyboardType='numeric'
                            style={styles.input}
                        />
                    </Card>

                    {this.renderResult()}

                    {/* Dashboard Header */}
                    <Card status='success' style={styles.dashboardCard}>
                        <View style={styles.dashboardHeader}>
                            <Icon name='trending-up-outline' width={32} height={32} fill='#fff' />
                            <View style={styles.dashboardTextContainer}>
                                <Text category='s1' style={styles.whiteText}>Economia Total</Text>
                                <Text category='h3' style={styles.whiteText}>R$ {totalSavings.toFixed(2)}</Text>
                            </View>
                        </View>
                    </Card>

                    {/* Smart Suggestion */}
                    {bestStation && (
                        <Card
                            style={styles.suggestionCard}
                            onPress={() => this.props.navigation.navigate('StationDetails', {stationId: bestStation.id})}
                        >
                            <View style={styles.suggestionHeader}>
                                <Icon name='star' width={24} height={24} fill='#FFD700' />
                                <Text category='h6' style={styles.suggestionTitle}>Melhor Opção Perto</Text>
                            </View>
                            <Text category='s1' style={{marginTop: 5}}>{bestStation.name}</Text>
                            <Text appearance='hint' style={{marginBottom: 10}}>{bestStation.address}</Text>
                            <View style={styles.priceRow}>
                                <Text status='info'>Gas: R$ {bestStation.priceGas.toFixed(2)}</Text>
                                <Text status='success'>Etanol: R$ {bestStation.priceEthanol.toFixed(2)}</Text>
                            </View>
                        </Card>
                    )}

                    <Button
                        style={styles.tripButton}
                        appearance='outline'
                        status='info'
                        onPress={() => this.setState({ showTripCalculator: true })}
                        accessoryLeft={(props) => <Icon {...props} name='map-outline'/>}
                    >
                        Simular Custo de Viagem
                    </Button>
                </ScrollView>

                <Modal
                    visible={!!checkinStation}
                    backdropStyle={styles.backdrop}
                    onBackdropPress={dismissCheckin}>
                    <Card disabled={true} style={styles.modalCard}>
                        <Text category='h5' style={{marginBottom: 10}}>Você está em {checkinStation?.name}?</Text>
                        <Text style={{marginBottom: 20}}>Ajude a comunidade atualizando o preço e ganhe pontos!</Text>
                        <Button onPress={() => {
                            const id = checkinStation?.id;
                            dismissCheckin();
                            if (id) this.props.navigation.navigate('StationDetails', { stationId: id });
                        }}>
                            Atualizar Agora
                        </Button>
                        <Button appearance='ghost' onPress={dismissCheckin} style={{marginTop: 10}}>
                            Não estou aqui
                        </Button>
                    </Card>
                </Modal>

                <Modal
                    visible={this.state.showTripCalculator}
                    backdropStyle={styles.backdrop}
                    onBackdropPress={() => this.setState({ showTripCalculator: false, tripCost: '' })}
                >
                    <Card disabled={true} style={styles.modalCard}>
                        <Text category='h5' style={{marginBottom: 10}}>Calculadora de Viagem</Text>
                        <Text style={{marginBottom: 10}}>Distância (Km):</Text>
                        <Input
                            placeholder='Ex: 150'
                            value={this.state.tripDistance}
                            onChangeText={text => this.setState({ tripDistance: text })}
                            keyboardType='numeric'
                            style={styles.input}
                        />
                        {this.state.tripCost ? (
                            <Text status='success' category='h6' style={{marginVertical: 10}}>{this.state.tripCost}</Text>
                        ) : null}
                        <Button onPress={this.calculateTripCost} style={{marginBottom: 10}}>
                            Calcular
                        </Button>
                        <Button appearance='ghost' onPress={() => this.setState({ showTripCalculator: false, tripCost: '' })}>
                            Fechar
                        </Button>
                    </Card>
                </Modal>
            </Layout>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 10,
    },
    pointsBadge: {
        position: 'absolute',
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        padding: 5,
        borderRadius: 12,
    },
    pointsText: {
        marginLeft: 5,
        fontWeight: 'bold',
        color: '#333',
    },
    scrollContent: {
        padding: 20,
    },
    title: {
        textAlign: 'center',
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
        marginBottom: 20,
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
    dashboardCard: {
        marginBottom: 15,
        backgroundColor: '#00E096', // Success color
        borderWidth: 0,
    },
    dashboardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dashboardTextContainer: {
        marginLeft: 15,
    },
    whiteText: {
        color: 'white',
    },
    suggestionCard: {
        marginBottom: 20,
        borderLeftWidth: 5,
        borderLeftColor: '#3366FF',
    },
    suggestionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    suggestionTitle: {
        marginLeft: 10,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
    },
    backdrop: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalCard: {
        padding: 20,
        width: 300,
    },
    tripButton: {
        marginBottom: 20
    }
});
