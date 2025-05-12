import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import SCREEN_INFO from '../../../config/SCREEN_CONFIG/screenInfo';
import TaskBlock from './TaskBlock';
import TaskSummary from './TaskSummary';

interface Props {
    harvestList: any[];
    onAddHarvest: (data: any) => void;
    onRemoveHarvest: (index: number) => void;
    setIsHarvestDeclared?: (value: boolean) => void;
    setOnlyShowReportButton?: (value: boolean) => void;
    gardenId: string;
}

const HarvestSection: React.FC<Props> = ({
    harvestList,
    onAddHarvest,
    onRemoveHarvest,
    setOnlyShowReportButton,
}) => {
    const navigation = useNavigation();
    const [isHarvestDeclared, setIsHarvestDeclared] = React.useState(false);

    const handleAddHarvest = (data: any) => {
        onAddHarvest(data);
        setIsHarvestDeclared(true);
        setOnlyShowReportButton?.(true);
    };

    const hasUnDeclaredHarvest = harvestList.some(item => !item.declared);

    return (
        <View>
            <View style={styles.headerRow}>
                <Text style={styles.taskHeader}>Thu hoạch</Text>
                <TouchableOpacity
                    onPress={() =>
                        navigation.navigate(SCREEN_INFO.GARDENHISTORY.key, {
                            gardenId, 
                        })
                    }>
                    <Text style={styles.linkText}>Lịch sử thu hoạch</Text>
                </TouchableOpacity>
            </View>

            <TaskBlock
                title='Khối lượng thu hoạch (kg)'
                onDeclare={handleAddHarvest}
                isDropdown={false}
                showWarning={hasUnDeclaredHarvest} // Thêm prop showWarning
            />

            {harvestList.map((item, index) => (
                <TaskSummary
                    key={index}
                    title='Thu hoạch'
                    data={item}
                    index={index}
                    onRemove={onRemoveHarvest}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    taskHeader: {
        fontSize: 14,
        fontWeight: '500',
    },
    linkText: {
        color: 'blue',
        textDecorationLine: 'underline',
    },
});

export default HarvestSection;
