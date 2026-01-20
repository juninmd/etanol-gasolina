import React from 'react';
import { View, Text } from 'react-native';

const MapView = (props: any) => {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0' }}>
      <Text style={{ textAlign: 'center', padding: 20 }}>
        Maps are not supported on the web version yet.
      </Text>
    </View>
  );
};

export const Marker = (props: any) => null;

export default MapView;
