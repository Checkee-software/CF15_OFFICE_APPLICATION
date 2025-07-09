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
import {Picker} from '@react-native-picker/picker';
import {useNavigation, useRoute} from '@react-navigation/native';
import ActionButtons from './ActionButtons';
import {useAuthStore} from '../../../stores/authStore';
import {useWorkScheduleStore} from '../../../stores/workScheduleStore';
import TaskListSection from './TaskListSection';
import Snackbar from 'react-native-snackbar';

type TaskInput = {
    taskId: string;
    taskName: string;
    area: string;
    disabled?: boolean;
    taskStatus?: string;
};

type AdditionalSupply = {
    name: string;
    value: string;
    childTaskId: string;
};

const GardenDeclare = () => {
    const [taskInputs, setTaskInputs] = useState<TaskInput[]>([]);
    const [additionalSupplies, setAdditionalSupplies] = useState<
        AdditionalSupply[]
    >([{name: '', value: '', childTaskId: ''}]);

    const {userInfo} = useAuthStore();
    const {
        detailWorkSchedule,
        getDetailWorkSchedule,
        requestPersonalTask,
        requestAdditionalMaterial,
    } = useWorkScheduleStore();

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
        if (detailWorkSchedule?.childTasks?.length && userInfo?._id) {
            const inputs = detailWorkSchedule.childTasks.map((task: any) => {
                const userInTask = task.staff?.find(
                    (s: any) => s.userId === userInfo._id,
                );
                const isCanceled = userInTask?.status === 'CANCELED';

                return {
                    taskId: task._id,
                    taskName: task.name,
                    area: '',
                    disabled: isCanceled,
                    taskStatus: task.status,
                };
            });
            setTaskInputs(inputs);
        }
    }, [detailWorkSchedule, userInfo]);

    const handleInputChange = (index: number, field: 'area', value: string) => {
        setTaskInputs(prev => {
            const updated = [...prev];
            updated[index][field] = value;
            return updated;
        });
    };

    const handleExit = () => navigation.goBack();

    const isTaskValid = (task: TaskInput) => {
        return !task.disabled && task.area.trim() !== '';
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
                const payload = {
                    area: parseFloat(task.area),
                };

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
                    area: '',
                })),
            );
        } catch (err) {
            console.error('❌ Lỗi khi gửi báo cáo:', err);
        }
    };

    const handleAddSupply = () => {
        setAdditionalSupplies(prev => [
            ...prev,
            {name: '', value: '', childTaskId: ''},
        ]);
    };

    const handleChangeSupplyField = (
        index: number,
        field: keyof AdditionalSupply,
        value: string,
    ) => {
        setAdditionalSupplies(prev => {
            const updated = [...prev];
            updated[index] = {...updated[index], [field]: value};
            return updated;
        });
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

                <TaskListSection
                    taskInputs={taskInputs}
                    handleInputChange={handleInputChange}
                    styles={styles}
                    gardenAreaType={detailWorkSchedule?.gardenAreaType || 'm²'}
                />

                <View style={{marginTop: 16}}>
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 12,
                        }}>
                        <Text
                            style={{
                                fontSize: 16,
                                fontWeight: '600',
                                marginBottom: 12,
                            }}>
                            Nguồn cung thêm
                        </Text>
                        <TouchableOpacity onPress={handleAddSupply}>
                            <Icon name='add' size={20} color='blue' />
                        </TouchableOpacity>
                    </View>

                    {additionalSupplies.map((item, index) => (
                        <View key={index} style={{marginBottom: 28}}>
                            <TextInput
                                style={styles.input}
                                placeholder='Tên vật tư'
                                placeholderTextColor={'black'}
                                value={item.name}
                                onChangeText={text =>
                                    handleChangeSupplyField(index, 'name', text)
                                }
                            />
                            <TextInput
                                style={styles.input}
                                placeholder='Giá trị (kg)'
                                placeholderTextColor={'black'}
                                keyboardType='numeric'
                                value={item.value}
                                onChangeText={text =>
                                    handleChangeSupplyField(
                                        index,
                                        'value',
                                        text,
                                    )
                                }
                            />
                            <View style={styles.dropdownContainer}>
                                <Picker
                                    style={{color: 'black'}}
                                    selectedValue={item.childTaskId}
                                    onValueChange={value =>
                                        handleChangeSupplyField(
                                            index,
                                            'childTaskId',
                                            value,
                                        )
                                    }>
                                    <Picker.Item
                                        label='Chọn công việc'
                                        value=''
                                    />
                                    {detailWorkSchedule.childTasks.map(
                                        (task: any) => (
                                            <Picker.Item
                                                key={task._id}
                                                label={task.name}
                                                value={task._id}
                                            />
                                        ),
                                    )}
                                </Picker>
                            </View>
                        </View>
                    ))}

                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            additionalSupplies.every(
                                s => s.name && s.value && s.childTaskId,
                            )
                                ? null
                                : {backgroundColor: '#ccc'},
                        ]}
                        disabled={
                            !additionalSupplies.every(
                                s => s.name && s.value && s.childTaskId,
                            )
                        }
                        onPress={async () => {
                            if (!detailWorkSchedule?._id) return;
                            try {
                                for (const supply of additionalSupplies) {
                                    await requestAdditionalMaterial(
                                        detailWorkSchedule._id,
                                        supply.childTaskId,
                                        {
                                            name: supply.name,
                                            value: Number(supply.value),
                                        },
                                    );
                                }
                                setAdditionalSupplies([
                                    {name: '', value: '', childTaskId: ''},
                                ]);
                            } catch (err) {
                                console.error(
                                    '❌ Lỗi khi gửi vật tư thêm:',
                                    err,
                                );
                            }
                        }}>
                        <Text style={styles.saveButtonText}>Lưu</Text>
                    </TouchableOpacity>
                </View>
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
    dropdownContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        backgroundColor: '#fff',
    },
    container: {padding: 16, backgroundColor: 'white'},
    centered: {flex: 1, justifyContent: 'center', alignItems: 'center'},
    infoContainer: {marginBottom: 16},
    gardenName: {fontSize: 20, fontWeight: 'bold'},
    gardenCode: {fontSize: 16, color: 'green', fontWeight: 'bold'},
    productBox: {
        marginTop: 12,
        backgroundColor: '#4CAF5026',
        padding: 10,
        borderRadius: 8,
    },
    productLabel: {fontSize: 14, color: 'black'},
    productRow: {flexDirection: 'row', alignItems: 'center', marginTop: 4},
    productText: {marginLeft: 8, fontSize: 16},
    label: {fontWeight: '500', marginBottom: 4},
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 8,
        marginBottom: 8,
        height: 55,
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
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },

    saveButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 24,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    },
});

export default GardenDeclare;
