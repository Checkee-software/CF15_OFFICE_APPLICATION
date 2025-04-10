import React, {useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    Modal,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import SCREEN_INFO from '../../../config/SCREEN_CONFIG/screenInfo';

export default function Profile({navigation}) {
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    //const navigation = useNavigation();
    const [showAccountInfo, setShowAccountInfo] = useState(false);
    return (
        <View style={styles.wrapper}>
            <ScrollView
                contentContainerStyle={{
                    alignItems: 'center',
                    paddingBottom: 50,
                }}>
                <View style={styles.container}>
                    <View style={styles.avatarWrapper}>
                        <Image
                            source={{uri: 'https://i.pravatar.cc/150?img=12'}}
                            style={styles.avatar}
                        />
                    </View>

                    <Text style={styles.name}>NGUYỄN VĂN AN KHANG</Text>
                    <Text style={styles.email}>robertambercf15.com</Text>

                    <View style={styles.card}>
                        <Text style={styles.dateLabel}>Ngày làm việc</Text>
                        <Text style={styles.dateValue}>17/03/2022</Text>

                        <View style={styles.divider} />

                        <Text style={styles.sectionLabel}>Công việc</Text>

                        <View style={styles.jobStats}>
                            {renderStat('Tổng', '57')}
                            {renderStat('Hoàn thành', '50')}
                            {renderStat('Đang làm', '5')}
                            {renderStat('Thất bại', '2')}
                        </View>
                    </View>

                    <View style={styles.buttonGroup}>
                        <View>
                            <TouchableOpacity
                                style={[
                                    styles.option,
                                    showAccountInfo && styles.optionExpanded,
                                ]}
                                onPress={() =>
                                    setShowAccountInfo(!showAccountInfo)
                                }>
                                <Text style={styles.optionText}>
                                    Thông tin tài khoản
                                </Text>
                                <Icon
                                    name={
                                        showAccountInfo
                                            ? 'chevron-down'
                                            : 'chevron-right'
                                    }
                                    size={18}
                                    color='#fff'
                                />
                            </TouchableOpacity>

                            {showAccountInfo && (
                                <View style={styles.accountInfoCard}>
                                    {renderInfoRow('Dân tộc', 'Kinh')}
                                    {renderInfoRow(
                                        'Phòng ban',
                                        'Phòng sản xuất',
                                    )}
                                    {renderInfoRow('Đơn vị', 'Đơn vị 1')}
                                    {renderInfoRow('Ngày sinh', '01/01/1995')}
                                    {renderInfoRow(
                                        'Số điện thoại',
                                        '0900123456',
                                    )}
                                    {renderInfoRow('CCCD', '001100022531')}
                                    {renderInfoRow(
                                        'Loại hợp đồng',
                                        'Hợp đồng lao động',
                                        true,
                                    )}
                                </View>
                            )}
                        </View>

                        {renderOption('Đổi mật khẩu', false, () =>
                            navigation.navigate(
                                SCREEN_INFO.UPDATE_PASSWORD.key,
                            ),
                        )}
                        {renderOption('Quản lý thông báo', false, () =>
                            navigation.navigate(SCREEN_INFO.NOTIFICATION.key),
                        )}
                        {renderOption('Đăng xuất tài khoản', true, () =>
                            setShowLogoutModal(true),
                        )}
                    </View>
                </View>
            </ScrollView>
            <Modal
                animationType='fade'
                transparent={true}
                visible={showLogoutModal}
                onRequestClose={() => setShowLogoutModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Đăng xuất</Text>
                        <Text style={styles.modalMessage}>
                            Xác nhận đăng xuất khỏi ứng dụng?
                        </Text>
                        <View style={styles.divider} />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={() => setShowLogoutModal(false)}>
                                <Text style={styles.cancelButton}>Huỷ bỏ</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={() => {
                                    setShowLogoutModal(false);
                                    // TODO: Handle logout logic here
                                }}>
                                <Text style={styles.confirmButton}>
                                    Xác nhận
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const renderStat = (label: string, value: string) => (
    <View style={styles.statItem}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const renderOption = (
    label: string,
    isLogout = false,
    onPress?: () => void,
) => (
    <TouchableOpacity style={styles.option} onPress={onPress}>
        <Text style={styles.optionText}>{label}</Text>
        <Icon
            name={isLogout ? 'log-out' : 'chevron-right'}
            size={18}
            color='#fff'
        />
    </TouchableOpacity>
);
const renderInfoRow = (
    label: string,
    value: string,
    hasDownloadIcon = false,
) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <View style={styles.infoValueContainer}>
            <Text style={styles.infoValue}>{value}</Text>
            {hasDownloadIcon && (
                <TouchableOpacity
                    onPress={() => console.log('Download tapped')}>
                    <Icon
                        name='download'
                        size={16}
                        color='#fff'
                        style={{marginLeft: 6}}
                    />
                </TouchableOpacity>
            )}
        </View>
    </View>
);

const styles = StyleSheet.create({
    infoValueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '90%',
        justifyContent: 'flex-start',
    },

    optionExpanded: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },

    wrapper: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: 372,
        height: 653,
        backgroundColor: '#4CAF50',
        alignItems: 'center',
        marginTop: 112,
        paddingTop: 56,
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    avatarWrapper: {
        position: 'absolute',
        top: -60,
        zIndex: 2,
        borderWidth: 6,
        borderColor: '#4CAF50',
        borderRadius: 60,
        backgroundColor: '#4CAF50',
        padding: 3,
    },
    avatar: {
        width: 96,
        height: 96,
        borderRadius: 100,
    },
    name: {
        fontWeight: 'bold',
        color: '#fff',
        fontSize: 16,
        marginTop: 10,
    },
    email: {
        color: '#fff',
        fontSize: 13,
        marginBottom: 15,
    },

    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        width: 324,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: {width: 0, height: 1},
        shadowRadius: 4,
    },
    dateLabel: {
        color: '#888',
        fontSize: 13,
    },
    dateValue: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 4,
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: '#ddd',
        marginVertical: 12,
    },
    sectionLabel: {
        fontSize: 13,
        color: '#666',
        marginBottom: 12,
    },
    jobStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#000',
        backgroundColor: '#F1F1F1',
        paddingVertical: 10,
        paddingHorizontal: 0,
        borderRadius: 50,
        width: 40,
        height: 40,
        textAlign: 'center',
        textAlignVertical: 'center',
        marginBottom: 5,
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
    },

    buttonGroup: {
        marginTop: 20,
        width: '100%',
        gap: 15,
    },
    option: {
        backgroundColor: 'rgba(245, 245, 245, 0.15)',
        padding: 12,
        width: 332,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    optionText: {
        fontSize: 16,
        color: 'white',
    },

    accountInfoCard: {
        backgroundColor: 'rgba(245, 245, 245, 0.15)',
        padding: 12,
        width: 332,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
    },

    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },

    infoLabel: {
        color: '#fff',
        fontSize: 14,
        width: '40%',
    },

    infoValue: {
        color: '#fff',
        fontSize: 14,
        width: '60%',
        textAlign: 'left',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 8,
        width: 312,
        height: 197,
        padding: 16,
        alignItems: 'flex-start',
    },
    modalTitle: {
        fontSize: 22,
        marginBottom: 16,
        textAlign: 'left',
    },
    modalMessage: {
        fontSize: 16,
        color: '#555',
        marginBottom: 10,
        textAlign: 'left',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 15,
    },
    modalButton: {
        flex: 1,
        alignItems: 'flex-end',
        paddingVertical: 8,
    },
    cancelButton: {
        fontSize: 16,
        color: '#888',
    },
    confirmButton: {
        fontSize: 16,
        color: '#E53935',
        fontWeight: 'bold',
    },
});
