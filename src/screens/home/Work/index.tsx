import React, {useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    FlatList,
    TextInput,
} from 'react-native';
import images from '../../../assets/images';
import useAuthStore from '@/stores/authStore';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {EOrganization} from '@/shared-types/common/Permissions/Permissions';

const WorkScreen = () => {
    const {userInfo} = useAuthStore();
    const [radioSelectedType, setRadioSelectedType] = useState(1);
    const [showListRadioButton, setShowListRadioButton] = useState([]);

    const fakeDataGardenWork = [
        {
            gardenName: 'Khu vườn CF-A4',
            gardenId: '009831234578232',
            doingAt: '15:00 19/04/2025',
            doingBy: 'Lê Thị Hoài An',
            workName: 'Bón phân',
            materialName: 'Phân kali',
            processesValue: '1.5/lít',
        },
        {
            gardenName: 'Khu vườn CF-A5',
            gardenId: '009831234578233',
            doingAt: '15:00 24/05/2025',
            doingBy: 'Lê Văn B',
            workName: 'Đào hố',
            materialName: 'Xẻng và cát',
            processesValue: '3.5/lít',
        },
    ];

    const renderGardenWork = (itemGardenWork: any) => (
        <View style={styles.gardenCard}>
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
                    <Text style={styles.label}>Công Việc</Text>
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

            <View style={styles.comfirmView}>
                <View style={styles.listRadioButton}>
                    <TouchableOpacity
                        style={styles.warpRadioText}
                        onPress={() => setRadioSelectedType(1)}>
                        <MaterialIcons
                            name={
                                radioSelectedType === 1
                                    ? 'radio-button-checked'
                                    : 'radio-button-off'
                            }
                            color={
                                radioSelectedType === 1 ? '#2196F3' : '#49454f'
                            }
                            size={20}
                        />
                        <Text style={styles.radioBtnText}>Không</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.warpRadioText}
                        onPress={() => setRadioSelectedType(2)}>
                        <MaterialIcons
                            name={
                                radioSelectedType === 2
                                    ? 'radio-button-checked'
                                    : 'radio-button-off'
                            }
                            color={
                                radioSelectedType === 2 ? '#2196F3' : '#49454f'
                            }
                            size={20}
                        />
                        <Text style={styles.radioBtnText}>Duyệt</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.warpRadioText}
                        onPress={() => setRadioSelectedType(3)}>
                        <MaterialIcons
                            name={
                                radioSelectedType === 3
                                    ? 'radio-button-checked'
                                    : 'radio-button-off'
                            }
                            color={
                                radioSelectedType === 2 ? '#2196F3' : '#49454f'
                            }
                            size={20}
                        />
                        <Text style={styles.radioBtnText}>Hủy bỏ</Text>
                    </TouchableOpacity>
                </View>

                {radioSelectedType === 1 ? null : radioSelectedType === 2 ? (
                    <View style={styles.comfirmContent}>
                        <Text style={styles.comfirmText}>
                            Bạn chắc chắn muốn duyệt công việc này?
                        </Text>
                        <TouchableOpacity style={styles.approveRequestBtn}>
                            <Text style={styles.approveRequestText}>
                                Duyệt yêu cầu
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.comfirmContent}>
                        <Text style={styles.comfirmText}>
                            Bạn chắc chắn muốn huỷ bỏ công việc này?
                        </Text>
                        <TextInput
                            style={styles.cancelProgressInput}
                            placeholder='Nhập lý do huỷ...'
                            placeholderTextColor={'#808080'}
                            multiline
                            numberOfLines={5}
                        />
                        <TouchableOpacity style={styles.cancelWorkBtn}>
                            <Text style={styles.cancelWorkBtnText}>Hủy bỏ</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {userInfo.userType.level === EOrganization.LEADER ? (
                <View style={styles.gardenWorkList}>
                    <FlatList
                        data={fakeDataGardenWork}
                        keyExtractor={item => item.gardenId}
                        renderItem={({item}) => renderGardenWork(item)}
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
        gap: 12,
    },
    gardenCard: {
        marginBottom: 15,
        borderStyle: 'dashed',
        borderColor: '#000000',
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
        padding: 15,
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
        fontWeight: 400,
        fontSize: 13,
    },
    approveRequestBtn: {
        backgroundColor: '#4CAF50',
        padding: 12,
        borderRadius: 4,
        width: '100%',
    },
    approveRequestText: {
        fontWeight: 500,
        fontSize: 16,
        color: '#F5F5F5',
        textAlign: 'center',
    },
    cancelWorkBtn: {
        backgroundColor: '#FF4E45',
        padding: 12,
        borderRadius: 4,
        width: '100%',
    },
    cancelWorkBtnText: {
        fontWeight: 500,
        fontSize: 16,
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
        color: '#808080',
        textAlignVertical: 'top',
        borderColor: '#FF4E45',
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: '#FF4E4526',
        paddingHorizontal: 15,
        width: '100%',
        minHeight: 90,
        marginVertical: 5,
    },
});

export default WorkScreen;
