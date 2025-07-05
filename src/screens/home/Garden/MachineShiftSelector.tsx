import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {useNavigation, NavigationProp} from '@react-navigation/native';
import SCREEN_INFO from '../../../config/SCREEN_CONFIG/screenInfo';
import {INorm} from '../../../shared-types/Response/ScheduleResponse/ScheduleResponse';
import {useMachineStore} from '@/stores/machineStore';
import {useWorkScheduleStore} from '@/stores/workScheduleStore';

interface MachineShiftSelectorProps {
    machines: INorm[];
    scheduleId: string;
    currentUserName?: string;
}

const MachineShiftSelector: React.FC<MachineShiftSelectorProps> = ({
    machines,
    scheduleId,
    currentUserName,
}) => {
    const [selectedMachine, setSelectedMachine] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [activeMachineId, setActiveMachineId] = useState<string | null>(null);
    const [activeCount, setActiveCount] = useState(0);

    const navigation = useNavigation<NavigationProp<any>>();
    const {startMachine, stopMachine, getActiveMachine} = useMachineStore();

    const machineOptions = [{label: 'Chọn ca máy', value: ''}].concat(
        machines.map(machine => ({
            label: machine.name,
            value: machine._id,
        })),
    );

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isRunning) {
            timer = setInterval(() => {
                setSeconds(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isRunning]);

    useEffect(() => {
        const runningMachines = machines.filter(machine =>
            machine.history?.some(h => h.isActive),
        );

        setActiveCount(runningMachines.length);

        const runningMachine = runningMachines[0]; 
        if (runningMachine) {
            const activeHistory = runningMachine.history.find(h => h.isActive);
            setSelectedMachine(runningMachine._id);
            setIsRunning(true);
            setActiveMachineId(runningMachine._id);

            if (activeHistory?.startAt) {
                const startTimestamp = new Date(activeHistory.startAt).getTime();

                setSeconds(Math.floor((Date.now() - startTimestamp) / 1000));

                const interval = setInterval(() => {
                    const elapsed = Math.floor(
                        (Date.now() - startTimestamp) / 1000,
                    );
                    setSeconds(elapsed);
                }, 1000);

                return () => clearInterval(interval);
            }
        }
    }, [machines]);

    const handlePress = async () => {
        if (!isRunning) {
            if (!selectedMachine) return;

            await startMachine({
                scheduleId,
                machineId: selectedMachine,
                startAt: new Date(),
            });

            setIsRunning(true);
            setActiveMachineId(selectedMachine);
        } else {
            if (!activeMachineId) {
                console.warn(
                    'Không tìm thấy ca máy đang hoạt động để kết thúc',
                );
                return;
            }

            await stopMachine({
                scheduleId,
                machineId: activeMachineId,
                endAt: new Date(),
            });

            setIsRunning(false);
            setSeconds(0);
            setActiveMachineId(null);

            const {getDetailWorkSchedule} = useWorkScheduleStore.getState();
            await getDetailWorkSchedule(scheduleId);
        }
    };

    const formatTime = (sec: number) => {
        const h = String(Math.floor(sec / 3600)).padStart(2, '0');
        const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
        const s = String(sec % 60).padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    const isDisabled = !selectedMachine;

    const getButtonStyle = () => {
        if (isDisabled) return [styles.button, styles.buttonDisabled];
        return [
            styles.button,
            isRunning ? styles.buttonRunning : styles.buttonEnabled,
        ];
    };

    const runningLabel =
        machineOptions.find(opt => opt.value === selectedMachine)?.label || '';

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.title}>Ca máy</Text>
                {activeCount > 0 && (
                    <Text style={styles.activeCount}>
                        (đang hoạt động: {activeCount})
                    </Text>
                )}
            </View>

            {activeCount > 0 && (
                <TouchableOpacity
                    onPress={async () => {
                        await getActiveMachine(scheduleId);
                        navigation.navigate(SCREEN_INFO.ACTIVEMACHINE.key, {
                            scheduleId,
                        });
                    }}>
                    <Text style={styles.activeLink}>
                        Xem ca máy đang hoạt động
                    </Text>
                </TouchableOpacity>
            )}

            <View style={styles.box}>
                <Text style={styles.label}>Kích hoạt ca máy</Text>

                {!isRunning && (
                    <>
                        <Text style={styles.subLabel}>Loại ca máy</Text>
                        <View style={styles.pickerWrapper}>
                            <Picker
                                selectedValue={selectedMachine}
                                onValueChange={value => {
                                    setSelectedMachine(value);
                                    setIsRunning(false);
                                    setSeconds(0);
                                }}
                                style={styles.picker}>
                                {machineOptions.map(option => (
                                    <Picker.Item
                                        key={option.value}
                                        label={option.label}
                                        value={option.value}
                                    />
                                ))}
                            </Picker>
                        </View>
                    </>
                )}

                {isRunning && (
                    <View style={styles.shiftRow}>
                        <Text style={styles.runningText}>{runningLabel}</Text>
                        <Text style={styles.runningText}>
                            {formatTime(seconds)}
                        </Text>
                    </View>
                )}

                <TouchableOpacity
                    style={getButtonStyle()}
                    onPress={handlePress}
                    disabled={isDisabled}>
                    <Text style={styles.buttonText}>
                        {isRunning ? 'Kết thúc' : 'Bắt đầu ngay'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
    },
    activeCount: {
        fontSize: 14,
        color: '#888',
        fontStyle: 'italic',
    },
    activeLink: {
        color: '#007bff',
        fontSize: 14,
        marginVertical: 8,
        alignSelf: 'center',
    },
    box: {
        backgroundColor: '#80808026',
        padding: 14,
        borderRadius: 10,
        marginTop: 8,
    },
    label: {
        fontWeight: '600',
        marginBottom: 8,
        fontSize: 14,
    },
    subLabel: {
        fontSize: 14,
        marginBottom: 6,
    },
    pickerWrapper: {
        borderRadius: 8,
        marginBottom: 16,
        borderColor: 'gray',
        borderWidth: 1,
    },
    picker: {
        height: 55,
        padding: 10,
        color: 'black',
    },
    shiftRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    runningText: {
        fontSize: 15,
        fontWeight: '400',
    },
    button: {
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
    },
    buttonDisabled: {
        backgroundColor: 'gray',
    },
    buttonEnabled: {
        backgroundColor: '#4CAF50',
    },
    buttonRunning: {
        backgroundColor: '#2196F3',
    },
});

export default MachineShiftSelector;
