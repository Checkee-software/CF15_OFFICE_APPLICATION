import {
    View,
    Text,
    TextInput,
    ScrollView,
    Image,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import images from '../../../assets/images';
import SCREEN_INFO from '../../../config/SCREEN_CONFIG/screenInfo';

const index = ({navigation}) => {
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
                    />
                </View>

                <View style={DocumentStyles.listDocument}>
                    <TouchableOpacity
                        style={DocumentStyles.warpDocumentContentAndIcon}
                        onPress={() =>
                            navigation.navigate(SCREEN_INFO.DETAILDOCUMENTS.key)
                        }>
                        <View style={DocumentStyles.iconDocument}>
                            <Image
                                source={images.fileTypeDocument}
                                resizeMode='contain'
                            />
                        </View>

                        <View style={DocumentStyles.documentContent}>
                            <Text style={DocumentStyles.documentContentText}>
                                Lorem ipsum dolor sit amet consectetur. Morbi
                                velit mauris ut ac elit
                            </Text>
                            <Text style={DocumentStyles.documentAuthor}>
                                Victoria Secret
                            </Text>
                            <Text style={DocumentStyles.documentTimeSent}>
                                08:34 24/02/2025
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={DocumentStyles.warpDocumentContentAndIcon}>
                        <View style={DocumentStyles.iconDocument}>
                            <Image
                                source={images.fileTypeDocument}
                                resizeMode='contain'
                            />
                        </View>

                        <View style={DocumentStyles.documentContent}>
                            <Text style={DocumentStyles.documentContentText}>
                                Lorem ipsum dolor sit amet consectetur. Morbi
                                velit mauris ut ac elit
                            </Text>
                            <Text style={DocumentStyles.documentAuthor}>
                                Victoria Secret
                            </Text>
                            <Text style={DocumentStyles.documentTimeSent}>
                                08:34 24/02/2025
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={DocumentStyles.warpDocumentContentAndIcon}>
                        <View style={DocumentStyles.iconDocument}>
                            <Image
                                source={images.fileTypeDocument}
                                resizeMode='contain'
                            />
                        </View>

                        <View style={DocumentStyles.documentContent}>
                            <Text style={DocumentStyles.documentContentText}>
                                Lorem ipsum dolor sit amet consectetur. Morbi
                                velit mauris ut ac elit
                            </Text>
                            <Text style={DocumentStyles.documentAuthor}>
                                Victoria Secret
                            </Text>
                            <Text style={DocumentStyles.documentTimeSent}>
                                08:34 24/02/2025
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

export default index;

const DocumentStyles = StyleSheet.create({
    container: {
        flex: 1,
        //alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 10,
        paddingHorizontal: 15,
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
        paddingVertical: 14,
        color: 'black',
        width: '100%',
    },
    listDocument: {
        //flexDirection: 'column'
        gap: 10,
        marginTop: 10,
    },
    warpDocumentContentAndIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
    documentContent: {
        //paddingHorizontal: 10,
        //flex: 1,
        //flexDirection: 'column',
        //flexWrap: 'nowrap',
    },
    documentContentText: {
        fontSize: 13,
        textAlign: 'left',
        flexShrink: 0,
    },
    documentAuthor: {
        color: 'rgba(76, 175, 80, 1)',
        fontSize: 12,
        fontWeight: 300,
    },
    documentTimeSent: {
        fontSize: 11,
        color: 'rgba(128, 128, 128, 1)',
        textAlign: 'right',
        //alignSelf: 'flex-end',
    },
});
