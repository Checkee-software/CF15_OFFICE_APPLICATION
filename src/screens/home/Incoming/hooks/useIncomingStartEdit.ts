import { useRef } from 'react';
import { useDocumentCategoryStore } from '@/zustand/useDocumentCategoryStore';
import { useDocumentStore } from '@/stores/documentStore';
import { EDocumentPriority } from '@/shared-types/common/Document/document';
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
} from '../utils';
import {
    getStoredAssignmentDraft,
    loadIncomingAssignmentOptions,
} from '../utils/assignmentStorage';

type TStartEditOptions = {
    state: {
        isPreparingForm: boolean;
        isStationary: boolean;
        setEditingId: React.Dispatch<React.SetStateAction<string | null>>;
        setFormMode: React.Dispatch<React.SetStateAction<TFormMode>>;
        setIsPreparingForm: React.Dispatch<React.SetStateAction<boolean>>;
        setIsSubmittingForm: React.Dispatch<React.SetStateAction<boolean>>;
        setTitleValue: React.Dispatch<React.SetStateAction<string>>;
        setOrganizationValue: React.Dispatch<React.SetStateAction<string>>;
        setSenderValue: React.Dispatch<React.SetStateAction<string>>;
        setRegisteredNumberValue: React.Dispatch<React.SetStateAction<string>>;
        setCategoryIdValue: React.Dispatch<React.SetStateAction<string>>;
        setCategoryNameValue: React.Dispatch<React.SetStateAction<string>>;
        setPriorityValue: React.Dispatch<React.SetStateAction<EDocumentPriority | ''>>;
        setErrors: React.Dispatch<React.SetStateAction<any>>;
        setShowForm: React.Dispatch<React.SetStateAction<boolean>>;
    };
    filesHook: any;
    editorHook: any;
    datePickerHook: any;
    assignmentHook: any;
    ensureIncomingCategoryList: () => Promise<void>;
    resetMenus: () => void;
    resetForm: () => void;
};

/**
 * Handles the "startEdit" workflow for Incoming documents.
 * Extracted from useIncomingFormSubmit to reduce file size.
 */
