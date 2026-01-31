import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Dimensions } from 'react-native';
import { Card, Text, Icon } from '@ui-kitten/components';
import { inject, observer } from 'mobx-react';
import StationsStore from '../stores/stations.store';

interface Props {
    stationsStore?: StationsStore;
}

const { width } = Dimensions.get('window');

const SmartAlert = inject('stationsStore')(observer(({ stationsStore }: Props) => {
    const { smartAlert, clearAlert } = stationsStore!;
    const slideAnim = useRef(new Animated.Value(-100)).current;

    useEffect(() => {
        if (smartAlert.message) {
            // Slide In
            Animated.spring(slideAnim, {
                toValue: 20, // 20px from top
                friction: 6,
                useNativeDriver: true
            }).start();

            // Auto dismiss
            const timer = setTimeout(() => {
                dismiss();
            }, 4000);

            return () => clearTimeout(timer);
        } else {
             // Slide Out (ensure it's hidden)
             slideAnim.setValue(-100);
        }
    }, [smartAlert.message]);

    const dismiss = () => {
        Animated.timing(slideAnim, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true
        }).start(() => {
            clearAlert();
        });
    };

    if (!smartAlert.message) return null;

    let iconName = 'info-outline';
    let color = '#3366FF';

    if (smartAlert.type === 'success') {
        iconName = 'trending-down-outline'; // Price drop
        color = '#00E096';
    } else if (smartAlert.type === 'warning') {
        iconName = 'alert-triangle-outline';
        color = '#FFAAA5';
    }

    return (
        <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
            <Card style={[styles.card, { borderLeftColor: color }]} onPress={dismiss}>
                <View style={styles.content}>
                    <Icon name={iconName} width={24} height={24} fill={color} />
                    <Text category='s1' style={{marginLeft: 10, flex: 1}}>
                        {smartAlert.message}
                    </Text>
                </View>
            </Card>
        </Animated.View>
    );
}));

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 20,
        right: 20,
        zIndex: 200, // Topmost
    },
    card: {
        borderRadius: 8,
        borderLeftWidth: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    }
});

export default SmartAlert;
