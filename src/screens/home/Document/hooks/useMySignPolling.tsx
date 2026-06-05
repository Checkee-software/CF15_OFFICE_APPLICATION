import {useCallback, useEffect, useRef} from 'react';
import {AppState, AppStateStatus} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import ENV from '@/config/ENV';
import axiosClient from '@/utils/axiosClient';
import Snackbar from 'react-native-snackbar';
import type {AppDispatch, RootState} from '@/redux/store';
import {
    clearSigningSession,
    completeSigningFailed,
    completeSigningSuccess,
    incrementSigningPollCount,
    markSigningAsPolling,
} from '@/redux/signingFlowSlice';
import {
    MYSIGN_POLL_INTERVAL_MS,
    MYSIGN_POLL_MAX_ATTEMPTS,
} from '../utils/types';
import {isSigningCompletedForSelectedFile} from '../utils/documentHelpers';

type TFetchDetail = () => Promise<void> | void;

export function useMySignPolling(
    currentDocumentId: string,
    fetchDetail: TFetchDetail,
) {
    const dispatch = useDispatch<AppDispatch>();
    const signingSession = useSelector(
        (state: RootState) => state.signingFlow.currentSession,
    );
    const appStateRef = useRef<AppStateStatus>(AppState.currentState);
    const isPollingRef = useRef(false);

    const resumeMySignPolling = useCallback(async () => {
        if (!signingSession) {
            return;
        }

        if (
            !currentDocumentId ||
            signingSession.documentId !== currentDocumentId
        ) {
            return;
        }

        if (isPollingRef.current) {
            return;
        }

        isPollingRef.current = true;
        dispatch(markSigningAsPolling());

        let latestErrorMessage = '';

        try {
            for (
                let attempt = 0;
                attempt < MYSIGN_POLL_MAX_ATTEMPTS;
                attempt += 1
            ) {
                dispatch(incrementSigningPollCount());

                try {
                    await axiosClient.patch(
                        `${ENV.BACKEND_URL}/resources/documents/action/${signingSession.documentId}?action=APPROVE`,
                        {
                            comment: signingSession.comment || '',
                            signedFiles: JSON.stringify([
                                signingSession.selectedFileName,
                            ]),
                        },
                    );
                } catch (actionError: any) {
                    latestErrorMessage =
                        actionError?.response?.data?.message ||
                        actionError?.message ||
                        '';
                }

                try {
                    const response = await axiosClient.get(
                        `${ENV.BACKEND_URL}/resources/documents/detail/${signingSession.documentId}`,
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

                    if (
                        isSigningCompletedForSelectedFile(
                            normalizedDocument,
                            signingSession.selectedFileName,
                        )
                    ) {
                        dispatch(completeSigningSuccess());
                        await fetchDetail();
                        Snackbar.show({
                            text: 'Ký thật thành công',
                            duration: Snackbar.LENGTH_SHORT,
                        });
                        dispatch(clearSigningSession());
                        return;
                    }
                } catch (detailError: any) {
                    latestErrorMessage =
                        detailError?.response?.data?.message ||
                        detailError?.message ||
                        latestErrorMessage;
                }

                if (attempt < MYSIGN_POLL_MAX_ATTEMPTS - 1) {
                    await new Promise(resolve =>
                        setTimeout(resolve, MYSIGN_POLL_INTERVAL_MS),
                    );
                }
            }

            const failMessage =
                latestErrorMessage ||
                (ENV.MYSIGN_ENABLED
                    ? 'Không tìm thấy chữ ký sau khi quay lại từ MySign'
                    : 'Không tìm thấy kết quả ký duyệt từ API');
            dispatch(completeSigningFailed(failMessage));
            Snackbar.show({text: failMessage, duration: Snackbar.LENGTH_LONG});
        } finally {
            isPollingRef.current = false;
        }
    }, [currentDocumentId, dispatch, fetchDetail, signingSession]);

    const isCurrentDocumentSigningPending = Boolean(
        signingSession &&
            signingSession.documentId === currentDocumentId &&
            (signingSession.status === 'WAITING_EXTERNAL' ||
                signingSession.status === 'POLLING'),
    );
    const mySignPendingMessage =
        signingSession?.status === 'POLLING'
            ? `Đang đồng bộ kết quả ký... (${signingSession.pollCount}/${MYSIGN_POLL_MAX_ATTEMPTS})`
            : ENV.MYSIGN_ENABLED
            ? 'Đang chờ bạn hoàn tất ký trên MySign...'
            : 'Đang chuẩn bị đồng bộ kết quả ký...';

    useEffect(() => {
        const appStateSubscription = AppState.addEventListener(
            'change',
            nextState => {
                const previousState = appStateRef.current;
                appStateRef.current = nextState;

                if (
                    (previousState === 'background' ||
                        previousState === 'inactive') &&
                    nextState === 'active' &&
                    isCurrentDocumentSigningPending
                ) {
                    resumeMySignPolling();
                }
            },
        );

        return () => {
            appStateSubscription.remove();
        };
    }, [isCurrentDocumentSigningPending, resumeMySignPolling]);

    useEffect(() => {
        if (
            signingSession &&
            signingSession.documentId === currentDocumentId &&
            signingSession.status === 'POLLING'
        ) {
            resumeMySignPolling();
        }
    }, [currentDocumentId, resumeMySignPolling, signingSession]);

    useEffect(() => {
        if (
            !signingSession ||
            signingSession.documentId !== currentDocumentId ||
            signingSession.status !== 'WAITING_EXTERNAL'
        ) {
            return;
        }

        const lastUpdateTime = new Date(
            signingSession.updatedAt || signingSession.createdAt,
        ).getTime();
        const elapsedTime = Date.now() - lastUpdateTime;
        if (Number.isFinite(elapsedTime) && elapsedTime > 10000) {
            resumeMySignPolling();
        }
    }, [currentDocumentId, resumeMySignPolling, signingSession]);

    return {
        resumeMySignPolling,
        isCurrentDocumentSigningPending,
        mySignPendingMessage,
    };
}
