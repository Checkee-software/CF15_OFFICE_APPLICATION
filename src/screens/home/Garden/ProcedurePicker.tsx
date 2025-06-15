import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Picker} from '@react-native-picker/picker';

const ProcedurePicker = ({
    selectedValue,
    onValueChange,
}: {
    selectedValue: string;
    onValueChange: (value: string) => void;
}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>Loại quy trình</Text>
            <View style={styles.pickerWrapper}>
                <Picker
                    selectedValue={selectedValue}
                    onValueChange={onValueChange}
                    style={styles.picker}>
                    <Picker.Item label="Chọn" value="" />
                    <Picker.Item label="Bón phân Kali" value="kali" />
                    <Picker.Item label="Bón phân NPK" value="npk" />
                    <Picker.Item label="Làm cỏ" value="lamco" />
                </Picker>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 12,
    },
    label: {
        fontWeight: '500',
        marginBottom: 4,
        fontSize: 14
    },
    pickerWrapper: {
        backgroundColor: '#e6f3ff',
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 8,
    },
    picker: {
        height: 51,
        width: '100%',
    },
});

export default ProcedurePicker;
