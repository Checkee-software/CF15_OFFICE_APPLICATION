import {
    View,
    Text,
    TextInput,
    ScrollView,
    Image,
    StyleSheet,
    TouchableOpacity,
    FlatList,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import images from '../../../assets/images';
import SCREEN_INFO from '../../../config/SCREEN_CONFIG/screenInfo';
import {useDocumentStore} from '../../../stores/documentStore';
import moment from 'moment';

const Document = ({navigation}) => {
    const {listDocument, getListDocument, isLoading} = useDocumentStore();

    const [searchTitle, setSearchTitle] = useState('');

    useEffect(() => {
        getListDocument();
    }, []);

    type itemDocument = {
        _id: string;
        title: string;
        author: string;
        createdAt: string;
        dateOfIssue: string;
        receivedObject: string;
    };

    const filterDocuments = listDocument.filter(item =>
        item.title.toLowerCase().includes(searchTitle.toLowerCase()),
    );

    const renderItemDocument = (itemDocument: itemDocument) => (
        <TouchableOpacity
            style={DocumentStyles.warpDocumentContentAndIcon}
            onPress={() =>
                navigation.navigate(SCREEN_INFO.DETAILDOCUMENTS.key, {
                    itemDocument,
                })
            }>
            <View style={DocumentStyles.iconDocument}>
                <Image
                    style={DocumentStyles.iconDocumentImage}
                    source={images.fileTypeDocument}
                    resizeMode='contain'
                />
            </View>

            <View style={DocumentStyles.documentContent}>
                <Text style={DocumentStyles.documentContentText}>
                    {itemDocument.title}
                </Text>

                <Text style={DocumentStyles.documentAuthor}>
                    {itemDocument.author}
                </Text>

                <Text style={DocumentStyles.documentTimeSent}>
                    {moment(itemDocument.createdAt).format('HH:mm DD/MM/YYYY')}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={DocumentStyles.container}>
            <ScrollView keyboardShouldPersistTaps='handled'>
                <View style={DocumentStyles.warpSearchInputAndIcon}>
                    <MaterialCommunityIcons
                        name='feature-search'
                        size={24}
                        color={'rgba(128, 128, 128, 1)'}
                    />
                    <TextInput
                        style={DocumentStyles.searchInput}
                        placeholder='Tìm kiếm tài liệu...'
                        placeholderTextColor={'rgba(128, 128, 128, 1)'}
                        value={searchTitle}
                        onChangeText={setSearchTitle}
                    />
                </View>

                <View style={DocumentStyles.listDocument}>
                    <FlatList
                        scrollEnabled={false}
                        data={filterDocuments}
                        renderItem={({item}) => renderItemDocument(item)}
                        keyExtractor={item => item._id}
                        onRefresh={getListDocument}
                        refreshing={isLoading}
                        ListEmptyComponent={
                            <View style={DocumentStyles.emptyContainer}>
                                <Text style={DocumentStyles.emptyText}>
                                    Hiện không có tài liệu nào
                                </Text>
                            </View>
                        }
                    />
                </View>
            </ScrollView>
        </View>
    );
};

export default Document;

const DocumentStyles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 12,
        backgroundColor: '#fff',
    },
    warpSearchInputAndIcon: {
        backgroundColor: 'rgba(128, 128, 128, 0.15)',
        borderRadius: 22,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 14,
    },
    searchInput: {
        paddingVertical: 12,
        color: 'black',
        width: '100%',
    },
    listDocument: {
        backgroundColor: '#fff',
        marginTop: 15,
        gap: 20,
    },
    warpDocumentContentAndIcon: {
        marginBottom: 15,
        flexDirection: 'row',
        flex: 1,
        gap: 8,
    },
    iconDocument: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 50,
        backgroundColor: 'rgba(76, 175, 80, 0.15)',
        height: 72,
        width: 72,
    },
    iconDocumentImage: {
        height: 60,
        width: 60,
        aspectRatio: 1,
    },
    documentContent: {
        flex: 1,
    },
    documentContentText: {
        fontSize: 12,
        flexShrink: 1,
    },
    documentAuthor: {
        color: 'rgba(76, 175, 80, 1)',
        fontSize: 12,
        fontWeight: 300,
        flexShrink: 1,
    },
    documentTimeSent: {
        fontSize: 11,
        color: 'rgba(128, 128, 128, 1)',
        alignSelf: 'flex-end',
        flexShrink: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: 'gray',
    },
});
