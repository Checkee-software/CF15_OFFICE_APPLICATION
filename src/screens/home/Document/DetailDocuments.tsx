import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
    ActivityIndicator,
    AppState,
    AppStateStatus,
    Dimensions,
    FlatList,
    Linking,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useFocusEffect} from '@react-navigation/native';
import moment from 'moment';
import AutoHeightWebView from 'react-native-autoheight-webview';
import ENV from '@/config/ENV';
import ModalPdfView from '../../../utils/Modals/ModalPdfView';
import axiosClient from '@/utils/axiosClient';
import Snackbar from 'react-native-snackbar';
import {
    EDocumentStatus,
    getPriorityLabel,
    getStatusLabel,
} from '@/shared-types/common/Document/document';
import {IDocument} from '@/shared-types/Response/DocumentResponse/DocumentResponse';
import {useAuthStore} from '@/stores/authStore';
import {EOrganization} from '@/shared-types/common/Permissions/Permissions';
import {useDispatch, useSelector} from 'react-redux';
import type {AppDispatch, RootState} from '@/redux/store';
import SCREEN_INFO from '@/config/SCREEN_CONFIG/screenInfo';
import {
    clearSigningSession,
    completeSigningFailed,
    completeSigningSuccess,
    incrementSigningPollCount,
    markSigningAsPolling,
    startSigningSession,
} from '@/redux/signingFlowSlice';

type AttachedFiles = {
    originalname: string;
    path: string;
    size: number;
    filename?: string;
    source?: string;
    group?: 'main' | 'attached';
    signStatus?: string;
    managerInitialedAt?: string | null;
    managerSignedAt?: string | null;
    directorInitialedAt?: string | null;
    directorApprovedAt?: string | null;
};

type TApproveActionMode =
    | 'AUTO'
    | 'DEPARTMENT_INITIAL'
    | 'DEPARTMENT_APPROVE'
    | 'MANAGEMENT_INITIAL'
    | 'MANAGEMENT_SIGN'
    | 'MANAGEMENT_FINAL'
    | 'STATIONARY_SUBMIT'
    | 'STATIONARY_PUBLISH'
    | 'STATIONARY_ARCHIVE';

const MYSIGN_POLL_INTERVAL_MS = 2500;
const MYSIGN_POLL_MAX_ATTEMPTS = 24;

const OUTGOING_DETAIL_STATUS_DISPLAY: Record<string, string> = {
    DRAFT: 'Bản nháp',
    SENDING: 'Gửi duyệt',
    MANAGER_INITIAL_SIGNING: 'TP duyệt',
    MANAGER_SIGNING: 'TP duyệt',
    MANAGER_APPROVING: 'TP duyệt',
    CLERK_CHECKING: 'VT kiểm tra',
    DIRECTOR_INITIAL_SIGNING: 'Phê duyệt',
    DIRECTOR_SIGNING: 'Phê duyệt',
    DIRECTOR_APPROVING: 'Phê duyệt',
    READY_TO_PUBLISH: 'Phát hành',
    OFFICIAL_PUBLISHED: 'Phát hành',
    ARCHIVED: 'Lưu trữ',
    REJECTED: 'Từ chối',
};

const getOutgoingDetailStatusLabel = (
    status: EDocumentStatus,
    level?: EOrganization,
) => {
    const normalizedStatus = String(status || '').toUpperCase();

    if (level === EOrganization.STATIONARY) {
        if (
            [
                EDocumentStatus.MANAGER_INITIAL_SIGNING,
                EDocumentStatus.MANAGER_SIGNING,
                EDocumentStatus.MANAGER_APPROVING,
                EDocumentStatus.DIRECTOR_INITIAL_SIGNING,
                EDocumentStatus.DIRECTOR_SIGNING,
                EDocumentStatus.DIRECTOR_APPROVING,
            ].includes(normalizedStatus as EDocumentStatus)
        ) {
            return 'Phê duyệt';
        }
    }

    if (
        level === EOrganization.MANAGEMENT &&
        [
            EDocumentStatus.MANAGER_INITIAL_SIGNING,
            EDocumentStatus.MANAGER_SIGNING,
            EDocumentStatus.MANAGER_APPROVING,
        ].includes(normalizedStatus as EDocumentStatus)
    ) {
        return 'Gửi duyệt';
    }

    return (
        OUTGOING_DETAIL_STATUS_DISPLAY[normalizedStatus] ||
        getStatusLabel(status)
    );
};

