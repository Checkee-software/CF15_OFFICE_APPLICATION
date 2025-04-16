import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    Image,
    TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import SCREEN_INFO from '../../../config/SCREEN_CONFIG/screenInfo';
import Loading from '../../subscreen/Loading';
import useNewsStore from '../../../stores/newsStore';
import { INews } from '../../../shared-types/Response/NewsResponse'; 

export default function News({navigation}: {navigation: any}) {
    const {news, fetchNews, isLoading} = useNewsStore();
    const [bookmarkedItems, setBookmarkedItems] = useState<{
        [key: string]: boolean;
    }>({});

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

    const renderItem = ({item}: {item: INews}) => (
        <TouchableOpacity
            style={styles.itemContainer}
            onPress={() => handleItemPress(item)}
            activeOpacity={0.7}>
            <Image
                source={{
                    uri:
                        (item as any).image || // fallback nếu image không có trong INews
                        'https://vov2.vov.vn/sites/default/files/2021-02/z2346000241203_2c20d4b68755b5f540ee91114347778a.jpg',
                }}
                style={styles.image}
            />

            <View style={styles.textContainer}>
                <Text style={styles.title}>{(item as any).newsType}</Text>
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
            <FlatList
                data={news}
                keyExtractor={item => item._id}
                renderItem={renderItem}
                contentContainerStyle={{padding: 10, flexGrow: 1}}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            Không có tin tức nào
                        </Text>
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
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 10,
        gap: 10,
    },
    image: {
        width: 92,
        height: 92,
        borderRadius: 8,
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 12,
        color: '#666',
    },
    description: {
        fontSize: 14,
        color: '#000',
    },
    author: {
        fontSize: 12,
        marginTop: 4,
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
