import * as React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Switch,
    SafeAreaView,
    StatusBar,
} from 'react-native';

export default function Notification() {
    const [allNotifications, setAllNotifications] = React.useState(true);
    const [documents, setDocuments] = React.useState(true);
    const [tasks, setTasks] = React.useState(true);
    const [news, setNews] = React.useState(true);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle='dark-content' backgroundColor='#fff' />

            {/* Notification Settings */}
            <View style={styles.settingsContainer}>
                <View style={styles.settingItem}>
                    <Text style={styles.settingText}>Tất cả thông báo</Text>
                    <Switch
                        value={allNotifications}
                        onValueChange={setAllNotifications}
                        trackColor={{false: '#D3D3D3', true: '#2196F3'}}
                        thumbColor='#fff'
                    />
                </View>

                <View style={styles.settingItem}>
                    <Text style={styles.settingText}>Tài liệu</Text>
                    <Switch
                        value={documents}
                        onValueChange={setDocuments}
                        trackColor={{false: '#D3D3D3', true: '#2196F3'}}
                        thumbColor='#fff'
                    />
                </View>

                <View style={styles.settingItem}>
                    <Text style={styles.settingText}>Công việc</Text>
                    <Switch
                        value={tasks}
                        onValueChange={setTasks}
                        trackColor={{false: '#D3D3D3', true: '#2196F3'}}
                        thumbColor='#fff'
                    />
                </View>

                <View style={styles.settingItem}>
                    <Text style={styles.settingText}>Tin tức</Text>
                    <Switch
                        value={news}
                        onValueChange={setNews}
                        trackColor={{false: '#D3D3D3', true: '#2196F3'}}
                        thumbColor='#fff'
                    />
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },

    settingsContainer: {
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    settingText: {
        fontSize: 16,
    },
});
