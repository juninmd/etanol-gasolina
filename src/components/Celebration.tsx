import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, View, Animated, Dimensions, Easing } from 'react-native';
import { Text, Button, Card, Icon } from '@ui-kitten/components';
import { inject, observer } from 'mobx-react';
import StationsStore from '../stores/stations.store';

interface Props {
    stationsStore?: StationsStore;
}

const { width, height } = Dimensions.get('window');

const PARTICLE_COUNT = 30;

const CelebrationContent = observer(({ stationsStore }: Props) => {
    const [particles] = useState(() =>
        Array.from({ length: PARTICLE_COUNT }).map(() => ({
            x: new Animated.Value(0),
            y: new Animated.Value(0),
            opacity: new Animated.Value(1),
            angle: Math.random() * Math.PI * 2,
            speed: Math.random() * 150 + 100,
            color: ['#FFD700', '#FF4500', '#00FA9A', '#1E90FF'][Math.floor(Math.random() * 4)]
        }))
    );

    const scaleAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Animation Logic
        particles.forEach(p => {
            p.x.setValue(0);
            p.y.setValue(0);
            p.opacity.setValue(1);
        });
        scaleAnim.setValue(0);

        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 5,
            useNativeDriver: false
        }).start();

        const animations = particles.map(p => {
            return Animated.parallel([
                Animated.timing(p.x, {
                    toValue: Math.cos(p.angle) * p.speed,
                    duration: 1500,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: false
                }),
                Animated.timing(p.y, {
                    toValue: Math.sin(p.angle) * p.speed,
                    duration: 1500,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: false
                }),
                Animated.timing(p.opacity, {
                    toValue: 0,
                    duration: 1500,
                    delay: 500,
                    useNativeDriver: false
                })
            ]);
        });

        Animated.stagger(20, animations).start();
    }, []); // Run once on mount

    const handleDismiss = () => {
        if (stationsStore.currentBadge) {
            stationsStore.resetBadgePopup();
        } else if (stationsStore.showLevelUp) {
            stationsStore.resetLevelUp();
        }
    };

    const isBadge = !!stationsStore.currentBadge;

    return (
        <View style={styles.overlay}>
             {particles.map((p, i) => (
                <Animated.View
                    key={i}
                    style={[
                        styles.particle,
                        {
                            backgroundColor: p.color,
                            opacity: p.opacity,
                            transform: [
                                { translateX: p.x },
                                { translateY: p.y }
                            ]
                        }
                    ]}
                />
            ))}
            <Animated.View style={[styles.cardContainer, { transform: [{ scale: scaleAnim }] }]}>
                <Card style={styles.card} status='success'>
                    {isBadge ? (
                         <View style={{alignItems: 'center'}}>
                            <Icon name={stationsStore.currentBadge!.icon} width={60} height={60} fill='#FFD700' style={{marginBottom: 10}} />
                            <Text category='h3' style={styles.title}>NOVA CONQUISTA!</Text>
                            <Text category='s1' style={styles.subtitle}>
                                Você desbloqueou
                            </Text>
                            <Text category='h5' status='primary' style={styles.rank}>
                                {stationsStore.currentBadge!.name}
                            </Text>
                            <Text category='p2' appearance='hint' style={{textAlign: 'center', marginBottom: 15}}>
                                {stationsStore.currentBadge!.description}
                            </Text>
                        </View>
                    ) : (
                        <View style={{alignItems: 'center'}}>
                            <Text category='h1' style={styles.emoji}>🎉</Text>
                            <Text category='h3' style={styles.title}>LEVEL UP!</Text>
                            <Text category='s1' style={styles.subtitle}>
                                Você agora é um
                            </Text>
                            <Text category='h2' status='primary' style={styles.rank}>
                                {stationsStore.newLevelName.toUpperCase()}
                            </Text>
                        </View>
                    )}

                    <Button style={styles.button} onPress={handleDismiss}>
                        INCRÍVEL!
                    </Button>
                </Card>
            </Animated.View>
        </View>
    );
});

const Celebration = inject('stationsStore')(observer(({ stationsStore }: Props) => {
    const showCelebration = stationsStore?.showLevelUp || !!stationsStore?.currentBadge;

    if (!showCelebration) return null;

    return <CelebrationContent stationsStore={stationsStore} />;
}));

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: width,
        height: height,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        elevation: 10,
    },
    particle: {
        position: 'absolute',
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    cardContainer: {
        width: '80%',
        maxWidth: 400,
    },
    card: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    emoji: {
        textAlign: 'center',
        fontSize: 60,
        marginBottom: 10,
    },
    title: {
        textAlign: 'center',
        marginBottom: 10,
        color: '#00E096'
    },
    subtitle: {
        textAlign: 'center',
        color: '#8F9BB3',
        marginBottom: 5,
    },
    rank: {
        textAlign: 'center',
        marginBottom: 20,
        fontWeight: 'bold',
    },
    button: {
        marginTop: 10,
    }
});

export default Celebration;
