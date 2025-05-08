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
    onlyShowReportButton,
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
    onlyShowReportButton?: boolean;
}) => {
    if (!visible) return null;

    return (
        <View style={styles.snackbarContainer}>
            {/* Alert message */}
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

            {/* Report confirmation */}
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

            {/* Saved alert */}
            {isSaved && !showReportConfirmation && (
                <View style={styles.successAlert}>
                    <Icon name='check-circle' size={20} color='#22C55E' />
                    <Text style={styles.successText}>Đã lưu công việc!</Text>
                </View>
            )}

            {/* Action buttons */}
            <View style={styles.buttonContainer}>
                {!onlyShowReportButton && (
                    <>
                        <TouchableOpacity
                            style={[
                                styles.snackbarButton,
                                styles.exitActionButton,
                            ]}
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
                    </>
                )}

                <TouchableOpacity
                    style={[
                        styles.snackbarButton,
                        styles.reportButton,
                        onlyShowReportButton ? styles.reportButtonOnly : null,
                    ]}
                    onPress={onReport}>
                    <Text style={styles.snackbarText1}>Báo cáo</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default ActionButtons;

const styles = StyleSheet.create({
    reportButtonOnly: {
        width: '80%',
        alignSelf: 'center',
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
