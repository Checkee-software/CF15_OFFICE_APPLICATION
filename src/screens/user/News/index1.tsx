import React, {useEffect} from 'react';
import {View, Text, Image, StyleSheet, ScrollView, ActivityIndicator} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {RouteProp, useRoute} from '@react-navigation/native';
import useNewsStore from '../../../stores/newsStore';

export default function NewsDetail() {
    const route = useRoute<RouteProp<{params: {id: string}}, 'params'>>();
    const {id} = route.params;

    const {selectedNews, fetchNewsDetail, isLoading} = useNewsStore();

    useEffect(() => {
        if (id) {
            fetchNewsDetail(id);
        }
    }, [id]);

    if (isLoading || !selectedNews) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#339CFF" />
                <Text style={{marginTop: 12}}>Đang tải chi tiết tin tức...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Image source={{uri: selectedNews.image}} style={styles.image} />
            <View style={styles.desc}>
                <View style={styles.categoryRow}>
                    <Text style={styles.category}>{selectedNews.category || 'Tin tức'}</Text>
                    <Icon name="bookmark" size={18} color="#FFA500" />
                </View>

                <Text style={styles.author}>
                    Tác giả: <Text style={styles.authorName}>{selectedNews.author}</Text>
                </Text>
                <Text style={styles.title}>{selectedNews.title}</Text>
                <Text style={styles.content}>{selectedNews.content || 'Không có nội dung'}</Text>
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
    categoryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    category: {
        color: '#999',
        fontSize: 14,
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
