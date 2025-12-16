/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    TextInput,
    Modal,
    Pressable,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import SCREEN_INFO from '../../../config/SCREEN_CONFIG/screenInfo';
import useGardenStore from '../../../stores/gardenStore';
import Loading from '../../subscreen/Loading';
import {IGarden} from '../../../stores/gardenStore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useAuthStore} from '../../../stores/authStore';
import asyncStorageHelper from '../../../utils/localStorageHelper/index';
import Backdrop from '@/screens/subscreen/Loading/index2';
import {KeyboardAwareFlatList} from 'react-native-keyboard-aware-scroll-view';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {useStatisticStore} from '@/stores/statisticStore';
import {useWorkScheduleStore} from '@/stores/workScheduleStore';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const GardenInfoWorker = () => {
    const [expandedParentId, setExpandedParentId] = useState<string | null>(
        null,
    );
    const [groupedGardens, setGroupedGardens] = useState<
        Record<string, IGarden[]>
    >({});

    const {getListSelection, listSelection} = useStatisticStore();
    const {getProductType, listProductType} = useWorkScheduleStore();
    const navigation = useNavigation() as any;

    const {
        gardens,
        // fetchGardens,
        isLoading,
        setGardenData,
        isLoading2,
        filterGarden,
        plantsGarden,
        getPlantGarden,
    } = useGardenStore();
    const {userInfo} = useAuthStore();
    const isDepartment = userInfo?.userType?.level === 'DEPARTMENT';

    const [gardenNameInput, setGardenNameInput] = useState({_id: '', name: ''});
    const [showInputGardenName, setShowInputGardenName] = useState({
        _id: '',
        check: false,
    });
    const [searchText, setSearchText] = useState('');
    const route = useRoute<any>();
    const navigateNext =
        route.params?.navigateNext ?? SCREEN_INFO.GARDENWORKER.key;
    const [filters, setFilters] = useState({
        teamId: undefined,
        productTypeId: undefined,
        productId: undefined,
    });

    const teams = [
        {label: 'Tất cả Đội sản xuất', value: 'all'},
        ...(listSelection
            ?.filter((item: any) => item._id !== '')
            .map((item: any) => ({
                label: item?.name ?? 'Không tên',
                value: item?._id,
            })) || []),
    ];

    const plants = [
        {label: 'Tất cả Cây trồng', value: 'all'},
        ...(listProductType?.map((item: any) => ({
            label: item?.name ?? 'Không tên',
            value: item?._id,
        })) || []),
    ];

    const gardensFilter = [
        {label: 'Tất cả Khu vườn', value: 'all'},
        ...(plantsGarden?.map((item: any) => ({
            label: item?.name ?? 'Không tên',
            value: item?._id,
        })) || []),
    ];

    const handleNavigate = (code: string) => {
        setGardenNameInput({
            _id: '',
            name: '',
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
            return {...item, gardenNickname};
        });
    };

    const saveGardenName = () => {
        if (gardenNameInput.name !== '') {
            asyncStorageHelper.setStorageUserGardens(
                userInfo._id,
                gardenNameInput._id,
                gardenNameInput.name,
            );
            const newGardenNickname = getStorageUserGardens();
            setGardenData(newGardenNickname);
        }
        setGardenNameInput({_id: '', name: ''});
        setShowInputGardenName({_id: '', check: false});
    };

    // useEffect(() => {
    //     filterGarden({
    //         userId: userInfo._id,
    //     });
    // }, []);

    useEffect(() => {
        getListSelection('UNIT');
        getProductType();
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            filterGarden({
                groupId: filters.teamId,
                productTypeId: filters.productTypeId,
                productId: filters.productId,
                searchValue: searchText.trim(),
                userId: userInfo._id,
            });
        }, 400);
        return () => clearTimeout(timeout);
    }, [searchText, filters]);

    useEffect(() => {
        if (gardens && gardens.length > 0) {
            const grouped: Record<string, IGarden[]> = {};
            gardens.forEach(garden => {
                const key = isDepartment
                    ? garden.groupId
                    : garden.productTypeId;
                if (!key) return;
                if (!grouped[key]) grouped[key] = [];
                grouped[key].push(garden);
            });
            setGroupedGardens(grouped);
        }
    }, [gardens, isDepartment]);

    const renderGardenItem = (item: IGarden) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => handleNavigate(item.code)}>
            <Image
                source={require('../../../assets/images/garden.png')}
                style={styles.image}
                resizeMode='contain'
            />
            <View style={styles.cardContent}>
                <View>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    {showInputGardenName._id === item._id ? (
                        <TextInput
                            style={{width: '90%', padding: 0, margin: 0}}
                            placeholder='Hãy đặt tên khu vườn'
                            placeholderTextColor={'black'}
                            autoFocus={gardenNameInput._id === item._id}
                            onChangeText={value =>
                                setGardenNameInput({
                                    ...gardenNameInput,
                                    name: value,
                                })
                            }
                            value={gardenNameInput.name}
                        />
                    ) : (
                        item.gardenNickname !== '' && (
                            <Text style={styles.cardTitle}>
                                {item.gardenNickname}
                            </Text>
                        )
                    )}
                    <Text style={styles.cardSubtitle}>{item.code}</Text>
                </View>
            </View>

            {showInputGardenName._id === item._id ? (
                <TouchableOpacity onPress={saveGardenName}>
                    <FontAwesome name='check' size={24} color={'#2196F3'} />
                </TouchableOpacity>
            ) : (
                <TouchableOpacity
                    style={styles.warpIcon}
                    onPress={() => {
                        setShowInputGardenName({_id: item._id, check: true});
                        setGardenNameInput({
                            _id: item._id,
                            name: item.gardenNickname
                                ? item.gardenNickname
                                : '',
                        });
                    }}>
                    {item.isHarvest && (
                        <MaterialCommunityIcons
                            name='cart-outline'
                            size={24}
                            style={styles.harvestIcon}
                        />
                    )}
                    <FontAwesome name='pencil' size={24} color={'#FF4E45'} />
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );

    const renderParentItem = ({item}: {item: any}) => {
        const isExpanded = expandedParentId === item.value;
        const gardensOfParent = groupedGardens[item.value] || [];

        return (
            <View>
                <TouchableOpacity
                    style={styles.teamCard}
                    onPress={() => {
                        setExpandedParentId(isExpanded ? null : item.value);
                    }}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Icon
                            name={isDepartment ? 'groups' : 'eco'}
                            size={26}
                            color='#4CAF50'
                            style={{marginRight: 10}}
                        />
                        <Text style={styles.teamName}>{item.label}</Text>
                    </View>
                    <Icon
                        name={isExpanded ? 'expand-less' : 'expand-more'}
                        size={28}
                        color='#999'
                    />
                </TouchableOpacity>

                {isExpanded && (
                    <View style={{paddingLeft: 30, paddingTop: 4}}>
                        {gardensOfParent.length > 0 ? (
                            gardensOfParent.map(g => (
                                <View key={g._id}>{renderGardenItem(g)}</View>
                            ))
                        ) : (
                            <Text
                                style={{
                                    textAlign: 'center',
                                    fontStyle: 'italic',
                                    color: '#888',
                                    marginVertical: 6,
                                }}>
                                Không có khu vườn thuộc{' '}
                                {isDepartment ? 'đội này' : 'cây trồng này'}
                            </Text>
                        )}
                    </View>
                )}
            </View>
        );
    };

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
                        <TouchableOpacity
                            onPress={() => {
                                setSearchText('');
                                filterGarden({});
                            }}>
                            <Icon
                                name='close'
                                size={20}
                                color='#888'
                                style={styles.clearIcon}
                            />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity
                    style={styles.qrButtonWrapper}
                    onPress={() =>
                        navigation.navigate(SCREEN_INFO.GARDENCAMERASCAN.key, {
                            navigateNext: navigateNext,
                        })
                    }>
                    <View style={styles.qrButton}>
                        <Icon
                            name='qr-code-scanner'
                            size={24}
                            color='#2E7D32'
                        />
                    </View>
                </TouchableOpacity>
            </View>

            {searchText.trim() !== '' ||
            filters.teamId ||
            filters.productTypeId ||
            filters.productId ? (
                <KeyboardAwareFlatList
                    data={gardens}
                    keyExtractor={item => item._id}
                    renderItem={({item}) => renderGardenItem(item)}
                    contentContainerStyle={{paddingLeft: 20}}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                Không có khu vườn phù hợp
                            </Text>
                        </View>
                    }
                />
            ) : (
                <KeyboardAwareFlatList
                    data={
                        isDepartment
                            ? teams.filter(item => item.value !== 'all')
                            : plants.filter(item => item.value !== 'all')
                    }
                    keyExtractor={item => item.value}
                    renderItem={renderParentItem}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                {isDepartment
                                    ? 'Không có đội sản xuất'
                                    : 'Không có cây trồng'}
                            </Text>
                        </View>
                    }
                />
            )}

            <Backdrop open={isLoading2} />
        </View>
    );
};

