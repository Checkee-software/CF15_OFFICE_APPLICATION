import React, { useCallback, useEffect } from 'react';
import { Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import DeleteModal from '@/utils/Modals/DeleteModal';
import Loading from '@/screens/subscreen/Loading';
import Backdrop from '@/screens/subscreen/Loading/index2';
import {
  DOCUMENT_PRIORITY_LABEL,
  EDocumentPriority,
  ESignDepartment,
  SIGN_DEPARTMENT_LABEL,
} from './components/constants';
import OutgoingEditor from './components/OutgoingEditor';
import OutgoingList, { OutgoingHeaderCreateButton } from './components/OutgoingList';
import styles from './styles';
import { useOutgoingForm } from './hook/useOutgoingForm';
import { applyDepartmentCodeToRegisteredFormat } from '../Outgoing/utils/index';

const formatFileSize = (size?: number) => {
  if (!size || size <= 0) { return '-'; }
  if (size >= 1024 * 1024) { return `${(size / (1024 * 1024)).toFixed(1)} mb`; }
  return `${(size / 1024).toFixed(1)} kb`;
};

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
    documents,
    editingDocument,
    editorCommand,
    editorContent,
    editorContentVersion,
    editorFocusedRef,
    errors,
    existingAttachedFiles,
    existingSignedFiles,
    handleCreateOutgoing,
    handleEditorContentChange,
    handlePickAttachedFiles,
    handlePickSignedFiles,
    handleRemoveExistingAttachedFile,
    handleRemoveExistingSignedFile,
    isCreating,
    isDepartmentLevel,
    isEditorFocused,
    isKeyboardVisible,
    isLeaderLevel,
    isLoading,
    isPreparingForm,
    isStationaryLevel,
    levelKey,
    openCreateForm,
    openEditForm,
    priorityValue,
    scrollCreateFormToEditor,
    selectedCategoryName,
    sendEditorCommand,
    setAttachedFilesNew,
    setCodeValue,
    setErrors,
    setIsCreating,
    setIsEditorFocused,
    setPriorityValue,
    setSelectedCategoryId,
    setSelectedCategoryName,
    setShowCategoryMenu,
    setShowColorMenu,
    setShowFormatMenu,
    setShowPriorityMenu,
    setShowSignDepartmentMenu,
    setSignedDepartmentValue,
    setSignedFilesNew,
    setTitleValue,
    showCategoryMenu,
    showColorMenu,
    showFormatMenu,
    showPriorityMenu,
    showSignDepartmentMenu,
    signedDepartmentValue,
    signedFilesNew,
    titleValue,
    toggleFormat,
  } = useOutgoingForm();

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
    navigation?.setOptions?.({
      headerShown: true,
      title: 'VĂN BẢN ĐI',
      headerRight: renderHeaderCreateButton,
    });
  }, [navigation, renderHeaderCreateButton]);

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
          contentContainerStyle={[styles.createScroll, isKeyboardVisible && styles.createScrollKeyboard]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          enableOnAndroid
          enableAutomaticScroll
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
              <TouchableOpacity style={[styles.select, errors.categoryId && styles.inputWrapError]} onPress={() => setShowCategoryMenu(prev => !prev)}>
                <Text style={styles.selectText}>{selectedCategoryName || 'Chọn loại'}</Text>
                <MaterialCommunityIcons name="chevron-down" size={18} color="#666" />
              </TouchableOpacity>
              {showCategoryMenu && (
                <View style={styles.dropdownMenu}>
                  {categories.map(category => (
                    <TouchableOpacity
                      key={category._id}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedCategoryId(category._id);
                        setSelectedCategoryName(category.name || '');
                        if (category.format) {
                          setCodeValue(applyDepartmentCodeToRegisteredFormat(category.format, creatorDepartmentCode));
                        }
                        setErrors(prev => ({ ...prev, categoryId: undefined, registeredNumber: undefined }));
                        setShowCategoryMenu(false);
                      }}>
                      <Text style={styles.dropdownItemText}>{category.name} ({category.code})</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {!!errors.categoryId && <Text style={styles.fieldError}>Vui lòng chọn!</Text>}
            </View>
            <View style={styles.half}>
              <Text style={styles.fieldLabel}>Mức độ ưu tiên <Text style={styles.required}>*</Text></Text>
              <TouchableOpacity style={styles.select} onPress={() => setShowPriorityMenu(prev => !prev)}>
                <Text style={styles.selectText}>
                  {priorityValue ? DOCUMENT_PRIORITY_LABEL[priorityValue] : 'Chọn mức độ'}
                </Text>
                <MaterialCommunityIcons name="chevron-down" size={18} color="#666" />
              </TouchableOpacity>
              {showPriorityMenu && (
                <View style={styles.dropdownMenu}>
                  {Object.values(EDocumentPriority).map(priority => (
                    <TouchableOpacity
                      key={priority}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setPriorityValue(priority);
                        setShowPriorityMenu(false);
                        setErrors(prev => ({ ...prev, priority: undefined }));
                      }}>
                      <Text style={styles.dropdownItemText}>{DOCUMENT_PRIORITY_LABEL[priority]}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {!!errors.priority && <Text style={styles.fieldError}>{errors.priority}</Text>}
            </View>
          </View>

          <Text style={styles.fieldLabel}>Số hiệu văn bản <Text style={styles.required}>*</Text></Text>
          <View style={[styles.inputWrap, errors.registeredNumber && styles.inputWrapError]}>
            <TextInput style={styles.input} placeholder="Nhập số hiệu" placeholderTextColor="#A0A0A0" value={codeValue} onChangeText={setCodeValue} />
          </View>
          {!!errors.registeredNumber && <Text style={styles.fieldError}>Bắt buộc!</Text>}

          <View style={styles.fullDropdownWrap}>
            <Text style={styles.fieldLabel}>Bộ phận ký duyệt <Text style={styles.required}>*</Text></Text>
            <TouchableOpacity style={styles.select} onPress={() => setShowSignDepartmentMenu(prev => !prev)}>
              <Text style={styles.selectText}>
                {signedDepartmentValue ? SIGN_DEPARTMENT_LABEL[signedDepartmentValue] : 'Chọn bộ phận ký duyệt'}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={18} color="#666" />
            </TouchableOpacity>
            {showSignDepartmentMenu && (
              <View style={styles.dropdownMenu}>
                {Object.values(ESignDepartment).map(dept => (
                  <TouchableOpacity
                    key={dept}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSignedDepartmentValue(dept);
                      setShowSignDepartmentMenu(false);
                      setErrors(prev => ({ ...prev, signedDepartment: undefined }));
                    }}>
                    <Text style={styles.dropdownItemText}>{SIGN_DEPARTMENT_LABEL[dept]}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {!!errors.signedDepartment && <Text style={styles.fieldError}>{errors.signedDepartment}</Text>}
          </View>

          <View style={styles.receiverRow}>
            <Text style={styles.receiverLabel}>Bộ phận tiếp nhận:</Text>
            <Text style={styles.receiverValue}>Phòng kế toán</Text>
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


        <View style={styles.editorContainer}>
          <View style={styles.editorToolbar}>
            <TouchableOpacity style={styles.toolbarIconBtn} onPress={() => sendEditorCommand('undo')}>
              <MaterialCommunityIcons name="undo-variant" size={18} color="#3D495A" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.toolbarIconBtn} onPress={() => sendEditorCommand('redo')}>
              <MaterialCommunityIcons name="redo-variant" size={18} color="#3D495A" />
            </TouchableOpacity>

            <View style={styles.toolbarDivider} />

            <TouchableOpacity style={styles.toolbarDropdown} onPress={() => {

              setShowColorMenu(false);
              setShowFormatMenu(!showFormatMenu);
            }}>
              <Text style={styles.toolbarDropdownText}>{activeFormat}</Text>
              <MaterialCommunityIcons name="chevron-down" size={16} color="#7C8797" />
            </TouchableOpacity>

            <View style={styles.toolbarSpacer} />

            <TouchableOpacity onPress={() => sendEditorCommand('bold')}>
              <Text style={styles.toolbarStrong}>B</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => sendEditorCommand('italic')}>
              <Text style={styles.toolbarItalic}>I</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.toolbarAButton} onPress={() => {
              setShowFormatMenu(false);
              setShowColorMenu(!showColorMenu);
            }}>
              <Text style={styles.toolbarUnderline}>A</Text>
              <MaterialCommunityIcons name="chevron-down" size={14} color="#7C8797" />
            </TouchableOpacity>
          </View>

          {showFormatMenu && (
            <View style={styles.menuBox}>
              <TouchableOpacity style={styles.menuItem} onPress={() => toggleFormat('Paragraph')}>
                <Text style={styles.menuText}>Paragraph</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => toggleFormat('H1')}>
                <Text style={styles.menuText}>Heading 1</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => toggleFormat('H2')}>
                <Text style={styles.menuText}>Heading 2</Text>
              </TouchableOpacity>
            </View>
          )}

          {showColorMenu && (
            <View style={styles.colorMenu}>
              {['#111827', '#374151', '#6B7280', '#1E88E5', '#1976D2', '#0EA5E9', '#43A047', '#22C55E', '#84CC16', '#F59E0B', '#F4511E', '#DC2626', '#D81B60', '#8E24AA', '#7C3AED', '#0F766E', '#0891B2', '#334155', '#000000', '#94A3B8', '#06B6D4', '#2563EB', '#65A30D', '#EAB308', '#EA580C', '#EF4444', '#EC4899', '#A855F7', '#14B8A6'].map(color => (
                <TouchableOpacity
                  key={color}
                  style={[styles.colorDot, { backgroundColor: color }]}
                  onPress={() => chooseColor(color)}
                />
              ))}
            </View>
          )}

          <View style={styles.editorBody}>
            <OutgoingEditor
              content={editorContent}
              contentVersion={editorContentVersion}
              command={editorCommand}
              scrollEnabled={isEditorFocused}
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
            />
          </View>
        </View>

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
