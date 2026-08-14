/**
 * Pure functions for building dropdown option arrays in the Incoming Assignment section.
 * Extracted from useIncomingFormAssignment.ts to reduce file size.
 */
import type { TDirectoryUser, TDepartmentOption, TDropdownListOption } from '../types';
import {
    DOCUMENT_PRIORITY_LABEL,
    EDocumentPriority,
} from '@/shared-types/common/Document/document';
import { buildOptionSearchText } from '../utils';

export const buildDestinationDropdownOptions = (
    destinationLevelOptions: any[][],
): TDropdownListOption[][] =>
    destinationLevelOptions.map(options =>
        options.map((option: any) => ({
            key: option._id,
            label: option.name || '',
            searchText: buildOptionSearchText(option.name, option.code),
        })),
    );

export const buildLeadDepartmentDropdownOptions = (
    departmentOptions: TDepartmentOption[],
): TDropdownListOption[] =>
    departmentOptions.map(option => ({
        key: option.id,
        label: option.name,
        subLabel: option.code,
        searchText: buildOptionSearchText(option.name, option.code),
    }));

export const buildReceiveDropdownOptions = (
    directoryUsers: TDirectoryUser[],
): TDropdownListOption[] =>
    directoryUsers.map(user => ({
        key: user._id,
        label: user.fullName,
        subLabel: user.departmentName,
        searchText: buildOptionSearchText(user.fullName, user.departmentName),
    }));

export const buildSupportDepartmentDropdownOptions = (
    departmentOptions: TDepartmentOption[],
): TDropdownListOption[] =>
    departmentOptions.map(dep => ({
        key: dep.id,
        label: dep.name,
        subLabel: dep.code,
        searchText: buildOptionSearchText(dep.name, dep.code),
    }));

export const buildCategoryDropdownOptions = (
    categories: any[],
): TDropdownListOption[] =>
    categories.map(category => ({
        key: category._id,
        label: category.name || '',
        subLabel: (category as any).code || '',
        searchText: buildOptionSearchText(category.name, (category as any).code),
    }));

export const buildPriorityDropdownOptions = (): TDropdownListOption[] =>
    (Object.values(EDocumentPriority) as EDocumentPriority[]).map(priority => ({
        key: priority,
        label: DOCUMENT_PRIORITY_LABEL[priority],
    }));
