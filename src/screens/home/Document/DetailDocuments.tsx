import {View, Text, StyleSheet, ScrollView} from 'react-native';
import React from 'react';

const DetailDocuments = () => {
    return (
        <View style={DetailDocumentsStyles.container}>
            <ScrollView>
                <View style={DetailDocumentsStyles.header}>
                    <Text style={DetailDocumentsStyles.headerTitle}>
                        Lorem ipsum dolor sit amet consectetur. Tortor eget quis
                        cursus neque nullam sapien nec..
                    </Text>

                    <Text style={DetailDocumentsStyles.creator}>
                        Người tạo: Đinh Gia Phúc
                    </Text>
                </View>

                <View style={DetailDocumentsStyles.body}>
                    <View></View>
                </View>
            </ScrollView>
        </View>
    );
};

export default DetailDocuments;

const DetailDocumentsStyles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
        //paddingVertical:
    },
    header: {
        gap: 6,
        borderColor: 'gray',
        borderBottomWidth: 0.2,
        paddingVertical: 10,
    },
    headerTitle: {
        fontWeight: '500',
        fontSize: 15,
    },
    creator: {
        color: 'rgba(33, 150, 243, 1)',
        fontSize: 14,
        fontWeight: 300,
    },
    body: {},
});
