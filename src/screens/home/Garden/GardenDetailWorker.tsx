import React, {useEffect} from 'react';
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
import useAuthStore from '../../../stores/authStore';

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
    const {userInfo} = useAuthStore();
    const route = useRoute<any>();
    const id = route.params?.id;
    const [showAreaInfo, setShowAreaInfo] = React.useState(false);
    const [showLocationInfo, setShowLocationInfo] = React.useState(false);
    const [showInfo, setShowInfo] = React.useState(false);
    const [showManagementAreaInfo, setShowManagementAreaInfo] =
        React.useState(false);

    const {selectedGarden, fetchGardenDetail, isLoading} = useGardenStore();
    const [contractExpanded, setContractExpanded] = React.useState(false);

    useEffect(() => {
        if (id) {
            fetchGardenDetail(id);
        }
    }, [id]);

    if (isLoading || !selectedGarden) return <Loading />;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {userInfo?.userType?.level !== 'WORKER' && (
                <View style={styles.qrContainer}>
                    <QRCode
                        value={selectedGarden.code || 'No Code'}
                        size={372}
                    />
                </View>
            )}

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
                                selectedGarden.management.files.map(
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
                    <View key={item._id} style={styles.yearBox}>
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
                    {selectedGarden.sidePlants.map(plant => (
                        <Row
                            key={plant._id}
                            label={plant.name}
                            value={`${plant.value} cây`}
                        />
                    ))}
                </Section>
            )}

            <Section title='Quy trình trồng trọt'>
                <Text>Chưa có quy trình nào!</Text>
            </Section>
            <Section title='Lịch sử thu hoạch'>
                <Text>Chưa có lịch sử thu hoạch nào!</Text>
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
});
