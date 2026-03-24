import React from 'react';
import {View, Text} from 'react-native';

const MapView = (props: any) => {
  return (
    <View style={{height: 300, backgroundColor: '#f0f0f0', padding: 10}}>
      <Text style={{fontWeight: 'bold', marginBottom: 5}}>
        Mapa Interativo (Simulação Web)
      </Text>
      <View style={{flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 5}}>
        {props.children}
      </View>
    </View>
  );
};

export const Marker = (props: any) => (
  <View style={{marginVertical: 2}}>
    <Text>
      📍 {props.title} {props.description ? `(${props.description})` : ''}
    </Text>
  </View>
);

export const Polyline = (props: any) => (
  <View style={{marginVertical: 2}}>
    <Text style={{color: props.strokeColor || 'black'}}>〰️ Rota Traçada</Text>
  </View>
);

export default MapView;
