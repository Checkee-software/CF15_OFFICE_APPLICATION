import React, {useState} from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Svg, {Circle} from 'react-native-svg';

type TaskCardProps = {
    status: string;
    progress: number;
    title: string;
    members: number;
    tasks: string;
    time: string;
    statusColor: string;
};

const TaskCard: React.FC<TaskCardProps> = ({
    status,
    progress,
    title,
    members,
    tasks,
    time,
    statusColor,
}) => (
    <View style={styles.card}>
        <View style={styles.row}>
            <View style={{width: 50, height: 50, marginRight: 10}}>
                <Svg width={50} height={50}>
                    <Circle
                        cx={25}
                        cy={25}
                        r={20}
                        stroke='#e6e6e6'
                        strokeWidth={4}
                        fill='none'
                    />
                    <Circle
                        cx={25}
                        cy={25}
                        r={20}
                        stroke={statusColor}
                        strokeWidth={4}
                        strokeDasharray={2 * Math.PI * 20}
                        strokeDashoffset={
                            2 * Math.PI * 20 * (1 - progress / 100)
                        }
                        strokeLinecap='round'
                        fill='none'
                        rotation='-90'
                        origin='25,25'
                    />
                </Svg>
                <View
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <Text
                        style={{
                            color: statusColor,
                            fontWeight: 'bold',
                            fontSize: 12,
                        }}>
                        {progress}%
                    </Text>
                </View>
            </View>

            <View style={styles.content}>
                <Text style={[styles.status, {color: statusColor}]}>
                    {status}
                </Text>
                <Text style={styles.title} numberOfLines={2}>
                    {title}
                </Text>

                <View style={styles.topInfoRow}>
                    <Icon name='format-list-checks' size={16} />
                    <Text> {tasks}</Text>
                    <Icon name='account-supervisor' size={16} />
                    <Text>{members}</Text>
                </View>

                <View style={styles.bottomRight}>
                    <Icon
                        name='clock-time-four-outline'
                        size={16}
                        style={[{color: statusColor}]}
                    />
                    <Text style={[styles.timeText, {color: statusColor}]}>
                        {time}
                    </Text>
                </View>
            </View>
        </View>
    </View>
);

const tabs = ['Tất cả', 'Đang làm', 'Hoàn thành'];

const tasks = [
    {
        id: 1,
        status: 'Trễ hạn',
        progress: 75,
        title: 'Lorem ipsum dolor sit amet consectetur...',
        members: 8,
        tasks: '3/5',
        time: 'Hơn 8 giờ 54 phút',
        statusColor: 'red',
        type: 'late',
    },
    {
        id: 2,
        status: 'Đang thực hiện',
        progress: 75,
        title: 'Lorem ipsum dolor sit amet consectetur...',
        members: 11,
        tasks: '3/5',
        time: 'Còn lại 11 ngày 8 giờ 54 phút',
        statusColor: 'blue',
        type: 'doing',
    },
    {
        id: 3,
        status: 'Sắp hết hạn',
        progress: 50,
        title: 'Lorem ipsum dolor sit amet consectetur...',
        members: 5,
        tasks: '4/5',
        time: 'Còn 1 ngày 8 giờ 34 phút',
        statusColor: 'orange',
        type: 'doing',
    },
    {
        id: 4,
        status: 'Hoàn thành',
        progress: 100,
        title: 'Lorem ipsum dolor sit amet consectetur...',
        members: 3,
        tasks: '5/5',
        time: 'Hoàn thành lúc 12:43 10.03.2025',
        statusColor: 'green',
        type: 'done',
    },
    {
        id: 5,
        status: 'Hoàn thành',
        progress: 100,
        title: 'Lorem ipsum dolor sit amet consectetur...',
        members: 3,
        tasks: '5/5',
        time: 'Hoàn thành lúc 12:43 10.03.2025',
        statusColor: 'green',
        type: 'done',
    },
];

const WorkScreen = () => {
    const [activeTab, setActiveTab] = useState('Tất cả');

    const filteredTasks = tasks.filter(task => {
        if (activeTab === 'Tất cả') return true;
        if (activeTab === 'Đang làm') return task.type === 'doing';
        if (activeTab === 'Hoàn thành') return task.type === 'done';
    });

    return (
        <View style={styles.container}>
            {/* Tabs */}
            <View style={styles.tabsContainer}>
                {tabs.map(tab => (
                    <TouchableOpacity
                        key={tab}
                        style={[
                            styles.tabItem,
                            activeTab === tab && styles.activeTab,
                        ]}
                        onPress={() => setActiveTab(tab)}>
                        <Text
                            style={[
                                styles.tabText,
                                activeTab === tab && styles.activeTabText,
                            ]}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Task list */}
            <ScrollView contentContainerStyle={{padding: 10}}>
                {filteredTasks.map(task => (
                    <TaskCard key={task.id} {...task} />
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    tabsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 12,
    },
    tabItem: {
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    tabText: {
        fontSize: 14,
        color: 'black',
        fontWeight: '500',
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: '#3cb371',
    },
    activeTabText: {
        color: '#3cb371',
        fontWeight: 'bold',
    },
    body: {
        alignItems: 'center',
        gap: 10,
    },
    card: {
        borderRadius: 10,
        backgroundColor: '#F9F9F9',
        padding: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: {width: 0, height: 2},
        elevation: 3,
        width: 372,
        height: 130,
    },
    row: {
        flexDirection: 'row',
    },
    progressCircle: {
        borderWidth: 3,
        borderRadius: 25,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    content: {
        flex: 1,
    },
    status: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    title: {
        fontSize: 13,
        marginVertical: 5,
        color: '#333',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        flexWrap: 'wrap',
    },

    topInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginTop: 4,
    },

    bottomRight: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 8,
    },

    timeText: {
        fontSize: 12,
        marginLeft: 4,
    },
});
export default WorkScreen;
