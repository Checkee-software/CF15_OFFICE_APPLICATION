import React, {useState} from 'react';
import {View, Text, StyleSheet, TextInput} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {INorm} from '../../../shared-types/Response/ScheduleResponse/ScheduleResponse';
import CollapsibleTaskBlock from './CollapsibleTaskBlock';

interface MachineShiftInput {
    machineId: string;
    hours: string;
    taskName: string;
    gardenAreaType: string;
}

interface Props {
    machines: INorm[];
    machineShifts: MachineShiftInput[];
    gardenAreaType: string;
    gardenArea: number;
    onChange: (
        index: number,
        field: 'machineId' | 'hours',
        value: string,
    ) => void;
}

const MachineShiftSelector: React.FC<Props> = ({
    machines,
    machineShifts,
    onChange,
    gardenAreaType,
    gardenArea,
    processingRate,
}) => {
    const [tempInputValues, setTempInputValues] = useState<
        Record<string, string>
    >({});

    if (!machineShifts.length) return null;

    const handleHoursChange = (index: number, text: string) => {
        const currentText =
            tempInputValues[index] || machineShifts[index].hours;

        if (text.includes('-')) {
            return;
        }

        const isAdding = text.length > currentText.length;
        const endsWithDotOrComma = /[.,]$/.test(text);
        const alreadyHasDotOrComma =
            currentText.includes('.') || currentText.includes(',');

        if (isAdding && alreadyHasDotOrComma && endsWithDotOrComma) {
            return;
        }

        const normalizedText = text.replace(',', '.');
        const numericValue = parseFloat(normalizedText);

        if (isNaN(numericValue) || numericValue <= gardenArea) {
            onChange(index, 'hours', normalizedText);
            setTempInputValues(prev => ({...prev, [index]: ''}));
        } else {
            setTempInputValues(prev => ({...prev, [index]: normalizedText}));
        }
    };

    return (
        <View>
            <Text style={styles.sectionTitle}>Ca máy</Text>

            <View style={{gap: 12}}>
                {machineShifts.map((shift, index) => {
                    const currentInputValue =
                        tempInputValues[index] || shift.hours;
                    const areaValue = parseFloat(currentInputValue);
                    const showWarning =
                        !isNaN(areaValue) &&
                        areaValue + processingRate > gardenArea;

                    return (
                        <CollapsibleTaskBlock
                            key={index}
                            title={shift.taskName}
                            backgroundColor='#FF98004D'>
                            <View style={{gap: 8}}>
                                <Text style={styles.label}>
                                    Loại ca máy{' '}
                                    <Text style={{color: 'red'}}>*</Text>
                                </Text>
                                <View style={styles.pickerWrapper}>
                                    <Picker
                                        selectedValue={shift.machineId}
                                        onValueChange={value =>
                                            onChange(index, 'machineId', value)
                                        }
                                        style={styles.picker}>
                                        <Picker.Item label='Chọn' value='' />
                                        {machines.map(machine => (
                                            <Picker.Item
                                                key={machine._id}
                                                label={machine.processName}
                                                value={machine._id}
                                            />
                                        ))}
                                    </Picker>
                                </View>

                                {shift.machineId ? (
                                    <>
                                        <Text style={styles.label}>
                                            Diện tích đã làm ({gardenAreaType}){' '}
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
                                            value={shift.hours}
                                            onChangeText={text =>
                                                handleHoursChange(index, text)
                                            }
                                        />
                                        {showWarning && (
                                            <View
                                                style={{
                                                    gap: 0,
                                                    marginBottom: 10,
                                                }}>
                                                <Text
                                                    style={styles.warningText}>
                                                    Diện tích không được vượt
                                                    quá {gardenArea}{' '}
                                                    {gardenAreaType}
                                                </Text>

                                                <Text
                                                    style={[
                                                        styles.warningText,
                                                        {marginTop: 0},
                                                    ]}>
                                                    Diện tích đã làm:{' '}
                                                    {processingRate}{' '}
                                                    {gardenAreaType}
                                                </Text>
                                            </View>
                                        )}
                                    </>
                                ) : null}
                            </View>
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
