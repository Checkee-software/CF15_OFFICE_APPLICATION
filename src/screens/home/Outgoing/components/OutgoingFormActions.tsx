import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type OutgoingFormActionsProps = {
    isLeaderLevel: boolean;
    isDepartmentLevel: boolean;
    isStationaryLevel: boolean;
    editingDocument: any;
    isLoading: boolean;
    isKeyboardVisible: boolean;
    handleCreateOutgoing: (type: 'DRAFT' | 'SENDING') => void;
    setIsCreating: (val: boolean) => void;
};

const OutgoingFormActions = React.memo(({
    isLeaderLevel,
    isDepartmentLevel,
    isStationaryLevel,
    editingDocument,
    isLoading,
    isKeyboardVisible,
    handleCreateOutgoing,
    setIsCreating,
}: OutgoingFormActionsProps) => {
    if (isKeyboardVisible) { return null; }

    const canDraft = (isLeaderLevel || isDepartmentLevel || isStationaryLevel) && !editingDocument;

    return (
        <View style={styles.bottomActions}>
            {canDraft ? (
                <TouchableOpacity
                    style={[styles.btnDraft, isLoading && styles.formActionDisabled]}
                    disabled={isLoading}
                    onPress={() => handleCreateOutgoing('DRAFT')}>
                    <Text style={styles.btnDraftText}>Lưu bản nháp</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity
                    style={[styles.btnDraft, isLoading && styles.formActionDisabled]}
                    disabled={isLoading}
                    onPress={() => setIsCreating(false)}>
                    <Text style={styles.btnDraftText}>Đóng</Text>
                </TouchableOpacity>
            )}
            <TouchableOpacity
                style={[styles.btnSubmit, isLoading && styles.formActionDisabled]}
                disabled={isLoading}
                onPress={() => handleCreateOutgoing('SENDING')}>
                <Text style={styles.btnSubmitText}>
                    {editingDocument ? 'Cập nhật & gửi' : 'Xác nhận gửi'}
                </Text>
            </TouchableOpacity>
        </View>
    );
});

OutgoingFormActions.displayName = 'OutgoingFormActions';

const styles = StyleSheet.create({
    bottomActions: {
        height: 78,
        borderTopWidth: 1,
        borderTopColor: '#DADADA',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        paddingTop: 10,
        backgroundColor: '#EFEFEF',
    },
    btnDraft: {
        flex: 1,
        height: 46,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#9B9B9B',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8F8F8',
    },
    btnDraftText: { fontSize: 16, color: '#8D8D8D', fontWeight: '500' },
    btnSubmit: {
        flex: 1.2,
        height: 46,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4CAF50',
    },
    btnSubmitText: { fontSize: 16, color: '#FFF', fontWeight: '600' },
    formActionDisabled: { opacity: 0.7 },
});

export default OutgoingFormActions;
