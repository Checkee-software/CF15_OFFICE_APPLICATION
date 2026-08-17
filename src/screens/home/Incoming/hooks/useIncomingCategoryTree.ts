/**
 * Category tree and lookup logic for the Incoming Assignment section.
 * Extracted from useIncomingFormAssignment.ts to reduce file size.
 */
import { useMemo } from 'react';

export const useIncomingCategoryTree = (
    categories: any[],
    destinationSelectionIds: string[],
) => {
    const categoryById = useMemo<Record<string, any>>(() => {
        const map: Record<string, any> = {};
        categories.forEach(cat => { map[cat._id] = cat; });
        return map;
    }, [categories]);

    const rootCategories = useMemo(
        () => categories.filter(cat => !cat.parentId),
        [categories],
    );

    const childrenByParent = useMemo<Record<string, any[]>>(() => {
        const map: Record<string, any[]> = {};
        categories.forEach(cat => {
            if (!cat.parentId) { return; }
            if (!map[cat.parentId]) { map[cat.parentId] = []; }
            map[cat.parentId].push(cat);
        });
        return map;
    }, [categories]);

    const destinationLevelOptions = useMemo(() => {
        const levels: any[][] = [rootCategories];
        for (let i = 0; i < destinationSelectionIds.length; i += 1) {
            const nextLevel = childrenByParent[destinationSelectionIds[i]] || [];
            if (nextLevel.length > 0) { levels.push(nextLevel); } else { break; }
        }
        return levels;
    }, [destinationSelectionIds, rootCategories, childrenByParent]);

    const selectedDestinationId =
        destinationSelectionIds[destinationSelectionIds.length - 1] || '';

    const destinationPathLabel = useMemo(
        () => destinationSelectionIds
            .map(id => categoryById[id]?.name)
            .filter(Boolean)
            .join(' / '),
        [destinationSelectionIds, categoryById],
    );

    return {
        categoryById,
        rootCategories,
        childrenByParent,
        destinationLevelOptions,
        selectedDestinationId,
        destinationPathLabel,
    };
};
