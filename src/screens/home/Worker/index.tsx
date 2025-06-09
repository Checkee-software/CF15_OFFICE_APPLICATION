import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Image,
    SectionList,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import SCREEN_INFO from '../../../config/SCREEN_CONFIG/screenInfo';
import images from '../../../assets/images';
import {useWorkerStore} from '../../../stores/workerStore';
import Loading from '@/screens/subscreen/Loading';

const Woker = ({navigation}: any) => {
    const {
        listWorker,
        listWorkerFilterByRole,
        getListWorkerByDepartment,
        isLoading,
    } = useWorkerStore();

    const [searchWorker, setSearchWorker] = useState('');

    const filterWorkerBySearch = listWorker.filter(user =>
        user?.fullName.toLowerCase().includes(searchWorker.toLowerCase()),
    );

    const handleReFetch = () => {
        if (searchWorker.length !== 0) {
            setSearchWorker('');
        }
        getListWorkerByDepartment();
    };

    const renderWorkerBySearch = (itemWorkerBySearch: any) => (
        <View style={WokerStyles.listWorkerMargin}>
            <TouchableOpacity
                style={WokerStyles.workerCard}
                onPress={() =>
                    navigation.navigate(SCREEN_INFO.WORKERINFO.key, {
                        itemWorkerBySearch,
                    })
                }>
                <View style={WokerStyles.leftWorkerCard}>
                    <View style={WokerStyles.workerAvatar}>
                        <Image
                            source={
                                itemWorkerBySearch.avatar
                                    ? {
                                          uri: itemWorkerBySearch.avatar,
                                      }
                                    : images.avatar
                            }
                            style={WokerStyles.avatar}
                        />
                    </View>

                    <View style={WokerStyles.workerNameAndUnit}>
                        <Text style={WokerStyles.workerName}>
                            {itemWorkerBySearch.fullName}
                        </Text>
                        <Text style={WokerStyles.workerUnit}>
                            {itemWorkerBySearch.userType.unit}
                        </Text>
                    </View>
                </View>

                <View>
                    <Text style={WokerStyles.workerOrder}>
                        {itemWorkerBySearch.order}
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    );

    const renderListWorker = (itemListWorker: any) => (
        <View style={WokerStyles.listWorkerMargin}>
            <TouchableOpacity
                style={WokerStyles.workerCard}
                onPress={() =>
                    navigation.navigate(SCREEN_INFO.WORKERINFO.key, {
                        itemListWorker,
                    })
                }>
                <View style={WokerStyles.leftWorkerCard}>
                    <View style={WokerStyles.workerAvatar}>
                        <Image
                            source={
                                itemListWorker.avatar
                                    ? {
                                          uri: itemListWorker.avatar,
                                      }
                                    : images.avatar
                            }
                            style={WokerStyles.avatar}
                        />
                    </View>

                    <View style={WokerStyles.workerNameAndUnit}>
                        <Text style={WokerStyles.workerName}>
                            {itemListWorker.fullName}
                        </Text>
                        <Text style={WokerStyles.workerUnit}>
                            {itemListWorker.userType.unit}
                        </Text>
                    </View>
                </View>

                <View>
                    <Text style={WokerStyles.workerOrder}>
                        {itemListWorker.order}
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    );

    useEffect(() => {
        getListWorkerByDepartment();
        // eslint-disable-next-line
    }, []);

    if (isLoading) return <Loading />;

    return (
        <View style={WokerStyles.container}>
            <View style={WokerStyles.searchInput}>
                <MaterialIcons
                    name='search'
                    color={'rgba(128, 128, 128, 1)'}
                    size={22}
                />
                <TextInput
                    value={searchWorker}
                    placeholder='Tìm kiếm nhân sự'
                    placeholderTextColor={'rgba(128, 128, 128, 1)'}
                    style={WokerStyles.input}
                    onChangeText={setSearchWorker}
                />
            </View>

            {searchWorker !== '' ? (
                <View style={WokerStyles.searchListWorker}>
                    <FlatList
                        contentContainerStyle={WokerStyles.sectionListWorker}
                        data={filterWorkerBySearch}
                        renderItem={({item}) => renderWorkerBySearch(item)}
                        keyExtractor={item => item._id}
                        onRefresh={handleReFetch}
                        refreshing={isLoading}
                        ListEmptyComponent={
                            <View style={WokerStyles.workerEmpty}>
                                <Image
                                    source={images.emptyWorkerList}
                                    style={WokerStyles.emptyWorkerImg}
                                    resizeMode='contain'
                                />
                                <Text style={WokerStyles.emptyWorkerText}>
                                    {`Không tìm thấy nhân sự phù hợp với \n “${searchWorker}"`}
                                </Text>
                            </View>
                        }
                    />
                </View>
            ) : (
                <View style={WokerStyles.listWorker}>
                    <SectionList
                        contentContainerStyle={WokerStyles.sectionListWorker}
                        sections={listWorkerFilterByRole}
                        keyExtractor={item => item._id}
                        onRefresh={handleReFetch}
                        refreshing={isLoading}
                        renderItem={({item}) => renderListWorker(item)}
                        renderSectionHeader={({section}) => (
                            <Text style={WokerStyles.workerRole}>
                                {`${section.title} (${section.data.length})`}
                            </Text>
                        )}
                        ListEmptyComponent={
                            <View style={WokerStyles.workerEmpty}>
                                <Image
                                    source={images.emptyWorkerList}
                                    style={WokerStyles.emptyWorkerImg}
                                    resizeMode='contain'
                                />
                                <Text style={WokerStyles.emptyWorkerText}>
                                    Không tìm thấy danh sách nhân sự!
                                </Text>
                            </View>
                        }
                    />
                </View>
            )}
        </View>
    );
};

const WokerStyles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
    },
    searchInput: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(211, 211, 211, 1)',
        gap: 4,
    },
    input: {
        color: 'black',
        width: '92%',
    },
    listWorker: {
        marginTop: 10,
        flex: 1,
    },
    sectionListWorker: {
        flexGrow: 1,
    },
    workerByRoleSection: {
        gap: 15,
    },
    workerRole: {
        marginTop: 10,
        fontWeight: 500,
        fontSize: 14,
        color: 'rgba(0, 0, 0, 1)',
    },
    listWorkerMargin: {
        marginVertical: 12,
    },
    workerCard: {
        paddingHorizontal: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    leftWorkerCard: {
        flexDirection: 'row',
        gap: 13,
        alignItems: 'center',
        flex: 1,
    },
    workerAvatar: {
        backgroundColor: 'rgba(211, 211, 211, 1)',
        borderRadius: '50%',
        width: 56,
        height: 56,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 24,
        margin: 'auto',
    },
    workerNameAndUnit: {
        gap: 2,
        width: '80%',
    },
    workerName: {
        color: 'rgba(76, 175, 80, 1)',
        fontWeight: 600,
        fontSize: 15,
        textTransform: 'capitalize',
    },
    workerUnit: {
        textTransform: 'capitalize',
        fontSize: 13,
        fontWeight: 400,
        color: 'rgba(0, 0, 0, 1)',
    },
    workerOrder: {
        color: 'rgba(128, 128, 128, 1)',
        fontWeight: 400,
        fontSize: 14,
        textTransform: 'uppercase',
    },
    workerEmpty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyWorkerImg: {
        height: 200,
    },
    emptyWorkerText: {
        textAlign: 'center',
        fontWeight: 400,
        fontSize: 14,
        color: 'rgba(128, 128, 128, 1)',
    },
    searchListWorker: {
        paddingVertical: 10,
        flex: 1,
    },
});

export default Woker;
