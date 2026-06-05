import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
    ActivityIndicator,
    Linking,
    SafeAreaView,
    ScrollView,
    Text,
    View,
} from 'react-native';
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
import {useDocumentStore} from '@/stores/documentStore';
import {EOrganization} from '@/shared-types/common/Permissions/Permissions';
import {useDispatch} from 'react-redux';
import type {AppDispatch} from '@/redux/store';
import SCREEN_INFO from '@/config/SCREEN_CONFIG/screenInfo';
import {
    completeSigningFailed,
    startSigningSession,
} from '@/redux/signingFlowSlice';
import DocumentActions from './components/DocumentActions';
import DocumentContent from './components/DocumentContent';
import DocumentFiles from './components/DocumentFiles';
import DocumentHeader from './components/DocumentHeader';
import DecisionModal from './components/DecisionModal';
import MySignOverlay from './components/MySignOverlay';
import {useDocumentDetail} from './hooks/useDocumentDetail';
import {useDocumentFiles} from './hooks/useDocumentFiles';
import {useMySignPolling} from './hooks/useMySignPolling';
import {
    getFileUrl,
    getIncomingLeadAgencyLabel,
    getOutgoingDetailStatusLabel,
} from './utils/documentHelpers';
import {AttachedFiles, TApproveActionMode} from './utils/types';
import styles from './styles/styles';

