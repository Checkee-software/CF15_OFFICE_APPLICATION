import {create} from "zustand";
import axiosClient from "../utils/axiosClient";
import Snackbar from "react-native-snackbar";
import {INews} from "../shared-types/Response/NewsResponse/NewsResponse";
import ENV from "@/config/ENV";

type NewsItem = INews;

type NewsState = {
    news: NewsItem[];
    selectedNews: NewsItem | null;
    isLoading: boolean;
    fetchNews: () => Promise<void>;
    fetchNewsDetail: (id: string) => Promise<void>;
    getFullAvatarUrl: (imagePath?: string) => string;
};

const useNewsStore = create<NewsState>(set => ({
    news: [],
    selectedNews: null,
    isLoading: false,
    getFullAvatarUrl: (imagePath?: string): string => {
        if (!imagePath) {
            return "";
        }

        if (imagePath.startsWith("http")) {
            return imagePath;
        }

        return `${ENV.BACKEND_URL}${imagePath.replace(/\\/g, "/")}`;
    },

    fetchNews: async () => {
        set({isLoading: true});
        try {
            const res = await axiosClient.get(
                `${ENV.BACKEND_URL}/resources/news/collection`,
            );

            set({news: res.data?.data || []});
            console.log(res);
        } catch (error: any) {
            console.log(
                "FETCH_NEWS_ERROR:",
                error?.response?.data || error.message,
            );
            Snackbar.show({
                text: "Không thể tải danh sách tin tức",
                duration: Snackbar.LENGTH_SHORT,
            });
        } finally {
            set({isLoading: false});
        }
    },

    fetchNewsDetail: async (id: string) => {
        set({isLoading: true});
        try {
            const res = await axiosClient.get(
                `${ENV.BACKEND_URL}/resources/news/detail/${id}`,
            );
            set({selectedNews: res.data?.data || null});
        } catch (error: any) {
            console.log(
                "FETCH_NEWS_DETAIL_ERROR:",
                error?.response?.data || error.message,
            );
            Snackbar.show({
                text: "Không thể tải chi tiết tin tức",
                duration: Snackbar.LENGTH_SHORT,
            });
        } finally {
            set({isLoading: false});
        }
    },
}));

export default useNewsStore;
