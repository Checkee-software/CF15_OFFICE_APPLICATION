import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Image,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import SCREEN_INFO from '../../../config/SCREEN_CONFIG/screenInfo';
import images from '../../../assets/images';
import {useWorkerStore} from '../../../stores/workerStore';
import Loading from '@/screens/subscreen/Loading';

const Unit = ({navigation}) => {
    const {listWorker, getListWorkerByLeader, isLoading} = useWorkerStore();

    const [searchWorker, setSearchWorker] = useState('');

    const filterWorkerBySearch = listWorker.filter(user =>
        user?.fullName.toLowerCase().includes(searchWorker.toLowerCase()),
    );

    const handleReFetch = () => {
        if (searchWorker.length !== 0) {
            setSearchWorker('');
        }
        getListWorkerByLeader();
    };

    const renderWorker = (itemListWorker: any) => (
        <View style={UnitStyles.listWorkerMargin}>
            <TouchableOpacity
                style={UnitStyles.workerCard}
                onPress={() =>
                    navigation.navigate(SCREEN_INFO.WORKERINFO.key, {
                        itemListWorker,
                    })
                }>
                <View style={UnitStyles.leftWorkerCard}>
                    <View style={UnitStyles.workerAvatar}>
                        <Image
                            source={{
                                uri: itemListWorker.avatar,
                            }}
                            style={UnitStyles.avatar}
                        />
                    </View>

                    <View style={UnitStyles.workerNameAndUnit}>
                        <Text style={UnitStyles.workerName}>
                            {itemListWorker.fullName}
                        </Text>
                        <Text style={UnitStyles.workerUnit}>
                            {itemListWorker.userType.role}
                        </Text>
                    </View>
                </View>

                <View>
                    <Text style={UnitStyles.workerOrder}>
                        {itemListWorker.order}
                    </Text>
                </View>
            </TouchableOpacity>
        </View>
    );

    useEffect(() => {
        getListWorkerByLeader();
    }, []);

    if (isLoading) return <Loading />;

    return (
        <View style={UnitStyles.container}>
            <View style={UnitStyles.searchInput}>
                <MaterialIcons
                    name='search'
                    color={'rgba(128, 128, 128, 1)'}
                    size={22}
                />
                <TextInput
                    placeholder='Tìm kiếm nhân sự'
                    placeholderTextColor={'rgba(128, 128, 128, 1)'}
                    style={UnitStyles.input}
                    onChangeText={setSearchWorker}
                />
            </View>

            {listWorker.length !== 0 ? (
                filterWorkerBySearch.length !== 0 ? (
                    <View style={UnitStyles.listWorker}>
                        <FlatList
                            data={filterWorkerBySearch}
                            renderItem={({item}) => renderWorker(item)}
                            keyExtractor={item => item._id}
                            onRefresh={handleReFetch}
                            refreshing={isLoading}
                        />
                    </View>
                ) : (
                    <View style={UnitStyles.workerEmpty}>
                        <Image
                            source={images.emptyWorkerList}
                            style={UnitStyles.emptyWorkerImg}
                        />
                        <Text style={UnitStyles.emptyWorkerText}>
                            {`Không tìm thấy nhân sự phù hợp với ${searchWorker}`}
                        </Text>
                    </View>
                )
            ) : (
                <View style={UnitStyles.workerEmpty}>
                    <Image
                        source={images.emptyWorkerList}
                        style={UnitStyles.emptyWorkerImg}
                    />
                    <Text style={UnitStyles.emptyWorkerText}>
                        Không tìm thấy danh sách nhân sự!
                    </Text>
                </View>
            )}
        </View>
    );
};

const UnitStyles = StyleSheet.create({
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
        flex: 1,
        paddingVertical: 10,
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
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    emptyWorkerImg: {
        width: 305,
        height: 180,
    },
    emptyWorkerText: {
        fontWeight: 400,
        fontSize: 14,
        color: 'rgba(128, 128, 128, 1)',
    },
});

export default Unit;
