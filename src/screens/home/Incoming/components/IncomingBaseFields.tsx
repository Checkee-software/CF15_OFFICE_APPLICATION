import React from 'react';
import {
    Keyboard,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DropdownModal from './DropdownModal';
import { DOCUMENT_PRIORITY_LABEL, type EDocumentPriority } from '@/shared-types/common/Document/document';
import {
    formatDate,
    type TDropdownListOption,
    type TFocusableIncomingField,
} from '../utils';

type IncomingBaseFieldsProps = {
    titleValue: string;
    organizationValue: string;
    senderValue: string;
    registeredNumberValue: string;
    createdAtValue: string;
    categoryNameValue: string;
    priorityValue: EDocumentPriority | '';
    showCategoryMenu: boolean;
    showPriorityMenu: boolean;
    categoryDropdownOptions: TDropdownListOption[];
    priorityDropdownOptions: TDropdownListOption[];
    errors: Record<string, any>;
    focusedField: TFocusableIncomingField | null;
    titleInputRef: React.RefObject<TextInput | null>;
    organizationInputRef: React.RefObject<TextInput | null>;
    senderInputRef: React.RefObject<TextInput | null>;
    registeredNumberInputRef: React.RefObject<TextInput | null>;
    resetMenus: () => void;
    handleInputFocus: (field: TFocusableIncomingField) => void;
    setFocusedField: React.Dispatch<React.SetStateAction<any>>;
    setTitleValue: (value: string) => void;
    setOrganizationValue: (value: string) => void;
    setSenderValue: (value: string) => void;
    setRegisteredNumberValue: (value: string) => void;
    setErrors: React.Dispatch<React.SetStateAction<any>>;
    setShowCategoryMenu: React.Dispatch<React.SetStateAction<boolean>>;
    setShowPriorityMenu: React.Dispatch<React.SetStateAction<boolean>>;
    openCreatedDatePicker: () => void;
    selectCategoryOption: (option: TDropdownListOption) => void;
    selectPriorityOption: (option: TDropdownListOption) => void;
    toggleMenu: (isOpen: boolean, setMenu: React.Dispatch<React.SetStateAction<boolean>>) => void;
};

const IncomingBaseFields = React.memo(
    ({
        titleValue,
        organizationValue,
        senderValue,
        registeredNumberValue,
        createdAtValue,
        categoryNameValue,
        priorityValue,
        showCategoryMenu,
        showPriorityMenu,
        categoryDropdownOptions,
        priorityDropdownOptions,
        errors,
        focusedField,
        titleInputRef,
        organizationInputRef,
        senderInputRef,
        registeredNumberInputRef,
        resetMenus,
        handleInputFocus,
        setFocusedField,
        setTitleValue,
        setOrganizationValue,
        setSenderValue,
        setRegisteredNumberValue,
        setErrors,
        setShowCategoryMenu,
        setShowPriorityMenu,
        openCreatedDatePicker,
        selectCategoryOption,
        selectPriorityOption,
        toggleMenu,
    }: IncomingBaseFieldsProps) => (
        <>
            {/* Title */}
            <Text style={styles.fieldLabel}>
                Tiêu đề tài liệu <Text style={styles.required}>*</Text>
            </Text>
            <View
                style={[
                    styles.inputWrap,
                    focusedField === 'title' && styles.inputWrapFocused,
                    errors.title && styles.inputWrapError,
                ]}>
                <TextInput
                    ref={titleInputRef}
                    style={styles.input}
                    placeholder="Nhập nội dung"
                    placeholderTextColor="#A0A0A0"
                    value={titleValue}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onFocus={() => handleInputFocus('title')}
                    onBlur={() =>
                        setFocusedField((prev: any) =>
                            prev === 'title' ? null : prev,
                        )
                    }
                    onSubmitEditing={() =>
                        organizationInputRef.current?.focus()
                    }
                    onChangeText={value => {
                        setTitleValue(value);
                        setErrors((prev: any) => ({ ...prev, title: undefined }));
                    }}
                />
            </View>
            {!!errors.title && (
                <Text style={styles.fieldError}>Bắt buộc!</Text>
            )}

            {/* Organization */}
            <Text style={styles.fieldLabel}>
                Tên tổ chức <Text style={styles.required}>*</Text>
            </Text>
            <View
                style={[
                    styles.inputWrap,
                    focusedField === 'organization' && styles.inputWrapFocused,
                    errors.organization && styles.inputWrapError,
                ]}>
                <TextInput
                    ref={organizationInputRef}
                    style={styles.input}
                    placeholder="Nhập tên tổ chức"
                    placeholderTextColor="#A0A0A0"
                    value={organizationValue}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onFocus={() => handleInputFocus('organization')}
                    onBlur={() =>
                        setFocusedField((prev: any) =>
                            prev === 'organization' ? null : prev,
                        )
                    }
                    onSubmitEditing={() => senderInputRef.current?.focus()}
                    onChangeText={value => {
                        setOrganizationValue(value);
                        setErrors((prev: any) => ({
                            ...prev,
                            organization: undefined,
                        }));
                    }}
                />
            </View>
            {!!errors.organization && (
                <Text style={styles.fieldError}>Bắt buộc!</Text>
            )}

            {/* Sender */}
            <Text style={styles.fieldLabel}>
                Người gửi <Text style={styles.required}>*</Text>
            </Text>
            <View
                style={[
                    styles.inputWrap,
                    focusedField === 'sender' && styles.inputWrapFocused,
                    errors.sender && styles.inputWrapError,
                ]}>
                <TextInput
                    ref={senderInputRef}
                    style={styles.input}
                    placeholder="Nhập người gửi"
                    placeholderTextColor="#A0A0A0"
                    value={senderValue}
                    returnKeyType="next"
                    blurOnSubmit={false}
                    onFocus={() => handleInputFocus('sender')}
                    onBlur={() =>
                        setFocusedField((prev: any) =>
                            prev === 'sender' ? null : prev,
                        )
                    }
                    onSubmitEditing={() =>
                        registeredNumberInputRef.current?.focus()
                    }
                    onChangeText={value => {
                        setSenderValue(value);
                        setErrors((prev: any) => ({ ...prev, sender: undefined }));
                    }}
                />
            </View>
            {!!errors.sender && (
                <Text style={styles.fieldError}>Bắt buộc!</Text>
            )}

            {/* Registered Number + Created Date row */}
            <View style={styles.row}>
                <View style={styles.half}>
                    <Text style={styles.fieldLabel}>
                        Số hiệu văn bản{' '}
                        <Text style={styles.required}>*</Text>
                    </Text>
                    <View
                        style={[
                            styles.inputWrap,
                            focusedField === 'registeredNumber' &&
                                styles.inputWrapFocused,
                            errors.registeredNumber && styles.inputWrapError,
                        ]}>
                        <TextInput
                            ref={registeredNumberInputRef}
                            style={styles.input}
                            placeholder="Nhập số hiệu"
                            placeholderTextColor="#A0A0A0"
                            value={registeredNumberValue}
                            returnKeyType="done"
                            onFocus={() =>
                                handleInputFocus('registeredNumber')
                            }
                            onBlur={() =>
                                setFocusedField((prev: any) =>
                                    prev === 'registeredNumber' ? null : prev,
                                )
                            }
                            onSubmitEditing={() => {
                                Keyboard.dismiss();
                                setFocusedField(null);
                            }}
                            onChangeText={value => {
                                setRegisteredNumberValue(value);
                                setErrors((prev: any) => ({
                                    ...prev,
                                    registeredNumber: undefined,
                                }));
                            }}
                        />
                    </View>
                    {!!errors.registeredNumber && (
                        <Text style={styles.fieldError}>Bắt buộc!</Text>
                    )}
                </View>

                <View style={styles.half}>
                    <Text style={styles.fieldLabel}>
                        Ngày tạo văn bản{' '}
                        <Text style={styles.required}>*</Text>
                    </Text>
                    <TouchableOpacity
                        style={[
                            styles.select,
                            focusedField === 'createdAt' && styles.selectFocused,
                        ]}
                        onPress={openCreatedDatePicker}>
                        <Text style={styles.selectText}>
                            {formatDate(createdAtValue)}
                        </Text>
                        <MaterialCommunityIcons
                            name="calendar-month-outline"
                            size={18}
                            color="#666"
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Category + Priority row */}
            <View style={styles.row}>
                <View style={styles.half}>
                    <Text style={styles.fieldLabel}>
                        Loại tài liệu{' '}
                        <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={styles.dropdownWrap}>
                        <TouchableOpacity
                            style={[
                                styles.select,
                                showCategoryMenu && styles.selectFocused,
                                errors.categoryId && styles.inputWrapError,
                            ]}
                            onPress={() =>
                                toggleMenu(showCategoryMenu, setShowCategoryMenu)
                            }>
                            <Text style={styles.selectText}>
                                {categoryNameValue || 'Chọn loại'}
                            </Text>
                            <MaterialCommunityIcons
                                name="chevron-down"
                                size={18}
                                color="#666"
                            />
                        </TouchableOpacity>
                        {showCategoryMenu && (
                            <DropdownModal
                                visible
                                title="Chọn loại tài liệu"
                                options={categoryDropdownOptions}
                                searchEnabled
                                searchPlaceholder="Tìm loại tài liệu..."
                                emptyText="Chưa có loại tài liệu"
                                onSelect={selectCategoryOption}
                                onClose={resetMenus}
                            />
                        )}
                    </View>
                    {!!errors.categoryId && (
                        <Text style={styles.fieldError}>Vui lòng chọn!</Text>
                    )}
                </View>

                <View style={styles.half}>
                    <Text style={styles.fieldLabel}>
                        Mức độ ưu tiên{' '}
                        <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={styles.dropdownWrap}>
                        <TouchableOpacity
                            style={[
                                styles.select,
                                showPriorityMenu && styles.selectFocused,
                                errors.priority && styles.inputWrapError,
                            ]}
                            onPress={() =>
                                toggleMenu(showPriorityMenu, setShowPriorityMenu)
                            }>
                            <Text style={styles.selectText}>
                                {priorityValue
                                    ? DOCUMENT_PRIORITY_LABEL[priorityValue]
                                    : 'Chọn mức độ'}
                            </Text>
                            <MaterialCommunityIcons
                                name="chevron-down"
                                size={18}
                                color="#666"
                            />
                        </TouchableOpacity>
                        {showPriorityMenu && (
                            <DropdownModal
                                visible
                                title="Chọn mức độ ưu tiên"
                                options={priorityDropdownOptions}
                                onSelect={selectPriorityOption}
                                onClose={resetMenus}
                            />
                        )}
                    </View>
                    {!!errors.priority && (
                        <Text style={styles.fieldError}>{errors.priority}</Text>
                    )}
                </View>
            </View>
        </>
    ),
);

IncomingBaseFields.displayName = 'IncomingBaseFields';

const styles = StyleSheet.create({
    fieldLabel: { fontSize: 13, color: '#222', marginBottom: 5, marginTop: 8 },
    required: { color: '#F05A5A' },
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
    fieldError: {
        color: '#FF4D4F',
        fontSize: 12,
        marginTop: 4,
        textAlign: 'right',
    },
});

export default IncomingBaseFields;
