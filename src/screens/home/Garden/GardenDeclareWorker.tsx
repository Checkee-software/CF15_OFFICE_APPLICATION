import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SCREEN_INFO from '../../../config/SCREEN_CONFIG/screenInfo';
import {useNavigation, useRoute} from '@react-navigation/native';
import ActionButtons from './ActionButtons';
import HarvestSection from './HarvestSection';
import {useAuthStore} from '../../../stores/authStore';
import useGardenStore from '../../../stores/gardenStore';
import MachineShiftSelector from './MachineShiftSelector';
import CollapsibleTaskBlock from './CollapsibleTaskBlock';
import TaskInput from './TaskInput';
import ProcedurePicker from './ProcedurePicker';

const GardenDeclare = () => {
    const {userInfo} = useAuthStore();
    const {gardens, postHarvestReport, searchGardens} = useGardenStore();
    const route = useRoute<any>();
    const code = route.params?.code;
    const navigation = useNavigation();
    const [cultivationKali, setCultivationKali] = useState('');
    const [improvementArea, setImprovementArea] = useState('');
    const [procedureType, setProcedureType] = useState('');
    const [kaliAmount, setKaliAmount] = useState('');
    const [areaDone, setAreaDone] = useState('');

    const [harvestList, setHarvestList] = useState<any[]>([]);
    const [selectedTask, setSelectedTask] = useState<{
        type: 'harvest' | null;
        index: number | null;
    }>({type: null, index: null});
    const [showExitAlert, setShowExitAlert] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isHarvestDeclared, setIsHarvestDeclared] = useState(false);
    const [onlyShowReportButton, setOnlyShowReportButton] = useState(false);
    const [showReportConfirmation, setShowReportConfirmation] = useState(false);

    const hasDeclarations =
        selectedTask.type !== null ||
        showExitAlert ||
        showReportConfirmation ||
        procedureType.trim() !== '' ||
        kaliAmount.trim() !== '' ||
        areaDone.trim() !== '' ||
        improvementArea.trim() !== '';

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
    useEffect(() => {
        if (code) {
            searchGardens(code);
        }
    }, [code]);

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
                        </View>
                        <View style={{gap: 16}}>
                            <CollapsibleTaskBlock title='Canh tác khu vườn'>
                                <ProcedurePicker
                                    selectedValue={procedureType}
                                    onValueChange={setProcedureType}
                                />
                                <TaskInput
                                    label='Bón phân Kali'
                                    unit='KG'
                                    required
                                    placeholder='Nhập khối lượng'
                                    value={kaliAmount}
                                    onChangeText={setKaliAmount}
                                />
                                <TaskInput
                                    label='Diện tích đã làm'
                                    unit='m2'
                                    required
                                    placeholder='Nhập diện tích'
                                    value={areaDone}
                                    onChangeText={setAreaDone}
                                />
                            </CollapsibleTaskBlock>

                            <CollapsibleTaskBlock title='Cải tạo đất khu vườn'>
                                <TaskInput
                                    label='Loại quy trình'
                                    placeholder='Chọn'
                                    value=''
                                    onChangeText={() => {}}
                                />
                                <TaskInput
                                    label='Diện tích đã làm'
                                    unit='m2'
                                    required
                                    placeholder='Nhập diện tích'
                                    value={improvementArea}
                                    onChangeText={setImprovementArea}
                                />
                            </CollapsibleTaskBlock>
                        </View>
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
                showReportConfirmation={showReportConfirmation}
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
