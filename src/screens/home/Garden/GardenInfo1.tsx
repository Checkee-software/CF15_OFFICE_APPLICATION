import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Linking,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import useGardenStore from '../../../stores/gardenStore';
import Loading from '../../subscreen/Loading';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useAuthStore} from '../../../stores/authStore';

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
    const [showManagementAreaInfo, setShowManagementAreaInfo] =
        React.useState(false);

    const {
        selectedGarden,
        fetchGardenDetail,
        isLoading,
        postHarvestStatus,
        fetchHarvestHistory,
        harvestHistory,
    } = useGardenStore();

    const [contractExpanded, setContractExpanded] = React.useState(false);

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

            <View style={styles.harvestRow}>
                {userInfo?.userType?.level === 'LEADER' ? (
                    selectedGarden?.isHarvest ? (
                        <View
                            style={[
                                styles.harvestButton,
                                {backgroundColor: '#4CAF5026', width: '90%'},
                            ]}>
                            <Text
                                style={[styles.buttonText, {color: '#4CAF50'}]}>
                                Đang thu hoạch
                            </Text>
                        </View>
                    ) : null
                ) : selectedGarden?.isHarvest &&
                  selectedGarden?.currentHarvestId ? (
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            width: '100%',
                        }}>
                        <View
                            style={[
                                styles.halfButton,
                                {backgroundColor: '#4CAF5026'},
                            ]}>
                            <Text
                                style={[styles.buttonText, {color: '#4CAF50'}]}>
                                Đang thu hoạch
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={[
                                styles.halfButton,
                                {backgroundColor: '#FF0000'},
                            ]}
                            onPress={async () => {
                                try {
                                    await postHarvestStatus(
                                        selectedGarden._id,
                                        '0',
                                        selectedGarden.currentHarvestId,
                                    );

                                    await fetchGardenDetail(selectedGarden._id);
                                } catch (err) {
                                    console.error('Failed to end harvest', err);
                                }
                            }}>
                            <Text style={styles.buttonText}>Kết thúc</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={[styles.harvestButton, styles.startButton]}
                        onPress={async () => {
                            try {
                                await postHarvestStatus(
                                    selectedGarden._id,
                                    '1',
                                );
                                await fetchGardenDetail(selectedGarden._id);
                            } catch (err) {
                                console.error('Failed to start harvest', err);
                            }
                        }}>
                        <Text style={styles.buttonText}>Bắt đầu thu hoạch</Text>
                    </TouchableOpacity>
                )}
            </View>

            <Section title='Thông tin khu vườn'>
                <Row label='Tên khu vườn' value={selectedGarden.name} />
                <View style={styles.row}>
                    <Text style={styles.label}>Mã khu vườn</Text>
                    <Text style={[styles.value, {color: 'green'}]}>
                        {selectedGarden.code}
                    </Text>
                </View>

                <CollapsibleRow
                    label='Diện tích (m2)'
                    value={selectedGarden.area?.totalSquare}
                    expanded={showAreaInfo}
                    onToggle={() => setShowAreaInfo(!showAreaInfo)}>
                    <Row
                        label='Chiều dài'
                        value={`${selectedGarden.area?.length} m`}
                    />
                    <Row
                        label='Chiều rộng'
                        value={`${selectedGarden.area?.width} m`}
                    />
                </CollapsibleRow>

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
                    value={selectedGarden.manager}
                    expanded={showInfo}
                    onToggle={() => setShowInfo(!showInfo)}>
                    <Row
                        label='Đơn vị'
                        value={selectedGarden.unit || 'Không xác định'}
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
                                                    `http://cf15officeservice.checkee.vn${file.path.replace(
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

                    <CollapsibleRow
                        label='Diện tích giao khoán (m2)'
                        value={selectedGarden.management?.area?.totalSquare}
                        expanded={showManagementAreaInfo}
                        onToggle={() =>
                            setShowManagementAreaInfo(!showManagementAreaInfo)
                        }>
                        <Row
                            label='Chiều dài'
                            value={`${selectedGarden.management?.area?.length} m`}
                        />
                        <Row
                            label='Chiều rộng'
                            value={`${selectedGarden.management?.area?.width} m`}
                        />
                    </CollapsibleRow>
                </CollapsibleRow>
            </Section>

            <Section title='Thông tin cây trồng'>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Tên giống</Text>
                    <Text style={styles.infoValue}>
                        {selectedGarden.productName}
                    </Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Số lượng giống cây</Text>
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
                            <Text
                                style={
                                    styles.plantedText
                                }>{`Trồng ${item.quantity} cây`}</Text>
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

            <Section title={`Lịch sử thu hoạch (${harvestHistory.length})`}>
                {harvestHistory.length === 0 ? (
                    <Text>Chưa có lịch sử thu hoạch nào!</Text>
                ) : (
                    harvestHistory?.map(harvestItem => (
                        <View
                            key={harvestItem?._id}
                            style={{
                                marginBottom: 10,
                                paddingBottom: 10,
                                borderBottomWidth: 1,
                                borderBottomColor: '#ccc',
                            }}>
                            <Row
                                label='Ngày bắt đầu'
                                value={new Date(
                                    harvestItem.createdAt,
                                ).toLocaleString('vi-VN')}
                            />
                            <Row
                                label='Ngày kết thúc'
                                value={new Date(
                                    harvestItem.endAt,
                                ).toLocaleString('vi-VN')}
                            />

                            {harvestItem?.data?.map(entry => (
                                <View
                                    key={entry._id}
                                    style={{
                                        marginTop: 10,
                                        padding: 8,

                                        borderWidth: 1,
                                        borderColor: '#eee',
                                    }}>
                                    <Row
                                        label='Khối lượng (kg)'
                                        value={
                                            entry.amount != null
                                                ? entry.amount.toString()
                                                : '---'
                                        }
                                    />
                                    <Row
                                        label='Nhân sự'
                                        value={entry.userFullName}
                                    />

                                    <Row
                                        label='Người xác nhận'
                                        value={entry.verifier || '---'}
                                    />
                                    <Row
                                        label='Trạng thái'
                                        value={entry.status}
                                    />
                                </View>
                            ))}
                        </View>
                    ))
                )}
            </Section>
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
});
