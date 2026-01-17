import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { BottomNavigation, BottomNavigationTab, Icon } from '@ui-kitten/components';
import Home from '../containers/home';
import Stations from '../containers/stations';
import Favorites from '../containers/favorites';
import StationDetails from '../containers/station-details';

const { Navigator, Screen } = createBottomTabNavigator();
const Stack = createStackNavigator();

const CalculatorIcon = (props) => (
    <Icon {...props} name='pricetags-outline'/>
);

const MapIcon = (props) => (
    <Icon {...props} name='map-outline'/>
);

const HeartIcon = (props) => (
    <Icon {...props} name='heart-outline'/>
);

const BottomTabBar = ({ navigation, state }) => (
    <BottomNavigation
        selectedIndex={state.index}
        onSelect={index => navigation.navigate(state.routeNames[index])}>
        <BottomNavigationTab title='Calculadora' icon={CalculatorIcon}/>
        <BottomNavigationTab title='Postos' icon={MapIcon}/>
        <BottomNavigationTab title='Favoritos' icon={HeartIcon}/>
    </BottomNavigation>
);

const TabNavigator = () => (
    <Navigator tabBar={props => <BottomTabBar {...props} />}>
        <Screen name='Calculator' component={Home}/>
        <Screen name='Stations' component={Stations}/>
        <Screen name='Favorites' component={Favorites}/>
    </Navigator>
);

const RootNavigator = () => (
    <Stack.Navigator headerMode='none'>
        <Stack.Screen name='Root' component={TabNavigator}/>
        <Stack.Screen name='StationDetails' component={StationDetails}/>
    </Stack.Navigator>
);

export default function Routes() {
    return (
        <NavigationContainer>
            <RootNavigator />
        </NavigationContainer>
    );
}
