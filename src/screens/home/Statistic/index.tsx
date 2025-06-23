import React, {useState} from 'react';
import {SafeAreaView, Modal, Text, View} from 'react-native';
import SearchBar from './SearchBar';
import StatisticResult from './StatisticResult';
import StatisticFormModal from './StatisticFormModal';

export default function Statistic() {
    const [showForm, setShowForm] = useState(false);
    const [showResult, setShowResult] = useState(false);

    const [selectedType, setSelectedType] = useState('');
    const [selectedTarget, setSelectedTarget] = useState('');
    const [selectedTimeOption, setSelectedTimeOption] = useState('');

    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    const [showTypeDropdown, setShowTypeDropdown] = useState(false);
    const [showTargetDropdown, setShowTargetDropdown] = useState(false);

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
            <SearchBar
                showResult={showResult}
                selectedType={selectedType}
                selectedTarget={selectedTarget}
                selectedTimeOption={selectedTimeOption}
                onPress={() => setShowForm(true)}
            />
            {showResult ? (
                <StatisticResult />
            ) : (
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                    <Text style={{color: 'gray', fontSize: 16}}>
                        Vui lòng truy vấn thông tin để xem thống kê!
                    </Text>
                </View>
            )}
            <Modal visible={showForm} transparent animationType='slide'>
                <StatisticFormModal
                    visible={showForm}
                    setVisible={setShowForm}
                    selectedType={selectedType}
                    setSelectedType={setSelectedType}
                    selectedTarget={selectedTarget}
                    setSelectedTarget={setSelectedTarget}
                    selectedTimeOption={selectedTimeOption}
                    setSelectedTimeOption={setSelectedTimeOption}
                    startDate={startDate}
                    setStartDate={setStartDate}
                    endDate={endDate}
                    setEndDate={setEndDate}
                    showStartPicker={showStartPicker}
                    setShowStartPicker={setShowStartPicker}
                    showEndPicker={showEndPicker}
                    setShowEndPicker={setShowEndPicker}
                    onSubmit={() => setShowResult(true)}
                    showTypeDropdown={showTypeDropdown}
                    setShowTypeDropdown={setShowTypeDropdown}
                    showTargetDropdown={showTargetDropdown}
                    setShowTargetDropdown={setShowTargetDropdown}
                />
            </Modal>
        </SafeAreaView>
    );
}