const DetailDocuments = ({route, navigation}: any) => {
    const {userInfo} = useAuthStore();
    const dispatch = useDispatch<AppDispatch>();
    const signingSession = useSelector(
        (state: RootState) => state.signingFlow.currentSession,
    );
    const appStateRef = useRef<AppStateStatus>(AppState.currentState);
    const isPollingRef = useRef(false);
    const [showModalPdf, setShowModalPdf] = useState(false);
    const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
    const [documentDetail, setDocumentDetail] = useState<IDocument | null>(
        null,
    );
    const [stepsInfo, setStepsInfo] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [checkedMainFileIndex, setCheckedMainFileIndex] = useState<
        number | null
    >(null);
    const [showDecisionModal, setShowDecisionModal] = useState(false);
    const [decisionType, setDecisionType] = useState<'reject' | 'approve'>(
        'approve',
    );
    const [approveActionMode, setApproveActionMode] =
        useState<TApproveActionMode>('AUTO');
    const [decisionNote, setDecisionNote] = useState('');
    const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);

    const level = userInfo?.userType?.level as EOrganization | undefined;
    const isReadOnlyFromManagement =
        route?.params?.readOnly === true ||
        route?.params?.sourceModule === 'documentManagement';
    const isLeaderView = level === EOrganization.LEADER;
    const canProcess = !isReadOnlyFromManagement && !isLeaderView;
    const sourceModule = route?.params?.sourceModule;
    const isIncomingDocumentView = sourceModule === 'incomingDocument';
    const isDocumentManagementView = sourceModule === 'documentManagement';
    const routeItemDocument = route?.params?.itemDocument as
        | IDocument
        | undefined;
    const currentDocumentId = String(
        documentDetail?._id ||
            route?.params?.documentId ||
            routeItemDocument?._id ||
            '',
    );
    const signedDepartmentLabelMap = useMemo<Record<string, string>>(
        () => ({
            MANAGEMENT: 'Ban giám đốc',
            DEPARTMENT: 'Phòng ban',
            STATIONARY: 'Văn thư',
            LEADER: 'Cán bộ nhân viên',
        }),
        [],
    );
    const signedDepartmentActionMap = useMemo<Record<string, string>>(
        () => ({
            MANAGEMENT: 'Ban giám đốc ký duyệt',
            DEPARTMENT: 'Trưởng phòng ký duyệt',
        }),
        [],
    );

    useEffect(() => {
        if (sourceModule === 'documentManagement') {
            navigation?.setOptions?.({title: 'NỘI DUNG VĂN BẢN'});
            return;
        }
        if (sourceModule === 'incomingDocument') {
            navigation?.setOptions?.({title: 'NỘI DUNG VĂN BẢN ĐẾN'});
            return;
        }
        navigation?.setOptions?.({title: 'NỘI DUNG VĂN BẢN ĐI'});
    }, [navigation, sourceModule]);

    const fetchDetail = useCallback(async () => {
        const initialDoc = route.params?.itemDocument;
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
    }, [route.params?.documentId, route.params?.itemDocument]);

    useFocusEffect(
        useCallback(() => {
            fetchDetail();
        }, [fetchDetail]),
    );

    const getFileUrl = useCallback((filePath: string) => {
        const normalizedPath = String(filePath || '')
            .replace(/\\/g, '/')
            .trim();
        if (!normalizedPath) {
            return '';
        }
        if (/^https?:\/\//i.test(normalizedPath)) {
            return normalizedPath;
        }
        if (normalizedPath.startsWith('/')) {
            return `${ENV.BACKEND_URL}${normalizedPath}`;
        }
        return `${ENV.BACKEND_URL}/${normalizedPath}`;
    }, []);

    const launchMySignApp = useCallback(
        async (documentId: string, fileName: string, filePath: string) => {
            const encodedDocumentId = encodeURIComponent(documentId);
            const encodedFileName = encodeURIComponent(fileName);
            const fileUrl = getFileUrl(filePath);
            const encodedFileUrl = encodeURIComponent(fileUrl);
            const appUrls = [
                `mysign://sign?documentId=${encodedDocumentId}&fileName=${encodedFileName}${
                    fileUrl ? `&fileUrl=${encodedFileUrl}` : ''
                }`,
                'mysign://',
            ];

            for (const url of appUrls) {
                try {
                    await Linking.openURL(url);
                    return true;
                } catch {
                    continue;
                }
            }

            return false;
        },
        [getFileUrl],
    );

    const isSigningCompletedForSelectedFile = useCallback(
        (documentCandidate: any, selectedFileName: string) => {
            if (!documentCandidate || !selectedFileName) {
                return false;
            }

            const matchedFiles = [
                ...((Array.isArray(documentCandidate?.signedFiles)
                    ? documentCandidate.signedFiles
                    : []) as any[]),
                ...((Array.isArray(documentCandidate?.mainFiles)
                    ? documentCandidate.mainFiles
                    : []) as any[]),
                ...((Array.isArray(documentCandidate?.files)
                    ? documentCandidate.files
                    : []) as any[]),
            ].filter((file: any) => {
                const fileKeys = [
                    file?.filename,
                    file?.originalname,
                    file?.fileName,
                    file?.name,
                    file?.display_file_name,
                    file?.file?.filename,
                    file?.file?.originalname,
                ]
                    .map((value: any) => String(value || '').trim())
                    .filter(Boolean);

                return fileKeys.includes(selectedFileName);
            });

            return matchedFiles.some((file: any) => {
                const signStatus = String(file?.signStatus || '').toUpperCase();
                return (
                    !!file?.managerSignedAt ||
                    !!file?.directorApprovedAt ||
                    signStatus.includes('MANAGER_SIGN') ||
                    signStatus.includes('DIRECTOR_SIGN') ||
                    signStatus.includes('DIRECTOR_APPROV')
                );
            });
        },
        [],
    );

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
    }, [
        currentDocumentId,
        dispatch,
        fetchDetail,
        isSigningCompletedForSelectedFile,
        signingSession,
    ]);

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

    const handleConfirmDecision = async () => {
        if (!documentDetail?._id) {
            Snackbar.show({
                text: 'Không tìm thấy ID văn bản',
                duration: Snackbar.LENGTH_SHORT,
            });
            return;
        }

        if (isIncomingDocumentView) {
            try {
                setIsSubmittingDecision(true);
                const incomingRejectCandidates = [
                    ...(((documentDetail as any)?.signedFiles || []) as any[]),
                    ...(((documentDetail as any)?.mainFiles || []) as any[]),
                ]
                    .map((file: any) => file?.filename || file?._id)
                    .filter(Boolean);
                if (decisionType === 'reject') {
                    await axiosClient.patch(
                        `${ENV.BACKEND_URL}/resources/documents/reject/${documentDetail._id}`,
                        {
                            comment: decisionNote.trim() || '',
                            selectedFiles: incomingRejectCandidates,
                        },
                    );
                } else {
                    await axiosClient.patch(
                        `${ENV.BACKEND_URL}/resources/documents/incoming/update/${documentDetail._id}`,
                        {comment: decisionNote.trim() || ''},
                    );
                }
                setShowDecisionModal(false);
                setDecisionNote('');
                await fetchDetail();
                Snackbar.show({
                    text:
                        decisionType === 'reject'
                            ? 'Từ chối văn bản thành công!'
                            : 'Cập nhật tiến trình văn bản đến thành công!',
                    duration: Snackbar.LENGTH_SHORT,
                });
            } catch (error: any) {
                Snackbar.show({
                    text:
                        error?.response?.data?.message ||
                        (decisionType === 'reject'
                            ? 'Không thể từ chối văn bản!'
                            : 'Không thể cập nhật tiến trình văn bản đến!'),
                    duration: Snackbar.LENGTH_SHORT,
                });
            } finally {
                setIsSubmittingDecision(false);
            }
            return;
        }

        const isStationaryActionWithoutFile = isStationaryLevel;
        const isManagementFinalWithoutFile =
            level === EOrganization.MANAGEMENT &&
            (approveActionMode === 'MANAGEMENT_FINAL' ||
                managementFinalApproveMode);
        if (
            decisionType === 'approve' &&
            canProcess &&
            !isStationaryActionWithoutFile &&
            !isManagementFinalWithoutFile &&
            selectedFiles.length === 0
        ) {
            Snackbar.show({
                text: 'Vui lòng chọn file trình ký',
                duration: Snackbar.LENGTH_SHORT,
            });
            return;
        }

        try {
            setIsSubmittingDecision(true);

            if (decisionType === 'reject') {
                await axiosClient.patch(
                    `${ENV.BACKEND_URL}/resources/documents/reject/${documentDetail._id}`,
                    {comment: decisionNote, selectedFiles},
                );
            } else {
                if (level === EOrganization.MANAGEMENT) {
                    if (approveActionMode === 'MANAGEMENT_SIGN') {
                        const selectedFileName = String(
                            selectedMainFile?.filename || '',
                        ).trim();
                        if (!selectedFileName) {
                            Snackbar.show({
                                text: 'Vui lòng chọn file trình ký hợp lệ',
                                duration: Snackbar.LENGTH_SHORT,
                            });
                            return;
                        }

                        const selectedFilePath = String(
                            selectedMainFile?.path || '',
                        ).trim();

                        dispatch(
                            startSigningSession({
                                documentId: documentDetail._id,
                                documentTitle: documentDetail.title || '',
                                selectedFileName,
                                selectedFilePath,
                                comment: decisionNote.trim(),
                            }),
                        );

                        setShowDecisionModal(false);
                        setDecisionNote('');

                        if (!ENV.MYSIGN_ENABLED) {
                            Snackbar.show({
                                text: 'Đang kiểm tra kết quả ký duyệt từ API...',
                                duration: Snackbar.LENGTH_LONG,
                            });
                            resumeMySignPolling();
                            return;
                        }

                        const openedMySign = await launchMySignApp(
                            documentDetail._id,
                            selectedFileName,
                            selectedFilePath,
                        );
                        if (!openedMySign) {
                            dispatch(
                                completeSigningFailed(
                                    'Không mở được ứng dụng MySign',
                                ),
                            );
                            Snackbar.show({
                                text: 'Không mở được MySign. Vui lòng kiểm tra app MySign đã cài đặt.',
                                duration: Snackbar.LENGTH_LONG,
                            });
                        } else {
                            Snackbar.show({
                                text: 'Đã chuyển sang MySign. Hãy hoàn tất ký và quay lại ứng dụng.',
                                duration: Snackbar.LENGTH_LONG,
                            });
                        }
                        return;
                    }

                    if (
                        approveActionMode === 'MANAGEMENT_FINAL' ||
                        managementFinalApproveMode
                    ) {
                        await axiosClient.patch(
                            `${ENV.BACKEND_URL}/resources/documents/outgoing/approve/${documentDetail._id}`,
                            {
                                comment: decisionNote,
                            },
                        );
                    } else {
                        await axiosClient.patch(
                            `${ENV.BACKEND_URL}/resources/documents/action/${documentDetail._id}?action=INITIAL_SIGN`,
                            {
                                comment: decisionNote,
                                signedFiles: JSON.stringify(selectedFiles),
                            },
                        );
                    }
                } else if (isStationaryLevel) {
                    if (approveActionMode === 'STATIONARY_PUBLISH') {
                        await axiosClient.patch(
                            `${ENV.BACKEND_URL}/resources/documents/action/${documentDetail._id}?action=PUBLISH`,
                            {
                                comment: decisionNote,
                            },
                        );
                    } else if (approveActionMode === 'STATIONARY_ARCHIVE') {
                        await axiosClient.patch(
                            `${ENV.BACKEND_URL}/resources/documents/outgoing/archive/${documentDetail._id}`,
                            {
                                comment: decisionNote,
                            },
                        );
                    } else {
                        await axiosClient.patch(
                            `${ENV.BACKEND_URL}/resources/documents/outgoing/approve/${documentDetail._id}`,
                            {
                                comment: decisionNote,
                            },
                        );
                    }
                } else if (isDepartmentLevel) {
                    if (approveActionMode === 'DEPARTMENT_APPROVE') {
                        await axiosClient.patch(
                            `${ENV.BACKEND_URL}/resources/documents/outgoing/approve/${documentDetail._id}`,
                            {
                                comment: decisionNote,
                            },
                        );
                    } else {
                        await axiosClient.patch(
                            `${ENV.BACKEND_URL}/resources/documents/action/${documentDetail._id}?action=INITIAL_SIGN`,
                            {
                                comment: decisionNote,
                                signedFiles: JSON.stringify(selectedFiles),
                            },
                        );
                    }
                }
            }

            setShowDecisionModal(false);
            setCheckedMainFileIndex(null);
            await fetchDetail();
            Snackbar.show({
                text: 'Xử lý văn bản thành công',
                duration: Snackbar.LENGTH_SHORT,
            });
        } catch (error: any) {
            Snackbar.show({
                text:
                    error?.response?.data?.message || 'Xử lý văn bản thất bại',
                duration: Snackbar.LENGTH_SHORT,
            });
        } finally {
            setIsSubmittingDecision(false);
        }
    };

    const handleDirectInitialSign = async () => {
        if (!documentDetail?._id) {
            Snackbar.show({
                text: 'Không tìm thấy ID văn bản',
                duration: Snackbar.LENGTH_SHORT,
            });
            return;
        }
        if (selectedFiles.length === 0) {
            Snackbar.show({
                text: 'Vui lòng chọn file trình ký',
                duration: Snackbar.LENGTH_SHORT,
            });
            return;
        }

        try {
            setIsSubmittingDecision(true);
            await axiosClient.patch(
                `${ENV.BACKEND_URL}/resources/documents/action/${documentDetail._id}?action=INITIAL_SIGN`,
                {
                    comment: '',
                    signedFiles: JSON.stringify(selectedFiles),
                },
            );
            setCheckedMainFileIndex(null);
            await fetchDetail();
            Snackbar.show({
                text: 'Ký nháy thành công',
                duration: Snackbar.LENGTH_SHORT,
            });
        } catch (error: any) {
            Snackbar.show({
                text:
                    error?.response?.data?.message || 'Ký nháy thất bại',
                duration: Snackbar.LENGTH_SHORT,
            });
        } finally {
            setIsSubmittingDecision(false);
        }
    };

    const handleDirectManagementSign = async () => {
        if (!documentDetail?._id) {
            Snackbar.show({
                text: 'Không tìm thấy ID văn bản',
                duration: Snackbar.LENGTH_SHORT,
            });
            return;
        }

        const selectedFileName = String(selectedMainFile?.filename || '').trim();
        if (!selectedFileName) {
            Snackbar.show({
                text: 'Vui lòng chọn file trình ký hợp lệ',
                duration: Snackbar.LENGTH_SHORT,
            });
            return;
        }

        const selectedFilePath = String(selectedMainFile?.path || '').trim();

        try {
            setIsSubmittingDecision(true);

            if (!ENV.MYSIGN_ENABLED) {
                await axiosClient.patch(
                    `${ENV.BACKEND_URL}/resources/documents/action/${documentDetail._id}?action=APPROVE`,
                    {
                        comment: '',
                        signedFiles: JSON.stringify([selectedFileName]),
                    },
                );
                setCheckedMainFileIndex(null);
                await fetchDetail();
                Snackbar.show({
                    text: 'Ký thật thành công',
                    duration: Snackbar.LENGTH_SHORT,
                });
                return;
            }

            dispatch(
                startSigningSession({
                    documentId: documentDetail._id,
                    documentTitle: documentDetail.title || '',
                    selectedFileName,
                    selectedFilePath,
                    comment: '',
                }),
            );

            const openedMySign = await launchMySignApp(
                documentDetail._id,
                selectedFileName,
                selectedFilePath,
            );
            if (!openedMySign) {
                dispatch(
                    completeSigningFailed(
                        'Không mở được ứng dụng MySign',
                    ),
                );
                Snackbar.show({
                    text: 'Không mở được MySign. Vui lòng kiểm tra app MySign đã cài đặt.',
                    duration: Snackbar.LENGTH_LONG,
                });
            } else {
                Snackbar.show({
                    text: 'Đã chuyển sang MySign. Hãy hoàn tất ký và quay lại ứng dụng.',
                    duration: Snackbar.LENGTH_LONG,
                });
            }
        } catch (error: any) {
            Snackbar.show({
                text:
                    error?.response?.data?.message || 'Ký thật thất bại',
                duration: Snackbar.LENGTH_SHORT,
            });
        } finally {
            setIsSubmittingDecision(false);
        }
    };

    const filesList: AttachedFiles[] = useMemo(() => {
        const asArray = (value: any): any[] => {
            if (Array.isArray(value)) {
                return value;
            }
            if (value === null || value === undefined) {
                return [];
            }
            if (typeof value === 'string') {
                return [{path: value}];
            }
            if (typeof value === 'object') {
                return [value];
            }
            return [];
        };
        const pickByType = (files: any[], types: string[]) =>
            files.filter((f: any) =>
                types.includes(
                    String(f?.type || f?.fileType || '').toUpperCase(),
                ),
            );

        const getFileNameFromPath = (path: string) => {
            const clean = String(path || '').replace(/\\/g, '/');
            const parts = clean.split('/').filter(Boolean);
            return parts.length ? parts[parts.length - 1] : '';
        };

        const normalizeFiles = (
            files: any[] = [],
            source = '',
            defaultGroup: 'main' | 'attached' = 'main',
        ): AttachedFiles[] =>
            files
                .map((file: any, index: number) => ({
                    originalname:
                        file?.originalname ||
                        file?.originalName ||
                        file?.fileNameDisplay ||
                        file?.display_file_name ||
                        file?.nameFile ||
                        file?.name_file ||
                        file?.filename ||
                        file?.fileName ||
                        file?.name ||
                        file?.documentName ||
                        file?.displayName ||
                        file?.document_file_name ||
                        file?.file?.fileNameDisplay ||
                        file?.file?.display_file_name ||
                        file?.file?.nameFile ||
                        file?.file?.name_file ||
                        file?.file?.originalname ||
                        file?.file?.originalName ||
                        file?.file?.filename ||
                        file?.file?.fileName ||
                        getFileNameFromPath(
                            file?.path ||
                                file?.url ||
                                file?.uri ||
                                file?.filePath ||
                                file?.file?.path ||
                                file?.file?.url ||
                                file?.file?.uri ||
                                file?.file?.filePath,
                        ) ||
                        `${source || 'file'}-${index + 1}.pdf`,
                    path:
                        file?.path ||
                        file?.url ||
                        file?.uri ||
                        file?.filePath ||
                        file?.documentFile ||
                        file?.document_file ||
                        file?.fileUrl ||
                        file?.fileURL ||
                        file?.file?.path ||
                        file?.file?.url ||
                        file?.file?.uri ||
                        file?.file?.filePath ||
                        file?.file?.documentFile ||
                        file?.file?.document_file ||
                        file?.file?.fileUrl ||
                        file?.file?.fileURL ||
                        '',
                    size: Number(file?.size || file?.file?.size || 0),
                    filename:
                        file?.filename ||
                        file?.fileName ||
                        file?.file?.filename ||
                        file?.file?.fileName ||
                        '',
                    source,
                    group: defaultGroup,
                    signStatus: file?.signStatus || '',
                    managerInitialedAt: file?.managerInitialedAt || null,
                    managerSignedAt: file?.managerSignedAt || null,
                    directorInitialedAt: file?.directorInitialedAt || null,
                    directorApprovedAt: file?.directorApprovedAt || null,
                }))
                .filter(file => !!String(file?.originalname || '').trim());

        const collectNestedFiles = (root: any): any[] => {
            if (!root || typeof root !== 'object') {
                return [];
            }
            const buckets: any[] = [];
            const queue: any[] = [root];
            const seen = new Set<any>();
            while (queue.length > 0) {
                const node = queue.shift();
                if (!node || typeof node !== 'object' || seen.has(node)) {
                    continue;
                }
                seen.add(node);
                const entries = Object.entries(node);
                entries.forEach(([key, value]) => {
                    const lowerKey = key.toLowerCase();
                    if (lowerKey.includes('file') && Array.isArray(value)) {
                        buckets.push(...value);
                    }
                    if (
                        value &&
                        typeof value === 'object' &&
                        !Array.isArray(value)
                    ) {
                        queue.push(value);
                    }
                });
            }
            return buckets;
        };

        const detailRawFiles = asArray((documentDetail as any)?.files);
        const routeRawFiles = asArray((routeItemDocument as any)?.files);
        const detailFallbackMain = asArray((documentDetail as any)?.file);
        const routeFallbackMain = asArray((routeItemDocument as any)?.file);
        const detailDocumentFiles = asArray(
            (documentDetail as any)?.documentFile,
        );
        const routeDocumentFiles = asArray(
            (routeItemDocument as any)?.documentFile,
        );
        const detailDocumentFilesAlt = asArray(
            (documentDetail as any)?.documentFiles,
        );
        const routeDocumentFilesAlt = asArray(
            (routeItemDocument as any)?.documentFiles,
        );

        const merged = [
            ...normalizeFiles(
                (documentDetail?.signedFiles as any[]) || [],
                'signedFiles',
                'main',
            ),
            ...normalizeFiles(
                (documentDetail?.mainFiles as any[]) || [],
                'mainFiles',
                'main',
            ),
            ...normalizeFiles(
                (documentDetail?.attachedFiles as any[]) || [],
                'attachedFiles',
                'attached',
            ),
            ...normalizeFiles(
                (documentDetail?.approvedFiles as any[]) || [],
                'approvedFiles',
                'main',
            ),
            ...normalizeFiles(detailFallbackMain, 'file', 'main'),
            ...normalizeFiles(detailDocumentFiles, 'documentFile', 'main'),
            ...normalizeFiles(detailDocumentFilesAlt, 'documentFiles', 'main'),
            ...normalizeFiles(
                pickByType(detailRawFiles, ['SIGNED', 'SIGN', 'MAIN']),
                'files.signed-main',
                'main',
            ),
            ...normalizeFiles(
                pickByType(detailRawFiles, ['ATTACHED', 'ATTACHMENT']),
                'files.attached',
                'attached',
            ),
            ...normalizeFiles(detailRawFiles, 'files', 'main'),
            ...normalizeFiles(
                (routeItemDocument?.signedFiles as any[]) || [],
                'route.signedFiles',
                'main',
            ),
            ...normalizeFiles(
                (routeItemDocument?.mainFiles as any[]) || [],
                'route.mainFiles',
                'main',
            ),
            ...normalizeFiles(
                (routeItemDocument?.attachedFiles as any[]) || [],
                'route.attachedFiles',
                'attached',
            ),
            ...normalizeFiles(
                (routeItemDocument?.approvedFiles as any[]) || [],
                'route.approvedFiles',
                'main',
            ),
            ...normalizeFiles(routeFallbackMain, 'route.file', 'main'),
            ...normalizeFiles(routeDocumentFiles, 'route.documentFile', 'main'),
            ...normalizeFiles(
                routeDocumentFilesAlt,
                'route.documentFiles',
                'main',
            ),
            ...normalizeFiles(
                pickByType(routeRawFiles, ['SIGNED', 'SIGN', 'MAIN']),
                'route.files.signed-main',
                'main',
            ),
            ...normalizeFiles(
                pickByType(routeRawFiles, ['ATTACHED', 'ATTACHMENT']),
                'route.files.attached',
                'attached',
            ),
            ...normalizeFiles(routeRawFiles, 'route.files', 'main'),
            ...normalizeFiles(
                collectNestedFiles(documentDetail),
                'detail.nested',
                'main',
            ),
            ...normalizeFiles(
                collectNestedFiles(routeItemDocument),
                'route.nested',
                'main',
            ),
        ];

        const uniqueMap = new Map<string, AttachedFiles>();
        merged.forEach(file => {
            const key =
                file.filename ||
                file.path ||
                `${file.source}-${file.originalname}`;
            if (!uniqueMap.has(key)) {
                uniqueMap.set(key, file);
            } else {
                const existing = uniqueMap.get(key)!;
                if (
                    existing.group !== 'attached' &&
                    file.group === 'attached'
                ) {
                    uniqueMap.set(key, {...existing, group: 'attached'});
                }
            }
        });
        return Array.from(uniqueMap.values());
    }, [documentDetail, routeItemDocument]);

    const mainFiles = useMemo(
        () => {
            const list = filesList.filter(file => file.group !== 'attached');
            if (!isIncomingDocumentView) {
                return list.filter(
                    file =>
                        file.source === 'signedFiles' ||
                        file.source === 'approvedFiles' ||
                        file.source === 'route.signedFiles' ||
                        file.source === 'route.approvedFiles',
                );
            }
            return list;
        },
        [filesList, isIncomingDocumentView],
    );
    const attachedOnlyFiles = useMemo(
        () => filesList.filter(file => file.group === 'attached'),
        [filesList],
    );
    const selectedMainFile = useMemo(
        () =>
            checkedMainFileIndex !== null
                ? mainFiles[checkedMainFileIndex] || null
                : null,
        [checkedMainFileIndex, mainFiles],
    );
    const selectedFiles = useMemo(
        () => (selectedMainFile?.filename ? [selectedMainFile.filename] : []),
        [selectedMainFile],
    );

    const hasManagerInitial = (file?: AttachedFiles | null) => {
        if (!file) return false;
        const signStatus = String(file.signStatus || '').toUpperCase();
        return (
            !!file.managerInitialedAt || signStatus.includes('MANAGER_INITIAL')
        );
    };

    const hasManagerSigned = (file?: AttachedFiles | null) => {
        if (!file) return false;
        const signStatus = String(file.signStatus || '').toUpperCase();
        return !!file.managerSignedAt || signStatus.includes('MANAGER_SIGN');
    };

    const hasDirectorInitial = (file?: AttachedFiles | null) => {
        if (!file) return false;
        const signStatus = String(file.signStatus || '').toUpperCase();
        return (
            !!file.directorInitialedAt ||
            signStatus.includes('DIRECTOR_INITIAL')
        );
    };

    const hasDirectorApproved = (file?: AttachedFiles | null) => {
        if (!file) return false;
        const signStatus = String(file.signStatus || '').toUpperCase();
        return (
            !!file.directorApprovedAt ||
            signStatus.includes('DIRECTOR_SIGN') ||
            signStatus.includes('DIRECTOR_APPROV')
        );
    };

    const stationaryPrimaryActionConfig = useMemo(() => {
        if (level !== EOrganization.STATIONARY) {
            return {
                actionLabel:
                    route.params?.hasRedCheck === true ||
                    documentDetail?.status === 'PROCESSING'
                        ? 'Phê duyệt'
                        : 'Ký nháy',
                confirmLabel: 'Xác nhận',
                confirmTitle: 'Phê duyệt văn bản',
            };
        }

        const stationarySignedDepartment = String(
            documentDetail?.signedDepartment || '',
        ).toUpperCase();
        if (
            documentDetail?.status === EDocumentStatus.MANAGER_APPROVING &&
            stationarySignedDepartment === 'DEPARTMENT'
        ) {
            return {
                actionLabel: 'Lưu sổ văn bản',
                confirmLabel: 'Lưu sổ',
                confirmTitle: 'Xác nhận lưu sổ',
            };
        }
        if (documentDetail?.status === EDocumentStatus.MANAGER_APPROVING) {
            return {
                actionLabel: 'Trình BGD',
                confirmLabel: 'Xác nhận',
                confirmTitle: 'Trình ban giám đốc ký duyệt',
            };
        }
        if (documentDetail?.status === EDocumentStatus.ARCHIVED) {
            return {
                actionLabel: 'Ban hành văn bản',
                confirmLabel: 'Ban hành',
                confirmTitle: 'Xác nhận ban hành',
            };
        }
        if (documentDetail?.status === EDocumentStatus.DIRECTOR_APPROVING) {
            return {
                actionLabel: 'Lưu sổ văn bản',
                confirmLabel: 'Lưu sổ',
                confirmTitle: 'Xác nhận lưu sổ',
            };
        }

        return {
            actionLabel: 'Phê duyệt',
            confirmLabel: 'Xác nhận',
            confirmTitle: 'Phê duyệt văn bản',
        };
    }, [
        level,
        route.params?.hasRedCheck,
        documentDetail?.status,
        documentDetail?.signedDepartment,
    ]);

    const managementStatus = documentDetail?.status as
        | EDocumentStatus
        | undefined;
    const isManagementLevel = level === EOrganization.MANAGEMENT;
    const managementSignMode =
        isManagementLevel &&
        managementStatus === EDocumentStatus.CLERK_CHECKING;
    const managementFinalApproveMode =
        isManagementLevel &&
        managementStatus === EDocumentStatus.DIRECTOR_SIGNING;
    const managementCanHandleCurrentStep =
        isManagementLevel &&
        (managementStatus === EDocumentStatus.CLERK_CHECKING ||
            managementStatus === EDocumentStatus.DIRECTOR_SIGNING);
    const managementCanInitialSign =
        managementSignMode &&
        !!selectedMainFile &&
        !hasDirectorInitial(selectedMainFile) &&
        !hasDirectorApproved(selectedMainFile);
    const managementCanSign =
        managementSignMode &&
        !!selectedMainFile &&
        hasDirectorInitial(selectedMainFile) &&
        !hasDirectorApproved(selectedMainFile);
    const shouldShowManagementActions =
        isManagementLevel && managementCanHandleCurrentStep;

    const hasRedCheck =
        route.params?.hasRedCheck === true ||
        documentDetail?.status === 'PROCESSING';
    const currentOwner = stepsInfo.length
        ? [...stepsInfo].sort(
              (a, b) => (b.stepOrder || 0) - (a.stepOrder || 0),
          )[0]?.fullName
        : '-';
    const isDepartmentLevel = level === EOrganization.DEPARTMENT;
    const departmentStatus = documentDetail?.status as
        | EDocumentStatus
        | undefined;
    const departmentCanHandleCurrentStep =
        isDepartmentLevel &&
        (departmentStatus === EDocumentStatus.SENDING ||
            departmentStatus === EDocumentStatus.MANAGER_INITIAL_SIGNING);
    const isDepartmentSigned = Boolean(
        (documentDetail?.signedFiles || []).some(
            (file: any) =>
                !!file?.managerInitialedAt || !!file?.managerInitialedBy,
        ),
    );
    const departmentApproveMode =
        departmentCanHandleCurrentStep && isDepartmentSigned;
    const isStationaryLevel = level === EOrganization.STATIONARY;
    const canShowProcessActions =
        canProcess &&
        (level === EOrganization.MANAGEMENT ||
            level === EOrganization.DEPARTMENT ||
            level === EOrganization.STATIONARY);
    const workflowBannerText = useMemo(() => {
        if (isLeaderView) {
            return 'CBNV theo dõi văn bản';
        }
        return (
            signedDepartmentActionMap[
                String(documentDetail?.signedDepartment || '')
            ] || 'Luồng xử lý văn bản'
        );
    }, [
        documentDetail?.signedDepartment,
        isLeaderView,
        signedDepartmentActionMap,
    ]);
    const stationaryStatus = documentDetail?.status as
        | EDocumentStatus
        | undefined;
    const signedDepartmentKey = String(
        documentDetail?.signedDepartment || '',
    ).toUpperCase();
    const stationaryPrimaryMode =
        isStationaryLevel && stationaryStatus === EDocumentStatus.ARCHIVED
            ? 'PUBLISH'
            : isStationaryLevel &&
              stationaryStatus === EDocumentStatus.DIRECTOR_APPROVING
            ? 'ARCHIVE'
            : isStationaryLevel &&
              stationaryStatus === EDocumentStatus.MANAGER_APPROVING &&
              signedDepartmentKey === 'DEPARTMENT'
            ? 'ARCHIVE'
            : isStationaryLevel &&
              stationaryStatus === EDocumentStatus.MANAGER_APPROVING
            ? 'SUBMIT_BGD'
            : null;
    const shouldShowStationaryActions =
        !isStationaryLevel || stationaryPrimaryMode !== null;
    const shouldShowStationaryReject =
        isStationaryLevel && stationaryPrimaryMode === 'SUBMIT_BGD';
    const shouldShowDepartmentActions =
        isDepartmentLevel && departmentCanHandleCurrentStep;
    const shouldShowOutgoingNonManagementActions =
        shouldShowDepartmentActions ||
        (isStationaryLevel && shouldShowStationaryActions);

    useEffect(() => {
        if (mainFiles.length === 0) {
            if (checkedMainFileIndex !== null) {
                setCheckedMainFileIndex(null);
            }
            return;
        }
        if (
            checkedMainFileIndex !== null &&
            checkedMainFileIndex < mainFiles.length
        ) {
            return;
        }

        if (departmentApproveMode) {
            const departmentApproveIndex = mainFiles.findIndex(
                file => hasManagerInitial(file) && !hasManagerSigned(file),
            );
            setCheckedMainFileIndex(
                departmentApproveIndex >= 0 ? departmentApproveIndex : 0,
            );
            return;
        }

        if (isStationaryLevel) {
            setCheckedMainFileIndex(0);
            return;
        }

        if (isManagementLevel && managementFinalApproveMode) {
            const directorApprovedIndex = mainFiles.findIndex(file =>
                hasDirectorApproved(file),
            );
            setCheckedMainFileIndex(
                directorApprovedIndex >= 0 ? directorApprovedIndex : 0,
            );
        }
    }, [
        checkedMainFileIndex,
        departmentApproveMode,
        isManagementLevel,
        isStationaryLevel,
        mainFiles,
        managementFinalApproveMode,
        stationaryPrimaryMode,
    ]);

    const incomingStatus = documentDetail?.status as
        | EDocumentStatus
        | undefined;
    const incomingStatusLabel =
        incomingStatus === EDocumentStatus.DRAFT
            ? 'Bản nháp'
            : incomingStatus === EDocumentStatus.STATIONARY_RECEIVED
            ? 'Tiếp nhận'
            : incomingStatus === EDocumentStatus.MANAGEMENT_REVIEWING
            ? 'Đã duyệt'
            : incomingStatus === EDocumentStatus.REGISTERED
            ? 'Vào sổ'
            : incomingStatus === EDocumentStatus.ASSIGNED
            ? 'Phân công'
            : incomingStatus === EDocumentStatus.PROCESSING
            ? 'Đang xử lý'
            : incomingStatus === EDocumentStatus.COMPLETED
            ? 'Hoàn thành'
            : incomingStatus === EDocumentStatus.REJECTED
            ? 'Từ chối'
            : 'Tiếp nhận';
    const incomingStatusColor =
        incomingStatusLabel === 'Tiếp nhận'
            ? '#F39C12'
            : incomingStatusLabel === 'Phân công'
            ? '#42A5F5'
            : incomingStatusLabel === 'Từ chối'
            ? '#F44336'
            : '#43A047';
    const incomingDepartmentActionMode = useMemo<
        'ASSIGN' | 'COMPLETE' | null
    >(() => {
        if (!isIncomingDocumentView || level !== EOrganization.DEPARTMENT) {
            return null;
        }
        if (incomingStatus === EDocumentStatus.ASSIGNED) {
            return 'ASSIGN';
        }
        if (incomingStatus === EDocumentStatus.PROCESSING) {
            return 'COMPLETE';
        }
        return null;
    }, [incomingStatus, isIncomingDocumentView, level]);
    const canIncomingManagementApprove =
        isIncomingDocumentView &&
        level === EOrganization.MANAGEMENT &&
        incomingStatus === EDocumentStatus.STATIONARY_RECEIVED &&
        canProcess;
    const shouldShowIncomingApprove =
        !!incomingDepartmentActionMode || canIncomingManagementApprove;
    const shouldShowIncomingReject = canIncomingManagementApprove;
    const incomingActionLabel = canIncomingManagementApprove
        ? 'Phê duyệt'
        : incomingDepartmentActionMode === 'COMPLETE'
        ? 'Xác nhận hoàn thành'
        : 'Xác nhận phân công';
    const incomingModalTitle =
        decisionType === 'reject'
            ? 'Từ chối văn bản'
            : canIncomingManagementApprove
            ? 'Xác nhận phê duyệt'
            : incomingDepartmentActionMode === 'COMPLETE'
            ? 'Xác nhận hoàn thành'
            : 'Xác nhận phân công';
    const incomingModalConfirmLabel =
        decisionType === 'reject'
            ? 'Xác nhận'
            : canIncomingManagementApprove
            ? 'Phê duyệt'
            : incomingDepartmentActionMode === 'COMPLETE'
            ? 'Hoàn thành'
            : 'Phân công';
    const incomingDestinationName = String(
        documentDetail?.destinationCategoryId || '',
    ).trim();
    const incomingPriorityName = String(
        getPriorityLabel(((documentDetail?.priority as any) || '') as any) ||
            '',
    ).toLowerCase();
    const incomingAddress = [
        'Văn bản đến',
        documentDetail?.organization || '',
        incomingDestinationName,
        incomingPriorityName ? `Ưu tiên ${incomingPriorityName}` : '',
    ]
        .filter(Boolean)
        .join(' / ');
    const incomingReceiveToKnowDepartments =
        documentDetail?.receiveToKnowDepartments;
    const incomingReceiveToKnow = Array.isArray(
        incomingReceiveToKnowDepartments,
    )
        ? incomingReceiveToKnowDepartments
              .map(item => item?.fullName)
              .filter(Boolean)
              .join(', ')
        : '';
    const incomingSupportDepartmentItems = documentDetail?.supportDepartments;
    const incomingSupportDepartments = Array.isArray(
        incomingSupportDepartmentItems,
    )
        ? incomingSupportDepartmentItems
              .map(item => item?.name)
              .filter(Boolean)
              .join(', ')
        : '';
    const shouldShowIncomingAddress =
        incomingStatus === EDocumentStatus.REGISTERED ||
        incomingStatus === EDocumentStatus.ASSIGNED ||
        incomingStatus === EDocumentStatus.PROCESSING ||
        incomingStatus === EDocumentStatus.COMPLETED;
    const shouldShowIncomingAssignmentInfo =
        incomingStatus === EDocumentStatus.ASSIGNED ||
        incomingStatus === EDocumentStatus.PROCESSING ||
        incomingStatus === EDocumentStatus.COMPLETED;
    const incomingLevelBannerText = useMemo(() => {
        if (level === EOrganization.MANAGEMENT) {
            return '→ Ban giám đốc phê duyệt văn bản đến';
        }
        if (level === EOrganization.DEPARTMENT) {
            return '→ Phòng ban xử lý văn bản đến';
        }
        if (level === EOrganization.STATIONARY) {
            return '→ Văn thư tiếp nhận, vào sổ và phân công';
        }
        return '→ CBNV theo dõi văn bản đến';
    }, [level]);

    const outgoingModalTitle =
        decisionType === 'reject'
            ? 'Từ chối văn bản'
            : isStationaryLevel
            ? stationaryPrimaryMode === 'PUBLISH'
                ? 'Xác nhận ban hành'
                : stationaryPrimaryMode === 'ARCHIVE'
                ? 'Xác nhận lưu sổ'
                : 'Trình ban giám đốc ký duyệt'
            : isManagementLevel
            ? approveActionMode === 'MANAGEMENT_FINAL' ||
              managementFinalApproveMode
                ? 'Xác nhận phê duyệt'
                : approveActionMode === 'MANAGEMENT_SIGN'
                ? 'Xác nhận ký thật'
                : 'Xác nhận ký nháy'
            : isDepartmentLevel
            ? departmentApproveMode
                ? 'Phê duyệt văn bản'
                : 'Xác nhận ký nháy'
            : stationaryPrimaryActionConfig.confirmTitle;

    const outgoingModalConfirmLabel =
        decisionType === 'reject'
            ? 'Xác nhận'
            : isStationaryLevel
            ? stationaryPrimaryMode === 'ARCHIVE'
                ? 'Lưu sổ'
                : stationaryPrimaryMode === 'PUBLISH'
                ? 'Ban hành'
                : 'Xác nhận'
            : isManagementLevel
            ? approveActionMode === 'MANAGEMENT_SIGN'
                ? 'Ký thật'
                : approveActionMode === 'MANAGEMENT_FINAL' ||
                  managementFinalApproveMode
                ? 'Phê duyệt'
                : 'Xác nhận'
            : isDepartmentLevel
            ? departmentApproveMode
                ? 'Xác nhận'
                : 'Ký nháy'
            : stationaryPrimaryActionConfig.confirmLabel;

    const isOutgoingApproveDisabled = isDepartmentLevel
        ? !departmentCanHandleCurrentStep ||
          checkedMainFileIndex === null ||
          (departmentApproveMode && !hasManagerInitial(selectedMainFile))
        : isStationaryLevel
        ? false
        : checkedMainFileIndex === null;

    const htmlContent = `<html><head><meta name="viewport" content="width=device-width, initial-scale=1" /></head><body style="font-size:14px;line-height:1.6;color:#37474F;margin:0;padding:0;">${
        documentDetail?.content || 'Không có nội dung văn bản.'
    }</body></html>`;
    const formatFileSize = (size: number) =>
        size >= 1024 * 1024
            ? `${(size / (1024 * 1024)).toFixed(1)} mb`
            : `${(size / 1024).toFixed(1)} kb`;
    const getSignatureDotsForFile = (file: AttachedFiles): string[] => {
        const dots: string[] = [];
        const signStatus = String(file.signStatus || '').toUpperCase();

        const hasRed =
            !!file.managerInitialedAt ||
            !!file.managerSignedAt ||
            signStatus.includes('MANAGER_INITIAL') ||
            signStatus.includes('MANAGER_SIGN');
        const hasYellow =
            !!file.directorInitialedAt ||
            signStatus.includes('DIRECTOR_INITIAL');
        const hasGreen =
            !!file.directorApprovedAt ||
            signStatus.includes('DIRECTOR_SIGN') ||
            signStatus.includes('DIRECTOR_APPROV');

        if (hasRed) {
            dots.push('#F44336');
        }
        if (hasYellow) {
            dots.push('#F39C12');
        }
        if (hasGreen) {
            dots.push('#4CAF50');
        }

        return dots;
    };

    const renderSignatureDot = (color: string, key: string) => (
        <View
            key={key}
            style={[styles.signatureDot, {backgroundColor: color}]}>
            <MaterialCommunityIcons name='check' size={11} color='#FFFFFF' />
        </View>
    );

    const renderItemAttachedFiles = (
        file: AttachedFiles,
        isMain = false,
        index?: number,
    ) => {
        const dots: string[] = getSignatureDotsForFile(file);
        const isCheckboxDisabled =
            (isDepartmentLevel &&
                (!departmentCanHandleCurrentStep || departmentApproveMode)) ||
            isStationaryLevel ||
            (isManagementLevel &&
                (managementFinalApproveMode || hasDirectorApproved(file)));
        const isChecked = checkedMainFileIndex === index;
        const showSignatureDots = dots.length > 0;
        const showSigningStateColumn = isMain && (canProcess || showSignatureDots);

        const openPdfPreview = () => {
            if (!file.path) {
                Snackbar.show({
                    text: 'File chưa có đường dẫn tải xuống',
                    duration: Snackbar.LENGTH_SHORT,
                });
                return;
            }

            const fixed = file.path.replace(/\\/g, '/');
            setSelectedPdf(`${ENV.BACKEND_URL}${fixed}`);
            setShowModalPdf(true);
        };

        const fileRow = (
            <View style={isMain ? styles.signingFileInner : styles.fileCard}>
                <View style={styles.fileLeft}>
                    {showSigningStateColumn ? (
                        <View style={styles.signingCheckboxColumn}>
                            {canProcess ? (
                                <TouchableOpacity
                                    disabled={isCheckboxDisabled}
                                    onPress={() =>
                                        setCheckedMainFileIndex(prev =>
                                            prev === index ? null : index ?? null,
                                        )
                                    }
                                    style={styles.checkboxWrap}>
                                    <MaterialCommunityIcons
                                        name={
                                            isChecked
                                                ? 'checkbox-marked'
                                                : 'checkbox-blank-outline'
                                        }
                                        size={21}
                                        color={
                                            isChecked
                                                ? isCheckboxDisabled
                                                    ? '#9E9E9E'
                                                    : '#1E88E5'
                                                : '#707070'
                                        }
                                    />
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.signingCheckboxPlaceholder} />
                            )}
                            {showSignatureDots ? (
                                <View style={styles.signatureRowUnderCheckbox}>
                                    {dots.map((color, idx) =>
                                        renderSignatureDot(
                                            color,
                                            `${color}-${idx}`,
                                        ),
                                    )}
                                </View>
                            ) : null}
                        </View>
                    ) : null}

                    <MaterialCommunityIcons
                        name='file-pdf-box'
                        color='#FF5B57'
                        size={24}
                    />

                    <View style={styles.fileNameWrap}>
                        <Text style={styles.fileName} numberOfLines={1}>
                            {file.originalname}
                        </Text>
                        {!isMain && showSignatureDots ? (
                            <View style={styles.signatureRow}>
                                {dots.map((color, idx) =>
                                    renderSignatureDot(
                                        color,
                                        `${color}-${idx}`,
                                    ),
                                )}
                            </View>
                        ) : null}
                    </View>
                </View>

                <View
                    style={
                        isMain ? styles.signingFileMetaColumn : styles.fileRight
                    }>
                    <Text
                        style={[
                            styles.fileSize,
                            !isMain && styles.fileRightFileSize,
                        ]}>
                        {formatFileSize(file.size)}
                    </Text>
                    {isMain ? <View style={styles.signingMetaSpacer} /> : null}
                    <TouchableOpacity
                        onPress={openPdfPreview}
                        style={isMain ? styles.signingDownloadBtn : undefined}>
                        <MaterialCommunityIcons
                            name='download'
                            color='#1E88E5'
                            size={20}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        );

        if (!isMain) {
            return fileRow;
        }

        return <View style={styles.signingFileCardOuter}>{fileRow}</View>;
    };

    if (isLoading)
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size='large' color='#4CAF50' />
            </View>
        );
    if (!documentDetail)
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                    Không tìm thấy chi tiết văn bản
                </Text>
            </View>
        );

    const outgoingStatusLabel = isDocumentManagementView
        ? getStatusLabel(documentDetail.status)
        : getOutgoingDetailStatusLabel(documentDetail.status, level);

    if (isIncomingDocumentView) {
        return (
            <SafeAreaView style={styles.container}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.documentTitle}>
                        {documentDetail.title}
                    </Text>
                    <View style={styles.subHeaderRow}>
                        <Text
                            style={[
                                styles.registeredNumber,
                                {color: '#2E9E4D'},
                            ]}>
                            {documentDetail.registeredNumber}
                        </Text>
                        <Text style={styles.createdDate}>
                            {moment(documentDetail.createdAt).format(
                                'HH:mm DD/MM/YYYY',
                            )}
                        </Text>
                    </View>
                    <View style={styles.lineDivider} />

                    <View style={styles.statusRow}>
                        <Text style={styles.statusLabel}>
                            Trạng thái:{' '}
                            <Text
                                style={[
                                    styles.statusValue,
                                    {color: incomingStatusColor},
                                ]}>
                                {incomingStatusLabel}
                            </Text>
                        </Text>
                        <View style={styles.iconActionContainer}>
                            <TouchableOpacity
                                style={styles.actionIconOrange}
                                onPress={() =>
                                    navigation.navigate(
                                        'DOCUMENT_EXECUTION_STEPS',
                                        {stepsInfo},
                                    )
                                }>
                                <MaterialCommunityIcons
                                    name='format-list-numbered'
                                    size={16}
                                    color='#E65100'
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.actionIconGreen}
                                onPress={() =>
                                    navigation.navigate(
                                        SCREEN_INFO.DOCUMENT_COMMUNICATION.key,
                                        {
                                            documentId: documentDetail._id,
                                            communicationHistories:
                                                (documentDetail as any)
                                                    ?.communicationHistories ||
                                                [],
                                        },
                                    )
                                }>
                                <MaterialCommunityIcons
                                    name='message-text-outline'
                                    size={16}
                                    color='#1B5E20'
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.metaRow}>
                        <Text
                            style={[styles.metaLabel, {flex: 1}]}
                            numberOfLines={1}>
                            Loại tài liệu:{' '}
                            <Text style={styles.metaValue}>
                                {documentDetail.categoryDocumentName || ''}
                            </Text>
                        </Text>
                        <Text
                            style={[
                                styles.metaLabel,
                                {flex: 1, textAlign: 'right'},
                            ]}
                            numberOfLines={1}>
                            Mức độ ưu tiên:{' '}
                            <Text style={styles.metaValue}>
                                {getPriorityLabel(documentDetail.priority)}
                            </Text>
                        </Text>
                    </View>
                    <Text style={styles.metaLabel}>
                        Cập nhật lúc:{' '}
                        <Text style={styles.metaValue}>
                            {moment(documentDetail.updatedAt).format(
                                'HH:mm DD/MM/YYYY',
                            )}
                        </Text>
                    </Text>
                    <Text style={[styles.metaLabel, {marginTop: 8}]}>
                        Tổ chức gửi đến:{' '}
                        <Text style={styles.metaValue}>
                            {documentDetail.organization || ''}
                        </Text>
                    </Text>
                    <Text style={[styles.metaLabel, {marginTop: 8}]}>
                        Người gửi đến:{' '}
                        <Text style={styles.metaValue}>
                            {documentDetail.sender || ''}
                        </Text>
                    </Text>
                    {shouldShowIncomingAddress && !!incomingAddress && (
                        <Text style={[styles.metaLabel, {marginTop: 8}]}>
                            Địa chỉ số:{' '}
                            <Text style={styles.metaValue}>
                                {incomingAddress}
                            </Text>
                        </Text>
                    )}
                    {shouldShowIncomingAssignmentInfo &&
                        !!documentDetail?.leadAgency && (
                            <Text style={[styles.metaLabel, {marginTop: 8}]}>
                                Cơ quan chủ trì:{' '}
                                <Text style={styles.metaValue}>
                                    {String(documentDetail?.leadAgency || '')}
                                </Text>
                            </Text>
                        )}
                    {shouldShowIncomingAssignmentInfo &&
                        !!incomingReceiveToKnow && (
                            <Text style={[styles.metaLabel, {marginTop: 8}]}>
                                Người nhận để biết:{' '}
                                <Text style={styles.metaValue}>
                                    {incomingReceiveToKnow}
                                </Text>
                            </Text>
                        )}
                    {shouldShowIncomingAssignmentInfo &&
                        !!incomingSupportDepartments && (
                            <Text style={[styles.metaLabel, {marginTop: 8}]}>
                                Cơ quan phối hợp:{' '}
                                <Text style={styles.metaValue}>
                                    {incomingSupportDepartments}
                                </Text>
                            </Text>
                        )}

                    <View style={styles.blueInfoBox}>
                        <View style={styles.blueInfoRow}>
                            <View style={styles.blueInfoCol}>
                                <Text style={styles.infoLabel}>Người tạo</Text>
                                <Text style={styles.infoValueBlue}>
                                    {documentDetail.creatorFullName ||
                                        documentDetail.creatorName ||
                                        ''}
                                </Text>
                                <Text
                                    style={[styles.infoLabel, {marginTop: 8}]}>
                                    Người chịu trách nhiệm
                                </Text>
                                <Text style={styles.infoValueBlue}>
                                    {currentOwner ||
                                        documentDetail.creatorFullName ||
                                        documentDetail.creatorName ||
                                        ''}
                                </Text>
                            </View>
                            <View style={styles.blueInfoColRight}>
                                <Text style={styles.infoLabel}>Bộ phận</Text>
                                <Text style={styles.infoValueBlue}>
                                    {documentDetail.departmentName || ''}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.orangeBanner}>
                        <Text style={styles.orangeBannerText}>
                            {incomingLevelBannerText}
                        </Text>
                    </View>

                    <View style={styles.webviewContainer}>
                        <AutoHeightWebView
                            originWhitelist={['*']}
                            source={{html: htmlContent}}
                            style={styles.documentContent}
                            scrollEnabled={false}
                        />
                    </View>

                    <View style={styles.attachedDocuments}>
                        <Text style={styles.attachedDocumentsText}>
                            Văn bản trình ký{' '}
                            <Text style={styles.requiredStar}>*</Text>
                        </Text>
                        {mainFiles.length > 0 ? (
                            <FlatList
                                scrollEnabled={false}
                                data={mainFiles}
                                keyExtractor={(item, i) =>
                                    `${
                                        item.filename ||
                                        item.path ||
                                        item.originalname
                                    }-${i}`
                                }
                                renderItem={({item}) =>
                                    renderItemAttachedFiles(item)
                                }
                            />
                        ) : (
                            <Text style={styles.emptyText}>
                                Chưa có văn bản trình ký
                            </Text>
                        )}
                    </View>

                    {attachedOnlyFiles.length > 0 && (
                        <View style={styles.attachedDocuments}>
                            <Text style={styles.attachedDocumentsText}>
                                Tài liệu đính kèm
                            </Text>
                            <FlatList
                                scrollEnabled={false}
                                data={attachedOnlyFiles}
                                keyExtractor={(item, i) =>
                                    `${
                                        item.filename ||
                                        item.path ||
                                        item.originalname
                                    }-${i}`
                                }
                                renderItem={({item}) =>
                                    renderItemAttachedFiles(item)
                                }
                            />
                        </View>
                    )}
                </ScrollView>

                {(shouldShowIncomingApprove || shouldShowIncomingReject) && (
                    <View style={styles.bottomActionsIncoming}>
                        {shouldShowIncomingReject && (
                            <TouchableOpacity
                                style={styles.incomingRejectButton}
                                onPress={() => {
                                    setDecisionType('reject');
                                    setDecisionNote('');
                                    setShowDecisionModal(true);
                                }}>
                                <Text style={styles.incomingRejectButtonText}>
                                    Từ chối
                                </Text>
                            </TouchableOpacity>
                        )}
                        {shouldShowIncomingApprove && (
                            <TouchableOpacity
                                style={styles.incomingActionButton}
                                onPress={() => {
                                    setDecisionType('approve');
                                    setDecisionNote('');
                                    setShowDecisionModal(true);
                                }}>
                                <Text style={styles.incomingActionButtonText}>
                                    {incomingActionLabel}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                <Modal
                    transparent
                    visible={showDecisionModal}
                    animationType='fade'
                    onRequestClose={() => setShowDecisionModal(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalCardIncoming}>
                            <Text style={styles.modalTitleIncoming}>
                                {incomingModalTitle}
                            </Text>
                            <View style={styles.modalDivider} />
                            <Text
                                style={[
                                    styles.modalLabel,
                                    decisionType === 'reject' && {
                                        color: '#FF4B4B',
                                    },
                                ]}>
                                {decisionType === 'reject'
                                    ? 'Nội dung từ chối'
                                    : 'Nội dung đính kèm'}
                            </Text>
                            <TextInput
                                style={[
                                    styles.modalInput,
                                    decisionType === 'reject'
                                        ? {backgroundColor: '#F4DEDE'}
                                        : {backgroundColor: '#E8F3E8'},
                                ]}
                                placeholder='Nhập nội dung...'
                                value={decisionNote}
                                onChangeText={setDecisionNote}
                                multiline
                            />
                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={styles.backBtn}
                                    onPress={() => setShowDecisionModal(false)}
                                    disabled={isSubmittingDecision}>
                                    <Text style={styles.backBtnText}>
                                        Quay lại
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.confirmBtn,
                                        decisionType === 'reject'
                                            ? {backgroundColor: '#FF4B4B'}
                                            : {backgroundColor: '#47B24A'},
                                        isSubmittingDecision && {opacity: 0.7},
                                    ]}
                                    onPress={handleConfirmDecision}
                                    disabled={isSubmittingDecision}>
                                    <Text style={styles.confirmBtnText}>
                                        {isSubmittingDecision
                                            ? 'Đang xử lý...'
                                            : incomingModalConfirmLabel}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                <ModalPdfView
                    visible={showModalPdf}
                    pdfFilePath={selectedPdf || ''}
                    onClose={() => setShowModalPdf(false)}
                />
                {isCurrentDocumentSigningPending && (
                    <View style={styles.mySignPendingOverlay}>
                        <View style={styles.mySignPendingCard}>
                            <ActivityIndicator size='large' color='#4CAF50' />
                            <Text style={styles.mySignPendingText}>
                                {mySignPendingMessage}
                            </Text>
                        </View>
                    </View>
                )}
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}>
                <Text style={styles.documentTitle}>{documentDetail.title}</Text>
                <View style={styles.subHeaderRow}>
                    <Text style={styles.registeredNumber}>
                        Số hiệu văn bản: {documentDetail.registeredNumber}
                    </Text>
                    <Text style={styles.createdDate}>
                        {moment(documentDetail.createdAt).format(
                            'HH:mm DD/MM/YYYY',
                        )}
                    </Text>
                </View>
                <View style={styles.lineDivider} />
                <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>
                        Trạng thái:{' '}
                        <Text style={styles.statusValue}>
                            {outgoingStatusLabel}
                        </Text>
                    </Text>
                    <View style={styles.iconActionContainer}>
                        <TouchableOpacity
                            style={styles.actionIconOrange}
                            onPress={() =>
                                navigation.navigate(
                                    'DOCUMENT_EXECUTION_STEPS',
                                    {stepsInfo},
                                )
                            }>
                            <MaterialCommunityIcons
                                name='format-list-numbered'
                                size={16}
                                color='#E65100'
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.actionIconGreen}
                            onPress={() =>
                                navigation.navigate(
                                    'DOCUMENT_APPROVAL_HISTORY',
                                    {stepsInfo, documentDetail},
                                )
                            }>
                            <MaterialCommunityIcons
                                name='history'
                                size={16}
                                color='#1B5E20'
                            />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.metaRow}>
                    <Text
                        style={[styles.metaLabel, {flex: 1}]}
                        numberOfLines={1}>
                        Loại tài liệu:{' '}
                        <Text style={styles.metaValue}>
                            {documentDetail.categoryDocumentName || ''}
                        </Text>
                    </Text>

                    <Text
                        style={[
                            styles.metaLabel,
                            {flex: 1, textAlign: 'right'},
                        ]}
                        numberOfLines={1}>
                        Mức độ ưu tiên:{' '}
                        <Text style={styles.metaValue}>
                            {getPriorityLabel(documentDetail.priority)}
                        </Text>
                    </Text>
                </View>
                {!isDocumentManagementView && (
                    <Text style={styles.metaLabel}>
                        Cấp ký duyệt:{' '}
                        <Text style={styles.metaValue}>
                            {signedDepartmentLabelMap[
                                String(documentDetail.signedDepartment || '')
                            ] || String(documentDetail.signedDepartment || '')}
                        </Text>
                    </Text>
                )}
                <Text style={styles.metaLabel}>
                    Cập nhật lúc:{' '}
                    <Text style={styles.metaValue}>
                        {moment(documentDetail.updatedAt).format(
                            'HH:mm DD/MM/YYYY',
                        )}
                    </Text>
                </Text>

                <View style={styles.blueInfoBox}>
                    <View style={styles.blueInfoRow}>
                        <View style={styles.blueInfoCol}>
                            <Text style={styles.infoLabel}>Người tạo</Text>
                            <Text style={styles.infoValueBlue}>
                                {documentDetail.creatorFullName ||
                                    documentDetail.creatorName ||
                                    ''}
                            </Text>
                            <Text style={[styles.infoLabel, {marginTop: 8}]}>
                                Người chịu trách nhiệm
                            </Text>
                            <Text style={styles.infoValueBlue}>
                                {currentOwner || ''}
                            </Text>
                        </View>
                        <View style={styles.blueInfoColRight}>
                            <Text style={styles.infoLabel}>Bộ phận</Text>
                            <Text style={styles.infoValueBlue}>
                                {documentDetail.departmentName || ''}
                            </Text>
                        </View>
                    </View>
                </View>
                <View style={styles.orangeBanner}>
                    <Text style={styles.orangeBannerText}>
                        → {workflowBannerText}
                    </Text>
                </View>

                <View style={styles.webviewContainer}>
                    <AutoHeightWebView
                        originWhitelist={['*']}
                        source={{html: htmlContent}}
                        style={styles.documentContent}
                        scrollEnabled={false}
                    />
                </View>
                <View style={styles.attachedDocuments}>
                    <Text style={styles.signingSectionTitle}>
                        Văn bản trình ký{' '}
                        <Text style={styles.requiredStar}>*</Text>
                    </Text>
                    {mainFiles.length > 0 ? (
                        <FlatList
                            scrollEnabled={false}
                            data={mainFiles}
                            keyExtractor={(item, i) =>
                                `${
                                    item.filename ||
                                    item.path ||
                                    item.originalname
                                }-${i}`
                            }
                            renderItem={({item, index}) =>
                                renderItemAttachedFiles(item, true, index)
                            }
                        />
                    ) : (
                        <Text style={styles.emptyText}></Text>
                    )}
                </View>
                <View style={styles.attachedDocuments}>
                    <Text style={styles.attachedDocumentsText}>
                        Tài liệu đính kèm{' '}
                        <Text style={styles.requiredStar}>*</Text>
                    </Text>
                    {attachedOnlyFiles.length > 0 ? (
                        <FlatList
                            scrollEnabled={false}
                            data={attachedOnlyFiles}
                            keyExtractor={(item, i) =>
                                `${
                                    item.filename ||
                                    item.path ||
                                    item.originalname
                                }-${i}`
                            }
                            renderItem={({item}) =>
                                renderItemAttachedFiles(item)
                            }
                        />
                    ) : (
                        <Text style={styles.emptyText}>
                            Chưa có tài liệu đính kèm
                        </Text>
                    )}
                </View>
                {filesList.length === 0 && (
                    <View style={styles.attachedDocuments}>
                        <Text style={styles.emptyText}>
                            Chưa có file đính kèm trong bản ghi này.
                        </Text>
                    </View>
                )}
            </ScrollView>

            {!isDocumentManagementView &&
                canShowProcessActions &&
                shouldShowManagementActions && (
                    <View style={styles.bottomActions}>
                        <TouchableOpacity
                            style={styles.rejectButton}
                            onPress={() => {
                                setDecisionType('reject');
                                setApproveActionMode('AUTO');
                                setDecisionNote('');
                                setShowDecisionModal(true);
                            }}>
                            <Text style={styles.rejectButtonText}>Từ chối</Text>
                        </TouchableOpacity>
                        {managementFinalApproveMode ? (
                            <TouchableOpacity
                                style={[
                                    styles.approveButton,
                                    styles.approveGreenButton,
                                ]}
                                onPress={() => {
                                    setDecisionType('approve');
                                    setApproveActionMode('MANAGEMENT_FINAL');
                                    setDecisionNote('');
                                    setShowDecisionModal(true);
                                }}>
                                <Text
                                    style={[
                                        styles.approveButtonText,
                                        styles.approveGreenButtonText,
                                    ]}>
                                    Phê duyệt
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <>
                                <TouchableOpacity
                                    style={[
                                        styles.approveButton,
                                        (!managementCanInitialSign ||
                                            isSubmittingDecision) &&
                                            styles.disabledButton,
                                    ]}
                                    disabled={
                                        !managementCanInitialSign ||
                                        isSubmittingDecision
                                    }
                                    onPress={handleDirectInitialSign}>
                                    <Text style={styles.approveButtonText}>
                                        Ký nháy
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.managementSignButton,
                                        (!managementCanSign ||
                                            isSubmittingDecision) &&
                                            styles.disabledButton,
                                    ]}
                                    disabled={
                                        !managementCanSign ||
                                        isSubmittingDecision
                                    }
                                    onPress={handleDirectManagementSign}>
                                    <Text
                                        style={styles.managementSignButtonText}>
                                        Ký thật
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                )}
            {!isDocumentManagementView &&
                canShowProcessActions &&
                level !== EOrganization.MANAGEMENT &&
                shouldShowOutgoingNonManagementActions && (
                    <View style={styles.bottomActions}>
                        {(!isStationaryLevel || shouldShowStationaryReject) && (
                            <TouchableOpacity
                                style={styles.rejectButton}
                                onPress={() => {
                                    setDecisionType('reject');
                                    setApproveActionMode('AUTO');
                                    setDecisionNote('');
                                    setShowDecisionModal(true);
                                }}>
                                <Text style={styles.rejectButtonText}>
                                    Từ chối
                                </Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={[
                                styles.approveButton,
                                (isOutgoingApproveDisabled ||
                                    isSubmittingDecision) &&
                                    styles.disabledButton,
                                departmentApproveMode &&
                                    styles.approveGreenButton,
                                isStationaryLevel &&
                                    stationaryPrimaryMode === 'PUBLISH' &&
                                    styles.publishButton,
                                isStationaryLevel &&
                                    stationaryPrimaryMode === 'ARCHIVE' &&
                                    styles.archiveButton,
                                isStationaryLevel &&
                                    stationaryPrimaryMode === 'SUBMIT_BGD' &&
                                    styles.approveGreenButton,
                                isStationaryLevel &&
                                    stationaryPrimaryMode !== 'SUBMIT_BGD' && {
                                        flex: 1,
                                        backgroundColor:
                                            stationaryPrimaryMode === 'PUBLISH'
                                                ? '#FF9800'
                                                : '#43A047',
                                    },
                            ]}
                            disabled={
                                isOutgoingApproveDisabled ||
                                isSubmittingDecision
                            }
                            onPress={() => {
                                if (
                                    !isStationaryLevel &&
                                    !departmentApproveMode
                                ) {
                                    handleDirectInitialSign();
                                    return;
                                }
                                setDecisionType('approve');
                                setApproveActionMode(
                                    isStationaryLevel
                                        ? stationaryPrimaryMode === 'PUBLISH'
                                            ? 'STATIONARY_PUBLISH'
                                            : stationaryPrimaryMode ===
                                              'ARCHIVE'
                                            ? 'STATIONARY_ARCHIVE'
                                            : 'STATIONARY_SUBMIT'
                                        : departmentApproveMode
                                        ? 'DEPARTMENT_APPROVE'
                                        : 'DEPARTMENT_INITIAL',
                                );
                                setDecisionNote('');
                                setShowDecisionModal(true);
                            }}>
                            <Text
                                style={[
                                    styles.approveButtonText,
                                    departmentApproveMode &&
                                        styles.approveGreenButtonText,
                                    hasRedCheck &&
                                        !departmentApproveMode && {
                                            color: '#4CAF50',
                                        },
                                    isStationaryLevel &&
                                        stationaryPrimaryMode !==
                                            'SUBMIT_BGD' && {color: '#fff'},
                                    isStationaryLevel &&
                                        stationaryPrimaryMode ===
                                            'SUBMIT_BGD' &&
                                        styles.approveGreenButtonText,
                                ]}>
                                {isStationaryLevel
                                    ? stationaryPrimaryMode === 'PUBLISH'
                                        ? 'Ban hành văn bản'
                                        : stationaryPrimaryMode === 'ARCHIVE'
                                        ? 'Lưu sổ văn bản'
                                        : 'Trình BGD'
                                    : departmentApproveMode
                                    ? 'Phê duyệt'
                                    : 'Ký nháy'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

            {!isDocumentManagementView && (
                <Modal
                    transparent
                    visible={showDecisionModal}
                    animationType='fade'
                    onRequestClose={() => setShowDecisionModal(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalCard}>
                            <Text style={styles.modalTitle}>
                                {outgoingModalTitle}
                            </Text>
                            <Text
                                style={[
                                    styles.modalLabel,
                                    decisionType === 'reject' && {
                                        color: '#F44336',
                                    },
                                ]}>
                                {decisionType === 'reject'
                                    ? 'Nội dung từ chối'
                                    : 'Nội dung đính kèm'}
                            </Text>
                            <TextInput
                                style={[
                                    styles.modalInput,
                                    decisionType === 'reject' && {
                                        backgroundColor: '#FCE7E7',
                                    },
                                    decisionType === 'approve' && {
                                        backgroundColor: '#E8F3E8',
                                    },
                                ]}
                                placeholder='Nhập nội dung...'
                                value={decisionNote}
                                onChangeText={setDecisionNote}
                                multiline
                            />
                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={styles.backBtn}
                                    onPress={() => setShowDecisionModal(false)}
                                    disabled={isSubmittingDecision}>
                                    <Text style={styles.backBtnText}>
                                        Quay lại
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.confirmBtn,
                                        decisionType === 'reject' && {
                                            backgroundColor: '#FF4B4B',
                                        },
                                        decisionType === 'approve' &&
                                            isStationaryLevel &&
                                            approveActionMode ===
                                                'STATIONARY_PUBLISH' && {
                                                backgroundColor: '#FF9800',
                                            },
                                        decisionType === 'approve' &&
                                            isStationaryLevel &&
                                            approveActionMode ===
                                                'STATIONARY_ARCHIVE' && {
                                                backgroundColor: '#43A047',
                                            },
                                        decisionType === 'approve' &&
                                            (approveActionMode ===
                                                'MANAGEMENT_SIGN' ||
                                                approveActionMode ===
                                                    'MANAGEMENT_FINAL') && {
                                                backgroundColor: '#43A047',
                                            },
                                        decisionType === 'approve' &&
                                            (departmentApproveMode ||
                                                (isStationaryLevel &&
                                                    approveActionMode ===
                                                        'STATIONARY_SUBMIT')) && {
                                                backgroundColor: '#4CAF50',
                                            },
                                        isSubmittingDecision && {opacity: 0.7},
                                    ]}
                                    onPress={handleConfirmDecision}
                                    disabled={isSubmittingDecision}>
                                    <Text style={styles.confirmBtnText}>
                                        {isSubmittingDecision
                                            ? 'Đang xử lý...'
                                            : outgoingModalConfirmLabel}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
            <ModalPdfView
                visible={showModalPdf}
                pdfFilePath={selectedPdf || ''}
                onClose={() => setShowModalPdf(false)}
            />
            {isCurrentDocumentSigningPending && (
                <View style={styles.mySignPendingOverlay}>
                    <View style={styles.mySignPendingCard}>
                        <ActivityIndicator size='large' color='#4CAF50' />
                        <Text style={styles.mySignPendingText}>
                            {mySignPendingMessage}
                        </Text>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: '#FFFFFF'},
    scrollContent: {
        paddingHorizontal: 14,
        paddingTop: 10,
        paddingBottom: 24,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    emptyContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
    emptyText: {color: '#78909C'},
    documentTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1A1A',
        lineHeight: 22,
    },
    subHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    registeredNumber: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1A1A1A',
        flex: 1,
    },

    createdDate: {
        fontSize: 11,
        color: '#777',
        fontStyle: 'italic',
    },
    lineDivider: {height: 1, backgroundColor: '#D3D3D3', marginBottom: 14},
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    statusLabel: {
        fontSize: 15,
        color: '#8A8A8A',
        fontWeight: '400',
    },

    statusValue: {
        fontSize: 15,
        color: '#43A047',
        fontWeight: '700',
    },
    iconActionContainer: {flexDirection: 'row', gap: 10},
    actionIconOrange: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FCE7C8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionIconGreen: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#D8ECD6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    metaLabel: {
        fontSize: 12,
        color: '#9A9A9A',
    },
    metaValue: {
        color: '#2B2F33',
        fontWeight: '500',
    },
    blueInfoBox: {
        backgroundColor: '#EAF2FA',
        borderLeftWidth: 3,
        borderLeftColor: '#1E88E5',
        paddingVertical: 12,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginTop: 12,
        marginBottom: 14,
    },
    blueInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    blueInfoCol: {flex: 1},
    blueInfoColRight: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoLabel: {fontSize: 12, color: '#3F4A56', marginBottom: 2},
    infoValueBlue: {fontSize: 13, color: '#1E88E5', fontWeight: '500'},
    orangeBanner: {
        backgroundColor: '#FFF4E5',
        borderLeftWidth: 3,
        borderLeftColor: '#FF9800',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 6,
        marginBottom: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },

    orangeBannerText: {
        fontSize: 16,
        color: '#F39C12',
        fontStyle: 'italic',
        fontWeight: '500',
    },
    webviewContainer: {marginTop: 6, marginBottom: 12},
    documentContent: {
        width: Dimensions.get('window').width - 28,
        backgroundColor: '#FFFFFF',
    },
    attachedDocuments: {marginTop: 8},
    attachedDocumentsText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#222',
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        marginBottom: 14,
    },
    requiredStar: {color: '#F44336'},
    signingSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#222',
        marginBottom: 10,
    },
    signingFileCardOuter: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#B3D4FC',
        padding: 10,
        marginBottom: 12,
        minHeight: 88,
    },
    signingFileInner: {
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        minHeight: 72,
        flexDirection: 'row',
        alignItems: 'stretch',
    },
    signingCheckboxColumn: {
        alignItems: 'center',
        marginRight: 8,
        minWidth: 24,
    },
    signingCheckboxPlaceholder: {
        width: 21,
        height: 21,
    },
    signatureRowUnderCheckbox: {
        flexDirection: 'row',
        gap: 6,
        marginTop: 8,
    },
    signatureDot: {
        width: 17,
        height: 17,
        borderRadius: 8.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    signingFileMetaColumn: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        minHeight: 52,
        marginLeft: 8,
    },
    signingMetaSpacer: {
        flex: 1,
        minHeight: 4,
    },
    signingDownloadBtn: {
        paddingBottom: 2,
    },
    fileCard: {
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },

    fileLeft: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1,
    },

    fileRight: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
    },

    checkboxWrap: {
        marginRight: 10,
        marginTop: 1,
    },

    fileNameWrap: {
        flex: 1,
        marginLeft: 10,
    },

    fileName: {
        fontSize: 14,
        color: '#3A3A3A',
        fontWeight: '400',
    },

    fileSize: {
        fontSize: 13,
        color: '#5F5F5F',
    },
    fileRightFileSize: {
        marginRight: 14,
    },

    signatureRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
    },
    bottomActionsIncoming: {
        paddingHorizontal: 14,
        paddingTop: 8,
        paddingBottom: 10,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        gap: 8,
    },
    incomingActionButton: {
        height: 44,
        borderRadius: 8,
        backgroundColor: '#47B24A',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    incomingActionButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    incomingRejectButton: {
        height: 44,
        borderRadius: 8,
        backgroundColor: '#F5DCDC',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    incomingRejectButtonText: {
        color: '#E54E4E',
        fontSize: 16,
        fontWeight: '700',
    },
    bottomActions: {
        flexDirection: 'row',
        gap: 10,
        padding: 12,
        backgroundColor: '#F2F2F2',
    },
    rejectButton: {
        flex: 1,
        backgroundColor: '#E53935',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        height: 44,
    },
    rejectButtonText: {color: '#FFFFFF', fontWeight: '700'},
    approveButton: {
        flex: 1,
        backgroundColor: '#F59E0B',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        height: 44,
    },
    approveButtonText: {color: '#FFFFFF', fontWeight: '700'},
    disabledButton: {opacity: 0.5},
    managementSignButton: {
        flex: 1,
        backgroundColor: '#0F766E',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        height: 44,
    },
    managementSignButtonText: {color: '#FFFFFF', fontWeight: '700'},
    approveGreenButton: {backgroundColor: '#43A047'},
    approveGreenButtonText: {color: '#FFFFFF'},
    publishButton: {backgroundColor: '#FF9800'},
    archiveButton: {backgroundColor: '#4CAF50'},
    modalDivider: {
        height: 1,
        backgroundColor: '#E6E6E6',
        marginHorizontal: -14,
        marginBottom: 12,
    },
    modalCardIncoming: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 14,
    },
    modalTitleIncoming: {
        textAlign: 'center',
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 10,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    modalCard: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 14,
    },
    modalTitle: {
        textAlign: 'center',
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 12,
    },
    modalLabel: {color: '#4CAF50', fontWeight: '500', marginBottom: 6},
    modalInput: {
        backgroundColor: '#E8F3E8',
        borderRadius: 10,
        minHeight: 110,
        padding: 10,
        textAlignVertical: 'top',
    },
    modalActions: {flexDirection: 'row', gap: 14, marginTop: 16},
    backBtn: {
        flex: 1,
        height: 42,
        borderRadius: 10,
        backgroundColor: '#D3D3D3',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backBtnText: {fontWeight: '600'},
    confirmBtn: {
        flex: 1,
        height: 42,
        borderRadius: 10,
        backgroundColor: '#47B24A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmBtnText: {color: '#fff', fontWeight: '700'},
    mySignPendingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        zIndex: 99,
    },
    mySignPendingCard: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 14,
        paddingVertical: 22,
        paddingHorizontal: 16,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    mySignPendingText: {
        fontSize: 15,
        color: '#2B2F33',
        textAlign: 'center',
        fontWeight: '500',
    },
    publishConfirmBtn: {backgroundColor: '#47B24A'},
});

export default DetailDocuments;
