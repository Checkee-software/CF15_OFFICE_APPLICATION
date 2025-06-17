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
import SCREEN_INFO from '../../../config/SCREEN_CONFIG/screenInfo';
import {useNavigation, useRoute} from '@react-navigation/native';
import ActionButtons from './ActionButtons';
import MachineShiftSelector from './MachineShiftSelector';
import CollapsibleTaskBlock from './CollapsibleTaskBlock';
import {useAuthStore} from '../../../stores/authStore';
import {useWorkScheduleStore} from '../../../stores/workScheduleStore';
import {Picker} from '@react-native-picker/picker';

const GardenDeclare = () => {
    const [taskInputs, setTaskInputs] = useState<TaskInput[]>([]);

    const {userInfo} = useAuthStore();
    const {detailWorkSchedule, getDetailWorkSchedule} = useWorkScheduleStore();

    const route = useRoute<any>();
    const id = route.params?.id as string;

    const navigation = useNavigation();

    const [showExitAlert, setShowExitAlert] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [onlyShowReportButton, setOnlyShowReportButton] = useState(false);
    const [showReportConfirmation, setShowReportConfirmation] = useState(false);

    const hasLogged = useRef(false);

    useEffect(() => {
        if (id) getDetailWorkSchedule(id);
    }, [id]);

    useEffect(() => {
        if (detailWorkSchedule && !hasLogged.current) {
            console.log('📦 Chi tiết công việc:', detailWorkSchedule);
            hasLogged.current = true;
        }
    }, [detailWorkSchedule]);

    type TaskInput = {
        taskId: string;
        taskName: string;
        selectedMaterialId: string;
        value: string;
        area: string;
    };

    useEffect(() => {
        if (detailWorkSchedule?.childTasks?.length) {
            const inputs = detailWorkSchedule.childTasks.map((task: any) => ({
                taskId: task._id,
                taskName: task.name,
                selectedMaterialId: '',
                value: '',
                area: '',
            }));
            setTaskInputs(inputs);
        }
    }, [detailWorkSchedule]);

    const handleInputChange = (
        index: number,
        field: 'selectedMaterialId' | 'value' | 'area',
        value: string,
    ) => {
        setTaskInputs(prev => {
            const updated = [...prev];
            updated[index][field] = value;
            return updated;
        });
    };

    const getMaterialById = (id: string) => {
        return detailWorkSchedule?.materials?.find((m: any) => m._id === id);
    };

    const handleExit = () => navigation.goBack();
    const isTaskValid = (task: TaskInput) => {
        return (
            task.selectedMaterialId.trim() !== '' &&
            task.value.trim() !== '' &&
            task.area.trim() !== ''
        );
    };
    const handleReport = () => {
        const allValid = taskInputs.every(isTaskValid);
        if (allValid) {
            setShowReportConfirmation(true);
        } else {
            setShowExitAlert(true);
        }
    };

    const handleCancelReport = () => setShowReportConfirmation(false);
    const {requestPersonalTask} = useWorkScheduleStore();
    const hasDeclarations = taskInputs.some(isTaskValid);

    const handleConfirmReport = async () => {
        setShowReportConfirmation(false);
        if (!detailWorkSchedule || !detailWorkSchedule._id) return;

        try {
            const requests = taskInputs.filter(isTaskValid);
            for (const task of requests) {
                const selectedMaterial = getMaterialById(
                    task.selectedMaterialId,
                );

                await requestPersonalTask(detailWorkSchedule._id, task.taskId, {
                    specification: selectedMaterial?.specification || '',
                    processName: selectedMaterial?.name ?? '',
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
                        {detailWorkSchedule?.gardenName}
                    </Text>
                    <Text style={styles.gardenCode}>
                        {(detailWorkSchedule as any)?.gardenCode}
                    </Text>
                    <View style={styles.productBox}>
                        <Text style={styles.productLabel}>
                            Sản phẩm/cây trồng
                        </Text>
                        <View style={styles.productRow}>
                            <Icon name='add-circle' color='green' size={20} />
                            <Text style={styles.productText}>
                                {detailWorkSchedule?.productName}
                            </Text>
                        </View>
                    </View>
                </View>

                <MachineShiftSelector
                    onStart={machineType => {
                        console.log('Ca máy được chọn:', machineType);
                    }}
                />

                <CollapsibleTaskBlock
                    title={`Công việc (${
                        detailWorkSchedule?.childTasks?.length || 0
                    })`}>
                    {taskInputs.map((task, index) => {
                        const selectedMaterial = getMaterialById(
                            task?.selectedMaterialId,
                        );

                        return (
                            <CollapsibleTaskBlock
                                key={task.taskId}
                                title={task?.taskName}
                                backgroundColor='#e6f3ff'>
                                <Text style={styles.label}>Loại quy trình</Text>
                                <View style={styles.pickerWrapper}>
                                    <Picker
                                        selectedValue={task?.selectedMaterialId}
                                        onValueChange={itemValue =>
                                            handleInputChange(
                                                index,
                                                'selectedMaterialId',
                                                itemValue,
                                            )
                                        }
                                        style={styles.picker}
                                        dropdownIconColor='#000'>
                                        <Picker.Item label='Chọn' value='' />
                                        {detailWorkSchedule?.materials.map(
                                            material => (
                                                <Picker.Item
                                                    key={material._id}
                                                    label={material.name}
                                                    value={material._id}
                                                />
                                            ),
                                        )}
                                    </Picker>
                                </View>

                                {task?.selectedMaterialId ? (
                                    <>
                                        <Text style={styles.label}>
                                            {selectedMaterial?.name} (
                                            {selectedMaterial?.specification})
                                            <Text style={{color: 'red'}}>
                                                {' '}
                                                *
                                            </Text>
                                        </Text>

                                        <TextInput
                                            style={styles.input}
                                            keyboardType='numeric'
                                            placeholder='Nhập khối lượng'
                                            value={task?.value}
                                            onChangeText={text =>
                                                handleInputChange(
                                                    index,
                                                    'value',
                                                    text,
                                                )
                                            }
                                        />
                                    </>
                                ) : null}

                                <Text style={styles.label}>
                                    Diện tích đã làm (m²)
                                    <Text style={{color: 'red'}}> *</Text>
                                </Text>

                                <TextInput
                                    style={styles.input}
                                    keyboardType='numeric'
                                    placeholder='Nhập diện tích'
                                    value={task?.area}
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
