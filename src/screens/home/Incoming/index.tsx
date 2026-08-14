import React, {useCallback, useEffect} from 'react';
import {
    FlatList,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Loading from '@/screens/subscreen/Loading';
import Backdrop from '@/screens/subscreen/Loading/index2';
import DocumentCard from './components/DocumentCard';
import IncomingForm from './components/IncomingForm';
import DeleteModal from './components/DeleteModal';
import {useIncomingForm} from './hooks/useIncomingForm';
import HOME_SCREENS from '@/config/SCREEN_CONFIG/home';
import SCREEN_INFO from '@/config/SCREEN_CONFIG/screenInfo';
import styles from './styles';

export default function Incoming({navigation}: any) {
    const form = useIncomingForm();
    const {
        activeTab,
        cancelDelete,
        confirmDelete,
        deletingId,
        deletingTitle,
        docs,
        filteredDocs,
        isDeleting,
        isLoading,
        isPreparingForm,
        isStationary,
        openCreateForm,
        resetForm,
        searchText,
        setActiveTabKey,
        setSearchText,
        setShowForm,
        showForm,
        startEdit,
        requestDelete,
        tabs,
    } = form;

    const renderHeaderCreateButton = useCallback(() => {
        if (!isStationary || showForm) {
            return null;
        }

        return (
            <TouchableOpacity
                accessibilityLabel="Tạo văn bản đến"
                accessibilityRole="button"
                disabled={isLoading || isPreparingForm}
                onPress={openCreateForm}
                style={[
                    styles.headerCreateButton,
                    (isLoading || isPreparingForm) &&
                        styles.headerCreateButtonDisabled,
                ]}>
                <MaterialCommunityIcons name="plus" size={22} color="#FFFFFF" />
            </TouchableOpacity>
        );
    }, [isLoading, isPreparingForm, isStationary, openCreateForm, showForm]);

    useEffect(() => {
        navigation?.setOptions?.({
            headerShown: true,
            title: HOME_SCREENS.INCOMING.headerTitle,
            headerRight: renderHeaderCreateButton,
        });
    }, [navigation, renderHeaderCreateButton]);

    if (isLoading && !showForm && docs.length === 0) {
        return <Loading />;
    }

    if (showForm && isStationary) {
        return (
            <IncomingForm
                form={form}
                onClose={() => {
                    setShowForm(false);
                    resetForm();
                }}
            />
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.searchRow}>
                <View style={styles.searchBox}>
                    <MaterialCommunityIcons
                        name="magnify"
                        size={20}
                        color="#9A9A9A"
                    />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Tìm kiếm văn bản..."
                        placeholderTextColor="#9A9A9A"
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                </View>
                <TouchableOpacity style={styles.filterButton}>
                    <MaterialCommunityIcons
                        name="tune-variant"
                        size={20}
                        color="#858585"
                    />
                </TouchableOpacity>
            </View>

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
                                activeTab?.key === tab.key && styles.chipActive,
                            ]}
                            onPress={() => setActiveTabKey(tab.key)}>
                            <Text
                                style={[
                                    styles.chipText,
                                    activeTab?.key === tab.key &&
                                        styles.chipTextActive,
                                ]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <Text style={styles.totalText}>
                Tổng số văn bản đến: {filteredDocs.length}
            </Text>

            <FlatList
                data={filteredDocs}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                renderItem={({item}) => (
                    <DocumentCard
                        item={item}
                        isStationary={isStationary}
                        isBusy={isLoading || isPreparingForm}
                        onOpenDetail={id =>
                            navigation.navigate(SCREEN_INFO.DETAILDOCUMENTS.key, {
                                documentId: id,
                                sourceModule: 'incomingDocument',
                            })
                        }
                        onStartEdit={startEdit}
                        onRequestDelete={requestDelete}
                    />
                )}
            />

            <DeleteModal
                visible={!!deletingId}
                deletingTitle={deletingTitle}
                isDeleting={isDeleting}
                isLoading={isLoading}
                onCancel={cancelDelete}
                onConfirm={confirmDelete}
            />
            <Backdrop open={isLoading || isPreparingForm} />
        </View>
    );
}
