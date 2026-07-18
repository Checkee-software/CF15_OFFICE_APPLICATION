import React from 'react';
import {
    Keyboard,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {DOCUMENT_PRIORITY_LABEL} from '@/shared-types/common/Document/document';
import Backdrop from '@/screens/subscreen/Loading/index2';
import DropdownModal from './DropdownModal';
import FileRow from './FileRow';
import WebEditor from '../../Document/components/WebEditor';
import DatePickerModal from './DatePickerModal';
import {useIncomingForm} from '../hooks/useIncomingForm';
import styles from '../styles';
import {formatDate, type TDropdownListOption} from '../utils';

type IncomingFormProps = {
    form: ReturnType<typeof useIncomingForm>;
    onClose: () => void;
};

const IncomingForm = React.memo(({form, onClose}: IncomingFormProps) => {
    const {
        activeFormat,
        applyRelativeDate,
        attachedFilesNew,
        canRemoveExistingMainFile,
        categoryDropdownOptions,
        categoryNameValue,
        chooseColor,
        closeDatePicker,
        commitEditorContent,
        createdAtValue,
        datePickerDraft,
        datePickerError,
        destinationCategoryHint,
        destinationDropdownOptions,
        destinationLevelOptions,
        destinationPathLabel,
        destinationSelectionIds,
        dismissKeyboardAndMenus,
        editorCommand,
        editorContentRef,
        editorContentRequestRef,
        editorFocusedRef,
        editorReadyRef,
        editorRef,
        editingId,
        errors,
        existingAttachedFiles,
        existingMainFiles,
        finishedAtDisplay,
        focusedField,
        formMode,
        formScrollRef,
        handleInputFocus,
        handlePickAttachedFiles,
        handlePickMainFiles,
        handleRemoveExistingAttachedFile,
        handleRemoveExistingMainFile,
        handleRemoveNewAttachedFile,
        handleRemoveNewMainFile,
        isEditorFocused,
        isFormBusy,
        isKeyboardVisible,
        keyboardHeight,
        isLayout4,
        isLoadingAssignmentOptions,
        isLoadingDestinationOptions,
        initialEditorHtml,
        leadDepartmentDropdownOptions,
        mainFilesNew,
        openCreatedDatePicker,
        openFinishedDatePicker,
        organizationInputRef,
        organizationValue,
        priorityDropdownOptions,
        priorityValue,
        receiveDropdownOptions,
        receiveToKnowIds,
        registeredNumberInputRef,
        registeredNumberValue,
        resetForm,
        resetMenus,
        scrollFormToEditor,
        selectCategoryOption,
        selectDestinationOption,
        selectLeadDepartmentOption,
        selectPriorityOption,
        selectedLeadDepartmentName,
        selectedReceiveToKnowText,
        selectedSupportDepartmentText,
        sendEditorCommand,
        senderInputRef,
        senderValue,
        setDatePickerDraft,
        setDatePickerError,
        setErrors,
        setFocusedField,
        setInitialEditorHtml,
        setIsEditorFocused,
        setOrganizationValue,
        setRegisteredNumberValue,
        setSenderValue,
        setShowCategoryMenu,
        setShowColorMenu,
        setShowFormatMenu,
        setShowLeadDepartmentMenu,
        setShowPriorityMenu,
        setShowReceiveMenu,
        setShowSupportDepartmentMenu,
        setShowForm,
        setTitleValue,
        shouldMountEditor,
        showAssignSection,
        showCategoryMenu,
        showColorMenu,
        showCreatedDatePicker,
        showFinishedDatePicker,
        showFormatMenu,
        showLeadDepartmentMenu,
        showPriorityMenu,
        showReceiveMenu,
        showRegisterSection,
        showSupportDepartmentMenu,
        showDestinationLevel,
        submitDatePickerDraft,
        submitLayout1,
        submitLayout3,
        submitLayout4,
        supportDepartmentDropdownOptions,
        supportDepartmentIds,
        titleInputRef,
        titleValue,
        toggleDestinationMenu,
        toggleFormat,
        toggleMenu,
        toggleReceiveToKnowOption,
        toggleSupportDepartmentOption,
    } = form;

    const renderDropdownMenu = ({
        title,
        options,
        selectedKeys,
        loading = false,
        searchEnabled,
        searchPlaceholder,
        onSelect,
        emptyText = 'Không có dữ liệu để chọn',
    }: {
        title?: string;
        options: TDropdownListOption[];
        selectedKeys?: string[];
        loading?: boolean;
        emptyText?: string;
        searchEnabled?: boolean;
        searchPlaceholder?: string;
        onSelect?: (item: TDropdownListOption) => void;
    }) => (
        <DropdownModal
            visible
            title={title}
            options={options}
            selectedKeys={selectedKeys}
            loading={loading}
            emptyText={emptyText}
            searchEnabled={searchEnabled}
            searchPlaceholder={searchPlaceholder}
            onSelect={onSelect}
            onClose={resetMenus}
        />
    );

    const layoutTitle =
        formMode === 'CREATE' ? 'Tạo văn bản đến' : 'Cập nhật văn bản đến';
    const receiverLabel = 'Ban giám đốc';
    const hideBottomActions = isKeyboardVisible && !isEditorFocused;

    return (
        <View style={styles.container}>
            <View style={styles.flexOne}>
                <View style={styles.createHeader}>
                    <Text style={styles.createTitle}>{layoutTitle}</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Text style={styles.createReset}>Đóng lại</Text>
                    </TouchableOpacity>
                </View>

                <KeyboardAwareScrollView
                    ref={formScrollRef}
                    enableOnAndroid={false}
                    enableAutomaticScroll={
                        isKeyboardVisible && !isEditorFocused
                    }
                    extraScrollHeight={96}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps='handled'
                    keyboardDismissMode='on-drag'
                    onScrollBeginDrag={dismissKeyboardAndMenus}
                    contentContainerStyle={[
                        styles.createScroll,
                        isKeyboardVisible && {
                            paddingBottom:
                                Platform.OS === 'ios'
                                    ? keyboardHeight + 16
                                    : 16,
                        },
                    ]}>
                    {showRegisterSection && (
                        <>
                            <Text style={styles.blockTitle}>
                                Vào sổ văn bản
                            </Text>
                            {!!destinationPathLabel && (
                                <Text style={styles.blockHint}>
                                    Chi tiết nhánh: {destinationPathLabel}
                                </Text>
                            )}
                            {!!destinationCategoryHint && (
                                <Text style={styles.blockHint}>
                                    Chi tiết nhánh: {destinationCategoryHint}
                                </Text>
                            )}

                            <Text style={styles.fieldLabel}>
                                Chọn sổ (thư mục) lưu trữ{' '}
                                <Text style={styles.required}>*</Text>
                            </Text>
                            {destinationLevelOptions.map(
                                (options: any[], levelIndex: number) => {
                                    const selectedIdAtLevel =
                                        destinationSelectionIds[levelIndex] ||
                                        '';
                                    const selectedName =
                                        options.find(
                                            (item: any) =>
                                                item._id === selectedIdAtLevel,
                                        )?.name ||
                                        (levelIndex === 0
                                            ? destinationCategoryHint
                                            : '') ||
                                        'Chọn sổ (thư mục)';
                                    return (
                                        <View
                                            key={`level-${levelIndex}`}
                                            style={styles.dropdownWrap}>
                                            <TouchableOpacity
                                                style={[
                                                    styles.select,
                                                    showDestinationLevel ===
                                                        levelIndex &&
                                                        styles.selectFocused,
                                                    errors.destinationCategoryId &&
                                                        levelIndex === 0 &&
                                                        styles.inputWrapError,
                                                ]}
                                                onPress={() => {
                                                    toggleDestinationMenu(
                                                        levelIndex,
                                                    );
                                                }}>
                                                <Text style={styles.selectText}>
                                                    {selectedName}
                                                </Text>
                                                <MaterialCommunityIcons
                                                    name='chevron-down'
                                                    size={18}
                                                    color='#666'
                                                />
                                            </TouchableOpacity>
                                            {showDestinationLevel ===
                                                levelIndex &&
                                                renderDropdownMenu({
                                                    title: 'Chọn sổ lưu trữ',
                                                    loading:
                                                        isLoadingDestinationOptions,
                                                    options:
                                                        destinationDropdownOptions[
                                                            levelIndex
                                                        ] || [],
                                                    searchEnabled: true,
                                                    searchPlaceholder:
                                                        'Tìm sổ lưu trữ...',
                                                    onSelect: option =>
                                                        selectDestinationOption(
                                                            levelIndex,
                                                            option,
                                                        ),
                                                    emptyText:
                                                        'Không có sổ lưu trữ để chọn',
                                                })}
                                        </View>
                                    );
                                },
                            )}
                            {!!errors.destinationCategoryId && (
                                <Text style={styles.fieldError}>
                                    {errors.destinationCategoryId}
                                </Text>
                            )}

                            <View style={styles.separator} />
                        </>
                    )}

                    {showAssignSection && (
                        <>
                            <Text style={styles.blockTitle}>
                                {isLayout4
                                    ? 'Phân công cơ quan xử lý'
                                    : 'Phân công phòng ban xử lý'}
                            </Text>

                            <View style={styles.row}>
                                <View style={styles.half}>
                                    <Text style={styles.fieldLabel}>
                                        Cơ quan chủ trì{' '}
                                        <Text style={styles.required}>*</Text>
                                    </Text>
                                    <View style={styles.dropdownWrap}>
                                        <TouchableOpacity
                                            style={[
                                                styles.select,
                                                showLeadDepartmentMenu &&
                                                    styles.selectFocused,
                                                errors.leadDepartmentId &&
                                                    styles.inputWrapError,
                                            ]}
                                            onPress={() =>
                                                toggleMenu(
                                                    showLeadDepartmentMenu,
                                                    setShowLeadDepartmentMenu,
                                                )
                                            }>
                                            <Text style={styles.selectText}>
                                                {selectedLeadDepartmentName ||
                                                    'Chọn cơ quan chủ trì'}
                                            </Text>
                                            <MaterialCommunityIcons
                                                name='chevron-down'
                                                size={18}
                                                color='#666'
                                            />
                                        </TouchableOpacity>
                                        {showLeadDepartmentMenu &&
                                            renderDropdownMenu({
                                                title: 'Chọn cơ quan chủ trì',
                                                loading:
                                                    isLoadingAssignmentOptions,
                                                options:
                                                    leadDepartmentDropdownOptions,
                                                searchEnabled: true,
                                                searchPlaceholder:
                                                    'Tìm cơ quan chủ trì...',
                                                onSelect:
                                                    selectLeadDepartmentOption,
                                                emptyText:
                                                    'Chưa có danh sách cơ quan',
                                            })}
                                    </View>
                                    {!!errors.leadDepartmentId && (
                                        <Text style={styles.fieldError}>
                                            {errors.leadDepartmentId}
                                        </Text>
                                    )}
                                </View>
                                <View style={styles.half}>
                                    <Text style={styles.fieldLabel}>
                                        Ngày kết thúc{' '}
                                        <Text style={styles.required}>*</Text>
                                    </Text>
                                    <TouchableOpacity
                                        activeOpacity={0.85}
                                        style={[
                                            styles.inputWrap,
                                            focusedField === 'finishedAt' &&
                                                styles.inputWrapFocused,
                                            errors.finishedAt &&
                                                styles.inputWrapError,
                                            {
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                            },
                                        ]}
                                        onPress={openFinishedDatePicker}>
                                        <Text
                                            style={[
                                                styles.input,
                                                {
                                                    flex: 1,
                                                    color: finishedAtDisplay
                                                        ? '#222'
                                                        : '#A0A0A0',
                                                },
                                            ]}>
                                            {finishedAtDisplay || 'DD/MM/YYYY'}
                                        </Text>
                                        <View style={{marginLeft: 8}}>
                                            <MaterialCommunityIcons
                                                name='calendar'
                                                size={20}
                                                color='#666'
                                            />
                                        </View>
                                    </TouchableOpacity>
                                    {!!errors.finishedAt && (
                                        <Text style={styles.fieldError}>
                                            {errors.finishedAt}
                                        </Text>
                                    )}
                                </View>
                            </View>

                            <Text style={styles.fieldLabel}>
                                Người nhận để biết{' '}
                                <Text style={styles.mutedHint}>
                                    (chọn nhiều)
                                </Text>
                            </Text>
                            <View style={styles.dropdownWrap}>
                                <TouchableOpacity
                                    style={[
                                        styles.select,
                                        showReceiveMenu && styles.selectFocused,
                                    ]}
                                    onPress={() => {
                                        toggleMenu(
                                            showReceiveMenu,
                                            setShowReceiveMenu,
                                        );
                                    }}>
                                    <Text style={styles.selectText}>
                                        {selectedReceiveToKnowText}
                                    </Text>
                                    <MaterialCommunityIcons
                                        name='chevron-down'
                                        size={18}
                                        color='#666'
                                    />
                                </TouchableOpacity>
                                {showReceiveMenu &&
                                    renderDropdownMenu({
                                        title: 'Người nhận để biết',
                                        loading: isLoadingAssignmentOptions,
                                        options: receiveDropdownOptions,
                                        selectedKeys: receiveToKnowIds,
                                        searchEnabled: true,
                                        searchPlaceholder: 'Tìm người nhận...',
                                        onSelect: toggleReceiveToKnowOption,
                                        emptyText:
                                            'Chưa có danh sách người nhận',
                                    })}
                            </View>

                            <Text style={styles.fieldLabel}>
                                Chọn cơ quan phối hợp{' '}
                                <Text style={styles.mutedHint}>
                                    (chọn nhiều)
                                </Text>
                            </Text>
                            <View style={styles.dropdownWrap}>
                                <TouchableOpacity
                                    style={[
                                        styles.select,
                                        showSupportDepartmentMenu &&
                                            styles.selectFocused,
                                    ]}
                                    onPress={() => {
                                        toggleMenu(
                                            showSupportDepartmentMenu,
                                            setShowSupportDepartmentMenu,
                                        );
                                    }}>
                                    <Text style={styles.selectText}>
                                        {selectedSupportDepartmentText}
                                    </Text>
                                    <MaterialCommunityIcons
                                        name='chevron-down'
                                        size={18}
                                        color='#666'
                                    />
                                </TouchableOpacity>
                                {showSupportDepartmentMenu &&
                                    renderDropdownMenu({
                                        title: 'Cơ quan phối hợp',
                                        loading: isLoadingAssignmentOptions,
                                        options:
                                            supportDepartmentDropdownOptions,
                                        selectedKeys: supportDepartmentIds,
                                        searchEnabled: true,
                                        searchPlaceholder:
                                            'Tìm cơ quan phối hợp...',
                                        onSelect: toggleSupportDepartmentOption,
                                        emptyText:
                                            'Chưa có danh sách cơ quan phối hợp',
                                    })}
                            </View>

                            <View style={styles.separator} />
                        </>
                    )}

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
                            placeholder='Nhập nội dung'
                            placeholderTextColor='#A0A0A0'
                            value={titleValue}
                            returnKeyType='next'
                            blurOnSubmit={false}
                            onFocus={() => handleInputFocus('title')}
                            onBlur={() => {
                                setFocusedField(prev =>
                                    prev === 'title' ? null : prev,
                                );
                            }}
                            onSubmitEditing={() =>
                                organizationInputRef.current?.focus()
                            }
                            onChangeText={value => {
                                setTitleValue(value);
                                setErrors(prev => ({
                                    ...prev,
                                    title: undefined,
                                }));
                            }}
                        />
                    </View>
                    {!!errors.title && (
                        <Text style={styles.fieldError}>Bắt buộc!</Text>
                    )}

                    <Text style={styles.fieldLabel}>
                        Tên tổ chức <Text style={styles.required}>*</Text>
                    </Text>
                    <View
                        style={[
                            styles.inputWrap,
                            focusedField === 'organization' &&
                                styles.inputWrapFocused,
                            errors.organization && styles.inputWrapError,
                        ]}>
                        <TextInput
                            ref={organizationInputRef}
                            style={styles.input}
                            placeholder='Nhập tên tổ chức'
                            placeholderTextColor='#A0A0A0'
                            value={organizationValue}
                            returnKeyType='next'
                            blurOnSubmit={false}
                            onFocus={() => handleInputFocus('organization')}
                            onBlur={() => {
                                setFocusedField(prev =>
                                    prev === 'organization' ? null : prev,
                                );
                            }}
                            onSubmitEditing={() =>
                                senderInputRef.current?.focus()
                            }
                            onChangeText={value => {
                                setOrganizationValue(value);
                                setErrors(prev => ({
                                    ...prev,
                                    organization: undefined,
                                }));
                            }}
                        />
                    </View>
                    {!!errors.organization && (
                        <Text style={styles.fieldError}>Bắt buộc!</Text>
                    )}

                    <Text style={styles.fieldLabel}>
                        Người gửi <Text style={styles.required}>*</Text>
                    </Text>
                    <View
                        style={[
                            styles.inputWrap,
                            focusedField === 'sender' &&
                                styles.inputWrapFocused,
                            errors.sender && styles.inputWrapError,
                        ]}>
                        <TextInput
                            ref={senderInputRef}
                            style={styles.input}
                            placeholder='Nhập người gửi'
                            placeholderTextColor='#A0A0A0'
                            value={senderValue}
                            returnKeyType='next'
                            blurOnSubmit={false}
                            onFocus={() => handleInputFocus('sender')}
                            onBlur={() => {
                                setFocusedField(prev =>
                                    prev === 'sender' ? null : prev,
                                );
                            }}
                            onSubmitEditing={() =>
                                registeredNumberInputRef.current?.focus()
                            }
                            onChangeText={value => {
                                setSenderValue(value);
                                setErrors(prev => ({
                                    ...prev,
                                    sender: undefined,
                                }));
                            }}
                        />
                    </View>
                    {!!errors.sender && (
                        <Text style={styles.fieldError}>Bắt buộc!</Text>
                    )}

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
                                    errors.registeredNumber &&
                                        styles.inputWrapError,
                                ]}>
                                <TextInput
                                    ref={registeredNumberInputRef}
                                    style={styles.input}
                                    placeholder='Nhập số hiệu'
                                    placeholderTextColor='#A0A0A0'
                                    value={registeredNumberValue}
                                    returnKeyType='done'
                                    onFocus={() =>
                                        handleInputFocus('registeredNumber')
                                    }
                                    onBlur={() => {
                                        setFocusedField(prev =>
                                            prev === 'registeredNumber'
                                                ? null
                                                : prev,
                                        );
                                    }}
                                    onSubmitEditing={() => {
                                        Keyboard.dismiss();
                                        setFocusedField(null);
                                    }}
                                    onChangeText={value => {
                                        setRegisteredNumberValue(value);
                                        setErrors(prev => ({
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
                                    focusedField === 'createdAt' &&
                                        styles.selectFocused,
                                ]}
                                onPress={openCreatedDatePicker}>
                                <Text style={styles.selectText}>
                                    {formatDate(createdAtValue)}
                                </Text>
                                <MaterialCommunityIcons
                                    name='calendar-month-outline'
                                    size={18}
                                    color='#666'
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

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
                                        showCategoryMenu &&
                                            styles.selectFocused,
                                        errors.categoryId &&
                                            styles.inputWrapError,
                                    ]}
                                    onPress={() => {
                                        toggleMenu(
                                            showCategoryMenu,
                                            setShowCategoryMenu,
                                        );
                                    }}>
                                    <Text style={styles.selectText}>
                                        {categoryNameValue || 'Chọn loại'}
                                    </Text>
                                    <MaterialCommunityIcons
                                        name='chevron-down'
                                        size={18}
                                        color='#666'
                                    />
                                </TouchableOpacity>
                                {showCategoryMenu &&
                                    renderDropdownMenu({
                                        title: 'Chọn loại tài liệu',
                                        options: categoryDropdownOptions,
                                        searchEnabled: true,
                                        searchPlaceholder:
                                            'Tìm loại tài liệu...',
                                        onSelect: selectCategoryOption,
                                        emptyText: 'Chưa có loại tài liệu',
                                    })}
                            </View>
                            {!!errors.categoryId && (
                                <Text style={styles.fieldError}>
                                    Vui lòng chọn!
                                </Text>
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
                                        showPriorityMenu &&
                                            styles.selectFocused,
                                        errors.priority &&
                                            styles.inputWrapError,
                                    ]}
                                    onPress={() => {
                                        toggleMenu(
                                            showPriorityMenu,
                                            setShowPriorityMenu,
                                        );
                                    }}>
                                    <Text style={styles.selectText}>
                                        {priorityValue
                                            ? DOCUMENT_PRIORITY_LABEL[
                                                  priorityValue
                                              ]
                                            : 'Chọn mức độ'}
                                    </Text>
                                    <MaterialCommunityIcons
                                        name='chevron-down'
                                        size={18}
                                        color='#666'
                                    />
                                </TouchableOpacity>
                                {showPriorityMenu &&
                                    renderDropdownMenu({
                                        title: 'Chọn mức độ ưu tiên',
                                        options: priorityDropdownOptions,
                                        onSelect: selectPriorityOption,
                                    })}
                            </View>
                            {!!errors.priority && (
                                <Text style={styles.fieldError}>
                                    {errors.priority}
                                </Text>
                            )}
                        </View>
                    </View>

                    <View style={styles.receiverRow}>
                        <Text style={styles.receiverLabel}>
                            Bộ phận tiếp nhận:
                        </Text>
                        <Text style={styles.receiverValue}>
                            {receiverLabel}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.uploadSign,
                            errors.mainFiles && styles.inputWrapError,
                        ]}
                        onPress={handlePickMainFiles}>
                        <View style={styles.uploadLeft}>
                            <MaterialCommunityIcons
                                name='file-plus-outline'
                                size={17}
                                color='#333'
                            />
                            <Text style={styles.uploadSignText}>
                                Thêm văn bản trình ký (.pdf)
                            </Text>
                        </View>
                        <MaterialCommunityIcons
                            name='plus'
                            size={20}
                            color='#4CAF50'
                        />
                    </TouchableOpacity>
                    {!!errors.mainFiles && (
                        <Text style={styles.fieldErrorLeft}>
                            {errors.mainFiles}
                        </Text>
                    )}
                    {existingMainFiles.map(file => (
                        <View key={file.fileKey}>
                            <FileRow
                                name={file.originalname}
                                onRemove={
                                    canRemoveExistingMainFile(file)
                                        ? () =>
                                              handleRemoveExistingMainFile(file)
                                        : undefined
                                }
                            />
                        </View>
                    ))}
                    {mainFilesNew.map(file => (
                        <View key={`${file.uri}-${file.name}`}>
                            <FileRow
                                name={file.name}
                                size={file.size}
                                onRemove={() => handleRemoveNewMainFile(file)}
                            />
                        </View>
                    ))}

                    <TouchableOpacity
                        style={[
                            styles.uploadAttach,
                            errors.attachedFiles && styles.inputWrapError,
                        ]}
                        onPress={handlePickAttachedFiles}>
                        <View style={styles.uploadLeft}>
                            <MaterialCommunityIcons
                                name='file-plus-outline'
                                size={17}
                                color='#333'
                            />
                            <Text style={styles.uploadAttachText}>
                                Thêm văn bản đính kèm (.pdf)
                            </Text>
                        </View>
                        <MaterialCommunityIcons
                            name='plus'
                            size={20}
                            color='#FF9800'
                        />
                    </TouchableOpacity>
                    {!!errors.attachedFiles && (
                        <Text style={styles.fieldErrorLeft}>
                            {errors.attachedFiles}
                        </Text>
                    )}
                    {existingAttachedFiles.map(file => (
                        <View key={file.fileKey}>
                            <FileRow
                                name={file.originalname}
                                onRemove={() =>
                                    handleRemoveExistingAttachedFile(file)
                                }
                            />
                        </View>
                    ))}
                    {attachedFilesNew.map(file => (
                        <View key={`${file.uri}-${file.name}`}>
                            <FileRow
                                name={file.name}
                                size={file.size}
                                onRemove={() =>
                                    handleRemoveNewAttachedFile(file)
                                }
                            />
                        </View>
                    ))}

                    <Text style={styles.fieldLabel}>
                        Nội dung văn bản <Text style={styles.required}>*</Text>
                    </Text>
                    <WebEditor
                        editorRef={editorRef}
                        editorReadyRef={editorReadyRef}
                        editorFocusedRef={editorFocusedRef}
                        editorContentRef={editorContentRef}
                        editorContentRequestRef={editorContentRequestRef}
                        shouldMountEditor={shouldMountEditor}
                        isEditorFocused={isEditorFocused}
                        initialEditorHtml={initialEditorHtml}
                        editorCommand={editorCommand}
                        activeFormat={activeFormat}
                        showFormatMenu={showFormatMenu}
                        showColorMenu={showColorMenu}
                        setInitialEditorHtml={setInitialEditorHtml}
                        setIsEditorFocused={setIsEditorFocused}
                        setShowFormatMenu={setShowFormatMenu}
                        setShowColorMenu={setShowColorMenu}
                        sendEditorCommand={sendEditorCommand}
                        toggleFormat={toggleFormat}
                        chooseColor={chooseColor}
                        commitEditorContent={commitEditorContent}
                        scrollFormToEditor={scrollFormToEditor}
                        onFocus={() => {
                            editorFocusedRef.current = true;
                            setIsEditorFocused(true);
                        }}
                        onBlur={() => {
                            editorFocusedRef.current = false;
                            setIsEditorFocused(false);
                        }}
                    />
                </KeyboardAwareScrollView>

                {!hideBottomActions && formMode === 'CREATE' && (
                    <View style={styles.bottomActions}>
                        <TouchableOpacity
                            style={[
                                styles.btnDraft,
                                isFormBusy && {opacity: 0.7},
                            ]}
                            disabled={isFormBusy}
                            onPress={() => submitLayout1(true)}>
                            <Text style={styles.btnDraftText}>
                                {editingId ? 'Cập nhật' : 'Lưu bản nháp'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.btnSubmit,
                                isFormBusy && {opacity: 0.7},
                            ]}
                            disabled={isFormBusy}
                            onPress={() => submitLayout1(false)}>
                            <Text style={styles.btnSubmitText}>
                                Xác nhận gửi
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {!hideBottomActions && formMode === 'LAYOUT_1' && (
                    <View style={styles.bottomActions}>
                        <TouchableOpacity
                            style={[
                                styles.btnDraft,
                                isFormBusy && {opacity: 0.7},
                            ]}
                            disabled={isFormBusy}
                            onPress={() => submitLayout1(true)}>
                            <Text style={styles.btnDraftText}>Cập nhật</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.btnSubmit,
                                isFormBusy && {opacity: 0.7},
                            ]}
                            disabled={isFormBusy}
                            onPress={() => submitLayout1(false)}>
                            <Text style={styles.btnSubmitText}>
                                Xác nhận gửi
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {!hideBottomActions && formMode === 'LAYOUT_3' && (
                    <View style={styles.bottomActionsSingle}>
                        <TouchableOpacity
                            style={[
                                styles.btnSubmitSingle,
                                isFormBusy && {opacity: 0.7},
                            ]}
                            disabled={isFormBusy}
                            onPress={submitLayout3}>
                            <Text style={styles.btnSubmitText}>
                                Xác nhận vào sổ
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {!hideBottomActions && formMode === 'LAYOUT_4' && (
                    <View style={styles.bottomActionsSingle}>
                        <TouchableOpacity
                            style={[
                                styles.btnSubmitSingle,
                                isFormBusy && {opacity: 0.7},
                            ]}
                            disabled={isFormBusy}
                            onPress={submitLayout4}>
                            <Text style={styles.btnSubmitText}>
                                Xác nhận phân công
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
                <DatePickerModal
                    showCreatedDatePicker={showCreatedDatePicker}
                    showFinishedDatePicker={showFinishedDatePicker}
                    datePickerDraft={datePickerDraft}
                    datePickerError={datePickerError}
                    setDatePickerDraft={setDatePickerDraft}
                    setDatePickerError={setDatePickerError}
                    closeDatePicker={closeDatePicker}
                    submitDatePickerDraft={submitDatePickerDraft}
                    applyRelativeDate={applyRelativeDate}
                />
                <Backdrop open={isFormBusy} />
            </View>
        </View>
    );
});

IncomingForm.displayName = 'IncomingForm';

export default IncomingForm;