const DetailDocuments = ({route, navigation}: any) => {
    const {userInfo} = useAuthStore();
    const {downloadFile} = useDocumentStore();
    const dispatch = useDispatch<AppDispatch>();
    const [incomingDepartmentOptions, setIncomingDepartmentOptions] = useState<
        {id: string; name: string; code: string}[]
    >([]);
    const [showModalPdf, setShowModalPdf] = useState(false);
    const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
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
    const {documentDetail, stepsInfo, isLoading, fetchDetail} =
        useDocumentDetail({route, initialDocument: routeItemDocument});
    const currentDocumentId = String(
        documentDetail?._id ||
            route?.params?.documentId ||
            routeItemDocument?._id ||
            '',
    );
    const {
        resumeMySignPolling,
        isCurrentDocumentSigningPending,
        mySignPendingMessage,
    } = useMySignPolling(currentDocumentId, fetchDetail);
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
        [],
    );

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
                text: error?.response?.data?.message || 'Ký nháy thất bại',
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
                    completeSigningFailed('Không mở được ứng dụng MySign'),
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
                text: error?.response?.data?.message || 'Ký thật thất bại',
                duration: Snackbar.LENGTH_SHORT,
            });
        } finally {
            setIsSubmittingDecision(false);
        }
    };

    const isIncomingFileGroupingView = useMemo(() => {
        const status = documentDetail?.status as EDocumentStatus | undefined;
        const incomingStatuses = [
            EDocumentStatus.STATIONARY_RECEIVED,
            EDocumentStatus.MANAGEMENT_REVIEWING,
            EDocumentStatus.REGISTERED,
            EDocumentStatus.ASSIGNED,
            EDocumentStatus.PROCESSING,
            EDocumentStatus.COMPLETED,
        ];
        const incomingMetadata = [
            (documentDetail as any)?.destinationCategoryId,
            (routeItemDocument as any)?.destinationCategoryId,
            (documentDetail as any)?.leadAgency,
            (routeItemDocument as any)?.leadAgency,
            (documentDetail as any)?.receiveDepartmentId,
            (routeItemDocument as any)?.receiveDepartmentId,
            (documentDetail as any)?.receiveToKnowDepartments,
            (routeItemDocument as any)?.receiveToKnowDepartments,
            (documentDetail as any)?.supportDepartments,
            (routeItemDocument as any)?.supportDepartments,
        ].some(Boolean);

        return (
            isIncomingDocumentView ||
            incomingStatuses.includes(status as EDocumentStatus) ||
            incomingMetadata
        );
    }, [documentDetail, isIncomingDocumentView, routeItemDocument]);

    const {filesList, mainFiles, attachedOnlyFiles} = useDocumentFiles(
        documentDetail,
        routeItemDocument,
        isIncomingFileGroupingView,
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

        const signedDepartment = String(
            documentDetail?.signedDepartment || '',
        ).toUpperCase();
        const status = documentDetail?.status as EDocumentStatus | undefined;
        const isDepartmentApproved =
            signedDepartment === 'DEPARTMENT' &&
            [
                EDocumentStatus.MANAGER_APPROVING,
                EDocumentStatus.ARCHIVED,
                EDocumentStatus.READY_TO_PUBLISH,
                EDocumentStatus.OFFICIAL_PUBLISHED,
            ].includes(status as EDocumentStatus);

        if (isDepartmentApproved) {
            return 'Trưởng phòng đã phê duyệt';
        }

        return (
            signedDepartmentActionMap[
                String(documentDetail?.signedDepartment || '')
            ] || 'Luồng xử lý văn bản'
        );
    }, [
        documentDetail?.signedDepartment,
        documentDetail?.status,
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
    const incomingLeadAgencyLookupValue = useMemo(() => {
        const raw =
            (documentDetail as any)?.leadAgency ||
            (routeItemDocument as any)?.leadAgency ||
            (documentDetail as any)?.receiveDepartmentId ||
            (routeItemDocument as any)?.receiveDepartmentId;

        if (raw && typeof raw === 'object') {
            return String(
                raw._id || raw.id || raw.value || raw.code || '',
            ).trim();
        }

        return String(raw || '').trim();
    }, [documentDetail, routeItemDocument]);
    const incomingLeadAgencyNameFromPayload =
        getIncomingLeadAgencyLabel(documentDetail) ||
        getIncomingLeadAgencyLabel(routeItemDocument);
    const incomingLeadAgencyNameFromOptions =
        incomingDepartmentOptions.find(
            item =>
                item.id === incomingLeadAgencyLookupValue ||
                item.code === incomingLeadAgencyLookupValue,
        )?.name || '';
    const incomingLeadAgencyName =
        incomingLeadAgencyNameFromPayload || incomingLeadAgencyNameFromOptions;
    const shouldShowIncomingAddress =
        incomingStatus === EDocumentStatus.REGISTERED ||
        incomingStatus === EDocumentStatus.ASSIGNED ||
        incomingStatus === EDocumentStatus.PROCESSING ||
        incomingStatus === EDocumentStatus.COMPLETED;
    const shouldShowIncomingAssignmentInfo =
        incomingStatus === EDocumentStatus.ASSIGNED ||
        incomingStatus === EDocumentStatus.PROCESSING ||
        incomingStatus === EDocumentStatus.COMPLETED;
    useEffect(() => {
        if (
            !isIncomingDocumentView ||
            !shouldShowIncomingAssignmentInfo ||
            incomingLeadAgencyNameFromPayload ||
            !incomingLeadAgencyLookupValue ||
            incomingDepartmentOptions.length > 0
        ) {
            return;
        }

        let isCancelled = false;
        const normalizeList = (payload: any) => {
            if (Array.isArray(payload?.data?.data)) return payload.data.data;
            if (Array.isArray(payload?.data)) return payload.data;
            if (Array.isArray(payload)) return payload;
            return [];
        };

        const loadDepartmentOptions = async () => {
            try {
                const response = await axiosClient.get(
                    `${ENV.BACKEND_URL}/resources/departments/selection`,
                );
                const departments = normalizeList(response?.data);
                const options = departments
                    .map((dep: any) => ({
                        id: String(dep?._id || dep?.id || dep?.value || ''),
                        name: String(
                            dep?.name ||
                                dep?.departmentName ||
                                dep?.label ||
                                '',
                        ),
                        code: String(dep?.code || dep?.departmentCode || ''),
                    }))
                    .filter(
                        (dep: {id: string; name: string}) => dep.id && dep.name,
                    );

                if (!isCancelled) {
                    setIncomingDepartmentOptions(options);
                }
            } catch {}
        };

        loadDepartmentOptions();

        return () => {
            isCancelled = true;
        };
    }, [
        incomingDepartmentOptions.length,
        incomingLeadAgencyLookupValue,
        incomingLeadAgencyNameFromPayload,
        isIncomingDocumentView,
        shouldShowIncomingAssignmentInfo,
    ]);
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
    const openPdfPreview = (file: AttachedFiles) => {
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

    const getDownloadFilePathName = (file: AttachedFiles) => {
        const pathFileName = String(file.path || '')
            .replace(/\\/g, '/')
            .split('/')
            .filter(Boolean)
            .pop();

        return String(
            pathFileName || file.filename || file.originalname || '',
        ).trim();
    };

    const handleDownloadFile = async (file: AttachedFiles) => {
        const fileSource = String(
            file.path || file.filename || getDownloadFilePathName(file),
        ).trim();
        const displayFileName = String(
            file.originalname || file.filename || getDownloadFilePathName(file),
        ).trim();

        if (!fileSource) {
            Snackbar.show({
                text: 'File chưa có thông tin tải xuống',
                duration: Snackbar.LENGTH_SHORT,
            });
            return;
        }

        await downloadFile(fileSource, displayFileName);
    };

    const getIsCheckboxDisabled = (file: AttachedFiles) =>
        (isDepartmentLevel &&
            (!departmentCanHandleCurrentStep || departmentApproveMode)) ||
        isStationaryLevel ||
        (isManagementLevel &&
            (managementFinalApproveMode || hasDirectorApproved(file)));

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
    const outgoingSignedDepartmentLabel =
        signedDepartmentLabelMap[
            String(documentDetail.signedDepartment || '')
        ] || String(documentDetail.signedDepartment || '');
    const outgoingConfirmButtonStyle = [
        decisionType === 'approve' &&
            isStationaryLevel &&
            approveActionMode === 'STATIONARY_PUBLISH' && {
                backgroundColor: '#FF9800',
            },
        decisionType === 'approve' &&
            isStationaryLevel &&
            approveActionMode === 'STATIONARY_ARCHIVE' && {
                backgroundColor: '#43A047',
            },
        decisionType === 'approve' &&
            (approveActionMode === 'MANAGEMENT_SIGN' ||
                approveActionMode === 'MANAGEMENT_FINAL') && {
                backgroundColor: '#43A047',
            },
        decisionType === 'approve' &&
            (departmentApproveMode ||
                (isStationaryLevel &&
                    approveActionMode === 'STATIONARY_SUBMIT')) && {
                backgroundColor: '#4CAF50',
            },
    ];

    const openRejectDecision = () => {
        setDecisionType('reject');
        setApproveActionMode('AUTO');
        setDecisionNote('');
        setShowDecisionModal(true);
    };
    const openIncomingApproveDecision = () => {
        setDecisionType('approve');
        setDecisionNote('');
        setShowDecisionModal(true);
    };
    const openManagementFinalDecision = () => {
        setDecisionType('approve');
        setApproveActionMode('MANAGEMENT_FINAL');
        setDecisionNote('');
        setShowDecisionModal(true);
    };
    const openOutgoingPrimaryDecision = () => {
        if (!isStationaryLevel && !departmentApproveMode) {
            handleDirectInitialSign();
            return;
        }
        setDecisionType('approve');
        setApproveActionMode(
            isStationaryLevel
                ? stationaryPrimaryMode === 'PUBLISH'
                    ? 'STATIONARY_PUBLISH'
                    : stationaryPrimaryMode === 'ARCHIVE'
                    ? 'STATIONARY_ARCHIVE'
                    : 'STATIONARY_SUBMIT'
                : departmentApproveMode
                ? 'DEPARTMENT_APPROVE'
                : 'DEPARTMENT_INITIAL',
        );
        setDecisionNote('');
        setShowDecisionModal(true);
    };

    if (isIncomingDocumentView) {
        return (
            <SafeAreaView style={styles.container}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}>
                    <DocumentHeader
                        documentDetail={documentDetail}
                        variant='incoming'
                        statusLabel={incomingStatusLabel}
                        statusColor={incomingStatusColor}
                        currentOwner={currentOwner}
                        bannerText={incomingLevelBannerText}
                        onExecutionStepsPress={() =>
                            navigation.navigate('DOCUMENT_EXECUTION_STEPS', {
                                stepsInfo,
                            })
                        }
                        onSecondaryActionPress={() =>
                            navigation.navigate(
                                SCREEN_INFO.DOCUMENT_COMMUNICATION.key,
                                {
                                    documentId: documentDetail._id,
                                    communicationHistories:
                                        (documentDetail as any)
                                            ?.communicationHistories || [],
                                },
                            )
                        }
                        secondaryIconName='message-text-outline'
                        incomingExtra={{
                            shouldShowAddress: shouldShowIncomingAddress,
                            address: incomingAddress,
                            shouldShowAssignmentInfo:
                                shouldShowIncomingAssignmentInfo,
                            leadAgencyName: incomingLeadAgencyName,
                            receiveToKnow: incomingReceiveToKnow,
                            supportDepartments: incomingSupportDepartments,
                        }}
                    />
                    <DocumentContent htmlContent={htmlContent} />
                    <DocumentFiles
                        variant='incoming'
                        filesList={filesList}
                        mainFiles={mainFiles}
                        attachedOnlyFiles={attachedOnlyFiles}
                        checkedIndex={checkedMainFileIndex}
                        setCheckedIndex={setCheckedMainFileIndex}
                        openPdfPreview={openPdfPreview}
                        downloadFile={handleDownloadFile}
                        canProcess={canProcess}
                    />
                </ScrollView>

                <DocumentActions
                    variant='incoming'
                    shouldShowIncomingApprove={shouldShowIncomingApprove}
                    shouldShowIncomingReject={shouldShowIncomingReject}
                    incomingActionLabel={incomingActionLabel}
                    onIncomingApprove={openIncomingApproveDecision}
                    onReject={openRejectDecision}
                />
                <DecisionModal
                    visible={showDecisionModal}
                    onClose={() => setShowDecisionModal(false)}
                    onConfirm={handleConfirmDecision}
                    decisionType={decisionType}
                    decisionNote={decisionNote}
                    setDecisionNote={setDecisionNote}
                    isSubmitting={isSubmittingDecision}
                    title={incomingModalTitle}
                    confirmLabel={incomingModalConfirmLabel}
                    variant='incoming'
                />
                <ModalPdfView
                    visible={showModalPdf}
                    pdfFilePath={selectedPdf || ''}
                    onClose={() => setShowModalPdf(false)}
                />
                <MySignOverlay
                    visible={isCurrentDocumentSigningPending}
                    message={mySignPendingMessage}
                />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}>
                <DocumentHeader
                    documentDetail={documentDetail}
                    variant='outgoing'
                    statusLabel={outgoingStatusLabel}
                    currentOwner={currentOwner}
                    bannerText={`→ ${workflowBannerText}`}
                    onExecutionStepsPress={() =>
                        navigation.navigate('DOCUMENT_EXECUTION_STEPS', {
                            stepsInfo,
                        })
                    }
                    onSecondaryActionPress={() =>
                        navigation.navigate('DOCUMENT_APPROVAL_HISTORY', {
                            stepsInfo,
                            documentDetail,
                        })
                    }
                    secondaryIconName='history'
                    showSignedDepartment={!isDocumentManagementView}
                    signedDepartmentLabel={outgoingSignedDepartmentLabel}
                />
                <DocumentContent htmlContent={htmlContent} />
                <DocumentFiles
                    variant='outgoing'
                    filesList={filesList}
                    mainFiles={mainFiles}
                    attachedOnlyFiles={attachedOnlyFiles}
                    checkedIndex={checkedMainFileIndex}
                    setCheckedIndex={setCheckedMainFileIndex}
                    openPdfPreview={openPdfPreview}
                    downloadFile={handleDownloadFile}
                    canProcess={canProcess}
                    getIsCheckboxDisabled={getIsCheckboxDisabled}
                />
            </ScrollView>

            <DocumentActions
                variant='outgoing'
                onReject={openRejectDecision}
                isDocumentManagementView={isDocumentManagementView}
                canShowProcessActions={canShowProcessActions}
                isManagementLevel={isManagementLevel}
                shouldShowManagementActions={shouldShowManagementActions}
                managementFinalApproveMode={managementFinalApproveMode}
                managementCanInitialSign={managementCanInitialSign}
                managementCanSign={managementCanSign}
                isSubmittingDecision={isSubmittingDecision}
                onManagementFinalApprove={openManagementFinalDecision}
                onDirectInitialSign={handleDirectInitialSign}
                onDirectManagementSign={handleDirectManagementSign}
                shouldShowOutgoingNonManagementActions={
                    shouldShowOutgoingNonManagementActions
                }
                isStationaryLevel={isStationaryLevel}
                shouldShowStationaryReject={shouldShowStationaryReject}
                isOutgoingApproveDisabled={isOutgoingApproveDisabled}
                departmentApproveMode={departmentApproveMode}
                stationaryPrimaryMode={stationaryPrimaryMode}
                onOutgoingPrimaryApprove={openOutgoingPrimaryDecision}
            />

            {!isDocumentManagementView && (
                <DecisionModal
                    visible={showDecisionModal}
                    onClose={() => setShowDecisionModal(false)}
                    onConfirm={handleConfirmDecision}
                    decisionType={decisionType}
                    decisionNote={decisionNote}
                    setDecisionNote={setDecisionNote}
                    isSubmitting={isSubmittingDecision}
                    title={outgoingModalTitle}
                    confirmLabel={outgoingModalConfirmLabel}
                    confirmButtonStyle={outgoingConfirmButtonStyle}
                />
            )}
            <ModalPdfView
                visible={showModalPdf}
                pdfFilePath={selectedPdf || ''}
                onClose={() => setShowModalPdf(false)}
            />
            <MySignOverlay
                visible={isCurrentDocumentSigningPending}
                message={mySignPendingMessage}
            />
        </SafeAreaView>
    );
};

export default DetailDocuments;
