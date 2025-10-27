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
import {useNavigation} from '@react-navigation/native';
import SCREEN_INFO from '../../../config/SCREEN_CONFIG/screenInfo';
import useGardenStore from '../../../stores/gardenStore';
import Loading from '../../subscreen/Loading';
import {IGarden} from '../../../stores/gardenStore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icons from 'react-native-vector-icons/Ionicons';
import {useAuthStore} from '../../../stores/authStore';
import Snackbar from 'react-native-snackbar';
import asyncStorageHelper from '../../../utils/localStorageHelper/index';
import Backdrop from '@/screens/subscreen/Loading/index2';
import {KeyboardAwareFlatList} from 'react-native-keyboard-aware-scroll-view';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {Dropdown} from 'react-native-element-dropdown';
import {useStatisticStore} from '@/stores/statisticStore';
import {useWorkScheduleStore} from '@/stores/workScheduleStore';

const GardenInfo = () => {
    const [filterVisible, setFilterVisible] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [selectedPlant, setSelectedPlant] = useState(null);
    const [selectedGarden, setSelectedGarden] = useState(null);
    const {getListSelection, listSelection} = useStatisticStore();
    const {getProductType, listProductType} = useWorkScheduleStore();
    const navigation = useNavigation() as any;

    const {
        gardens,
        fetchGardens,
        isLoading,
        setGardenData,
        isLoading2,
        filterGarden,
        plantsGarden,
        getPlantGarden,
    } = useGardenStore();
    const {userInfo} = useAuthStore();

    const [gardenNameInput, setGardenNameInput] = useState({_id: '', name: ''});
    const [showInputGardenName, setShowInputGardenName] = useState({
        _id: '',
        check: false,
    });

    const [searchText, setSearchText] = useState('');
    const [filteredGardens, setFilteredGardens] = useState<IGarden[]>([]);

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

    const handleNavigate = (item: any) => {
        if (
            userInfo.functions.some(
                (itemUser: any) => itemUser._id === 'GARDEN' && itemUser.detail,
            )
        ) {
            setGardenNameInput({
                _id: '',
                name: '',
            });
            setShowInputGardenName({_id: '', check: false});

            navigation.navigate(SCREEN_INFO.GARDENINFO1.key, {id: item._id});
        } else {
            setGardenNameInput({
                _id: '',
                name: '',
            });
            setShowInputGardenName({_id: '', check: false});

            Snackbar.show({
                text: 'Bạn không có quyền xem chi tiết khu vườn',
                duration: Snackbar.LENGTH_SHORT,
            });
        }
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
        if (gardenNameInput.name !== '') {
            asyncStorageHelper.setStorageUserGardens(
                userInfo._id,
                gardenNameInput._id,
                gardenNameInput.name,
            );
            const newGardenNickname = getStorageUserGardens();
            setGardenData(newGardenNickname);

            setGardenNameInput({
                _id: '',
                name: '',
            });
            setShowInputGardenName({_id: '', check: false});
        } else {
            setGardenNameInput({
                _id: '',
                name: '',
            });
            setShowInputGardenName({_id: '', check: false});
        }
    };

    useEffect(() => {
        fetchGardens(userInfo._id);
    }, []);

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

    const renderItem = ({item}: {item: IGarden}) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => handleNavigate(item)}>
            <Image
                source={require('../../../assets/images/garden.png')}
                style={styles.image}
                resizeMode='contain'
            />
            <View style={styles.cardContent}>
                <View style={styles.cardTextContainer}>
                    <Text style={styles.cardTitle}>{item.name}</Text>

                    {showInputGardenName._id === item._id ? (
                        <TextInput
                            style={{
                                width: '90%',
                                padding: 0,
                                margin: 0,
                            }}
                            placeholder='Hãy đặt tên khu vườn'
                            placeholderTextColor={'black'}
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
                    <FontAwesome name='check' size={28} color={'#2196F3'} />
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
                                    : '',
                            });
                    }}>
                    <FontAwesome name='pencil' size={28} color={'#FF4E45'} />
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );

    if (isLoading) return <Loading />;

    console.log(gardens);

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
                        placeholder='Tìm kiếm khu vườn '
                        value={searchText}
                        onChangeText={setSearchText}
                        placeholderTextColor='#888'
                    />
                    {searchText.length > 0 && (
                        <TouchableOpacity
                            onPress={() => {
                                setSearchText('');
                                filterGarden({
                                    groupId: filters.teamId,
                                    productTypeId: filters.productTypeId,
                                    productId: filters.productId,
                                });
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
                <TouchableOpacity onPress={() => setFilterVisible(true)}>
                    <Icons
                        name='filter-outline'
                        size={35}
                        color='#888'
                        style={styles.filterIcon}
                    />
                </TouchableOpacity>
            </View>

            <KeyboardAwareFlatList
                data={gardens}
                extraHeight={100}
                renderItem={renderItem}
                keyboardShouldPersistTaps='handled'
                keyExtractor={item => item._id}
                contentContainerStyle={styles.listContainer}
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

            <Modal
                visible={filterVisible}
                animationType='fade'
                transparent
                onRequestClose={() => setFilterVisible(false)}>
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setFilterVisible(false)}>
                    <Pressable
                        style={styles.modalContainer}
                        onPress={e => e.stopPropagation()}>
                        <Text style={styles.modalTitle}>Bộ lọc nâng cao</Text>

                        {/* Đội sản xuất */}
                        <View style={styles.dropdownBlock}>
                            <Text style={styles.dropdownLabel}>
                                Đội sản xuất
                            </Text>
                            <Dropdown
                                style={styles.dropdown}
                                data={teams}
                                labelField='label'
                                valueField='value'
                                placeholder='Tất cả Đội sản xuất'
                                value={selectedTeam}
                                onChange={item => {
                                    const newFilters = {
                                        ...filters,
                                        teamId:
                                            item.value !== 'all'
                                                ? item.value
                                                : undefined,
                                    };
                                    setSelectedTeam(item.value);
                                    setFilters(newFilters);
                                    filterGarden({
                                        groupId: newFilters.teamId,
                                        productTypeId: newFilters.productTypeId,
                                        productId: newFilters.productId,
                                    });
                                }}
                            />
                        </View>

                        {/* Cây trồng */}
                        <View style={styles.dropdownBlock}>
                            <Text style={styles.dropdownLabel}>Cây trồng</Text>

                            <Dropdown
                                style={styles.dropdown}
                                data={plants}
                                labelField='label'
                                valueField='value'
                                placeholder='Tất cả Cây trồng'
                                value={selectedPlant}
                                onChange={item => {
                                    const newFilters = {
                                        ...filters,
                                        productTypeId:
                                            item.value !== 'all'
                                                ? item.value
                                                : undefined,
                                    };
                                    setSelectedPlant(item.value);
                                    setFilters(newFilters);

                                    if (item.value !== 'all') {
                                        getPlantGarden(item.value);
                                    }

                                    filterGarden({
                                        groupId: newFilters.teamId,
                                        productTypeId: newFilters.productTypeId,
                                        productId: newFilters.productId,
                                    });
                                }}
                            />
                        </View>

                        {/* Khu vườn */}
                        <View style={styles.dropdownBlock}>
                            <Text style={styles.dropdownLabel}>Khu vườn</Text>
                            <Dropdown
                                style={styles.dropdown}
                                data={gardensFilter}
                                labelField='label'
                                valueField='value'
                                placeholder='Tất cả Khu vườn'
                                value={selectedGarden}
                                onChange={item => {
                                    const newFilters = {
                                        ...filters,
                                        productId:
                                            item.value !== 'all'
                                                ? item.value
                                                : undefined,
                                    };
                                    setSelectedGarden(item.value);
                                    setFilters(newFilters);

                                    filterGarden({
                                        groupId: newFilters.teamId,
                                        productTypeId: newFilters.productTypeId,
                                        productId: newFilters.productId,
                                    });
                                }}
                            />
                        </View>

                        {/* Nút đặt lại */}
                        <TouchableOpacity
                            style={styles.resetButton}
                            onPress={() => {
                                setSelectedTeam(null);
                                setSelectedPlant(null);
                                setSelectedGarden(null);
                                setFilters({
                                    teamId: undefined,
                                    productTypeId: undefined,
                                    productId: undefined,
                                });
                            }}>
                            <Text style={styles.resetText}>✕ ĐẶT LẠI</Text>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>

            <Backdrop open={isLoading2} />
        </View>
    );
};

export default GardenInfo;

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
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F0F0',
        borderRadius: 8,
        paddingHorizontal: 8,
        height: 40,
        flex: 8.5,
    },
    searchIcon: {
        marginRight: 8,
    },
    filterIcon: {
        flex: 1.5,
    },
    searchContainer: {
        paddingHorizontal: 16,
        marginBottom: 12,
        flexDirection: 'row',
        gap: 10,
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
});
