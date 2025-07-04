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
import {
    useFocusEffect,
    useNavigation,
    useRoute,
} from '@react-navigation/native';
import SCREEN_INFO from '../../../config/SCREEN_CONFIG/screenInfo';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Loading from '../../subscreen/Loading';
import {useWorkScheduleStore} from '../../../stores/workScheduleStore';
import {IJob} from '../../../shared-types/Response/ScheduleResponse/ScheduleResponse';
import {useAuthStore} from '../../../stores/authStore';

const JobListWorker = () => {
    const navigation = useNavigation() as any;
    const route = useRoute<any>();
    const {userInfo} = useAuthStore();
    const navigateNext =
        route.params?.navigateNext ?? SCREEN_INFO.GARDENDECLAREWORKER.key;

    const {listJobs, getListJobs, isLoading} = useWorkScheduleStore();

    const [searchText, setSearchText] = useState('');
    const [filteredJobs, setFilteredJobs] = useState<IJob[]>([]);

    useEffect(() => {
        getListJobs();
    }, []);

    useFocusEffect(
        useCallback(() => {
            getListJobs();
        }, []),
    );

    useEffect(() => {
        const processingJobs = listJobs.filter(
            job => job.status === 'PROCESSING',
        );

        if (searchText === '') {
            setFilteredJobs(processingJobs);
        } else {
            const filtered = processingJobs.filter(job =>
                job.title.toLowerCase().includes(searchText.toLowerCase()),
            );
            setFilteredJobs(filtered);
        }
    }, [searchText, listJobs]);

    const formatDate = (dateStr: string | Date) => {
        const date = new Date(dateStr);
        return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    };

    const formatDateRange = (start: string, end: string) => {
        return `${formatDate(start)} → ${formatDate(end)}`;
    };

    const formatRemainingTime = (endDateStr: string | Date) => {
        const now = new Date();
        const end = new Date(endDateStr);
        const diffMs = end.getTime() - now.getTime();

        if (diffMs <= 0) return 'Đã kết thúc';

        const totalMinutes = Math.floor(diffMs / (1000 * 60));
        const days = Math.floor(totalMinutes / (60 * 24));
        const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
        const minutes = totalMinutes % 60;

        let result = 'Còn ';
        if (days > 0) result += `${days} ngày `;
        if (hours > 0) result += `${hours} giờ `;
        result += `${minutes} phút`;

        return result.trim();
    };

    const renderItem = ({item}: {item: IJob}) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() =>
                navigation.navigate(navigateNext, {
                    jobId: item._id,
                    id: item._id,
                })
            }>
            <Image
                source={require('../../../assets/images/garden.png')}
                style={styles.image}
                resizeMode='contain'
            />
            <View style={styles.cardContent}>
                <View style={styles.cardTextContainer}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.cardSubtitle}>{item.gardenName}</Text>
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginTop: 6,
                        }}>
                        <MaterialCommunityIcons
                            name='playlist-check'
                            size={16}
                            color='#555'
                        />
                        <Text style={{fontSize: 12, marginLeft: 4}}>
                            {item.totalChildTask}
                        </Text>
                        <MaterialCommunityIcons
                            name='clock'
                            size={16}
                            color='#555'
                            style={{marginLeft: 16}}
                        />
                        <Text
                            style={{
                                fontSize: 12,
                                marginLeft: 4,
                                fontStyle: 'italic',
                            }}>
                            {formatRemainingTime(item.finishedDate)}
                        </Text>
                    </View>
                </View>
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
                                placeholder='Tìm kiếm công việc'
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
                </View>
            </View>

            <FlatList
                data={filteredJobs}
                renderItem={renderItem}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        {searchText.trim() ? (
                            <View style={{alignItems: 'center'}}>
                                <Text style={styles.emptyText}>
                                    Không tìm thấy công việc liên quan tới
                                </Text>
                                <Text style={styles.emptyText}>
                                    "{searchText}"
                                </Text>
                            </View>
                        ) : (
                            <Text style={styles.emptyText}>
                                Không có dữ liệu công việc
                            </Text>
                        )}
                    </View>
                }
            />
        </View>
    );
};

export default JobListWorker;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 16,
    },
    searchContainer: {
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchBoxWrapper: {
        flex: 1,
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
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#000',
        paddingVertical: 0,
    },
    clearIcon: {
        marginLeft: 8,
    },
    listContainer: {
        paddingHorizontal: 16,
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
    cardContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
        color: '#2E7D32',
        marginTop: 4,
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
});
