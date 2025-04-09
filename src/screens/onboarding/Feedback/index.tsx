import React, {useState, useCallback} from 'react';
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

export default function FeedbackScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const [feedbackList, setFeedbackList] = useState<any[]>([]);
    const [error, setError] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            setError(false);
            setRefreshing(true);
            const simulateError = false;
            if (simulateError) {
                throw new Error('Lỗi giả lập');
            }

            await new Promise(resolve => setTimeout(resolve, 1000));

            if (route.params?.newFeedback) {
                setFeedbackList(prev => [route.params.newFeedback, ...prev]);
                navigation.setParams({newFeedback: undefined});
            }
        } catch (err) {
            console.error(err);
            setError(true);
        } finally {
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [route.params?.newFeedback]),
    );

    const handleRefresh = () => {
        fetchData();
    };

    const renderItem = ({item}: any) => (
        <View style={styles.itemContainer}>
            <View style={styles.row}>
                <Image source={{uri: item.avatar}} style={styles.avatar} />
                <View style={styles.nameContainer}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.role}>{item.role}</Text>
                </View>
            </View>
            <Text style={styles.feedback}>{item.content}</Text>
            <Text style={styles.time}>{item.time}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={error ? [] : feedbackList}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            {error ? 'Có lỗi xảy ra' : 'Chưa có góp ý nào'}
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
    feedback: {
        fontSize: 14,
        marginTop: 4,
        marginLeft: 0,
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
