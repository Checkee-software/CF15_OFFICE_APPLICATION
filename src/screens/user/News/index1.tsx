import React from 'react';
import {View, Text, Image, StyleSheet, ScrollView} from 'react-native';
import {RouteProp} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function NewsDetail({route}: {route: any}) {
    const {newsItem} = route.params;

    return (
        <ScrollView style={styles.container}>
            <Image source={newsItem.image} style={styles.image} />
            <View style={styles.desc}>
                <View style={styles.categoryRow}>
                    <Text style={styles.category}>Nông nghiệp</Text>
                    <Icon name='bookmark' size={18} color='#FFA500' />
                </View>

                <Text style={styles.author}>
                    Tác giả:{' '}
                    <Text style={styles.authorName}>{newsItem.author}</Text>
                </Text>
                <Text style={styles.title}>{newsItem.description}</Text>
                <Text style={styles.content}>
                    Lorem ipsum dolor sit amet consectetur. Nibh cursus nec quis
                    faucibus ut morbi felis...
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },

    image: {
        width: '100%',
        height: 300,
    },
    desc: {
        padding: 10,
    },
    category: {
        marginTop: 10,
        color: '#999',
        fontSize: 14,
    },
    categoryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },

    author: {
        marginTop: 6,
        fontSize: 14,
        color: '#000',
    },
    authorName: {
        color: '#339CFF',
    },
    title: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: 'bold',
    },
    content: {
        marginTop: 10,
        fontSize: 14,
        color: '#333',
    },
});
