import React, {useState} from 'react';
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
    gardenArea: number;
};

const TaskListSection = ({
    taskInputs,
    handleInputChange,
    styles,
    gardenAreaType,
    gardenArea,
    processingRate,
}: Props) => {
    const [tempInputValues, setTempInputValues] = useState<
        Record<string, string>
    >({});

    const handleAreaChange = (index: number, text: string) => {
        const normalizedText = text.replace(',', '.');
        const numericValue = parseFloat(normalizedText);

        if (isNaN(numericValue) || numericValue <= gardenArea) {
            handleInputChange(index, 'area', normalizedText);
            setTempInputValues(prev => ({...prev, [index]: ''}));
        } else {
            setTempInputValues(prev => ({...prev, [index]: normalizedText}));
        }
    };

    return (
        <View>
            <Text style={styles.sectionTitle}>
                Quy trình ({taskInputs.length})
            </Text>
            <View style={{gap: 12}}>
                {taskInputs.map((task, index) => {
                    const isCompleted = task.taskStatus === 'COMPELETED';
                    const isDisabled = isCompleted;
                    const currentInputValue =
                        tempInputValues[index] || task.area;
                    const areaValue = parseFloat(currentInputValue);
                    const showWarning =
                        !isDisabled &&
                        !isNaN(areaValue) &&
                        areaValue + processingRate > gardenArea;

                    return (
                        <CollapsibleTaskBlock
                            key={task.taskId}
                            title={task.taskName}
                            backgroundColor={
                                isCompleted ? '#d4edda' : '#e6f3ff'
                            }>
                            {isCompleted && (
                                <Text
                                    style={{
                                        color: 'red',
                                        fontStyle: 'italic',
                                        marginBottom: 8,
                                    }}>
                                    Công việc này đã hoàn thành, bạn không thể
                                    chỉnh sửa.
                                </Text>
                            )}

                            {!isCompleted && (
                                <>
                                    <Text style={styles.label}>
                                        Diện tích đã làm ({gardenAreaType}){' '}
                                        <Text style={{color: 'red'}}>*</Text>
                                    </Text>

                                    <TextInput
                                        style={[
                                            styles.input,
                                            showWarning && {borderColor: 'red'},
                                        ]}
                                        keyboardType='numeric'
                                        placeholder='Nhập diện tích'
                                        placeholderTextColor='black'
                                        value={task.area}
                                        onChangeText={text =>
                                            handleAreaChange(index, text)
                                        }
                                        editable={!isDisabled}
                                    />
                                </>
                            )}

                            {showWarning && (
                                <View style={{gap: 0, marginBottom: 10}}>
                                    <Text style={styles.warningText}>
                                        Diện tích không được vượt quá{' '}
                                        {gardenArea} {gardenAreaType}
                                    </Text>

                                    <Text style={styles.warningText}>
                                        Diện tích đã làm: {processingRate}{' '}
                                        {gardenAreaType}
                                    </Text>
                                </View>
                            )}
                        </CollapsibleTaskBlock>
                    );
                })}
            </View>
        </View>
    );
};

export default TaskListSection;
