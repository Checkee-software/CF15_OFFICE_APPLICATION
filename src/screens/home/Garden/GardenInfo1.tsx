import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking,
    FlatList,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import useGardenStore from '../../../stores/gardenStore';
import Loading from '../../subscreen/Loading';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useAuthStore} from '../../../stores/authStore';
import ENV from '@/config/ENV';
import RNFS from 'react-native-fs';
import Snackbar from 'react-native-snackbar';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';

const CollapsibleRow = ({
    label,
    value,
    expanded,
    onToggle,
    children,
}: {
    label: string;
    value?: string | number;
    expanded: boolean;
    onToggle: () => void;
    children?: React.ReactNode;
}) => (
    <>
        <TouchableOpacity onPress={onToggle} style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.value}>{value}</Text>
                <Icon
                    name={
                        expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-right'
                    }
                    size={20}
                    color='green'
                />
            </View>
        </TouchableOpacity>
        {expanded && <View style={styles.indentedContent}>{children}</View>}
    </>
);

const GardenDetailScreen = () => {
    const [isHarvesting, setIsHarvesting] = useState(false);
    const {userInfo} = useAuthStore();
    const route = useRoute<any>();
    const id = route.params?.id;
    const [showAreaInfo, setShowAreaInfo] = React.useState(false);
    const [showLocationInfo, setShowLocationInfo] = React.useState(false);
    const [showInfo, setShowInfo] = React.useState(false);

    const {selectedGarden, fetchGardenDetail, isLoading} = useGardenStore();

    const [contractExpanded, setContractExpanded] = React.useState(false);

    const fixEncoding = (input: string): string => {
        try {
            return decodeURIComponent(escape(input));
        } catch (error) {
            return input;
        }
    };

    const fixFilePath = (path: string) => {
        const updatedPath = path.replace(/\\/g, '/');
        return `${ENV.BACKEND_URL}${updatedPath}`;
    };

    const formatFileSize = (size: number) => {
        if (size >= 1024 * 1024) {
            return `${(size / (1024 * 1024)).toFixed(2)} MB`;
        } else if (size >= 1024) {
            return `${(size / 1024).toFixed(2)} KB`;
        } else {
            return `${size} Bytes`;
        }
    };

    const downloadFile = async (fileUrl: string, fileName: string) => {
        const updatedFileUrl = fixFilePath(fileUrl);
        try {
            const downloadDest = `${RNFS.DownloadDirectoryPath}/${fileName}`;
            const options = {
                fromUrl: updatedFileUrl,
                toFile: downloadDest,
            };
            const result = await RNFS.downloadFile(options).promise;
            if (result.statusCode === 200) {
                Snackbar.show({
                    text: 'Đã tải tập tin về điện thoại của bạn!',
                    duration: Snackbar.LENGTH_LONG,
                });
            } else {
                Snackbar.show({
                    text: 'Tải file không thành công!',
                    duration: Snackbar.LENGTH_LONG,
                });
            }
        } catch (error) {
            Snackbar.show({
                text: 'Có lỗi xảy ra khi tải file.',
                duration: Snackbar.LENGTH_LONG,
            });
        }
    };

    const renderItemAttachedFiles = (itemAttachedFiles: any) => (
        <View style={styles.cardDocument}>
            <View style={styles.leftCardDocument}>
                <MaterialCommunityIcons
                    name='text-box'
                    color={'rgba(255, 78, 69, 1)'}
                    size={28}
                />
                <View style={styles.infoDocument}>
                    <Text style={styles.infoDocumentText}>
                        {fixEncoding(itemAttachedFiles.originalname)}
                    </Text>
                    <Text style={styles.infoDocumentSizeText}>
                        Kích cỡ: {formatFileSize(itemAttachedFiles.size)}
                    </Text>
                </View>
            </View>

            <TouchableOpacity
                onPress={() =>
                    downloadFile(
                        itemAttachedFiles.path,
                        itemAttachedFiles.filename,
                    )
                }>
                <Feather
                    name='download'
                    color={'rgba(33, 150, 243, 1)'}
                    size={22}
                />
            </TouchableOpacity>
        </View>
    );

    useEffect(() => {
        if (id) {
            fetchGardenDetail(id);
        }
    }, [id]);

    useEffect(() => {
        setIsHarvesting(!!selectedGarden?.isHarvest);
    }, [selectedGarden]);
    useEffect(() => {
        if (selectedGarden?._id) {
            useGardenStore
                .getState()
                .fetchHarvestCollection(selectedGarden._id);
        }
    }, [selectedGarden]);

    if (isLoading || !selectedGarden) return <Loading />;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.qrContainer}>
                <QRCode value={selectedGarden.code || 'No Code'} size={372} />
            </View>

            <Section title='Thông tin khu vườn'>
                <Row label='Tên khu vườn' value={selectedGarden.name} />
                <View style={styles.row}>
                    <Text style={styles.label}>Mã khu vườn</Text>
                    <Text style={[styles.value, {color: 'green'}]}>
                        {selectedGarden.code}
                    </Text>
                </View>

                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                    }}>
                    <Text style={{width: '65%'}}>Diện tích (ha)</Text>
                    <Text
                        style={{
                            width: '30%',
                            textAlign: 'right',
                        }}>
                        {selectedGarden.management?.area?.totalSquare}
                    </Text>
                </View>

                <CollapsibleRow
                    label='Vị trí khu vườn'
                    expanded={showLocationInfo}
                    onToggle={() => setShowLocationInfo(!showLocationInfo)}>
                    <Row
                        label='Kinh độ'
                        value={selectedGarden.location?.latitude}
                    />
                    <Row
                        label='Vĩ độ'
                        value={selectedGarden.location?.longitude}
                    />
                </CollapsibleRow>

                <CollapsibleRow
                    label='Người quản lý'
                    value={(selectedGarden as any).manager}
                    expanded={showInfo}
                    onToggle={() => setShowInfo(!showInfo)}>
                    <Row
                        label='Đơn vị'
                        value={(selectedGarden as any).unit || 'Không xác định'}
                    />
                    {userInfo?.userType?.level !== 'LEADER' && (
                        <CollapsibleRow
                            label='Hợp đồng'
                            expanded={contractExpanded}
                            onToggle={() =>
                                setContractExpanded(!contractExpanded)
                            }>
                            {selectedGarden.management?.files?.length > 0 ? (
                                selectedGarden.management?.files?.map(
                                    (file, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            onPress={() =>
                                                Linking.openURL(
                                                    `${
                                                        ENV.BACKEND_URL
                                                    }${file.path.replace(
                                                        /\\/g,
                                                        '/',
                                                    )}`,
                                                )
                                            }>
                                            <Text
                                                style={{
                                                    color: 'green',
                                                    marginBottom: 6,
                                                }}>
                                                {file.filename}
                                            </Text>
                                        </TouchableOpacity>
                                    ),
                                )
                            ) : (
                                <Text style={{color: '#888'}}>
                                    Không có hợp đồng nào
                                </Text>
                            )}
                        </CollapsibleRow>
                    )}

                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                        }}>
                        <Text style={{width: '65%'}}>
                            Diện tích giao khoán (ha)
                        </Text>
                        <Text
                            style={{
                                width: '30%',
                                textAlign: 'right',
                            }}>
                            {selectedGarden.management?.area?.totalSquare}
                        </Text>
                    </View>
                </CollapsibleRow>
            </Section>

            <Section title='Thông tin cây trồng'>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Tên giống</Text>
                    <Text style={styles.infoValue}>
                        {(selectedGarden as any).productName}
                    </Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Số lượng cây trồng</Text>
                    <Text
                        style={
                            styles.infoValue
                        }>{`${selectedGarden.productQuantity} cây`}</Text>
                </View>

                {selectedGarden.totalProductByYear?.map(item => (
                    <View key={item._id || item.year} style={styles.yearBox}>
                        <View style={styles.yearTitleRow}>
                            <Text
                                style={
                                    styles.yearTitle
                                }>{`Năm ${item.year}`}</Text>
                            <Text style={styles.plantedText}>{`Trồng ${
                                selectedGarden.totalProductByYear[
                                    selectedGarden.totalProductByYear.length - 1
                                ].quantity
                            } cây`}</Text>
                        </View>

                        <View style={styles.qualityRow}>
                            <Text style={styles.qualityText}>{`A: ${
                                item.qualities?.[0] ?? 0
                            }`}</Text>
                            <Text style={styles.separator}></Text>
                            <Text style={styles.qualityText}>{`B: ${
                                item.qualities?.[1] ?? 0
                            }`}</Text>
                            <Text style={styles.separator}></Text>
                            <Text style={styles.qualityText}>{`C: ${
                                item.qualities?.[2] ?? 0
                            }`}</Text>
                            <Text style={styles.separator}></Text>
                            <Text style={styles.qualityText}>{`D: ${
                                item.qualities?.[3] ?? 0
                            }`}</Text>
                        </View>

                        <View style={styles.warpNewTreeDead}>
                            <Text style={styles.labelTree}>{`Cây trồng mới: ${
                                item.newTree || 0
                            }`}</Text>
                            <Text
                                style={[
                                    styles.labelTree,
                                    {textAlign: 'right'},
                                ]}>{`Cây chết: ${item.deadTree || 0}`}</Text>
                        </View>
                    </View>
                ))}
            </Section>

            {selectedGarden.sidePlants?.length > 0 && (
                <Section title='Thông tin cây trồng xen'>
                    <Row
                        label='Số loại cây trồng xen'
                        value={selectedGarden.sidePlants.length}
                    />
                    {selectedGarden.sidePlants?.map(plant => (
                        <Row
                            key={plant._id}
                            label={plant.name}
                            value={`${plant.value} cây`}
                        />
                    ))}
                </Section>
            )}

            {selectedGarden.management?.files.length !== 0 ? (
                <Section title='Tệp đính kèm'>
                    <FlatList
                        scrollEnabled={false}
                        data={selectedGarden.management?.files}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={({item}) => renderItemAttachedFiles(item)}
                    />
                </Section>
            ) : null}

            {selectedGarden.note && <Text>{selectedGarden.note}</Text>}
        </ScrollView>
    );
};

