import React from 'react';
import {Text, TextInput, View} from 'react-native';
import CollapsibleTaskBlock from './CollapsibleTaskBlock';

type TaskInput = {
    taskId: string;
    taskName: string;
    area: string;
    disabled?: boolean;
    taskStatus?: string;
};

type Props = {
    taskInputs: TaskInput[];
    handleInputChange: (index: number, field: 'area', value: string) => void;
    styles: any;
    gardenAreaType: string;
};

const TaskListSection = ({
    taskInputs,
    handleInputChange,
    styles,
    gardenAreaType,
}: Props) => {
    return (
        <View>
            <Text style={styles.sectionTitle}>
                Quy trình ({taskInputs.length})
            </Text>
            <View style={{gap: 12}}>
                {taskInputs.map((task, index) => {
                    const isCompleted = task.taskStatus === 'COMPLETED';
                    return (
                        <CollapsibleTaskBlock
                            key={task.taskId}
                            title={task.taskName}
                            backgroundColor={
                                isCompleted ? '#d4edda' : '#e6f3ff'
                            }>
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
            </View>
        </View>
    );
};

export default TaskListSection;
