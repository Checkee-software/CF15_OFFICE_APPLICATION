/* eslint-disable react-native/no-inline-styles */
import React, {useCallback, useEffect, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    FlatList,
    TextInput,
    ScrollView,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import SCREEN_INFO from '../../../config/SCREEN_CONFIG/screenInfo';
import useGardenStore from '../../../stores/gardenStore';
import Loading from '../../subscreen/Loading';
import {IGarden} from '@/shared-types/Response/GardenResponse/GardenResponse';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {useAuthStore} from '../../../stores/authStore';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useRoute} from '@react-navigation/native';
import asyncStorageHelper from '../../../utils/localStorageHelper/index';
import Backdrop from '@/screens/subscreen/Loading/index2';
import {KeyboardAwareFlatList} from 'react-native-keyboard-aware-scroll-view';

const GardenInfoWorker = () => {
    const navigation = useNavigation() as any;

    const {gardens, fetchGardens, isLoading, setGardenData, isLoading2} =
        useGardenStore();
    const [searchText, setSearchText] = useState('');
    const [filteredGardens, setFilteredGardens] = useState<IGarden[]>([]);

    const [gardenNameInput, setGardenNameInput] = useState({_id: '', name: ''});
    const [showInputGardenName, setShowInputGardenName] = useState({
        _id: '',
        check: false,
    });

    const {userInfo} = useAuthStore();
    const route = useRoute<any>();
    const navigateNext =
        route.params?.navigateNext ?? SCREEN_INFO.GARDENWORKER.key;

    const handleNavigate = (code: string) => {
        setShowInputGardenName({
            _id: '',
            check: false,
        });
        setShowInputGardenName({_id: '', check: false});

        navigation.navigate(navigateNext, {
            code: code,
        });
    };

    const getStorageUserGardens = () => {
        const newGardens = gardens;
        const userGardenNickname = asyncStorageHelper.userGardenNickname;

        const user = userGardenNickname.find(u => u.userId === userInfo._id);
        return newGardens?.map((item: any) => {
            let gardenNickname = '';

            if (user) {
                const matchedGarden = user.garden.find(
                    g => g.gardenId === item._id,
                );
                if (matchedGarden) {
                    gardenNickname = matchedGarden.gardenNickname;
                }
            }

            // Trả về object gốc + thêm gardenNickname
            return {
                ...item,
                gardenNickname,
            };
        });
    };

    const saveGardenName = () => {
        asyncStorageHelper.setStorageUserGardens(
            userInfo._id,
            gardenNameInput._id,
            gardenNameInput.name,
        );
        const newGardenNickname = getStorageUserGardens();
        setGardenData(newGardenNickname);

        setShowInputGardenName({
            _id: '',
            check: false,
        });
        setShowInputGardenName({_id: '', check: false});
    };

    useEffect(() => {
        fetchGardens(userInfo._id);
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchGardens(userInfo._id);
        }, []),
    );

    useEffect(() => {
        const gardenList = gardens ?? [];

        if (searchText === '') {
            setFilteredGardens(gardenList as IGarden[]);
        } else {
            const filtered = (gardenList as IGarden[]).filter(
                (garden: IGarden) =>
                    garden.name
                        .toLowerCase()
                        .includes(searchText.toLowerCase()) ||
                    garden.code
                        .toLowerCase()
                        .includes(searchText.toLowerCase()) ||
                    garden.gardenNickname
                        .toLowerCase()
                        .includes(searchText.toLowerCase()),
            );
            setFilteredGardens(filtered);
        }
    }, [searchText, gardens]);

    const renderItem = ({item}: {item: IGarden}) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => handleNavigate(item.code)}>
            <Image
                source={require('../../../assets/images/garden.png')}
                style={styles.image}
                resizeMode='contain'
            />
            <View style={styles.cardContent}>
                <View style={styles.cardTextContainer}>
                    {showInputGardenName._id === item._id ? (
                        <TextInput
                            style={{
                                width: '90%',
                                padding: 0,
                                margin: 0,
                            }}
                            autoFocus={
                                gardenNameInput._id === item._id ? true : false
                            }
                            onChangeText={value =>
                                setGardenNameInput({
                                    ...gardenNameInput,
                                    name: value,
                                })
                            }
                            value={gardenNameInput.name}
                        />
                    ) : (
                        <Text style={styles.cardTitle}>
                            {item.gardenNickname !== ''
                                ? item.gardenNickname
                                : item.name}
                        </Text>
                    )}

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

            {showInputGardenName._id === item._id ? (
                <TouchableOpacity onPress={saveGardenName}>
                    <FontAwesome name='check' size={24} color={'#2196F3'} />
                </TouchableOpacity>
            ) : (
                <TouchableOpacity
                    onPress={() => {
                        setShowInputGardenName({
                            _id: item._id,
                            check: true,
                        }),
                            setGardenNameInput({
                                _id: item._id,
                                name: item.gardenNickname
                                    ? item.gardenNickname
                                    : item.name,
                            });
                    }}>
                    <FontAwesome name='pencil' size={24} color={'#FF4E45'} />
                </TouchableOpacity>
            )}
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

            <KeyboardAwareFlatList
                data={filteredGardens}
                extraHeight={100}
                renderItem={renderItem}
                keyboardShouldPersistTaps='handled'
                keyExtractor={item => item._id}
                contentContainerStyle={styles.listContainer}
                scrollEnabled={false}
                enableOnAndroid
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

            <Backdrop open={isLoading2} />
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
        width: '85%',
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
