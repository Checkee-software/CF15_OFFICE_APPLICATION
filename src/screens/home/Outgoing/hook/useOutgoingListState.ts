import { useState, useCallback, useEffect } from 'react';
import { useDocumentStore } from '@/stores/documentStore';
import { IDocument } from '@/shared-types/Response/DocumentResponse/DocumentResponse';
import { getOutgoingStatusDisplay } from '../utils';
import type { TOutgoingItem, TLevelKey } from '../types';

export const useOutgoingListState = (levelKey: TLevelKey | string) => {
    const { listDocument, getListDocument, deleteDocument, isLoading } = useDocumentStore();
    const [documents, setDocuments] = useState<TOutgoingItem[]>([]);
    const [deletingDocument, setDeletingDocument] = useState<TOutgoingItem | null>(null);

    // Fetch initial list
    const fetchList = useCallback(() => {
        getListDocument({ type: 'OUTGOING' });
    }, [getListDocument]);

    // Map raw listDocument to UI data structure
    useEffect(() => {
        const mappedDocuments: TOutgoingItem[] = (listDocument || []).map((item: IDocument) => ({
            step: `Bước ${item.currentStep ?? 0}`,
            id: item._id,
            title: item.title || '',
            code: item.registeredNumber || 'Chưa có số hiệu',
            time: item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : '',
            status: getOutgoingStatusDisplay(item.status, levelKey as TLevelKey),
            rawStatus: item.status,
        }));
        setDocuments(mappedDocuments);
    }, [levelKey, listDocument]);

    const askDeleteDocument = useCallback((item: TOutgoingItem) => {
        setDeletingDocument(item);
    }, []);

    const cancelDeleteDocument = useCallback(() => {
        setDeletingDocument(null);
    }, []);

    const confirmDeleteDocument = useCallback(async () => {
        if (!deletingDocument) { return; }
        if (isLoading) { return; }
        const ok = await deleteDocument(deletingDocument.id);
        if (ok) {
            await getListDocument({ type: 'OUTGOING' });
        }
        setDeletingDocument(null);
    }, [deletingDocument, isLoading, deleteDocument, getListDocument]);

    return {
        documents,
        deletingDocument,
        isLoading,
        fetchList,
        askDeleteDocument,
        cancelDeleteDocument,
        confirmDeleteDocument,
        listDocument,
    };
};
