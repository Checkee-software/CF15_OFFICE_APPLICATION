import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import CollapsibleTaskBlock from './CollapsibleTaskBlock';

interface MachineShift {
    _id: string;
    title: string;
    createdBy: string;
    name: string;
    totalTime: number;
}

interface Props {
    shifts: MachineShift[];
    gardenAreaType: string;
}

const MachineShiftHistorySection = ({shifts, gardenAreaType}: Props) => {
    return (
        <CollapsibleTaskBlock
            noWrapperPadding={true}
            title={`Lịch sử ca máy (${shifts.length})`}>
            <View style={styles.container}>
                {shifts.map(shift => (
                    <View key={shift._id} style={styles.card}>
                        <Text style={styles.taskName}>{shift.title}</Text>

                        <View style={styles.row}>
                            <Text style={styles.label}>Người thực hiện</Text>
                            <Text style={styles.value}>{shift.createdBy}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>Loại ca máy</Text>
                            <Text style={styles.value}>{shift.name}</Text>
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>Diện tích</Text>
                            <Text style={styles.value}>
                                {shift.totalTime} ({gardenAreaType})
                            </Text>
                        </View>
                    </View>
                ))}
            </View>
        </CollapsibleTaskBlock>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    card: {
        backgroundColor: '#EAF6FF',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        gap: 10,
    },
    taskName: {
        fontWeight: '600',
        marginBottom: 8,
        fontSize: 14,
        color: '#333',
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
});

export default MachineShiftHistorySection;
