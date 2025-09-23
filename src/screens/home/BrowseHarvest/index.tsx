/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    TextInput,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {IGardenHarvest, useGardenWorkStore} from '@/stores/gardenWorkStore';
import Loading from '@/screens/subscreen/Loading';
import {
    EStatusData,
    STATUS_DATA,
} from '@/shared-types/Response/HarvestHistoryResponse/HarvestHistoryResponse';
import {KeyboardAwareFlatList} from 'react-native-keyboard-aware-scroll-view';
import images from '@/assets/images';
import moment from 'moment';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import HarvestHistoryResponse from '@/shared-types/Response/HarvestHistoryResponse';
import Snackbar from 'react-native-snackbar';

const BrowseHarvest = () => {
    interface listRadioBtn {
        _id: string;
        radioSelectedType: number;
    }

    type initialRadioState = listRadioBtn[];

    const {
        listHarvestsBrowse,
        badgeHarvestsUnBrowse,
        getRequestBrowseHarvest,
        createBrowseHarvest,
    } = useGardenWorkStore();

    const [isLoading, setIsLoading] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('NONE');
    const [showComfirmView, setShowComfirmView] = useState<initialRadioState>(
        [],
    );

    const inputRefs = useRef<{[key: string]: TextInput | null}>({});

    const listHarvestsBrowseFilter: IGardenHarvest[] =
        listHarvestsBrowse.filter(
            (item: IGardenHarvest) => item.status === selectedStatus,
        );

    const selectRadioType = (_id: string, radioType: number) => {
        setShowComfirmView(prev =>
            prev.map(item =>
                item._id === _id
                    ? {...item, radioSelectedType: radioType}
                    : item,
            ),
        );
    };

    const onChangeReasonCancel = (requestId: string, reason: string) => {
        setShowComfirmView(prevItems =>
            prevItems.map(item =>
                item._id === requestId ? {...item, message: reason} : item,
            ),
        );
    };

    const getBrowseHarvest = async () => {
        setIsLoading(true);
        const responseData = await getRequestBrowseHarvest();
        const initialRadioState = responseData
            .filter(
                (item: {status: EStatusData}) =>
                    item.status === EStatusData.NONE,
            )
            .map(
                (item: {
                    _id: string;
                    gardenId: string;
                    gardenSquare: any;
                    area: any;
                    processingRate: any;
                    message: string;
                }) => ({
                    _id: item._id,
                    gardenId: item.gardenId,
                    radioSelectedType: 1,
                    completeRequest:
                        item.gardenSquare === item.area + item.processingRate
                            ? true
                            : false,
                    message: item.message || '',
                }),
            );

        setShowComfirmView(initialRadioState);
        setIsLoading(false);
    };

    const comfirmBrowse = async (itemRadioState: any) => {
        if (itemRadioState.radioSelectedType === 2) {
            const formRateReport: any = {
                status: HarvestHistoryResponse.EStatusData.VERIFIED,
                gardenId: itemRadioState.gardenId,
                message: '',
            };

            setIsLoading(true);

            const result = await createBrowseHarvest(
                itemRadioState._id,
                formRateReport,
            );

            if (result) {
                getBrowseHarvest();
            } else {
                setIsLoading(false);
            }
        } else if (itemRadioState.radioSelectedType === 3) {
            if (itemRadioState.message === '') {
                Snackbar.show({
                    text: 'Bạn chưa nhập lý do từ chối',
                    duration: Snackbar.LENGTH_LONG,
                });
            } else {
                const formRateReport: any = {
                    status: HarvestHistoryResponse.EStatusData.DENIED,
                    gardenId: itemRadioState.gardenId,
                    message: itemRadioState.message,
                };

                setIsLoading(true);
                const result = await createBrowseHarvest(
                    itemRadioState._id,
                    formRateReport,
                );

                if (result) {
                    getBrowseHarvest();
                } else {
                    setIsLoading(false);
                }
            }
        }
    };

    const renderGardenWork = (
        itemGardenWork: IGardenHarvest,
        index: number,
    ) => (
        <View
            style={[
                styles.gardenCard,
                {
                    borderColor:
                        itemGardenWork.status === EStatusData.DENIED
                            ? '#FF4E45'
                            : '#000000',
                    marginBottom:
                        index + 1 === listHarvestsBrowseFilter.length &&
                        selectedStatus === 'NONE'
                            ? 220
                            : 0,
                },
            ]}>
            <View style={styles.gardenTitleSection}>
                <Text style={styles.gardenName}>
                    {itemGardenWork.gardenName}
                </Text>

                <Text style={styles.gardenId}>{itemGardenWork.gardenCode}</Text>
            </View>

            <View style={styles.gardenContentSection}>
                <View style={styles.warpLabelAndValue}>
                    <Text style={styles.label}>Thực hiện lúc</Text>

                    <Text style={styles.value}>
                        {moment(itemGardenWork.createdAt).format(
                            'HH:mm DD/MM/YYYY',
                        )}
                    </Text>
                </View>

                <View style={styles.warpLabelAndValue}>
                    <Text style={styles.label}>Người thực hiện</Text>
                    <Text style={styles.value}>
                        {itemGardenWork.ownerName || ''}
                    </Text>
                </View>

                <View style={styles.warpLabelAndValue}>
                    <Text style={styles.label}>Cây trồng</Text>
                    <Text style={styles.workValue}>
                        {itemGardenWork.productTypeName || ''}
                    </Text>
                </View>

                <View style={styles.warpLabelAndValue}>
                    <Text style={styles.label}>Khu vườn</Text>
                    <Text style={styles.workValue}>
                        {itemGardenWork.productName || ''}
                    </Text>
                </View>

                <View style={styles.warpLabelAndValue}>
                    <Text style={styles.label}>Sản lượng thu hoạch</Text>
                    <Text style={styles.value}>
                        {Number.isInteger(itemGardenWork.amount)
                            ? itemGardenWork.amount
                            : itemGardenWork.amount.toFixed(2) || ''}{' '}
                        (KG)
                    </Text>
                </View>
            </View>

            {itemGardenWork.status === EStatusData.NONE ? (
                <View style={styles.comfirmView}>
                    {showComfirmView.map((itemComfirm: any) =>
                        itemComfirm._id === itemGardenWork._id ? (
                            <React.Fragment key={itemComfirm._id}>
                                <View style={styles.listRadioButton}>
                                    {/* Phê duyệt */}
                                    <TouchableOpacity
                                        style={styles.warpRadioText}
                                        onPress={() =>
                                            selectRadioType(itemComfirm._id, 2)
                                        }>
                                        <MaterialIcons
                                            name={
                                                itemComfirm.radioSelectedType ===
                                                2
                                                    ? 'radio-button-checked'
                                                    : 'radio-button-off'
                                            }
                                            color={
                                                itemComfirm.radioSelectedType ===
                                                2
                                                    ? '#2196F3'
                                                    : '#49454f'
                                            }
                                            size={20}
                                        />
                                        <Text style={styles.radioBtnText}>
                                            Phê duyệt
                                        </Text>
                                    </TouchableOpacity>

                                    {/* Từ chối */}
                                    <TouchableOpacity
                                        style={styles.warpRadioText}
                                        onPress={() => {
                                            Object.values(
                                                inputRefs.current,
                                            ).forEach(input => input?.blur());

                                            selectRadioType(itemComfirm._id, 3);

                                            setTimeout(() => {
                                                inputRefs.current[
                                                    itemComfirm._id
                                                ]?.focus();
                                            }, 150);
                                        }}>
                                        <MaterialIcons
                                            name={
                                                itemComfirm.radioSelectedType ===
                                                3
                                                    ? 'radio-button-checked'
                                                    : 'radio-button-off'
                                            }
                                            color={
                                                itemComfirm.radioSelectedType ===
                                                3
                                                    ? '#2196F3'
                                                    : '#49454f'
                                            }
                                            size={20}
                                        />
                                        <Text style={styles.radioBtnText}>
                                            Từ chối
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Input lý do từ chối */}
                                {(itemComfirm.radioSelectedType === 2 ||
                                    itemComfirm.radioSelectedType === 3) && (
                                    <View style={styles.comfirmContent}>
                                        <Text style={styles.comfirmText}>
                                            {itemComfirm.radioSelectedType === 2
                                                ? 'Bạn chắc chắn muốn duyệt thu hoạch này?'
                                                : 'Bạn chắc chắn muốn từ chối thu hoạch này?'}
                                        </Text>

                                        {itemComfirm.radioSelectedType ===
                                            3 && (
                                            <TextInput
                                                ref={ref => {
                                                    inputRefs.current[
                                                        itemComfirm._id
                                                    ] = ref;
                                                }}
                                                style={
                                                    styles.cancelProgressInput
                                                }
                                                placeholder='Nhập lý do từ chối...'
                                                placeholderTextColor={'#808080'}
                                                multiline
                                                numberOfLines={5}
                                                value={itemComfirm.message}
                                                onChangeText={value =>
                                                    onChangeReasonCancel(
                                                        itemComfirm._id,
                                                        value,
                                                    )
                                                }
                                            />
                                        )}

                                        <View style={styles.listComfirmButton}>
                                            <TouchableOpacity
                                                onPress={() =>
                                                    selectRadioType(
                                                        itemComfirm._id,
                                                        1,
                                                    )
                                                }
                                                style={styles.cancelWorkBtn}>
                                                <Text
                                                    style={
                                                        styles.cancelWorkBtnText
                                                    }>
                                                    Hủy bỏ
                                                </Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={styles.approveRequestBtn}
                                                onPress={() => {
                                                    // 1. Blur tất cả input cũ
                                                    Object.values(
                                                        inputRefs.current,
                                                    ).forEach(input =>
                                                        input?.blur(),
                                                    );

                                                    // 2. Focus vào input của item hiện tại

                                                    inputRefs.current[
                                                        itemComfirm._id
                                                    ]?.focus();

                                                    comfirmBrowse(itemComfirm);
                                                }}>
                                                <Text
                                                    style={
                                                        styles.approveRequestText
                                                    }>
                                                    {itemComfirm.radioSelectedType ===
                                                    3
                                                        ? 'Từ chối'
                                                        : 'Duyệt'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                            </React.Fragment>
                        ) : null,
                    )}
                </View>
            ) : null}
        </View>
    );

    useEffect(() => {
        getBrowseHarvest();
    }, []);

    if (isLoading) {
        return <Loading />;
    }

    return (
        <View style={styles.container}>
            <View style={styles.workScheduleTypeHorizontalScroll}>
                <FlatList
                    data={STATUS_DATA}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => item._id}
                    renderItem={({item}) => (
                        <TouchableOpacity
                            onPress={() => setSelectedStatus(item.code)}
                            style={[
                                styles.statusBtn,
                                selectedStatus === item.code &&
                                    styles.selectedStatusBtn,
                            ]}>
                            <View style={styles.warpTextAndBadge}>
                                <Text
                                    style={[
                                        styles.statusBtnText,
                                        selectedStatus === item.code &&
                                            styles.selectedStatusBtnText,
                                    ]}>
                                    {item.name === 'Tất cả'
                                        ? 'Đang chờ'
                                        : item.name}
                                </Text>

                                {item._id === '00001' &&
                                badgeHarvestsUnBrowse !== 0 ? (
                                    <View style={styles.newBrowseWork}>
                                        <Text style={styles.newBrowseWorkText}>
                                            {badgeHarvestsUnBrowse > 9
                                                ? '9+'
                                                : badgeHarvestsUnBrowse}
                                        </Text>
                                    </View>
                                ) : null}
                            </View>
                        </TouchableOpacity>
                    )}
                />
            </View>

            <View style={styles.gardenWorkList}>
                <KeyboardAwareFlatList
                    contentContainerStyle={styles.flatListGardenWork}
                    data={listHarvestsBrowseFilter}
                    keyExtractor={item => item._id}
                    renderItem={({item, index}) =>
                        renderGardenWork(item, index)
                    }
                    onRefresh={getBrowseHarvest}
                    refreshing={isLoading}
                    showsVerticalScrollIndicator={false}
                    removeClippedSubviews={false}
                    enableOnAndroid={true}
                    extraHeight={250}
                    keyboardShouldPersistTaps='handled'
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            {selectedStatus === 'NONE' ? (
                                <>
                                    <Image
                                        source={images.emptyWorkList}
                                        style={styles.emptyImage}
                                        resizeMode='contain'
                                    />
                                    <Text style={styles.emptyText}>
                                        Hiện tại không có yêu cầu thu hoạch để
                                        duyệt!
                                    </Text>
                                </>
                            ) : (
                                <Text style={styles.emptyText}>
                                    Danh sách trống!
                                </Text>
                            )}
                        </View>
                    }
                />
            </View>
        </View>
    );
};

