import React, {useCallback, useEffect, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    FlatList,
    TextInput,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import SCREEN_INFO from '../../../config/SCREEN_CONFIG/screenInfo';
import useGardenStore from '../../../stores/gardenStore';
import Loading from '../../subscreen/Loading';
import {IGarden} from '@/shared-types/Response/GardenResponse/GardenResponse';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useAuthStore} from '../../../stores/authStore';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useRoute} from '@react-navigation/native';

const GardenInfoWorker = () => {
    const navigation = useNavigation() as any;

    const {gardens, fetchGardens, isLoading} = useGardenStore();
    const [searchText, setSearchText] = useState('');
    const [filteredGardens, setFilteredGardens] = useState<IGarden[]>([]);
    const {userInfo} = useAuthStore();
    const route = useRoute<any>();
    const navigateNext =
        route.params?.navigateNext ?? SCREEN_INFO.GARDENWORKER.key;

    useEffect(() => {
        fetchGardens();
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchGardens();
        }, []),
    );

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
                navigation.navigate(navigateNext, {
                    code: item.code,
                })
            }>
            <Image
                source={require('../../../assets/images/garden.png')}
                style={styles.image}
                resizeMode='contain'
            />
            <View style={styles.cardContent}>
                <View style={styles.cardTextContainer}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.cardSubtitle}>{item.code}</Text>
                </View>
                {item.isHarvest && (
                    <MaterialCommunityIcons
                        name='cart-outline'
                        size={24}
                        style={styles.harvestIcon}
                    />
                )}
            </View>
        </TouchableOpacity>
    );

    if (isLoading) return <Loading />;

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <View style={styles.searchRow}>
                    <View style={styles.searchBoxWrapper}>
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
                                <TouchableOpacity
                                    onPress={() => setSearchText('')}>
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

                    {userInfo?.userType?.level === 'WORKER' && (
                        <TouchableOpacity
                            style={styles.qrButtonWrapper}
                            onPress={() =>
                                navigation.navigate(
                                    SCREEN_INFO.GARDENCAMERASCAN.key,
                                    {
                                        navigateNext: navigateNext,
                                    },
                                )
                            }>
                            <View style={styles.qrButton}>
                                <Icon
                                    name='qr-code-scanner'
                                    size={24}
                                    color='#2E7D32'
                                />
                            </View>
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
                        {searchText.trim() ? (
                            <View style={{alignItems: 'center'}}>
                                <Text style={styles.emptyText}>
                                    Không tìm thấy khu vườn liên quan tới
                                </Text>
                                <Text style={[styles.emptyText]}>
                                    "{searchText}"
                                </Text>
                            </View>
                        ) : (
                            <Text style={styles.emptyText}>
                                Không có dữ liệu khu vườn
                            </Text>
                        )}
                    </View>
                }
            />
        </View>
    );
};

export default GardenInfoWorker;

const styles = StyleSheet.create({
    cardContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    harvestIcon: {
        color: '#2E7D32',
    },

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
        paddingTop: 350,
    },
    emptyText: {
        fontSize: 16,
        color: 'gray',
        fontStyle: 'italic',
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
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    searchBoxWrapper: {
        flex: 8,
    },

    qrButtonWrapper: {
        flex: 2,
        alignItems: 'flex-end',
        justifyContent: 'center',
    },

    qrButton: {
        backgroundColor: '#E6F4EA',
        padding: 8,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },

    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F0F0',
        borderRadius: 8,
        paddingHorizontal: 8,
        height: 40,
    },
});
