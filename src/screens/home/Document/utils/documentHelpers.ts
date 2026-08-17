import ENV from '@/config/ENV';
import {
    EDocumentStatus,
    getStatusLabel,
} from '@/shared-types/common/Document/document';
import {EOrganization} from '@/shared-types/common/Permissions/Permissions';
import {AttachedFiles, OUTGOING_DETAIL_STATUS_DISPLAY} from './types';

export function getFileUrl(filePath: string) {
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
}

export function formatFileSize(size?: number) {
    if (!size || size <= 0) {
        return '-';
    }
    return size >= 1024 * 1024
        ? `${(size / (1024 * 1024)).toFixed(1)} mb`
        : `${(size / 1024).toFixed(1)} kb`;
}

export function isSigningCompletedForSelectedFile(
    documentCandidate: any,
    selectedFileName: string,
) {
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
}

export function getSignatureDotsForFile(file: AttachedFiles): string[] {
    const dots: string[] = [];
    const signStatus = String(file.signStatus || '').toUpperCase();

    const hasRed =
        !!file.managerInitialedAt ||
        !!file.managerSignedAt ||
        signStatus.includes('MANAGER_INITIAL') ||
        signStatus.includes('MANAGER_SIGN');
    const hasYellow =
        !!file.directorInitialedAt || signStatus.includes('DIRECTOR_INITIAL');
    const hasGreen =
        !!file.directorApprovedAt ||
        signStatus.includes('DIRECTOR_SIGN') ||
        signStatus.includes('DIRECTOR_APPROV');

    if (hasRed) {
        dots.push('#FF4B4B');
    }
    if (hasYellow) {
        dots.push('#FF9500');
    }
    if (hasGreen) {
        dots.push('#4CAF50');
    }

    return dots;
}

const normalizeDisplayText = (value: any) => String(value || '').trim();

const getEntityDisplayName = (value: any) => {
    if (!value || typeof value !== 'object') {
        return '';
    }

    return normalizeDisplayText(
        value.name ||
            value.fullName ||
            value.departmentName ||
            value.title ||
            value.label ||
            value.displayName,
    );
};

const looksLikeIdOrCode = (value: string) =>
    /^[a-f0-9]{24}$/i.test(value) || /^[A-Z0-9_-]+$/.test(value);

export function getIncomingLeadAgencyLabel(documentCandidate: any) {
    if (!documentCandidate || typeof documentCandidate !== 'object') {
        return '';
    }

    const nameCandidates = [
        getEntityDisplayName(documentCandidate.receiveDepartment),
        getEntityDisplayName(documentCandidate.receiveDepartmentId),
        getEntityDisplayName(documentCandidate.leadAgency),
        getEntityDisplayName(documentCandidate.leadDepartment),
        getEntityDisplayName(documentCandidate.leadDepartmentId),
        normalizeDisplayText(documentCandidate.leadAgencyName),
        normalizeDisplayText(documentCandidate.receiveDepartmentName),
        normalizeDisplayText(documentCandidate.leadDepartmentName),
    ].filter(Boolean);

    if (nameCandidates.length > 0) {
        return nameCandidates[0];
    }

    const leadAgencyText = normalizeDisplayText(documentCandidate.leadAgency);
    return leadAgencyText && !looksLikeIdOrCode(leadAgencyText)
        ? leadAgencyText
        : '';
}

export function getOutgoingDetailStatusLabel(
    status: EDocumentStatus,
    level?: EOrganization,
) {
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
}
