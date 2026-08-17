import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DropdownModal from './DropdownModal';
import type { TDropdownListOption } from '../utils';

type IncomingAssignSectionProps = {
    isLayout4: boolean;
    isLoadingAssignmentOptions: boolean;
    errors: Record<string, any>;
    showLeadDepartmentMenu: boolean;
    showReceiveMenu: boolean;
    showSupportDepartmentMenu: boolean;
    selectedLeadDepartmentName: string;
    selectedReceiveToKnowText: string;
    selectedSupportDepartmentText: string;
    leadDepartmentDropdownOptions: TDropdownListOption[];
    receiveDropdownOptions: TDropdownListOption[];
    supportDepartmentDropdownOptions: TDropdownListOption[];
    receiveToKnowIds: string[];
    supportDepartmentIds: string[];
    finishedAtDisplay: string;
    focusedField: string | null;
    errors_finishedAt?: string;
    resetMenus: () => void;
    openFinishedDatePicker: () => void;
    toggleMenu: (isOpen: boolean, setMenu: React.Dispatch<React.SetStateAction<boolean>>) => void;
    setShowLeadDepartmentMenu: React.Dispatch<React.SetStateAction<boolean>>;
    setShowReceiveMenu: React.Dispatch<React.SetStateAction<boolean>>;
    setShowSupportDepartmentMenu: React.Dispatch<React.SetStateAction<boolean>>;
    selectLeadDepartmentOption: (option: TDropdownListOption) => void;
    toggleReceiveToKnowOption: (option: TDropdownListOption) => void;
    toggleSupportDepartmentOption: (option: TDropdownListOption) => void;
};

const IncomingAssignSection = React.memo(
    ({
        isLayout4,
        isLoadingAssignmentOptions,
        errors,
        showLeadDepartmentMenu,
        showReceiveMenu,
        showSupportDepartmentMenu,
        selectedLeadDepartmentName,
        selectedReceiveToKnowText,
        selectedSupportDepartmentText,
        leadDepartmentDropdownOptions,
        receiveDropdownOptions,
        supportDepartmentDropdownOptions,
        receiveToKnowIds,
        supportDepartmentIds,
        finishedAtDisplay,
        focusedField,
        resetMenus,
        openFinishedDatePicker,
        toggleMenu,
        setShowLeadDepartmentMenu,
        setShowReceiveMenu,
        setShowSupportDepartmentMenu,
        selectLeadDepartmentOption,
        toggleReceiveToKnowOption,
        toggleSupportDepartmentOption,
    }: IncomingAssignSectionProps) => (
        <>
            <Text style={styles.blockTitle}>
                {isLayout4
                    ? 'Phân công cơ quan xử lý'
                    : 'Phân công phòng ban xử lý'}
            </Text>

            <View style={styles.row}>
                {/* Lead Department */}
                <View style={styles.half}>
                    <Text style={styles.fieldLabel}>
                        Cơ quan chủ trì{' '}
                        <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={styles.dropdownWrap}>
                        <TouchableOpacity
                            style={[
                                styles.select,
                                showLeadDepartmentMenu && styles.selectFocused,
                                errors.leadDepartmentId && styles.inputWrapError,
                            ]}
                            onPress={() =>
                                toggleMenu(
                                    showLeadDepartmentMenu,
                                    setShowLeadDepartmentMenu,
                                )
                            }>
                            <Text style={styles.selectText}>
                                {selectedLeadDepartmentName || 'Chọn cơ quan chủ trì'}
                            </Text>
                            <MaterialCommunityIcons
                                name="chevron-down"
                                size={18}
                                color="#666"
                            />
                        </TouchableOpacity>
                        {showLeadDepartmentMenu && (
                            <DropdownModal
                                visible
                                title="Chọn cơ quan chủ trì"
                                loading={isLoadingAssignmentOptions}
                                options={leadDepartmentDropdownOptions}
                                searchEnabled
                                searchPlaceholder="Tìm cơ quan chủ trì..."
                                emptyText="Chưa có danh sách cơ quan"
                                onSelect={selectLeadDepartmentOption}
                                onClose={resetMenus}
                            />
                        )}
                    </View>
                    {!!errors.leadDepartmentId && (
                        <Text style={styles.fieldError}>
                            {errors.leadDepartmentId}
                        </Text>
                    )}
                </View>

                {/* Finished Date */}
                <View style={styles.half}>
                    <Text style={styles.fieldLabel}>
                        Ngày kết thúc{' '}
                        <Text style={styles.required}>*</Text>
                    </Text>
                    <TouchableOpacity
                        activeOpacity={0.85}
                        style={[
                            styles.inputWrap,
                            focusedField === 'finishedAt' && styles.inputWrapFocused,
                            errors.finishedAt && styles.inputWrapError,
                            styles.dateRow,
                        ]}
                        onPress={openFinishedDatePicker}>
                        <Text
                            style={[
                                styles.input,
                                {
                                    flex: 1,
                                    color: finishedAtDisplay ? '#222' : '#A0A0A0',
                                },
                            ]}>
                            {finishedAtDisplay || 'DD/MM/YYYY'}
                        </Text>
                        <View style={{ marginLeft: 8 }}>
                            <MaterialCommunityIcons
                                name="calendar"
                                size={20}
                                color="#666"
                            />
                        </View>
                    </TouchableOpacity>
                    {!!errors.finishedAt && (
                        <Text style={styles.fieldError}>{errors.finishedAt}</Text>
                    )}
                </View>
            </View>

            {/* Receive To Know */}
            <Text style={styles.fieldLabel}>
                Người nhận để biết{' '}
                <Text style={styles.mutedHint}>(chọn nhiều)</Text>
            </Text>
            <View style={styles.dropdownWrap}>
                <TouchableOpacity
                    style={[
                        styles.select,
                        showReceiveMenu && styles.selectFocused,
                    ]}
                    onPress={() => toggleMenu(showReceiveMenu, setShowReceiveMenu)}>
                    <Text style={styles.selectText}>{selectedReceiveToKnowText}</Text>
                    <MaterialCommunityIcons
                        name="chevron-down"
                        size={18}
                        color="#666"
                    />
                </TouchableOpacity>
                {showReceiveMenu && (
                    <DropdownModal
                        visible
                        title="Người nhận để biết"
                        loading={isLoadingAssignmentOptions}
                        options={receiveDropdownOptions}
                        selectedKeys={receiveToKnowIds}
                        searchEnabled
                        searchPlaceholder="Tìm người nhận..."
                        emptyText="Chưa có danh sách người nhận"
                        onSelect={toggleReceiveToKnowOption}
                        onClose={resetMenus}
                    />
                )}
            </View>

            {/* Support Departments */}
            <Text style={styles.fieldLabel}>
                Chọn cơ quan phối hợp{' '}
                <Text style={styles.mutedHint}>(chọn nhiều)</Text>
            </Text>
            <View style={styles.dropdownWrap}>
                <TouchableOpacity
                    style={[
                        styles.select,
                        showSupportDepartmentMenu && styles.selectFocused,
                    ]}
                    onPress={() =>
                        toggleMenu(
                            showSupportDepartmentMenu,
                            setShowSupportDepartmentMenu,
                        )
                    }>
                    <Text style={styles.selectText}>
                        {selectedSupportDepartmentText}
                    </Text>
                    <MaterialCommunityIcons
                        name="chevron-down"
                        size={18}
                        color="#666"
                    />
                </TouchableOpacity>
                {showSupportDepartmentMenu && (
                    <DropdownModal
                        visible
                        title="Cơ quan phối hợp"
                        loading={isLoadingAssignmentOptions}
                        options={supportDepartmentDropdownOptions}
                        selectedKeys={supportDepartmentIds}
                        searchEnabled
                        searchPlaceholder="Tìm cơ quan phối hợp..."
                        emptyText="Chưa có danh sách cơ quan phối hợp"
                        onSelect={toggleSupportDepartmentOption}
                        onClose={resetMenus}
                    />
                )}
            </View>

            <View style={styles.separator} />
        </>
    ),
);

