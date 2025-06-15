import React from 'react';
import {View, Text, StyleSheet, TextInput} from 'react-native';

interface TaskInputProps {
    label: string;
    placeholder?: string;
    value: string;
    onChangeText: (text: string) => void;
    required?: boolean;
    unit?: string;
}

const TaskInput = ({label, placeholder, value, onChangeText, required, unit}: TaskInputProps) => {
    return (
        <View>
            <Text style={styles.label}>
                {label} {required && <Text style={{color: 'red'}}>*</Text>}
                {unit ? ` (${unit})` : ''}
            </Text>
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                keyboardType="numeric"
                value={value}
                onChangeText={onChangeText}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    label: {
        marginBottom: 4,
        fontWeight: '500',
        fontSize: 14
    },
    input: {
        backgroundColor: '#e6f3ff',
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'gray',
        height: 51,
    },
});

export default TaskInput;
