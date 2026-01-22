import React, { Component } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Layout, Text, Button, Card, Icon, List, ListItem, Divider } from '@ui-kitten/components';
import { inject, observer } from 'mobx-react';
import GarageStore from '../../stores/garage.store';

interface Props {
    garageStore: GarageStore;
    navigation: any;
}

@inject('garageStore')
@observer
export default class Garage extends Component<Props> {

    renderVehicleItem = ({ item }) => {
        const { garageStore } = this.props;
        const isSelected = garageStore.selectedVehicleId === item.id;

        return (
            <Card
                style={[styles.vehicleCard, isSelected && styles.selectedCard]}
                onPress={() => garageStore.selectVehicle(item.id)}
            >
                <View style={styles.vehicleHeader}>
                    <Icon name='car' width={32} height={32} fill={isSelected ? '#fff' : '#3366FF'} />
                    <View style={styles.vehicleInfo}>
                        <Text category='h6' style={isSelected ? styles.whiteText : null}>{item.name}</Text>
                        <Text category='s2' style={isSelected ? styles.whiteText : styles.subText}>
                            Gas: {item.avgGasConsumption} km/l | Eta: {item.avgEthanolConsumption} km/l
                        </Text>
                    </View>
                    {isSelected && <Icon name='checkmark-circle-2' width={24} height={24} fill='#fff' />}
                </View>
            </Card>
        );
    };

    renderLogItem = ({ item }) => (
        <ListItem
            title={`${item.date} - ${item.stationName}`}
            description={`${item.liters.toFixed(2)}L de ${item.fuelType === 'gas' ? 'Gasolina' : 'Etanol'} - R$ ${item.totalCost.toFixed(2)}`}
            accessoryRight={() => <Text status={item.fuelType === 'gas' ? 'info' : 'success'}>{item.fuelType === 'gas' ? 'GAS' : 'ETH'}</Text>}
        />
    );

    render() {
        const { garageStore, navigation } = this.props;
        const { vehicles, selectedVehicle, logsForSelectedVehicle, fuelStats, totalSpent } = garageStore;

        return (
            <Layout style={styles.container}>
                <View style={styles.header}>
                    <Text category='h4'>Minha Garagem</Text>
                    <Button
                        size='small'
                        appearance='ghost'
                        accessoryLeft={(props) => <Icon {...props} name='plus'/>}
                        onPress={() => navigation.navigate('AddVehicle')}
                    >
                        Adicionar
                    </Button>
                </View>

                <View style={styles.vehicleList}>
                    <List
                        horizontal={true}
                        data={vehicles.slice()}
                        renderItem={this.renderVehicleItem}
                        contentContainerStyle={styles.listContent}
                        showsHorizontalScrollIndicator={false}
                    />
                </View>

                <Divider />

                <ScrollView style={styles.statsContainer}>
                    {selectedVehicle ? (
                        <>
                            <Card style={styles.statsCard} status='primary'>
                                <Text category='h6' style={styles.whiteText}>Resumo de Gastos</Text>
                                <Text category='h1' style={styles.whiteText}>R$ {totalSpent.toFixed(2)}</Text>
                                <View style={styles.row}>
                                    <View>
                                        <Text style={styles.whiteText}>Gasolina</Text>
                                        <Text category='h6' style={styles.whiteText}>{fuelStats.totalGasLiters.toFixed(1)} L</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.whiteText}>Etanol</Text>
                                        <Text category='h6' style={styles.whiteText}>{fuelStats.totalEthLiters.toFixed(1)} L</Text>
                                    </View>
                                </View>
                            </Card>

                            <Button
                                style={styles.logButton}
                                status='success'
                                onPress={() => navigation.navigate('AddFill')}
                                accessoryLeft={(props) => <Icon {...props} name='droplet'/>}
                            >
                                Registrar Abastecimento
                            </Button>

                            <Text category='h6' style={styles.sectionTitle}>Histórico</Text>
                            {logsForSelectedVehicle.length > 0 ? (
                                logsForSelectedVehicle.map((log) => (
                                    <View key={log.id}>
                                         <ListItem
                                            title={`${log.date} - ${log.stationName}`}
                                            description={`${log.liters.toFixed(2)}L de ${log.fuelType === 'gas' ? 'Gasolina' : 'Etanol'} - R$ ${log.totalCost.toFixed(2)}`}
                                            accessoryRight={() => <Text category='s2' status={log.fuelType === 'gas' ? 'info' : 'success'}>{log.fuelType === 'gas' ? 'GAS' : 'ETH'}</Text>}
                                        />
                                        <Divider />
                                    </View>

                                ))
                            ) : (
                                <Text appearance='hint' style={{textAlign: 'center', marginTop: 20}}>Nenhum registro encontrado.</Text>
                            )}
                        </>
                    ) : (
                        <Text style={{textAlign: 'center', marginTop: 50}}>Selecione ou adicione um veículo.</Text>
                    )}
                </ScrollView>
            </Layout>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    vehicleList: {
        marginBottom: 10,
        height: 100,
    },
    listContent: {
        paddingHorizontal: 15,
    },
    vehicleCard: {
        width: 250,
        marginRight: 10,
        borderRadius: 10,
    },
    selectedCard: {
        backgroundColor: '#3366FF',
        borderWidth: 0,
    },
    vehicleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    vehicleInfo: {
        marginLeft: 15,
        flex: 1,
    },
    whiteText: {
        color: 'white',
    },
    subText: {
        color: '#888',
    },
    statsContainer: {
        flex: 1,
        padding: 20,
    },
    statsCard: {
        marginBottom: 20,
        backgroundColor: '#3366FF',
        borderWidth: 0,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    logButton: {
        marginBottom: 20,
    },
    sectionTitle: {
        marginBottom: 10,
    }
});
