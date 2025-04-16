import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    FlatList,
    Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import SCREEN_INFO from '../../../config/SCREEN_CONFIG/screenInfo';

const data = [
    {id: '1', name: 'Khu vườn CF-A1'},
    {id: '2', name: 'Khu vườn CF-A2'},
    {id: '3', name: 'Khu vườn CF-A3'},
    {id: '4', name: 'Khu vườn CF-A4'},
];

const GardenInfo = () => {
    const navigation = useNavigation();

    const renderItem = ({item}: any) => (
        <TouchableOpacity style={styles.card} onPress={() =>
            navigation.navigate(SCREEN_INFO.GARDENINFO1.key)
        }>
            <Image
                source={require('../../../assets/images/garden.png')}
                style={styles.image}
                resizeMode='contain'
            />
            <Text style={styles.cardText}>{item.name}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={data}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                numColumns={2}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
};

export default GardenInfo;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 16,
    },

    listContainer: {
        paddingHorizontal: 16,
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    card: {
        width: 172,
        height: 130,
        backgroundColor: '#F8F8F8',
        borderRadius: 12,
        paddingVertical: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    image: {
        width: 50,
        height: 50,
        marginBottom: 12,
    },
    cardText: {
        fontSize: 14,
        color: '#000',
    },
});
