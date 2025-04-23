import React, {useEffect, useState, useCallback} from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    Image,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import SCREEN_INFO from '../../../config/SCREEN_CONFIG/screenInfo';
import Loading from '../../subscreen/Loading';
import useNewsStore from '../../../stores/newsStore';
import {INews} from '../../../shared-types/Response/NewsResponse';
import images from '../../../assets/images';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';

export default function News({navigation}: {navigation: any}) {
    const {news, fetchNews, isLoading} = useNewsStore();
    const [bookmarkedItems, setBookmarkedItems] = useState<{
        [key: string]: boolean;
    }>({});
    const [searchText, setSearchText] = useState('');
    const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

    useEffect(() => {
        fetchNews();
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadBookmarks();
        }, []),
    );

    const loadBookmarks = async () => {
        try {
            const storedBookmarks = await AsyncStorage.getItem(
                'bookmarkedItems',
            );
            if (storedBookmarks) {
                setBookmarkedItems(JSON.parse(storedBookmarks));
            }
        } catch (error) {
            console.error('Error loading bookmarks from AsyncStorage', error);
        }
    };

    const saveBookmarks = async (updatedBookmarks: {
        [key: string]: boolean;
    }) => {
        try {
            await AsyncStorage.setItem(
                'bookmarkedItems',
                JSON.stringify(updatedBookmarks),
            );
        } catch (error) {
            console.error('Error saving bookmarks to AsyncStorage', error);
        }
    };

    const toggleBookmark = (id: string) => {
        const updatedBookmarks = {
            ...bookmarkedItems,
            [id]: !bookmarkedItems[id],
        };
        setBookmarkedItems(updatedBookmarks);
        saveBookmarks(updatedBookmarks);
    };

    const normalizeText = (text: string) => {
        return text
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D')
            .toLowerCase();
    };

    const filteredNews = news.filter(item => {
        const normalizedSearch = normalizeText(searchText);
        const normalizedTitle = normalizeText(item.title);
        const normalizedContent = item.content
            ? normalizeText(item.content)
            : '';

        const matchesSearch =
            normalizedTitle.includes(normalizedSearch) ||
            normalizedContent.includes(normalizedSearch);
        const isBookmarked = bookmarkedItems[item._id];

        return showBookmarksOnly
            ? matchesSearch && isBookmarked
            : matchesSearch;
    });

    const renderItem = ({item}: {item: INews}) => (
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={() =>
                navigation.navigate(SCREEN_INFO.NEWS1.key, {id: item._id})
            }
            activeOpacity={0.7}>
            <Image
                source={item.image ? {uri: item.image} : images.plant2}
                style={styles.image}
            />
            <View style={styles.textContainer}>
                <Text style={styles.category}>{(item as any).newsType}</Text>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>
                    {item.content?.slice(0, 100)}...
                </Text>
                <Text style={styles.author}>
                    Tác giả:{' '}
                    <Text style={{color: '#339CFF'}}>
                        {item.author || 'CF15 Office'}
                    </Text>
                </Text>
            </View>
            <TouchableOpacity
                onPress={e => {
                    e.stopPropagation();
                    toggleBookmark(item._id);
                }}
                style={styles.bookmarkButton}>
                <Icon
                    name={
                        bookmarkedItems[item._id]
                            ? 'bookmark'
                            : 'bookmark-outline'
                    }
                    size={20}
                    color={bookmarkedItems[item._id] ? '#FFA500' : 'gray'}
                />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    if (isLoading) {
        return <Loading />;
    }

    return (
        <View style={styles.container}>
            <View style={styles.searchWrapper}>
                <View style={styles.searchContainer}>
                    <Icon
                        name='search'
                        size={20}
                        color='#666'
                        style={styles.searchIcon}
                    />
                    <TextInput
                        style={styles.searchInput}
                        placeholder='Tìm kiếm tin tức...'
                        value={searchText}
                        onChangeText={setSearchText}
                        placeholderTextColor='#666'
                    />
                </View>
                <TouchableOpacity
                    onPress={() => setShowBookmarksOnly(prev => !prev)}
                    style={[
                        styles.bookmarkIconWrapper,
                        {
                            backgroundColor: showBookmarksOnly
                                ? '#FF98004D'
                                : '#EDEDED',
                        },
                    ]}>
                    <Icon
                        name='bookmark'
                        size={20}
                        color={showBookmarksOnly ? 'orange' : '#C4C4C4'}
                    />
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredNews}
                keyExtractor={item => item._id}
                renderItem={renderItem}
                contentContainerStyle={{padding: 10, flexGrow: 1}}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Image
                            source={images.emptyScheduleList}
                            style={styles.emptyImage}
                            resizeMode='contain'
                        />
                        {searchText.trim() ? (
                            <View style={{alignItems: 'center'}}>
                                <Text style={styles.emptyText}>
                                    Không tìm thấy tin tức nào phù hợp với
                                </Text>
                                <Text style={styles.emptyText}>
                                    "{searchText}"
                                </Text>
                            </View>
                        ) : (
                            <Text style={styles.emptyText}>
                                Không có tin tức nào
                            </Text>
                        )}
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        marginTop: 10,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 20,
        paddingHorizontal: 10,
        height: 50,
        marginRight: 10,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#000',
    },
    bookmarkIconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#EDEDED',
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 10,
        gap: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    textContainer: {
        flex: 1,
    },
    category: {
        fontWeight: 'bold',
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 14,
        color: '#000',
        marginBottom: 4,
    },
    description: {
        fontSize: 12,
        color: '#666',
        marginBottom: 4,
    },
    author: {
        fontSize: 12,
        color: '#666',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyImage: {
        width: 250,
        height: 250,
        marginBottom: 20,
    },
    emptyText: {
        fontSize: 18,
        color: 'gray',
    },
    bookmarkButton: {
        padding: 5,
    },
});
