import React, {useEffect, useRef, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Picker} from '@react-native-picker/picker';
import ActionButtons from './ActionButtons';
import MachineShiftSelector from './MachineShiftSelector';
import CollapsibleTaskBlock from './CollapsibleTaskBlock';
import {useAuthStore} from '../../../stores/authStore';
import {useWorkScheduleStore} from '../../../stores/workScheduleStore';

type TaskInput = {
    taskId: string;
    taskName: string;
    selectedMaterialId: string;
    processType: 'material' | 'machine' | 'labour' | '';
    value: string;
    area: string;
};

type ProcessOption = {
    id: string;
    name: string;
    specification: string;
    type: 'material' | 'machine' | 'labour';
};

const GardenDeclare = () => {
    const [taskInputs, setTaskInputs] = useState<TaskInput[]>([]);
    const {userInfo} = useAuthStore();
    const {detailWorkSchedule, getDetailWorkSchedule, requestPersonalTask} =
        useWorkScheduleStore();

    const route = useRoute<any>();
    const id = route.params?.id as string;

    const navigation = useNavigation();
    const hasLogged = useRef(false);
    const [showExitAlert, setShowExitAlert] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [onlyShowReportButton, setOnlyShowReportButton] = useState(false);
    const [showReportConfirmation, setShowReportConfirmation] = useState(false);

    useEffect(() => {
        if (id) getDetailWorkSchedule(id);
    }, [id]);

    useEffect(() => {
        if (detailWorkSchedule && !hasLogged.current) {
            console.log('📦 Chi tiết công việc:', detailWorkSchedule);
            hasLogged.current = true;
        }
    }, [detailWorkSchedule]);

    useEffect(() => {
        if (detailWorkSchedule?.childTasks?.length) {
            const inputs = detailWorkSchedule.childTasks.map((task: any) => ({
                taskId: task._id,
                taskName: task.name,
                selectedMaterialId: '',
                processType: '' as '' | 'material' | 'machine' | 'labour',
                value: '',
                area: '',
            }));
            setTaskInputs(inputs);
        }
    }, [detailWorkSchedule]);

    const getAllProcesses = (): ProcessOption[] => {
        const result: ProcessOption[] = [];
        if (detailWorkSchedule?.materials?.length) {
            result.push(
                ...detailWorkSchedule.materials
                    .filter((m: any) => m.name && m._id)
                    .map((m: any) => ({
                        id: m._id,
                        name: m.name,
                        specification: m.specification || '',
                        type: 'material' as const,
                    })),
            );
        }
        if (detailWorkSchedule?.machines?.length) {
            result.push(
                ...detailWorkSchedule.machines
                    .filter((m: any) => m.name && m._id)
                    .map((m: any) => ({
                        id: m._id,
                        name: m.name,
                        specification: m.specification || '',
                        type: 'machine' as const,
                    })),
            );
        }
        if (
            detailWorkSchedule?.labour &&
            detailWorkSchedule.labour.name &&
            detailWorkSchedule.labour._id
        ) {
            result.push({
                id: detailWorkSchedule.labour._id,
                name: detailWorkSchedule.labour.name,
                specification: detailWorkSchedule.labour.specification || '',
                type: 'labour' as const,
            });
        }

        return result;
    };

    const getProcessById = (
        id: string,
        type: 'material' | 'machine' | 'labour',
    ): ProcessOption | undefined => {
        switch (type) {
            case 'material': {
                const found = detailWorkSchedule?.materials?.find(
                    (m: any) => m._id === id,
                );
                return found
                    ? {
                          id: found._id,
                          name: found.name,
                          specification: found.specification,
                          type: 'material',
                      }
                    : undefined;
            }

            case 'machine': {
                const found = detailWorkSchedule?.machines?.find(
                    (m: any) => m._id === id,
                );
                return found
                    ? {
                          id: found._id,
                          name: found.name,
                          specification: found.specification,
                          type: 'machine',
                      }
                    : undefined;
            }

            case 'labour': {
                const labour = detailWorkSchedule?.labour;
                return labour?._id === id
                    ? {
                          id: labour._id,
                          name: labour.name,
                          specification: labour.specification,
                          type: 'labour',
                      }
                    : undefined;
            }
        }
    };

    const handleProcessChange = (
        index: number,
        selectedId: string,
        processType: 'material' | 'machine' | 'labour',
    ) => {
        setTaskInputs(prev => {
            const updated = [...prev];
            updated[index].selectedMaterialId = selectedId;
            updated[index].processType = processType;
            return updated;
        });
    };

    const handleInputChange = (
        index: number,
        field: 'value' | 'area',
        value: string,
    ) => {
        setTaskInputs(prev => {
            const updated = [...prev];
            updated[index][field] = value;
            return updated;
        });
    };

    const handleExit = () => navigation.goBack();

    const isTaskValid = (task: TaskInput) => {
        return (
            task.selectedMaterialId.trim() !== '' &&
            task.processType !== '' &&
            task.value.trim() !== '' &&
            task.area.trim() !== ''
        );
    };

    const handleReport = () => {
        const someValid = taskInputs.some(isTaskValid);
        if (someValid) {
            setShowReportConfirmation(true);
        } else {
            setShowExitAlert(true);
        }
    };

    const handleCancelReport = () => setShowReportConfirmation(false);

    const hasDeclarations = taskInputs.some(isTaskValid);

    const handleConfirmReport = async () => {
        setShowReportConfirmation(false);
        if (!detailWorkSchedule || !detailWorkSchedule._id) return;

        try {
            const requests = taskInputs.filter(isTaskValid);
            for (const task of requests) {
                if (task.processType === '') continue;

                const selected = getProcessById(
                    task.selectedMaterialId,
                    task.processType,
                );
                if (!selected) continue;

                await requestPersonalTask(detailWorkSchedule._id, task.taskId, {
                    specification: selected.specification,
                    processName: selected.name,
                    area: parseFloat(task.area),
                    value: parseFloat(task.value),
                });
            }

            if (detailWorkSchedule?.childTasks?.length) {
                const resetInputs = detailWorkSchedule.childTasks.map(
                    (task: any) => ({
                        taskId: task._id,
                        taskName: task.name,
                        selectedMaterialId: '',
                        processType: '' as
                            | ''
                            | 'material'
                            | 'machine'
                            | 'labour',
                        value: '',
                        area: '',
                    }),
                );
                setTaskInputs(resetInputs);
            }

            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        } catch (err) {
            console.error('❌ Lỗi khi gửi báo cáo:', err);
        }
    };

    if (!detailWorkSchedule) {
        return (
            <View style={styles.centered}>
                <Text>Đang tải dữ liệu công việc...</Text>
            </View>
        );
    }

    return (
        <View style={{flex: 1}}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.infoContainer}>
                    <Text style={styles.gardenName}>
                        {detailWorkSchedule.gardenName}
                    </Text>
                    <Text style={styles.gardenCode}>
                        {(detailWorkSchedule as any).gardenCode}
                    </Text>
                    <View style={styles.productBox}>
                        <Text style={styles.productLabel}>
                            Sản phẩm/cây trồng
                        </Text>
                        <View style={styles.productRow}>
                            <Icon name='add-circle' color='green' size={20} />
                            <Text style={styles.productText}>
                                {detailWorkSchedule.productName}
                            </Text>
                        </View>
                    </View>
                </View>

                <MachineShiftSelector
                    onStart={machineType =>
                        console.log('Ca máy được chọn:', machineType)
                    }
                    machines={detailWorkSchedule?.machines || []}
                />

                <CollapsibleTaskBlock
                    title={`Công việc (${
                        detailWorkSchedule?.childTasks?.length || 0
                    })`}>
                    {taskInputs.map((task, index) => {
                        const selected =
                            task.processType !== ''
                                ? getProcessById(
                                      task.selectedMaterialId,
                                      task.processType,
                                  )
                                : undefined;

                        return (
                            <CollapsibleTaskBlock
                                key={task.taskId}
                                title={task.taskName}
                                backgroundColor='#e6f3ff'>
                                <Text style={styles.label}>Loại quy trình</Text>
                                <View style={styles.pickerWrapper}>
                                    <Picker
                                        selectedValue={task.selectedMaterialId}
                                        onValueChange={itemValue => {
                                            const selected =
                                                getAllProcesses().find(
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
                                                label={`${process.name}`}
                                                value={process.id}
                                            />
                                        ))}
                                    </Picker>
                                </View>

                                {selected && (
                                    <>
                                        <Text style={styles.label}>
                                            {selected.name} (
                                            {selected.specification}){' '}
                                            <Text style={{color: 'red'}}>
                                                *
                                            </Text>
                                        </Text>

                                        <TextInput
                                            style={styles.input}
                                            keyboardType='numeric'
                                            placeholder='Nhập khối lượng'
                                            placeholderTextColor={'black'}
                                            value={task.value}
                                            onChangeText={text =>
                                                handleInputChange(
                                                    index,
                                                    'value',
                                                    text,
                                                )
                                            }
                                        />
                                    </>
                                )}

                                <Text style={styles.label}>
                                    Diện tích đã làm (m²){' '}
                                    <Text style={{color: 'red'}}>*</Text>
                                </Text>

                                <TextInput
                                    style={styles.input}
                                    keyboardType='numeric'
                                    placeholder='Nhập diện tích'
                                    placeholderTextColor={'black'}
                                    value={task.area}
                                    onChangeText={text =>
                                        handleInputChange(index, 'area', text)
                                    }
                                />
                            </CollapsibleTaskBlock>
                        );
                    })}
                </CollapsibleTaskBlock>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.exitButton1}
                    onPress={handleExit}>
                    <Text style={styles.exitText1}>Thoát ra</Text>
                </TouchableOpacity>
            </View>

            <ActionButtons
                visible={hasDeclarations}
                showAlert={showExitAlert}
                showReportConfirmation={showReportConfirmation}
                onReport={handleReport}
                onExit={handleExit}
                onCloseAlert={() => setShowExitAlert(false)}
                onConfirmReport={handleConfirmReport}
                onCancelReport={handleCancelReport}
                onlyShowReportButton={onlyShowReportButton}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {padding: 16, backgroundColor: 'white'},
    centered: {flex: 1, justifyContent: 'center', alignItems: 'center'},
    infoContainer: {marginBottom: 16},
    gardenName: {fontSize: 20, fontWeight: 'bold'},
    gardenCode: {fontSize: 16, color: 'green', fontWeight: 'bold'},
    productBox: {marginTop: 12},
    productLabel: {fontSize: 14, color: 'black'},
    productRow: {flexDirection: 'row', alignItems: 'center', marginTop: 4},
    productText: {marginLeft: 8, fontSize: 16},
    taskBox: {
        marginTop: 16,
        padding: 12,
        backgroundColor: '#f4f4f4',
        borderRadius: 8,
    },
    taskTitle: {fontSize: 16, fontWeight: 'bold', marginBottom: 8},
    materialBox: {marginBottom: 12},
    label: {fontSize: 14, marginBottom: 4},
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 8,
        marginBottom: 8,
        height: 50,
        color: 'black',
    },
    footer: {padding: 16, borderTopWidth: 1, borderColor: '#eee'},
    exitButton1: {
        padding: 12,
        backgroundColor: 'red',
        borderRadius: 6,
        alignItems: 'center',
    },
    exitText1: {color: 'white', fontWeight: '600', fontSize: 16},
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    card: {
        backgroundColor: '#e8f0ff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
    },

    pickerWrapper: {
        backgroundColor: '#e8f0ff',
        borderRadius: 8,
        height: 50,
        justifyContent: 'center',
        marginVertical: 8,
        borderColor: '#ccc',
        borderWidth: 1,
    },
    picker: {
        height: 55,
        color: '#333',
    },
});

export default GardenDeclare;
