import React from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';

const TaskBlock = ({
    title,
    options,
    valueOptions,
    onDeclare,
    isDropdown = true,
}: {
    title: string;
    options?: {label: string; value: string}[];
    valueOptions?: {label: string; value: string}[];
    onDeclare: (data: any) => void;
    isDropdown?: boolean;
}) => {
    const [type, setType] = React.useState<string | null>(null);
    const [value, setValue] = React.useState<string | null>('');

    const handleDeclare = () => {
        if (value) {
            const data = isDropdown
                ? {type, value, time: new Date()}
                : {value, time: new Date()};
            onDeclare(data);
            setType(null);
            setValue(null);
        }
    };

    return (
        <View
            style={[
                styles.taskBlock,
                isDropdown ? styles.taskBlockDropdown : styles.taskBlockInput,
            ]}>
            <Text style={styles.taskTitle}>{title}</Text>

            {isDropdown ? (
                <>
                    <Text style={styles.label}>
                        Loại định mức <Text style={styles.requiredMark}>*</Text>
                    </Text>
                    <Dropdown
                        style={styles.dropdown}
                        data={options || []}
                        labelField='label'
                        valueField='value'
                        placeholder='Chọn'
                        value={type}
                        onChange={item => setType(item.value)}
                    />
                    <Text style={styles.label}>
                        Giá trị định mức{' '}
                        <Text style={styles.requiredMark}>*</Text>
                    </Text>
                    <Dropdown
                        style={styles.dropdown}
                        data={valueOptions || []}
                        labelField='label'
                        valueField='value'
                        placeholder='Chọn'
                        value={value}
                        onChange={item => setValue(item.value)}
                    />
                </>
            ) : (
                <>
                    <TextInput
                        style={styles.input}
                        value={value}
                        onChangeText={setValue}
                        placeholder='Nhập khối lượng'
                    />
                </>
            )}

            <TouchableOpacity
                style={[
                    styles.declareButton,
                    isDropdown
                        ? styles.declareButtonDropdown
                        : styles.declareButtonInput,
                ]}
                onPress={handleDeclare}>
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
        marginBottom: 12,
        fontSize: 14,
        alignContent: 'center',
    },
    taskBlock: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    taskBlockDropdown: {
        backgroundColor: '#4CAF5026',
    },
    taskBlockInput: {
        backgroundColor: '#E6F0FF',
    },
    taskTitle: {
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 8,
    },
    label: {
        fontSize: 13,
        marginTop: 6,
        marginBottom: 4,
    },
    dropdown: {
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'gray',
        paddingHorizontal: 12,
        height: 40,
    },
    declareButton: {
        padding: 10,
        alignItems: 'center',
        borderRadius: 6,
        marginTop: 12,
    },
    declareButtonDropdown: {
        backgroundColor: '#4CAF50', 
    },
    declareButtonInput: {
        backgroundColor: '#2196F3', 
    },
    declareText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    requiredMark: {
        color: 'red',
    },
});

export default TaskBlock;
