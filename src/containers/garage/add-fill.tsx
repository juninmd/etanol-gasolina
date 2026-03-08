import React, { Component } from 'react';
import { StyleSheet, View, Animated, Easing } from 'react-native';
import { Layout, Text, Button, Input, Icon, TopNavigation, TopNavigationAction, RadioGroup, Radio, Modal, Card, Spinner } from '@ui-kitten/components';
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
    showScannerModal: boolean;
    isScanning: boolean;
}

const BackIcon = (props) => (
    <Icon {...props} name="arrow-back" />
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
            fuelTypeIndex: 0, // 0 = Gas, 1 = Ethanol
            showScannerModal: false,
            isScanning: false,
        };
    }

    handleScanReceipt = () => {
        this.setState({ showScannerModal: true, isScanning: true });

        // Mocking the scanning process with a delay
        setTimeout(() => {
            this.setState({
                isScanning: false,
                stationName: 'Posto Auto Mock (IA)',
                price: '5.49',
                liters: '40.5',
                fuelTypeIndex: 0,
            });
            setTimeout(() => {
                this.setState({ showScannerModal: false });
                alert('✨ Nota Fiscal lida com sucesso via IA!');
            }, 1000);
        }, 2500); // 2.5 seconds scanning delay
    };

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
                fuelType,
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
                <TopNavigation title="Registrar Abastecimento" alignment="center" leftControl={this.renderBackAction()} />
                <View style={styles.form}>
                     <Text category="label" style={styles.label}>Combustível</Text>
                    <RadioGroup
                        selectedIndex={this.state.fuelTypeIndex}
                        onChange={index => this.setState({ fuelTypeIndex: index })}
                        style={styles.radioGroup}
                    >
                        <Radio>Gasolina</Radio>
                        <Radio>Etanol</Radio>
                    </RadioGroup>

                    <Input
                        label="Posto"
                        placeholder="Nome do Posto"
                        value={this.state.stationName}
                        onChangeText={stationName => this.setState({ stationName })}
                        style={styles.input}
                    />
                    <Input
                        label="Preço por Litro"
                        placeholder="R$ 0.00"
                        keyboardType="numeric"
                        value={this.state.price}
                        onChangeText={price => this.setState({ price })}
                        style={styles.input}
                    />
                    <Input
                        label="Litros Abastecidos"
                        placeholder="L"
                        keyboardType="numeric"
                        value={this.state.liters}
                        onChangeText={liters => this.setState({ liters })}
                        style={styles.input}
                    />
                    <Input
                        label="Odômetro (Km)"
                        placeholder="Km atual"
                        keyboardType="numeric"
                        value={this.state.odometer}
                        onChangeText={odometer => this.setState({ odometer })}
                        style={styles.input}
                    />
                    <Button
                        status="info"
                        appearance="outline"
                        accessoryLeft={(props) => <Icon {...props} name="camera-outline" />}
                        onPress={this.handleScanReceipt}
                        style={styles.scanButton}>
                        Escanear Nota Fiscal (IA)
                    </Button>
                    <Button onPress={this.handleSave} style={styles.button}>
                        Salvar Registro
                    </Button>
                </View>

                {/* Receipt Scanner Modal */}
                <Modal
                    visible={this.state.showScannerModal}
                    backdropStyle={styles.backdrop}
                    onBackdropPress={() => !this.state.isScanning && this.setState({ showScannerModal: false })}>
                    <Card disabled={true} style={styles.modalCard}>
                        <View style={{ alignItems: 'center', padding: 20 }}>
                            {this.state.isScanning ? (
                                <>
                                    <Spinner size='giant' status='info' />
                                    <Text category="h6" style={{ marginTop: 20 }}>
                                        Lendo nota fiscal...
                                    </Text>
                                    <Text category="c1" appearance="hint" style={{ marginTop: 5, textAlign: 'center' }}>
                                        A IA está extraindo o nome do posto, preço e litros.
                                    </Text>
                                </>
                            ) : (
                                <>
                                    <Icon
                                        name="checkmark-circle-2-outline"
                                        width={60}
                                        height={60}
                                        fill="#00E096"
                                        style={{ marginBottom: 20 }}
                                    />
                                    <Text category="h6" style={{ marginBottom: 10, textAlign: 'center' }}>
                                        Concluído!
                                    </Text>
                                </>
                            )}
                        </View>
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
        justifyContent: 'space-around',
    },
    scanButton: {
        marginTop: 10,
        marginBottom: 10,
    },
    backdrop: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalCard: {
        padding: 20,
        width: 300,
        borderRadius: 16,
    },
});
