import {useState, useCallback} from 'react';

export const useIncomingFormDelete = (
    deleteDocument: (id: string) => Promise<boolean>,
    getListDocument: (params: any) => Promise<any>,
    isLoading: boolean,
) => {
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deletingTitle, setDeletingTitle] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const requestDelete = useCallback((id: string, title: string) => {
        setDeletingId(id);
        setDeletingTitle(title || '');
    }, []);

    const cancelDelete = useCallback(() => {
        setDeletingId(null);
        setDeletingTitle('');
    }, []);

    const confirmDelete = useCallback(async () => {
        if (!deletingId || isDeleting || isLoading) {return;}
        setIsDeleting(true);
        await deleteDocument(deletingId);
        setIsDeleting(false);
        setDeletingId(null);
        setDeletingTitle('');
        getListDocument({type: 'INCOMING'});
    }, [deleteDocument, deletingId, getListDocument, isDeleting, isLoading]);

    const resetDeleteState = useCallback(() => {
        setDeletingId(null);
        setDeletingTitle('');
        setIsDeleting(false);
    }, []);

    return {
        deletingId,
        setDeletingId,
        deletingTitle,
        setDeletingTitle,
        isDeleting,
        setIsDeleting,
        requestDelete,
        cancelDelete,
        confirmDelete,
        resetDeleteState,
    };
};
