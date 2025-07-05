import React, {useEffect, useRef, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation, useRoute} from '@react-navigation/native';
import ActionButtons from './ActionButtons';
import MachineShiftSelector from './MachineShiftSelector';
import {useAuthStore} from '../../../stores/authStore';
import {useWorkScheduleStore} from '../../../stores/workScheduleStore';
import {EProcessesType} from '@/shared-types/form-data/ProcessesFormData/ProcessesFormData';
import TaskListSection from './TaskListSection';

type TaskInput = {
    taskId: string;
    taskName: string;
    selectedMaterialId: string;
    processType: 'material' | '';
    value: string;
    area: string;
    disabled?: boolean;
};

type ProcessOption = {
    id: string;
    name: string;
    specification: string;
    type: 'material';
};

const GardenDeclare = () => {
    const [runningMachineId, setRunningMachineId] = useState<string | null>(
        null,
    );
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
    const convertToEProcessType = (type: 'material'): EProcessesType => {
        switch (type) {
            case 'material':
                return EProcessesType.VAT_TU;
            default:
                throw new Error('Loại quy trình không hợp lệ');
        }
    };

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
        if (detailWorkSchedule?.childTasks?.length && userInfo?._id) {
            const inputs = detailWorkSchedule.childTasks.map((task: any) => {
                const userInTask = task.staff?.find(
                    (s: any) => s.userId === userInfo._id,
                );
                const isCanceled = userInTask?.status === 'CANCELED';

                return {
                    taskId: task._id,
                    taskName: task.name,
                    selectedMaterialId: '',
                    processType: '' as '' | 'material',
                    value: '',
                    area: '',
                    disabled: isCanceled,
                };
            });
            setTaskInputs(inputs);
        }
    }, [detailWorkSchedule, userInfo]);

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

        return result;
    };

    const getProcessById = (
        id: string,
        type: 'material',
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
        }
    };

    const handleProcessChange = (
        index: number,
        selectedId: string,
        processType: 'material',
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
            !task.disabled &&
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
        if (!detailWorkSchedule?._id) return;

        try {
            const requests = taskInputs.filter(isTaskValid);
            for (const task of requests) {
                if (task.processType === '') continue;
                const selected = getProcessById(
                    task.selectedMaterialId,
                    task.processType,
                );
                if (!selected) continue;

                const payload = {
                    specification: selected.specification,
                    processName: selected.name,
                    area: parseFloat(task.area),
                    value: parseFloat(task.value),
                    type: convertToEProcessType(selected.type),
                };

                console.log('📤 Dữ liệu gửi đi:', {
                    scheduleId: detailWorkSchedule._id,
                    childTaskId: task.taskId,
                    ...payload,
                });

                await requestPersonalTask(
                    detailWorkSchedule._id,
                    task.taskId,
                    payload,
                );
            }

            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 1000);
            setTaskInputs(prev =>
                prev.map(task => ({
                    ...task,
                    selectedMaterialId: '',
                    processType: '',
                    value: '',
                    area: '',
                })),
            );
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
                            <Icon name='group-work' color='green' size={20} />
                            <Text style={styles.productText}>
                                {detailWorkSchedule.productName}
                            </Text>
                        </View>
                    </View>
                </View>

                <MachineShiftSelector
                    machines={detailWorkSchedule?.machines || []}
                    scheduleId={detailWorkSchedule?._id || ''}
                />

                <TaskListSection
                    taskInputs={taskInputs}
                    getAllProcesses={getAllProcesses}
                    getProcessById={getProcessById}
                    handleProcessChange={handleProcessChange}
                    handleInputChange={handleInputChange}
                    styles={styles}
                    gardenAreaType={detailWorkSchedule?.gardenAreaType || 'm²'}
                />
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.exitButton1}
                    onPress={handleExit}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Icon
                            name='arrow-circle-left'
                            size={22}
                            color='white'
                            style={{marginRight: 10}}
                        />
                        <Text style={styles.exitText1}>Thoát ra</Text>
                    </View>
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
        borderRadius: 26,
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
