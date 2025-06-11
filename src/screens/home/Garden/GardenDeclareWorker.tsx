import React, {useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SCREEN_INFO from '../../../config/SCREEN_CONFIG/screenInfo';
import {useNavigation} from '@react-navigation/native';
import ActionButtons from './ActionButtons';
import HarvestSection from './HarvestSection';
import {useAuthStore} from '../../../stores/authStore';
import useGardenStore from '../../../stores/gardenStore';
import {useRoute} from '@react-navigation/native';
import MachineShiftSelector from './MachineShiftSelector';
import CollapsibleTaskBlock from './CollapsibleTaskBlock';

const itemOption = [
    {label: 'Phân khô', value: '1'},
    {label: 'Phân hữu cơ', value: '2'},
    {label: 'Thuốc trừ sâu', value: '3'},
    {label: 'Thuốc diệt cỏ', value: '4'},
    {label: 'Nước khoáng', value: '5'},
    {label: 'Nước máy', value: '6'},
];

const typeOption = [
    {label: 'm3', value: 'm3'},
    {label: 'lít', value: 'lít'},
    {label: 'thùng', value: 'thùng'},
];

const valueOptions = [
    {label: '0.5', value: '0.5'},
    {label: '1.0', value: '1.0'},
    {label: '1.5', value: '1.5'},
    {label: '2.0', value: '2.0'},
];

const GardenDeclare = () => {
    const {userInfo} = useAuthStore();
    const {gardens, searchGardens, isLoading, postHarvestReport} =
        useGardenStore();
    const route = useRoute<any>();
    const navigation = useNavigation();
    const [fertilizerList, setFertilizerList] = React.useState<any[]>([]);
    const [sprayList, setSprayList] = React.useState<any[]>([]);
    const [wateringList, setWateringList] = React.useState<any[]>([]);
    const [harvestList, setHarvestList] = React.useState<any[]>([]);
    const [selectedTask, setSelectedTask] = React.useState<{
        type: 'fertilizer' | 'spray' | 'watering' | 'harvest' | null;
        index: number | null;
    }>({type: null, index: null});
    const [showExitAlert, setShowExitAlert] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isHarvestDeclared, setIsHarvestDeclared] = useState(false);
    const [onlyShowReportButton, setOnlyShowReportButton] = useState(false);

    const [showReportConfirmation, setShowReportConfirmation] = useState(false);

    const hasDeclarations =
        selectedTask.type !== null || showExitAlert || showReportConfirmation;

    const handleAddFertilizer = (data: any) => {
        const newList = [...fertilizerList, data];
        setFertilizerList(newList);
        setSelectedTask({type: 'fertilizer', index: newList.length - 1});
        setIsSaved(false);
        setOnlyShowReportButton(false);
    };

    const handleAddSpray = (data: any) => {
        const newList = [...sprayList, data];
        setSprayList(newList);
        setSelectedTask({type: 'spray', index: newList.length - 1});
        setIsSaved(false);
        setOnlyShowReportButton(false);
    };

    const handleAddWatering = (data: any) => {
        const newList = [...wateringList, data];
        setWateringList(newList);
        setSelectedTask({type: 'watering', index: newList.length - 1});
        setIsSaved(false);
        setOnlyShowReportButton(false);
    };

    const handleAddHarvest = (data: any) => {
        const newList = [...harvestList, data];
        setHarvestList(newList);
        setSelectedTask({type: 'harvest', index: newList.length - 1});
        setIsSaved(false);
        setOnlyShowReportButton(true);
    };

    const handleRemoveHarvest = (index: number) => {
        setHarvestList(prev => prev.filter((_, i) => i !== index));

        if (harvestList.length <= 1) {
            setSelectedTask({type: null, index: null});
        }
    };

    const handleRemoveFertilizer = (index: number) => {
        setFertilizerList(prev => prev.filter((_, i) => i !== index));
        if (fertilizerList.length <= 1) {
            setSelectedTask({type: null, index: null});
        }
    };

    const handleRemoveSpray = (index: number) => {
        setSprayList(prev => prev.filter((_, i) => i !== index));
        if (sprayList.length <= 1) {
            setSelectedTask({type: null, index: null});
        }
    };

    const handleRemoveWatering = (index: number) => {
        setWateringList(prev => prev.filter((_, i) => i !== index));
        if (wateringList.length <= 1) {
            setSelectedTask({type: null, index: null});
        }
    };

    const handleSaveTemp = () => {
        setIsSaved(true);

        setTimeout(() => {
            setIsSaved(false);
        }, 5000);
    };

    const handleReport = () => {
        setShowReportConfirmation(true);
    };

    const handleConfirmReport = async () => {
        if (gardens?._id && harvestList.length > 0) {
            const amount = Number(harvestList[0].value || 0);
            console.log('GỬI POST HARVEST REPORT VỚI:', {
                _id: gardens._id,
                amount,
            });

            await postHarvestReport(gardens._id, amount);
            setHarvestList([]);
        } else {
            console.log('Thiếu gardens._id hoặc harvestList rỗng');
        }

        setShowReportConfirmation(false);
        setSelectedTask({type: null, index: null});
        setIsSaved(true);
        setTimeout(() => {
            setIsSaved(false);
        }, 5000);
    };

    const handleCancelReport = () => {
        setShowReportConfirmation(false);
    };

    const handleExit = () => {
        if (selectedTask.type !== null) {
            setShowExitAlert(true);
        } else {
            navigation.goBack();
        }
    };

    const handleCloseAlert = () => {
        setShowExitAlert(false);
    };

    return (
        <View style={{flex: 1}}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.infoContainer}>
                    <Text style={styles.gardenName}>{gardens?.name}</Text>
                    <Text style={styles.gardenCode}>{gardens?.code}</Text>
                    <View style={styles.productBox}>
                        <Text style={styles.productLabel}>
                            Sản phẩm/cây trồng
                        </Text>
                        <View style={styles.productRow}>
                            <Icon name='add-circle' color='green' size={20} />
                            <Text style={styles.productText}>
                                {gardens?.productName}
                            </Text>
                        </View>
                    </View>
                </View>
                {gardens?.isHarvest ? (
                    <HarvestSection
                        harvestList={harvestList}
                        onAddHarvest={handleAddHarvest}
                        onRemoveHarvest={handleRemoveHarvest}
                        setIsHarvestDeclared={setIsHarvestDeclared}
                        setOnlyShowReportButton={setOnlyShowReportButton}
                        gardenId={gardens?._id}
                    />
                ) : (
                    <>
                        <MachineShiftSelector
                            onStart={machineType => {
                                console.log('Ca máy được chọn:', machineType);
                            }}
                        />
                        <View style={styles.headerRow}>
                            <Text style={styles.taskHeader}>Công việc</Text>
                            <TouchableOpacity
                                onPress={() =>
                                    navigation.navigate(
                                        SCREEN_INFO.GARDENHISTORY1.key as never,
                                    )
                                }>
                                <Text style={styles.linkText}>
                                    Lịch sử khai báo
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <CollapsibleTaskBlock
                            title='Canh tác khu vườn'
                            dataList={fertilizerList}
                            onDeclare={handleAddFertilizer}
                            onRemove={handleRemoveFertilizer}
                            isDropdown={false}
                        />

                        <CollapsibleTaskBlock
                            title='Cải tạo đất khu vườn'
                            itemOptions={itemOption}
                            typeOptions={typeOption}
                            valueOptions={valueOptions}
                            dataList={sprayList}
                            onDeclare={handleAddSpray}
                            onRemove={handleRemoveSpray}
                        />

                        <CollapsibleTaskBlock
                            title='Bón phân cho khu vườn'
                            itemOptions={itemOption}
                            typeOptions={typeOption}
                            valueOptions={valueOptions}
                            dataList={wateringList}
                            onDeclare={handleAddWatering}
                            onRemove={handleRemoveWatering}
                        />
                    </>
                )}
            </ScrollView>
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.exitButton1}
                    onPress={handleExit}>
                    <Text style={styles.exitText1}>Thoát ra</Text>
                </TouchableOpacity>
            </View>

            <ActionButtons
                visible={hasDeclarations}
                showAlert={showExitAlert}
                isSaved={isSaved}
                showReportConfirmation={showReportConfirmation}
                onSaveTemp={handleSaveTemp}
                onReport={handleReport}
                onExit={handleExit}
                onCloseAlert={handleCloseAlert}
                onConfirmReport={handleConfirmReport}
                onCancelReport={handleCancelReport}
                onlyShowReportButton={onlyShowReportButton}
            />
        </View>
    );
};

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
    productLabel: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 4,
    },
    productRow: {
        flexDirection: 'row',
        alignItems: 'center',
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
        color: '#2196F3',
        textDecorationLine: 'underline',
    },

    exitButton1: {
        backgroundColor: 'red',
        padding: 12,
        alignItems: 'center',
        borderRadius: 24,
        marginTop: 16,
    },
    exitText1: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },

    requiredMark: {
        color: 'red',
    },
    footer: {
        padding: 12,
        backgroundColor: '#fff',
        borderColor: '#ccc',
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
});

export default GardenDeclare;
