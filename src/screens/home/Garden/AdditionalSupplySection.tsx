import React from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Dropdown} from 'react-native-element-dropdown';

type AdditionalSupply = {
    name: string;
    unit: string;
    value: number;
    price: number;
};

type Props = {
    gardenId: string;
    supplies: any;
    onAdd: () => void;
    onChange: (
        index: number,
        field: keyof AdditionalSupply,
        value: string,
    ) => void;
    onSubmit: () => void;
};

const unitOptions = [
    {label: 'kg', value: 'kg'},
    {label: 'g', value: 'g'},
    {label: 'lít', value: 'lít'},
    {label: 'ml', value: 'ml'},
    {label: 'tấn', value: 'tấn'},
    {label: 'tạ', value: 'tạ'},
    {label: 'yến', value: 'yến'},
];
const formatMoney = (value: string | undefined | null) => {
    const numeric = (value || '').replace(/\D/g, '');
    return numeric.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

const AdditionalSupplySection = ({
    gardenId,
    supplies,
    onAdd,
    onChange,
    onSubmit,
}: Props) => {
    const allValid = supplies.every(
        (s: any) => s.name && s.unit && s.value && s.price,
    );

    return (
        gardenId !== '' && (
            <View style={{marginTop: 16}}>
                <View style={styles.header}>
                    <Text style={styles.title}>Đầu tư tăng thêm</Text>
                    <TouchableOpacity onPress={onAdd}>
                        <Icon name='add' size={20} color='blue' />
                    </TouchableOpacity>
                </View>

                {supplies.map((item: any, index: number) => (
                    <View key={index} style={{marginBottom: 28}}>
                        <TextInput
                            style={styles.input}
                            placeholder='Tên vật tư'
                            placeholderTextColor={'gray'}
                            value={item.name}
                            onChangeText={text => onChange(index, 'name', text)}
                        />

                        <Dropdown
                            mode='modal'
                            style={styles.dropdown}
                            data={unitOptions}
                            labelField='label'
                            valueField='value'
                            placeholder='Đơn vị tính'
                            placeholderStyle={{color: 'gray'}}
                            search
                            searchPlaceholder='Tìm kiếm'
                            value={item.unit}
                            onChange={value =>
                                onChange(index, 'unit', value.value)
                            }
                        />

                        <TextInput
                            style={styles.input}
                            placeholder='Khối lượng'
                            placeholderTextColor={'gray'}
                            keyboardType='numeric'
                            value={item.value?.toString() ?? ''}
                            onChangeText={text => {
                                const normalizedText = text.replace(',', '.');
                                const dotCount = (
                                    normalizedText.match(/\./g) || []
                                ).length;
                                if (dotCount > 1) return;

                                onChange(index, 'value', normalizedText);
                            }}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder='Thành tiền (VNĐ)'
                            placeholderTextColor='gray'
                            keyboardType='numeric'
                            value={formatMoney(item.price?.toString())}
                            onChangeText={text => {
                                const raw = text.replace(/\s/g, '');
                                onChange(index, 'price', raw);
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
        )
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
    dropdown: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        paddingHorizontal: 8,
        marginBottom: 8,
        height: 55,
        justifyContent: 'center',
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
