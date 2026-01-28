import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Icon } from '@ui-kitten/components';

interface StarRatingProps {
    rating: number; // 0 to 5
    maxRating?: number;
    interactive?: boolean;
    onRate?: (rating: number) => void;
    size?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({
    rating,
    maxRating = 5,
    interactive = false,
    onRate,
    size = 24
}) => {

    const handleRate = (newRating: number) => {
        if (interactive && onRate) {
            onRate(newRating);
        }
    };

    const renderStar = (index: number) => {
        const isFilled = index <= rating;
        const iconName = isFilled ? 'star' : 'star-outline';
        const fill = isFilled ? '#FFAA00' : '#8F9BB3';

        const StarIcon = (
            <Icon
                name={iconName}
                fill={fill}
                width={size}
                height={size}
            />
        );

        if (interactive) {
            return (
                <TouchableOpacity key={index} onPress={() => handleRate(index)} activeOpacity={0.7}>
                    {StarIcon}
                </TouchableOpacity>
            );
        }

        return <View key={index}>{StarIcon}</View>;
    };

    const stars = [];
    for (let i = 1; i <= maxRating; i++) {
        stars.push(renderStar(i));
    }

    return (
        <View style={styles.container}>
            {stars}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center'
    }
});
