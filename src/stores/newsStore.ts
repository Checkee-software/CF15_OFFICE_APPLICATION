import {create} from 'zustand';
import axiosClient from '../utils/axiosClient';
import Snackbar from 'react-native-snackbar';

type NewsItem = {
    _id: string;
    title: string;
    content: string;
    image: string;
    newsType: string;
    createdAt?: string;
};

type NewsState = {
    news: NewsItem[];
    selectedNews: NewsItem | null;
    isLoading: boolean;
    fetchNews: () => Promise<void>;
    fetchNewsDetail: (id: string) => Promise<void>;
};

const backendURL = 'http://cf15officeservice.checkee.vn';

const useNewsStore = create<NewsState>(set => ({
    news: [],
    selectedNews: null,
    isLoading: false,

    fetchNews: async () => {
        set({isLoading: true});
        try {
            const res = await axiosClient.get(`${backendURL}/resources/news`);
            const newsData = res.data?.data || [];
            set({news: newsData});
        } catch (error: any) {
            console.log('FETCH_NEWS_ERROR:', error?.response?.data || error.message);
            Snackbar.show({
                text: 'Không thể tải danh sách tin tức',
                duration: Snackbar.LENGTH_SHORT,
            });
        } finally {
            set({isLoading: false});
        }
    },

    fetchNewsDetail: async (id: string) => {
        set({isLoading: true});
        try {
            const res = await axiosClient.get(`${backendURL}/resources/news/${id}`);
            set({selectedNews: res.data?.data || null});
        } catch (error: any) {
            console.log('FETCH_NEWS_DETAIL_ERROR:', error?.response?.data || error.message);
            Snackbar.show({
                text: 'Không thể tải chi tiết tin tức',
                duration: Snackbar.LENGTH_SHORT,
            });
        } finally {
            set({isLoading: false});
        }
    },
}));

export default useNewsStore;