IncomingAssignSection.displayName = 'IncomingAssignSection';

const styles = StyleSheet.create({
    blockTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2196F3',
        marginTop: 4,
        marginBottom: 8,
    },
    fieldLabel: { fontSize: 13, color: '#222', marginBottom: 5, marginTop: 8 },
    required: { color: '#F05A5A' },
    mutedHint: { color: '#777', fontStyle: 'italic' },
    row: { flexDirection: 'row', gap: 8 },
    half: { flex: 1 },
    dropdownWrap: { position: 'relative' },
    select: {
        height: 38,
        borderWidth: 1,
        borderColor: '#BFBFBF',
        borderRadius: 6,
        backgroundColor: '#F7F7F7',
        paddingHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
    },
    selectFocused: { borderColor: '#4CAF50', backgroundColor: '#FFFFFF' },
    selectText: { fontSize: 13, color: '#5A5A5A', flex: 1 },
    inputWrap: {
        borderWidth: 1,
        borderColor: '#BFBFBF',
        borderRadius: 6,
        backgroundColor: '#F7F7F7',
        paddingHorizontal: 10,
    },
    inputWrapFocused: { borderColor: '#4CAF50', backgroundColor: '#FFFFFF' },
    inputWrapError: { borderColor: '#FF4D4F' },
    input: {
        height: 38,
        fontSize: 13,
        color: '#222',
        paddingVertical: 0,
        paddingLeft: 2,
        textAlignVertical: 'center',
        includeFontPadding: false,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    fieldError: {
        color: '#FF4D4F',
        fontSize: 12,
        marginTop: 4,
        textAlign: 'right',
    },
    separator: {
        borderBottomWidth: 1,
        borderBottomColor: '#8CC7FF',
        borderStyle: 'dashed',
        marginTop: 10,
        marginBottom: 10,
    },
});

export default IncomingAssignSection;
