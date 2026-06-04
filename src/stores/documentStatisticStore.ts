import {create} from 'zustand';
import Snackbar from 'react-native-snackbar';

import axiosClient from '@/utils/axiosClient';
import ENV from '@/config/ENV';
import {EDocumentPriority, EDocumentStatus, EDocumentType} from '@/shared-types/common/Document/document';
import {IStatisticDocumentResponse, IStatisticDocumentViewResponse} from '@/shared-types/Response/StatisticDocumentResponse/StatisticDocumentResponse';
import {IDocumentStatisticFormData} from '@/shared-types/form-data/StatisticDocumentFormData/StatisticDocumentFormData';

type TLoadParams = IDocumentStatisticFormData & {
  type?: EDocumentType;
};

type StatisticDocumentStore = {
  isLoading: boolean;
  statisticData: IStatisticDocumentViewResponse | null;
  getStatisticDocument: (params: TLoadParams) => Promise<IStatisticDocumentViewResponse | null>;
};

const normalizeListResponse = (payload: any) => {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (Array.isArray(payload?.data)) {
    return payload.data;
  }
  if (Array.isArray(payload?.documents)) {
    return payload.documents;
  }
  return [];
};

const normalizeStatusDocuments = (value: any) => {
  if (Array.isArray(value)) {
    return value;
  }

  const archived = Number(value?.archived || 0);
  const published = Number(value?.published || 0);

  return [
    {status: EDocumentStatus.ARCHIVED, count: archived},
    {status: EDocumentStatus.OFFICIAL_PUBLISHED, count: published},
  ];
};

const normalizeDocumentItem = (item: any) => ({
  ...item,
  categoryDocumentName:
    item?.categoryDocumentName ||
    item?.categoryName ||
    (typeof item?.categoryId === 'object' ? item?.categoryId?.name : '') ||
    'Khác',
});

const normalizeStatisticData = (raw: any): IStatisticDocumentViewResponse => {
  const data = raw?.data?.data || raw?.data || raw || {};

  const list = normalizeListResponse(data?.list).map(normalizeDocumentItem);

  const chartData = Array.isArray(data?.chartData)
    ? data.chartData.map((item: any) => ({
        label: String(item?.label || ''),
        incoming: Number(item?.incoming || 0),
        outgoing: Number(item?.outgoing || 0),
      }))
    : [];

  const departmentStatistics = Array.isArray(data?.departmentStatistics)
    ? data.departmentStatistics.map((item: any) => ({
        departmentName: String(item?.departmentName || 'Chưa phân bộ phận'),
        totalDocuments: Number(item?.totalDocuments || 0),
        totalSignedDocuments: Number(item?.totalSignedDocuments || 0),
        percentage: Number(item?.percentage || 0),
      }))
    : [];

  const folderStatistics = Array.isArray(data?.folderStatistics)
    ? data.folderStatistics.map((item: any) => ({
        folderName: String(item?.folderName || 'Khác'),
        incoming: Number(item?.incoming || 0),
        outgoing: Number(item?.outgoing || 0),
      }))
    : [];

  return {
    totalIncoming: Number(data?.totalIncoming || 0),
    totalOutgoing: Number(data?.totalOutgoing || 0),
    statusCounts: {
      signedOutgoing: Number(data?.statusCounts?.signedOutgoing || 0),
      completedIncoming: Number(data?.statusCounts?.completedIncoming || 0),
      processing: Number(data?.statusCounts?.processing || 0),
      rejected: Number(data?.statusCounts?.rejected || 0),
    },
    chartData,
    statusDocuments: normalizeStatusDocuments(data?.statusDocuments),
    archiveStatus: {
      archived: Number(data?.archiveStatus?.archived || 0),
      notArchived: Number(data?.archiveStatus?.notArchived || 0),
    },
    departmentStatistics,
    folderStatistics,
    list,
  };
};

const buildQueryParams = (params: TLoadParams, page: number, rows: number) => ({
  startDate: params.startDate,
  endDate: params.endDate,
  ...(params.type && params.type !== EDocumentType.ALL ? {type: params.type} : {}),
  ...(params.categoryId ? {categoryId: params.categoryId} : {}),
  ...(params.priority ? {priority: params.priority as EDocumentPriority} : {}),
  // Backend statistic API uses pageDocument/rowsDocument for document list pagination.
  pageDocument: page,
  rowsDocument: rows,
});

const fetchStatisticPage = async (params: TLoadParams, page: number, rows: number) => {
  const response = await axiosClient.get(
    `${ENV.BACKEND_URL}/resources/statistics-documents/document`,
    {
      params: buildQueryParams(params, page, rows),
    },
  );

  return normalizeStatisticData(response?.data);
};

const fetchAllStatisticList = async (params: TLoadParams) => {
  const rows = 100;
  const firstPage = await fetchStatisticPage(params, 1, rows);

  const fullList = [...firstPage.list];
  let page = 2;
  let hasMore = firstPage.list.length === rows;
  const maxPages = 100;
  let previousFirstId = firstPage.list[0]?._id;

  while (hasMore && page <= maxPages) {
    const pageData = await fetchStatisticPage(params, page, rows);
    const currentFirstId = pageData.list[0]?._id;

    // Guard against duplicated first-page responses when pagination params are ignored upstream.
    if (currentFirstId && currentFirstId === previousFirstId) {
      break;
    }

    fullList.push(...pageData.list);
    hasMore = pageData.list.length === rows;
    previousFirstId = currentFirstId;
    page += 1;
  }

  const uniqueList = Array.from(
    new Map(fullList.map(item => [item?._id || `${item?.registeredNumber}-${item?.title}`, item])).values(),
  );

  return {
    ...firstPage,
    list: uniqueList,
  };
};

export const useDocumentStatisticStore = create<StatisticDocumentStore>(set => ({
  isLoading: false,
  statisticData: null,

  getStatisticDocument: async params => {
    set({isLoading: true});

    try {
      const data = await fetchAllStatisticList(params);
      set({statisticData: data, isLoading: false});
      return data;
    } catch (error: any) {
      set({isLoading: false});

      Snackbar.show({
        text:
          error?.response?.data?.message ||
          'Không thể tải thống kê tài liệu, vui lòng thử lại.',
        duration: Snackbar.LENGTH_LONG,
      });

      return null;
    }
  },
}));
