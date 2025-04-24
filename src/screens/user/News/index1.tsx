import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {RouteProp, useRoute} from '@react-navigation/native';
import useNewsStore from '../../../stores/newsStore';
import {INews} from '../../../shared-types/Response/NewsResponse';
import images from '../../../assets/images';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function NewsDetail() {
    const route = useRoute<RouteProp<{params: {id: string}}, 'params'>>();
    const {id} = route.params;
    const [bookmarked, setBookmarked] = useState(false);
    const {selectedNews, fetchNewsDetail, isLoading} = useNewsStore();

    const toggleBookmark = () => {
        setBookmarked(prev => !prev);
        saveBookmark(id, !bookmarked);
    };

    const saveBookmark = async (id: string, status: boolean) => {
        try {
            const storedBookmarks = await AsyncStorage.getItem(
                'bookmarkedItems',
            );
            const bookmarks = storedBookmarks
                ? JSON.parse(storedBookmarks)
                : {};
            bookmarks[id] = status;
            await AsyncStorage.setItem(
                'bookmarkedItems',
                JSON.stringify(bookmarks),
            );
        } catch (error) {
            console.error('Error saving bookmark', error);
        }
    };

    const loadBookmark = async (id: string) => {
        try {
            const storedBookmarks = await AsyncStorage.getItem(
                'bookmarkedItems',
            );
            if (storedBookmarks) {
                const bookmarks = JSON.parse(storedBookmarks);
                setBookmarked(bookmarks[id] || false);
            }
        } catch (error) {
            console.error('Error loading bookmark', error);
        }
    };

    useEffect(() => {
        if (id) {
            fetchNewsDetail(id);
            loadBookmark(id);
        }
    }, [id]);

    if (isLoading || !selectedNews) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size='large' color='#339CFF' />
                <Text style={{marginTop: 12}}>
                    Đang tải chi tiết tin tức...
                </Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Image
                source={
                    typeof selectedNews.image === 'string'
                        ? {uri: selectedNews.image}
                        : images.plant2
                }
                style={styles.image}
            />
            <View style={styles.desc}>
                <View style={styles.categoryRow}>
                    <Text style={styles.category}>
                        {(selectedNews as any).newsType || 'Tin tức'}
                    </Text>
                    <TouchableOpacity onPress={toggleBookmark}>
                        <Icon
                            name={bookmarked ? 'bookmark' : 'bookmark-o'}
                            size={18}
                            color={bookmarked ? '#FFA500' : 'gray'}
                        />
                    </TouchableOpacity>
                </View>

                <Text style={styles.author}>
                    Tác giả:{' '}
                    <Text style={styles.authorName}>
                        {selectedNews.author || 'CF15 Office'}
                    </Text>
                </Text>
                <Text style={styles.title}>{selectedNews.title}</Text>
                <Text style={styles.content}>
                    {selectedNews.content || 'Không có nội dung'}
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