export default BrowseHarvest;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    gardenWorkList: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    flatListGardenWork: {
        flexGrow: 1,
        gap: 12,
    },
    gardenCard: {
        marginBottom: 15,
        borderStyle: 'dashed',
        borderWidth: 1,
        gap: 16,
        padding: 12,
    },
    gardenTitleSection: {
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    gardenContentSection: {
        gap: 10,
    },
    gardenName: {
        fontSize: 16,
        fontWeight: 600,
        lineHeight: 24,
    },
    gardenId: {
        fontSize: 14,
        fontWeight: 500,
        color: '#4CAF50',
        lineHeight: 24,
    },
    warpLabelAndValue: {
        flexDirection: 'row',
    },
    warpComfirmedView: {
        flexDirection: 'column',
        gap: 4,
    },
    warpValueComfirmed: {
        flexDirection: 'row',
    },
    label: {
        width: '50%',
        color: '#212121',
        fontWeight: 500,
        fontSize: 14,
    },
    value: {
        width: '50%',
        color: '#212121',
        fontWeight: 500,
        fontSize: 14,
        textAlign: 'right',
    },
    valueRemaining: {
        marginTop: 4,
        fontWeight: 400,
        fontStyle: 'italic',
        color: 'rgba(128, 128, 128, 1)',
    },
    reasonValue: {
        width: '50%',
        color: '#FF4E45',
        fontWeight: 400,
        fontSize: 14,
        textAlign: 'right',
        fontStyle: 'italic',
    },
    workValue: {
        width: '50%',
        fontWeight: 600,
        fontSize: 14,
        textAlign: 'right',
        color: '#FF9800',
    },
    comfirmView: {
        gap: 10,
    },
    listRadioButton: {
        borderTopWidth: 1,
        borderTopColor: '#D3D3D3',
        paddingTop: 20,
        paddingHorizontal: 10,
        marginBottom: 10,
        gap: 25,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    warpRadioText: {
        flexDirection: 'row',
        gap: 5,
        alignItems: 'center',
    },
    radioBtnText: {
        fontWeight: 500,
        fontSize: 14,
    },
    comfirmContent: {
        gap: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    comfirmText: {
        textAlign: 'center',
        fontWeight: 400,
        fontSize: 13,
        marginBottom: 6,
    },
    approveRequestBtn: {
        backgroundColor: '#2196F3',
        padding: 12,
        borderRadius: 4,
        width: '48%',
    },
    completeRequestBtn: {
        backgroundColor: '#4CAF50',
        padding: 12,
        borderRadius: 4,
        width: '48%',
    },
    approveRequestText: {
        fontWeight: 500,
        fontSize: 15,
        color: '#F5F5F5',
        textAlign: 'center',
    },
    cancelWorkBtn: {
        backgroundColor: '#FF4E45',
        padding: 12,
        borderRadius: 4,
        width: '48%',
    },
    cancelWorkBtnText: {
        fontWeight: 500,
        fontSize: 15,
        color: '#F5F5F5',
        textAlign: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyImage: {
        height: 180,
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 14,
        color: '#808080',
    },
    cancelProgressInput: {
        fontSize: 13,
        color: '#000',
        textAlignVertical: 'top',
        borderColor: '#FF4E45',
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: '#FF4E4526',
        paddingHorizontal: 15,
        width: '100%',
        minHeight: 80,
        marginBottom: 5,
    },
    listComfirmButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    statusBrowse: {
        borderTopWidth: 1,
        borderColor: '#D3D3D3',
    },
    browseInfo: {
        marginTop: 10,
        gap: 4,
    },
    workScheduleTypeHorizontalScroll: {
        borderBottomColor: '#cac4d0',
        borderBottomWidth: 1,
        width: '100%',
        alignItems: 'center',
    },
    statusBtn: {
        width: 110,
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedStatusBtn: {
        borderBottomColor: '#4CAF50',
        borderBottomWidth: 2,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    statusBtnText: {
        fontWeight: 500,
        color: '#212121',
        fontSize: 14,
    },
    selectedStatusBtnText: {
        color: '#4CAF50',
        fontWeight: 500,
    },
    warpTextAndBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    newBrowseWork: {
        borderRadius: '50%',
        backgroundColor: '#B3261E',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 5,
        width: 20,
        height: 20,
    },
    newBrowseWorkText: {
        fontWeight: 500,
        fontSize: 11,
        color: '#FFFFFF',
        textAlign: 'center',
    },
    loadingView: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
});
