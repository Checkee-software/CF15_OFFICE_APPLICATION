import React, {useEffect, useState} from 'react';
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
export default function News({navigation}: {navigation: any}) {
    const {news, fetchNews, isLoading} = useNewsStore();
    const [bookmarkedItems, setBookmarkedItems] = useState<{
        [key: string]: boolean;
    }>({});
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        fetchNews();
    }, []);

    const handleItemPress = (item: INews) => {
        navigation.navigate(SCREEN_INFO.NEWS1.key, {id: item._id});
    };

    const toggleBookmark = (id: string) => {
        setBookmarkedItems(prev => ({
            ...prev,
            [id]: !prev[id],
        }));
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

        return (
            normalizedTitle.includes(normalizedSearch) ||
            normalizedContent.includes(normalizedSearch)
        );
    });

    const renderItem = ({item}: {item: INews}) => (
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => handleItemPress(item)}
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

            <FlatList
                data={filteredNews}
                keyExtractor={item => item._id}
                renderItem={renderItem}
                contentContainerStyle={{padding: 10, flexGrow: 1}}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Image
                            source={images.plant2}
                            style={styles.emptyImage}
                            resizeMode='contain'
                        />
                        {searchText.trim() ? (
                            <View style={{alignItems: 'center'}}>
                                <Text style={styles.emptyText}>
                                    Không tìm thấy tin tức nào phù hợp với
                                </Text>
                                <Text
                                    style={[
                                        styles.emptyText,
                                        {color: '#000', fontWeight: 'bold'},
                                    ]}>
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
    emptyImage: {
        width: 250,
        height: 250,
        marginBottom: 20,
    },

    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 20,
        paddingHorizontal: 10,
        margin: 10,
        height: 50,
        paddingVertical: 5,
        width: 350,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#000',
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
        width: 92,
        height: 92,
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
        paddingTop: 50,
    },

    emptyText: {
        fontSize: 18,
        color: 'gray',
    },
    bookmarkButton: {
        padding: 5,
    },
});
