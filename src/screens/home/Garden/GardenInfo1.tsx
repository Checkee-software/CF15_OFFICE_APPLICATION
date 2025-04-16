import React, {useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import {List} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

const GardenInfo1 = () => {
    const navigation = useNavigation();
    const [expanded1, setExpanded1] = useState(true);
    const [expanded2, setExpanded2] = useState(false);
    const [expanded3, setExpanded3] = useState(false);

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <List.Accordion
                    title='Thông tin khu vườn'
                    expanded={expanded1}
                    onPress={() => setExpanded1(!expanded1)}
                    style={styles.accordion}
                    titleStyle={styles.accordionTitle}>
                    <View style={styles.infoBox}>
                        <Row label='Tên khu vườn' value='Khu vườn CF-A1' />
                        <Row label='Mã khu vườn' value='0015245627889' />
                        <Row label='Diện tích khu vườn' value='1000m2' />
                        <Row label='Diện tích giao khoán' value='500m2' />
                        <Row
                            label='Vị trí khu vườn'
                            valueComponent={
                                <TouchableOpacity>
                                    <Text style={styles.linkText}>
                                        Bấm để xem
                                    </Text>
                                </TouchableOpacity>
                            }
                        />
                    </View>
                </List.Accordion>

                <List.Accordion
                    title='Thông tin cây trồng'
                    expanded={expanded2}
                    onPress={() => setExpanded2(!expanded2)}
                    style={styles.accordion}
                    titleStyle={styles.accordionTitle}>
                    <View style={styles.infoBox}>
                        <Row label='Giống cây trồng' value='Cà phê Arabica' />
                        <Row label='Số cây trồng' value='500' />

                        <View style={{marginTop: 10}}>
                            <Text style={styles.subHeader}>
                                Năm trồng / Số cây
                            </Text>
                            <View style={[styles.tableRow, styles.tableHeader]}>
                                <Text style={styles.cellHeader}>Năm trồng</Text>
                                <Text style={styles.cellHeader}>Số cây</Text>
                            </View>
                            <View style={styles.tableRow}>
                                <Text style={styles.cell}>2015</Text>
                                <Text style={styles.cell}>400</Text>
                            </View>
                            <View style={styles.tableRow}>
                                <Text style={styles.cell}>2018</Text>
                                <Text style={styles.cell}>100</Text>
                            </View>
                        </View>

                        <View style={{marginTop: 10}}>
                            <Text style={styles.subHeader}>Chất lượng cây</Text>
                            <View style={[styles.tableRow, styles.tableHeader]}>
                                <Text style={styles.cellHeader}>A</Text>
                                <Text style={styles.cellHeader}>B</Text>
                                <Text style={styles.cellHeader}>C</Text>
                                <Text style={styles.cellHeader}>D</Text>
                            </View>
                            <View style={styles.tableRow}>
                                <Text style={styles.cell}>100</Text>
                                <Text style={styles.cell}>150</Text>
                                <Text style={styles.cell}>100</Text>
                                <Text style={styles.cell}>150</Text>
                            </View>
                        </View>
                    </View>
                </List.Accordion>

                <List.Accordion
                    title='Thông tin cây trồng xen'
                    expanded={expanded3}
                    onPress={() => setExpanded3(!expanded3)}
                    style={styles.accordion}
                    titleStyle={styles.accordionTitle}>
                    <View style={styles.infoBox}>
                        <Row label='Kèn hồng' value='200' />
                        <Row label='Muồng đen' value='300' />
                    </View>
                </List.Accordion>
            </ScrollView>
        </View>
    );
};

const Row = ({label, value, valueComponent}: any) => (
    <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        {valueComponent ? (
            valueComponent
        ) : (
            <Text style={styles.value}>{value}</Text>
        )}
    </View>
);

export default GardenInfo1;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    content: {
        padding: 16,
    },
    accordion: {
        backgroundColor: '#F2F2F2',
        borderRadius: 12,
        marginTop: 12,
        paddingHorizontal: 2,
        elevation: 0,
        paddingVertical: 4,
    },
    accordionTitle: {
        fontWeight: '600',
        color: 'black',
    },
    infoBox: {
        paddingHorizontal: 18,
        paddingBottom: 6,
        backgroundColor: '#F2F2F2',
        marginBottom: 10,
        top: -12,
        borderRadius: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
    },
    label: {
        fontSize: 14,
        color: '#444',
        width: '50%',
    },
    value: {
        fontSize: 14,
        color: '#000',
        width: '50%',
        textAlign: 'right',
    },
    linkText: {
        color: '#007BFF',
        textDecorationLine: 'none',
        fontWeight: '600',
        textAlign: 'right',
    },
    subHeader: {
        marginBottom: 6,
        marginTop: 10,
        fontSize: 14,
        color: '#000',
    },
    tableRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    tableHeader: {
        borderRadius: 8,
    },
    cell: {
        flex: 1,
        textAlign: 'center',
        fontSize: 14,
    },
    cellHeader: {
        flex: 1,
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '600',
    },
});
