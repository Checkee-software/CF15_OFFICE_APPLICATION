import {View, Text, StyleSheet, ScrollView} from 'react-native';
import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';

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
                        Người tạo: Victoria Secret
                    </Text>
                </View>

                <View style={DetailDocumentsStyles.body}>
                    <View style={DetailDocumentsStyles.warpCreateAndPromulgate}>
                        <Text style={DetailDocumentsStyles.dateTimeCreate}>
                            Tạo lúc: 08:00 12/02/2025
                        </Text>
                        <Text style={DetailDocumentsStyles.dateTimePromulgate}>
                            Ngày BH: 08:00 20/02/2025
                        </Text>
                    </View>

                    <View style={DetailDocumentsStyles.documentContent}>
                        <Text>
                            Lorem ipsum dolor sit amet consectetur. Viverra
                            commodo purus nisi duis elit habitant.. Arcu urna ac
                            maecenas elementum consequat nunc a.. Est et
                            venenatis nisl elit. Amet lobortis scelerisque
                            dictum ut nibh tellus bibendum a pellentesque..
                            Feugiat quam sapien vel massa. Amet porttitor
                            tristique amet mauris viverra quisque.. Amet nibh id
                            diam porta nulla ut faucibus nunc.. Nisl neque
                            integer suspendisse mattis. Lorem vitae ligula ipsum
                            hendrerit odio amet sit cursus.. Posuere
                            pellentesque elementum amet nisi arcu facilisis..
                            Odio nec facilisis senectus turpis ridiculus..
                            Cursus ligula molestie vitae porttitor quis.. Sem
                            sit consectetur arcu ac pellentesque nibh.. Viverra
                            in viverra non nisl hendrerit cras sed rhoncus
                            tristique.. Vitae pellentesque non sit at sit in
                            amet ut id.. Consequat amet eget scelerisque augue.
                            Nunc a cursus et mauris diam lacus sapien donec
                            cras.. Quisque erat cursus non morbi venenatis
                            hendrerit.. Tristique massa gravida elementum at et
                            nisl non ultrices.. Eget vel sed consequat ut
                            adipiscing ut nunc imperdiet.. Sit proin ut
                            dignissim id donec posuere mi.. Pellentesque pretium
                            neque arcu sed dignissim a.. Sapien lacus feugiat et
                            augue. Eu mauris sit purus rhoncus aliquam..
                            Fermentum dui turpis congue pharetra tempus.. Duis
                            aliquet mollis adipiscing mi urna.. Ut mauris
                            pellentesque ut facilisis. Quis eget mauris est non
                            ac suspendisse lobortis auctor tellus.. Commodo
                            mollis ultrices montes arcu sodales quis.. T
                        </Text>
                    </View>
                </View>

                <View style={DetailDocumentsStyles.attachedDocuments}>
                    <Text style={DetailDocumentsStyles.attachedDocumentsText}>
                        Tài liệu đính kèm
                    </Text>
                    <View style={DetailDocumentsStyles.listAttachedDocuments}>
                        <View style={DetailDocumentsStyles.cardDocument}>
                            <View
                                style={DetailDocumentsStyles.leftCardDocument}>
                                <MaterialCommunityIcons
                                    name='text-box'
                                    color={'rgba(255, 78, 69, 1)'}
                                    size={28}
                                />
                                <View
                                    style={DetailDocumentsStyles.infoDocument}>
                                    <Text
                                        style={
                                            DetailDocumentsStyles.infoDocumentText
                                        }>
                                        name_of_document.pdf
                                    </Text>
                                    <Text
                                        style={
                                            DetailDocumentsStyles.infoDocumentSizeText
                                        }>
                                        Kích cỡ: 4.8mb
                                    </Text>
                                </View>
                            </View>

                            <Feather
                                name='download'
                                color={'rgba(33, 150, 243, 1)'}
                                size={22}
                            />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default DetailDocuments;

const DetailDocumentsStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 12,
    },
    header: {
        gap: 6,
        borderColor: 'gray',
        borderBottomWidth: 0.2,
    },
    headerTitle: {
        fontWeight: '500',
        fontSize: 15,
    },
    creator: {
        color: 'rgba(33, 150, 243, 1)',
        fontSize: 12,
        fontWeight: 300,
        marginBottom: 6,
    },
    body: {
        marginBottom: 14,
    },
    warpCreateAndPromulgate: {
        marginTop: 6,
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    dateTimeCreate: {
        fontSize: 11,
        color: 'rgba(128, 128, 128, 1)',
        fontWeight: '400',
    },
    dateTimePromulgate: {
        fontSize: 11,
        color: 'rgba(33, 150, 243, 1)',
        textAlign: 'right',
    },
    documentContent: {
        marginTop: 10,
    },
    attachedDocuments: {
        //marginBottom: 15,
    },
    attachedDocumentsText: {
        borderTopColor: 'rgba(211, 211, 211, 1)',
        borderBottomWidth: 0.5,
        color: 'rgba(128, 128, 128, 1)',
        fontSize: 13,
        paddingVertical: 10,
    },
    listAttachedDocuments: {
        marginVertical: 10,
        gap: 12,
    },
    cardDocument: {
        borderRadius: 8,
        padding: 10,
        backgroundColor: 'rgba(128, 128, 128, 0.15)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    leftCardDocument: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 10,
    },
    infoDocument: {
        // flexDirection: 'row',
        // alignItems: 'center',
        // justifyContent: 'space-between',
    },
    infoDocumentText: {
        fontSize: 11,
    },
    infoDocumentSizeText: {
        fontSize: 11,
        color: 'rgba(128, 128, 128, 1)',
    },
});
