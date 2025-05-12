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
    itemOptions,
    typeOptions,
    valueOptions,
    onDeclare,
    isDropdown = true,
    showWarning = false,
}: {
    title: string;
    itemOptions?: {label: string; value: string}[];
    typeOptions?: {label: string; value: string}[];
    valueOptions?: {label: string; value: string}[];
    onDeclare: (data: any) => void;
    isDropdown?: boolean;
    showWarning?: boolean;
}) => {
    const [type, setType] = React.useState<string | null>(null);
    const [item, setItem] = React.useState<string | null>(null);
    const [value, setValue] = React.useState<string | null>('');

    const handleDeclare = () => {
        if (value) {
            const numericValue = parseFloat(value); // chuyển sang số
            const data = isDropdown
                ? {item, type, value: numericValue, time: new Date()}
                : {value: numericValue, time: new Date()};
            onDeclare(data);
            setType(null);
            setValue(null);
            setItem(null);
        }
    };

    const isButtonDisabled = isDropdown ? !item || !type || !value : !value;

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
                        Loại vật tư <Text style={styles.requiredMark}>*</Text>
                    </Text>
                    <Dropdown
                        style={styles.dropdown}
                        data={itemOptions || []}
                        labelField='label'
                        valueField='value'
                        placeholder='Chọn'
                        value={item}
                        onChange={item => setItem(item.value)}
                    />
                    <Text style={styles.label}>
                        Loại định mức <Text style={styles.requiredMark}>*</Text>
                    </Text>
                    <Dropdown
                        style={styles.dropdown}
                        data={typeOptions || []}
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
            )}

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
                    isDropdown
                        ? styles.declareButtonDropdown
                        : styles.declareButtonInput,
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
    declareButtonDisabled: {
        backgroundColor: 'gray',
    },
    declareText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    requiredMark: {
        color: 'red',
    },
    warningText: {
        color: 'gray',
        marginTop: 8,
        fontSize: 14,
        textAlign: 'center',
    },
});

export default TaskBlock;
