import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { TFormMode } from '../utils';

type IncomingFormActionsProps = {
    formMode: TFormMode;
    isFormBusy: boolean;
    isKeyboardVisible: boolean;
    isEditorFocused: boolean;
    submitLayout1: (isDraft: boolean) => void;
    submitLayout3: () => void;
    submitLayout4: () => void;
    editingId: string | null;
};

const IncomingFormActions = React.memo(
    ({
        formMode,
        isFormBusy,
        isKeyboardVisible,
        isEditorFocused,
        submitLayout1,
        submitLayout3,
        submitLayout4,
        editingId,
    }: IncomingFormActionsProps) => {
        const hideBottomActions = isKeyboardVisible && !isEditorFocused;
        if (hideBottomActions) { return null; }

        if (formMode === 'CREATE' || formMode === 'LAYOUT_1') {
            const draftLabel =
                formMode === 'CREATE'
                    ? editingId
                        ? 'Cập nhật'
                        : 'Lưu bản nháp'
                    : 'Cập nhật';
            return (
                <View style={styles.bottomActions}>
                    <TouchableOpacity
                        style={[styles.btnDraft, isFormBusy && { opacity: 0.7 }]}
                        disabled={isFormBusy}
                        onPress={() => submitLayout1(true)}>
                        <Text style={styles.btnDraftText}>{draftLabel}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.btnSubmit, isFormBusy && { opacity: 0.7 }]}
                        disabled={isFormBusy}
                        onPress={() => submitLayout1(false)}>
                        <Text style={styles.btnSubmitText}>Xác nhận gửi</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (formMode === 'LAYOUT_3') {
            return (
                <View style={styles.bottomActionsSingle}>
                    <TouchableOpacity
                        style={[
                            styles.btnSubmitSingle,
                            isFormBusy && { opacity: 0.7 },
                        ]}
                        disabled={isFormBusy}
                        onPress={submitLayout3}>
                        <Text style={styles.btnSubmitText}>Xác nhận vào sổ</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (formMode === 'LAYOUT_4') {
            return (
                <View style={styles.bottomActionsSingle}>
                    <TouchableOpacity
                        style={[
                            styles.btnSubmitSingle,
                            isFormBusy && { opacity: 0.7 },
                        ]}
                        disabled={isFormBusy}
                        onPress={submitLayout4}>
                        <Text style={styles.btnSubmitText}>Xác nhận phân công</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return null;
    },
);

IncomingFormActions.displayName = 'IncomingFormActions';

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
    bottomActionsSingle: {
        height: 70,
        borderTopWidth: 1,
        borderTopColor: '#DADADA',
        justifyContent: 'center',
        backgroundColor: '#EFEFEF',
        paddingHorizontal: 10,
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
    btnSubmitSingle: {
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4CAF50',
    },
    btnSubmitText: { fontSize: 16, color: '#FFF', fontWeight: '600' },
});

export default IncomingFormActions;
