import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import React from 'react';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';

const ListNotification = () => {
    return (
        <View style={NotificationStyle.container}>
            <ScrollView>
                {/* <View style={NotificationStyle.header}>
                    <TouchableOpacity>
                        <MaterialIcons
                            name='chevron-left'
                            size={30}
                            color='black'
                        />
                    </TouchableOpacity>
                    <Text style={NotificationStyle.headerTitle}>THÔNG BÁO</Text>
                </View> */}

                <View style={NotificationStyle.warpNotifi}>
                    <View style={NotificationStyle.cardNotifi}>
                        <View style={NotificationStyle.headerNotifi}>
                            <View style={NotificationStyle.warpLeftHeader}>
                                <MaterialIcons
                                    name='check-circle-outline'
                                    size={26}
                                    color='green'
                                />
                                <Text style={NotificationStyle.headerLabel}>
                                    Công việc con
                                </Text>
                            </View>
                            <Text style={NotificationStyle.notifiTime}>
                                3 phút trước
                            </Text>
                        </View>
                        <View style={NotificationStyle.notifiContent}>
                            <Text style={NotificationStyle.notifiContentText}>
                                Các thành viên đã hoàn thành công việc của họ.
                                Nhấn để xem.
                            </Text>
                        </View>
                    </View>

                    <View style={NotificationStyle.cardNotifi}>
                        <View style={NotificationStyle.headerNotifi}>
                            <View style={NotificationStyle.warpLeftHeader}>
                                <MaterialIcons
                                    name='check-circle-outline'
                                    size={26}
                                    color='green'
                                />
                                <Text style={NotificationStyle.headerLabel}>
                                    Công việc con
                                </Text>
                            </View>
                            <Text style={NotificationStyle.notifiTime}>
                                3 phút trước
                            </Text>
                        </View>
                        <View style={NotificationStyle.notifiContent}>
                            <Text style={NotificationStyle.notifiContentText}>
                                Các thành viên đã hoàn thành công việc của họ.
                                Nhấn để xem.
                            </Text>
                        </View>
                    </View>

                    <View style={NotificationStyle.cardNotifi}>
                        <View style={NotificationStyle.headerNotifi}>
                            <View style={NotificationStyle.warpLeftHeader}>
                                <MaterialCommunityIcons
                                    name='dots-horizontal-circle'
                                    size={26}
                                    color='rgba(255, 152, 0, 1)'
                                />
                                <Text style={NotificationStyle.headerLabel}>
                                    Công việc con
                                </Text>
                            </View>
                            <Text style={NotificationStyle.notifiTime}>
                                3 phút trước
                            </Text>
                        </View>
                        <View style={NotificationStyle.notifiContent}>
                            <Text style={NotificationStyle.notifiContentText}>
                                Bạn đã thực hiện xong công việc. Vui lòng chờ
                                duyệt.
                            </Text>
                        </View>
                    </View>

                    <View style={NotificationStyle.cardNotifi}>
                        <View style={NotificationStyle.headerNotifi}>
                            <View style={NotificationStyle.warpLeftHeader}>
                                <AntDesign
                                    name='closecircle'
                                    size={22}
                                    color='rgba(255, 78, 69, 1)'
                                />
                                <Text style={NotificationStyle.headerLabel}>
                                    Công việc con
                                </Text>
                            </View>
                            <Text style={NotificationStyle.notifiTime}>
                                3 phút trước
                            </Text>
                        </View>
                        <View style={NotificationStyle.notifiContent}>
                            <Text style={NotificationStyle.notifiContentText}>
                                Ban lãnh đạo đã huỷ bỏ tiến trình công việc của
                                bạn. Nhấn để xem lý do.
                            </Text>
                        </View>
                    </View>

                    <View style={NotificationStyle.cardNotifi}>
                        <View style={NotificationStyle.headerNotifi}>
                            <View style={NotificationStyle.warpLeftHeader}>
                                <MaterialIcons
                                    name='warning'
                                    size={26}
                                    color='rgba(255, 152, 0, 1)'
                                />
                                <Text style={NotificationStyle.headerLabel}>
                                    Công việc
                                </Text>
                            </View>
                            <Text style={NotificationStyle.notifiTime}>
                                3 phút trước
                            </Text>
                        </View>
                        <View style={NotificationStyle.notifiContent}>
                            <Text style={NotificationStyle.notifiContentText}>
                                Ban lãnh đạo không chấp nhận tiến trình công
                                việc của bạn. Nhấn để xem.
                            </Text>
                        </View>
                    </View>

                    <View style={NotificationStyle.cardNotifi}>
                        <View style={NotificationStyle.headerNotifi}>
                            <View style={NotificationStyle.warpLeftHeader}>
                                <MaterialCommunityIcons
                                    name='alert-decagram'
                                    size={26}
                                    color='rgba(33, 150, 243, 1)'
                                />
                                <Text style={NotificationStyle.headerLabel}>
                                    Công việc
                                </Text>
                            </View>
                            <Text style={NotificationStyle.notifiTime}>
                                3 phút trước
                            </Text>
                        </View>
                        <View style={NotificationStyle.notifiContent}>
                            <Text style={NotificationStyle.notifiContentText}>
                                Bạn có công việc mới được giao. Nhấn để xem.
                            </Text>
                        </View>
                    </View>

                    <View style={NotificationStyle.cardNotifi}>
                        <View style={NotificationStyle.headerNotifi}>
                            <View style={NotificationStyle.warpLeftHeader}>
                                <MaterialCommunityIcons
                                    name='check-decagram'
                                    size={26}
                                    color='green'
                                />
                                <Text style={NotificationStyle.headerLabel}>
                                    Công việc
                                </Text>
                            </View>
                            <Text style={NotificationStyle.notifiTime}>
                                3 phút trước
                            </Text>
                        </View>
                        <View style={NotificationStyle.notifiContent}>
                            <Text style={NotificationStyle.notifiContentText}>
                                Công việc đã hoàn thành. Nhấn để xem.
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default ListNotification;

const NotificationStyle = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        //justifyContent: 'space-between',
    },
    headerTitle: {
        fontWeight: 'bold',
        fontSize: 15,
        textAlign: 'center',
        marginHorizontal: 90,
    },
    warpNotifi: {
        marginTop: 12,
        gap: 12,
    },
    cardNotifi: {
        padding: 10,
        boxShadow: '0 1 2 0 rgba(0, 0, 0, 0.25)',
    },
    headerNotifi: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    warpLeftHeader: {
        gap: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerLabel: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    notifiTime: {
        fontSize: 13,
        fontWeight: '200',
        color: 'rgba(128, 128, 128, 1)',
    },
    notifiContent: {
        marginTop: 2,
        marginLeft: 34,
    },
    notifiContentText: {
        fontSize: 13,
    },
});
