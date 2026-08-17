import {useCallback, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import ENV from '@/config/ENV';
import axiosClient from '@/utils/axiosClient';
import Snackbar from 'react-native-snackbar';
import {IDocument} from '@/shared-types/Response/DocumentResponse/DocumentResponse';

type TUseDocumentDetailParams = {
    route: any;
    initialDocument?: IDocument | null;
};

export function useDocumentDetail({
    route,
    initialDocument,
}: TUseDocumentDetailParams) {
    const [documentDetail, setDocumentDetail] = useState<IDocument | null>(
        null,
    );
    const [stepsInfo, setStepsInfo] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDetail = useCallback(async () => {
        const initialDoc = initialDocument || route.params?.itemDocument;
        const docId = route.params?.documentId || initialDoc?._id;
        if (!docId && initialDoc) {
            setDocumentDetail(initialDoc);
            setIsLoading(false);
            return;
        }
        try {
            const response = await axiosClient.get(
                `${ENV.BACKEND_URL}/resources/documents/detail/${docId}`,
            );
            const payload = response.data?.data ?? response.data;
            const docCandidate =
                payload?.data?.data ||
                payload?.data?.document ||
                payload?.data ||
                payload?.document ||
                payload;
            const normalizedDocument =
                docCandidate?.document &&
                typeof docCandidate.document === 'object'
                    ? docCandidate.document
                    : docCandidate;
            const stepsCandidate =
                payload?.stepsInfo ||
                payload?.data?.stepsInfo ||
                payload?.document?.stepsInfo ||
                docCandidate?.stepsInfo ||
                [];

            setDocumentDetail(
                (normalizedDocument as IDocument) || initialDoc || null,
            );
            if (Array.isArray(stepsCandidate)) setStepsInfo(stepsCandidate);
        } catch {
            if (initialDoc) setDocumentDetail(initialDoc);
            else
                Snackbar.show({
                    text: 'Lỗi khi tải chi tiết văn bản từ máy chủ',
                    duration: Snackbar.LENGTH_SHORT,
                });
        } finally {
            setIsLoading(false);
        }
    }, [initialDocument, route.params?.documentId, route.params?.itemDocument]);

    useFocusEffect(
        useCallback(() => {
            fetchDetail();
        }, [fetchDetail]),
    );

    return {
        documentDetail,
        setDocumentDetail,
        stepsInfo,
        isLoading,
        fetchDetail,
    };
}
