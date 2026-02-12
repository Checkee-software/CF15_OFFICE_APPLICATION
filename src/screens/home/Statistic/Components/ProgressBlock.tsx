import {View, Text, StyleSheet} from 'react-native';
import React from 'react';

const MAX_HEIGHT = 150;

const ProgressBlock = (data: {
    value: number;
    color: string;
    productName: string;
    totalEmployees: number;
    totalQuantity: number;
    _id: {harvestTitle: string};
}) => {
    const {value, color, productName, totalEmployees, totalQuantity, _id} =
        data;
    const height = (value / 100) * MAX_HEIGHT;

    return (
        <View style={styles.container}>
            <View
                style={[
                    styles.progressBar,
                    {
                        height,
                        backgroundColor: color,
                    },
                ]}
            />
            <View style={styles.warp}>
                <Text style={[styles.fontWeight1]}>
                    {totalQuantity.toLocaleString()}{' '}
                </Text>
                <Text>sản lượng</Text>
            </View>
            {_id.harvestTitle && (
                <Text style={[styles.fontWeight1, styles.text]}>
                    {_id.harvestTitle}
                </Text>
            )}
            <View style={styles.warp}>
                <Text style={styles.text}>Khu vườn: </Text>
                <Text style={[styles.fontWeight1]}>{productName} </Text>
            </View>
            <View style={styles.warp}>
                <Text style={styles.text}>Số người tham gia: </Text>
                <Text style={[styles.fontWeight1]}>{totalEmployees} </Text>
            </View>
        </View>
    );
};

export default ProgressBlock;

const styles = StyleSheet.create({
    container: {
        height: MAX_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        gap: 6,
    },
    progressBar: {
        borderRadius: 12,
        width: 160,
        marginBottom: 8,
        alignSelf: 'center',
    },
    text: {
        textAlign: 'center',
    },
    warp: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
    },
    fontWeight1: {
        fontWeight: '600',
    },
});
