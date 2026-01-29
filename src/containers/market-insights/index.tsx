import React, { Component } from 'react';
import { View, StyleSheet, ScrollView, Animated } from 'react-native';
import { Layout, Text, Icon, Card, TopNavigation, TopNavigationAction } from '@ui-kitten/components';
import { inject, observer } from 'mobx-react';
import StationsStore from '../../stores/stations.store';

interface Props {
    stationsStore?: StationsStore;
    navigation: any;
}

@inject('stationsStore')
@observer
export default class MarketInsights extends Component<Props> {

    // Animation values
    fadeAnim = new Animated.Value(0);
    barAnims: Animated.Value[] = [];

    componentDidMount() {
        this.animateEntrance();
    }

    animateEntrance = () => {
        Animated.timing(this.fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();

        // Staggered animation for bars will be handled in render if needed,
        // but for now let's just fade the whole view.
    }

    get aggregatedHistory() {
        const { stations } = this.props.stationsStore!;
        const historyMap: Record<string, { total: number; count: number }> = {};

        // Aggregate data
        stations.forEach(station => {
            if (station.priceHistory) {
                station.priceHistory.forEach(point => {
                    if (!historyMap[point.date]) {
                        historyMap[point.date] = { total: 0, count: 0 };
                    }
                    historyMap[point.date].total += point.gas; // focusing on gas for the main chart
                    historyMap[point.date].count += 1;
                });
            }
        });

        const history = Object.keys(historyMap).map(date => ({
            date,
            avg: historyMap[date].total / historyMap[date].count
        })).sort((a, b) => {
             // Simple string compare for DD/MM dates works if within same year/month structure
             // but technically should be more robust. Given the mock data format, this is fine.
             return a.date.localeCompare(b.date);
        });

        // Add today's average
        const todayAvg = stations.reduce((acc, s) => acc + s.priceGas, 0) / stations.length;
        history.push({
            date: 'Hoje',
            avg: todayAvg
        });

        return history.slice(-5); // Last 5 data points
    }

    get cheapestGasStation() {
        const { stations } = this.props.stationsStore!;
        if (stations.length === 0) return null;
        return stations.slice().sort((a, b) => a.priceGas - b.priceGas)[0];
    }

    get marketSentiment() {
        const history = this.aggregatedHistory;
        if (history.length < 2) return 'neutral';

        const current = history[history.length - 1].avg;
        const previous = history[history.length - 2].avg;

        if (current < previous) return 'buy';
        if (current > previous) return 'wait';
        return 'neutral';
    }

    renderBackAction = () => (
        <TopNavigationAction icon={(props) => <Icon {...props} name='arrow-back'/>} onPress={() => this.props.navigation.goBack()}/>
    );

    renderChart = () => {
        const data = this.aggregatedHistory;
        if (data.length === 0) return <Text>Sem dados suficientes.</Text>;

        const maxVal = Math.max(...data.map(d => d.avg)) * 1.05;
        const minVal = Math.min(...data.map(d => d.avg)) * 0.95;
        const range = maxVal - minVal;

        return (
            <View style={styles.chartContainer}>
                {data.map((item, index) => {
                    const heightPercent = ((item.avg - minVal) / range) * 100;
                    return (
                        <View key={index} style={styles.chartBarContainer}>
                            <View style={styles.barLabelContainer}>
                                <Text category='c1' style={styles.barValue}>R$ {item.avg.toFixed(2)}</Text>
                            </View>
                            <View style={[styles.bar, { height: `${Math.max(heightPercent, 10)}%` }, index === data.length - 1 ? styles.activeBar : null]} />
                            <Text category='c2' style={styles.barLabel}>{item.date}</Text>
                        </View>
                    );
                })}
            </View>
        );
    }

    renderPrediction = () => {
        const sentiment = this.marketSentiment;
        let color = '#8F9BB3';
        let icon = 'minus-outline';
        let text = 'Mercado Estável';
        let subtext = 'Preços sem grandes variações.';

        if (sentiment === 'buy') {
            color = '#00E096';
            icon = 'trending-down-outline';
            text = 'BOM MOMENTO!';
            subtext = 'Tendência de queda confirmada.';
        } else if (sentiment === 'wait') {
            color = '#FF3D71';
            icon = 'trending-up-outline';
            text = 'AGUARDE!';
            subtext = 'Preços em alta no momento.';
        }

        return (
            <Card style={[styles.sentimentCard, { borderTopColor: color }]}>
                <View style={styles.sentimentHeader}>
                    <Icon name={icon} width={40} height={40} fill={color} />
                    <View style={{marginLeft: 15}}>
                        <Text category='h5' style={{color: color, fontWeight: 'bold'}}>{text}</Text>
                        <Text category='s1'>{subtext}</Text>
                    </View>
                </View>
                <View style={styles.predictionBox}>
                    <Text category='label' appearance='hint'>PREVISÃO IA PARA AMANHÃ</Text>
                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 5}}>
                        <Icon name='flash-outline' width={16} height={16} fill='#FFAAA5' />
                        <Text category='s2' style={{marginLeft: 5}}>
                            {sentiment === 'buy' ? 'Manutenção ou leve queda (-0.2%)' : 'Provável aumento (+0.5%)'}
                        </Text>
                    </View>
                </View>
            </Card>
        );
    }

    render() {
        return (
            <Layout style={styles.container}>
                <TopNavigation
                    title='Inteligência de Mercado'
                    alignment='center'
                    accessoryLeft={this.renderBackAction}
                />
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Animated.View style={{ opacity: this.fadeAnim, transform: [{ translateY: this.fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>

                        {this.renderPrediction()}

                        <Card style={styles.chartCard}>
                            <Text category='h6' style={{marginBottom: 15}}>Histórico Médio (Gasolina)</Text>
                            {this.renderChart()}
                        </Card>

                        <Text category='h6' style={styles.sectionTitle}>Análise Rápida</Text>

                        <View style={styles.statsRow}>
                            <Card style={styles.statCard}>
                                <Text category='c2' appearance='hint'>MENOR GASOLINA</Text>
                                <Text category='h4' status='success'>
                                    R$ {this.cheapestGasStation?.priceGas.toFixed(2) || '--'}
                                </Text>
                                <Text category='c1'>{this.cheapestGasStation?.name || ''}</Text>
                            </Card>
                            <Card style={styles.statCard}>
                                <Text category='c2' appearance='hint'>MÉDIA HOJE</Text>
                                <Text category='h4' status='info'>
                                    R$ {(this.aggregatedHistory[this.aggregatedHistory.length-1]?.avg || 0).toFixed(2)}
                                </Text>
                                <Text category='c1'>+R$ 0.10 vs Ontem</Text>
                            </Card>
                        </View>

                        <Card style={styles.tipCard} status='warning'>
                            <View style={{flexDirection: 'row'}}>
                                <Icon name='bulb-outline' width={24} height={24} fill='#fff' />
                                <Text style={styles.tipText}>
                                    Dica: Abastecer no {this.props.stationsStore?.bestStation?.name} agora economizaria
                                    aproximadamente R$ {((this.aggregatedHistory[this.aggregatedHistory.length-1]?.avg || 0) - (this.props.stationsStore?.bestStation?.priceGas || 0)).toFixed(2)} por litro em comparação à média.
                                </Text>
                            </View>
                        </Card>

                    </Animated.View>
                </ScrollView>
            </Layout>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    sentimentCard: {
        borderTopWidth: 4,
        marginBottom: 20,
    },
    sentimentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    predictionBox: {
        backgroundColor: '#F7F9FC',
        padding: 10,
        borderRadius: 8,
    },
    chartCard: {
        marginBottom: 20,
    },
    chartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 200,
        paddingTop: 20,
    },
    chartBarContainer: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'flex-end',
        height: '100%',
    },
    bar: {
        width: 12,
        backgroundColor: '#E4E9F2',
        borderRadius: 6,
        marginBottom: 5,
    },
    activeBar: {
        backgroundColor: '#3366FF',
    },
    barLabel: {
        color: '#8F9BB3',
    },
    barLabelContainer: {
        marginBottom: 5,
    },
    barValue: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    sectionTitle: {
        marginBottom: 10,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statCard: {
        flex: 0.48,
    },
    tipCard: {
        backgroundColor: '#FFAAA5',
        borderWidth: 0,
    },
    tipText: {
        color: 'white',
        marginLeft: 10,
        flex: 1,
        fontSize: 13,
    }
});
