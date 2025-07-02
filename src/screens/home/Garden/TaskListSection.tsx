import React from 'react';
import {Text, TextInput, View} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import CollapsibleTaskBlock from './CollapsibleTaskBlock';

type TaskInput = {
    taskId: string;
    taskName: string;
    selectedMaterialId: string;
    processType: 'material' | 'labour' | '';
    value: string;
    area: string;
    disabled?: boolean;
};

type ProcessOption = {
    id: string;
    name: string;
    specification: string;
    type: 'material' | 'labour';
};

type Props = {
    taskInputs: TaskInput[];
    getAllProcesses: () => ProcessOption[];
    getProcessById: (
        id: string,
        type: 'material' | 'labour',
    ) => ProcessOption | undefined;
    handleProcessChange: (
        index: number,
        selectedId: string,
        processType: 'material' | 'labour',
    ) => void;
    handleInputChange: (
        index: number,
        field: 'value' | 'area',
        value: string,
    ) => void;
    styles: any;
    gardenAreaType: string;
};

const TaskListSection = ({
    taskInputs,
    getAllProcesses,
    getProcessById,
    handleProcessChange,
    handleInputChange,
    styles,
    gardenAreaType,
}: Props) => {
    return (
        <CollapsibleTaskBlock title={`Công việc (${taskInputs.length})`}>
            {taskInputs.map((task, index) => {
                const selected = task.processType
                    ? getProcessById(task.selectedMaterialId, task.processType)
                    : undefined;

                return (
                    <CollapsibleTaskBlock
                        key={task.taskId}
                        title={task.taskName}
                        backgroundColor='#e6f3ff'>
                        {task.disabled && (
                            <Text
                                style={{
                                    color: 'red',
                                    fontStyle: 'italic',
                                    marginBottom: 8,
                                }}>
                                Công việc này đã bị huỷ, bạn không thể chỉnh
                                sửa.
                            </Text>
                        )}

                        <Text style={styles.label}>Loại quy trình</Text>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                enabled={!task.disabled}
                                selectedValue={task.selectedMaterialId}
                                onValueChange={itemValue => {
                                    const selected = getAllProcesses().find(
                                        p => p.id === itemValue,
                                    );
                                    if (selected) {
                                        handleProcessChange(
                                            index,
                                            selected.id,
                                            selected.type,
                                        );
                                    }
                                }}
                                style={styles.picker}
                                dropdownIconColor='#000'>
                                <Picker.Item label='Chọn' value='' />
                                {getAllProcesses().map(process => (
                                    <Picker.Item
                                        key={process.id}
                                        label={process.name}
                                        value={process.id}
                                    />
                                ))}
                            </Picker>
                        </View>

                        {selected && (
                            <>
                                <Text style={styles.label}>
                                    {selected.name} ({selected.specification}){' '}
                                    <Text style={{color: 'red'}}>*</Text>
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    keyboardType='numeric'
                                    placeholder='Nhập khối lượng'
                                    placeholderTextColor='black'
                                    value={task.value}
                                    onChangeText={text =>
                                        handleInputChange(index, 'value', text)
                                    }
                                    editable={!task.disabled}
                                />
                            </>
                        )}

                        <Text style={styles.label}>
                            Diện tích đã làm ({gardenAreaType}){' '}
                            <Text style={{color: 'red'}}>*</Text>
                        </Text>

                        <TextInput
                            style={styles.input}
                            keyboardType='numeric'
                            placeholder='Nhập diện tích'
                            placeholderTextColor='black'
                            value={task.area}
                            onChangeText={text =>
                                handleInputChange(index, 'area', text)
                            }
                            editable={!task.disabled}
                        />
                    </CollapsibleTaskBlock>
                );
            })}
        </CollapsibleTaskBlock>
    );
};

export default TaskListSection;
