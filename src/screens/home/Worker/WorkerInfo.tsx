import {View, Text, StyleSheet, Image} from 'react-native';
import React from 'react';
import moment from 'moment';
import useAuthStore from '@/stores/authStore';

const WorkerInfo = ({route}) => {
    const {itemListWorker, itemWorkerBySearch} = route.params;

    const {userInfo} = useAuthStore();

    const item = itemListWorker ?? itemWorkerBySearch;

    const formatPhoneNumber = (phoneNumber: string) => {
        const cleaned = phoneNumber.startsWith('0')
            ? phoneNumber.slice(1)
            : phoneNumber;

        // Cắt thành từng phần: 3-3-3
        const part1 = cleaned.slice(0, 3);
        const part2 = cleaned.slice(3, 6);
        const part3 = cleaned.slice(6);

        return `(+84) ${part1} ${part2} ${part3}`;
    };

    return (
        <View style={WorkerInfoStyles.container}>
            <View style={WorkerInfoStyles.workerNameSection}>
                <View style={WorkerInfoStyles.workerAvatar}>
                    <Image
                        source={{
                            uri: item.avatar,
                        }}
                        style={WorkerInfoStyles.avatar}
                    />
                </View>

                <View style={WorkerInfoStyles.warpWorkerNameAndRole}>
                    <Text style={WorkerInfoStyles.workerName}>
                        {item.fullName}
                    </Text>
                    <Text style={WorkerInfoStyles.workerRole}>
                        {userInfo.userType.level === 'DEPARTMENT'
                            ? item.role
                            : item.unit}
                    </Text>
                </View>
            </View>

            <View style={WorkerInfoStyles.workerContactSection}>
                <View style={WorkerInfoStyles.warpLabelAndValue}>
                    <Text style={WorkerInfoStyles.labelText}>Tài khoản</Text>
                    <Text style={WorkerInfoStyles.valueText}>
                        {item.username}
                    </Text>
                </View>

                <View style={WorkerInfoStyles.warpLabelAndValue}>
                    <Text style={WorkerInfoStyles.labelText}>
                        Số điện thoại
                    </Text>
                    <Text style={WorkerInfoStyles.valueText}>
                        {formatPhoneNumber(item.phoneNumber)}
                    </Text>
                </View>

                <View style={WorkerInfoStyles.warpLabelAndValue}>
                    <Text style={WorkerInfoStyles.labelText}>CCCD</Text>
                    <Text style={WorkerInfoStyles.valueText}>
                        {/* {item.ID} */}

                        {'Chỗ này api chưa trả => không tính là bug'}
                    </Text>
                </View>

                <View style={WorkerInfoStyles.warpLabelAndValue}>
                    <Text style={WorkerInfoStyles.labelText}>Năm sinh</Text>
                    <Text style={WorkerInfoStyles.valueText}>
                        {moment(item.dateOfBirth).format('l')}
                    </Text>
                </View>
            </View>

            <View style={WorkerInfoStyles.workerOtherInfoSection}>
                <Text style={WorkerInfoStyles.otherInfoText}>
                    Thông tin khác
                </Text>

                <View style={WorkerInfoStyles.warpLabelAndValue}>
                    <Text style={WorkerInfoStyles.labelText}>Dân tộc</Text>
                    <Text style={WorkerInfoStyles.valueText}>
                        {/* {item.nation} */}
                        {'Chỗ này api chưa trả => không tính là bug'}
                    </Text>
                </View>

                <View style={WorkerInfoStyles.warpLabelAndValue}>
                    <Text style={WorkerInfoStyles.labelText}>
                        Ngày tuyển dụng
                    </Text>
                    <Text style={WorkerInfoStyles.valueText}>
                        {moment(item.recruimentDate).format('l')}
                    </Text>
                </View>

                <View style={WorkerInfoStyles.warpLabelAndValue}>
                    <Text style={WorkerInfoStyles.labelText}>Đối tượng</Text>
                    <Text style={WorkerInfoStyles.valueText}>
                        {/* {item.contract} */}
                        {'Chỗ này api chưa trả => không tính là bug'}
                    </Text>
                </View>

                <View style={WorkerInfoStyles.warpLabelAndValue}>
                    <Text style={WorkerInfoStyles.labelText}>
                        Địa chỉ thường trú
                    </Text>
                    <Text style={WorkerInfoStyles.valueText}>
                        {'Chỗ này api chưa trả => không tính là bug'}
                        {/* {item?.address.resident || ''} */}
                    </Text>
                </View>

                <View style={WorkerInfoStyles.warpLabelAndValue}>
                    <Text style={WorkerInfoStyles.labelText}>
                        Địa chỉ tạm trú
                    </Text>
                    <Text style={WorkerInfoStyles.valueText}>
                        {/* {item?.address.temporary || ''} */}
                        {'Chỗ này api chưa trả => không tính là bug'}
                    </Text>
                </View>
            </View>
        </View>
    );
};

const WorkerInfoStyles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    workerNameSection: {
        width: '100%',
        marginBottom: 35,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    workerAvatar: {
        borderRadius: '50%',
        width: 72,
        height: 72,
        backgroundColor: 'rgba(76, 175, 80, 1)',
    },
    avatar: {
        borderRadius: 150,
        width: 66,
        height: 66,
        margin: 'auto',
    },
    warpWorkerNameAndRole: {
        gap: 8,
        width: '68%',
    },
    workerName: {
        color: 'rgba(76, 175, 80, 1)',
        textTransform: 'uppercase',
        fontWeight: 600,
        fontSize: 16,
    },
    workerRole: {
        color: 'rgba(33, 33, 33, 1)',
        fontSize: 13,
        fontWeight: 500,
    },
    workerContactSection: {
        gap: 15,
        marginBottom: 35,
    },
    warpLabelAndValueText: {
        gap: 8,
        marginBottom: 6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    labelText: {
        fontSize: 14,
        fontWeight: 400,
        color: 'rgba(33, 33, 33, 1)',
        width: '40%',
    },
    valueText: {
        textAlign: 'right',
        fontWeight: 500,
        color: 'rgba(33, 33, 33, 1)',
        width: '60%',
        fontSize: 13,
    },
    workerOtherInfoSection: {
        gap: 20,
    },
    otherInfoText: {
        color: 'rgba(76, 175, 80, 1)',
        fontWeight: 500,
        fontSize: 13,
    },
    warpOtherInfo: {
        marginTop: 12,
        gap: 20,
    },
    warpLabelAndValue: {
        flexDirection: 'row',
    },
});

export default WorkerInfo;
