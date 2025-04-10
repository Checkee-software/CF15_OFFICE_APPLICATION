import React, {useState, useEffect} from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    Image,
    TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import images from '../../../assets/images';
import SCREEN_INFO from '../../../config/SCREEN_CONFIG/screenInfo';
import Loading from '../../subscreen/Loading'; // Import Loading component

type NewsItem = {
    id: string;
    title: string;
    description: string;
    author: string;
    image: any;
    bookmarked: boolean;
};

const DATA: NewsItem[] = [
    {
        id: '1',
        title: 'Cây trồng',
        description: 'Lorem ipsum dolor sit amet consectetur. Pretium odio proin...',
        author: 'CF15 Office',
        image: images.plant2,
        bookmarked: false,
    },
    {
        id: '2',
        title: 'Nông nghiệp',
        description: 'Lorem ipsum dolor sit amet consectetur. Pretium odio proin...',
        author: 'CF15 Office',
        image: images.plant1,
        bookmarked: true,
    },
    {
        id: '3',
        title: 'Nông nghiệp',
        description: 'Lorem ipsum dolor sit amet consectetur. Pretium odio proin...',
        author: 'CF15 Office',
        image: images.plant2,
        bookmarked: false,
    },
];

export default function News({navigation}: {navigation: any}) {
    const [newsList, setNewsList] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setNewsList(DATA); 
            setLoading(false); 
        }, 2000); 

        return () => clearTimeout(timeout);
    }, []);

    const toggleBookmark = (id: string) => {
        setNewsList(prev =>
            prev.map(item =>
                item.id === id ? {...item, bookmarked: !item.bookmarked} : item,
            ),
        );
    };

    const handleItemPress = (item: NewsItem) => {
        navigation.navigate(SCREEN_INFO.NEWS1.key, {newsItem: item});
    };

    const renderItem = ({item}: {item: NewsItem}) => (
        <TouchableOpacity 
            style={styles.itemContainer} 
            onPress={() => handleItemPress(item)}
            activeOpacity={0.7}
        >
            <Image source={item.image} style={styles.image} />
            <View style={styles.textContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
                <Text style={styles.author}>
                    Tác giả: <Text style={{color: '#339CFF'}}>{item.author}</Text>
                </Text>
            </View>
            <TouchableOpacity 
                onPress={(e) => {
                    e.stopPropagation(); 
                    toggleBookmark(item.id);
                }}
                style={styles.bookmarkButton}
            >
                <Icon
                    name={item.bookmarked ? 'bookmark' : 'bookmark-outline'}
                    size={20}
                    color={item.bookmarked ? '#FF9B0D' : 'gray'}
                />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    if (loading) {
        return <Loading />;
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={newsList}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={{padding: 10, flexGrow: 1}}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Không có tin tức nào</Text>
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
