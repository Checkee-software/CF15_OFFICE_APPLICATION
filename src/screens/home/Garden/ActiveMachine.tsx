import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';

interface MachineShift {
  operator: string;
  isCurrentUser: boolean;
  type: string;
  duration: string;
}

const ActiveMachine = () => {
  const route = useRoute();
  const params = route.params as { activeShifts?: MachineShift[] } | undefined;
  const activeShifts: MachineShift[] = params?.activeShifts ?? [];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {activeShifts.map((shift, index) => (
          <View key={index} style={styles.shiftCard}>
            <Text style={styles.shiftTitle}>Ca máy {index + 1}</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Người thực hiện</Text>
              <Text style={[styles.value, shift.isCurrentUser && styles.highlight]}>
                {shift.isCurrentUser ? 'Bạn' : shift.operator}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Loại ca máy</Text>
              <Text style={styles.value}>{shift.type}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Thời gian</Text>
              <Text style={styles.value}>{shift.duration}</Text>
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
    backgroundColor: 'white'
  },
  scrollContainer: {
    gap: 12,
  },
  shiftCard: {
    backgroundColor: '#EAF6FF',
    borderRadius: 8,
    padding: 12,
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
  highlight: {
    color: '#007BFF',
    fontWeight: 'bold',
  },
});

export default ActiveMachine;