const Section = ({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) => (
    <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View>{children}</View>
    </View>
);

const Row = ({label, value}: {label: string; value?: string | number}) => (
    <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
    </View>
);

export default GardenDetailScreen;

const styles = StyleSheet.create({
    halfButton: {
        flex: 1,
        paddingVertical: 12,
        marginHorizontal: 4,
        borderRadius: 3,
        alignItems: 'center',
    },

    container: {
        padding: 16,
        backgroundColor: '#fff',
    },

    qrContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        color: 'green',
        marginBottom: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
    },
    label: {
        fontSize: 14,
        color: '#444',
    },
    value: {
        fontSize: 14,
        fontWeight: '400',
        color: '#000',
    },
    indentedContent: {
        paddingLeft: 20,
    },

    typeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        marginTop: 4,
    },
    typeText: {
        fontSize: 14,
        color: '#000',
        fontWeight: '500',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
    },
    infoLabel: {
        fontSize: 14,
        color: '#444',
    },
    infoValue: {
        fontSize: 14,
        color: '#000',
    },
    yearBox: {
        borderBottomWidth: 2,
        borderBottomColor: '#ddd',
        borderRadius: 4,
        marginTop: 10,
        padding: 0,
        overflow: 'hidden',
    },
    yearTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    yearTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
        paddingLeft: 34,
    },
    plantedText: {
        fontWeight: 'bold',
        fontSize: 14,
        color: '#000',
        paddingRight: 34,
    },
    qualityRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 8,
        paddingHorizontal: 5,
    },
    qualityText: {
        fontSize: 14,
        color: '#000',
    },
    separator: {
        fontSize: 14,
        color: '#ddd',
    },
    warpNewTreeDead: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    labelTree: {
        flex: 1,
        flexShrink: 1,
    },
    harvestRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
        width: '100%',
    },
    harvestButton: {
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 3,
        alignItems: 'center',
        width: 200,
        marginHorizontal: 5,
    },
    startButton: {
        backgroundColor: '#FFA500',
        width: '90%',
    },
    harvestingButton: {
        backgroundColor: '#4CAF5026',
        color: 'green',
    },
    endButton: {
        backgroundColor: '#FF0000',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 3,
        alignItems: 'center',
        minWidth: 100,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },

    cardDocument: {
        borderRadius: 8,
        padding: 10,
        flex: 1,
        backgroundColor: 'rgba(128, 128, 128, 0.15)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    leftCardDocument: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 10,
    },
    infoDocument: {
        width: '85%',
    },
    infoDocumentText: {
        fontSize: 11,
    },
    infoDocumentSizeText: {
        fontSize: 11,
        color: 'rgba(128, 128, 128, 1)',
    },
});
