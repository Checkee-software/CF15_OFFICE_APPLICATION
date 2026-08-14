import React, { useCallback, useEffect } from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import DeleteModal from '@/utils/Modals/DeleteModal';
import Loading from '@/screens/subscreen/Loading';
import Backdrop from '@/screens/subscreen/Loading/index2';
import { EDocumentPriority, ESignDepartment } from './components/constants';
import WebEditor from '../Document/components/WebEditor';
import OutgoingList, { OutgoingHeaderCreateButton } from './components/OutgoingList';
import OutgoingBaseFields from './components/OutgoingBaseFields';
import OutgoingSignSection from './components/OutgoingSignSection';
import OutgoingFileSection from './components/OutgoingFileSection';
import OutgoingFormActions from './components/OutgoingFormActions';
import { useOutgoingForm } from './hook/useOutgoingForm';
import { applyDepartmentCodeToRegisteredFormat } from '../Outgoing/utils/index';
import styles from './styles';

// Re-using the constants from index.tsx mapping
import { DOCUMENT_PRIORITY_LABEL } from './components/constants';
const priorityData = Object.values(EDocumentPriority).map(priority => ({
    label: DOCUMENT_PRIORITY_LABEL[priority],
    value: priority,
}));

export default function Outgoing({ navigation }: any) {
    const {
        activeFormat,
        approverUserList,
        attachedFilesNew,
        askDeleteDocument,
        cancelDeleteDocument,
        canMutateOutgoing,
        categories,
        chooseColor,
        codeValue,
        confirmDeleteDocument,
        createScrollRef,
        creatorDepartmentCode,
        deletingDocument,
        departmentList,
        documents,
        editingDocument,
        editorCommand,
        editorContent,
        editorContentRequestRef,
        editorContentVersion,
        editorFocusedRef,
        editorReadyRef,
        editorRef,
        errors,
        existingAttachedFiles,
        existingSignedFiles,
        handleCreateOutgoing,
        handleEditorContentChange,
        handlePickAttachedFiles,
        handlePickSignedFiles,
        handleRemoveExistingAttachedFile,
        handleRemoveExistingSignedFile,
        isFetchingDepartments,
        isFetchingSigners,
        isCreating,
        isDepartmentLevel,
        isEditorFocused,
        isKeyboardVisible,
        keyboardHeight,
        isLeaderLevel,
        isLoading,
        isPreparingForm,
        isStationaryLevel,
        levelKey,
        openCreateForm,
        openEditForm,
        priorityValue,
        scrollCreateFormToEditor,
        selectedReceiveDeptName,
        sendEditorCommand,
        setAttachedFilesNew,
        setCodeValue,
        setErrors,
        setIsCreating,
        setIsEditorFocused,
        setPriorityValue,
        selectedApproverUserId,
        selectedCategoryId,
        selectedReceiveDeptId,
        selectedSignerUserId,
        setSelectedApproverUserId,
        setSelectedApproverUserName,
        setSelectedCategoryId,
        setSelectedCategoryName,
        setSelectedReceiveDeptId,
        setSelectedReceiveDeptName,
        setSelectedSignerUserId,
        setSelectedSignerUserName,
        setShowColorMenu,
        setShowFormatMenu,
        setSignedDepartmentValue,
        setSignedFilesNew,
        setTitleValue,
        showColorMenu,
        showFormatMenu,
        signerUserList,
        signedDepartmentValue,
        signedFilesNew,
        titleValue,
        toggleFormat,
        editorContentRef,
        userInfo,
    } = useOutgoingForm();

    const isDirectorLevel = signedDepartmentValue === ESignDepartment.MANAGEMENT;
    const creatorDeptName = userInfo?.departmentName || userInfo?.userType?.department || 'Chưa xác định';

    const renderHeaderCreateButton = useCallback(() => (
        <OutgoingHeaderCreateButton
            canMutateOutgoing={canMutateOutgoing}
            isCreating={isCreating}
            isLoading={isLoading}
            isPreparingForm={isPreparingForm}
            onCreate={openCreateForm}
        />
    ), [canMutateOutgoing, isCreating, isLoading, isPreparingForm, openCreateForm]);

    useEffect(() => {
        if (isCreating) {
            navigation?.setOptions?.({
                headerShown: true,
                title: editingDocument ? 'CẬP NHẬT VĂN BẢN ĐI' : 'TẠO VĂN BẢN ĐI',
                headerRight: () => null,
                headerLeft: () => (
                    <TouchableOpacity
                        onPress={() => setIsCreating(false)}
                        style={{ marginRight: 16 }}
                    >
                        <Feather name="chevron-left" size={24} color="#000" />
                    </TouchableOpacity>
                ),
            });
        } else {
            navigation?.setOptions?.({
                headerShown: true,
                title: 'VĂN BẢN ĐI',
                headerRight: renderHeaderCreateButton,
                headerLeft: () => (
                    <TouchableOpacity
                        onPress={() => navigation?.goBack?.()}
                        style={{ marginRight: 16 }}
                    >
                        <Feather name="chevron-left" size={24} color="#000" />
                    </TouchableOpacity>
                ),
            });
        }
    }, [navigation, isCreating, editingDocument, renderHeaderCreateButton, setIsCreating]);

    if (isLoading && !isCreating && documents.length === 0) {
        return <Loading />;
    }

    if (isCreating) {
        return (
            <View style={styles.container}>
                <View style={styles.createHeader}>
                    <Text style={styles.createTitle}>{editingDocument ? 'Cập nhật văn bản đi' : 'Tạo văn bản đi'}</Text>
                    <TouchableOpacity onPress={() => setIsCreating(false)}>
                        <Text style={styles.createReset}>Đóng lại</Text>
                    </TouchableOpacity>
                </View>

                <KeyboardAwareScrollView
                    ref={createScrollRef}
                    style={styles.createScrollView}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[
                        styles.createScroll,
                        isKeyboardVisible && { paddingBottom: Platform.OS === 'ios' ? keyboardHeight + 16 : 16 },
                    ]}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                    enableOnAndroid={false}
                    enableAutomaticScroll={!isEditorFocused}
                    enableResetScrollToCoords={false}
                    extraScrollHeight={Platform.OS === 'ios' ? 24 : 96}
                >
                    <OutgoingBaseFields
                        titleValue={titleValue}
                        setTitleValue={setTitleValue}
                        categoryId={selectedCategoryId}
                        categories={categories}
                        onCategoryChange={(item: any) => {
                            setSelectedCategoryId(item._id);
                            setSelectedCategoryName(item.name || '');
                            if (item.format) {
                                setCodeValue(applyDepartmentCodeToRegisteredFormat(item.format, creatorDepartmentCode));
                            }
                            setErrors((prev: any) => ({ ...prev, categoryId: undefined, registeredNumber: undefined }));
                        }}
                        priorityValue={priorityValue}
                        priorityData={priorityData}
                        onPriorityChange={(item: any) => {
                            setPriorityValue(item.value);
                            setErrors((prev: any) => ({ ...prev, priority: undefined }));
                        }}
                        codeValue={codeValue}
                        setCodeValue={setCodeValue}
                        errors={errors}
                    />

                    <OutgoingSignSection
                        errors={errors}
                        setErrors={setErrors}
                        signedDepartmentValue={signedDepartmentValue}
                        setSignedDepartmentValue={setSignedDepartmentValue as any}
                        isDirectorLevel={isDirectorLevel}
                        departmentList={departmentList}
                        selectedReceiveDeptId={selectedReceiveDeptId}
                        setSelectedReceiveDeptId={setSelectedReceiveDeptId}
                        setSelectedReceiveDeptName={setSelectedReceiveDeptName}
                        isFetchingDepartments={isFetchingDepartments}
                        signerUserList={signerUserList}
                        selectedSignerUserId={selectedSignerUserId}
                        setSelectedSignerUserId={setSelectedSignerUserId}
                        setSelectedSignerUserName={setSelectedSignerUserName}
                        isFetchingSigners={isFetchingSigners}
                        approverUserList={approverUserList}
                        selectedApproverUserId={selectedApproverUserId}
                        setSelectedApproverUserId={setSelectedApproverUserId}
                        setSelectedApproverUserName={setSelectedApproverUserName}
                    />

                    <OutgoingFileSection
                        creatorDeptName={creatorDeptName}
                        selectedReceiveDeptName={selectedReceiveDeptName}
                        errors={errors}
                        existingSignedFiles={existingSignedFiles}
                        signedFilesNew={signedFilesNew}
                        existingAttachedFiles={existingAttachedFiles}
                        attachedFilesNew={attachedFilesNew}
                        handlePickSignedFiles={handlePickSignedFiles}
                        handleRemoveExistingSignedFile={handleRemoveExistingSignedFile}
                        setSignedFilesNew={setSignedFilesNew}
                        handlePickAttachedFiles={handlePickAttachedFiles}
                        handleRemoveExistingAttachedFile={handleRemoveExistingAttachedFile}
                        setAttachedFilesNew={setAttachedFilesNew}
                    />

                    <Text style={styles.fieldLabel}>Nội dung văn bản <Text style={styles.required}>*</Text></Text>
                    <WebEditor
                        editorRef={editorRef}
                        editorReadyRef={editorReadyRef}
                        editorFocusedRef={editorFocusedRef}
                        editorContentRef={editorContentRef}
                        editorContentRequestRef={editorContentRequestRef}
                        isEditorFocused={isEditorFocused}
                        content={editorContent}
                        contentVersion={editorContentVersion}
                        editorCommand={editorCommand}
                        activeFormat={activeFormat}
                        showFormatMenu={showFormatMenu}
                        showColorMenu={showColorMenu}
                        setIsEditorFocused={setIsEditorFocused}
                        setShowFormatMenu={setShowFormatMenu}
                        setShowColorMenu={setShowColorMenu}
                        sendEditorCommand={sendEditorCommand}
                        toggleFormat={toggleFormat}
                        chooseColor={chooseColor}
                        scrollFormToEditor={scrollCreateFormToEditor}
                        onContentChange={handleEditorContentChange}
                        onFocus={() => {
                            editorFocusedRef.current = true;
                            setIsEditorFocused(true);
                            scrollCreateFormToEditor(Platform.OS === 'ios' ? 80 : 140);
                        }}
                        onBlur={() => {
                            editorFocusedRef.current = false;
                            setIsEditorFocused(false);
                        }}
                        containerStyle={styles.webEditorContainer}
                    />
                </KeyboardAwareScrollView>

                <OutgoingFormActions
                    isLeaderLevel={isLeaderLevel}
                    isDepartmentLevel={isDepartmentLevel}
                    isStationaryLevel={isStationaryLevel}
                    editingDocument={editingDocument}
                    isLoading={isLoading}
                    isKeyboardVisible={isKeyboardVisible}
                    handleCreateOutgoing={handleCreateOutgoing}
                    setIsCreating={setIsCreating}
                />
                <Backdrop open={isLoading || isPreparingForm} />
            </View>
        );
    }

    return (
        <>
            <OutgoingList
                documents={documents}
                levelKey={levelKey}
                canMutateOutgoing={canMutateOutgoing}
                isLoading={isLoading}
                isPreparingForm={isPreparingForm}
                onEdit={openEditForm}
                onDelete={askDeleteDocument}
                onOpenDetail={(item) =>
                    navigation.navigate('DETAILDOCUMENTS', {
                        documentId: item.id,
                        sourceModule: 'outgoingDocument',
                    })
                }
            />
            <DeleteModal
                visible={Boolean(deletingDocument)}
                itemName={deletingDocument?.title || ''}
                itemType="document"
                onCancel={cancelDeleteDocument}
                onConfirm={confirmDeleteDocument}
                isLoading={isLoading}
            />
            <Backdrop open={isLoading || isPreparingForm} />
        </>
    );
}
