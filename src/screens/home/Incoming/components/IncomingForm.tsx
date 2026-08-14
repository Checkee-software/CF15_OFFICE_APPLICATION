import React from 'react';
import { Platform, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Backdrop from '@/screens/subscreen/Loading/index2';
import WebEditor from '../../Document/components/WebEditor';
import DatePickerModal from './DatePickerModal';
import IncomingFormHeader from './IncomingFormHeader';
import IncomingRegisterSection from './IncomingRegisterSection';
import IncomingAssignSection from './IncomingAssignSection';
import IncomingBaseFields from './IncomingBaseFields';
import IncomingFileSection from './IncomingFileSection';
import IncomingFormActions from './IncomingFormActions';
import { useIncomingForm } from '../hooks/useIncomingForm';
import styles from '../styles';

type IncomingFormProps = {
    form: ReturnType<typeof useIncomingForm>;
    onClose: () => void;
};

const IncomingForm = React.memo(({ form, onClose }: IncomingFormProps) => {
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

    return (
        <View style={styles.container}>
            <View style={styles.flexOne}>
                <IncomingFormHeader formMode={formMode} onClose={onClose} />

                <KeyboardAwareScrollView
                    ref={formScrollRef}
                    enableOnAndroid={false}
                    enableAutomaticScroll={isKeyboardVisible && !isEditorFocused}
                    extraScrollHeight={96}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                    onScrollBeginDrag={dismissKeyboardAndMenus}
                    contentContainerStyle={[
                        styles.createScroll,
                        isKeyboardVisible && {
                            paddingBottom:
                                Platform.OS === 'ios' ? keyboardHeight + 16 : 16,
                        },
                    ]}>

                    {showRegisterSection && (
                        <IncomingRegisterSection
                            destinationPathLabel={destinationPathLabel}
                            destinationCategoryHint={destinationCategoryHint}
                            destinationLevelOptions={destinationLevelOptions}
                            destinationSelectionIds={destinationSelectionIds}
                            destinationDropdownOptions={destinationDropdownOptions}
                            showDestinationLevel={showDestinationLevel}
                            isLoadingDestinationOptions={isLoadingDestinationOptions}
                            errors={errors}
                            resetMenus={resetMenus}
                            toggleDestinationMenu={toggleDestinationMenu}
                            selectDestinationOption={selectDestinationOption}
                        />
                    )}

                    {showAssignSection && (
                        <IncomingAssignSection
                            isLayout4={isLayout4}
                            isLoadingAssignmentOptions={isLoadingAssignmentOptions}
                            errors={errors}
                            showLeadDepartmentMenu={showLeadDepartmentMenu}
                            showReceiveMenu={showReceiveMenu}
                            showSupportDepartmentMenu={showSupportDepartmentMenu}
                            selectedLeadDepartmentName={selectedLeadDepartmentName}
                            selectedReceiveToKnowText={selectedReceiveToKnowText}
                            selectedSupportDepartmentText={selectedSupportDepartmentText}
                            leadDepartmentDropdownOptions={leadDepartmentDropdownOptions}
                            receiveDropdownOptions={receiveDropdownOptions}
                            supportDepartmentDropdownOptions={supportDepartmentDropdownOptions}
                            receiveToKnowIds={receiveToKnowIds}
                            supportDepartmentIds={supportDepartmentIds}
                            finishedAtDisplay={finishedAtDisplay}
                            focusedField={focusedField}
                            resetMenus={resetMenus}
                            openFinishedDatePicker={openFinishedDatePicker}
                            toggleMenu={toggleMenu}
                            setShowLeadDepartmentMenu={setShowLeadDepartmentMenu}
                            setShowReceiveMenu={setShowReceiveMenu}
                            setShowSupportDepartmentMenu={setShowSupportDepartmentMenu}
                            selectLeadDepartmentOption={selectLeadDepartmentOption}
                            toggleReceiveToKnowOption={toggleReceiveToKnowOption}
                            toggleSupportDepartmentOption={toggleSupportDepartmentOption}
                        />
                    )}

                    <IncomingBaseFields
                        titleValue={titleValue}
                        organizationValue={organizationValue}
                        senderValue={senderValue}
                        registeredNumberValue={registeredNumberValue}
                        createdAtValue={createdAtValue}
                        categoryNameValue={categoryNameValue}
                        priorityValue={priorityValue}
                        showCategoryMenu={showCategoryMenu}
                        showPriorityMenu={showPriorityMenu}
                        categoryDropdownOptions={categoryDropdownOptions}
                        priorityDropdownOptions={priorityDropdownOptions}
                        errors={errors}
                        focusedField={focusedField}
                        titleInputRef={titleInputRef}
                        organizationInputRef={organizationInputRef}
                        senderInputRef={senderInputRef}
                        registeredNumberInputRef={registeredNumberInputRef}
                        resetMenus={resetMenus}
                        handleInputFocus={handleInputFocus}
                        setFocusedField={setFocusedField}
                        setTitleValue={setTitleValue}
                        setOrganizationValue={setOrganizationValue}
                        setSenderValue={setSenderValue}
                        setRegisteredNumberValue={setRegisteredNumberValue}
                        setErrors={setErrors}
                        setShowCategoryMenu={setShowCategoryMenu}
                        setShowPriorityMenu={setShowPriorityMenu}
                        openCreatedDatePicker={openCreatedDatePicker}
                        selectCategoryOption={selectCategoryOption}
                        selectPriorityOption={selectPriorityOption}
                        toggleMenu={toggleMenu}
                    />

                    <IncomingFileSection
                        receiverLabel="Ban giám đốc"
                        errors={errors}
                        existingMainFiles={existingMainFiles}
                        mainFilesNew={mainFilesNew}
                        existingAttachedFiles={existingAttachedFiles}
                        attachedFilesNew={attachedFilesNew}
                        canRemoveExistingMainFile={canRemoveExistingMainFile}
                        handlePickMainFiles={handlePickMainFiles}
                        handleRemoveExistingMainFile={handleRemoveExistingMainFile}
                        handleRemoveNewMainFile={handleRemoveNewMainFile}
                        handlePickAttachedFiles={handlePickAttachedFiles}
                        handleRemoveExistingAttachedFile={handleRemoveExistingAttachedFile}
                        handleRemoveNewAttachedFile={handleRemoveNewAttachedFile}
                    />

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

                <IncomingFormActions
                    formMode={formMode}
                    isFormBusy={isFormBusy}
                    isKeyboardVisible={isKeyboardVisible}
                    isEditorFocused={isEditorFocused}
                    editingId={editingId}
                    submitLayout1={submitLayout1}
                    submitLayout3={submitLayout3}
                    submitLayout4={submitLayout4}
                />

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
