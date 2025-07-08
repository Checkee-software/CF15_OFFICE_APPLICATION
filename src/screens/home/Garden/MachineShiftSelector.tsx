import React from 'react';
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
}) => {
    return (
        <View>
            <Text style={styles.sectionTitle}>
                Ca máy ({machineShifts.length})
            </Text>

            <View style={{gap: 12}}>
                {machineShifts.map((shift, index) => (
                    <CollapsibleTaskBlock
                        key={index}
                        title={shift.taskName}
                        backgroundColor='#FF98004D'>
                        <Text style={styles.label}>
                            Loại ca máy <Text style={{color: 'red'}}>*</Text>
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
                                        label={machine.name}
                                        value={machine._id}
                                    />
                                ))}
                            </Picker>
                        </View>

                        {shift.machineId ? (
                            <>
                                <Text style={styles.label}>
                                    Diện tích đã làm ({gardenAreaType})
                                    <Text style={{color: 'red'}}>*</Text>
                                </Text>

                                <TextInput
                                    style={styles.input}
                                    keyboardType='numeric'
                                    placeholder='Nhập diện tích'
                                    placeholderTextColor='black'
                                    value={shift.hours}
                                    onChangeText={text =>
                                        onChange(index, 'hours', text)
                                    }
                                />
                            </>
                        ) : null}
                    </CollapsibleTaskBlock>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
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
        height: 55,
        width: '100%',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 8,
        height: 55,
    },
});

export default MachineShiftSelector;
