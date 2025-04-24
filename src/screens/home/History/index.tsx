import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import images from '../../../assets/images';

const History = () => {
    return (
        <View style={styles.container}>
            <View style={styles.emptyContainer}>
                <Image
                    source={images.emptyHistoryList}
                    style={styles.emptyImage}
                    resizeMode='contain'
                />
                <Text style={styles.emptyText}>
                    Lịch sử hoạt động trống
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyImage: {
        width: 350,
        height: 180,
        marginBottom: 10,
    },
    emptyText: {
        fontSize: 16,
        color: 'gray',
    },
});

export default History;
