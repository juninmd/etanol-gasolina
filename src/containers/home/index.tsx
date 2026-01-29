import { Button, Card, Input, Text, Layout, Icon, Modal, Toggle } from '@ui-kitten/components';
import React, { Component, } from 'react';
import { inject, observer } from 'mobx-react';
import { StyleSheet, View, ScrollView } from 'react-native';

import HomeStore from '../../stores/home.store';
import StationsStore from '../../stores/stations.store';
import GarageStore from '../../stores/garage.store';
import ThemeStore from '../../stores/theme.store';
import { Alert } from 'react-native';
import { reaction } from 'mobx';

interface Props {
    homeStore: HomeStore;
    stationsStore: StationsStore;
    garageStore: GarageStore;
    themeStore: ThemeStore;
    navigation: any;
}

interface State {
    showTripCalculator: boolean;
    tripDistance: string;
    tripCost: string;
    promoMessage: string | null;
}

@inject('homeStore', 'stationsStore', 'garageStore', 'themeStore')
@observer
export default class Home extends Component<Props, State> {
    promoReaction: any;

    state: State = {
        showTripCalculator: false,
        tripDistance: '',
        tripCost: '',
        promoMessage: null,
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
                this.setState({
                    promoMessage: `Promoção nos favoritos: ${stationNames}!`
                });
            } else {
                this.setState({ promoMessage: null });
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
                <Text category='s1' appearance='hint' style={styles.resultSubText}>
                    {recommendation === 'ethanol' && 'O etanol está rendendo mais!'}
                    {recommendation === 'gas' && 'A gasolina está valendo mais a pena!'}
                    {recommendation === 'equal' && 'Ambos têm o mesmo custo-benefício.'}
                </Text>
            </Card>
        );
    }

    renderGamificationCard = () => {
        const { level, nextLevelPoints, progress, points, badges } = this.props.stationsStore;
        return (
            <Card style={styles.gamificationCard}>
                <View style={styles.levelHeader}>
                    <Icon name='shield-outline' width={30} height={30} fill='#3366FF' />
                    <View style={{marginLeft: 10}}>
                        <Text category='h6'>Nível: {level}</Text>
                        <Text category='c1' appearance='hint'>Próximo nível em {nextLevelPoints - points} pts</Text>
                    </View>
                </View>
                <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
                </View>
                <Text category='c1' style={{textAlign: 'right', marginTop: 5}}>{Math.floor(progress * 100)}%</Text>

                <View style={{marginTop: 15, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10}}>
                    <Text category='c2' style={{marginBottom: 10, fontWeight: 'bold'}}>Minhas Conquistas</Text>
                    <View style={{flexDirection: 'row', justifyContent: 'space-around'}}>
                        {badges.map(badge => (
                            <View key={badge.id} style={{alignItems: 'center', opacity: badge.unlocked ? 1 : 0.4}}>
                                <Icon name={badge.icon} width={28} height={28} fill={badge.unlocked ? '#FFD700' : '#8F9BB3'} />
                            </View>
                        ))}
                    </View>
                </View>
            </Card>
        );
    }

    renderActivityItem = (item) => {
        let iconName = 'activity-outline';
        let iconColor = '#8F9BB3';

        if (item.type === 'savings') { iconName = 'trending-up-outline'; iconColor = '#00E096'; }
        if (item.type === 'price_update') { iconName = 'pricetags-outline'; iconColor = '#3366FF'; }
        if (item.type === 'verification') { iconName = 'checkmark-circle-2-outline'; iconColor = '#FFAAA5'; }
        if (item.type === 'comment') { iconName = 'message-circle-outline'; iconColor = '#FFD700'; }

        const timeAgo = Math.floor((Date.now() - item.timestamp) / 60000);
        let timeText = `${timeAgo} min`;
        if (timeAgo > 60) timeText = `${Math.floor(timeAgo / 60)}h`;

        return (
            <View key={item.id} style={styles.activityItem}>
                <Icon name={iconName} width={20} height={20} fill={iconColor} style={{marginRight: 10}} />
                <View style={{flex: 1}}>
                    <Text category='s2' style={{fontSize: 13}}>
                        <Text style={{fontWeight: 'bold'}}>{item.author}</Text> {item.text}
                    </Text>
                    <Text category='c2' appearance='hint'>{timeText} atrás</Text>
                </View>
            </View>
        );
    }

    render() {
        const { etanol, gasolina, etanolConsumption, gasolinaConsumption, handleForm } = this.props.homeStore;
        const { totalSavings, bestStation, points, recentActivities } = this.props.stationsStore;
        const { selectedVehicle } = this.props.garageStore;
        const { theme, toggleTheme } = this.props.themeStore;
        const { promoMessage } = this.state;

        return (
            <Layout style={styles.container}>
                <View style={styles.header}>
                    <View style={{position: 'absolute', left: 20, zIndex: 1, flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={{marginRight: 5}}>{theme === 'dark' ? '🌙' : '☀️'}</Text>
                        <Toggle checked={theme === 'dark'} onChange={toggleTheme} testID='theme-toggle' />
                    </View>
                    <Text category='h1' status='primary' style={styles.title}>Calculadora Flex</Text>
                    <Layout level='2' style={styles.pointsBadge}>
                        <Icon name='award' width={20} height={20} fill='#FFD700' />
                        <Text style={styles.pointsText}>{points} pts</Text>
                    </Layout>
                </View>

                {promoMessage && (
                    <View style={styles.promoBanner}>
                        <Icon name='alert-circle-outline' width={24} height={24} fill='#fff' />
                        <Text style={styles.promoText}>{promoMessage}</Text>
                    </View>
                )}

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Card
                        style={styles.marketCard}
                        onPress={() => this.props.navigation.navigate('MarketInsights')}
                    >
                        <View style={styles.marketCardContent}>
                            <Icon name='pie-chart-outline' width={32} height={32} fill='#3366FF' />
                            <View style={{marginLeft: 15, flex: 1}}>
                                <Text category='h6' status='primary'>Tendências de Mercado</Text>
                                <Text category='c1' appearance='hint'>Veja previsões e economize mais!</Text>
                            </View>
                            <Icon name='arrow-ios-forward-outline' width={24} height={24} fill='#8F9BB3' />
                        </View>
                    </Card>

                    {this.renderGamificationCard()}

                    {/* Community Feed */}
                    {recentActivities.length > 0 && (
                        <View style={styles.feedContainer}>
                            <Text category='h6' style={styles.feedTitle}>Comunidade Agora</Text>
                            <Card style={styles.feedCard}>
                                {recentActivities.slice(0, 3).map(item => this.renderActivityItem(item))}
                            </Card>
                        </View>
                    )}

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
                        <Text category='h6' style={styles.cardTitle}>Consumo</Text>
                        {selectedVehicle && !etanolConsumption && !gasolinaConsumption ? (
                            <View style={{alignItems: 'center', marginBottom: 15}}>
                                <Icon name='car' width={24} height={24} fill='#3366FF' />
                                <Text category='s1' style={{color: '#3366FF'}}>Usando dados de: {selectedVehicle.name}</Text>
                                <Text category='c1' appearance='hint'>Gas: {selectedVehicle.avgGasConsumption} km/l | Eta: {selectedVehicle.avgEthanolConsumption} km/l</Text>
                                <Button
                                    appearance='ghost'
                                    size='tiny'
                                    onPress={() => this.props.navigation.navigate('Garage')}
                                >
                                    Alterar Veículo
                                </Button>
                            </View>
                        ) : (
                            <Text category='c1' appearance='hint' style={{textAlign: 'center', marginBottom: 10}}>
                                Preencha abaixo para sobrescrever o veículo selecionado
                            </Text>
                        )}

                        <Text category='label' style={styles.label}>Km/l no Etanol</Text>
                        <Input
                            placeholder={selectedVehicle ? `Padrão: ${selectedVehicle.avgEthanolConsumption}` : 'Ex: 7.0'}
                            value={etanolConsumption}
                            onChangeText={(etanolConsumption) => handleForm('etanolConsumption', etanolConsumption)}
                            keyboardType='numeric'
                            style={styles.input}
                        />

                        <Text category='label' style={styles.label}>Km/l na Gasolina</Text>
                        <Input
                            placeholder={selectedVehicle ? `Padrão: ${selectedVehicle.avgGasConsumption}` : 'Ex: 10.0'}
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
        padding: 5,
        borderRadius: 12,
    },
    pointsText: {
        marginLeft: 5,
        fontWeight: 'bold',
    },
    marketCard: {
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E4E9F2',
        borderRadius: 8,
    },
    marketCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 20,
    },
    title: {
        textAlign: 'center',
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
    gamificationCard: {
        marginBottom: 20,
        borderColor: '#3366FF',
        borderTopWidth: 4,
    },
    levelHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    progressBarBackground: {
        height: 8,
        backgroundColor: '#eee',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#3366FF',
    },
    promoBanner: {
        backgroundColor: '#FFA500',
        padding: 10,
        marginHorizontal: 20,
        marginTop: 10,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    promoText: {
        color: 'white',
        marginLeft: 10,
        fontWeight: 'bold',
        flex: 1,
    },
    feedContainer: {
        marginBottom: 20,
    },
    feedTitle: {
        marginBottom: 10,
        marginLeft: 5,
    },
    feedCard: {
        paddingVertical: 5,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F7F9FC',
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
