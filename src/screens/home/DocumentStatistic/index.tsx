import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {BarChart, PieChart} from 'react-native-gifted-charts';
import RNFS from 'react-native-fs';
import Snackbar from 'react-native-snackbar';
import {Text as SvgText} from 'react-native-svg';
import {encode} from 'base64-arraybuffer';

import {useDocumentStatisticStore} from '@/stores/documentStatisticStore';
import {useDocumentCategoryStore} from '@/zustand/useDocumentCategoryStore';
import axiosClient from '@/utils/axiosClient';
import ENV from '@/config/ENV';
import {
  DOCUMENT_STATUS_LABEL,
  DOCUMENT_PRIORITY_LABEL,
  EDocumentPriority,
  EDocumentStatus,
  EDocumentType,
} from '@/shared-types/common/Document/document';

type TDatePreset = 'TODAY' | 'THIS_MONTH' | 'THIS_QUARTER' | 'THIS_YEAR' | 'CUSTOM';
type TPickerOption<T = string> = {label: string; value: T};


const DOCUMENT_TYPE_OPTIONS: TPickerOption<EDocumentType>[] = [
  {label: 'Tất cả', value: EDocumentType.ALL},
  {label: 'Văn bản đến', value: EDocumentType.INCOMING},
  {label: 'Văn bản đi', value: EDocumentType.OUTGOING},
];

const PRIORITY_OPTIONS: TPickerOption<string>[] = [
  {label: 'Tất cả', value: ''},
  {label: DOCUMENT_PRIORITY_LABEL[EDocumentPriority.LOW], value: EDocumentPriority.LOW},
  {label: DOCUMENT_PRIORITY_LABEL[EDocumentPriority.MEDIUM], value: EDocumentPriority.MEDIUM},
  {label: DOCUMENT_PRIORITY_LABEL[EDocumentPriority.HIGH], value: EDocumentPriority.HIGH},
  {label: DOCUMENT_PRIORITY_LABEL[EDocumentPriority.URGENT], value: EDocumentPriority.URGENT},
];

const PRESET_OPTIONS: TPickerOption<TDatePreset>[] = [
  {label: 'Hôm nay', value: 'TODAY'},
  {label: 'Tháng này', value: 'THIS_MONTH'},
  {label: 'Quý này', value: 'THIS_QUARTER'},
  {label: 'Cả năm', value: 'THIS_YEAR'},
  {label: 'Khác', value: 'CUSTOM'},
];

const PRIORITY_STYLE_MAP: Record<string, {bg: string; color: string}> = {
  [EDocumentPriority.LOW]: {bg: '#DDF4E0', color: '#3A9A49'},
  [EDocumentPriority.MEDIUM]: {bg: '#FFE8C7', color: '#E48D16'},
  [EDocumentPriority.HIGH]: {bg: '#FFE0DD', color: '#EE5A4E'},
  [EDocumentPriority.URGENT]: {bg: '#E8DAFF', color: '#8F51F0'},
};

const STATUS_STYLE_MAP: Record<string, {bg: string; color: string}> = {
  [EDocumentStatus.ARCHIVED]: {bg: '#DDF4E0', color: '#47A857'},
  [EDocumentStatus.OFFICIAL_PUBLISHED]: {bg: '#DDF4E0', color: '#47A857'},
  [EDocumentStatus.COMPLETED]: {bg: '#DDF4E0', color: '#47A857'},
  [EDocumentStatus.PROCESSING]: {bg: '#D6EAFE', color: '#3494F0'},
  [EDocumentStatus.REJECTED]: {bg: '#FFE1DE', color: '#F16054'},
};

