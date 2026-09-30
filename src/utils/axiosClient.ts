import axios from "axios";
import asyncStorageHelper from "./localStorageHelper/index";

const axiosClient = axios;

axiosClient.interceptors.request.use(async function (config) {
    if (asyncStorageHelper.token) {
        if (config.headers && typeof config.headers.set === "function") {
            config.headers.set("Authorization", asyncStorageHelper.token);
        } else if (config.headers) {
            (config.headers as any).Authorization = asyncStorageHelper.token;
        }
    }

    return config;
});

axiosClient.interceptors.response.use(function (res) {
    if (res.headers["remove-token"] === "all") {
        asyncStorageHelper.token = "";
    }

    if (!res.headers["set-token"]) {
        return res;
    }

    asyncStorageHelper.token = res.headers["set-token"];
    return res;
});

export default axiosClient;
