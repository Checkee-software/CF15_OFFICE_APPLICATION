import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DropdownModal from './DropdownModal';
import type { TDropdownListOption } from '../utils';

type IncomingRegisterSectionProps = {
    destinationPathLabel: string;
    destinationCategoryHint: string;
    destinationLevelOptions: any[][];
    destinationSelectionIds: string[];
    destinationDropdownOptions: TDropdownListOption[][];
    showDestinationLevel: number | null;
    isLoadingDestinationOptions: boolean;
    errors: Record<string, any>;
    resetMenus: () => void;
    toggleDestinationMenu: (levelIndex: number) => void;
    selectDestinationOption: (levelIndex: number, option: TDropdownListOption) => void;
};

const IncomingRegisterSection = React.memo(
    ({
        destinationPathLabel,
        destinationCategoryHint,
        destinationLevelOptions,
        destinationSelectionIds,
        destinationDropdownOptions,
        showDestinationLevel,
        isLoadingDestinationOptions,
        errors,
        resetMenus,
        toggleDestinationMenu,
        selectDestinationOption,
    }: IncomingRegisterSectionProps) => (
        <>
            <Text style={styles.blockTitle}>Vào sổ văn bản</Text>
            {!!destinationPathLabel && (
                <Text style={styles.blockHint}>
                    Chi tiết nhánh: {destinationPathLabel}
                </Text>
            )}
            {!!destinationCategoryHint && (
                <Text style={styles.blockHint}>
                    Chi tiết nhánh: {destinationCategoryHint}
                </Text>
            )}

            <Text style={styles.fieldLabel}>
                Chọn sổ (thư mục) lưu trữ{' '}
                <Text style={styles.required}>*</Text>
            </Text>
            {destinationLevelOptions.map((options: any[], levelIndex: number) => {
                const selectedIdAtLevel =
                    destinationSelectionIds[levelIndex] || '';
                const selectedName =
                    options.find((item: any) => item._id === selectedIdAtLevel)
                        ?.name ||
                    (levelIndex === 0 ? destinationCategoryHint : '') ||
                    'Chọn sổ (thư mục)';
                return (
                    <View key={`level-${levelIndex}`} style={styles.dropdownWrap}>
                        <TouchableOpacity
                            style={[
                                styles.select,
                                showDestinationLevel === levelIndex &&
                                    styles.selectFocused,
                                errors.destinationCategoryId &&
                                    levelIndex === 0 &&
                                    styles.inputWrapError,
                            ]}
                            onPress={() => toggleDestinationMenu(levelIndex)}>
                            <Text style={styles.selectText}>{selectedName}</Text>
                            <MaterialCommunityIcons
                                name="chevron-down"
                                size={18}
                                color="#666"
                            />
                        </TouchableOpacity>
                        {showDestinationLevel === levelIndex && (
                            <DropdownModal
                                visible
                                title="Chọn sổ lưu trữ"
                                loading={isLoadingDestinationOptions}
                                options={destinationDropdownOptions[levelIndex] || []}
                                searchEnabled
                                searchPlaceholder="Tìm sổ lưu trữ..."
                                emptyText="Không có sổ lưu trữ để chọn"
                                onSelect={option =>
                                    selectDestinationOption(levelIndex, option)
                                }
                                onClose={resetMenus}
                            />
                        )}
                    </View>
                );
            })}
            {!!errors.destinationCategoryId && (
                <Text style={styles.fieldError}>
                    {errors.destinationCategoryId}
                </Text>
            )}
            <View style={styles.separator} />
        </>
    ),
);

IncomingRegisterSection.displayName = 'IncomingRegisterSection';

const styles = StyleSheet.create({
    blockTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2196F3',
        marginTop: 4,
        marginBottom: 8,
    },
    blockHint: {
        fontSize: 13,
        color: '#8D8D8D',
        fontStyle: 'italic',
        marginBottom: 4,
    },
    fieldLabel: { fontSize: 13, color: '#222', marginBottom: 5, marginTop: 8 },
    required: { color: '#F05A5A' },
    dropdownWrap: { position: 'relative' },
    select: {
        height: 38,
        borderWidth: 1,
        borderColor: '#BFBFBF',
        borderRadius: 6,
        backgroundColor: '#F7F7F7',
        paddingHorizontal: 10,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
    },
    selectFocused: { borderColor: '#4CAF50', backgroundColor: '#FFFFFF' },
    selectText: { fontSize: 13, color: '#5A5A5A', flex: 1 },
    inputWrapError: { borderColor: '#FF4D4F' },
    fieldError: {
        color: '#FF4D4F',
        fontSize: 12,
        marginTop: 4,
        textAlign: 'right',
    },
    separator: {
        borderBottomWidth: 1,
        borderBottomColor: '#8CC7FF',
        borderStyle: 'dashed',
        marginTop: 10,
        marginBottom: 10,
    },
});

export default IncomingRegisterSection;
