import SCREEN_INFO from '@/config/SCREEN_CONFIG/screenInfo';
import images from '@/assets/images';
import { EOrganization } from '@/shared-types/common/Permissions/Permissions';

export type HomeMenuItem = {
  function: string;
  key: string;
  label: string;
  buttonImage: any;
  navigateTo: string;
  navigateNext?: string;
  category: 'production' | 'office';
  badgeCount?: number;
};

export const HOME_MENU_ITEMS: HomeMenuItem[] = [
  {
    function: 'GARDEN',
    key: 'gardenForWorker',
    label: 'Thông tin khu vườn',
    buttonImage: images.garden,
    navigateTo: SCREEN_INFO.GARDENINFOWORKER.key,
    navigateNext: SCREEN_INFO.GARDENWORKER.key,
    category: 'production',
  },
  {
    function: '',
    key: 'gardenDeclareForWorker',
    label: 'Lịch sử quy trình',
    buttonImage: images.gardener,
    navigateTo: SCREEN_INFO.GARDENINFOWORKER1.key,
    navigateNext: SCREEN_INFO.GARDENDECLAREWORKER.key,
    category: 'production',
  },
  {
    function: 'GARDEN',
    key: 'gardenInfo',
    label: 'Thông tin khu vườn',
    buttonImage: images.garden,
    navigateTo: SCREEN_INFO.GARDENINFO.key,
    category: 'production',
  },
  {
    function: 'EMPLOYEES',
    key: 'unit',
    label: 'Nhân sự',
    buttonImage: images.workers,
    navigateTo: SCREEN_INFO.UNIT.key,
    category: 'production',
  },
  {
    function: 'EMPLOYEES',
    key: 'employee',
    label: 'Nhân sự',
    buttonImage: images.workers,
    navigateTo: SCREEN_INFO.WORKER.key,
    category: 'production',
  },
  {
    function: 'SCHEDULE',
    key: 'workschedule',
    label: 'Lịch sử quy trình',
    buttonImage: images.toDoList,
    navigateTo: SCREEN_INFO.WORKSCHEDULE.key,
    category: 'production',
  },
  {
    function: 'STATISTIC',
    key: 'statistic',
    label: 'Báo cáo thống kê',
    buttonImage: images.pieChart,
    navigateTo: SCREEN_INFO.STATISTIC.key,
    category: 'production',
  },
  {
    function: '',
    key: 'browseaddmaterial',
    label: 'Duyệt đầu tư tăng thêm',
    buttonImage: images.approve,
    navigateTo: SCREEN_INFO.BROWSEADDMATERIALS.key,
    category: 'production',
  },
  {
    function: '',
    key: 'browseharvest',
    label: 'Duyệt thu hoạch',
    buttonImage: images.approveHarvest,
    navigateTo: SCREEN_INFO.BROWSE_HARVEST.key,
    category: 'production',
  },
  {
    function: '',
    key: 'harvest',
    label: 'Thu hoạch',
    buttonImage: images.approveHarvest,
    navigateTo: SCREEN_INFO.HARVEST.key,
    category: 'production',
  },
  {
    function: '',
    key: 'harvestschedule',
    label: 'Quy trình thu hoạch',
    buttonImage: images.harvestSchedule,
    navigateTo: SCREEN_INFO.HARVEST_SCHEDULE.key,
    category: 'production',
  },
  {
    function: 'FEEDBACK',
    key: 'feedback',
    label: 'Góp ý',
    buttonImage: images.feedBack,
    navigateTo: SCREEN_INFO.FEEDBACK.key,
    category: 'production',
  },
  {
    function: 'DOCUMENT',
    key: 'outgoingDocument',
    label: 'Văn bản đi',
    buttonImage: images.outgoingDocuments,
    navigateTo: SCREEN_INFO.DOCUMENT.key,
    category: 'office',
  },
  {
    function: 'DOCUMENT',
    key: 'incomingDocument',
    label: 'Văn bản đến',
    buttonImage: images.incomingDocuments,
    navigateTo: SCREEN_INFO.DOCUMENT.key,
    category: 'office',
  },
  {
    function: 'DOCUMENT',
    key: 'documentManagement',
    label: 'Quản lý hồ sơ',
    buttonImage: images.folderManagement,
    navigateTo: SCREEN_INFO.DOCUMENTCATEGORYMANAGER.key,
    category: 'office',
  },
  {
    function: 'DOCUMENT',
    key: 'documentStatistic',
    label: 'Thống kê tài liệu',
    buttonImage: images.documentStatistic,
    navigateTo: SCREEN_INFO.DOCUMENT.key,
    category: 'office',
  },
  {
    function: '',
    key: 'news',
    label: 'Tin tức',
    buttonImage: images.megaphone,
    navigateTo: SCREEN_INFO.NEWS.key,
    category: 'production',
  },
];

export const filterMenuByRole = (userInfo: any) => {
  const role = userInfo?.userType?.level;
  const functions = userInfo?.functions || [];

  const hasAccessToFunction = (functionKey: string) => {
    if (functionKey === 'DOCUMENT') return true;
    if (!functionKey) return true;

    return functions.some(
      (func: any) =>
        (func._id === functionKey && func.access) ||
        (func._id === functionKey.split('_')[0] && func.access),
    );
  };

  let filteredMenu: HomeMenuItem[] = [];

  if (role === EOrganization.MANAGEMENT || role === EOrganization.DEPARTMENT) {
    filteredMenu = HOME_MENU_ITEMS.filter(
      item =>
        item.key !== 'gardenForWorker' &&
        item.key !== 'gardenDeclareForWorker' &&
        item.key !== 'unit' &&
        item.key !== 'browseaddmaterial' &&
        item.key !== 'browseharvest' &&
        item.key !== 'harvest',
    );

    return filteredMenu.filter(item => hasAccessToFunction(item.function));
  }

  if (role === EOrganization.LEADER) {
    filteredMenu = HOME_MENU_ITEMS.filter(item => {
      const excludeKeys =
        item.key !== 'gardenForWorker' &&
        item.key !== 'gardenDeclareForWorker' &&
        item.key !== 'employee' &&
        item.key !== 'harvest';

      const excludeStatistic = userInfo.groupId === '' ? item.key !== 'statistic' : true;

      return excludeKeys && excludeStatistic;
    });

    return filteredMenu.filter(item => hasAccessToFunction(item.function));
  }

  if (role === EOrganization.WORKER) {
    filteredMenu = HOME_MENU_ITEMS.filter(
      item =>
        item.key !== 'unit' &&
        item.key !== 'employee' &&
        item.key !== 'gardenInfo' &&
        item.key !== 'browseaddmaterial' &&
        item.key !== 'browseharvest' &&
        item.key !== 'harvestschedule' &&
        item.key !== 'outgoingDocument' &&
        item.key !== 'incomingDocument' &&
        item.key !== 'documentManagement' &&
        item.key !== 'documentStatistic',
    );

    return filteredMenu.filter(item => hasAccessToFunction(item.function));
  }

  return HOME_MENU_ITEMS.filter(item => hasAccessToFunction(item.function));
};
