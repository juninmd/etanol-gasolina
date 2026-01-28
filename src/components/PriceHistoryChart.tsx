import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Text } from '@ui-kitten/components';

interface PricePoint {
    date: string;
    gas: number;
    ethanol: number;
}

interface PriceHistoryChartProps {
    history: PricePoint[];
}

export const PriceHistoryChart: React.FC<PriceHistoryChartProps> = ({ history }) => {
    if (!history || history.length === 0) return null;

    const maxPrice = Math.max(
        ...history.map(h => Math.max(h.gas, h.ethanol))
    ) || 6.0;

    return (
        <View>
             <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <Text category='h6' style={styles.sectionTitle}>Evolução de Preços</Text>
                <View style={{flexDirection: 'row'}}>
                    <View style={{width: 10, height: 10, backgroundColor: '#3366FF', marginRight: 5}} />
                    <Text category='c2' appearance='hint' style={{marginRight: 10}}>Gas</Text>
                    <View style={{width: 10, height: 10, backgroundColor: '#00E096', marginRight: 5}} />
                    <Text category='c2' appearance='hint'>Eta</Text>
                </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartScroll}>
                <View style={styles.chartContainer}>
                    {history.map((item, index) => {
                        const gasHeight = (item.gas / maxPrice) * 120;
                        const ethHeight = (item.ethanol / maxPrice) * 120;

                        return (
                            <View key={index} style={styles.chartBarGroup}>
                                <View style={styles.barsRow}>
                                    <View style={[styles.bar, { height: gasHeight, backgroundColor: '#3366FF', marginRight: 4 }]} />
                                    <View style={[styles.bar, { height: ethHeight, backgroundColor: '#00E096' }]} />
                                </View>
                                <Text category='c1' style={styles.chartDate}>{item.date}</Text>
                                <Text category='c2' appearance='hint'>{item.gas.toFixed(2)}</Text>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    sectionTitle: {
        marginTop: 10,
        marginBottom: 10,
    },
    chartScroll: {
        marginTop: 10,
    },
    chartContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: 150,
        paddingBottom: 10,
    },
    chartBarGroup: {
        marginRight: 20,
        alignItems: 'center',
        justifyContent: 'flex-end',
        height: '100%',
    },
    barsRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 5,
    },
    bar: {
        width: 12,
        borderRadius: 4,
    },
    chartDate: {
        marginTop: 2,
    }
});
