import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import {getPriorityLabel} from '@/shared-types/common/Document/document';
import {IDocument} from '@/shared-types/Response/DocumentResponse/DocumentResponse';
import styles from '../styles/styles';

type TIncomingHeaderExtra = {
    shouldShowAddress: boolean;
    address: string;
    shouldShowAssignmentInfo: boolean;
    leadAgencyName: string;
    receiveToKnow: string;
    supportDepartments: string;
};

type TDocumentHeaderProps = {
    documentDetail: IDocument;
    variant: 'incoming' | 'outgoing';
    statusLabel: string;
    statusColor?: string;
    currentOwner: string;
    bannerText: string;
    onExecutionStepsPress: () => void;
    onSecondaryActionPress: () => void;
    secondaryIconName: string;
    secondaryIconColor?: string;
    showSignedDepartment?: boolean;
    signedDepartmentLabel?: string;
    incomingExtra?: TIncomingHeaderExtra;
};

const DocumentHeader = ({
    documentDetail,
    variant,
    statusLabel,
    statusColor = '#43A047',
    currentOwner,
    bannerText,
    onExecutionStepsPress,
    onSecondaryActionPress,
    secondaryIconName,
    secondaryIconColor = '#1B5E20',
    showSignedDepartment = false,
    signedDepartmentLabel = '',
    incomingExtra,
}: TDocumentHeaderProps) => {
    const detail = documentDetail as any;
    const isIncoming = variant === 'incoming';

    return (
        <>
            <Text style={styles.documentTitle}>{detail.title}</Text>
            <View style={styles.subHeaderRow}>
                <Text
                    style={[
                        styles.registeredNumber,
                        isIncoming && {color: '#2E9E4D'},
                    ]}>
                    {isIncoming
                        ? detail.registeredNumber
                        : `Số hiệu văn bản: ${detail.registeredNumber}`}
                </Text>
                <Text style={styles.createdDate}>
                    {moment(detail.createdAt).format('HH:mm DD/MM/YYYY')}
                </Text>
            </View>
            <View style={styles.lineDivider} />

            <View style={styles.statusRow}>
                <Text style={styles.statusLabel}>
                    Trạng thái:{' '}
                    <Text style={[styles.statusValue, {color: statusColor}]}>
                        {statusLabel}
                    </Text>
                </Text>
                <View style={styles.iconActionContainer}>
                    <TouchableOpacity
                        style={styles.actionIconOrange}
                        onPress={onExecutionStepsPress}>
                        <MaterialCommunityIcons
                            name='format-list-numbered'
                            size={16}
                            color='#E65100'
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionIconGreen}
                        onPress={onSecondaryActionPress}>
                        <MaterialCommunityIcons
                            name={secondaryIconName}
                            size={16}
                            color={secondaryIconColor}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.metaRow}>
                <Text style={[styles.metaLabel, {flex: 1}]} numberOfLines={1}>
                    Loại tài liệu:{' '}
                    <Text style={styles.metaValue}>
                        {detail.categoryDocumentName || ''}
                    </Text>
                </Text>
                <Text
                    style={[styles.metaLabel, {flex: 1, textAlign: 'right'}]}
                    numberOfLines={1}>
                    Mức độ ưu tiên:{' '}
                    <Text style={styles.metaValue}>
                        {getPriorityLabel(detail.priority)}
                    </Text>
                </Text>
            </View>

            {showSignedDepartment && (
                <Text style={styles.metaLabel}>
                    Cấp ký duyệt:{' '}
                    <Text style={styles.metaValue}>
                        {signedDepartmentLabel}
                    </Text>
                </Text>
            )}

            <Text style={styles.metaLabel}>
                Cập nhật lúc:{' '}
                <Text style={styles.metaValue}>
                    {moment(detail.updatedAt).format('HH:mm DD/MM/YYYY')}
                </Text>
            </Text>

            {isIncoming && (
                <>
                    <Text style={[styles.metaLabel, {marginTop: 8}]}>
                        Tổ chức gửi đến:{' '}
                        <Text style={styles.metaValue}>
                            {detail.organization || ''}
                        </Text>
                    </Text>
                    <Text style={[styles.metaLabel, {marginTop: 8}]}>
                        Người gửi đến:{' '}
                        <Text style={styles.metaValue}>
                            {detail.sender || ''}
                        </Text>
                    </Text>
                    {incomingExtra?.shouldShowAddress &&
                        !!incomingExtra.address && (
                            <Text style={[styles.metaLabel, {marginTop: 8}]}>
                                Địa chỉ số:{' '}
                                <Text style={styles.metaValue}>
                                    {incomingExtra.address}
                                </Text>
                            </Text>
                        )}
                    {incomingExtra?.shouldShowAssignmentInfo &&
                        !!incomingExtra.leadAgencyName && (
                            <Text style={[styles.metaLabel, {marginTop: 8}]}>
                                Cơ quan chủ trì:{' '}
                                <Text style={styles.metaValue}>
                                    {incomingExtra.leadAgencyName}
                                </Text>
                            </Text>
                        )}
                    {incomingExtra?.shouldShowAssignmentInfo &&
                        !!incomingExtra.receiveToKnow && (
                            <Text style={[styles.metaLabel, {marginTop: 8}]}>
                                Người nhận để biết:{' '}
                                <Text style={styles.metaValue}>
                                    {incomingExtra.receiveToKnow}
                                </Text>
                            </Text>
                        )}
                    {incomingExtra?.shouldShowAssignmentInfo &&
                        !!incomingExtra.supportDepartments && (
                            <Text style={[styles.metaLabel, {marginTop: 8}]}>
                                Cơ quan phối hợp:{' '}
                                <Text style={styles.metaValue}>
                                    {incomingExtra.supportDepartments}
                                </Text>
                            </Text>
                        )}
                </>
            )}

            <View style={styles.blueInfoBox}>
                <View style={styles.blueInfoRow}>
                    <View style={styles.blueInfoCol}>
                        <Text style={styles.infoLabel}>Người tạo</Text>
                        <Text style={styles.infoValueBlue}>
                            {detail.creatorFullName || detail.creatorName || ''}
                        </Text>
                        <Text style={[styles.infoLabel, {marginTop: 8}]}>
                            Người chịu trách nhiệm
                        </Text>
                        <Text style={styles.infoValueBlue}>
                            {isIncoming
                                ? currentOwner ||
                                  detail.creatorFullName ||
                                  detail.creatorName ||
                                  ''
                                : currentOwner || ''}
                        </Text>
                    </View>
                    <View style={styles.blueInfoColRight}>
                        <Text style={styles.infoLabel}>Bộ phận</Text>
                        <Text style={styles.infoValueBlue}>
                            {detail.departmentName || ''}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.orangeBanner}>
                <Text style={styles.orangeBannerText}>{bannerText}</Text>
            </View>
        </>
    );
};

export default DocumentHeader;
