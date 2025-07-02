import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {useMachineStore} from '@/stores/machineStore';

interface MachineShift {
    _id: string;
    name: string;
    createdBy: string;
    title: string;
    totalTime: number;
}

const ActiveMachine = () => {
    const route = useRoute();
    const {getActiveMachine} = useMachineStore();

    const {scheduleId} = route.params as {scheduleId: string};

    const [activeShifts, setActiveShifts] = useState<MachineShift[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!scheduleId) return;
            const data = await getActiveMachine(scheduleId);
            setActiveShifts(data);
        };

        fetchData();
    }, [scheduleId]);

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {activeShifts.map((shift, index) => (
                    <View key={shift._id} style={styles.shiftCard}>
                        <Text style={styles.value1}>{shift.title}</Text>

                        <View style={styles.row}>
                            <Text style={styles.label}>Người thực hiện</Text>
                            <Text style={styles.value}>{shift.createdBy}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>Loại ca máy</Text>
                            <Text style={styles.value}>{shift.name}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>Thời gian</Text>
                            <Text style={styles.value}>
                                {shift.totalTime} phút
                            </Text>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: 'white',
        flex: 1,
    },
    scrollContainer: {
        gap: 12,
    },
    shiftCard: {
        backgroundColor: '#EAF6FF',
        borderRadius: 8,
        padding: 12,
        gap: 10,
    },
    shiftTitle: {
        fontWeight: '600',
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    label: {
        fontSize: 14,
        color: '#333',
    },
    value: {
        fontSize: 14,
        color: '#333',
    },
    value1: {
        fontSize: 14,
        color: '#333',
        fontWeight: 'bold',
    },
});

export default ActiveMachine;
