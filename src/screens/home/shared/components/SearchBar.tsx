import React from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

type SearchBarProps = {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
};

/**
 * Shared search bar with magnify icon and filter button.
 * Used by Incoming (index.tsx) and Outgoing (OutgoingList.tsx).
 */
const SearchBar = React.memo(
    ({
        value,
        onChangeText,
        placeholder = 'Tìm kiếm văn bản...',
    }: SearchBarProps) => (
        <View style={styles.searchRow}>
            <View style={styles.searchBox}>
                <MaterialCommunityIcons
                    name='magnify'
                    size={20}
                    color='#9A9A9A'
                />
                <TextInput
                    style={styles.searchInput}
                    placeholder={placeholder}
                    placeholderTextColor='#9A9A9A'
                    value={value}
                    onChangeText={onChangeText}
                />
            </View>
            <TouchableOpacity style={styles.filterButton}>
                <MaterialCommunityIcons
                    name='tune-variant'
                    size={20}
                    color='#858585'
                />
            </TouchableOpacity>
        </View>
    ),
);

SearchBar.displayName = 'SearchBar';

const styles = StyleSheet.create({
    searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    searchBox: {
        flex: 1,
        height: 42,
        backgroundColor: '#FFF',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#D7D7D7',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    searchInput: { flex: 1, color: '#222', fontSize: 14, paddingVertical: 0 },
    filterButton: {
        width: 36,
        height: 36,
        borderWidth: 1,
        borderColor: '#D7D7D7',
        borderRadius: 8,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default SearchBar;
