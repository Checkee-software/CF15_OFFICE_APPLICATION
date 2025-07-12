import React from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Picker} from '@react-native-picker/picker';

type AdditionalSupply = {
    name: string;
    value: string;
};

type Props = {
    supplies: AdditionalSupply[];
    onAdd: () => void;
    onChange: (
        index: number,
        field: keyof AdditionalSupply,
        value: string,
    ) => void;
    onSubmit: () => void;
};

const AdditionalSupplySection = ({
    supplies,
    onAdd,
    onChange,
    onSubmit,
}: Props) => {
    const allValid = supplies.every(s => s.name && s.value);

    return (
        <View style={{marginTop: 16}}>
            <View style={styles.header}>
                <Text style={styles.title}>Nguồn cung thêm</Text>
                <TouchableOpacity onPress={onAdd}>
                    <Icon name='add' size={20} color='blue' />
                </TouchableOpacity>
            </View>

            {supplies.map((item, index) => (
                <View key={index} style={{marginBottom: 28}}>
                    <TextInput
                        style={styles.input}
                        placeholder='Tên vật tư'
                        placeholderTextColor={'black'}
                        value={item.name}
                        onChangeText={text => onChange(index, 'name', text)}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder='Giá trị (kg)'
                        placeholderTextColor={'black'}
                        keyboardType='numeric'
                        value={item.value}
                        onChangeText={text => {
                            const normalized = text.replace(',', '.');
                            onChange(index, 'value', normalized);
                        }}
                    />
                </View>
            ))}

            <TouchableOpacity
                style={[
                    styles.saveButton,
                    !allValid && {backgroundColor: '#ccc'},
                ]}
                disabled={!allValid}
                onPress={onSubmit}>
                <Text style={styles.saveButtonText}>Lưu</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 8,
        marginBottom: 8,
        height: 55,
        color: 'black',
    },
    dropdownContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        backgroundColor: '#fff',
    },
    saveButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 24,
        paddingVertical: 12,
        alignItems: 'center',
        marginTop: 10,
    },
    saveButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    },
});

export default AdditionalSupplySection;
