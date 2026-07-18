import React, {useState, useEffect, useMemo, useCallback, useRef} from 'react';
import {Keyboard} from 'react-native';
import {
    DOCUMENT_PRIORITY_LABEL,
    EDocumentPriority,
} from '@/shared-types/common/Document/document';
import {
    type TDirectoryUser,
    type TDepartmentOption,
    type TDropdownListOption,
    type TIncomingAssignmentDraft,
    formatDate,
    buildOptionSearchText,
} from '../utils';
import {
    loadIncomingAssignmentOptions,
    getAssignmentOptionsCache,
    type TAssignmentOptionsSnapshot,
} from '../utils/assignmentStorage';

export const useIncomingFormAssignment = (
    categories: any[],
    priorityValue: EDocumentPriority | '',
    setPriorityValue: React.Dispatch<
        React.SetStateAction<EDocumentPriority | ''>
    >,
    finishedAtValue: string,
    finishedAtDisplay: string,
    setErrors: React.Dispatch<React.SetStateAction<any>>,
    showForm: boolean,
    showAssignSection: boolean,
    ensureIncomingCategoryList: () => void,
    clearEditorFocus: () => void,
    setFocusedField: (field: any) => void,
    editorFocusedRef: React.RefObject<boolean>,
    resetMenusRef: React.MutableRefObject<() => void>,
    categoryIdValue: string,
    setCategoryIdValue: React.Dispatch<React.SetStateAction<string>>,
    setCategoryNameValue: React.Dispatch<React.SetStateAction<string>>,
) => {
    const [destinationSelectionIds, setDestinationSelectionIds] = useState<
        string[]
    >([]);
    const [destinationCategoryHint, setDestinationCategoryHint] = useState('');
    const [leadDepartmentId, setLeadDepartmentId] = useState('');
    const [leadAgencyValue, setLeadAgencyValue] = useState('');
    const [leadAgencyPayloadValue, setLeadAgencyPayloadValue] = useState('');
    const [receiveToKnowIds, setReceiveToKnowIds] = useState<string[]>([]);
    const [supportDepartmentIds, setSupportDepartmentIds] = useState<string[]>(
        [],
    );
    const [receiveToKnowTextFallback, setReceiveToKnowTextFallback] =
        useState('');
    const [supportDepartmentTextFallback, setSupportDepartmentTextFallback] =
        useState('');

    const [showCategoryMenu, setShowCategoryMenu] = useState(false);
    const [showPriorityMenu, setShowPriorityMenu] = useState(false);
    const [showLeadDepartmentMenu, setShowLeadDepartmentMenu] = useState(false);
    const [showReceiveMenu, setShowReceiveMenu] = useState(false);
    const [showSupportDepartmentMenu, setShowSupportDepartmentMenu] =
        useState(false);
    const [showDestinationLevel, setShowDestinationLevel] = useState<
        number | null
    >(null);

    const [directoryUsers, setDirectoryUsers] = useState<TDirectoryUser[]>([]);
    const [departmentOptions, setDepartmentOptions] = useState<
        TDepartmentOption[]
    >([]);
    const [isLoadingAssignmentOptions, setIsLoadingAssignmentOptions] =
        useState(false);

    const hasLoadedAssignmentOptionsRef = useRef(false);
    const assignmentDraftsRef = useRef<
        Record<string, TIncomingAssignmentDraft>
    >({});

    const applyAssignmentOptionsSnapshot = useCallback(
        (snapshot: TAssignmentOptionsSnapshot) => {
            setDirectoryUsers(snapshot.users);
            setDepartmentOptions(snapshot.departments);
            hasLoadedAssignmentOptionsRef.current = true;
        },
        [],
    );

    const categoryById = useMemo<Record<string, any>>(() => {
        const map: Record<string, any> = {};
        categories.forEach(category => {
            map[category._id] = category;
        });
        return map;
    }, [categories]);

    const rootCategories = useMemo(
        () => categories.filter(category => !category.parentId),
        [categories],
    );

    const childrenByParent = useMemo<Record<string, any[]>>(() => {
        const map: Record<string, any[]> = {};
        categories.forEach(category => {
            if (!category.parentId) return;
            if (!map[category.parentId]) {
                map[category.parentId] = [];
            }
            map[category.parentId].push(category);
        });
        return map;
    }, [categories]);

    const destinationLevelOptions = useMemo(() => {
        const levels: any[][] = [rootCategories];
        for (let i = 0; i < destinationSelectionIds.length; i += 1) {
            const currentId = destinationSelectionIds[i];
            const nextLevel = childrenByParent[currentId] || [];
            if (nextLevel.length > 0) {
                levels.push(nextLevel);
            } else {
                break;
            }
        }
        return levels;
    }, [destinationSelectionIds, rootCategories, childrenByParent]);

    const selectedDestinationId =
        destinationSelectionIds[destinationSelectionIds.length - 1] || '';

    const destinationPathLabel = useMemo(() => {
        const names = destinationSelectionIds
            .map(id => categoryById[id]?.name)
            .filter(Boolean);
        return names.join(' / ');
    }, [destinationSelectionIds, categoryById]);

    const directoryUserById = useMemo<Record<string, TDirectoryUser>>(() => {
        const map: Record<string, TDirectoryUser> = {};
        directoryUsers.forEach(user => {
            map[user._id] = user;
        });
        return map;
    }, [directoryUsers]);

    const departmentOptionById = useMemo<
        Record<string, TDepartmentOption>
    >(() => {
        const map: Record<string, TDepartmentOption> = {};
        departmentOptions.forEach(option => {
            map[option.id] = option;
        });
        return map;
    }, [departmentOptions]);

    const selectedLeadDepartmentName = useMemo(() => {
        return (
            departmentOptionById[leadDepartmentId]?.name ||
            leadAgencyValue ||
            ''
        );
    }, [departmentOptionById, leadDepartmentId, leadAgencyValue]);

    const selectedLeadDepartmentOption = useMemo(() => {
        return departmentOptionById[leadDepartmentId];
    }, [departmentOptionById, leadDepartmentId]);

    const selectedReceiveToKnowText = useMemo(() => {
        if (receiveToKnowIds.length === 0)
            return receiveToKnowTextFallback || 'Chọn người nhận để biết';
        const names = receiveToKnowIds
            .map(id => directoryUserById[id]?.fullName)
            .filter(Boolean);
        return names.length > 0
            ? names.join(', ')
            : receiveToKnowTextFallback || 'Chọn người nhận để biết';
    }, [receiveToKnowIds, directoryUserById, receiveToKnowTextFallback]);

    const selectedSupportDepartmentText = useMemo(() => {
        if (supportDepartmentIds.length === 0)
            return (
                supportDepartmentTextFallback ||
                'Chọn cơ quan để phối hợp(chọn nhiều)'
            );
        const names = supportDepartmentIds
            .map(id => departmentOptionById[id]?.name)
            .filter(Boolean);
        return names.length > 0
            ? names.join(', ')
            : supportDepartmentTextFallback ||
                  'Chọn cơ quan để phối hợp(chọn nhiều)';
    }, [
        supportDepartmentIds,
        departmentOptionById,
        supportDepartmentTextFallback,
    ]);

    const destinationDropdownOptions = useMemo(
        () =>
            destinationLevelOptions.map(options =>
                options.map((option: any) => ({
                    key: option._id,
                    label: option.name || '',
                    searchText: buildOptionSearchText(option.name, option.code),
                })),
            ),
        [destinationLevelOptions],
    );

    const leadDepartmentDropdownOptions = useMemo(
        () =>
            departmentOptions.map(option => ({
                key: option.id,
                label: option.name,
                subLabel: option.code,
                searchText: buildOptionSearchText(option.name, option.code),
            })),
        [departmentOptions],
    );

    const receiveDropdownOptions = useMemo(
        () =>
            directoryUsers.map(user => ({
                key: user._id,
                label: user.fullName,
                subLabel: user.departmentName,
                searchText: buildOptionSearchText(
                    user.fullName,
                    user.departmentName,
                ),
            })),
        [directoryUsers],
    );

    const supportDepartmentDropdownOptions = useMemo(
        () =>
            departmentOptions.map(dep => ({
                key: dep.id,
                label: dep.name,
                subLabel: dep.code,
                searchText: buildOptionSearchText(dep.name, dep.code),
            })),
        [departmentOptions],
    );

    const categoryDropdownOptions = useMemo(
        () =>
            categories.map(category => ({
                key: category._id,
                label: category.name || '',
                subLabel: (category as any).code || '',
                searchText: buildOptionSearchText(
                    category.name,
                    (category as any).code,
                ),
            })),
        [categories],
    );

    const priorityDropdownOptions = useMemo(
        () =>
            (Object.values(EDocumentPriority) as EDocumentPriority[]).map(
                priority => ({
                    key: priority,
                    label: DOCUMENT_PRIORITY_LABEL[priority],
                }),
            ),
        [],
    );

    const selectDestinationOption = useCallback(
        (levelIndex: number, option: TDropdownListOption) => {
            setDestinationSelectionIds(prev => {
                const next = prev.slice(0, levelIndex);
                next[levelIndex] = option.key;
                return next;
            });
            setShowDestinationLevel(null);
            setErrors((prev: any) =>
                prev.destinationCategoryId
                    ? {...prev, destinationCategoryId: undefined}
                    : prev,
            );
        },
        [setErrors],
    );

    const selectLeadDepartmentOption = useCallback(
        (option: TDropdownListOption) => {
            const selectedDepartment = departmentOptionById[option.key];
            if (!selectedDepartment) {
                return;
            }

            setLeadDepartmentId(selectedDepartment.id);
            setLeadAgencyValue(selectedDepartment.name);
            setLeadAgencyPayloadValue(
                selectedDepartment.code || selectedDepartment.id,
            );
            setShowLeadDepartmentMenu(false);
            setErrors((prev: any) =>
                prev.leadDepartmentId
                    ? {...prev, leadDepartmentId: undefined}
                    : prev,
            );
        },
        [departmentOptionById, setErrors],
    );

    const toggleReceiveToKnowOption = useCallback(
        (option: TDropdownListOption) => {
            setReceiveToKnowIds(prev =>
                prev.includes(option.key)
                    ? prev.filter(id => id !== option.key)
                    : [...prev, option.key],
            );
            setReceiveToKnowTextFallback('');
        },
        [],
    );

    const toggleSupportDepartmentOption = useCallback(
        (option: TDropdownListOption) => {
            setSupportDepartmentIds(prev =>
                prev.includes(option.key)
                    ? prev.filter(id => id !== option.key)
                    : [...prev, option.key],
            );
            setSupportDepartmentTextFallback('');
        },
        [],
    );

    const selectCategoryOption = useCallback(
        (option: TDropdownListOption) => {
            const selectedCategory = categoryById[option.key];
            setCategoryIdValue(option.key);
            setCategoryNameValue(selectedCategory?.name || option.label || '');
            setShowCategoryMenu(false);
            setErrors((prev: any) =>
                prev.categoryId ? {...prev, categoryId: undefined} : prev,
            );
        },
        [categoryById, setCategoryIdValue, setCategoryNameValue, setErrors],
    );

    const selectPriorityOption = useCallback(
        (option: TDropdownListOption) => {
            setPriorityValue(option.key as EDocumentPriority);
            setShowPriorityMenu(false);
            setErrors((prev: any) =>
                prev.priority ? {...prev, priority: undefined} : prev,
            );
        },
        [setPriorityValue, setErrors],
    );

    const getReceiveToKnowNamesByIds = useCallback(
        (ids: string[]) => {
            return ids
                .map(id => directoryUserById[id]?.fullName)
                .filter(Boolean)
                .join(', ');
        },
        [directoryUserById],
    );

    const getSupportDepartmentNamesByIds = useCallback(
        (ids: string[]) => {
            return ids
                .map(id => departmentOptionById[id]?.name)
                .filter(Boolean)
                .join(', ');
        },
        [departmentOptionById],
    );

    const getLeadAgencyPayload = useCallback(() => {
        return (
            selectedLeadDepartmentOption?.code ||
            leadAgencyPayloadValue ||
            selectedLeadDepartmentOption?.id ||
            leadDepartmentId ||
            leadAgencyValue
        );
    }, [
        leadAgencyPayloadValue,
        leadAgencyValue,
        leadDepartmentId,
        selectedLeadDepartmentOption,
    ]);

    const buildCurrentAssignmentDraft =
        useCallback((): TIncomingAssignmentDraft => {
            const receiveNames = getReceiveToKnowNamesByIds(receiveToKnowIds);
            const supportNames =
                getSupportDepartmentNamesByIds(supportDepartmentIds);
            return {
                leadDepartmentId,
                leadAgencyValue: selectedLeadDepartmentName || leadAgencyValue,
                leadAgencyPayloadValue: getLeadAgencyPayload(),
                finishedAtValue,
                finishedAtDisplay:
                    finishedAtDisplay ||
                    (finishedAtValue ? formatDate(finishedAtValue) : ''),
                receiveToKnowIds: [...receiveToKnowIds],
                supportDepartmentIds: [...supportDepartmentIds],
                receiveToKnowTextFallback:
                    receiveNames || receiveToKnowTextFallback,
                supportDepartmentTextFallback:
                    supportNames || supportDepartmentTextFallback,
            };
        }, [
            finishedAtDisplay,
            finishedAtValue,
            getReceiveToKnowNamesByIds,
            getSupportDepartmentNamesByIds,
            getLeadAgencyPayload,
            leadAgencyValue,
            leadDepartmentId,
            receiveToKnowIds,
            receiveToKnowTextFallback,
            selectedLeadDepartmentName,
            supportDepartmentIds,
            supportDepartmentTextFallback,
        ]);

    const toggleMenu = useCallback(
        (
            isOpen: boolean,
            setMenu: React.Dispatch<React.SetStateAction<boolean>>,
        ) => {
            const shouldOpen = !isOpen;
            if (editorFocusedRef.current) {
                Keyboard.dismiss();
            }
            clearEditorFocus();
            setFocusedField(null);
            resetMenusRef.current();
            setMenu(shouldOpen);
        },
        [clearEditorFocus, setFocusedField, editorFocusedRef, resetMenusRef],
    );

    const toggleDestinationMenu = useCallback(
        (levelIndex: number) => {
            const shouldOpen = showDestinationLevel !== levelIndex;
            if (shouldOpen) {
                ensureIncomingCategoryList();
            }
            if (editorFocusedRef.current) {
                Keyboard.dismiss();
            }
            clearEditorFocus();
            setFocusedField(null);
            resetMenusRef.current();
            setShowDestinationLevel(shouldOpen ? levelIndex : null);
        },
        [
            clearEditorFocus,
            setFocusedField,
            ensureIncomingCategoryList,
            showDestinationLevel,
            editorFocusedRef,
            resetMenusRef,
        ],
    );

    useEffect(() => {
        if (!showForm || !showAssignSection) return undefined;

        const assignmentOptionsCache = getAssignmentOptionsCache();
        if (
            hasLoadedAssignmentOptionsRef.current &&
            (directoryUsers.length > 0 || departmentOptions.length > 0)
        ) {
            return undefined;
        }

        let isCancelled = false;
        const loadDirectories = async () => {
            if (assignmentOptionsCache) {
                applyAssignmentOptionsSnapshot(assignmentOptionsCache);
                return;
            }

            setIsLoadingAssignmentOptions(true);
            try {
                const snapshot = await loadIncomingAssignmentOptions();
                if (isCancelled) return;
                applyAssignmentOptionsSnapshot(snapshot);
            } catch (error) {
            } finally {
                if (!isCancelled) {
                    setIsLoadingAssignmentOptions(false);
                }
            }
        };

        loadDirectories();
        return () => {
            isCancelled = true;
        };
    }, [
        applyAssignmentOptionsSnapshot,
        departmentOptions.length,
        directoryUsers.length,
        showAssignSection,
        showForm,
    ]);

    const resetAssignment = useCallback(() => {
        setDestinationSelectionIds([]);
        setDestinationCategoryHint('');
        setLeadDepartmentId('');
        setLeadAgencyValue('');
        setLeadAgencyPayloadValue('');
        setReceiveToKnowIds([]);
        setSupportDepartmentIds([]);
        setReceiveToKnowTextFallback('');
        setSupportDepartmentTextFallback('');
    }, []);

    return {
        destinationSelectionIds,
        setDestinationSelectionIds,
        destinationCategoryHint,
        setDestinationCategoryHint,
        leadDepartmentId,
        setLeadDepartmentId,
        leadAgencyValue,
        setLeadAgencyValue,
        leadAgencyPayloadValue,
        setLeadAgencyPayloadValue,
        receiveToKnowIds,
        setReceiveToKnowIds,
        supportDepartmentIds,
        setSupportDepartmentIds,
        receiveToKnowTextFallback,
        setReceiveToKnowTextFallback,
        supportDepartmentTextFallback,
        setSupportDepartmentTextFallback,

        showCategoryMenu,
        setShowCategoryMenu,
        showPriorityMenu,
        setShowPriorityMenu,
        showLeadDepartmentMenu,
        setShowLeadDepartmentMenu,
        showReceiveMenu,
        setShowReceiveMenu,
        showSupportDepartmentMenu,
        setShowSupportDepartmentMenu,
        showDestinationLevel,
        setShowDestinationLevel,

        directoryUsers,
        setDirectoryUsers,
        departmentOptions,
        setDepartmentOptions,
        isLoadingAssignmentOptions,
        setIsLoadingAssignmentOptions,

        categoryById,
        rootCategories,
        childrenByParent,
        destinationLevelOptions,
        selectedDestinationId,
        destinationPathLabel,
        directoryUserById,
        departmentOptionById,
        selectedLeadDepartmentName,
        selectedLeadDepartmentOption,
        selectedReceiveToKnowText,
        selectedSupportDepartmentText,
        destinationDropdownOptions,
        leadDepartmentDropdownOptions,
        receiveDropdownOptions,
        supportDepartmentDropdownOptions,
        categoryDropdownOptions,
        priorityDropdownOptions,

        selectDestinationOption,
        selectLeadDepartmentOption,
        toggleReceiveToKnowOption,
        toggleSupportDepartmentOption,
        selectCategoryOption,
        selectPriorityOption,
        getLeadAgencyPayload,
        buildCurrentAssignmentDraft,
        toggleMenu,
        toggleDestinationMenu,
        resetAssignment,
        assignmentDraftsRef,
    };
};
