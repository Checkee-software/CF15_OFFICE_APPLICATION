import React from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface Props {
    showResult: boolean;
    selectedType: string;
    selectedTimeOption: string;
    selectedTarget: string;
    onPress: () => void;
}

const SearchBar = ({
    showResult,
    selectedTarget,
    selectedType,
    selectedTimeOption,
    onPress,
}: Props) => {
    return (
        <View style={styles.container}>
            {!showResult ? (
                <View style={styles.inputContainer}>
                    <Icon
                        name='search'
                        size={20}
                        color='#888'
                        style={{marginLeft: 10}}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder='Nhấn để tạo thống kê'
                        placeholderTextColor='black'
                        editable={false}
                    />
                    <TouchableOpacity style={styles.button} onPress={onPress}>
                        <Icon name='manage-search' size={20} color='#000' />
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.resultBox}>
                    <Icon
                        name='search'
                        size={20}
                        color='black'
                        style={{marginRight: 10}}
                    />
                    <View style={{flex: 1}}>
                        <Text style={styles.resultTitle}>{selectedType}</Text>
                        <Text style={styles.resultTitle1}>
                            {selectedTarget}
                        </Text>
                        <Text style={styles.resultSubtitle}>
                            Thời gian: {selectedTimeOption}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.resultButton}
                        onPress={onPress}>
                        <Icon name='manage-search' size={20} color='#fff' />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 16,
        marginVertical: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        paddingVertical: 8,
    },
    input: {
        flex: 1,
        paddingHorizontal: 8,
        fontSize: 14,
        color: '#000',
    },
    button: {
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 10,
        marginRight: 15,
    },
    resultBox: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 8,
        backgroundColor: '#fff',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    resultTitle: {
        fontWeight: '600',
        fontSize: 14,
        color: 'gray',
    },
    resultTitle1: {
        fontWeight: '500',
        fontSize: 14,
        color: '#000',
    },
    resultSubtitle: {
        fontSize: 12,
        fontStyle: 'italic',
        color: '#4CAF50',
    },
    resultButton: {
        padding: 8,
        backgroundColor: '#4CAF50',
        borderRadius: 8,
        marginLeft: 8,
    },
});

export default SearchBar;
