import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation, useRoute} from '@react-navigation/native';
import useGardenStore from '../../../../stores/gardenStore';
import {useAuthStore} from '../../../../stores/authStore';
import SCREEN_INFO from '../../../../config/SCREEN_CONFIG/screenInfo';
import Loading from '@/screens/subscreen/Loading';

const HarvestDetail = () => {
    const navigation = useNavigation() as any;
    const route = useRoute<any>();
    const {code} = route.params;
    const {userInfo} = useAuthStore();
    const {gardenDetail, searchGardens, postHarvestReport, isLoading} =
        useGardenStore();

    const [weight, setWeight] = useState('');
    const [confirmMode, setConfirmMode] = useState(false);

    useEffect(() => {
        if (code) {
            searchGardens(code, userInfo._id);
        }
    }, [code]);
    const handleGoToHistory = () => {
        if (gardenDetail?._id) {
            navigation.navigate(SCREEN_INFO.HARVEST_HISTORY.key, {
                gardenId: gardenDetail._id,
            });
        }
    };
    const handleExit = () => navigation.goBack();
    const handleReport = () => {
        setConfirmMode(true);
    };
    const handleConfirm = async () => {
        if (!gardenDetail?._id) return;

        try {
            await postHarvestReport(gardenDetail._id, Number(weight));
            setConfirmMode(false);
            navigation.goBack();
        } catch (error) {
            console.log('Báo cáo thất bại:', error);
        }
    };

    const handleCancel = () => {
        setConfirmMode(false);
    };

    const showReport = weight.trim() !== '';

    if (isLoading) return <Loading />;

    return (
        <SafeAreaView style={styles.safeContainer}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.infoContainer}>
                    <Text style={styles.gardenName}>{gardenDetail?.name}</Text>
                    <Text style={styles.gardenCode}>{gardenDetail?.code}</Text>

                    <View style={styles.productBox}>
                        <Text style={styles.productLabel}>
                            Cây trồng/Khu vườn
                        </Text>
                        <View style={styles.productRow}>
                            <Icon name='group-work' color='green' size={20} />
                            <Text style={styles.productText}>
                                {gardenDetail?.productName}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.headerRow}>
                    <Text style={styles.taskHeader}>Thu hoạch</Text>
                    <TouchableOpacity onPress={handleGoToHistory}>
                        <Text style={styles.linkText}>Lịch sử thu hoạch</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.inputBox}>
                    <Text style={styles.inputLabel}>
                        Khối lượng thu hoạch (Kg)
                    </Text>
                    <TextInput
                        style={styles.input}
                        placeholder='Nhập khối lượng'
                        keyboardType='numeric'
                        value={Number(weight).toLocaleString()}
                        onChangeText={text => {
                            let formatted = text.replace(/[^0-9]/g, '');
                            if (
                                formatted.length > 1 &&
                                formatted.startsWith('0')
                            ) {
                                formatted = formatted.replace(/^0+/, '');
                            }

                            setWeight(formatted);
                        }}
                        // onChangeText={text => {
                        //     let formatted = text.replace(/,/g, '.');
                        //     formatted = formatted.replace(/[^0-9.]/g, '');

                        //     const parts = formatted.split('.');

                        //     if (parts.length > 2) {
                        //         formatted =
                        //             parts[0] + '.' + parts.slice(1).join('');
                        //     }

                        //     if (formatted.startsWith('.')) {
                        //         formatted = '0' + formatted;
                        //     }

                        //     const [intPart, decimalPart] = formatted.split('.');
                        //     if (decimalPart !== undefined) {
                        //         formatted =
                        //             intPart + '.' + decimalPart.slice(0, 2);
                        //     }

                        //     setWeight(formatted);
                        // }}
                        placeholderTextColor='#000'
                    />
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                {confirmMode ? (
                    <>
                        <Text style={styles.confirmText}>
                            Bạn có chắc chắn muốn báo cáo công việc đã thực hiện
                            không?
                        </Text>
                        <View style={styles.footerRow}>
                            <TouchableOpacity
                                style={[styles.cancelButton]}
                                onPress={handleCancel}>
                                <Text style={styles.cancelText}>Hủy bỏ</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.confirmButton]}
                                onPress={handleConfirm}>
                                <Text style={styles.confirmButtonText}>
                                    Xác nhận
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    <View
                        style={[
                            styles.footerRow,
                            !showReport && {justifyContent: 'center'},
                        ]}>
                        <TouchableOpacity
                            style={[
                                styles.exitButton1,
                                showReport ? styles.exitButtonSmall : {flex: 1},
                            ]}
                            onPress={handleExit}>
                            <Icon
                                name='arrow-circle-left'
                                size={22}
                                color='white'
                                style={{marginRight: 10}}
                            />
                            <Text style={styles.exitText1}>Thoát ra</Text>
                        </TouchableOpacity>

                        {showReport && (
                            <TouchableOpacity
                                style={styles.reportButton}
                                onPress={handleReport}>
                                <Text style={styles.reportText}>Báo cáo</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

export default HarvestDetail;

const styles = StyleSheet.create({
    safeContainer: {flex: 1, backgroundColor: '#fff'},
    scrollContent: {padding: 16, paddingBottom: 100},
    infoContainer: {backgroundColor: '#fff', borderRadius: 8, marginBottom: 16},
    gardenName: {fontSize: 16, fontWeight: '600'},
    gardenCode: {color: 'green', fontWeight: '500', marginTop: 2},
    productBox: {
        marginTop: 12,
        backgroundColor: '#4CAF5026',
        padding: 10,
        borderRadius: 6,
    },
    productLabel: {fontSize: 14, fontWeight: '500', marginBottom: 4},
    productRow: {flexDirection: 'row', alignItems: 'center'},
    productText: {fontSize: 14, color: '#333', marginLeft: 4},
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    taskHeader: {fontSize: 14, fontWeight: '500'},
    linkText: {color: '#2196F3', textDecorationLine: 'underline'},
    inputBox: {
        backgroundColor: '#E3F2FD',
        padding: 16,
        borderRadius: 8,
        marginTop: 8,
    },
    inputLabel: {fontSize: 14, fontWeight: '500', marginBottom: 6},
    input: {
        borderWidth: 1,
        borderColor: '#bbb',
        borderRadius: 6,
        padding: 8,
        fontSize: 20,
        backgroundColor: '#E3F2FD',
        textAlign: 'center',
        color: '#000',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 16,
        borderTopWidth: 1,
        borderColor: '#eee',
    },
    footerRow: {flexDirection: 'row', justifyContent: 'space-between'},
    exitButton1: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
        backgroundColor: 'red',
        borderRadius: 26,
    },
    exitButtonSmall: {flex: 0.9, marginRight: 10},
    exitText1: {color: 'white', fontWeight: '600', fontSize: 16},
    reportButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'green',
        borderRadius: 26,
    },
    reportText: {color: 'green', fontWeight: '600', fontSize: 16},
    confirmText: {
        textAlign: 'center',
        marginBottom: 12,
        fontSize: 14,
        fontWeight: '400',
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 26,
        backgroundColor: '#eee',
        marginRight: 10,
    },
    cancelText: {color: '#333', fontWeight: '600', fontSize: 16},
    confirmButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 26,
        backgroundColor: '#4CAF50',
    },
    confirmButtonText: {color: 'white', fontWeight: '600', fontSize: 16},
});
