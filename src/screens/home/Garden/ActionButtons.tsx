import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ActionButtons = ({
    visible,
    showAlert,
    alertMessage,
    isSaved,
    showReportConfirmation,
    onSaveTemp,
    onReport,
    onExit,
    onCloseAlert,
    onConfirmReport,
    onCancelReport,
}: {
    visible: boolean;
    showAlert?: boolean;
    alertMessage?: string;
    isSaved?: boolean;
    showReportConfirmation?: boolean;
    onSaveTemp: () => void;
    onReport: () => void;
    onExit: () => void;
    onCloseAlert?: () => void;
    onConfirmReport?: () => void;
    onCancelReport?: () => void;
}) => {
    if (!visible) return null;

    return (
        <View style={styles.snackbarContainer}>
            {showAlert && !isSaved && !showReportConfirmation && (
                <View style={styles.alertInSnackbar}>
                    <Icon name='warning' size={20} color='#F59E0B' />
                    <Text style={styles.alertText}>
                        {alertMessage ||
                            'Vui lòng lưu, xoá các công việc hoặc báo cáo các công việc để thoát.'}
                    </Text>
                    {onCloseAlert && (
                        <TouchableOpacity
                            onPress={onCloseAlert}
                            style={styles.closeButton}>
                            <Icon name='close' size={18} color='#92400E' />
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {showReportConfirmation && (
                <View style={styles.confirmationContainer}>
                    <Text style={styles.confirmationText}>
                        Bạn có chắc chắn muốn báo cáo các công việc đã thực hiện
                        không?
                    </Text>
                    <View style={styles.confirmationButtons}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={onCancelReport}>
                            <Text style={styles.cancelButtonText}>Hủy bỏ</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.confirmButton}
                            onPress={onConfirmReport}>
                            <Text style={styles.confirmButtonText}>
                                Xác nhận
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.confirmationDivider} />
                </View>
            )}

            {isSaved && !showReportConfirmation && (
                <View style={styles.successAlert}>
                    <Icon name='check-circle' size={20} color='#22C55E' />
                    <Text style={styles.successText}>Đã lưu công việc!</Text>
                </View>
            )}

            {!showReportConfirmation && (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.snackbarButton, styles.exitActionButton]}
                        onPress={onExit}>
                        <Icon name='arrow-back' size={24} color='#fff' />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.snackbarButton,
                            isSaved
                                ? styles.saveButtonDisabled
                                : styles.saveButton,
                        ]}
                        onPress={onSaveTemp}
                        disabled={isSaved}>
                        <Text
                            style={
                                isSaved
                                    ? styles.disabledButtonText
                                    : styles.snackbarText
                            }>
                            Lưu tạm
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.snackbarButton, styles.reportButton]}
                        onPress={onReport}>
                        <Text style={styles.snackbarText1}>Báo cáo</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

export default ActionButtons;

const styles = StyleSheet.create({
    input: {
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'gray',
        paddingHorizontal: 12,
        height: 40,
        marginBottom: 12,
        fontSize: 14,
    },
    container: {
        padding: 16,
        backgroundColor: '#fff',
    },
    infoContainer: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    gardenName: {
        fontSize: 16,
        fontWeight: '600',
    },
    gardenCode: {
        color: 'green',
        fontWeight: '500',
        marginTop: 2,
    },
    productBox: {
        marginTop: 12,
        backgroundColor: '#4CAF5026',
        padding: 10,
        borderRadius: 6,
    },
    productLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
    },
    productRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    productText: {
        fontSize: 14,
        color: '#333',
        marginLeft: 4,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    taskHeader: {
        fontSize: 14,
        fontWeight: '500',
    },
    linkText: {
        color: 'blue',
        textDecorationLine: 'underline',
    },

    exitButton: {
        backgroundColor: 'red',
        padding: 12,
        alignItems: 'center',
        borderRadius: 24,
        marginTop: 16,
    },
    exitText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },

    requiredMark: {
        color: 'red',
    },
    snackbarContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 10,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: -2},
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 5,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    snackbarButton: {
        flex: 1,
        marginHorizontal: 8,
        paddingVertical: 10,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveButton: {
        backgroundColor: '#4CAF50',
    },
    reportButton: {
        borderColor: 'green',
        borderWidth: 1,
    },
    snackbarText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    snackbarText1: {
        color: 'green',
        fontWeight: 'bold',
    },
    exitActionButton: {
        backgroundColor: 'red',
        borderWidth: 0,
        width: 44,
        height: 44,
        borderRadius: 22,
        flex: 0,
    },

    alertText: {
        color: '#92400E',
        marginLeft: 8,
        flex: 1,
    },

    alertInSnackbar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        borderColor: '#F59E0B',
        borderWidth: 1,
        borderRadius: 6,
        padding: 10,
        marginBottom: 10,
        marginHorizontal: 10,
    },
    closeButton: {
        padding: 5,
        marginLeft: 'auto',
    },
    successAlert: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#DCFCE7',
        borderColor: '#22C55E',
        borderWidth: 1,
        borderRadius: 6,
        padding: 10,
        marginBottom: 10,
        marginHorizontal: 10,
    },
    successText: {
        color: '#166534',
        marginLeft: 8,
        flex: 1,
    },
    saveButtonDisabled: {
        backgroundColor: '#D1D5DB',
    },
    disabledButtonText: {
        color: '#6B7280',
        fontWeight: 'bold',
    },
    confirmationContainer: {
        padding: 15,
        alignItems: 'center',
    },
    confirmationText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
    },
    confirmationButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 10,
    },
    cancelButton: {
        flex: 1,
        padding: 12,
        borderRadius: 20,
        marginRight: 10,
        alignItems: 'center',
        backgroundColor: '#E5E7EB',
    },
    confirmButton: {
        flex: 1,
        padding: 12,
        borderRadius: 20,
        marginLeft: 10,
        alignItems: 'center',
        backgroundColor: '#4CAF50',
    },
    cancelButtonText: {
        color: '#6B7280',
        fontWeight: 'bold',
    },
    confirmButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    confirmationDivider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        width: '100%',
        marginTop: 10,
    },
});
