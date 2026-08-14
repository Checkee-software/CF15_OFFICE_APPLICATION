import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type TTab = {
    key: string;
    label: string;
};

type TabChipsProps = {
    tabs: TTab[];
    activeKey: string;
    onSelect: (key: string) => void;
};

/**
 * Shared horizontal scrollable tab chips.
 * Used by Incoming (index.tsx) and Outgoing (OutgoingList.tsx).
 */
const TabChips = React.memo(({ tabs, activeKey, onSelect }: TabChipsProps) => (
    <View style={styles.chipRow}>
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipScroll}
            contentContainerStyle={styles.chipRowContent}>
            {tabs.map(tab => (
                <TouchableOpacity
                    key={tab.key}
                    style={[
                        styles.chip,
                        activeKey === tab.key && styles.chipActive,
                    ]}
                    onPress={() => onSelect(tab.key)}>
                    <Text
                        style={[
                            styles.chipText,
                            activeKey === tab.key && styles.chipTextActive,
                        ]}>
                        {tab.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    </View>
));

TabChips.displayName = 'TabChips';

const styles = StyleSheet.create({
    chipRow: { marginTop: 12, marginBottom: 8 },
    chipScroll: { flexGrow: 0 },
    chipRowContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 8,
    },
    chip: {
        backgroundColor: '#D8D8D8',
        borderRadius: 999,
        paddingVertical: 5,
        paddingHorizontal: 10,
        marginRight: 6,
    },
    chipActive: { backgroundColor: '#54B35A' },
    chipText: { fontSize: 12, color: '#555', fontWeight: '500' },
    chipTextActive: { color: '#FFF' },
});

export default TabChips;
