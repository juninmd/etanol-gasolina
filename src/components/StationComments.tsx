import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Button, Icon, Input, Card } from '@ui-kitten/components';
import { StarRating } from './StarRating';
import { Comment } from '../stores/stations.store';

interface StationCommentsProps {
    comments: Comment[];
    onAddComment: (text: string, rating: number) => void;
}

export const StationComments: React.FC<StationCommentsProps> = ({ comments, onAddComment }) => {
    const [commentText, setCommentText] = useState('');
    const [rating, setRating] = useState(0);

    const handleAdd = () => {
        if (commentText.trim()) {
            onAddComment(commentText, rating);
            setCommentText('');
            setRating(0);
        }
    };

    const renderCommentItem = (item: Comment) => (
        <View key={item.id} style={styles.commentBubbleContainer}>
            <View style={styles.avatar}>
                <Text style={{color: '#fff', fontWeight: 'bold'}}>{item.author ? item.author.charAt(0).toUpperCase() : 'U'}</Text>
            </View>
            <View style={styles.commentBubble}>
                <View style={styles.commentHeader}>
                    <Text category='s2'>{item.author}</Text>
                    <Text category='c2' appearance='hint'>{item.date}</Text>
                </View>
                {/* Show Star Rating in Comment */}
                <View style={{ marginVertical: 4 }}>
                    <StarRating rating={item.rating || 0} size={16} />
                </View>
                <Text category='p1' style={{marginTop: 5}}>{item.text}</Text>
            </View>
        </View>
    );

    return (
        <View>
            <Text category='h6' style={styles.sectionTitle}>Avaliações da Comunidade ({comments.length})</Text>
            <View style={styles.commentsList}>
                {comments.length > 0 ? (
                    comments.slice().reverse().map((item) => renderCommentItem(item))
                ) : (
                    <Text appearance='hint' style={{ fontStyle: 'italic', marginBottom: 10 }}>Seja o primeiro a avaliar!</Text>
                )}
            </View>

            <Card style={styles.addCommentCard}>
                <Text category='s2' style={{marginBottom: 10}}>Sua Avaliação</Text>

                <View style={{ marginBottom: 15, alignItems: 'center' }}>
                    <Text category='c1' appearance='hint' style={{marginBottom: 5}}>Toque nas estrelas para classificar</Text>
                    <StarRating rating={rating} interactive={true} onRate={setRating} size={32} />
                </View>

                <Input
                    placeholder='Conte sua experiência...'
                    value={commentText}
                    onChangeText={setCommentText}
                    style={styles.commentInput}
                    multiline={true}
                    textStyle={{ minHeight: 64 }}
                />
                <Button
                    size='small'
                    onPress={handleAdd}
                    accessoryRight={(p)=><Icon {...p} name='paper-plane-outline'/>}
                    disabled={!commentText.trim() || rating === 0}
                >
                    Publicar Avaliação
                </Button>
            </Card>
        </View>
    );
};

const styles = StyleSheet.create({
    sectionTitle: {
        marginTop: 10,
        marginBottom: 10,
    },
    commentsList: {
        marginBottom: 20,
    },
    commentBubbleContainer: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#3366FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    commentBubble: {
        flex: 1,
        backgroundColor: '#F7F9FC',
        borderRadius: 12,
        padding: 12,
        borderBottomLeftRadius: 0,
    },
    commentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    addCommentCard: {
        marginTop: 10,
    },
    commentInput: {
        marginBottom: 10,
    }
});