const getRangeFromPreset = (preset: TDatePreset) => {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  if (preset === 'TODAY') {
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return {startDate: start, endDate: end};
  }

  if (preset === 'THIS_MONTH') {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    end.setMonth(end.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
    return {startDate: start, endDate: end};
  }

  if (preset === 'THIS_QUARTER') {
    const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
    start.setMonth(quarterStartMonth, 1);
    start.setHours(0, 0, 0, 0);
    end.setMonth(quarterStartMonth + 3, 0);
    end.setHours(23, 59, 59, 999);
    return {startDate: start, endDate: end};
  }

  if (preset === 'THIS_YEAR') {
    start.setMonth(0, 1);
    start.setHours(0, 0, 0, 0);
    end.setMonth(11, 31);
    end.setHours(23, 59, 59, 999);
    return {startDate: start, endDate: end};
  }

  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  end.setMonth(end.getMonth() + 1, 0);
  end.setHours(23, 59, 59, 999);
  return {startDate: start, endDate: end};
};

const formatDate = (date: Date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatDateTime = (value?: string | Date) => {
  if (!value) {
    return '--';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '--';
  }
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm} ${formatDate(date)}`;
};

const toStartOfDayIso = (date: Date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next.toISOString();
};

const toEndOfDayIso = (date: Date) => {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next.toISOString();
};

const getCategoryName = (doc: any) => {
  if (doc?.categoryDocumentName) {
    return doc.categoryDocumentName;
  }
  if (doc?.categoryName) {
    return doc.categoryName;
  }
  if (typeof doc?.categoryId === 'object') {
    if (doc.categoryId?.name) {
      return doc.categoryId.name;
    }
    if (doc.categoryId?.title) {
      return doc.categoryId.title;
    }
  }
  return 'Khác';
};

const buildConclusion = (incoming: number, outgoing: number) => {
  if (outgoing > incoming) {
    return {
      main: `Văn bản đi: ${outgoing} > Văn bản đến: ${incoming}`,
      prefix: 'Văn bản đi có nhiều hơn văn bản đến với chênh lệch ',
      diff: `${outgoing - incoming} văn bản`,
    };
  }
  if (incoming > outgoing) {
    return {
      main: `Văn bản đến: ${incoming} > Văn bản đi: ${outgoing}`,
      prefix: 'Văn bản đến có nhiều hơn văn bản đi với chênh lệch ',
      diff: `${incoming - outgoing} văn bản`,
    };
  }
  return {
    main: `Văn bản đến: ${incoming} = Văn bản đi: ${outgoing}`,
    prefix: 'Số lượng văn bản đến và văn bản đi đang bằng nhau: ',
    diff: `${incoming} văn bản`,
  };
};

const renderPieExternalLabel = (item: any) => (
  <SvgText
    x={0}
    y={-8}
    fontSize={12}
    fontWeight="600"
    fill={item?.textColor || '#555'}>
    {String(item?.text || '')}
  </SvgText>
);

const formatChartAxisLabel = (rawLabel: string) => {
  const label = String(rawLabel || '').trim();
  const fullDate = label.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (fullDate) {
    return `${fullDate[3]}/${fullDate[2]}`;
  }

  const monthDate = label.match(/^(\d{4})-(\d{2})$/);
  if (monthDate) {
    return `${monthDate[2]}/${monthDate[1].slice(-2)}`;
  }

  return label.length > 7 ? label.slice(-7) : label;
};

const getNiceChartScale = (values: number[]) => {
  const finiteValues = values.filter(value => Number.isFinite(value) && value > 0);
  const maxData = finiteValues.length ? Math.max(...finiteValues) : 0;

  if (maxData <= 0) {
    return {maxValue: 5, stepValue: 1, sections: 5};
  }

  const targetSections = maxData <= 10 ? 5 : 6;
  const roughStep = maxData / targetSections;
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const normalized = roughStep / magnitude;

  let niceNormalized = 1;
  if (normalized > 1 && normalized <= 2) {
    niceNormalized = 2;
  } else if (normalized > 2 && normalized <= 5) {
    niceNormalized = 5;
  } else if (normalized > 5) {
    niceNormalized = 10;
  }

  const stepValue = Math.max(1, niceNormalized * magnitude);
  const sections = Math.max(4, Math.ceil(maxData / stepValue));
  const maxValue = stepValue * sections;

  return {maxValue, stepValue, sections};
};


const DropdownField = ({
  label,
  value,
  options,
  onSelect,
}: {
  label: string;
  value: string;
  options: TPickerOption[];
  onSelect: (value: string) => void;
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity
        style={styles.selectButton}
        activeOpacity={0.9}
        onPress={() => setVisible(true)}>
        <Text style={styles.selectText}>{value}</Text>
        <MaterialCommunityIcons name="chevron-down" size={18} color="#666" />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}>
        <TouchableOpacity
          style={styles.dropdownBackdrop}
          activeOpacity={1}
          onPress={() => setVisible(false)}>
          <View style={styles.dropdownCard}>
            {options.map(option => (
              <TouchableOpacity
                key={`${option.value}`}
                style={styles.dropdownItem}
                onPress={() => {
                  onSelect(String(option.value));
                  setVisible(false);
                }}>
                <Text style={styles.dropdownItemText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const DirectionBadge = ({type}: {type: string}) => {
  const isOutgoing = type === EDocumentType.OUTGOING;
  return (
    <View style={[styles.directionBadge, isOutgoing ? styles.directionOutgoing : styles.directionIncoming]}>
      <View style={styles.directionGlyphWrap}>
        <MaterialCommunityIcons
          name="folder-outline"
          size={20}
          color={isOutgoing ? '#FB9A06' : '#4CB45A'}
        />
        <MaterialCommunityIcons
          name={isOutgoing ? 'arrow-right' : 'arrow-left'}
          size={9}
          color={isOutgoing ? '#FB9A06' : '#4CB45A'}
          style={styles.directionArrow}
        />
      </View>
    </View>
  );
};

type TPieSummaryDatum = {
  value: number;
  color: string;
  label?: string;
  labelColor?: string;
};

const PieSummaryCard = ({
  title,
  desc,
  data,
}: {
  title: string;
  desc: string;
  data: TPieSummaryDatum[];
}) => (
  <View style={styles.sectionCard}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <Text style={styles.sectionSubTitle}>{desc}</Text>
    <View style={styles.pieWrap}>
      <PieChart
        data={data.map(item => ({
          value: item.value,
          color: item.color,
          text: item.label || '',
          textColor: item.labelColor || item.color,
          labelLineConfig: {
            color: item.labelColor || item.color,
            thickness: 1,
          },
        }))}
        radius={86}
        initialAngle={0}
        extraRadius={70}
        paddingHorizontal={80}
        paddingVertical={16}
        showExternalLabels
        labelLineConfig={{
          length: 6,
          tailLength: 4,
          thickness: 1,
          labelComponentWidth: 73,
          labelComponentHeight: 20,
          labelComponentMargin: 6,
          avoidOverlappingOfLabels: true,
        }}
        externalLabelComponent={renderPieExternalLabel}
      />
    </View>
  </View>
);

export default function DocumentStatistic({navigation}: any) {
  const {getCategoryList, categories} = useDocumentCategoryStore();
  const {getStatisticDocument, statisticData, isLoading} = useDocumentStatisticStore();

  const defaultRange = getRangeFromPreset('THIS_MONTH');

  const [docType, setDocType] = useState<EDocumentType>(EDocumentType.ALL);
  const [priority, setPriority] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [preset, setPreset] = useState<TDatePreset>('THIS_MONTH');
  const [startDate, setStartDate] = useState<Date>(defaultRange.startDate);
  const [endDate, setEndDate] = useState<Date>(defaultRange.endDate);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showTableSwipeHint, setShowTableSwipeHint] = useState(true);

  useEffect(() => {
    navigation?.setOptions?.({headerShown: true, title: 'Thống kê tài liệu'});
  }, [navigation]);

  useEffect(() => {
    getCategoryList(undefined, {isFromNumbering: true});
  }, [getCategoryList]);

  const loadStatistics = async () => {
    setShowTableSwipeHint(true);
    await getStatisticDocument({
      type: docType,
      priority: (priority || undefined) as EDocumentPriority | undefined,
      categoryId: categoryId || undefined,
      startDate: toStartOfDayIso(startDate),
      endDate: toEndOfDayIso(endDate),
    });
  };

  useEffect(() => {
    loadStatistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categoryOptions = useMemo<TPickerOption[]>(() => {
    const dynamic = categories.map(item => ({label: item.name, value: item._id}));
    return [{label: 'Tất cả', value: ''}, ...dynamic];
  }, [categories]);

  const selectedDocTypeLabel =
    DOCUMENT_TYPE_OPTIONS.find(item => item.value === docType)?.label || 'Tất cả';
  const selectedPriorityLabel =
    PRIORITY_OPTIONS.find(item => item.value === priority)?.label || 'Tất cả';
  const selectedCategoryLabel =
    categoryOptions.find(item => item.value === categoryId)?.label || 'Tất cả';
  const selectedPresetLabel = PRESET_OPTIONS.find(item => item.value === preset)?.label || 'Tháng này';

  const isIncomingOnly = docType === EDocumentType.INCOMING;
  const isOutgoingOnly = docType === EDocumentType.OUTGOING;
  const chartLabelInterval = useMemo(() => {
    const count = statisticData?.chartData?.length || 0;
    if (count <= 7) {
      return 1;
    }
    if (count <= 14) {
      return 2;
    }
    if (count <= 21) {
      return 3;
    }
    return 4;
  }, [statisticData?.chartData?.length]);

  const filteredDocuments = useMemo(() => {
    const docs = statisticData?.list || [];
    if (docType === EDocumentType.ALL) {
      return docs;
    }
    return docs.filter((item: any) => item.type === docType);
  }, [docType, statisticData?.list]);

  const chartData = useMemo(() => {
    if (!statisticData?.chartData?.length) {
      return [];
    }
    const result: any[] = [];

    if (isIncomingOnly) {
      statisticData.chartData.forEach((item, index) => {
        const shouldShowLabel = index % chartLabelInterval === 0;
        result.push({
          value: item.incoming,
          frontColor: '#4CAF50',
          label: shouldShowLabel ? formatChartAxisLabel(item.label) : '',
          spacing: 14,
        });
      });
      return result;
    }

    if (isOutgoingOnly) {
      statisticData.chartData.forEach((item, index) => {
        const shouldShowLabel = index % chartLabelInterval === 0;
        result.push({
          value: item.outgoing,
          frontColor: '#FF9800',
          label: shouldShowLabel ? formatChartAxisLabel(item.label) : '',
          spacing: 14,
        });
      });
      return result;
    }

    statisticData.chartData.forEach((item, index) => {
      const shouldShowLabel = index % chartLabelInterval === 0;
      result.push({
        value: item.incoming,
        frontColor: '#4CAF50',
        label: shouldShowLabel ? formatChartAxisLabel(item.label) : '',
        spacing: 6,
      });
      result.push({
        value: item.outgoing,
        frontColor: '#FF9800',
        label: '',
        spacing: index === statisticData.chartData.length - 1 ? 8 : 14,
      });
    });

    return result;
  }, [chartLabelInterval, isIncomingOnly, isOutgoingOnly, statisticData?.chartData]);

  const chartAxisScale = useMemo(
    () => getNiceChartScale(chartData.map(item => Number(item?.value || 0))),
    [chartData],
  );

  const chartRenderWidth = useMemo(() => {
    const perItemWidth = isIncomingOnly || isOutgoingOnly ? 24 : 18;
    return Math.max(320, chartData.length * perItemWidth + 42);
  }, [chartData.length, isIncomingOnly, isOutgoingOnly]);

  const monthLabel = endDate.getMonth() + 1;
  const periodLabel = isIncomingOnly
    ? `Số lượng văn bản đến trong tháng ${monthLabel}`
    : isOutgoingOnly
      ? `Số lượng văn bản đi trong tháng ${monthLabel}`
      : `Số lượng văn bản đi và văn bản đến trong tháng ${monthLabel}`;

  const countLabel = isIncomingOnly ? 'Văn bản đến' : 'Văn bản đi';
  const countColor = isIncomingOnly ? '#4CAF50' : '#FF9800';
  const countValue = isIncomingOnly
    ? statisticData?.totalIncoming || 0
    : statisticData?.totalOutgoing || 0;

  const archiveNotSaved = statisticData?.archiveStatus.notArchived || 0;
  const archiveSaved = statisticData?.archiveStatus.archived || 0;
  const archivePieData: TPieSummaryDatum[] =
    archiveNotSaved + archiveSaved > 0
      ? [
          {
            value: archiveSaved,
            color: '#4CAF50',
            label: `Đã lưu sổ: ${archiveSaved}`,
            labelColor: '#4CAF50',
          },
          {
            value: archiveNotSaved,
            color: '#FF4D4F',
            label: `Chưa lưu sổ: ${archiveNotSaved}`,
            labelColor: '#FF4D4F',
          },
        ]
      : [{value: 1, color: '#E5E7EB'}];

  const publishedCount =
    statisticData?.statusDocuments?.find(item => item.status === EDocumentStatus.OFFICIAL_PUBLISHED)
      ?.count || 0;
  const statusPieData: TPieSummaryDatum[] =
    publishedCount + archiveSaved > 0
      ? [
          {
            value: archiveSaved,
            color: '#FB9A06',
            label: `Đã lưu trữ: ${archiveSaved}`,
            labelColor: '#FB9A06',
          },
          {
            value: publishedCount,
            color: '#4CAF50',
            label: `Đã phát hành: ${publishedCount}`,
            labelColor: '#4CAF50',
          },
        ]
      : [{value: 1, color: '#E5E7EB'}];

  const incomingFolderStats =
    statisticData?.folderStatistics
      ?.filter(item => Number(item.incoming || 0) > 0)
      .sort((a, b) => Number(b.incoming || 0) - Number(a.incoming || 0)) || [];
  const outgoingFolderStats =
    statisticData?.folderStatistics
      ?.filter(item => Number(item.outgoing || 0) > 0)
      .sort((a, b) => Number(b.outgoing || 0) - Number(a.outgoing || 0)) || [];

  const incomingTotal = statisticData?.totalIncoming || 0;
  const outgoingTotal = statisticData?.totalOutgoing || 0;
  const conclusion = buildConclusion(incomingTotal, outgoingTotal);
  const summaryCount =
    docType === EDocumentType.ALL
      ? incomingTotal + outgoingTotal
      : docType === EDocumentType.INCOMING
        ? incomingTotal
        : outgoingTotal;
  const summarySubject =
    docType === EDocumentType.ALL
      ? 'văn bản'
      : docType === EDocumentType.INCOMING
        ? 'văn bản đến'
        : 'văn bản đi';
  const summaryHintText = `Hệ thống ghi nhận ${summaryCount} ${summarySubject} trong phạm vi thống kê đã chọn.`;

  const exportExcel = async () => {
    try {
      const response = await axiosClient.get(
        `${ENV.BACKEND_URL}/resources/statistics-documents/document/export-excel`,
        {
          params: {
            startDate: toStartOfDayIso(startDate),
            endDate: toEndOfDayIso(endDate),
            ...(docType !== EDocumentType.ALL ? {type: docType} : {}),
            ...(categoryId ? {categoryId} : {}),
            ...(priority ? {priority} : {}),
          },
          responseType: 'arraybuffer',
        },
      );

      const base64Data = encode(response.data);
      const fileName = `thong-ke-tai-lieu-${Date.now()}.xlsx`;
      const filePath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
      await RNFS.writeFile(filePath, base64Data, 'base64');

      Snackbar.show({
        text: `Đã xuất file: ${fileName}`,
        duration: Snackbar.LENGTH_LONG,
      });
    } catch (error) {
      Snackbar.show({
        text: 'Không thể xuất file excel.',
        duration: Snackbar.LENGTH_LONG,
      });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryWrap}>
          <Text style={styles.summaryTitle}>Báo cáo thống kê</Text>
          <Text style={styles.summaryDesc}>Thống kê và phân tích dữ liệu văn bản đi và văn bản đến.</Text>
          <Text style={styles.summaryHint}>{summaryHintText}</Text>
        </View>

        <View style={styles.filterBox}>
          <View style={styles.filterHeader}>
            <MaterialCommunityIcons name="tune-variant" size={18} color="#222" />
            <View style={styles.filterHeaderText}>
              <Text style={styles.filterTitle}>Bộ lọc thống kê</Text>
              <Text style={styles.filterSubTitle}>Chọn các tiêu chí để lọc và thống kê dữ liệu</Text>
            </View>
          </View>

          <DropdownField
            label="Loại văn bản"
            value={selectedDocTypeLabel}
            options={DOCUMENT_TYPE_OPTIONS}
            onSelect={value => setDocType(value as EDocumentType)}
          />

          <View style={styles.fieldRow}>
            <View style={styles.halfField}>
              <DropdownField
                label="Loại hồ sơ văn bản"
                value={selectedCategoryLabel}
                options={categoryOptions}
                onSelect={setCategoryId}
              />
            </View>
            <View style={styles.halfField}>
              <DropdownField
                label="Mức độ ưu tiên"
                value={selectedPriorityLabel}
                options={PRIORITY_OPTIONS}
                onSelect={setPriority}
              />
            </View>
          </View>

          <DropdownField
            label="Thời gian"
            value={selectedPresetLabel}
            options={PRESET_OPTIONS}
            onSelect={value => {
              const nextPreset = value as TDatePreset;
              setPreset(nextPreset);
              if (nextPreset !== 'CUSTOM') {
                const nextRange = getRangeFromPreset(nextPreset);
                setStartDate(nextRange.startDate);
                setEndDate(nextRange.endDate);
              }
            }}
          />

          <View style={styles.fieldRow}>
            <TouchableOpacity style={styles.dateField} onPress={() => setShowStartPicker(true)}>
              <Text style={styles.dateText}>{formatDate(startDate)}</Text>
              <MaterialCommunityIcons name="calendar-month-outline" size={18} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.dateField} onPress={() => setShowEndPicker(true)}>
              <Text style={styles.dateText}>{formatDate(endDate)}</Text>
              <MaterialCommunityIcons name="calendar-month-outline" size={18} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.statisticButton} onPress={loadStatistics} disabled={isLoading}>
              <MaterialCommunityIcons name="chart-bar" size={16} color="#FFF" />
              <Text style={styles.statisticButtonText}>Thống kê</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exportButton} onPress={exportExcel}>
              <MaterialCommunityIcons name="download-outline" size={16} color="#7A7A7A" />
              <Text style={styles.exportButtonText}>Xuất excel</Text>
            </TouchableOpacity>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color="#4CAF50" />
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        ) : (
          <>
            {docType === EDocumentType.ALL ? (
              <View style={styles.counterRow}>
                <View style={styles.counterCard}>
                  <Text style={styles.counterTitle}>Văn bản đến</Text>
                  <Text style={[styles.counterValue, {color: '#4CAF50'}]}>{incomingTotal}</Text>
                </View>
                <View style={styles.counterCard}>
                  <Text style={styles.counterTitle}>Văn bản đi</Text>
                  <Text style={[styles.counterValue, {color: '#FF9800'}]}>{outgoingTotal}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.singleCounterCard}>
                <Text style={styles.counterTitle}>{countLabel}</Text>
                <Text style={[styles.counterValue, {color: countColor}]}>{countValue}</Text>
              </View>
            )}

            <View style={styles.statusGrid}>
              <View style={styles.statusCard}>
                <Text style={styles.statusTitle}>Đã ký</Text>
                <View style={styles.statusValueRow}>
                  <Text style={styles.statusValue}>{statisticData?.statusCounts.signedOutgoing || 0}</Text>
                  <View style={[styles.statusIcon, {backgroundColor: '#ECDDFF'}]}>
                    <MaterialCommunityIcons name="account-check-outline" size={18} color="#8D52F0" />
                  </View>
                </View>
                <Text style={styles.statusHint}>Văn bản đi</Text>
              </View>

              <View style={styles.statusCard}>
                <Text style={styles.statusTitle}>Hoàn thành</Text>
                <View style={styles.statusValueRow}>
                  <Text style={styles.statusValue}>{statisticData?.statusCounts.completedIncoming || 0}</Text>
                  <View style={[styles.statusIcon, {backgroundColor: '#DDF4E0'}]}>
                    <MaterialCommunityIcons name="file-check-outline" size={18} color="#4CAF50" />
                  </View>
                </View>
                <Text style={styles.statusHint}>Văn bản đến</Text>
              </View>

              <View style={styles.statusCard}>
                <Text style={styles.statusTitle}>Đang xử lý</Text>
                <View style={styles.statusValueRow}>
                  <Text style={styles.statusValue}>{statisticData?.statusCounts.processing || 0}</Text>
                  <View style={[styles.statusIcon, {backgroundColor: '#D6EAFE'}]}>
                    <MaterialCommunityIcons name="dots-horizontal" size={18} color="#3494F0" />
                  </View>
                </View>
              </View>

              <View style={styles.statusCard}>
                <Text style={styles.statusTitle}>Đã từ chối</Text>
                <View style={styles.statusValueRow}>
                  <Text style={styles.statusValue}>{statisticData?.statusCounts.rejected || 0}</Text>
                  <View style={[styles.statusIcon, {backgroundColor: '#FFE1DE'}]}>
                    <MaterialCommunityIcons name="close" size={18} color="#F16054" />
                  </View>
                </View>
              </View>
            </View>

            <View style={[styles.sectionCard, styles.documentListCard]}>
              <Text style={styles.sectionTitle}>Danh sách tài liệu</Text>
              <Text style={styles.sectionSubTitle}>Tài liệu được thống kê theo phạm vi</Text>

              {showTableSwipeHint && filteredDocuments.length > 0 && (
                <View style={styles.tableHintRow}>
                  <View style={styles.tableHintBadge}>
                    <MaterialCommunityIcons
                      name="gesture-swipe-horizontal"
                      size={14}
                      color="#6B7280"
                    />
                    <Text style={styles.tableHintText}>Vuốt sang phải để xem chi tiết</Text>
                    <MaterialCommunityIcons name="arrow-right" size={15} color="#6B7280" />
                  </View>
                </View>
              )}

              <View style={styles.tableWrap}>
                <ScrollView
                  horizontal
                  nestedScrollEnabled
                  bounces={false}
                  showsHorizontalScrollIndicator={false}
                  scrollEventThrottle={16}
                  onScroll={event => {
                    if (showTableSwipeHint && event.nativeEvent.contentOffset.x > 12) {
                      setShowTableSwipeHint(false);
                    }
                  }}>
                  <View style={styles.tableContent}>
                    <View style={styles.tableHeader}>
                      <Text style={[styles.tableHeadText, styles.colCode]}>Số hiệu</Text>
                      <Text style={[styles.tableHeadText, styles.colType]}>Loại</Text>
                      <Text style={[styles.tableHeadText, styles.colDoc]}>Văn bản</Text>
                      <Text style={[styles.tableHeadText, styles.colDirection]}>Hướng</Text>
                      <Text style={[styles.tableHeadText, styles.colPriority]}>Ưu tiên</Text>
                      <Text style={[styles.tableHeadText, styles.colStatus]}>Trạng thái</Text>
                      <Text style={[styles.tableHeadText, styles.colDate]}>Ngày phát hành</Text>
                    </View>

                    {filteredDocuments.map((item: any) => {
                      const priorityStyle = PRIORITY_STYLE_MAP[item.priority] || {
                        bg: '#EFEFEF',
                        color: '#666',
                      };
                      const statusStyle = STATUS_STYLE_MAP[item.status] || {
                        bg: '#E5E7EB',
                        color: '#666',
                      };
                      const statusLabel =
                        DOCUMENT_STATUS_LABEL[item.status as EDocumentStatus] || item.status || '--';

                      return (
                        <View
                          key={item._id || `${item.registeredNumber}-${item.title}`}
                          style={styles.tableRow}>
                          <Text style={[styles.tableCellText, styles.colCode]} numberOfLines={1}>
                            {item.registeredNumber || '--'}
                          </Text>
                          <Text style={[styles.tableCellText, styles.colType]} numberOfLines={1}>
                            {getCategoryName(item)}
                          </Text>
                          <Text style={[styles.tableCellText, styles.colDoc]} numberOfLines={1}>
                            {item.title || '--'}
                          </Text>
                          <View style={[styles.colDirection, styles.centerCell]}>
                            <DirectionBadge type={item.type} />
                          </View>
                          <View style={[styles.colPriority, styles.centerCell]}>
                            <View style={[styles.pill, {backgroundColor: priorityStyle.bg}]}>
                              <Text style={[styles.pillText, {color: priorityStyle.color}]}>
                                {DOCUMENT_PRIORITY_LABEL[item.priority as EDocumentPriority] || '--'}
                              </Text>
                            </View>
                          </View>
                          <View style={[styles.colStatus, styles.centerCell]}>
                            <View style={[styles.pill, {backgroundColor: statusStyle.bg}]}>
                              <Text style={[styles.pillText, {color: statusStyle.color}]}>
                                {statusLabel}
                              </Text>
                            </View>
                          </View>
                          <Text style={[styles.tableCellText, styles.colDate]} numberOfLines={1}>
                            {formatDateTime(item.issueAt || item.createdAt)}
                          </Text>
                        </View>
                      );
                    })}

                    {filteredDocuments.length === 0 && (
                      <View style={styles.emptyTableRow}>
                        <Text style={styles.emptyText}>Không có dữ liệu tài liệu.</Text>
                      </View>
                    )}
                  </View>
                </ScrollView>

                {showTableSwipeHint && filteredDocuments.length > 0 && (
                  <View pointerEvents="none" style={styles.tableRightFade} />
                )}
              </View>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Thống kê theo tháng {monthLabel}</Text>
              <Text style={styles.sectionSubTitle}>{periodLabel}</Text>

              {chartData.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <BarChart
                    data={chartData}
                    barWidth={isIncomingOnly || isOutgoingOnly ? 10 : 9}
                    spacing={8}
                    hideRules={false}
                    noOfSections={chartAxisScale.sections}
                    stepValue={chartAxisScale.stepValue}
                    maxValue={chartAxisScale.maxValue}
                    xAxisColor="#D1D5DB"
                    yAxisColor="#D1D5DB"
                    rulesColor="#DADDE3"
                    rulesType="dashed"
                    dashWidth={4}
                    dashGap={6}
                    showVerticalLines
                    verticalLinesColor="#EEEEEE"
                    verticalLinesThickness={1}
                    yAxisTextStyle={styles.chartAxisText}
                    xAxisLabelTextStyle={styles.chartLabelText}
                    yAxisLabelWidth={36}
                    xAxisTextNumberOfLines={1}
                    xAxisLabelsHeight={24}
                    labelsExtraHeight={8}
                    initialSpacing={8}
                    width={chartRenderWidth}
                    formatYLabel={(label: string) => `${Math.round(Number(label) || 0)}`}
                  />
                </ScrollView>
              ) : (
                <Text style={styles.emptyText}>Chưa có dữ liệu biểu đồ.</Text>
              )}

              <View style={styles.legendRow}>
                {!isOutgoingOnly && (
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, {backgroundColor: '#4CAF50'}]} />
                    <Text style={[styles.legendText, {color: '#4CAF50'}]}>Văn bản đến</Text>
                  </View>
                )}
                {!isIncomingOnly && (
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, {backgroundColor: '#FF9800'}]} />
                    <Text style={[styles.legendText, {color: '#FF9800'}]}>Văn bản đi</Text>
                  </View>
                )}
              </View>
            </View>

            <PieSummaryCard
              title="Trạng thái lưu sổ (lưu trữ) văn bản"
              desc="Phân bố văn bản theo trạng thái chưa và đã lưu sổ"
              data={archivePieData}
            />

            <PieSummaryCard
              title="Trạng thái văn bản"
              desc="Phân bố văn bản theo trạng thái phát hành và lưu trữ"
              data={statusPieData}
            />

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Thống kê theo bộ phận</Text>
              <Text style={styles.sectionSubTitle}>
                Số lượng và tỉ lệ % văn bản trình ký đi và nhận của các phòng ban
              </Text>

              {(statisticData?.departmentStatistics || []).length === 0 ? (
                <Text style={styles.emptyText}>Chưa có dữ liệu bộ phận.</Text>
              ) : (
                (statisticData?.departmentStatistics || []).map(item => (
                  <View key={item.departmentName} style={styles.departmentItem}>
                    <View style={styles.departmentTitleRow}>
                      <Text style={styles.departmentName}>{item.departmentName}</Text>
                      <Text style={styles.departmentValue}>
                        {item.totalDocuments} văn bản ({item.percentage}%)
                      </Text>
                    </View>
                    <View style={styles.progressTrack}>
                      <View
                        style={[
                          styles.progressFill,
                          {width: `${Math.max(4, Math.min(100, item.percentage))}%`},
                        ]}
                      />
                    </View>
                  </View>
                ))
              )}
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Thống kê lưu trữ theo thư mục</Text>
              <Text style={styles.sectionSubTitle}>Phân tích số lượng văn bản lưu trữ trong các thư mục</Text>

              {!isIncomingOnly && (
                <View style={styles.folderCardOutgoing}>
                  <View style={styles.folderHeader}>
                    <View style={styles.folderIconWrapOutgoing}>
                      <View style={styles.directionGlyphWrap}>
                        <MaterialCommunityIcons name="folder-outline" size={20} color="#FB9A06" />
                        <MaterialCommunityIcons
                          name="arrow-right"
                          size={9}
                          color="#FB9A06"
                          style={styles.directionArrow}
                        />
                      </View>
                    </View>
                    <Text style={styles.folderTitleOutgoing}>Văn bản đi</Text>
                  </View>
                  <View style={styles.folderBody}>
                    <Text style={styles.folderTotal}>{outgoingTotal} văn bản</Text>
                    {outgoingFolderStats.map(item => (
                      <View key={`out-${item.folderName}`} style={styles.folderRow}>
                        <Text style={styles.folderName}>{item.folderName}</Text>
                        <Text style={styles.folderCount}>{item.outgoing}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {!isOutgoingOnly && (
                <View style={styles.folderCardIncoming}>
                  <View style={styles.folderHeader}>
                    <View style={styles.folderIconWrapIncoming}>
                      <View style={styles.directionGlyphWrap}>
                        <MaterialCommunityIcons name="folder-outline" size={20} color="#4CB45A" />
                        <MaterialCommunityIcons
                          name="arrow-left"
                          size={9}
                          color="#4CB45A"
                          style={styles.directionArrow}
                        />
                      </View>
                    </View>
                    <Text style={styles.folderTitleIncoming}>Văn bản đến</Text>
                  </View>
                  <View style={styles.folderBody}>
                    <Text style={styles.folderTotal}>{incomingTotal} văn bản</Text>
                    {incomingFolderStats.map(item => (
                      <View key={`in-${item.folderName}`} style={styles.folderRow}>
                        <Text style={styles.folderName}>{item.folderName}</Text>
                        <Text style={styles.folderCount}>{item.incoming}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {docType === EDocumentType.ALL && (
                <View style={styles.conclusionCard}>
                  <Text style={styles.conclusionTitle}>Kết luận thống kê lưu trữ</Text>
                  <Text style={styles.conclusionMain}>{conclusion.main}</Text>
                  <Text style={styles.conclusionSub}>
                    {conclusion.prefix}
                    <Text style={styles.conclusionDiff}>{conclusion.diff}</Text>
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          onChange={(event, value) => {
            setShowStartPicker(false);
            if (event.type === 'dismissed' || !value) {
              return;
            }
            setPreset('CUSTOM');
            setStartDate(value);
            if (value > endDate) {
              setEndDate(value);
            }
          }}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          onChange={(event, value) => {
            setShowEndPicker(false);
            if (event.type === 'dismissed' || !value) {
              return;
            }
            setPreset('CUSTOM');
            setEndDate(value);
            if (value < startDate) {
              setStartDate(value);
            }
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#EFEFEF'},
  headerRow: {
    height: 48,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6',
  },
  headerTitle: {fontSize: 16, fontWeight: '700', color: '#1F1F1F'},
  headerSpacer: {width: 22},
  scrollContent: {padding: 10, paddingBottom: 20, gap: 10},
  summaryWrap: {paddingHorizontal: 4, paddingTop: 4},
  summaryTitle: {fontSize: 30, fontWeight: '700', color: '#161616'},
  summaryDesc: {marginTop: 2, fontSize: 14, color: '#8B8B8B', lineHeight: 20},
  summaryHint: {marginTop: 2, fontSize: 14, color: '#3A8EEF', fontWeight: '500'},
  filterBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterHeader: {flexDirection: 'row', alignItems: 'center', marginBottom: 8},
  filterHeaderText: {marginLeft: 8, flex: 1},
  filterTitle: {fontSize: 18, fontWeight: '700', color: '#212121'},
  filterSubTitle: {fontSize: 14, color: '#777'},
  fieldWrap: {marginTop: 8},
  fieldLabel: {marginBottom: 6, fontSize: 16, color: '#2F2F2F', fontWeight: '600'},
  selectButton: {
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BEBEBE',
    backgroundColor: '#F7F7F7',
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: {fontSize: 15, color: '#333'},
  fieldRow: {flexDirection: 'row', gap: 8},
  halfField: {flex: 1},
  dropdownBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  dropdownCard: {backgroundColor: '#FFF', borderRadius: 12, paddingVertical: 8},
  dropdownItem: {paddingHorizontal: 12, paddingVertical: 10},
  dropdownItemText: {color: '#222', fontSize: 15},
  dateField: {
    marginTop: 8,
    flex: 1,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BEBEBE',
    backgroundColor: '#F7F7F7',
    paddingHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {fontSize: 15, color: '#333'},
  actionRow: {marginTop: 12, flexDirection: 'row', gap: 10},
  statisticButton: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  statisticButtonText: {color: '#FFF', fontSize: 15, fontWeight: '600'},
  exportButton: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D6D6D6',
    backgroundColor: '#FBFBFB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  exportButtonText: {color: '#7A7A7A', fontSize: 15, fontWeight: '500'},
  loadingWrap: {paddingVertical: 30, alignItems: 'center', gap: 8},
  loadingText: {color: '#666'},
  counterRow: {flexDirection: 'row', gap: 10},
  counterCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    paddingVertical: 14,
    alignItems: 'center',
  },
  singleCounterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    paddingVertical: 14,
    alignItems: 'center',
  },
  counterTitle: {fontSize: 16, color: '#2C2C2C', fontWeight: '600'},
  counterValue: {marginTop: 6, fontSize: 42, fontWeight: '700'},
  statusGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 10},
  statusCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  statusTitle: {color: '#252525', fontSize: 15, fontWeight: '600'},
  statusValueRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusValue: {fontSize: 44, color: '#1F1F1F', fontWeight: '700'},
  statusHint: {marginTop: -2, color: '#747474', fontStyle: 'italic'},
  statusIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E2E2',
    borderRadius: 12,
    padding: 12,
  },
  sectionTitle: {fontSize: 16, fontWeight: '700', color: '#1F1F1F'},
  sectionSubTitle: {
    marginTop: 2,
    color: '#7B7B7B',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  documentListCard: {
    backgroundColor: '#F7F7F7',
    overflow: 'hidden',
  },
  tableHintRow: {
    marginTop: -2,
    marginBottom: 8,
  },
  tableHintBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECECEC',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  tableHintText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  tableWrap: {
    position: 'relative',
    marginHorizontal: -12,
    marginBottom: -12,
  },
  tableContent: {
    paddingBottom: 2,
  },
  tableRightFade: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 30,
    backgroundColor: '#F7F7F7D9',
    borderLeftWidth: 1,
    borderLeftColor: '#EEEEEE',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#D9D9D9',
    backgroundColor: '#E4E4E4',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  tableHeadText: {fontSize: 15, color: '#777777', fontWeight: '500'},
  tableCellText: {fontSize: 15, color: '#2A2A2A'},
  centerCell: {alignItems: 'center', justifyContent: 'center'},
  colCode: {width: 154, paddingHorizontal: 12},
  colType: {width: 130, paddingHorizontal: 12},
  colDoc: {width: 290, paddingHorizontal: 12},
  colDirection: {width: 98, paddingHorizontal: 12},
  colPriority: {width: 122, paddingHorizontal: 12},
  colStatus: {width: 140, paddingHorizontal: 12},
  colDate: {width: 170, paddingHorizontal: 12},
  directionBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  directionOutgoing: {backgroundColor: '#F7E2C1'},
  directionIncoming: {backgroundColor: '#C6E6CB'},
  directionGlyphWrap: {width: 22, height: 22, alignItems: 'center', justifyContent: 'center'},
  directionArrow: {position: 'absolute', top: 8},
  pill: {paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6},
  pillText: {fontSize: 12, fontWeight: '600'},
  emptyTableRow: {paddingVertical: 18, alignItems: 'center', backgroundColor: '#FFFFFF'},
  legendRow: {marginTop: 6, flexDirection: 'row', justifyContent: 'center', gap: 20},
  legendItem: {flexDirection: 'row', alignItems: 'center', gap: 6},
  legendDot: {width: 10, height: 10, borderRadius: 5},
  legendText: {fontSize: 14, fontWeight: '500'},
  chartAxisText: {color: '#616161', fontSize: 11},
  chartLabelText: {color: '#666', fontSize: 10},
  pieWrap: {height: 250, alignItems: 'center', justifyContent: 'center', position: 'relative'},
  departmentItem: {marginBottom: 12},
  departmentTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 8,
  },
  departmentName: {fontSize: 15, fontWeight: '600', color: '#202020', flex: 1},
  departmentValue: {fontSize: 14, color: '#4B4B4B'},
  progressTrack: {height: 10, borderRadius: 5, backgroundColor: '#D5D5D5'},
  progressFill: {height: '100%', borderRadius: 5, backgroundColor: '#2F9CF4'},
  folderCardIncoming: {
    borderWidth: 1,
    borderColor: '#60B769',
    backgroundColor: '#E6F6E7',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  folderCardOutgoing: {
    borderWidth: 1,
    borderColor: '#FF9F1C',
    backgroundColor: '#FFF2DF',
    borderRadius: 12,
    padding: 12,
  },
  folderHeader: {flexDirection: 'row', alignItems: 'center', gap: 10},
  folderIconWrapOutgoing: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F8DDAF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  folderIconWrapIncoming: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#BFE6C4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  folderTitleIncoming: {color: '#3FA950', fontSize: 16, fontWeight: '700'},
  folderTitleOutgoing: {color: '#FB9A06', fontSize: 16, fontWeight: '700'},
  folderBody: {marginLeft: 54, marginTop: 4},
  folderTotal: {fontSize: 50, fontWeight: '700', color: '#1B1B1B', marginBottom: 8},
  folderRow: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6},
  folderName: {fontSize: 14, color: '#2F2F2F', flex: 1},
  folderCount: {fontSize: 14, fontWeight: '700', color: '#1E1E1E'},
  emptyFolderText: {fontSize: 14, color: '#666'},
  conclusionCard: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#6DAAF5',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#F8FCFF',
    alignItems: 'center',
  },
  conclusionTitle: {fontSize: 16, fontWeight: '700', color: '#2B2B2B'},
  conclusionMain: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: '700',
    color: '#1D75D1',
    textAlign: 'center',
  },
  conclusionSub: {
    marginTop: 6,
    fontSize: 14,
    color: '#4F4F4F',
    textAlign: 'center',
  },
  conclusionDiff: {color: '#E6463A', fontWeight: '700'},
  emptyText: {color: '#878787', textAlign: 'center', paddingVertical: 16},
});
