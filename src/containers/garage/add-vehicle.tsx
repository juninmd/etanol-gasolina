import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import { Layout, Text, Button, Input, Icon, TopNavigation, TopNavigationAction } from '@ui-kitten/components';
import { inject, observer } from 'mobx-react';
import GarageStore from '../../stores/garage.store';

interface Props {
    garageStore: GarageStore;
    navigation: any;
}

interface State {
    name: string;
    tank: string;
    gasCons: string;
    ethCons: string;
}

const BackIcon = (props) => (
    <Icon {...props} name='arrow-back' />
);

@inject('garageStore')
@observer
export default class AddVehicle extends Component<Props, State> {
    state: State = {
        name: '',
        tank: '',
        gasCons: '',
        ethCons: ''
    };

    navigateBack = () => {
        this.props.navigation.goBack();
    };

    renderBackAction = () => (
        <TopNavigationAction icon={BackIcon} onPress={this.navigateBack} />
    );

    handleSave = () => {
        const { name, tank, gasCons, ethCons } = this.state;
        const { garageStore, navigation } = this.props;

        if (name && tank && gasCons && ethCons) {
            garageStore.addVehicle({
                name,
                tankCapacity: parseFloat(tank),
                avgGasConsumption: parseFloat(gasCons),
                avgEthanolConsumption: parseFloat(ethCons)
            });
            navigation.goBack();
        } else {
            alert('Por favor, preencha todos os campos.');
        }
    };

    render() {
        return (
            <Layout style={styles.container}>
                <TopNavigation title='Novo Veículo' alignment='center' leftControl={this.renderBackAction()} />
                <View style={styles.form}>
                    <Input
                        label='Nome do Veículo'
                        placeholder='Ex: Meu Gol'
                        value={this.state.name}
                        onChangeText={name => this.setState({ name })}
                        style={styles.input}
                    />
                    <Input
                        label='Capacidade do Tanque (L)'
                        placeholder='Ex: 50'
                        keyboardType='numeric'
                        value={this.state.tank}
                        onChangeText={tank => this.setState({ tank })}
                        style={styles.input}
                    />
                    <Input
                        label='Consumo Gasolina (km/l)'
                        placeholder='Ex: 10.5'
                        keyboardType='numeric'
                        value={this.state.gasCons}
                        onChangeText={gasCons => this.setState({ gasCons })}
                        style={styles.input}
                    />
                    <Input
                        label='Consumo Etanol (km/l)'
                        placeholder='Ex: 7.2'
                        keyboardType='numeric'
                        value={this.state.ethCons}
                        onChangeText={ethCons => this.setState({ ethCons })}
                        style={styles.input}
                    />
                    <Button onPress={this.handleSave} style={styles.button}>
                        Salvar
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
    }
});
