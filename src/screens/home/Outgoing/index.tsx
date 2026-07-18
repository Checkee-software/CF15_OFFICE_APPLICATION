import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import DeleteModal from '@/utils/Modals/DeleteModal';
import Loading from '@/screens/subscreen/Loading';
import Backdrop from '@/screens/subscreen/Loading/index2';
import {
  DOCUMENT_PRIORITY_LABEL,
  EDocumentPriority,
  ESignDepartment,
} from './components/constants';
import WebEditor from '../Document/components/WebEditor';
import OutgoingList, { OutgoingHeaderCreateButton } from './components/OutgoingList';
import styles from './styles';
import { useOutgoingForm } from './hook/useOutgoingForm';
import { applyDepartmentCodeToRegisteredFormat } from '../Outgoing/utils/index';
import { formatFileSize } from '../Document/utils/documentHelpers';
import { Dropdown } from 'react-native-element-dropdown';

const priorityData = Object.values(EDocumentPriority).map(priority => ({
  label: DOCUMENT_PRIORITY_LABEL[priority],
  value: priority,
}));

const renderPickedFileRow = (name: string, size?: number, onRemove?: () => void) => (
  <View style={styles.fileRow}>
    <View style={styles.fileLeft}>
      <MaterialCommunityIcons name="file-pdf-box" size={18} color="#FF5252" />
      <Text style={styles.fileName} numberOfLines={1}>{name}</Text>
    </View>
    <View style={styles.fileRight}>
      <Text style={styles.fileSize}>{formatFileSize(size)}</Text>
      {onRemove ? (
        <TouchableOpacity onPress={onRemove}>
          <MaterialCommunityIcons name="close" size={18} color="#9A9A9A" />
        </TouchableOpacity>
      ) : null}
    </View>
  </View>
);

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
    selectedApproverUserName,
    selectedCategoryName,
    selectedReceiveDeptName,
    selectedSignerUserName,
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
  }, [navigation, isCreating, editingDocument, renderHeaderCreateButton]);

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
          <Text style={styles.fieldLabel}>Tiêu đề tài liệu <Text style={styles.required}>*</Text></Text>
          <View style={[styles.inputWrap, errors.title && styles.inputWrapError]}>
            <TextInput style={styles.input} placeholder="Nhập nội dung" placeholderTextColor="#A0A0A0" value={titleValue} onChangeText={setTitleValue} />
          </View>
          {!!errors.title && <Text style={styles.fieldError}>Bắt buộc!</Text>}

          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.fieldLabel}>Loại tài liệu <Text style={styles.required}>*</Text></Text>
              <Dropdown
                style={[styles.select, errors.categoryId && styles.inputWrapError]}
                placeholderStyle={styles.selectText}
                selectedTextStyle={[styles.selectText, { color: '#222' }]}
                containerStyle={styles.dropdownMenuContainer}
                activeColor="#EBF3FC"
                data={categories}
                labelField="name"
                valueField="_id"
                placeholder="Chọn loại"
                value={selectedCategoryId}
                onChange={item => {
                  setSelectedCategoryId(item._id);
                  setSelectedCategoryName(item.name || '');
                  if (item.format) {
                    setCodeValue(applyDepartmentCodeToRegisteredFormat(item.format, creatorDepartmentCode));
                  }
                  setErrors(prev => ({ ...prev, categoryId: undefined, registeredNumber: undefined }));
                }}
                renderItem={item => (
                  <View style={styles.dropdownItem}>
                    <Text style={styles.dropdownItemText}>{item.name} ({item.code})</Text>
                  </View>
                )}
                maxHeight={220}
              />
              {!!errors.categoryId && <Text style={styles.fieldError}>Vui lòng chọn!</Text>}
            </View>
            <View style={styles.half}>
              <Text style={styles.fieldLabel}>Mức độ ưu tiên <Text style={styles.required}>*</Text></Text>
              <Dropdown
                style={[styles.select, errors.priority && styles.inputWrapError]}
                placeholderStyle={styles.selectText}
                selectedTextStyle={[styles.selectText, { color: '#222' }]}
                containerStyle={styles.dropdownMenuContainer}
                activeColor="#EBF3FC"
                data={priorityData}
                labelField="label"
                valueField="value"
                placeholder="Chọn mức độ"
                value={priorityValue}
                onChange={item => {
                  setPriorityValue(item.value);
                  setErrors(prev => ({ ...prev, priority: undefined }));
                }}
                renderItem={item => (
                  <View style={styles.dropdownItem}>
                    <Text style={styles.dropdownItemText}>{item.label}</Text>
                  </View>
                )}
                maxHeight={220}
              />
              {!!errors.priority && <Text style={styles.fieldError}>{errors.priority}</Text>}
            </View>
          </View>

          <Text style={styles.fieldLabel}>Số hiệu văn bản <Text style={styles.required}>*</Text></Text>
          <View style={[styles.inputWrapMultiline, errors.registeredNumber && styles.inputWrapError]}>
            <TextInput
              style={styles.inputMultiline}
              placeholder={`Số thứ tự (số thứ tự theo năm) + loại tài liệu "-" hoặc "/" + cơ quan soạn thảo vb`}
              placeholderTextColor="#A0A0A0"
              value={codeValue}
              onChangeText={setCodeValue}
              multiline
              numberOfLines={3}
            />
          </View>
          {!!errors.registeredNumber && <Text style={styles.fieldError}>Bắt buộc!</Text>}

          {/* Bộ phận ký duyệt - Radio buttons */}
          <Text style={[styles.fieldLabel, { marginTop: 10 }]}>Bộ phận ký duyệt <Text style={styles.required}>*</Text></Text>
          <View style={styles.radioRow}>
            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => {
                setSignedDepartmentValue(ESignDepartment.DEPARTMENT);
                setErrors(prev => ({ ...prev, signedDepartment: undefined }));
              }}
            >
              <View style={[styles.radioOuter, signedDepartmentValue === ESignDepartment.DEPARTMENT && styles.radioOuterActive]}>
                {signedDepartmentValue === ESignDepartment.DEPARTMENT && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.radioLabel}>Phòng ban</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => {
                setSignedDepartmentValue(ESignDepartment.MANAGEMENT);
                setErrors(prev => ({ ...prev, signedDepartment: undefined }));
              }}
            >
              <View style={[styles.radioOuter, signedDepartmentValue === ESignDepartment.MANAGEMENT && styles.radioOuterActive]}>
                {signedDepartmentValue === ESignDepartment.MANAGEMENT && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.radioLabel}>Ban giám đốc</Text>
            </TouchableOpacity>
          </View>
          {!!errors.signedDepartment && <Text style={styles.fieldErrorLeft}>{errors.signedDepartment}</Text>}

          {/* Bộ phận tiếp nhận + Người ký / Người ký nháy */}
          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.fieldLabel}>
                {isDirectorLevel ? 'Phòng ban tiếp nhận' : 'Bộ phận tiếp nhận'}
                {' '}<Text style={styles.required}>*</Text>
              </Text>
              <Dropdown
                style={styles.select}
                placeholderStyle={styles.selectText}
                selectedTextStyle={[styles.selectText, { color: '#222' }]}
                containerStyle={styles.dropdownMenuContainer}
                activeColor="#EBF3FC"
                data={departmentList}
                labelField="name"
                valueField="_id"
                placeholder="Chọn bộ phận"
                value={selectedReceiveDeptId}
                onChange={item => {
                  setSelectedReceiveDeptId(item._id);
                  setSelectedReceiveDeptName(item.name);
                }}
                renderItem={item => (
                  <View style={styles.dropdownItem}>
                    <Text style={styles.dropdownItemText}>{item.name}</Text>
                  </View>
                )}
                maxHeight={220}
                flatListProps={{
                  ListEmptyComponent: isFetchingDepartments ? (
                    <ActivityIndicator size="small" color="#1E88E5" style={{ padding: 12 }} />
                  ) : (
                    <Text style={[styles.dropdownItemText, { paddingHorizontal: 12, paddingVertical: 10, color: '#A0A0A0' }]}>Chưa có dữ liệu</Text>
                  ),
                }}
              />
            </View>
            <View style={styles.half}>
              <Text style={styles.fieldLabel}>
                {isDirectorLevel ? 'Người ký nháy' : 'Người ký'}
                {' '}<Text style={styles.required}>*</Text>
              </Text>
              <Dropdown
                style={styles.select}
                placeholderStyle={styles.selectText}
                selectedTextStyle={[styles.selectText, { color: '#222' }]}
                containerStyle={styles.dropdownMenuContainer}
                activeColor="#EBF3FC"
                data={signerUserList}
                labelField="fullName"
                valueField="_id"
                placeholder="Chọn người ký"
                value={selectedSignerUserId}
                onChange={item => {
                  setSelectedSignerUserId(item._id);
                  setSelectedSignerUserName(item.fullName);
                }}
                renderItem={item => (
                  <View style={styles.dropdownItem}>
                    <Text style={styles.dropdownItemText}>{item.fullName}</Text>
                  </View>
                )}
                maxHeight={220}
                flatListProps={{
                  ListEmptyComponent: isFetchingSigners ? (
                    <ActivityIndicator size="small" color="#4CAF50" style={{ padding: 12 }} />
                  ) : (
                    <Text style={[styles.dropdownItemText, { paddingHorizontal: 12, paddingVertical: 10, color: '#A0A0A0' }]}>Chưa có dữ liệu</Text>
                  ),
                }}
              />
            </View>
          </View>

          {/* Thêm trường Ban giám đốc ký duyệt khi chọn Ban giám đốc */}
          {isDirectorLevel && (
            <View style={[styles.fullDropdownWrap, { marginTop: 4 }]}>
              <Text style={styles.fieldLabel}>Ban giám đốc ký duyệt <Text style={styles.required}>*</Text></Text>
              <Dropdown
                style={styles.select}
                placeholderStyle={styles.selectText}
                selectedTextStyle={[styles.selectText, { color: '#222' }]}
                containerStyle={styles.dropdownMenuContainer}
                activeColor="#EBF3FC"
                data={approverUserList}
                labelField="fullName"
                valueField="_id"
                placeholder="Chọn ban giám đốc ký duyệt"
                value={selectedApproverUserId}
                onChange={item => {
                  setSelectedApproverUserId(item._id);
                  setSelectedApproverUserName(item.fullName);
                }}
                renderItem={item => (
                  <View style={styles.dropdownItem}>
                    <Text style={styles.dropdownItemText}>{item.fullName}</Text>
                  </View>
                )}
                maxHeight={220}
                flatListProps={{
                  ListEmptyComponent: isFetchingSigners ? (
                    <ActivityIndicator size="small" color="#4CAF50" style={{ padding: 12 }} />
                  ) : (
                    <Text style={[styles.dropdownItemText, { paddingHorizontal: 12, paddingVertical: 10, color: '#A0A0A0' }]}>Chưa có dữ liệu</Text>
                  ),
                }}
              />
            </View>
          )}

          {/* Bộ phận tiếp nhận info */}
          <View style={styles.receiverRow}>
            <Text style={styles.receiverLabel}>Bộ phận tiếp nhận:</Text>
            <Text style={styles.receiverValue}>{selectedReceiveDeptName || creatorDeptName}</Text>
          </View>

          <TouchableOpacity style={[styles.uploadSign, errors.signedFiles && styles.inputWrapError]} onPress={handlePickSignedFiles}>
            <View style={styles.uploadLeft}>
              <MaterialCommunityIcons name="file-plus-outline" size={17} color="#333" />
              <Text style={styles.uploadSignText}>Thêm văn bản trình ký (.pdf)</Text>
            </View>
            <MaterialCommunityIcons name="plus" size={20} color="#4CAF50" />
          </TouchableOpacity>
          {!!errors.signedFiles && <Text style={styles.fieldErrorLeft}>{errors.signedFiles}</Text>}
          {existingSignedFiles.map(file => (
            <View key={file.fileKey}>
              {renderPickedFileRow(file.originalname, undefined, () => handleRemoveExistingSignedFile(file))}
            </View>
          ))}
          {signedFilesNew.map(file => (
            <View key={`${file.uri}-${file.name}`}>
              {renderPickedFileRow(file.name, file.size, () => setSignedFilesNew(prev => prev.filter(i => i.uri !== file.uri)))}
            </View>
          ))}

          <TouchableOpacity style={styles.uploadAttach} onPress={handlePickAttachedFiles}>
            <View style={styles.uploadLeft}>
              <MaterialCommunityIcons name="file-plus-outline" size={17} color="#333" />
              <Text style={styles.uploadAttachText}>
                {attachedFilesNew.length > 0 ? `Đã chọn ${attachedFilesNew.length} file đính kèm` : 'Thêm văn bản đính kèm (.pdf)'}
              </Text>
            </View>
            <MaterialCommunityIcons name="plus" size={20} color="#FF9800" />
          </TouchableOpacity>
          {existingAttachedFiles.map(file => (
            <View key={file.fileKey}>
              {renderPickedFileRow(file.originalname, undefined, () => handleRemoveExistingAttachedFile(file))}
            </View>
          ))}
          {attachedFilesNew.map(file => (
            <View key={`${file.uri}-${file.name}`}>
              {renderPickedFileRow(file.name, file.size, () => setAttachedFilesNew(prev => prev.filter(i => i.uri !== file.uri)))}
            </View>
          ))}

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

        {!isKeyboardVisible && (
        <View style={styles.bottomActions}>
          {(isLeaderLevel || isDepartmentLevel || isStationaryLevel) && !editingDocument ? (
            <TouchableOpacity style={[styles.btnDraft, isLoading && styles.formActionDisabled]} disabled={isLoading} onPress={() => handleCreateOutgoing('DRAFT')}>
              <Text style={styles.btnDraftText}>Lưu bản nháp</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.btnDraft, isLoading && styles.formActionDisabled]} disabled={isLoading} onPress={() => setIsCreating(false)}>
              <Text style={styles.btnDraftText}>Đóng</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.btnSubmit, isLoading && styles.formActionDisabled]} disabled={isLoading} onPress={() => handleCreateOutgoing('SENDING')}>
            <Text style={styles.btnSubmitText}>{editingDocument ? 'Cập nhật & gửi' : 'Xác nhận gửi'}</Text>
          </TouchableOpacity>
        </View>
        )}
        </KeyboardAwareScrollView>
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
