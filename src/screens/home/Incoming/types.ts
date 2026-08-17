import { EDocumentStatus } from '@/shared-types/common/Document/document';

export type TLevelKey = 'LEADER' | 'DEPARTMENT' | 'STATIONARY' | 'MANAGEMENT';

export type TTab = {
    key: string;
    label: string;
    statuses: EDocumentStatus[];
};



export type TIncomingItem = {
    id: string;
    title: string;
    code: string;
    statusLabel: string;
    rawStatus?: EDocumentStatus;
    createdAt?: string;
    finishedAt?: string;
};

export type TFormMode = 'CREATE' | 'LAYOUT_1' | 'LAYOUT_3' | 'LAYOUT_4';

export type TIncomingCardAction = {
    isEditable: boolean;
    forcedMode?: Exclude<TFormMode, 'CREATE'>;
    nextActionLabel?: string;
};

export type TDirectoryUser = {
    _id: string;
    fullName: string;
    departmentId: string;
    departmentName: string;
};

export type TDepartmentOption = {
    id: string;
    name: string;
    code?: string;
};

export type TDropdownListOption = {
    key: string;
    label: string;
    subLabel?: string;
    searchText?: string;
    checked?: boolean;
    onPress?: () => void;
};

export type TIncomingAssignmentDraft = {
    leadDepartmentId: string;
    leadAgencyValue: string;
    leadAgencyPayloadValue: string;
    finishedAtValue: string;
    finishedAtDisplay: string;
    receiveToKnowIds: string[];
    supportDepartmentIds: string[];
    receiveToKnowTextFallback: string;
    supportDepartmentTextFallback: string;
};

export type TFocusableIncomingField =
    | 'title'
    | 'organization'
    | 'sender'
    | 'registeredNumber'
    | 'createdAt'
    | 'finishedAt';
