import axios from 'axios';
import asyncStorageHelper from './localStorageHelper/index';

const axiosClient = axios;

axiosClient.interceptors.request.use(async function (config) {
    if (!asyncStorageHelper.token) {
        return config;
    }

    return {
        ...config,
        headers: {
            ...config.headers,
            Authorization: asyncStorageHelper.token,
        },
    };
});

axiosClient.interceptors.response.use(function (res) {
    if (res.headers['remove-token'] === 'all') {
        asyncStorageHelper.token = '';
    }

    if (!res.headers['set-token']) {
        return res;
    }

    asyncStorageHelper.token = res.headers['set-token'];
    return res;
});

export default axiosClient;
