import { useCallback } from 'react';
import { EDocumentPriority, ESignDepartment } from '../components/constants';
import { useDocumentStore } from '@/stores/documentStore';
import { IDocument } from '@/shared-types/Response/DocumentResponse/DocumentResponse';
import { dedupeExistingFiles, normalizeExistingFile, pickByType, asArray } from '../utils';
import type { TOutgoingItem } from '../types';

export const useOutgoingStartEdit = (
    listDocument: any,
    isLoading: boolean,
    isPreparingForm: boolean,
    setIsPreparingForm: (val: boolean) => void,
    setEditingDocument: (doc: TOutgoingItem | null) => void,
    setTitleValue: (val: string) => void,
    setCodeValue: (val: string) => void,
    setKeyboardHeight: (val: number) => void,
    setEditorContentForLoad: (val: string) => void,
    editorReadyRef: React.MutableRefObject<boolean>,
    editorContentRequestRef: React.MutableRefObject<any>,
    setSelectedCategoryId: (val: string) => void,
    setSelectedCategoryName: (val: string) => void,
    setPriorityValue: (val: string) => void,
    setSignedDepartmentValue: (val: string) => void,
    setErrors: (val: any) => void,
    resetFiles: () => void,
    resetData: () => void,
    setSelectedSignerUserId: (val: string) => void,
    setSelectedSignerUserName: (val: string) => void,
    setSelectedApproverUserId: (val: string) => void,
    setSelectedApproverUserName: (val: string) => void,
    setSelectedReceiveDeptId: (val: string) => void,
    setSelectedReceiveDeptName: (val: string) => void,
    fetchDepartments: () => Promise<any[]>,
    setIsCreating: (val: boolean) => void,
    setExistingSignedFiles: (val: any[]) => void,
    setExistingAttachedFiles: (val: any[]) => void
) => {
    const { getDocumentDetail } = useDocumentStore();

    const openCreateForm = useCallback(() => {
        setEditingDocument(null);
        setTitleValue('');
        setCodeValue('');
        setKeyboardHeight(0);
        setEditorContentForLoad('');
        editorReadyRef.current = false;
        editorContentRequestRef.current = null;
        setSelectedCategoryId('');
        setSelectedCategoryName('');
        setPriorityValue('');
        setSignedDepartmentValue('');
        setErrors({});
        resetFiles();
        resetData();
        setSelectedSignerUserId('');
        setSelectedSignerUserName('');
        setSelectedApproverUserId('');
        setSelectedApproverUserName('');
        setSelectedReceiveDeptId('');
        setSelectedReceiveDeptName('');
        fetchDepartments();
        setIsCreating(true);
    }, [
        setEditingDocument, setTitleValue, setCodeValue, setKeyboardHeight, setEditorContentForLoad,
        editorReadyRef, editorContentRequestRef, setSelectedCategoryId, setSelectedCategoryName,
        setPriorityValue, setSignedDepartmentValue, setErrors, resetFiles, resetData,
        setSelectedSignerUserId, setSelectedSignerUserName, setSelectedApproverUserId,
        setSelectedApproverUserName, setSelectedReceiveDeptId, setSelectedReceiveDeptName,
        fetchDepartments, setIsCreating,
    ]);

    const openEditForm = async (item: TOutgoingItem) => {
        if (isLoading || isPreparingForm) { return; }
        setIsPreparingForm(true);
        setEditingDocument(item);
        setTitleValue(item.title);
        setCodeValue(item.code);
        setEditorContentForLoad('');
        editorReadyRef.current = false;
        editorContentRequestRef.current = null;
        try {
            const currentDepts = await fetchDepartments();
            const detail = await getDocumentDetail(item.id);
            const fallbackDoc = (listDocument || []).find((doc: IDocument) => doc._id === item.id) || null;
            const sourceDocRaw: IDocument | { document?: IDocument | null } | null =
                (detail as IDocument | { document?: IDocument | null } | null) ||
                fallbackDoc ||
                null;
            const sourceDoc =
                sourceDocRaw &&
                typeof sourceDocRaw === 'object' &&
                'document' in sourceDocRaw &&
                sourceDocRaw.document &&
                typeof sourceDocRaw.document === 'object'
                    ? sourceDocRaw.document
                    : (sourceDocRaw as IDocument | null);
            if (sourceDoc) {
                const detailContent = (sourceDoc.content || '').trimStart();
                const detailCategoryId = (sourceDoc.categoryId as any)?._id || (sourceDoc.categoryId as any)?.toString?.() || '';
                const detailCategoryName = (sourceDoc.categoryId as any)?.name || sourceDoc.categoryDocumentName || '';
                setTitleValue((sourceDoc.title || item.title || '').trimStart());
                setCodeValue((sourceDoc.registeredNumber || item.code || '').trimStart());
                setEditorContentForLoad(detailContent);
                setSelectedCategoryId(detailCategoryId);
                setSelectedCategoryName(detailCategoryName);
                setPriorityValue((sourceDoc.priority as EDocumentPriority) || '');

                const rawReceiveDept = (sourceDoc as any).receiveDepartmentId;
                let receiveDeptId = '';
                let receiveDeptName = '';
                if (rawReceiveDept) {
                    if (typeof rawReceiveDept === 'object') {
                        receiveDeptId = rawReceiveDept._id || rawReceiveDept.id || '';
                        receiveDeptName = rawReceiveDept.name || '';
                    } else {
                        receiveDeptId = rawReceiveDept.toString();
                    }
                }
                if (receiveDeptId) {
                    const matchedDept = currentDepts.find(d => d._id === receiveDeptId);
                    if (matchedDept) {
                        receiveDeptName = matchedDept.name;
                    }
                }
                setSelectedReceiveDeptId(receiveDeptId);
                setSelectedReceiveDeptName(receiveDeptName);

                const rawSignerUserId = (sourceDoc as any).signerUserId || '';
                setSelectedSignerUserId(rawSignerUserId);

                const rawApproverUserId = (sourceDoc as any).approverUserId || '';
                setSelectedApproverUserId(rawApproverUserId);

                setSignedDepartmentValue((sourceDoc.signedDepartment as ESignDepartment) || '');
                const wrapWithSource = (f: any, defaultSource: any) => {
                    if (f && typeof f === 'object') {
                        return { ...f, _source: f._source || defaultSource };
                    }
                    return { filename: String(f || ''), _source: defaultSource };
                };
                const signed = [
                    ...(Array.isArray(sourceDoc.signedFiles) ? sourceDoc.signedFiles : []).map(f => wrapWithSource(f, 'signedFiles')),
                    ...(Array.isArray(sourceDoc.mainFiles) ? sourceDoc.mainFiles : []).map(f => wrapWithSource(f, 'mainFiles')),
                    ...(Array.isArray(sourceDoc.approvedFiles) ? sourceDoc.approvedFiles : []).map(f => wrapWithSource(f, 'approvedFiles')),
                ];
                const attached = [
                    ...(Array.isArray(sourceDoc.attachedFiles) ? sourceDoc.attachedFiles : []).map(f => wrapWithSource(f, 'attachedFiles')),
                ];
                const rawFiles = asArray((sourceDoc as any)?.files);
                const documentFiles = [
                    ...asArray((sourceDoc as any)?.documentFile),
                    ...asArray((sourceDoc as any)?.documentFiles),
                ];
                const signedFromRaw = [
                    ...pickByType(rawFiles, ['SIGNED', 'SIGN', 'MAIN']).map(f => {
                        const t = String(f?.type || f?.fileType || f?.file?.type || f?.file?.fileType || '').toUpperCase();
                        return wrapWithSource(f, t === 'MAIN' ? 'mainFiles' : 'signedFiles');
                    }),
                    ...documentFiles.map(f => wrapWithSource(f, 'signedFiles')),
                ];
                const attachedFromRaw = pickByType(rawFiles, ['ATTACHED', 'ATTACHMENT']).map(f => wrapWithSource(f, 'attachedFiles'));
                const signedCandidates = signed.length > 0 ? [...signed, ...signedFromRaw] : [...signedFromRaw, ...rawFiles];
                const attachedCandidates = attached.length > 0 ? [...attached, ...attachedFromRaw] : attachedFromRaw;
                setExistingSignedFiles(
                    dedupeExistingFiles(
                        signedCandidates.map((f: any, index: number) =>
                            normalizeExistingFile(f, 'signed', index + 1, f?._source),
                        ),
                    ),
                );
                setExistingAttachedFiles(
                    dedupeExistingFiles(
                        attachedCandidates.map((f: any, index: number) =>
                            normalizeExistingFile(f, 'attached', index + 1, f?._source),
                        ),
                    ),
                );
            }
            resetFiles();
            setKeyboardHeight(0);
            setIsCreating(true);
        } finally {
            setIsPreparingForm(false);
        }
    };

    return {
        openCreateForm,
        openEditForm,
    };
};
