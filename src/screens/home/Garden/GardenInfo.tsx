import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    FlatList,
    TextInput,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import SCREEN_INFO from '../../../config/SCREEN_CONFIG/screenInfo';
import useGardenStore from '../../../stores/gardenStore';
import Loading from '../../subscreen/Loading';
import {IGarden} from '@/shared-types/Response/GardenResponse/GardenResponse';
import Icon from 'react-native-vector-icons/MaterialIcons';

const GardenInfo = () => {
    const navigation = useNavigation();
    const {gardens, fetchGardens, isLoading} = useGardenStore();
    const [searchText, setSearchText] = useState('');
    const [filteredGardens, setFilteredGardens] = useState<IGarden[]>([]);

    useEffect(() => {
        fetchGardens();
    }, []);

    useEffect(() => {
        if (searchText === '') {
            setFilteredGardens(gardens);
        } else {
            const filtered = gardens.filter(
                garden =>
                    garden.name
                        .toLowerCase()
                        .includes(searchText.toLowerCase()) ||
                    garden.code
                        .toLowerCase()
                        .includes(searchText.toLowerCase()),
            );
            setFilteredGardens(filtered);
        }
    }, [searchText, gardens]);

    const renderItem = ({item}: {item: IGarden}) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() =>
                navigation.navigate(SCREEN_INFO.GARDENINFO1.key, {id: item._id})
            }>
            <Image
                source={require('../../../assets/images/garden.png')}
                style={styles.image}
                resizeMode='contain'
            />
            <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardSubtitle}>{item.code}</Text>
            </View>
        </TouchableOpacity>
    );

    if (isLoading) return <Loading />;

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Icon
                        name='search'
                        size={20}
                        color='#888'
                        style={styles.searchIcon}
                    />
                    <TextInput
                        style={styles.searchInput}
                        placeholder='Tìm kiếm khu vườn'
                        value={searchText}
                        onChangeText={setSearchText}
                        placeholderTextColor='#888'
                    />
                    {searchText.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchText('')}>
                            <Icon
                                name='close'
                                size={20}
                                color='#888'
                                style={styles.clearIcon}
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <FlatList
                data={filteredGardens}
                renderItem={renderItem}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        {searchText === '' ? (
                            <Text style={styles.emptyText}>
                                Không có dữ liệu khu vườn
                            </Text>
                        ) : (
                            <Text style={styles.emptyText}>
                                Không tìm thấy khu vườn liên quan tới {"\n"}
                                 "{searchText}"
                            </Text>
                        )}
                    </View>
                }
            />
        </View>
    );
};

export default GardenInfo;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 16,
    },
    listContainer: {
        paddingHorizontal: 16,
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F0F0',
        borderRadius: 8,
        paddingHorizontal: 8,
        height: 40,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchContainer: {
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        paddingVertical: 0,
        color: '#000',
    },
    clearIcon: {
        marginLeft: 8,
    },

    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 250,
    },
    emptyText: {
        fontSize: 16,
        color: 'gray',
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F8F8',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },

    image: {
        width: 40,
        height: 40,
        marginRight: 16,
    },

    cardTextContainer: {
        flex: 1,
        justifyContent: 'center',
    },

    cardTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    },

    cardSubtitle: {
        fontSize: 12,
        color: '#888',
        marginTop: 4,
    },
});
