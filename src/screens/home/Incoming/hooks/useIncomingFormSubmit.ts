import React, { useCallback, useRef } from 'react';
import { Keyboard } from 'react-native';
import { useDocumentStore } from '@/stores/documentStore';
import { useDocumentCategoryStore } from '@/zustand/useDocumentCategoryStore';
import { EDocumentPriority, EDocumentStatus } from '@/shared-types/common/Document/document';
import { IDocument } from '@/shared-types/Response/DocumentResponse/DocumentResponse';
import {
  isObjectId,
  buildCategoryPath,
  buildCategoryById,
  inferFormMode,
  normalizeDateInput,
  todayIsoDate,
  formatDate,
  dedupeExistingFiles,
  normalizeExistingFile,
  getEntityId,
  getEntityName,
  normalizePrimitive,
  normalizeObjectIdList,
  joinEntityNames,
  type TFormMode,
  type TFocusableIncomingField,
} from '../utils';
import {
  loadIncomingAssignmentOptions,
  getStoredAssignmentDraft,
  saveStoredAssignmentDraft,
  removeStoredAssignmentDraft,
} from '../utils/assignmentStorage';

export const useIncomingFormSubmit = (
  state: {
    showForm: boolean;
    setShowForm: React.Dispatch<React.SetStateAction<boolean>>;
    formMode: TFormMode;
    setFormMode: React.Dispatch<React.SetStateAction<TFormMode>>;
    editingId: string | null;
    setEditingId: React.Dispatch<React.SetStateAction<string | null>>;
    isPreparingForm: boolean;
    setIsPreparingForm: React.Dispatch<React.SetStateAction<boolean>>;
    isSubmittingForm: boolean;
    setIsSubmittingForm: React.Dispatch<React.SetStateAction<boolean>>;
    titleValue: string;
    setTitleValue: React.Dispatch<React.SetStateAction<string>>;
    organizationValue: string;
    setOrganizationValue: React.Dispatch<React.SetStateAction<string>>;
    senderValue: string;
    setSenderValue: React.Dispatch<React.SetStateAction<string>>;
    registeredNumberValue: string;
    setRegisteredNumberValue: React.Dispatch<React.SetStateAction<string>>;
    categoryIdValue: string;
    setCategoryIdValue: React.Dispatch<React.SetStateAction<string>>;
    categoryNameValue: string;
    setCategoryNameValue: React.Dispatch<React.SetStateAction<string>>;
    priorityValue: EDocumentPriority | '';
    setPriorityValue: React.Dispatch<React.SetStateAction<EDocumentPriority | ''>>;
    focusedField: TFocusableIncomingField | null;
    setFocusedField: React.Dispatch<React.SetStateAction<TFocusableIncomingField | null>>;
    errors: any;
    setErrors: React.Dispatch<React.SetStateAction<any>>;
    isStationary: boolean;
  },
  filesHook: any,
  editorHook: any,
  datePickerHook: any,
  assignmentHook: any,
  deleteHook: any,
  ensureIncomingCategoryList: () => Promise<void>,
  resetMenus: () => void,
) => {
  const {
    getListDocument,
    getDocumentDetail,
    createIncomingDocument,
    updateIncomingDraft,
    registerIncomingDocument,
    assignIncomingDocument,
  } = useDocumentStore();

  const startEditLockRef = useRef(false);
  const submitLayout4LockRef = useRef(false);

  const resetForm = useCallback(() => {
    state.setEditingId(null);
    state.setFormMode('CREATE');
    state.setTitleValue('');
    state.setOrganizationValue('');
    state.setSenderValue('');
    state.setRegisteredNumberValue('');
    state.setCategoryIdValue('');
    state.setCategoryNameValue('');
    state.setPriorityValue('');
    editorHook.resetEditor();
    filesHook.resetFiles();
    datePickerHook.resetDatePicker();
    assignmentHook.resetAssignment();
    deleteHook.resetDeleteState();
    startEditLockRef.current = false;
    submitLayout4LockRef.current = false;
    state.setIsSubmittingForm(false);
    state.setFocusedField(null);
    state.setErrors({});
    resetMenus();
  }, [state, editorHook, filesHook, datePickerHook, assignmentHook, deleteHook, resetMenus]);

  const openCreateForm = useCallback(() => {
    if (state.isPreparingForm) return;
    resetForm();
    state.setFormMode('CREATE');
    ensureIncomingCategoryList();
    state.setShowForm(true);
  }, [ensureIncomingCategoryList, state, resetForm]);

  const startEdit = async (id: string, forcedMode?: Exclude<TFormMode, 'CREATE'>) => {
    if (state.isPreparingForm || startEditLockRef.current) {
      return;
    }
    resetForm();
    startEditLockRef.current = true;
    state.setEditingId(id);
    state.setFormMode(forcedMode || 'LAYOUT_1');
    state.setIsPreparingForm(true);
    try {
      let latestCategoryById = assignmentHook.categoryById;
      const detailPromise = getDocumentDetail(id);
      const assignmentOptionsPromise = loadIncomingAssignmentOptions().catch(() => undefined);
      const categoryPromise = Object.keys(latestCategoryById).length === 0
        ? ensureIncomingCategoryList().catch(() => undefined)
        : Promise.resolve();

      const detail = await detailPromise;
      if (!detail) {
        state.setShowForm(false);
        resetForm();
        return;
      }
      const sourceDocRaw: IDocument | { document?: IDocument | null } | null =
        (detail as IDocument | { document?: IDocument | null } | null) || null;
      const doc =
        sourceDocRaw &&
          typeof sourceDocRaw === 'object' &&
          'document' in sourceDocRaw &&
          sourceDocRaw.document &&
          typeof sourceDocRaw.document === 'object'
          ? sourceDocRaw.document
          : (sourceDocRaw as IDocument);
      const mode = forcedMode || inferFormMode(doc, state.isStationary);
      assignmentOptionsPromise.then(snapshot => {
        if (snapshot) {
          assignmentHook.setDirectoryUsers(snapshot.users);
          assignmentHook.setDepartmentOptions(snapshot.departments);
        }
      });

      if (mode !== 'LAYOUT_4') {
        await categoryPromise;
      }
      const numberingCategoryById = buildCategoryById(useDocumentCategoryStore.getState().categories);
      if (Object.keys(numberingCategoryById).length > 0) {
        latestCategoryById = numberingCategoryById;
      }

      state.setEditingId(id);
      state.setFormMode(mode);
      state.setTitleValue((doc.title || '').trimStart());
      state.setOrganizationValue((doc.organization || '').trimStart());
      state.setSenderValue((doc.sender || '').trimStart());
      state.setRegisteredNumberValue((doc.registeredNumber || '').trimStart());
      const sourceStartAt = (doc as any).startAt || doc.createdAt || '';
      datePickerHook.setCreatedAtValue(normalizeDateInput(String(sourceStartAt)) || todayIsoDate());
      const normalizedCategoryId =
        typeof doc.categoryId === 'object' && doc.categoryId
          ? doc.categoryId._id || ''
          : (doc.categoryId || '');
      const normalizedCategoryName =
        doc.categoryDocumentName ||
        (typeof doc.categoryId === 'object' && doc.categoryId
          ? (doc.categoryId.name || '')
          : latestCategoryById[normalizedCategoryId]?.name || '');
      state.setCategoryIdValue(normalizedCategoryId);
      state.setCategoryNameValue(normalizedCategoryName);
      state.setPriorityValue((doc.priority as EDocumentPriority) || '');
      const finishedIso = normalizeDateInput(String(doc.finishedAt || ''));
      datePickerHook.setFinishedAtValue(finishedIso);
      datePickerHook.setFinishedAtDisplay(finishedIso ? formatDate(finishedIso) : '');
      const detailContent = (doc.content || '').trimStart();
      editorHook.commitEditorContent(detailContent);
      editorHook.setInitialEditorHtml(detailContent);
      editorHook.setActiveFormat('Paragraph');
      resetMenus();
      filesHook.setMainFilesNew([]);
      filesHook.setAttachedFilesNew([]);
      filesHook.setFilesToRemove([]);
      state.setErrors({});

      const mainFilesFromMain = Array.isArray(doc.mainFiles) ? doc.mainFiles : [];
      const mainFilesFromSigned = Array.isArray(doc.signedFiles) ? doc.signedFiles : [];
      const mergedAttachedFiles = Array.isArray(doc.attachedFiles) ? doc.attachedFiles : [];

      filesHook.setExistingMainFiles(
        dedupeExistingFiles([
          ...mainFilesFromMain.map((f: any, index: number) =>
            normalizeExistingFile(f, 'main', index + 1, 'mainFiles'),
          ),
          ...mainFilesFromSigned.map((f: any, index: number) =>
            normalizeExistingFile(f, 'signed', index + 1, 'signedFiles'),
          ),
        ]),
      );

      filesHook.setExistingAttachedFiles(
        mergedAttachedFiles.map((f: any, index: number) =>
          normalizeExistingFile(f, 'attached', index + 1, 'attachedFiles'),
        ),
      );

      const destinationRaw: any = doc.destinationCategoryId;
      const normalizedDestinationId =
        typeof destinationRaw === 'object' && destinationRaw
          ? String(destinationRaw._id || destinationRaw.id || '')
          : String(destinationRaw || '');
      if (
        isObjectId(normalizedDestinationId) &&
        latestCategoryById[normalizedDestinationId]
      ) {
        assignmentHook.setDestinationSelectionIds(buildCategoryPath(normalizedDestinationId, latestCategoryById));
        assignmentHook.setDestinationCategoryHint('');
      } else {
        assignmentHook.setDestinationSelectionIds([]);
        assignmentHook.setDestinationCategoryHint(
          typeof destinationRaw === 'object' && destinationRaw
            ? String(destinationRaw.name || destinationRaw.title || normalizedDestinationId || '')
            : normalizedDestinationId,
        );
      }

      const receivedDepartmentRaw: any =
        (doc as any).receiveDepartmentId ||
        (doc as any).receiveDepartment ||
        '';
      const savedLeadAgencyRaw: any =
        (doc as any).leadAgency ||
        (doc as any).leadDepartmentId ||
        (doc as any).leadDepartment ||
        '';
      const fallbackDepartmentRaw: any =
        (doc as any).departmentId ||
        (doc as any).department ||
        '';
      const leadDepartmentRaw: any =
        receivedDepartmentRaw ||
        savedLeadAgencyRaw ||
        fallbackDepartmentRaw;
      const normalizedLeadDepartmentId = getEntityId(leadDepartmentRaw);
      const hasExplicitLeadDepartmentFromDetail = Boolean(
        getEntityId(receivedDepartmentRaw) ||
        getEntityName(receivedDepartmentRaw) ||
        getEntityId(savedLeadAgencyRaw) ||
        getEntityName(savedLeadAgencyRaw) ||
        normalizePrimitive((doc as any).leadAgencyName) ||
        normalizePrimitive((doc as any).leadDepartmentName) ||
        normalizePrimitive((doc as any).receiveDepartmentName),
      );
      const normalizedLeadDepartmentName =
        getEntityName(leadDepartmentRaw) ||
        getEntityName((doc as any).receiveDepartment) ||
        getEntityName((doc as any).receiveDepartmentId) ||
        getEntityName((doc as any).leadAgency) ||
        getEntityName((doc as any).leadDepartment) ||
        getEntityName((doc as any).leadDepartmentId) ||
        normalizePrimitive((doc as any).leadAgencyName) ||
        normalizePrimitive((doc as any).leadDepartmentName) ||
        normalizePrimitive((doc as any).receiveDepartmentName) ||
        (!isObjectId(normalizedLeadDepartmentId) ? normalizedLeadDepartmentId : '');
      assignmentHook.setLeadDepartmentId(isObjectId(normalizedLeadDepartmentId) ? normalizedLeadDepartmentId : '');
      assignmentHook.setLeadAgencyValue(normalizedLeadDepartmentName);
      assignmentHook.setLeadAgencyPayloadValue(
        normalizePrimitive((doc as any).leadAgency) ||
        (
          (doc as any).leadAgency &&
          typeof (doc as any).leadAgency === 'object'
            ? normalizePrimitive((doc as any).leadAgency.code)
            : ''
        ) ||
        getEntityId((doc as any).leadAgency) ||
        normalizePrimitive((doc as any).leadAgencyName) ||
        '',
      );

      const receiveIds = normalizeObjectIdList(
        (doc as any).receiveToKnow ||
        (doc as any).receiveToKnowIds ||
        (doc as any).receiveToKnowDepartments,
      );
      const receiveFallback = joinEntityNames(
        (doc as any).receiveToKnow,
        (doc as any).receiveToKnowIds,
        (doc as any).receiveToKnowDepartments,
        (doc as any).receiveToKnowUsers,
        (doc as any).receiveToKnowNames,
      );
      assignmentHook.setReceiveToKnowIds(receiveIds);
      assignmentHook.setReceiveToKnowTextFallback(receiveFallback);

      const supportIds = normalizeObjectIdList(
        (doc as any).supportDepartmentId ||
        (doc as any).supportDepartmentIds ||
        (doc as any).supportDepartments,
      );
      const supportFallback = joinEntityNames(
        (doc as any).supportDepartmentId,
        (doc as any).supportDepartmentIds,
        (doc as any).supportDepartments,
        (doc as any).supportDepartmentNames,
      );
      assignmentHook.setSupportDepartmentIds(supportIds);
      assignmentHook.setSupportDepartmentTextFallback(supportFallback);

      const cachedAssignmentDraft = assignmentHook.assignmentDraftsRef.current[id];
      const storedAssignmentDraft = mode === 'LAYOUT_4'
        ? cachedAssignmentDraft || await getStoredAssignmentDraft(id)
        : undefined;
      if (storedAssignmentDraft) {
        assignmentHook.assignmentDraftsRef.current[id] = storedAssignmentDraft;
      }
      if (mode === 'LAYOUT_4' && storedAssignmentDraft) {
        if (!hasExplicitLeadDepartmentFromDetail) {
          assignmentHook.setLeadDepartmentId(storedAssignmentDraft.leadDepartmentId);
          assignmentHook.setLeadAgencyValue(storedAssignmentDraft.leadAgencyValue);
          assignmentHook.setLeadAgencyPayloadValue(storedAssignmentDraft.leadAgencyPayloadValue);
        }
        if (!finishedIso) {
          datePickerHook.setFinishedAtValue(storedAssignmentDraft.finishedAtValue);
          datePickerHook.setFinishedAtDisplay(storedAssignmentDraft.finishedAtDisplay);
        }
        if (receiveIds.length === 0 && !receiveFallback) {
          assignmentHook.setReceiveToKnowIds(storedAssignmentDraft.receiveToKnowIds);
          assignmentHook.setReceiveToKnowTextFallback(storedAssignmentDraft.receiveToKnowTextFallback);
        }
        if (supportIds.length === 0 && !supportFallback) {
          assignmentHook.setSupportDepartmentIds(storedAssignmentDraft.supportDepartmentIds);
          assignmentHook.setSupportDepartmentTextFallback(storedAssignmentDraft.supportDepartmentTextFallback);
        }
      }

      state.setShowForm(true);
    } finally {
      startEditLockRef.current = false;
      state.setIsPreparingForm(false);
    }
  };

  const appendBaseFields = (
    formData: FormData,
    statusValue?: EDocumentStatus,
    contentOverride?: string,
  ) => {
    formData.append('title', state.titleValue.trim());
    formData.append('organization', state.organizationValue.trim());
    formData.append('sender', state.senderValue.trim());
    formData.append('registeredNumber', state.registeredNumberValue.trim());
    if (statusValue) {
      formData.append('status', statusValue);
    }
    formData.append('priority', state.priorityValue);
    formData.append('categoryId', state.categoryIdValue);
    const contentValue = contentOverride ?? editorHook.editorContentRef.current;
    formData.append('content', (contentValue || editorHook.editorContent || state.titleValue).trim());
    formData.append('createdAt', datePickerHook.createdAtValue);
    formData.append('startAt', datePickerHook.createdAtValue);
  };

  const appendNewFiles = (formData: FormData) => {
    filesHook.mainFilesNew.forEach((file: any, index: number) => {
      formData.append('mainFiles', {
        uri: file.uri,
        name: file.name || `main-file-${index}.pdf`,
        type: file.type || 'application/pdf',
      } as any);
    });
    filesHook.attachedFilesNew.forEach((file: any, index: number) => {
      formData.append('attachedFiles', {
        uri: file.uri,
        name: file.name || `attached-file-${index}.pdf`,
        type: file.type || 'application/pdf',
      } as any);
    });
  };

  const appendAssignmentFields = (formData: FormData) => {
    formData.append('leadAgency', assignmentHook.getLeadAgencyPayload());
    formData.append('departmentId', assignmentHook.leadDepartmentId);
    formData.append('leadDepartmentId', assignmentHook.leadDepartmentId);
    formData.append('receiveDepartmentId', assignmentHook.leadDepartmentId);
    formData.append('finishedAt', datePickerHook.finishedAtValue);
    formData.append('receiveToKnow', JSON.stringify(assignmentHook.receiveToKnowIds));
    formData.append('receiveToKnowIds', JSON.stringify(assignmentHook.receiveToKnowIds));
    formData.append('supportDepartmentId', JSON.stringify(assignmentHook.supportDepartmentIds));
    formData.append('supportDepartmentIds', JSON.stringify(assignmentHook.supportDepartmentIds));
  };

  const validateBaseFields = (nextErrors: any) => {
    if (!state.titleValue.trim()) nextErrors.title = 'Bắt buộc!';
    if (!state.organizationValue.trim()) nextErrors.organization = 'Bắt buộc!';
    if (!state.registeredNumberValue.trim()) nextErrors.registeredNumber = 'Bắt buộc!';
    if (!state.categoryIdValue) nextErrors.categoryId = 'Vui lòng chọn!';
    if (!state.priorityValue) nextErrors.priority = 'Vui lòng chọn!';
  };

  const validateDraftFields = (nextErrors: any) => {
    validateBaseFields(nextErrors);
    if (!state.senderValue.trim()) nextErrors.sender = 'Bắt buộc!';
  };

  const validateRegisterOnlyFields = (nextErrors: any) => {
    if (!assignmentHook.selectedDestinationId) nextErrors.destinationCategoryId = 'Vui lòng chọn!';
  };

  const validateAssignFields = (nextErrors: any) => {
    if (!assignmentHook.leadDepartmentId) nextErrors.leadDepartmentId = 'Vui lòng chọn!';
    if (!datePickerHook.finishedAtValue) nextErrors.finishedAt = 'Vui lòng chọn ngày!';
  };

  const submitLayout1 = async (asDraft: boolean) => {
    if (state.isSubmittingForm) return;
    Keyboard.dismiss();
    editorHook.clearEditorFocus();
    state.setFocusedField(null);
    const nextErrors: any = {};
    validateDraftFields(nextErrors);

    const totalMainFiles = filesHook.mainFilesNew.length + filesHook.existingMainFiles.length;
    if (!state.editingId && totalMainFiles === 0) nextErrors.mainFiles = 'Vui lòng tải lên ít nhất 1 file văn bản chính!';

    state.setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    state.setIsSubmittingForm(true);
    try {
      const latestEditorContent = await editorHook.requestEditorContent();
      const formData = new FormData();
      const statusForSubmit = asDraft
        ? EDocumentStatus.DRAFT
        : EDocumentStatus.STATIONARY_RECEIVED;
      appendBaseFields(formData, statusForSubmit, latestEditorContent);
      appendNewFiles(formData);
      if (state.editingId) {
        formData.append('filesToRemove', JSON.stringify(filesHook.filesToRemove));
      }

      const ok = state.editingId ? await updateIncomingDraft(state.editingId, formData) : await createIncomingDocument(formData);
      if (!ok) return;
      state.setShowForm(false);
      resetForm();
      getListDocument({ type: 'INCOMING' });
    } finally {
      state.setIsSubmittingForm(false);
    }
  };

  const buildRegisterFormData = (contentOverride?: string) => {
    const formData = new FormData();
    appendBaseFields(formData, undefined, contentOverride);
    formData.append('destinationCategoryId', assignmentHook.selectedDestinationId);
    appendAssignmentFields(formData);
    formData.append('filesToRemove', JSON.stringify(filesHook.filesToRemove));
    appendNewFiles(formData);
    return formData;
  };

  const buildAssignFormData = (
    options?: { includeFiles?: boolean; includeFilesToRemove?: boolean },
    contentOverride?: string,
  ) => {
    const formData = new FormData();
    appendBaseFields(formData, undefined, contentOverride);
    if (assignmentHook.selectedDestinationId) {
      formData.append('destinationCategoryId', assignmentHook.selectedDestinationId);
    }
    appendAssignmentFields(formData);
    formData.append(
      'filesToRemove',
      JSON.stringify(options?.includeFilesToRemove === false ? [] : filesHook.filesToRemove),
    );
    if (options?.includeFiles) {
      appendNewFiles(formData);
    }
    return formData;
  };

  const submitLayout3 = async () => {
    if (!state.editingId) return;
    if (state.isSubmittingForm) return;
    Keyboard.dismiss();
    editorHook.clearEditorFocus();
    state.setFocusedField(null);
    const nextErrors: any = {};
    validateBaseFields(nextErrors);
    validateRegisterOnlyFields(nextErrors);
    validateAssignFields(nextErrors);
    state.setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    state.setIsSubmittingForm(true);
    try {
      const latestEditorContent = await editorHook.requestEditorContent();
      const ok = await registerIncomingDocument(state.editingId, buildRegisterFormData(latestEditorContent));
      if (!ok) return;
      const assignmentDraft = assignmentHook.buildCurrentAssignmentDraft();
      assignmentHook.assignmentDraftsRef.current[state.editingId] = assignmentDraft;
      await saveStoredAssignmentDraft(state.editingId, assignmentDraft);
      state.setShowForm(false);
      resetForm();
      getListDocument({ type: 'INCOMING' });
    } finally {
      state.setIsSubmittingForm(false);
    }
  };

  const submitLayout4 = async () => {
    if (!state.editingId) {
      return;
    }
    if (state.isSubmittingForm || submitLayout4LockRef.current) {
      return;
    }
    submitLayout4LockRef.current = true;
    try {
      Keyboard.dismiss();
      editorHook.clearEditorFocus();
      state.setFocusedField(null);
      const nextErrors: any = {};
      validateBaseFields(nextErrors);
      validateAssignFields(nextErrors);
      state.setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) {
        return;
      }
      state.setIsSubmittingForm(true);
      const latestEditorContent = await editorHook.requestEditorContent();
      const ok = await assignIncomingDocument(
        state.editingId,
        buildAssignFormData({ includeFiles: true, includeFilesToRemove: true }, latestEditorContent),
      );
      if (!ok) {
        return;
      }
      delete assignmentHook.assignmentDraftsRef.current[state.editingId];
      await removeStoredAssignmentDraft(state.editingId);
      state.setShowForm(false);
      resetForm();
      getListDocument({ type: 'INCOMING' });
    } finally {
      submitLayout4LockRef.current = false;
      state.setIsSubmittingForm(false);
    }
  };

  return {
    resetForm,
    openCreateForm,
    startEdit,
    submitLayout1,
    submitLayout3,
    submitLayout4,
    startEditLockRef,
    submitLayout4LockRef,
  };
};
