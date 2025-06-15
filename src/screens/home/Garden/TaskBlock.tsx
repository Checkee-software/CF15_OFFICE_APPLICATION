import React from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';

const TaskBlock = ({
    title,
    onDeclare,
    showWarning = false,
}: {
    title: string;
    onDeclare: (data: any) => void;
    showWarning?: boolean;
}) => {
    const [value, setValue] = React.useState<string | null>('');

    const handleDeclare = () => {
        if (value) {
            const numericValue = parseFloat(value);
            const data = {value: numericValue, time: new Date()};
            onDeclare(data);
            setValue(null);
        }
    };

    const isButtonDisabled = showWarning || !value;

    return (
        <View style={[styles.taskBlock, styles.taskBlockInput]}>
            <Text style={styles.taskTitle}>{title}</Text>

            <TextInput
                style={styles.input}
                value={value ?? ''}
                onChangeText={text => {
                    const numericText = text.replace(/[^0-9.]/g, '');
                    setValue(numericText);
                }}
                placeholder='Nhập khối lượng'
                keyboardType='numeric'
            />

            {showWarning && (
                <Text style={styles.warningText}>
                    Vui lòng thực hiện "báo cáo" khối lượng thu hoạch hiện tại
                    để tiếp tục khai báo thu hoạch{'\n'}
                    (Khai báo thu hoạch chỉ có thể khai báo 1 lần/lúc)
                </Text>
            )}

            <TouchableOpacity
                style={[
                    styles.declareButton,
                    styles.declareButtonInput,
                    isButtonDisabled && styles.declareButtonDisabled,
                ]}
                onPress={handleDeclare}
                disabled={isButtonDisabled}>
                <Text style={styles.declareText}>Khai báo</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    input: {
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'gray',
        paddingHorizontal: 12,
        height: 40,
        marginBottom: 7,
        fontSize: 14,
        textAlign: 'center',
        textAlignVertical: 'center',
    },
    taskBlock: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    taskBlockInput: {
        backgroundColor: '#E6F0FF',
    },
    taskTitle: {
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 8,
    },
    declareButton: {
        padding: 10,
        alignItems: 'center',
        borderRadius: 6,
        marginTop: 12,
    },
    declareButtonInput: {
        backgroundColor: '#2196F3',
    },
    declareButtonDisabled: {
        backgroundColor: 'gray',
    },
    declareText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    warningText: {
        color: 'gray',
        marginTop: 8,
        fontSize: 14,
        textAlign: 'center',
    },
});

export default TaskBlock;
