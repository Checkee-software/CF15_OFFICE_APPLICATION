import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Keyboard } from 'react-native';
import { EDocumentPriority } from '@/shared-types/common/Document/document';
import {
    type TDirectoryUser,
    type TDepartmentOption,
    type TDropdownListOption,
    type TIncomingAssignmentDraft,
    formatDate,
} from '../utils';
import {
    loadIncomingAssignmentOptions,
    getAssignmentOptionsCache,
    type TAssignmentOptionsSnapshot,
} from '../utils/assignmentStorage';
import {
    buildDestinationDropdownOptions,
    buildLeadDepartmentDropdownOptions,
    buildReceiveDropdownOptions,
    buildSupportDepartmentDropdownOptions,
    buildCategoryDropdownOptions,
    buildPriorityDropdownOptions,
} from '../utils/assignmentOptionBuilders';
import { useIncomingCategoryTree } from './useIncomingCategoryTree';
export const useIncomingFormAssignment = (
    categories: any[],
    priorityValue: EDocumentPriority | '',
    setPriorityValue: React.Dispatch<React.SetStateAction<EDocumentPriority | ''>>,
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
    // ---------------------------------------------------------------------------
    // Assignment state
    // ---------------------------------------------------------------------------
    const [destinationSelectionIds, setDestinationSelectionIds] = useState<string[]>([]);
    const [destinationCategoryHint, setDestinationCategoryHint] = useState('');
    const [leadDepartmentId, setLeadDepartmentId] = useState('');
    const [leadAgencyValue, setLeadAgencyValue] = useState('');
    const [leadAgencyPayloadValue, setLeadAgencyPayloadValue] = useState('');
    const [receiveToKnowIds, setReceiveToKnowIds] = useState<string[]>([]);
    const [supportDepartmentIds, setSupportDepartmentIds] = useState<string[]>([]);
    const [receiveToKnowTextFallback, setReceiveToKnowTextFallback] = useState('');
    const [supportDepartmentTextFallback, setSupportDepartmentTextFallback] = useState('');
    const [showCategoryMenu, setShowCategoryMenu] = useState(false);
    const [showPriorityMenu, setShowPriorityMenu] = useState(false);
    const [showLeadDepartmentMenu, setShowLeadDepartmentMenu] = useState(false);
    const [showReceiveMenu, setShowReceiveMenu] = useState(false);
    const [showSupportDepartmentMenu, setShowSupportDepartmentMenu] = useState(false);
    const [showDestinationLevel, setShowDestinationLevel] = useState<number | null>(null);
    const [directoryUsers, setDirectoryUsers] = useState<TDirectoryUser[]>([]);
    const [departmentOptions, setDepartmentOptions] = useState<TDepartmentOption[]>([]);
    const [isLoadingAssignmentOptions, setIsLoadingAssignmentOptions] = useState(false);
    const hasLoadedAssignmentOptionsRef = useRef(false);
    const assignmentDraftsRef = useRef<Record<string, TIncomingAssignmentDraft>>({});
    // ---------------------------------------------------------------------------
    // Category tree computation (extracted)
    // ---------------------------------------------------------------------------
    const {
        categoryById,
        rootCategories,
        childrenByParent,
        destinationLevelOptions,
        selectedDestinationId,
        destinationPathLabel,
    } = useIncomingCategoryTree(categories, destinationSelectionIds);
    // ---------------------------------------------------------------------------
    // Lookup maps
    // ---------------------------------------------------------------------------
    const directoryUserById = useMemo<Record<string, TDirectoryUser>>(() => {
        const map: Record<string, TDirectoryUser> = {};
        directoryUsers.forEach(user => { map[user._id] = user; });
        return map;
    }, [directoryUsers]);
    const departmentOptionById = useMemo<Record<string, TDepartmentOption>>(() => {
        const map: Record<string, TDepartmentOption> = {};
        departmentOptions.forEach(opt => { map[opt.id] = opt; });
        return map;
    }, [departmentOptions]);
    // ---------------------------------------------------------------------------
    // Derived display strings
    // ---------------------------------------------------------------------------
    const selectedLeadDepartmentName = useMemo(
        () => departmentOptionById[leadDepartmentId]?.name || leadAgencyValue || '',
        [departmentOptionById, leadDepartmentId, leadAgencyValue],
    );
    const selectedLeadDepartmentOption = useMemo(
        () => departmentOptionById[leadDepartmentId],
        [departmentOptionById, leadDepartmentId],
    );
    const selectedReceiveToKnowText = useMemo(() => {
        if (receiveToKnowIds.length === 0) {
            return receiveToKnowTextFallback || 'Chọn người nhận để biết';
        }
        const names = receiveToKnowIds.map(id => directoryUserById[id]?.fullName).filter(Boolean);
        return names.length > 0
            ? names.join(', ')
            : receiveToKnowTextFallback || 'Chọn người nhận để biết';
    }, [receiveToKnowIds, directoryUserById, receiveToKnowTextFallback]);
    const selectedSupportDepartmentText = useMemo(() => {
        if (supportDepartmentIds.length === 0) {
            return supportDepartmentTextFallback || 'Chọn cơ quan để phối hợp(chọn nhiều)';
        }
        const names = supportDepartmentIds.map(id => departmentOptionById[id]?.name).filter(Boolean);
        return names.length > 0
            ? names.join(', ')
            : supportDepartmentTextFallback || 'Chọn cơ quan để phối hợp(chọn nhiều)';
    }, [supportDepartmentIds, departmentOptionById, supportDepartmentTextFallback]);
    // ---------------------------------------------------------------------------
    // Dropdown options (built from pure-function helpers)
    // ---------------------------------------------------------------------------
    const destinationDropdownOptions = useMemo(
        () => buildDestinationDropdownOptions(destinationLevelOptions),
        [destinationLevelOptions],
    );
    const leadDepartmentDropdownOptions = useMemo(
        () => buildLeadDepartmentDropdownOptions(departmentOptions),
        [departmentOptions],
    );
    const receiveDropdownOptions = useMemo(
        () => buildReceiveDropdownOptions(directoryUsers),
        [directoryUsers],
    );
    const supportDepartmentDropdownOptions = useMemo(
        () => buildSupportDepartmentDropdownOptions(departmentOptions),
        [departmentOptions],
    );
    const categoryDropdownOptions = useMemo(
        () => buildCategoryDropdownOptions(categories),
        [categories],
    );
    const priorityDropdownOptions = useMemo(
        () => buildPriorityDropdownOptions(),
        [],
    );
    // ---------------------------------------------------------------------------
    // Select / toggle handlers
    // ---------------------------------------------------------------------------
    const selectDestinationOption = useCallback(
        (levelIndex: number, option: TDropdownListOption) => {
            setDestinationSelectionIds(prev => {
                const next = prev.slice(0, levelIndex);
                next[levelIndex] = option.key;
                return next;
            });
            setShowDestinationLevel(null);
            setErrors((prev: any) =>
                prev.destinationCategoryId ? { ...prev, destinationCategoryId: undefined } : prev,
            );
        },
        [setErrors],
    );
    const selectLeadDepartmentOption = useCallback(
        (option: TDropdownListOption) => {
            const selected = departmentOptionById[option.key];
            if (!selected) { return; }
            setLeadDepartmentId(selected.id);
            setLeadAgencyValue(selected.name);
            setLeadAgencyPayloadValue(selected.code || selected.id);
            setShowLeadDepartmentMenu(false);
            setErrors((prev: any) =>
                prev.leadDepartmentId ? { ...prev, leadDepartmentId: undefined } : prev,
            );
        },
        [departmentOptionById, setErrors],
    );
    const toggleReceiveToKnowOption = useCallback((option: TDropdownListOption) => {
        setReceiveToKnowIds(prev =>
            prev.includes(option.key)
                ? prev.filter(id => id !== option.key)
                : [...prev, option.key],
        );
        setReceiveToKnowTextFallback('');
    }, []);
    const toggleSupportDepartmentOption = useCallback((option: TDropdownListOption) => {
        setSupportDepartmentIds(prev =>
            prev.includes(option.key)
                ? prev.filter(id => id !== option.key)
                : [...prev, option.key],
        );
        setSupportDepartmentTextFallback('');
    }, []);
    const selectCategoryOption = useCallback(
        (option: TDropdownListOption) => {
            setCategoryIdValue(option.key);
            setCategoryNameValue(categoryById[option.key]?.name || option.label || '');
            setShowCategoryMenu(false);
            setErrors((prev: any) =>
                prev.categoryId ? { ...prev, categoryId: undefined } : prev,
            );
        },
        [categoryById, setCategoryIdValue, setCategoryNameValue, setErrors],
    );
    const selectPriorityOption = useCallback(
        (option: TDropdownListOption) => {
            setPriorityValue(option.key as EDocumentPriority);
            setShowPriorityMenu(false);
            setErrors((prev: any) =>
                prev.priority ? { ...prev, priority: undefined } : prev,
            );
        },
        [setPriorityValue, setErrors],
    );
    // ---------------------------------------------------------------------------
    // Menu toggle helpers
    // ---------------------------------------------------------------------------
    const toggleMenu = useCallback(
        (isOpen: boolean, setMenu: React.Dispatch<React.SetStateAction<boolean>>) => {
            const shouldOpen = !isOpen;
            if (editorFocusedRef.current) { Keyboard.dismiss(); }
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
            if (shouldOpen) { ensureIncomingCategoryList(); }
            if (editorFocusedRef.current) { Keyboard.dismiss(); }
            clearEditorFocus();
            setFocusedField(null);
            resetMenusRef.current();
            setShowDestinationLevel(shouldOpen ? levelIndex : null);
        },
        [
            clearEditorFocus, setFocusedField, ensureIncomingCategoryList,
            showDestinationLevel, editorFocusedRef, resetMenusRef,
        ],
    );
    // ---------------------------------------------------------------------------
    // Payload helpers
    // ---------------------------------------------------------------------------
    const getReceiveToKnowNamesByIds = useCallback(
        (ids: string[]) =>
            ids.map(id => directoryUserById[id]?.fullName).filter(Boolean).join(', '),
        [directoryUserById],
    );
    const getSupportDepartmentNamesByIds = useCallback(
        (ids: string[]) =>
            ids.map(id => departmentOptionById[id]?.name).filter(Boolean).join(', '),
        [departmentOptionById],
    );
    const getLeadAgencyPayload = useCallback(
        () =>
            selectedLeadDepartmentOption?.code ||
            leadAgencyPayloadValue ||
            selectedLeadDepartmentOption?.id ||
            leadDepartmentId ||
            leadAgencyValue,
        [leadAgencyPayloadValue, leadAgencyValue, leadDepartmentId, selectedLeadDepartmentOption],
    );
    const buildCurrentAssignmentDraft = useCallback((): TIncomingAssignmentDraft => {
        const receiveNames = getReceiveToKnowNamesByIds(receiveToKnowIds);
        const supportNames = getSupportDepartmentNamesByIds(supportDepartmentIds);
        return {
            leadDepartmentId,
            leadAgencyValue: selectedLeadDepartmentName || leadAgencyValue,
            leadAgencyPayloadValue: getLeadAgencyPayload(),
            finishedAtValue,
            finishedAtDisplay:
                finishedAtDisplay || (finishedAtValue ? formatDate(finishedAtValue) : ''),
            receiveToKnowIds: [...receiveToKnowIds],
            supportDepartmentIds: [...supportDepartmentIds],
            receiveToKnowTextFallback: receiveNames || receiveToKnowTextFallback,
            supportDepartmentTextFallback: supportNames || supportDepartmentTextFallback,
        };
    }, [
        finishedAtDisplay, finishedAtValue,
        getReceiveToKnowNamesByIds, getSupportDepartmentNamesByIds, getLeadAgencyPayload,
        leadAgencyValue, leadDepartmentId,
        receiveToKnowIds, receiveToKnowTextFallback,
        selectedLeadDepartmentName, supportDepartmentIds, supportDepartmentTextFallback,
    ]);
    // ---------------------------------------------------------------------------
    // Load assignment options effect
    // ---------------------------------------------------------------------------
    const applyAssignmentOptionsSnapshot = useCallback(
        (snapshot: TAssignmentOptionsSnapshot) => {
            setDirectoryUsers(snapshot.users);
            setDepartmentOptions(snapshot.departments);
            hasLoadedAssignmentOptionsRef.current = true;
        },
        [],
    );
    useEffect(() => {
        if (!showForm || !showAssignSection) { return undefined; }
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
                if (isCancelled) { return; }
                applyAssignmentOptionsSnapshot(snapshot);
            } catch { /* empty */ } finally {
                if (!isCancelled) { setIsLoadingAssignmentOptions(false); }
            }
        };
        loadDirectories();
        return () => { isCancelled = true; };
    }, [
        applyAssignmentOptionsSnapshot, departmentOptions.length,
        directoryUsers.length, showAssignSection, showForm,
    ]);
    // ---------------------------------------------------------------------------
    // Reset
    // ---------------------------------------------------------------------------
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
        destinationSelectionIds, setDestinationSelectionIds,
        destinationCategoryHint, setDestinationCategoryHint,
        leadDepartmentId, setLeadDepartmentId,
        leadAgencyValue, setLeadAgencyValue,
        leadAgencyPayloadValue, setLeadAgencyPayloadValue,
        receiveToKnowIds, setReceiveToKnowIds,
        supportDepartmentIds, setSupportDepartmentIds,
        receiveToKnowTextFallback, setReceiveToKnowTextFallback,
        supportDepartmentTextFallback, setSupportDepartmentTextFallback,
        showCategoryMenu, setShowCategoryMenu,
        showPriorityMenu, setShowPriorityMenu,
        showLeadDepartmentMenu, setShowLeadDepartmentMenu,
        showReceiveMenu, setShowReceiveMenu,
        showSupportDepartmentMenu, setShowSupportDepartmentMenu,
        showDestinationLevel, setShowDestinationLevel,
        directoryUsers, setDirectoryUsers,
        departmentOptions, setDepartmentOptions,
        isLoadingAssignmentOptions, setIsLoadingAssignmentOptions,
        categoryById, rootCategories, childrenByParent,
        destinationLevelOptions, selectedDestinationId, destinationPathLabel,
        directoryUserById, departmentOptionById,
        selectedLeadDepartmentName, selectedLeadDepartmentOption,
        selectedReceiveToKnowText, selectedSupportDepartmentText,
        destinationDropdownOptions, leadDepartmentDropdownOptions,
        receiveDropdownOptions, supportDepartmentDropdownOptions,
        categoryDropdownOptions, priorityDropdownOptions,
        selectDestinationOption, selectLeadDepartmentOption,
        toggleReceiveToKnowOption, toggleSupportDepartmentOption,
        selectCategoryOption, selectPriorityOption,
        getLeadAgencyPayload, buildCurrentAssignmentDraft,
        toggleMenu, toggleDestinationMenu,
        resetAssignment, assignmentDraftsRef,
    };
};
