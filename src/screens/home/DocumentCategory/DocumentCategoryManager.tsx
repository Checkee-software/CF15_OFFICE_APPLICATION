import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import SCREEN_INFO from '@/config/SCREEN_CONFIG/screenInfo';
import { useDocumentCategoryStore } from '@/zustand/useDocumentCategoryStore';
import Loading from '@/screens/subscreen/Loading';
import DeleteModal, { DeleteModalType } from '@/utils/Modals/DeleteModal';
import DocumentCategoryResponse from '@/shared-types/Response/DocumentCategoryResponse';
import images from '@/assets/images';
import colors from '@/assets/colors';

type ViewMode = 'list' | 'grid';

interface MixedContentItem extends DocumentCategoryResponse.IList {
  type: 'folder' | 'document';
  title?: string;
  registeredNumber?: string;
  docType?: string;
  fileCount?: number;
}

interface DeleteModalState {
  visible: boolean;
  itemId: string | null;
  itemName: string;
  itemType: DeleteModalType;
  isLoading: boolean;
}

const DocumentCategoryManager = ({ navigation, route }: any) => {
  // Destructure Zustand store directly to maintain stable references
  const {
    isLoading,
    categories,
    mixedContent,
    breadcrumb,
    getCategoryList,
    getMixedContent,
    setBreadcrumb,
    setCurrentCategoryId,
    deleteCategory,
    deleteDocument,
  } = useDocumentCategoryStore();

  // Navigation parameter to determine if viewing root or inside a category
  const categoryId = route?.params?.categoryId || null;
  const initialViewModeFromRoute = route?.params?.viewMode as ViewMode | undefined;

  // Local states
  const [viewMode, setViewMode] = useState<ViewMode>(
    initialViewModeFromRoute === 'grid' || initialViewModeFromRoute === 'list'
      ? initialViewModeFromRoute
      : 'list',
  );
  const [searchText, setSearchText] = useState('');
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    visible: false,
    itemId: null,
    itemName: '',
    itemType: 'folder',
    isLoading: false,
  });

  // Get data based on view context with safe defaults and casting
  const displayData: MixedContentItem[] =
    (categoryId ? mixedContent : (categories as MixedContentItem[])) || [];

  // Initialize and fetch data safely
  useEffect(() => {
    try {
      if (categoryId) {
        getMixedContent(categoryId);
        setCurrentCategoryId(categoryId);
      } else {
        getCategoryList(undefined, { includeDocumentCounts: true });
        setCurrentCategoryId(null);
        setBreadcrumb([]); // clear breadcrumbs at root
      }
    } catch (error) {
      console.error('[DocumentCategoryManager] Fetch effect error:', error);
    }
  }, [categoryId, getCategoryList, getMixedContent, setCurrentCategoryId, setBreadcrumb]);

  // Sync breadcrumb when user goes back via hardware back / swipe gesture
  // (handleGoBack already handles UI button, but hardware back bypasses it)
  useEffect(() => {
    if (!categoryId) { return; } // root has no breadcrumb to pop
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      setBreadcrumb((breadcrumb || []).slice(0, -1));
    });
    return unsubscribe;
  }, [navigation, categoryId, breadcrumb, setBreadcrumb]);

  // Handle search with safety guards
  const handleSearch = useCallback(
    (text: string) => {
      try {
        setSearchText(text || '');
        if (categoryId) {
          getMixedContent(categoryId, text || '');
        } else {
          getCategoryList(text || '', { includeDocumentCounts: true });
        }
      } catch (error) {
        console.error('[DocumentCategoryManager] Search error:', error);
      }
    },
    [categoryId, getCategoryList, getMixedContent],
  );

  // Handle item press (navigate into folder or detail document)
  const handleItemPress = (item: MixedContentItem) => {
    if (!item) { return; }
    try {
      if (item.type === 'folder') {
        const safeBreadcrumb = breadcrumb || [];
        const newBreadcrumb = [
          ...safeBreadcrumb,
          { id: item._id, name: item.name || 'Thư mục' },
        ];
        setBreadcrumb(newBreadcrumb);

        // Navigate to same screen with new categoryId
        navigation.push(SCREEN_INFO.DOCUMENTCATEGORYMANAGER.key, {
          categoryId: item._id,
          viewMode,
        });
      } else if (item.type === 'document') {
        // Navigate to document detail with documentId
        navigation.navigate(SCREEN_INFO.DETAILDOCUMENTS.key, {
          documentId: item._id,
          documentTitle: item.name || 'Tài liệu',
          readOnly: true,
          sourceModule: 'documentManagement',
        });
      }
    } catch (error) {
      console.error('[DocumentCategoryManager] Item press error:', error);
    }
  };

  // Handle delete action click safely
  const handleDeletePress = (item: MixedContentItem) => {
    if (!item) { return; }
    setDeleteModal({
      visible: true,
      itemId: item._id,
      itemName: item.name || 'Không có tên',
      itemType: (item.type as DeleteModalType) || 'folder',
      isLoading: false,
    });
  };

  // Confirm delete action safely
  const handleConfirmDelete = async () => {
    if (!deleteModal.itemId) { return; }

    setDeleteModal((prev) => ({ ...prev, isLoading: true }));
    try {
      let success = false;
      if (deleteModal.itemType === 'folder') {
        success = await deleteCategory(deleteModal.itemId);
      } else {
        success = await deleteDocument(deleteModal.itemId);
      }

      if (success) {
        setDeleteModal({
          visible: false,
          itemId: null,
          itemName: '',
          itemType: 'folder',
          isLoading: false,
        });
      } else {
        setDeleteModal((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('[DocumentCategoryManager] Confirm delete error:', error);
      setDeleteModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // Cancel delete modal
  const handleCancelDelete = () => {
    setDeleteModal({
      visible: false,
      itemId: null,
      itemName: '',
      itemType: 'folder',
      isLoading: false,
    });
  };

  // Filter data safely + deduplicate by _id to prevent React key warnings
  const filteredData = Array.isArray(displayData)
    ? displayData
        .filter((item) => {
          if (!item || !item.name) { return false; }
          return item.name.toLowerCase().includes(searchText.toLowerCase());
        })
        .filter((item, index, self) =>
          index === self.findIndex((t) => t._id === item._id),
        )
    : [];

  // Handle breadcrumb pop navigation safely
  const handleGoBack = () => {
    try {
      const safeBreadcrumb = breadcrumb || [];
      if (safeBreadcrumb.length > 0) {
        const newBreadcrumb = safeBreadcrumb.slice(0, -1);
        setBreadcrumb(newBreadcrumb);
        navigation.goBack();
      }
    } catch (error) {
      console.error('[DocumentCategoryManager] Go back error:', error);
      navigation.goBack();
    }
  };

  // Render list item with safety guards
  const renderListItem = (item: MixedContentItem) => {
    if (!item) { return null; }
    const isFolder = item.type === 'folder';
    const folderCount = isFolder ? item.subCategoryCount || 0 : 0;
    const documentCount = isFolder ? item.documentCount || 0 : 0;
    const fileCount = item.fileCount ?? item.documentCount ?? 0;

    return (
      <TouchableOpacity
        style={styles.listItemContainer}
        activeOpacity={0.7}
        onPress={() => handleItemPress(item)}>

        {/* Left Folder Icon */}
        <View style={styles.itemIconContainer}>
          <Image
            source={isFolder ? images.folder : images.folder_2}
            style={styles.itemIconImage}
            resizeMode="contain"
          />
        </View>

        {/* Middle Content */}
        <View style={styles.itemContentContainer}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.name || 'Không có tên'}
          </Text>
          {isFolder ? (
            <Text style={styles.itemDescription} numberOfLines={1}>
              {item.code || 'chua_co_ma'}
            </Text>
          ) : (
            <View style={styles.docInfoContainer}>
              <Text style={styles.itemDescription} numberOfLines={1}>
                {item.format || item.docType || item.registeredNumber || 'Văn bản'}
              </Text>
              <Text style={styles.slashDivider}> / </Text>
              <MaterialCommunityIcons name="file-document-outline" size={12} color="#FFC107" />
              <Text style={styles.docCountText}> {fileCount}</Text>
            </View>
          )}
        </View>

        {/* Right Side Counters for Folder */}
        {isFolder && (
          <View style={styles.countersContainer}>
            <View style={styles.counterItem}>
              <MaterialCommunityIcons name="folder" size={14} color="#4CAF50" />
              <Text style={styles.counterText}> {folderCount}</Text>
            </View>
            <Text style={styles.counterDivider}>/</Text>
            <View style={styles.counterItem}>
              <MaterialCommunityIcons name="file-document" size={14} color="#FFC107" />
              <Text style={styles.counterText}> {documentCount}</Text>
            </View>
          </View>
        )}

        {/* Delete Button */}
        <TouchableOpacity
          style={styles.deleteButtonContainer}
          activeOpacity={0.6}
          onPress={() => handleDeletePress(item)}>
          <MaterialCommunityIcons name="trash-can-outline" size={20} color="#B0BEC5" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  // Render grid item with safety guards
  const renderGridItem = (item: MixedContentItem) => {
    if (!item) { return null; }
    const isFolder = item.type === 'folder';

    return (
      <TouchableOpacity
        style={styles.gridItemContainer}
        activeOpacity={0.7}
        onPress={() => handleItemPress(item)}>

        {/* Delete Button inside grid */}
        <TouchableOpacity
          style={styles.gridDeleteButton}
          activeOpacity={0.6}
          onPress={() => handleDeletePress(item)}>
          <MaterialCommunityIcons name="trash-can-outline" size={16} color="#FF6B6B" />
        </TouchableOpacity>

        {/* Icon */}
        <View style={styles.gridIconContainer}>
          <Image
            source={isFolder ? images.folder : images.folder_2}
            style={styles.gridIconImage}
            resizeMode="contain"
          />
        </View>

        {/* Name */}
        <Text style={styles.gridItemName} numberOfLines={2}>
          {item.name || 'Không có tên'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons
        name={categoryId ? 'folder-open' : 'folder-multiple'}
        size={64}
        color="#D1D1D6"
      />
      <Text style={styles.emptyTitle}>
        {searchText ? 'Không tìm thấy kết quả' : 'Danh sách trống'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchText
          ? `Không tìm thấy mục nào khớp với "${searchText}"`
          : categoryId
            ? 'Thư mục này trống hoặc không có tệp nào'
            : 'Chưa có thư mục hồ sơ nào'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Dynamic Search & Grid/List Toggle Row */}
      <View style={styles.topActionRow}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons
            name="magnify"
            size={22}
            color="#90A4AE"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm thư mục, văn bản..."
            placeholderTextColor="#90A4AE"
            value={searchText}
            onChangeText={handleSearch}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')} style={styles.clearIcon}>
              <MaterialCommunityIcons name="close-circle" size={18} color="#CFD8DC" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.layoutToggleContainer}>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'grid' && styles.toggleBtnActive]}
            activeOpacity={0.8}
            onPress={() => setViewMode('grid')}>
            <MaterialCommunityIcons
              name="view-grid"
              size={18}
              color={viewMode === 'grid' ? '#4CAF50' : '#78909C'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]}
            activeOpacity={0.8}
            onPress={() => setViewMode('list')}>
            <MaterialCommunityIcons
              name="format-list-bulleted"
              size={18}
              color={viewMode === 'list' ? '#4CAF50' : '#78909C'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Dynamic Breadcrumbs Area */}
      {categoryId && (
        <View style={styles.breadcrumbsContainer}>
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={handleGoBack}
            style={styles.backBreadcrumb}>
            <Text style={styles.backText}>Quay lại</Text>
          </TouchableOpacity>
          <Text style={styles.breadcrumbSeparator}> {'>'} </Text>
          {(breadcrumb || []).map((item, index) => {
            if (!item) { return null; }
            const isLast = index === (breadcrumb || []).length - 1;
            // Use index in key to guarantee uniqueness even if same folder appears in path
            return (
              <React.Fragment key={`bc_${item.id || 'unknown'}_${index}`}>
                <Text
                  style={[styles.breadcrumbItem, isLast && styles.breadcrumbItemLast]}
                  numberOfLines={1}>
                  {item.name || 'Thư mục'}
                </Text>
                {!isLast && <Text style={styles.breadcrumbSeparator}> {'>'} </Text>}
              </React.Fragment>
            );
          })}
        </View>
      )}

      {/* Content Area */}
      <View style={styles.contentContainer}>
        {isLoading && filteredData.length === 0 ? (
          <Loading />
        ) : viewMode === 'list' ? (
          <FlatList
            key="list-view"
            data={filteredData}
            renderItem={({ item }) => renderListItem(item)}
            keyExtractor={(item, index) => `${item?.type || 'item'}_${item?._id || index}_${index}`}
            showsVerticalScrollIndicator={false}
            onRefresh={() => {
              if (categoryId) {
                getMixedContent(categoryId);
              } else {
                getCategoryList(undefined, { includeDocumentCounts: true });
              }
            }}
            refreshing={isLoading}
            ListEmptyComponent={renderEmptyState}
            contentContainerStyle={styles.listContentContainer}
          />
        ) : (
          <FlatList
            key="grid-view"
            data={filteredData}
            renderItem={({ item }) => renderGridItem(item)}
            keyExtractor={(item, index) => `${item?.type || 'item'}_${item?._id || index}_${index}`}
            numColumns={2}
            columnWrapperStyle={styles.gridColumnWrapper}
            showsVerticalScrollIndicator={false}
            onRefresh={() => {
              if (categoryId) {
                getMixedContent(categoryId);
              } else {
                getCategoryList(undefined, { includeDocumentCounts: true });
              }
            }}
            refreshing={isLoading}
            ListEmptyComponent={renderEmptyState}
            contentContainerStyle={styles.gridContentContainer}
          />
        )}
      </View>

      {/* Perfect Custom Delete Modal */}
      <DeleteModal
        visible={deleteModal.visible}
        itemName={deleteModal.itemName}
        itemType={deleteModal.itemType}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isLoading={deleteModal.isLoading}
      />
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');
const GRID_ITEM_WIDTH = (width - 36) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  topActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F3F4',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#202124',
    padding: 0,
  },
  clearIcon: {
    padding: 4,
  },
  layoutToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F3F4',
    borderRadius: 12,
    padding: 3,
    height: 44,
    alignItems: 'center',
  },
  toggleBtn: {
    width: 38,
    height: 38,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  breadcrumbsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ECEFF1',
    flexWrap: 'wrap',
  },
  backBreadcrumb: {
    paddingVertical: 2,
  },
  backText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0091EA',
  },
  breadcrumbSeparator: {
    fontSize: 12,
    color: '#90A4AE',
    marginHorizontal: 4,
  },
  breadcrumbItem: {
    fontSize: 13,
    color: '#78909C',
    maxWidth: 120,
  },
  breadcrumbItemLast: {
    fontWeight: '700',
    color: '#546E7A',
    fontStyle: 'italic',
  },
  contentContainer: {
    flex: 1,
  },
  listContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  listItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    shadowColor: '#263238',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  itemIconContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#F5F7F8',
    borderRadius: 10,
  },
  itemIconImage: {
    width: 32,
    height: 32,
  },
  itemContentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#263238',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 12,
    color: '#78909C',
    fontStyle: 'italic',
  },
  docInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slashDivider: {
    fontSize: 12,
    color: '#CFD8DC',
  },
  docCountText: {
    fontSize: 12,
    color: '#78909C',
    fontWeight: '500',
  },
  countersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  counterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  counterText: {
    fontSize: 12,
    color: '#78909C',
    fontWeight: '600',
  },
  counterDivider: {
    fontSize: 12,
    color: '#CFD8DC',
    marginHorizontal: 4,
  },
  deleteButtonContainer: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridContentContainer: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 24,
  },
  gridColumnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  gridItemContainer: {
    width: GRID_ITEM_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECEFF1',
    shadowColor: '#263238',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  gridDeleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 6,
    backgroundColor: '#FFF2F2',
    borderRadius: 8,
    zIndex: 10,
  },
  gridIconContainer: {
    marginTop: 12,
    marginBottom: 10,
    width: 64,
    height: 64,
    backgroundColor: '#F5F7F8',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridIconImage: {
    width: 50,
    height: 50,
  },
  gridItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#263238',
    textAlign: 'center',
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  gridItemSubtext: {
    fontSize: 11,
    color: '#90A4AE',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  gridCountersContainer: {
    width: '100%',
    backgroundColor: '#F5F7F8',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  gridCounterItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridCounterText: {
    fontSize: 11,
    color: '#78909C',
    fontWeight: '600',
  },
  gridCounterDivider: {
    fontSize: 11,
    color: '#CFD8DC',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#37474F',
    marginTop: 16,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#78909C',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default DocumentCategoryManager;
