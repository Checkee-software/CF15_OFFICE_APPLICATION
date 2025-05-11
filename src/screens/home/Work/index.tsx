import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    FlatList,
    TextInput,
    ScrollView,
} from 'react-native';
import images from '../../../assets/images';
import {useAuthStore} from '@/stores/authStore';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {EOrganization} from '@/shared-types/common/Permissions/Permissions';
import {useGardenWorkStore} from '../../../stores/gardenWorkStore';

const WorkScreen = () => {
    const {
        listGardenWork,
        listGardenWorkFilter,
        badgeGardenWorkUnBrowse,
        filterByStatus,
        resetData,
        setBrowsed,
        setBadgeUnBrowse,
    } = useGardenWorkStore();

    const statusList = [
        {label: 'Đang chờ', value: 1},
        {label: 'Đã duyệt', value: 2},
        {label: 'Đã hủy bỏ', value: 3},
    ];

    const [selectedStatus, setSelectedStatus] = useState(1);
    const {userInfo} = useAuthStore();
    const [showComfirmView, setShowComfirmView] = useState([]);
    const [reasonCancel, setReasonCancel] = useState('');

    const selectBrowseType = (value: number) => {
        if (value === 1) {
            //resetData();
            filterByStatus('PENDING');
        } else if (value === 2) {
            filterByStatus('BROWSED');
        } else if (value === 3) {
            filterByStatus('CANCEL');
        }
        setSelectedStatus(value);
    };

    console.log(badgeGardenWorkUnBrowse);

    const renderGardenWork = (itemGardenWork: any, index: number) => (
        <View
            style={[
                styles.gardenCard,
                // eslint-disable-next-line react-native/no-inline-styles
                {
                    borderColor:
                        itemGardenWork.statusBrowse === 'CANCEL'
                            ? '#FF4E45'
                            : '#000000',
                    marginBottom:
                        index + 1 === listGardenWorkFilter.length ? 70 : 15,
                },
            ]}>
            <View style={styles.gardenTitleSection}>
                <Text style={styles.gardenName}>
                    {itemGardenWork.gardenName}
                </Text>
                <Text style={styles.gardenId}>{itemGardenWork.gardenId}</Text>
            </View>

            <View style={styles.gardenContentSection}>
                <View style={styles.warpLabelAndValue}>
                    <Text style={styles.label}>Thực hiện lúc</Text>

                    <Text style={styles.value}>{itemGardenWork.doingAt}</Text>
                </View>

                <View style={styles.warpLabelAndValue}>
                    <Text style={styles.label}>Người thực hiện</Text>
                    <Text style={styles.value}>{itemGardenWork.doingBy}</Text>
                </View>

                <View style={styles.warpLabelAndValue}>
                    <Text style={styles.label}>Công việc</Text>
                    <Text style={styles.workValue}>
                        {itemGardenWork.workName}
                    </Text>
                </View>

                <View style={styles.warpLabelAndValue}>
                    <Text style={styles.label}>Tên vật tư</Text>
                    <Text style={styles.value}>
                        {itemGardenWork.materialName}
                    </Text>
                </View>

                <View style={styles.warpLabelAndValue}>
                    <Text style={styles.label}>Định mức</Text>
                    <Text style={styles.value}>
                        {itemGardenWork.processesValue}
                    </Text>
                </View>
            </View>

            {itemGardenWork.statusBrowse === 'PENDING' ? (
                <View style={styles.comfirmView}>
                    {showComfirmView.map((itemComfirm: any) =>
                        itemComfirm.gardenId === itemGardenWork.gardenId ? (
                            <React.Fragment key={itemComfirm.gardenId}>
                                <View style={styles.listRadioButton}>
                                    <TouchableOpacity
                                        style={styles.warpRadioText}
                                        onPress={() =>
                                            selectRadioType(
                                                itemComfirm.gardenId,
                                                1,
                                            )
                                        }>
                                        <MaterialIcons
                                            name={
                                                itemComfirm.radioSelectedType ===
                                                1
                                                    ? 'radio-button-checked'
                                                    : 'radio-button-off'
                                            }
                                            color={
                                                itemComfirm.radioSelectedType ===
                                                1
                                                    ? '#2196F3'
                                                    : '#49454f'
                                            }
                                            size={20}
                                        />
                                        <Text style={styles.radioBtnText}>
                                            Không
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.warpRadioText}
                                        onPress={() =>
                                            selectRadioType(
                                                itemComfirm.gardenId,
                                                2,
                                            )
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
                                            Duyệt
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.warpRadioText}
                                        onPress={() =>
                                            selectRadioType(
                                                itemComfirm.gardenId,
                                                3,
                                            )
                                        }>
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
                                            Hủy bỏ
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {itemComfirm.radioSelectedType === 2 ||
                                itemComfirm.radioSelectedType === 3 ? (
                                    <View style={styles.comfirmContent}>
                                        <Text style={styles.comfirmText}>
                                            {itemComfirm.radioSelectedType === 2
                                                ? 'Bạn chắc chắn muốn duyệt công việc này?'
                                                : 'Bạn chắc chắn muốn huỷ bỏ công việc này?'}
                                        </Text>

                                        {itemComfirm.radioSelectedType === 3 ? (
                                            <TextInput
                                                style={
                                                    styles.cancelProgressInput
                                                }
                                                placeholder='Nhập lý do huỷ...'
                                                placeholderTextColor={'#808080'}
                                                multiline
                                                numberOfLines={5}
                                                onChangeText={setReasonCancel}
                                            />
                                        ) : null}

                                        <View style={styles.listComfirmButton}>
                                            <TouchableOpacity
                                                onPress={() =>
                                                    selectRadioType(
                                                        itemComfirm.gardenId,
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
                                                onPress={() =>
                                                    comfirmBrowse(
                                                        itemComfirm.gardenId,
                                                        itemComfirm.radioSelectedType,
                                                    )
                                                }>
                                                <Text
                                                    style={
                                                        styles.approveRequestText
                                                    }>
                                                    Duyệt yêu cầu
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ) : null}
                            </React.Fragment>
                        ) : null,
                    )}
                </View>
            ) : (
                <View style={styles.statusBrowse}>
                    <View style={styles.browseInfo}>
                        {itemGardenWork.statusBrowse === 'BROWSED' ? (
                            <View style={styles.warpLabelAndValue}>
                                <Text style={styles.label}>Duyệt lúc</Text>

                                <Text style={styles.value}>
                                    {itemGardenWork.doingAt}
                                </Text>
                            </View>
                        ) : (
                            <>
                                <View style={styles.warpLabelAndValue}>
                                    <Text style={styles.label}>Hủy bỏ lúc</Text>

                                    <Text style={styles.value}>
                                        {itemGardenWork.dateBrowse}
                                    </Text>
                                </View>

                                <View style={styles.warpLabelAndValue}>
                                    <Text style={styles.label}>Lý do hủy</Text>

                                    <Text style={styles.reasonValue}>
                                        {itemGardenWork.reason}
                                    </Text>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            )}
        </View>
    );

    const selectRadioType = (gardenId: string, radioType: number) => {
        setShowComfirmView(prev =>
            prev.map(item =>
                item.gardenId === gardenId
                    ? {...item, radioSelectedType: radioType}
                    : item,
            ),
        );
    };

    const comfirmBrowse = (gardenId: string, radioType: number) => {
        if (radioType === 2) {
            const d = new Date();
            const dateFormat = d.toLocaleDateString();
            //setBrowsed(gardenId, dateFormat);

            const newData = listGardenWork.map(item =>
                item.gardenId === gardenId
                    ? {...item, statusBrowse: 'BROWSED', dateBrowse: dateFormat}
                    : item,
            );

            setBrowsed(newData);
            filterByStatus('PENDING');
        } else {
            const d = new Date();
            const dateFormat = d.toLocaleDateString();
            //setBrowsed(gardenId, dateFormat);

            const newData = listGardenWork.map(item =>
                item.gardenId === gardenId
                    ? {
                          ...item,
                          statusBrowse: 'CANCEL',
                          dateBrowse: dateFormat,
                          reason: reasonCancel,
                      }
                    : item,
            );

            setBrowsed(newData);
            filterByStatus('PENDING');
        }
    };

    useEffect(() => {
        filterByStatus('PENDING');
        setBadgeUnBrowse();

        const initialRadioState = listGardenWorkFilter.map(item => ({
            gardenId: item.gardenId,
            radioSelectedType: 1,
        }));

        setShowComfirmView(initialRadioState);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.workScheduleTypeHorizontalScroll}>
                <FlatList
                    data={statusList}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => item.label}
                    renderItem={({item}) => (
                        <TouchableOpacity
                            onPress={() => selectBrowseType(item.value)}
                            style={[
                                styles.statusBtn,
                                selectedStatus === item.value &&
                                    styles.selectedStatusBtn,
                            ]}>
                            <View style={styles.warpTextAndBadge}>
                                <Text
                                    style={[
                                        styles.statusBtnText,
                                        selectedStatus === item.value &&
                                            styles.selectedStatusBtnText,
                                    ]}>
                                    {item.label}
                                </Text>

                                {item.value === 1 &&
                                badgeGardenWorkUnBrowse !== 0 ? (
                                    <View style={styles.newBrowseWork}>
                                        <Text style={styles.newBrowseWorkText}>
                                            {badgeGardenWorkUnBrowse}
                                        </Text>
                                    </View>
                                ) : null}
                            </View>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {userInfo.userType.level !== EOrganization.WORKER ? (
                <View style={styles.gardenWorkList}>
                    <FlatList
                        data={listGardenWorkFilter}
                        keyExtractor={item => item.gardenId}
                        renderItem={({item, index}) =>
                            renderGardenWork(item, index)
                        }
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps='handled'
                    />
                </View>
            ) : (
                <View style={styles.emptyContainer}>
                    <Image
                        source={images.emptyWorkList}
                        style={styles.emptyImage}
                        resizeMode='contain'
                    />
                    <Text style={styles.emptyText}>
                        Hiện tại không có công việc để thực hiện!
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    gardenWorkList: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        gap: 12,
        //marginBottom: 60,
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
        flexDirection: 'row',
        justifyContent: 'space-between',
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
        paddingHorizontal: 20,
        gap: 10,
    },
    emptyImage: {
        height: 159,
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
        marginLeft: 5,
        width: 18,
        height: 18,
    },
    newBrowseWorkText: {
        fontWeight: 500,
        fontSize: 12,
        color: '#FFFFFF',
        textAlign: 'center',
    },
});

export default WorkScreen;
