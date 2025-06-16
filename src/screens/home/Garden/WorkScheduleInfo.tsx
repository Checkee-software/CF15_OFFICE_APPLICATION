import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ISchedule } from '../../../shared-types/Response/ScheduleResponse/ScheduleResponse'; 

interface Props {
  schedule: ISchedule;
}

const WorkScheduleInfo: React.FC<Props> = ({ schedule }) => {
  const formatDate = (dateStr: string | Date) => {
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${d.getFullYear()}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thông tin công việc</Text>

      <Text style={styles.detail}>🌿 Khu vườn: {schedule.gardenName || 'Không rõ'}</Text>
      <Text style={styles.detail}>🌱 Sản phẩm: {schedule.productName || 'Không rõ'}</Text>
      <Text style={styles.detail}>📌 Tiêu đề: {schedule.title || 'Không có'}</Text>
      <Text style={styles.detail}>
        🗓️ Thời gian: {formatDate(schedule.startedDate)} - {formatDate(schedule.finishedDate)}
      </Text>
      <Text style={styles.detail}>📄 Mô tả: {schedule.description || 'Không có'}</Text>

      {!!schedule.employees?.length && (
        <>
          <Text style={styles.subHeader}>👥 Nhân sự:</Text>
          {schedule.employees.map(emp => (
            <Text key={emp._id} style={styles.detail}>• {emp.fullName} ({emp.group})</Text>
          ))}
        </>
      )}

      {!!schedule.materials?.length && (
        <>
          <Text style={styles.subHeader}>🧪 Vật tư:</Text>
          {schedule.materials.map(mat => (
            <Text key={mat._id} style={styles.detail}>
              • {mat.name}: {mat.value} {mat.specification} (Chi phí: {mat.cost.toLocaleString()}đ)
            </Text>
          ))}
        </>
      )}

      {schedule.labour && (
        <>
          <Text style={styles.subHeader}>👷 Nhân công:</Text>
          <Text style={styles.detail}>
            • {schedule.labour.name}: {schedule.labour.value} {schedule.labour.specification} (Chi phí: {schedule.labour.cost.toLocaleString()}đ)
          </Text>
        </>
      )}

      {!!schedule.childTasks?.length && (
        <>
          <Text style={styles.subHeader}>🧩 Công việc con:</Text>
          {schedule.childTasks.map(task => (
            <Text key={task._id} style={styles.detail}>
              • {task.name} - Trạng thái: {task.status}
            </Text>
          ))}
        </>
      )}
    </View>
  );
};

export default WorkScheduleInfo;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  subHeader: {
    fontWeight: '600',
    fontSize: 14,
    marginTop: 8,
  },
  detail: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
});
