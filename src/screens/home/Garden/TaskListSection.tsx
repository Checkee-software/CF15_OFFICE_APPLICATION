/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import CollapsibleTaskBlock from './CollapsibleTaskBlock';
import Snackbar from 'react-native-snackbar';

type TaskInput = {
    taskId: string;
    taskName: string;
    area: string;
    currentArea: number;
    disabled?: boolean;
    taskStatus?: string;
};

type Props = {
    gardenId: string;
    taskInputs: TaskInput[];
    handleInputChange: (index: number, field: 'area', value: string) => void;
    styles: any;
    gardenAreaType: string;
    gardenArea: number;
    processingRate: number;
};

const TaskListSection = ({
    gardenId,
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

    console.log(gardenArea);

    const handleAreaChange = (index: number, text: string, currentArea: number) => {
        if (gardenId === '') {
            Snackbar.show({
                text: 'Bạn chưa chọn khu vườn cần làm',
                duration: Snackbar.LENGTH_SHORT,
            });
            return;
        }
        if (text.startsWith('.') || text.startsWith(',')) {
            return;
        }
        if (text.includes('-') || text.includes(' ')) {
            return;
        }
        //tối đa 2 số sau dấu chấm
        const regex = /^\d*(\.\d{0,2})?$/;
        if (!regex.test(text.replace(',', '.'))) {
            return;
        }
        const currentText = tempInputValues[index] || taskInputs[index].area;
        const isAdding = text.length > currentText.length;
        const endsWithDotOrComma = /[.,]$/.test(text);
        const alreadyHasDotOrComma =
            currentText.includes('.') || currentText.includes(',');

        if (isAdding && alreadyHasDotOrComma && endsWithDotOrComma) {
            return;
        }
        const normalizedText = text.replace(',', '.');
        const numericValue = parseFloat(normalizedText);

        const totalCurrentArea = numericValue + currentArea;

        if (isNaN(numericValue) || totalCurrentArea <= gardenArea) {
            handleInputChange(index, 'area', normalizedText);
            setTempInputValues(prev => ({ ...prev, [index]: '' }));
        } else {
            setTempInputValues(prev => ({
                ...prev,
                [index]: normalizedText,
            }));
        }
    };


    console.log(taskInputs);
    console.log(gardenAreaType);

    return (
        <View>
            <Text style={styles.sectionTitle}>
                Báo cáo quy trình ({taskInputs.length})
            </Text>
            <View style={{ gap: 12 }}>
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
                                    Quy trình này đã hoàn thành, bạn không thể
                                    chỉnh sửa.
                                </Text>
                            )}

                            {!isCompleted &&
                                gardenArea === task.currentArea &&
                                gardenId !== '' ? (
                                <Text
                                    style={{
                                        color: 'red',
                                        fontStyle: 'italic',
                                        marginBottom: 8,
                                    }}>
                                    Bạn đã làm đủ diện tích của quy trình này.
                                    Chờ cán bộ duyệt để hoàn thành.
                                </Text>
                            ) : gardenId === '' ? (
                                <Text
                                    style={{
                                        color: 'red',
                                        fontStyle: 'italic',
                                        marginBottom: 8,
                                    }}>
                                    Hãy chọn khu vườn cần làm
                                </Text>
                            ) : (
                                <>
                                    <Text style={styles.label}>
                                        Diện tích đã làm{' '}
                                        <Text style={{ color: 'red' }}>
                                            {task.currentArea} ha
                                        </Text>
                                    </Text>

                                    <TextInput
                                        style={[
                                            styles.input,
                                            showWarning && { borderColor: 'red' },
                                        ]}
                                        keyboardType='numeric'
                                        placeholder='Nhập diện tích'
                                        placeholderTextColor='black'
                                        maxLength={6}
                                        value={task.area}
                                        onChangeText={text =>
                                            handleAreaChange(index, text, task.currentArea)
                                        }
                                        editable={!isDisabled}
                                    />
                                </>
                            )}

                            {showWarning && (
                                <View style={{ gap: 0, marginBottom: 10 }}>
                                    <Text style={styles.warningText}>
                                        Diện tích không được vượt quá{' '}
                                        {gardenArea} {gardenAreaType}
                                    </Text>

                                    <Text style={styles.warningText}>
                                        Diện tích đã làm: {task.currentArea}{' '}
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
