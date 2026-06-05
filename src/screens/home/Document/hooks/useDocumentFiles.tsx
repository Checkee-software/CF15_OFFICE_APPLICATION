import {useMemo} from 'react';
import {IDocument} from '@/shared-types/Response/DocumentResponse/DocumentResponse';
import {AttachedFiles} from '../utils/types';

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

const getFileType = (file: any) =>
    String(
        file?.type ||
            file?.fileType ||
            file?.uploadType ||
            file?.file?.type ||
            file?.file?.fileType ||
            file?.file?.uploadType ||
            '',
    ).toUpperCase();

const pickByType = (files: any[], types: string[]) =>
    files.filter((f: any) => {
        const fileType = getFileType(f);
        return types.some(type => fileType === type || fileType.includes(type));
    });

const getFileNameFromPath = (path: string) => {
    const clean = String(path || '').replace(/\\/g, '/');
    const parts = clean.split('/').filter(Boolean);
    return parts.length ? parts[parts.length - 1] : '';
};

const getFileKey = (file: AttachedFiles) =>
    file.filename || file.path || `${file.source}-${file.originalname}`;

export const normalizeFiles = (
    files: any[] = [],
    source = '',
    defaultGroup: 'main' | 'attached' = 'main',
): AttachedFiles[] =>
    files
        .map((file: any, index: number) => {
            const fileType = getFileType(file);
            const group = fileType.includes('ATTACHED')
                ? 'attached'
                : fileType.includes('ATTACHMENT')
                ? 'attached'
                : fileType.includes('MAIN') ||
                  fileType.includes('SIGNED') ||
                  fileType.includes('SIGN')
                ? 'main'
                : defaultGroup;

            return {
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
                group,
                signStatus: file?.signStatus || '',
                managerInitialedAt: file?.managerInitialedAt || null,
                managerSignedAt: file?.managerSignedAt || null,
                directorInitialedAt: file?.directorInitialedAt || null,
                directorApprovedAt: file?.directorApprovedAt || null,
            };
        })
        .filter(file => !!String(file?.originalname || '').trim());

export const collectNestedFiles = (root: any): any[] => {
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
            if (value && typeof value === 'object' && !Array.isArray(value)) {
                queue.push(value);
            }
        });
    }
    return buckets;
};

export function useDocumentFiles(
    documentDetail: IDocument | null,
    routeItemDocument?: IDocument,
    isIncomingDocumentView = false,
) {
    const filesList: AttachedFiles[] = useMemo(() => {
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
            const key = getFileKey(file);
            if (!uniqueMap.has(key)) {
                uniqueMap.set(key, file);
            } else {
                const existing = uniqueMap.get(key)!;
                if (
                    existing.group === 'attached' &&
                    file.group !== 'attached'
                ) {
                    uniqueMap.set(key, {...existing, ...file, group: 'main'});
                }
            }
        });
        return Array.from(uniqueMap.values());
    }, [documentDetail, routeItemDocument]);

    const mainFiles = useMemo(() => {
        const list = filesList.filter(file => file.group !== 'attached');
        if (!isIncomingDocumentView) {
            const signedOrApprovedFiles = list.filter(
                file =>
                    file.source === 'signedFiles' ||
                    file.source === 'approvedFiles' ||
                    file.source === 'route.signedFiles' ||
                    file.source === 'route.approvedFiles',
            );

            if (signedOrApprovedFiles.length > 0) {
                return signedOrApprovedFiles;
            }

            if (list.length > 0) {
                return list;
            }
        }
        return list;
    }, [filesList, isIncomingDocumentView]);

    const attachedOnlyFiles = useMemo(() => {
        const mainFileKeys = new Set(mainFiles.map(file => getFileKey(file)));

        return filesList.filter(
            file =>
                file.group === 'attached' &&
                (isIncomingDocumentView || !mainFileKeys.has(getFileKey(file))),
        );
    }, [filesList, isIncomingDocumentView, mainFiles]);

    return {filesList, mainFiles, attachedOnlyFiles};
}