export const useIncomingStartEdit = ({
    state,
    filesHook,
    editorHook,
    datePickerHook,
    assignmentHook,
    ensureIncomingCategoryList,
    resetMenus,
    resetForm,
}: TStartEditOptions) => {
    const { getDocumentDetail } = useDocumentStore();
    const startEditLockRef = useRef(false);

    const startEdit = async (
        id: string,
        forcedMode?: Exclude<TFormMode, 'CREATE'>,
    ) => {
        if (state.isPreparingForm || startEditLockRef.current) { return; }
        resetForm();
        startEditLockRef.current = true;
        state.setEditingId(id);
        state.setFormMode(forcedMode || 'LAYOUT_1');
        state.setIsPreparingForm(true);

        try {
            let latestCategoryById = assignmentHook.categoryById;
            const detailPromise = getDocumentDetail(id);
            const assignmentOptionsPromise =
                loadIncomingAssignmentOptions().catch(() => undefined);
            const categoryPromise =
                Object.keys(latestCategoryById).length === 0
                    ? ensureIncomingCategoryList().catch(() => undefined)
                    : Promise.resolve();

            const detail = await detailPromise;
            if (!detail) {
                state.setShowForm(false);
                resetForm();
                return;
            }
            const sourceDocRaw:
                | IDocument
                | { document?: IDocument | null }
                | null =
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

            if (mode !== 'LAYOUT_4') { await categoryPromise; }

            const numberingCategoryById = buildCategoryById(
                useDocumentCategoryStore.getState().categories,
            );
            if (Object.keys(numberingCategoryById).length > 0) {
                latestCategoryById = numberingCategoryById;
            }

            // Populate basic fields
            state.setEditingId(id);
            state.setFormMode(mode);
            state.setTitleValue((doc.title || '').trimStart());
            state.setOrganizationValue((doc.organization || '').trimStart());
            state.setSenderValue((doc.sender || '').trimStart());
            state.setRegisteredNumberValue((doc.registeredNumber || '').trimStart());

            const sourceStartAt = (doc as any).startAt || doc.createdAt || '';
            datePickerHook.setCreatedAtValue(
                normalizeDateInput(String(sourceStartAt)) || todayIsoDate(),
            );

            const normalizedCategoryId =
                typeof doc.categoryId === 'object' && doc.categoryId
                    ? doc.categoryId._id || ''
                    : doc.categoryId || '';
            const normalizedCategoryName =
                doc.categoryDocumentName ||
                (typeof doc.categoryId === 'object' && doc.categoryId
                    ? doc.categoryId.name || ''
                    : latestCategoryById[normalizedCategoryId]?.name || '');
            state.setCategoryIdValue(normalizedCategoryId);
            state.setCategoryNameValue(normalizedCategoryName);
            state.setPriorityValue((doc.priority as EDocumentPriority) || '');

            const finishedIso = normalizeDateInput(String(doc.finishedAt || ''));
            datePickerHook.setFinishedAtValue(finishedIso);
            datePickerHook.setFinishedAtDisplay(
                finishedIso ? formatDate(finishedIso) : '',
            );

            // Populate editor
            const detailContent = (doc.content || '').trimStart();
            editorHook.commitEditorContent(detailContent);
            editorHook.setInitialEditorHtml(detailContent);
            editorHook.setActiveFormat('Paragraph');
            resetMenus();

            // Populate files
            filesHook.setMainFilesNew([]);
            filesHook.setAttachedFilesNew([]);
            filesHook.setMainFilesToRemove([]);
            filesHook.setAttachedFilesToRemove([]);
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

            // Destination category path
            const destinationRaw: any = doc.destinationCategoryId;
            const normalizedDestinationId =
                typeof destinationRaw === 'object' && destinationRaw
                    ? String(destinationRaw._id || destinationRaw.id || '')
                    : String(destinationRaw || '');
            if (isObjectId(normalizedDestinationId) && latestCategoryById[normalizedDestinationId]) {
                assignmentHook.setDestinationSelectionIds(
                    buildCategoryPath(normalizedDestinationId, latestCategoryById),
                );
                assignmentHook.setDestinationCategoryHint('');
            } else {
                assignmentHook.setDestinationSelectionIds([]);
                assignmentHook.setDestinationCategoryHint(
                    typeof destinationRaw === 'object' && destinationRaw
                        ? String(destinationRaw.name || destinationRaw.title || normalizedDestinationId || '')
                        : normalizedDestinationId,
                );
            }

            // Lead department / assignment fields
            const receivedDepartmentRaw: any =
                (doc as any).receiveDepartmentId || (doc as any).receiveDepartment || '';
            const savedLeadAgencyRaw: any =
                (doc as any).leadAgency || (doc as any).leadDepartmentId || (doc as any).leadDepartment || '';
            const fallbackDepartmentRaw: any =
                (doc as any).departmentId || (doc as any).department || '';
            const leadDepartmentRaw: any =
                receivedDepartmentRaw || savedLeadAgencyRaw || fallbackDepartmentRaw;
            const normalizedLeadDepartmentId = getEntityId(leadDepartmentRaw);

            const hasExplicitLeadDepartmentFromDetail = Boolean(
                getEntityId(receivedDepartmentRaw) || getEntityName(receivedDepartmentRaw) ||
                getEntityId(savedLeadAgencyRaw) || getEntityName(savedLeadAgencyRaw) ||
                normalizePrimitive((doc as any).leadAgencyName) ||
                normalizePrimitive((doc as any).leadDepartmentName) ||
                normalizePrimitive((doc as any).receiveDepartmentName),
            );

            const normalizedLeadDepartmentName =
                getEntityName(leadDepartmentRaw) ||
                getEntityName((doc as any).receiveDepartment) || getEntityName((doc as any).receiveDepartmentId) ||
                getEntityName((doc as any).leadAgency) || getEntityName((doc as any).leadDepartment) ||
                getEntityName((doc as any).leadDepartmentId) ||
                normalizePrimitive((doc as any).leadAgencyName) ||
                normalizePrimitive((doc as any).leadDepartmentName) ||
                normalizePrimitive((doc as any).receiveDepartmentName) ||
                (!isObjectId(normalizedLeadDepartmentId) ? normalizedLeadDepartmentId : '');

            assignmentHook.setLeadDepartmentId(
                isObjectId(normalizedLeadDepartmentId) ? normalizedLeadDepartmentId : '',
            );
            assignmentHook.setLeadAgencyValue(normalizedLeadDepartmentName);
            assignmentHook.setLeadAgencyPayloadValue(
                normalizePrimitive((doc as any).leadAgency) ||
                ((doc as any).leadAgency && typeof (doc as any).leadAgency === 'object'
                    ? normalizePrimitive((doc as any).leadAgency.code)
                    : '') ||
                getEntityId((doc as any).leadAgency) ||
                normalizePrimitive((doc as any).leadAgencyName) ||
                '',
            );

            // Receive to know / support departments
            const receiveIds = normalizeObjectIdList(
                (doc as any).receiveToKnow || (doc as any).receiveToKnowIds || (doc as any).receiveToKnowDepartments,
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
                (doc as any).supportDepartmentId || (doc as any).supportDepartmentIds || (doc as any).supportDepartments,
            );
            const supportFallback = joinEntityNames(
                (doc as any).supportDepartmentId,
                (doc as any).supportDepartmentIds,
                (doc as any).supportDepartments,
                (doc as any).supportDepartmentNames,
            );
            assignmentHook.setSupportDepartmentIds(supportIds);
            assignmentHook.setSupportDepartmentTextFallback(supportFallback);

            // Restore stored assignment draft (LAYOUT_4 only)
            const cachedAssignmentDraft = assignmentHook.assignmentDraftsRef.current[id];
            const storedAssignmentDraft =
                mode === 'LAYOUT_4'
                    ? cachedAssignmentDraft || (await getStoredAssignmentDraft(id))
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

    return { startEdit, startEditLockRef };
};
