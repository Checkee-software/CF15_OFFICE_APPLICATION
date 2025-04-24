import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Dropdown} from 'react-native-element-dropdown';

const fertilizerOptions = [
    {label: 'Phân khô', value: '1'},
    {label: 'Phân hữu cơ', value: '2'},
];
const harvestOptions = [
    {label: 'Cà phê quả tươi', value: '1'},
    {label: 'Cà phê nhân', value: '2'},
];

const sprayOptions = [
    {label: 'Thuốc trừ sâu', value: '1'},
    {label: 'Thuốc diệt cỏ', value: '2'},
];

const wateringOptions = [
    {label: 'Nước khoáng', value: '1'},
    {label: 'Nước máy', value: '2'},
];

const valueOptions = [
    {label: '0.5', value: '0.5'},
    {label: '1.0', value: '1.0'},
    {label: '1.5', value: '1.5'},
    {label: '2.0', value: '2.0'},
];

const TaskBlock = ({
    title,
    options,
    onDeclare,
}: {
    title: string;
    options: {label: string; value: string}[];
    onDeclare: (data: any) => void;
}) => {
    const [type, setType] = React.useState(null);
    const [value, setValue] = React.useState(null);

    const handleDeclare = () => {
        if (type && value) {
            onDeclare({
                type,
                value,
                time: new Date(),
            });
            setType(null);
            setValue(null);
        }
    };

    return (
        <View style={styles.taskBlock}>
            <Text style={styles.taskTitle}>{title}</Text>
            <Text style={styles.label}>
                Loại định mức <Text style={styles.requiredMark}>*</Text>
            </Text>

            <Dropdown
                style={styles.dropdown}
                data={options}
                labelField='label'
                valueField='value'
                placeholder='Chọn'
                value={type}
                onChange={item => setType(item.value)}
            />
            <Text style={styles.label}>
                Giá trị định mức <Text style={styles.requiredMark}>*</Text>
            </Text>

            <Dropdown
                style={styles.dropdown}
                data={valueOptions}
                labelField='label'
                valueField='value'
                placeholder='Chọn'
                value={value}
                onChange={item => setValue(item.value)}
            />

            <TouchableOpacity
                style={styles.declareButton}
                onPress={handleDeclare}>
                <Text style={styles.declareText}>Khai báo</Text>
            </TouchableOpacity>
        </View>
    );
};

const TaskSummary = ({
    title,
    data,
    index,
    onRemove,
    optionMap,
}: {
    title: string;
    data: any;
    index: number;
    onRemove: (index: number) => void;
    optionMap: {[key: string]: string};
}) => {
    const formatTime = (date: Date) => {
        const d = new Date(date);
        const h = d.getHours().toString().padStart(2, '0');
        const m = d.getMinutes().toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        return `${h}:${m} ${day}/${month}/${year}`;
    };

    return (
        <View style={[styles.taskBlock, styles.summaryBox]}>
            <View style={styles.summaryHeader}>
                <Text style={styles.taskTitle}>{title}</Text>
                <TouchableOpacity onPress={() => onRemove(index)}>
                    <Icon name='delete' size={20} color='gray' />
                </TouchableOpacity>
            </View>
            <View style={styles.summaryRow}>
                <Text style={styles.label}>Thực hiện lúc</Text>
                <Text style={styles.value}>{formatTime(data.time)}</Text>
            </View>
            <View style={styles.summaryRow}>
                <Text style={styles.label}>Loại định mức</Text>
                <Text style={styles.value}>{optionMap[data.type]}</Text>
            </View>
            <View style={styles.summaryRow}>
                <Text style={styles.label}>Định mức</Text>
                <Text style={styles.value}>{data.value}</Text>
            </View>
        </View>
    );
};

