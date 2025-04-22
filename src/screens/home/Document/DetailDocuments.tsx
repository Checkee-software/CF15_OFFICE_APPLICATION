import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
} from 'react-native';
import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import moment from 'moment';
import {useWindowDimensions} from 'react-native';
import RenderHtml from 'react-native-render-html';
import RNFS from 'react-native-fs';
import Snackbar from 'react-native-snackbar';

const DetailDocuments = ({route}) => {
    const {width} = useWindowDimensions();
    console.log(route);

    type AttachedFiles = {
        destination: string;
        encoding: string;
        fieldname: string;
        mimetype: string;
        originalname: string;
        filename: string;
        path: string;
        size: number;
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

    const fixFilePath = (path: string) => {
        const updatedPath = path.replace(/\\/g, '/');
        return `http://cf15officeservice.checkee.vn${updatedPath}`;
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

    const renderItemAttachedFiles = (itemAttachedFiles: AttachedFiles) => (
        <View style={DetailDocumentsStyles.cardDocument}>
            <View style={DetailDocumentsStyles.leftCardDocument}>
                <MaterialCommunityIcons
                    name='text-box'
                    color={'rgba(255, 78, 69, 1)'}
                    size={28}
                />
                <View style={DetailDocumentsStyles.infoDocument}>
                    <Text style={DetailDocumentsStyles.infoDocumentText}>
                        {itemAttachedFiles.originalname}
                    </Text>
                    <Text style={DetailDocumentsStyles.infoDocumentSizeText}>
                        {formatFileSize(itemAttachedFiles.size)}
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

    return (
        <View style={DetailDocumentsStyles.container}>
            <ScrollView>
                <View style={DetailDocumentsStyles.header}>
                    <Text style={DetailDocumentsStyles.headerTitle}>
                        {route.params.itemDocument.title}
                    </Text>

                    <Text style={DetailDocumentsStyles.creator}>
                        Người tạo: {route.params.itemDocument.createdBy}
                    </Text>
                </View>

                <View style={DetailDocumentsStyles.body}>
                    <View style={DetailDocumentsStyles.warpCreateAndPromulgate}>
                        <Text style={DetailDocumentsStyles.dateTimeCreate}>
                            Tạo lúc:{' '}
                            {moment(route.params.itemDocument.createdAt).format(
                                'HH:mm DD/MM/YYYY',
                            )}
                        </Text>
                        <Text style={DetailDocumentsStyles.dateTimePromulgate}>
                            Ngày BH:{' '}
                            {moment(
                                route.params.itemDocument.dateOfIssue,
                            ).format('HH:mm DD/MM/YYYY')}
                        </Text>
                    </View>

                    <View style={DetailDocumentsStyles.documentContent}>
                        <RenderHtml
                            contentWidth={width}
                            source={{html: route.params.itemDocument.content}}
                        />
                    </View>
                </View>

                <View style={DetailDocumentsStyles.attachedDocuments}>
                    <Text style={DetailDocumentsStyles.attachedDocumentsText}>
                        Tài liệu đính kèm
                    </Text>
                    <View style={DetailDocumentsStyles.listAttachedDocuments}>
                        <FlatList
                            scrollEnabled={false}
                            data={route.params.itemDocument.files}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({item}) =>
                                renderItemAttachedFiles(item)
                            }
                            ListEmptyComponent={
                                <View
                                    style={
                                        DetailDocumentsStyles.emptyContainer
                                    }>
                                    <Text
                                        style={DetailDocumentsStyles.emptyText}>
                                        Không có tài liệu nào được đính kèm
                                    </Text>
                                </View>
                            }
                        />
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
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 15,
        color: 'black',
    },
});
