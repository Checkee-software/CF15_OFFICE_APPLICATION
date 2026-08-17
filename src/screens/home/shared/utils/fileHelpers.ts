/**
 * Shared file utilities for Incoming and Outgoing modules.
 * Pure functions only – no React state or API calls.
 */

import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import { Alert } from 'react-native';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TExistingFileSource =
    | 'mainFiles'
    | 'signedFiles'
    | 'approvedFiles'
    | 'attachedFiles';

export type TExistingFile = {
    fileKey: string;
    filename: string;
    originalname: string;
    source?: TExistingFileSource;
};

export type TPickedFile = {
    uri: string;
    name: string;
    type: string;
    size?: number;
};

// ---------------------------------------------------------------------------
// Filename utilities
// ---------------------------------------------------------------------------

export const getSafeBaseName = (value?: string): string => {
    const raw = String(value || '').trim();
    if (!raw) { return ''; }
    const noQuery = raw.split('?')[0].split('#')[0];
    const slashParts = noQuery.split('/');
    const lastSlashPart = slashParts[slashParts.length - 1] || '';
    const backslashParts = lastSlashPart.split('\\');
    return backslashParts[backslashParts.length - 1] || lastSlashPart;
};

export const normalizeDisplayName = (value?: string): string => {
    const raw = String(value || '').trim();
    if (!raw) { return ''; }
    if (raw.includes('/') || raw.includes('\\')) {
        return getSafeBaseName(raw);
    }
    return raw;
};

// ---------------------------------------------------------------------------
// File normalization
// ---------------------------------------------------------------------------

/**
 * Normalize a raw file object (from API or file picker) into a TExistingFile.
 * Uses the most complete candidate resolution (compatible with both Incoming and Outgoing).
 */
export const normalizeExistingFile = (
    file: any,
    fallbackPrefix: string,
    index: number,
    source?: TExistingFileSource,
): TExistingFile => {
    const rawString = typeof file === 'string' ? file : '';

    const backendFilenameCandidates = [
        file?.filename,
        file?.fileName,
        file?.file?.filename,
        file?.file?.fileName,
        rawString,
        getSafeBaseName(
            file?.filename ||
                file?.fileName ||
                file?.file?.filename ||
                file?.file?.fileName ||
                file?.path ||
                file?.url ||
                file?.uri ||
                file?.location ||
                rawString,
        ),
    ]
        .map((item: any) => String(item || '').trim())
        .filter(
            (item: string) =>
                Boolean(item) && !item.includes('/') && !item.includes('\\'),
        );

    const uiKeyCandidates = [
        ...backendFilenameCandidates,
        file?._id,
        file?.id,
        file?.key,
        file?.fileKey,
        file?.path,
        file?.url,
        file?.uri,
        file?.location,
    ]
        .map((item: any) => String(item || '').trim())
        .filter(Boolean);

    const displayCandidates = [
        file?.originalname,
        file?.originalName,
        file?.file?.originalname,
        file?.file?.originalName,
        file?.name,
        file?.displayName,
        file?.title,
        file?.filename,
        file?.fileName,
        rawString,
    ]
        .map((item: any) => normalizeDisplayName(item))
        .filter(Boolean);

    const backendFilename = backendFilenameCandidates[0] || '';
    const uiKey = uiKeyCandidates[0] || `${fallbackPrefix}-${index}`;
    const fallbackName = `${fallbackPrefix}-file-${index}.pdf`;

    return {
        fileKey: uiKey,
        filename: backendFilename,
        originalname:
            displayCandidates[0] ||
            getSafeBaseName(backendFilename) ||
            fallbackName,
        source,
    };
};

/**
 * Deduplicate existing files by filename/fileKey composite key.
 */
export const dedupeExistingFiles = (files: TExistingFile[]): TExistingFile[] => {
    const seen = new Set<string>();
    return files.filter(file => {
        const key = `${file.filename || ''}|${file.originalname || ''}|${file.fileKey || ''}`;
        if (seen.has(key)) { return false; }
        seen.add(key);
        return true;
    });
};

// ---------------------------------------------------------------------------
// File picker utility
// ---------------------------------------------------------------------------

/**
 * Open a PDF file picker and return selected files.
 * Returns empty array if user cancels or an error occurs.
 */
export const pickPdfFiles = async (
    namePrefix = 'file',
    allowMultiSelection = true,
): Promise<TPickedFile[]> => {
    try {
        const result = await pick({
            type: [types.pdf],
            allowMultiSelection,
        });
        return result.map((f: any) => ({
            uri: f.uri,
            name: f.name || `${namePrefix}-${Date.now()}.pdf`,
            type: f.type || 'application/pdf',
            size: f.size,
        }));
    } catch (e: any) {
        if (isErrorWithCode(e) && e.code === errorCodes.OPERATION_CANCELED) {
            return [];
        }
        Alert.alert(
            'Lỗi chọn file',
            'Thiếu module chọn file trong bản build hiện tại. Vui lòng build lại ứng dụng.',
        );
        return [];
    }
};

// ---------------------------------------------------------------------------
// Array helpers (used by Outgoing)
// ---------------------------------------------------------------------------

export const asArray = (value: any): any[] => {
    if (Array.isArray(value)) { return value; }
    if (value === null || value === undefined) { return []; }
    if (typeof value === 'string') { return [{ path: value }]; }
    if (typeof value === 'object') { return [value]; }
    return [];
};

export const pickByType = (files: any[], typeCodes: string[]): any[] =>
    files.filter((f: any) =>
        typeCodes.includes(
            String(
                f?.type || f?.fileType || f?.file?.type || f?.file?.fileType || '',
            ).toUpperCase(),
        ),
    );
