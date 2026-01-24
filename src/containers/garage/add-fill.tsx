import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import { Layout, Text, Button, Input, Icon, TopNavigation, TopNavigationAction, RadioGroup, Radio } from '@ui-kitten/components';
import { inject, observer } from 'mobx-react';
import GarageStore from '../../stores/garage.store';
import StationsStore from '../../stores/stations.store';

interface Props {
    garageStore: GarageStore;
    stationsStore: StationsStore;
    navigation: any;
    route: any;
}

interface State {
    stationName: string;
    price: string;
    liters: string;
    odometer: string;
    fuelTypeIndex: number;
}

const BackIcon = (props) => (
    <Icon {...props} name='arrow-back' />
);

@inject('garageStore', 'stationsStore')
@observer
export default class AddFill extends Component<Props, State> {

    constructor(props: Props) {
        super(props);
        const { route, stationsStore } = props;
        const stationId = route.params?.stationId;
        const station = stationId ? stationsStore.stations.find(s => s.id === stationId) : null;

        this.state = {
            stationName: station ? station.name : '',
            price: station ? station.priceGas.toString() : '',
            liters: '',
            odometer: '',
            fuelTypeIndex: 0 // 0 = Gas, 1 = Ethanol
        };
    }

    navigateBack = () => {
        this.props.navigation.goBack();
    };

    renderBackAction = () => (
        <TopNavigationAction icon={BackIcon} onPress={this.navigateBack} />
    );

    handleSave = () => {
        const { stationName, price, liters, odometer, fuelTypeIndex } = this.state;
        const { garageStore, stationsStore, navigation, route } = this.props;

        if (stationName && price && liters) {
            const priceVal = parseFloat(price);
            const litersVal = parseFloat(liters);
            const fuelType = fuelTypeIndex === 0 ? 'gas' : 'ethanol';

            garageStore.addLog({
                vehicleId: garageStore.selectedVehicleId || '1',
                stationName,
                pricePerLiter: priceVal,
                liters: litersVal,
                odometer: parseFloat(odometer) || 0,
                date: new Date().toLocaleDateString(),
                fuelType
            });

            // Calculate Savings
            try {
                let station = route.params?.stationId ? stationsStore.stations.find(s => s.id === route.params.stationId) : null;
                if (!station) {
                    station = stationsStore.stations.find(s => s.name.toLowerCase() === stationName.toLowerCase());
                }

                const vehicle = garageStore.selectedVehicle;

                if (station && vehicle) {
                    const ethCons = vehicle.avgEthanolConsumption || 7;
                    const gasCons = vehicle.avgGasConsumption || 10;

                    let savings = 0;

                    if (fuelType === 'gas') {
                        const distance = litersVal * gasCons;
                        const litersEthNeeded = distance / ethCons;
                        const costEth = litersEthNeeded * station.priceEthanol;
                        const costGas = litersVal * priceVal;

                        if (costGas < costEth) {
                            savings = costEth - costGas;
                        }
                    } else {
                        const distance = litersVal * ethCons;
                        const litersGasNeeded = distance / gasCons;
                        const costGas = litersGasNeeded * station.priceGas;
                        const costEth = litersVal * priceVal;

                        if (costEth < costGas) {
                            savings = costGas - costEth;
                        }
                    }

                    if (savings > 0) {
                        stationsStore.addSavings(savings);
                        alert(`Economia registrada! Você economizou R$ ${savings.toFixed(2)}.`);
                    }
                }
            } catch (e) {
                console.warn('Error calculating savings', e);
            }

            navigation.goBack();
        } else {
            alert('Por favor, preencha os campos obrigatórios.');
        }
    };

    render() {
        return (
            <Layout style={styles.container}>
                <TopNavigation title='Registrar Abastecimento' alignment='center' leftControl={this.renderBackAction()} />
                <View style={styles.form}>
                     <Text category='label' style={styles.label}>Combustível</Text>
                    <RadioGroup
                        selectedIndex={this.state.fuelTypeIndex}
                        onChange={index => this.setState({ fuelTypeIndex: index })}
                        style={styles.radioGroup}
                    >
                        <Radio>Gasolina</Radio>
                        <Radio>Etanol</Radio>
                    </RadioGroup>

                    <Input
                        label='Posto'
                        placeholder='Nome do Posto'
                        value={this.state.stationName}
                        onChangeText={stationName => this.setState({ stationName })}
                        style={styles.input}
                    />
                    <Input
                        label='Preço por Litro'
                        placeholder='R$ 0.00'
                        keyboardType='numeric'
                        value={this.state.price}
                        onChangeText={price => this.setState({ price })}
                        style={styles.input}
                    />
                    <Input
                        label='Litros Abastecidos'
                        placeholder='L'
                        keyboardType='numeric'
                        value={this.state.liters}
                        onChangeText={liters => this.setState({ liters })}
                        style={styles.input}
                    />
                    <Input
                        label='Odômetro (Km)'
                        placeholder='Km atual'
                        keyboardType='numeric'
                        value={this.state.odometer}
                        onChangeText={odometer => this.setState({ odometer })}
                        style={styles.input}
                    />
                    <Button onPress={this.handleSave} style={styles.button}>
                        Salvar Registro
                    </Button>
                </View>
            </Layout>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    form: {
        padding: 20,
    },
    input: {
        marginBottom: 15,
    },
    button: {
        marginTop: 10,
    },
    label: {
        marginBottom: 10,
    },
    radioGroup: {
        flexDirection: 'row',
        marginBottom: 15,
        justifyContent: 'space-around'
    }
});
