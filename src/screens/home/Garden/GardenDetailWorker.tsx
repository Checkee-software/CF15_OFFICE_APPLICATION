/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React, {useEffect} from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import useGardenStore from '../../../stores/gardenStore';
import {useDocumentStore, buildDownloadUrl} from '@/stores/documentStore';
import Loading from '../../subscreen/Loading';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useAuthStore} from '../../../stores/authStore';
import {FlatList} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import ENV from '@/config/ENV';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import ModalPdfView from '../../../utils/Modals/ModalPdfView';

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

const GardenWorker = () => {
    const {userInfo} = useAuthStore();
    const route = useRoute<any>();
    const code = route.params?.code;

    const [showLocationInfo, setShowLocationInfo] = React.useState(false);
    //const [showInfo, setShowInfo] = React.useState(false);
    const [showModalPdf, setShowModalPdf] = React.useState(false);

    const {gardenDetail, isLoading, harvestHistory} = useGardenStore();
    const {downloadFile} = useDocumentStore();

    const fixEncoding = (input: string): string => {
        try {
            return decodeURIComponent(escape(input));
        } catch (error) {
            return input;
        }
    };

    const pdfFilePath = gardenDetail?.management?.files?.[0]?.path
        ? buildDownloadUrl(gardenDetail.management.files[0].path)
        : '';

    const formatFileSize = (size: number) => {
        if (size >= 1024 * 1024) {
            return `${(size / (1024 * 1024)).toFixed(2)} MB`;
        } else if (size >= 1024) {
            return `${(size / 1024).toFixed(2)} KB`;
        } else {
            return `${size} Bytes`;
        }
    };

    const handleDownloadFile = async (fileName: string) => {
        await downloadFile(fileName);
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

            <View style={styles.rightCardDocument}>
                <TouchableOpacity onPress={() => setShowModalPdf(true)}>
                    <FontAwesome
                        name='eye'
                        color={'rgba(33, 150, 243, 1)'}
                        size={22}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() =>
                        handleDownloadFile(itemAttachedFiles.filename)
                    }>
                    <Feather
                        name='download'
                        color={'rgba(33, 150, 243, 1)'}
                        size={22}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );

    useEffect(() => {
        if (code) {
            useGardenStore.getState().searchGardens(code, userInfo._id);
        }
    }, [code]);

    useEffect(() => {
        if (!gardenDetail) return;

        if (gardenDetail.code && !harvestHistory) {
            useGardenStore.getState().fetchHarvestCollection(gardenDetail._id);
        } else if (gardenDetail.code) {
            useGardenStore.getState().fetchHarvestCollection(gardenDetail._id);
        }
    }, [gardenDetail]);

    if (isLoading || !gardenDetail) {
        return <Loading />;
    }

    console.log(gardenDetail);

    return (
        <>
            <ScrollView contentContainerStyle={styles.container}>
                <Section title='Thông tin khu vườn'>
                    <View
                        style={{
                            flexDirection: 'row',
                            width: '100%',
                            justifyContent: 'space-between',
                        }}>
                        <Text style={(styles.label, {width: '45%'})}>
                            Tên khu vườn
                        </Text>
                        <Text
                            style={
                                (styles.value,
                                {
                                    width: '52%',
                                    textAlign: 'right',
                                })
                            }>
                            {!gardenDetail.gardenNickname
                                ? gardenDetail.name
                                : gardenDetail.gardenNickname}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Text style={styles.label}>Mã khu vườn</Text>
                        <Text style={[styles.value, {color: 'green'}]}>
                            {gardenDetail.code}
                        </Text>
                    </View>

                    <CollapsibleRow
                        label='Vị trí khu vườn'
                        expanded={showLocationInfo}
                        onToggle={() => setShowLocationInfo(!showLocationInfo)}>
                        <Row
                            label='Kinh độ'
                            value={gardenDetail.location?.latitude}
                        />
                        <Row
                            label='Vĩ độ'
                            value={gardenDetail.location?.longitude}
                        />
                    </CollapsibleRow>

                    <View style={styles.row}>
                        <Text style={styles.label}>Người quản lý</Text>
                        <Text style={[styles.value]}>
                            {(gardenDetail as any).manager}
                        </Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Đơn vị</Text>
                        <Text style={[styles.value]}>
                            {(gardenDetail as any).unit || 'Không xác định'}
                        </Text>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>
                            Diện tích giao khoán (ha)
                        </Text>
                        <Text style={[styles.value]}>
                            {gardenDetail.management?.area?.totalSquare}
                        </Text>
                    </View>

                    {/* <CollapsibleRow
                        label='Người quản lý'
                        value={(gardenDetail as any).manager}
                        expanded={showInfo}
                        onToggle={() => setShowInfo(!showInfo)}>
                        <Row
                            label='Đơn vị'
                            value={
                                (gardenDetail as any).unit || 'Không xác định'
                            }
                        />

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
                                {gardenDetail.management?.area?.totalSquare}
                            </Text>
                        </View>
                    </CollapsibleRow> */}
                </Section>

                <Section title='Thông tin cây trồng'>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Tên giống</Text>
                        <Text style={styles.infoValue}>
                            {(gardenDetail as any).productName}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Số lượng cây trồng</Text>
                        <Text
                            style={
                                styles.infoValue
                            }>{`${gardenDetail.productQuantity} cây`}</Text>
                    </View>

                    {gardenDetail.totalProductByYear?.map(item => (
                        <View key={item._id} style={styles.yearBox}>
                            <View style={styles.yearTitleRow}>
                                <Text
                                    style={
                                        styles.yearTitle
                                    }>{`Năm ${item.year}`}</Text>
                                <Text style={styles.plantedText}>{`Trồng ${
                                    gardenDetail.totalProductByYear[
                                        gardenDetail.totalProductByYear.length -
                                            1
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
                                <Text
                                    style={styles.labelTree}>{`Cây trồng mới: ${
                                    item.newTree || 0
                                }`}</Text>
                                <Text
                                    style={[
                                        styles.labelTree,
                                        {textAlign: 'right'},
                                    ]}>{`Cây chết: ${
                                    item.deadTree || 0
                                }`}</Text>
                            </View>
                        </View>
                    ))}
                </Section>

                {gardenDetail.sidePlants?.length > 0 && (
                    <Section title='Thông tin cây trồng xen'>
                        <Row
                            label='Số loại cây trồng xen'
                            value={gardenDetail?.sidePlants?.length}
                        />
                        {gardenDetail?.sidePlants?.map(plant => (
                            <Row
                                key={plant._id}
                                label={plant.name}
                                value={`${plant.value} cây`}
                            />
                        ))}
                    </Section>
                )}

                {gardenDetail.management?.files.length !== 0 ? (
                    <Section title='Tệp đính kèm'>
                        <FlatList
                            scrollEnabled={false}
                            data={gardenDetail.management?.files}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({item}) =>
                                renderItemAttachedFiles(item)
                            }
                        />
                    </Section>
                ) : null}

                {gardenDetail.note && <Text>{gardenDetail.note}</Text>}
            </ScrollView>

            <ModalPdfView
                visible={showModalPdf}
                pdfFilePath={pdfFilePath}
                onClose={() => setShowModalPdf(false)}
            />
        </>
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

export default GardenWorker;

const styles = StyleSheet.create({
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
        flex: 0.96,
        gap: 10,
    },
    rightCardDocument: {
        flexDirection: 'row',
        alignItems: 'center',
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
    modalContent: {
        flex: 1,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    loadingPdf: {
        flex: 1,
        alignItems: 'center',
    },
    loadingPdfText: {
        marginTop: 10,
        textAlign: 'center',
    },
    button2: {
        alignSelf: 'flex-end',
        marginRight: 10,
        paddingVertical: 8,
    },
    buttonText2: {
        color: 'red',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
