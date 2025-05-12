import {useEffect} from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import {useRoute, RouteProp} from '@react-navigation/native';
import useGardenStore from '../../../stores/gardenStore';

const STATUS_COLORS = {
    VERIFIED: '#4CAF50',  // Đã duyệt
    NONE: '#FFA500',      // Chờ xét duyệt
    DENIED: '#F44336',    // Đã huỷ
};

type RootStackParamList = {
    GardenHistory: {gardenId: string};
};

type RouteParams = RouteProp<RootStackParamList, 'GardenHistory'>;

const GardenHistory = () => {
    const route = useRoute<RouteParams>();
    const {fetchHarvestHistory, harvestHistory, isLoading} = useGardenStore();
    const {gardenId} = route.params;

    useEffect(() => {
        if (gardenId) {
            fetchHarvestHistory(gardenId);
        }
    }, [gardenId, fetchHarvestHistory]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle='dark-content' backgroundColor='#FFFFFF' />

            <ScrollView
                style={styles.container}
                showsVerticalScrollIndicator={false}>
                {isLoading ? (
                    <Text>Loading...</Text>
                ) : (
                    harvestHistory.map((item, index) => (
                        <View key={index} style={styles.card}>
                            <View style={styles.headerRow}>
                                <Text style={styles.typeText}>
                                    Thu hoạch
                                </Text>
                                <Text
                                    style={[
                                        styles.statusText,
                                        {
                                            color: STATUS_COLORS[item.status] || '#000',
                                        },
                                    ]}>
                                    {item.status === 'VERIFIED'
                                        ? 'Đã duyệt'
                                        : item.status === 'DENIED'
                                        ? 'Đã huỷ'
                                        : 'Chờ xét duyệt'}
                                </Text>
                            </View>

                            {item.verifierName && (
                                <View style={styles.row}>
                                    <Text style={styles.label}>Người duyệt</Text>
                                    <Text style={styles.valueBlue}>
                                        {item.verifierName}
                                    </Text>
                                </View>
                            )}

                            {item.status === 'DENIED' && item.verifierName && (
                                <View style={styles.row}>
                                    <Text style={styles.label}>Lí do huỷ</Text>
                                    <Text
                                        style={[styles.valueRed, styles.reasonText]}>
                                        {item.verifierName}
                                    </Text>
                                </View>
                            )}

                            <View style={styles.row}>
                                <Text style={styles.label}>Khối lượng</Text>
                                <Text style={styles.value}>{item.amount}</Text>
                            </View>

                            <View style={styles.row}>
                                <Text style={styles.label}>Thời gian</Text>
                                <Text style={styles.value}>
                                    {new Date(item.createdAt).toLocaleString()}
                                </Text>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
    },
    card: {
        borderWidth: 1.5,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderStyle: 'dashed',
        backgroundColor: '#FFFFFF',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
        alignItems: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        alignItems: 'center',
    },
    typeText: {
        fontWeight: '600',
        fontSize: 16,
        color: '#000000',
    },
    statusText: {
        fontWeight: '500',
        fontSize: 15,
    },
    label: {
        fontSize: 14,
        color: '#666666',
    },
    value: {
        fontWeight: '500',
        fontSize: 14,
        color: '#000000',
        textAlign: 'right',
    },
    valueBlue: {
        fontWeight: '500',
        fontSize: 14,
        color: '#2196F3',
        textAlign: 'right',
    },
    valueRed: {
        fontWeight: '500',
        fontSize: 14,
        color: '#F44336',
        textAlign: 'right',
    },
    reasonText: {
        maxWidth: '60%',
    },
    bottomPadding: {
        height: 20,
    },
});

export default GardenHistory;