export default GardenInfoWorker;

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: '#fff', paddingTop: 16},
    searchContainer: {
        paddingHorizontal: 16,
        marginBottom: 12,
        flexDirection: 'row',
        gap: 10,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F0F0',
        borderRadius: 8,
        paddingHorizontal: 8,
        height: 40,
        flex: 8.5,
    },
    searchIcon: {marginRight: 8},
    filterIcon: {flex: 1.5},
    searchInput: {flex: 1, fontSize: 14, color: '#000'},
    clearIcon: {marginLeft: 8},
    teamCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F8F8F8',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginHorizontal: 16,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    teamName: {fontSize: 15, fontWeight: '600', color: '#000'},
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginVertical: 6,
        marginRight: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    image: {width: 36, height: 36, marginRight: 12},
    cardContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginRight: 10,
    },
    cardTitle: {fontSize: 14, fontWeight: '600', color: '#000'},
    cardSubtitle: {fontSize: 12, color: '#888'},
    emptyContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    warpIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    emptyText: {fontSize: 16, color: 'gray', fontStyle: 'italic'},
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 16,
        color: '#000',
    },
    dropdownBlock: {
        marginBottom: 12,
    },
    dropdownLabel: {
        fontSize: 16,
        color: '#333',
        marginBottom: 4,
    },
    dropdown: {
        height: 42,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        backgroundColor: '#fff',
    },
    resetButton: {
        marginTop: 12,
        borderWidth: 1,
        borderColor: '#ff4e45',
        backgroundColor: '#fff1f1',
        borderRadius: 8,
        paddingVertical: 10,
        alignItems: 'center',
    },
    resetText: {
        color: '#ff4e45',
        fontWeight: '600',
    },
    closeArea: {
        marginTop: 12,
        alignItems: 'center',
    },
    closeText: {
        color: '#2196F3',
        fontWeight: '600',
        fontSize: 14,
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
    harvestIcon: {
        color: '#2E7D32',
    },
});
