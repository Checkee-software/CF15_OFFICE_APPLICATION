/**
 * Derived list state for the Incoming screen – extracted from useIncomingForm.ts
 * to reduce file size.
 */
import { useMemo } from 'react';
import { IDocument } from '@/shared-types/Response/DocumentResponse/DocumentResponse';
import { EDocumentStatus } from '@/shared-types/common/Document/document';
import {
    INCOMING_ALL_TABS,
    INCOMING_LEVEL_ALLOWED_STATUSES,
    mapIncomingStatusLabel,
    type TLevelKey,
    type TIncomingItem,
    type TTab,
} from '../utils';

export const useIncomingListState = (
    levelKey: TLevelKey,
    listDocument: IDocument[] | null,
    searchText: string,
    activeTabKey: string,
) => {
    const allTabs = useMemo<TTab[]>(
        () => [
            { key: 'ALL', label: 'Tất cả', statuses: [] },
            ...INCOMING_ALL_TABS,
        ],
        [],
    );

    const allowedStatusesByLevel = useMemo<EDocumentStatus[]>(
        () => INCOMING_LEVEL_ALLOWED_STATUSES[levelKey] || [],
        [levelKey],
    );

    const tabs = useMemo<TTab[]>(
        () =>
            allTabs.filter(
                tab =>
                    tab.key === 'ALL' ||
                    tab.statuses.some(status =>
                        allowedStatusesByLevel.includes(status),
                    ),
            ),
        [allTabs, allowedStatusesByLevel],
    );

    const docs = useMemo<TIncomingItem[]>(
        () =>
            (listDocument || []).map((d: IDocument) => ({
                id: d._id,
                title: d.title || '',
                code: d.registeredNumber || '',
                statusLabel: mapIncomingStatusLabel(d.status),
                rawStatus: d.status,
                createdAt: d.createdAt ? String(d.createdAt) : undefined,
                finishedAt: d.finishedAt ? String(d.finishedAt) : undefined,
            })),
        [listDocument],
    );

    const activeTab = useMemo(
        () => tabs.find(t => t.key === activeTabKey) || tabs[0],
        [tabs, activeTabKey],
    );

    const filteredDocs = useMemo(() => {
        if (!activeTab) { return docs; }
        const normalizedSearch = searchText.trim().toLowerCase();
        return docs
            .filter(d => {
                if (!d.rawStatus) { return false; }
                if (activeTab.key === 'ALL') {
                    return allowedStatusesByLevel.includes(d.rawStatus);
                }
                return (
                    activeTab.statuses.includes(d.rawStatus) &&
                    allowedStatusesByLevel.includes(d.rawStatus)
                );
            })
            .filter(
                d =>
                    !normalizedSearch ||
                    `${d.title} ${d.code}`
                        .toLowerCase()
                        .includes(normalizedSearch),
            );
    }, [docs, activeTab, searchText, allowedStatusesByLevel]);

    return {
        tabs,
        docs,
        activeTab,
        filteredDocs,
        allowedStatusesByLevel,
    };
};