const GardenDeclare = () => {
    const [fertilizerList, setFertilizerList] = React.useState<any[]>([]);
    const [sprayList, setSprayList] = React.useState<any[]>([]);
    const [wateringList, setWateringList] = React.useState<any[]>([]);
    const [harvestList, setHarvestList] = React.useState<any[]>([]);

    const handleAddFertilizer = (data: any) =>
        setFertilizerList(prev => [...prev, data]);
    const handleAddSpray = (data: any) => setSprayList(prev => [...prev, data]);
    const handleAddWatering = (data: any) =>
        setWateringList(prev => [...prev, data]);
    const handleAddHarvest = (data: any) =>
        setHarvestList(prev => [...prev, data]);
    const handleRemoveHarvest = (index: number) =>
        setHarvestList(prev => prev.filter((_, i) => i !== index));

    const handleRemoveFertilizer = (index: number) =>
        setFertilizerList(prev => prev.filter((_, i) => i !== index));
    const handleRemoveSpray = (index: number) =>
        setSprayList(prev => prev.filter((_, i) => i !== index));
    const handleRemoveWatering = (index: number) =>
        setWateringList(prev => prev.filter((_, i) => i !== index));

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.infoContainer}>
                <Text style={styles.gardenName}>Khu vườn CF-A4</Text>
                <Text style={styles.gardenCode}>009831234578232</Text>
                <View style={styles.productBox}>
                    <Text style={styles.productLabel}>Sản phẩm/cây trồng</Text>
                    <View style={styles.productRow}>
                        <Icon name='add-circle' color='green' size={20} />
                        <Text style={styles.productText}> Cà phê Arabica</Text>
                    </View>
                </View>
            </View>

            <View style={styles.headerRow}>
                <Text style={styles.taskHeader}>Công việc (3)</Text>
                <Text style={styles.linkText}>Lịch sử khai báo</Text>
            </View>

            {/* Bón phân */}
            <TaskBlock
                title='Bón phân'
                options={fertilizerOptions}
                onDeclare={handleAddFertilizer}
            />
            {fertilizerList.map((item, index) => (
                <TaskSummary
                    key={index}
                    title='Bón phân'
                    data={item}
                    index={index}
                    onRemove={handleRemoveFertilizer}
                    optionMap={Object.fromEntries(
                        fertilizerOptions.map(o => [o.value, o.label]),
                    )}
                />
            ))}

            {/* Phun thuốc */}
            <TaskBlock
                title='Phun thuốc'
                options={sprayOptions}
                onDeclare={handleAddSpray}
            />
            {sprayList.map((item, index) => (
                <TaskSummary
                    key={index}
                    title='Phun thuốc'
                    data={item}
                    index={index}
                    onRemove={handleRemoveSpray}
                    optionMap={Object.fromEntries(
                        sprayOptions.map(o => [o.value, o.label]),
                    )}
                />
            ))}

            {/* Tưới tiêu */}
            <TaskBlock
                title='Tưới tiêu'
                options={wateringOptions}
                onDeclare={handleAddWatering}
            />
            {wateringList.map((item, index) => (
                <TaskSummary
                    key={index}
                    title='Tưới tiêu'
                    data={item}
                    index={index}
                    onRemove={handleRemoveWatering}
                    optionMap={Object.fromEntries(
                        wateringOptions.map(o => [o.value, o.label]),
                    )}
                />
            ))}

            <View style={styles.headerRow}>
                <Text style={styles.taskHeader}>Thu hoạch</Text>
                <Text style={styles.linkText}>Lịch sử thu hoạch</Text>
            </View>

            <TaskBlock options={harvestOptions} onDeclare={handleAddHarvest} />
            {harvestList.map((item, index) => (
                <TaskSummary
                    key={index}
                    title='Thu hoạch'
                    data={item}
                    index={index}
                    onRemove={handleRemoveHarvest}
                    optionMap={Object.fromEntries(
                        harvestOptions.map(o => [o.value, o.label]),
                    )}
                />
            ))}

            <TouchableOpacity style={styles.exitButton}>
                <Text style={styles.exitText}>+ Thoát ra</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

export default GardenDeclare;

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#fff',
    },
    infoContainer: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    gardenName: {
        fontSize: 16,
        fontWeight: '600',
    },
    gardenCode: {
        color: 'green',
        fontWeight: '500',
        marginTop: 2,
    },
    productBox: {
        marginTop: 12,
        backgroundColor: '#4CAF5026',
        padding: 10,
        borderRadius: 6,
    },
    productText: {
        fontSize: 14,
        color: '#333',
        marginLeft: 4,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    taskHeader: {
        fontSize: 14,
        fontWeight: '500',
    },
    linkText: {
        color: 'blue',
        textDecorationLine: 'underline',
    },
    taskBlock: {
        backgroundColor: '#4CAF5026',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
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
        backgroundColor: '#4CAF50',
        padding: 10,
        alignItems: 'center',
        borderRadius: 6,
        marginTop: 12,
    },
    declareText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    exitButton: {
        backgroundColor: 'red',
        padding: 12,
        alignItems: 'center',
        borderRadius: 24,
        marginTop: 16,
    },
    exitText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 2,
    },
    value: {
        fontSize: 14,
        fontWeight: '400',
    },
    summaryBox: {
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#4CAF50',
        backgroundColor: '#f9f9f9',
    },
    productLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
    },
    productRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    requiredMark: {
        color: 'red',
    },
});
