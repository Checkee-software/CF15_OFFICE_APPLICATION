/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {View, Text, StyleSheet, TextInput} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import CollapsibleTaskBlock from './CollapsibleTaskBlock';
import Snackbar from 'react-native-snackbar';

interface MachineShiftInput {
    machineId: string;
    area: string;
    taskName: string;
    gardenAreaType: string;
    processId: string;
}

interface Props {
    gardenId: string;
    machines: any[];
    machineShifts: MachineShiftInput[];
    gardenAreaType: string;
    gardenArea: number;
    processingRate: number;
    onChange: (
        index: number,
        field: 'processId' | 'area',
        value: string,
    ) => void;
}

const MachineShiftSelector: React.FC<Props> = ({
    gardenId,
    machines,
    machineShifts,
    onChange,
    gardenAreaType,
    gardenArea,
}) => {
    const [tempInputValues, setTempInputValues] = useState<
        Record<string, string>
    >({});

    if (!machines.length) return null;

    const handleHoursChange = (
        index: number,
        text: string,
        currentArea: number,
    ) => {
        if (gardenId === '') {
            Snackbar.show({
                text: 'Bạn chưa chọn khu vườn cần làm',
                duration: Snackbar.LENGTH_SHORT,
            });
            return;
        }

        // Không cho bắt đầu bằng . hoặc ,
        if (text.startsWith('.') || text.startsWith(',')) {
            return;
        }

        // Không cho nhập dấu - hoặc khoảng trắng
        if (text.includes('-') || text.includes(' ')) {
            return;
        }

        // Giới hạn tối đa 2 số sau dấu chấm
        const regex = /^\d*(\.\d{0,2})?$/;
        if (!regex.test(text.replace(',', '.'))) {
            return;
        }

        const currentText =
            tempInputValues[index] || machineShifts[index]?.area || '';

        const isAdding = text.length > currentText.length;
        const endsWithDotOrComma = /[.,]$/.test(text);
        const alreadyHasDotOrComma =
            currentText.includes('.') || currentText.includes(',');

        if (isAdding && alreadyHasDotOrComma && endsWithDotOrComma) {
            return;
        }

        const normalizedText = text.replace(',', '.');
        const numericValue = parseFloat(normalizedText);

        console.log(currentArea);

        if (isNaN(numericValue) || numericValue + currentArea <= gardenArea) {
            onChange(index, 'area', normalizedText);
            setTempInputValues(prev => ({...prev, [index]: ''}));
        } else {
            setTempInputValues(prev => ({...prev, [index]: normalizedText}));
        }
    };

    return (
        <View>
            <Text style={styles.sectionTitle}>Ca máy</Text>

            <View style={{gap: 12}}>
                {machines.map((shift, index) => {
                    console.log(shift);
                    const currentInputValue =
                        tempInputValues[index] ||
                        machineShifts[index]?.area ||
                        '';
                    const areaValue = parseFloat(currentInputValue);
                    const showWarning =
                        !isNaN(areaValue) && areaValue > gardenArea;

                    return (
                        <CollapsibleTaskBlock
                            key={index}
                            title={shift.childTaskName}
                            backgroundColor='#FF98004D'>
                            {gardenId !== '' ? (
                                <View style={{gap: 8}}>
                                    <Text style={styles.label}>
                                        Loại ca máy{' '}
                                        <Text style={{color: 'red'}}>*</Text>
                                    </Text>
                                    <View style={styles.pickerWrapper}>
                                        <Picker
                                            selectedValue={
                                                machineShifts[index]
                                                    ?.processId || ''
                                            }
                                            onValueChange={value =>
                                                onChange(
                                                    index,
                                                    'processId',
                                                    value,
                                                )
                                            }
                                            style={styles.picker}>
                                            <Picker.Item
                                                label='Chọn'
                                                value=''
                                            />

                                            <Picker.Item
                                                key={shift._id}
                                                label={shift.processName}
                                                value={shift._id}
                                            />
                                        </Picker>
                                    </View>

                                    {machineShifts[index]?.processId ? (
                                        <>
                                            <Text style={styles.label}>
                                                Diện tích đã làm (
                                                {gardenAreaType}){' '}
                                                <Text style={{color: 'red'}}>
                                                    *
                                                </Text>
                                            </Text>
                                            <TextInput
                                                style={[
                                                    styles.input,
                                                    showWarning && {
                                                        borderColor: 'red',
                                                    },
                                                ]}
                                                keyboardType='numeric'
                                                placeholder='Nhập diện tích'
                                                placeholderTextColor='black'
                                                maxLength={6}
                                                value={
                                                    machineShifts[index]
                                                        ?.area || ''
                                                }
                                                onChangeText={text =>
                                                    handleHoursChange(
                                                        index,
                                                        text,
                                                        shift.childTaskStaff[0]
                                                            .processingRate,
                                                    )
                                                }
                                            />
                                            {showWarning && (
                                                <View
                                                    style={{
                                                        gap: 0,
                                                        marginBottom: 10,
                                                    }}>
                                                    <Text
                                                        style={
                                                            styles.warningText
                                                        }>
                                                        Diện tích không được
                                                        vượt quá {gardenArea}{' '}
                                                        {gardenAreaType}
                                                    </Text>

                                                    <Text
                                                        style={
                                                            styles.warningText
                                                        }>
                                                        Diện tích đã làm:{' '}
                                                        {
                                                            shift
                                                                .childTaskStaff[0]
                                                                .processingRate
                                                        }
                                                    </Text>
                                                </View>
                                            )}
                                        </>
                                    ) : null}
                                </View>
                            ) : (
                                <Text
                                    style={{
                                        color: 'red',
                                        fontStyle: 'italic',
                                        marginBottom: 8,
                                    }}>
                                    Hãy chọn khu vườn cần làm
                                </Text>
                            )}
                        </CollapsibleTaskBlock>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    warningText: {
        color: 'red',
        fontSize: 12,
        marginTop: 4,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    label: {
        fontWeight: '500',
        marginBottom: 4,
    },
    pickerWrapper: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        marginBottom: 12,
    },
    picker: {
        width: '100%',
        color: 'black',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 8,
        height: 60,
        color: 'black',
    },
});

export default MachineShiftSelector;
