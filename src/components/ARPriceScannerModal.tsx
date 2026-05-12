import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import {Modal, Text, Icon, Card, Button} from '@ui-kitten/components';
import {observer} from 'mobx-react';

const {width, height} = Dimensions.get('window');

const ARPriceScannerModal = observer(
  ({
    visible,
    onClose,
    stationsStore,
  }: {
    visible: boolean;
    onClose: () => void;
    stationsStore: any;
  }) => {
    const scanAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [scannedStation, setScannedStation] = useState<any>(null);
    const [isScanning, setIsScanning] = useState(true);

    useEffect(() => {
      if (visible) {
        setScannedStation(null);
        setIsScanning(true);
        fadeAnim.setValue(0);

        Animated.loop(
          Animated.sequence([
            Animated.timing(scanAnim, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(scanAnim, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
          ]),
        ).start();

        // Simulate scanning after 3 seconds
        const timer = setTimeout(() => {
          scanAnim.stopAnimation();
          setIsScanning(false);
          if (stationsStore.stations.length > 0) {
            setScannedStation(stationsStore.stations[0]); // Pick the first station or closest
          }
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }).start();
        }, 3000);

        return () => clearTimeout(timer);
      }
    }, [visible, scanAnim, fadeAnim, stationsStore]);

    const translateY = scanAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [-150, 150],
    });

    return (
      <Modal
        visible={visible}
        backdropStyle={styles.backdrop}
        onBackdropPress={onClose}>
        <View style={styles.container}>
          {/* Mock Camera Background */}
          <View style={styles.cameraView}>
            {/* Reticle */}
            <View style={styles.reticle}>
              <View style={styles.reticleCornerTopLeft} />
              <View style={styles.reticleCornerTopRight} />
              <View style={styles.reticleCornerBottomLeft} />
              <View style={styles.reticleCornerBottomRight} />
            </View>

            {isScanning ? (
              <Animated.View
                style={[styles.scanLine, {transform: [{translateY}]}]}
              />
            ) : (
              scannedStation && (
                <Animated.View style={[styles.arTag, {opacity: fadeAnim}]}>
                  <View style={styles.tagArrow} />
                  <Card style={styles.tagCard}>
                    <Text
                      category="s1"
                      style={{fontWeight: 'bold', color: '#3366FF'}}>
                      {scannedStation.name}
                    </Text>
                    <View style={styles.priceRow}>
                      <Text category="c1" appearance="hint">
                        Gasolina:
                      </Text>
                      <Text category="s2" status="danger">
                        R$ {scannedStation.priceGas.toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.priceRow}>
                      <Text category="c1" appearance="hint">
                        Etanol:
                      </Text>
                      <Text category="s2" status="success">
                        R$ {scannedStation.priceEthanol.toFixed(2)}
                      </Text>
                    </View>
                  </Card>
                </Animated.View>
              )
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.instructionText}>
              {isScanning
                ? 'Aponte para um posto de combustível...'
                : 'Posto identificado!'}
            </Text>
            <Button
              appearance="ghost"
              status="control"
              onPress={onClose}
              style={{marginTop: 10}}>
              Sair do Modo AR
            </Button>
          </View>
        </View>
      </Modal>
    );
  },
);

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  container: {
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cameraView: {
    width: '100%',
    height: '70%',
    backgroundColor: '#1a1a1a', // Mock camera dark background
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 2,
    borderColor: '#333',
  },
  reticle: {
    width: 250,
    height: 250,
    position: 'absolute',
  },
  reticleCornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#00E096',
  },
  reticleCornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#00E096',
  },
  reticleCornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#00E096',
  },
  reticleCornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#00E096',
  },
  scanLine: {
    width: '80%',
    height: 4,
    backgroundColor: '#00E096',
    shadowColor: '#00E096',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  arTag: {
    position: 'absolute',
    alignItems: 'center',
  },
  tagCard: {
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  tagArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: 'rgba(255,255,255,0.95)',
    marginBottom: -1, // Overlap slightly to fix rendering artifact
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    width: 120,
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  instructionText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ARPriceScannerModal;
