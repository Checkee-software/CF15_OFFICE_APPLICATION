import React, {useCallback, useEffect} from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
} from 'react-native';
import {
    useNavigation,
    useRoute,
    useFocusEffect,
} from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import SCREEN_INFO from '../../../config/SCREEN_CONFIG/screenInfo';
import useFeedbackStore from '../../../stores/feedbackStore';
import dayjs from 'dayjs';

export default function FeedbackScreen() {
    const navigation = useNavigation();
    const route = useRoute();

    const {feedbacks, fetchFeedbacks, isLoading} = useFeedbackStore();

    const fetchData = async () => {
        try {
            await fetchFeedbacks();
        } catch (err) {
            console.error('Lỗi khi fetch:', err);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, []),
    );

    useEffect(() => {
        console.log('FEEDBACKS_RECEIVED:', feedbacks);
    }, [feedbacks]);

    const renderItem = ({item}) => (
        <View style={styles.itemContainer}>
            <View style={styles.row}>
                <Image
                    source={{
                        uri:
                            item.avatar ||
                            'https://www.shutterstock.com/image-vector/user-icon-flat-style-person-260nw-1212192763.jpg',
                    }}
                    style={styles.avatar}
                />
                <View style={styles.nameContainer}>
                    <Text style={styles.name}>
                        {item.fullName || 'Không rõ tên'}
                    </Text>
                    <Text style={styles.role}>{item.departmentName}</Text>
                </View>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.feedback}>{item.content}</Text>
            <Text style={styles.time}>
                {dayjs(item.createdAt).format('HH:mm DD/MM/YYYY')}
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={feedbacks}
                renderItem={renderItem}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.list}
                refreshing={isLoading}
                onRefresh={fetchData}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            {isLoading ? 'Đang tải...' : 'Chưa có góp ý nào'}
                        </Text>
                    </View>
                }
            />

            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate(SCREEN_INFO.FEEDBACK1.key)}>
                <MaterialCommunityIcons
                    name='pencil'
                    size={18}
                    color='#fff'
                    style={styles.icon}
                />
                <Text style={styles.buttonText}>Tạo góp ý</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    list: {
        padding: 16,
        paddingBottom: 100,
    },
    itemContainer: {
        marginBottom: 16,
        backgroundColor: '#f7f7f7',
        padding: 12,
        borderRadius: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 100,
        marginRight: 8,
    },
    nameContainer: {
        flexDirection: 'column',
    },
    name: {
        fontSize: 16,
    },
    role: {
        color: '#3182CE',
        fontSize: 14,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 8,
        marginBottom: 4,
    },
    feedback: {
        fontSize: 14,
        marginTop: 4,
    },
    time: {
        fontSize: 12,
        color: '#888',
        alignSelf: 'flex-end',
        marginTop: 5,
    },
    button: {
        position: 'absolute',
        bottom: 44,
        right: 24,
        backgroundColor: '#4CAF50',
        paddingVertical: 18,
        paddingHorizontal: 20,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 3,
    },
    icon: {
        marginRight: 8,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 50,
    },
    emptyText: {
        fontSize: 16,
        color: '#888',
    },
});
