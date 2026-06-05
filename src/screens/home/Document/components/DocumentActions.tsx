import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import styles from '../styles/styles';

type TStationaryPrimaryMode = 'PUBLISH' | 'ARCHIVE' | 'SUBMIT_BGD' | null;

type TDocumentActionsProps = {
    variant: 'incoming' | 'outgoing';
    shouldShowIncomingApprove?: boolean;
    shouldShowIncomingReject?: boolean;
    incomingActionLabel?: string;
    onIncomingApprove?: () => void;
    onReject: () => void;
    isDocumentManagementView?: boolean;
    canShowProcessActions?: boolean;
    isManagementLevel?: boolean;
    shouldShowManagementActions?: boolean;
    managementFinalApproveMode?: boolean;
    managementCanInitialSign?: boolean;
    managementCanSign?: boolean;
    isSubmittingDecision?: boolean;
    onManagementFinalApprove?: () => void;
    onDirectInitialSign?: () => void;
    onDirectManagementSign?: () => void;
    shouldShowOutgoingNonManagementActions?: boolean;
    isStationaryLevel?: boolean;
    shouldShowStationaryReject?: boolean;
    isOutgoingApproveDisabled?: boolean;
    departmentApproveMode?: boolean;
    stationaryPrimaryMode?: TStationaryPrimaryMode;
    onOutgoingPrimaryApprove?: () => void;
};

const DocumentActions = ({
    variant,
    shouldShowIncomingApprove = false,
    shouldShowIncomingReject = false,
    incomingActionLabel = '',
    onIncomingApprove,
    onReject,
    isDocumentManagementView = false,
    canShowProcessActions = false,
    isManagementLevel = false,
    shouldShowManagementActions = false,
    managementFinalApproveMode = false,
    managementCanInitialSign = false,
    managementCanSign = false,
    isSubmittingDecision = false,
    onManagementFinalApprove,
    onDirectInitialSign,
    onDirectManagementSign,
    shouldShowOutgoingNonManagementActions = false,
    isStationaryLevel = false,
    shouldShowStationaryReject = false,
    isOutgoingApproveDisabled = false,
    departmentApproveMode = false,
    stationaryPrimaryMode = null,
    onOutgoingPrimaryApprove,
}: TDocumentActionsProps) => {
    if (variant === 'incoming') {
        if (!shouldShowIncomingApprove && !shouldShowIncomingReject) {
            return null;
        }

        return (
            <View style={styles.bottomActionsIncoming}>
                {shouldShowIncomingReject && (
                    <TouchableOpacity
                        style={styles.incomingRejectButton}
                        onPress={onReject}>
                        <Text style={styles.incomingRejectButtonText}>
                            Từ chối
                        </Text>
                    </TouchableOpacity>
                )}
                {shouldShowIncomingApprove && (
                    <TouchableOpacity
                        style={styles.incomingActionButton}
                        onPress={onIncomingApprove}>
                        <Text style={styles.incomingActionButtonText}>
                            {incomingActionLabel}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    }

    const isInitialSignDisabled =
        !managementCanInitialSign || isSubmittingDecision;
    const isManagementSignDisabled = !managementCanSign || isSubmittingDecision;
    const isOutgoingPrimaryDisabled =
        isOutgoingApproveDisabled || isSubmittingDecision;

    return (
        <>
            {!isDocumentManagementView &&
                canShowProcessActions &&
                shouldShowManagementActions && (
                    <View style={styles.bottomActions}>
                        <TouchableOpacity
                            style={styles.rejectButton}
                            onPress={onReject}>
                            <Text style={styles.rejectButtonText}>Từ chối</Text>
                        </TouchableOpacity>
                        {managementFinalApproveMode ? (
                            <TouchableOpacity
                                style={[
                                    styles.approveButton,
                                    styles.approveGreenButton,
                                ]}
                                onPress={onManagementFinalApprove}>
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
                                        isInitialSignDisabled &&
                                            styles.disabledButton,
                                    ]}
                                    disabled={isInitialSignDisabled}
                                    onPress={onDirectInitialSign}>
                                    <Text
                                        style={[
                                            styles.approveButtonText,
                                            isInitialSignDisabled &&
                                                styles.disabledButtonText,
                                        ]}>
                                        Ký nháy
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.managementSignButton,
                                        isManagementSignDisabled &&
                                            styles.disabledButton,
                                    ]}
                                    disabled={isManagementSignDisabled}
                                    onPress={onDirectManagementSign}>
                                    <Text
                                        style={[
                                            styles.managementSignButtonText,
                                            isManagementSignDisabled &&
                                                styles.disabledButtonText,
                                        ]}>
                                        Ký thật
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                )}
            {!isDocumentManagementView &&
                canShowProcessActions &&
                !isManagementLevel &&
                shouldShowOutgoingNonManagementActions && (
                    <View style={styles.bottomActions}>
                        {(!isStationaryLevel || shouldShowStationaryReject) && (
                            <TouchableOpacity
                                style={styles.rejectButton}
                                onPress={onReject}>
                                <Text style={styles.rejectButtonText}>
                                    Từ chối
                                </Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={[
                                styles.approveButton,
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
                                isOutgoingPrimaryDisabled &&
                                    styles.disabledButton,
                            ]}
                            disabled={isOutgoingPrimaryDisabled}
                            onPress={onOutgoingPrimaryApprove}>
                            <Text
                                style={[
                                    styles.approveButtonText,
                                    departmentApproveMode &&
                                        styles.approveGreenButtonText,
                                    isStationaryLevel &&
                                        stationaryPrimaryMode !==
                                            'SUBMIT_BGD' && {color: '#fff'},
                                    isStationaryLevel &&
                                        stationaryPrimaryMode ===
                                            'SUBMIT_BGD' &&
                                        styles.approveGreenButtonText,
                                    isOutgoingPrimaryDisabled &&
                                        styles.disabledButtonText,
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
        </>
    );
};

export default DocumentActions;
