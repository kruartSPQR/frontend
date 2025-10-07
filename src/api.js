import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "/api/v1",
});

function getLocalTokens() {
    return {
        accessToken: localStorage.getItem("accessToken"),
        refreshToken: localStorage.getItem("refreshToken"),
    };
}

const publicEndpoints = [
    '/auth/signin',
    '/auth/signup',
    '/auth/token/refresh'
];

let isRefreshing = false;
let refreshSubscribers = [];

function subscribeTokenRefresh(callback) {
    refreshSubscribers.push(callback);
}

function onRefreshed(newAccessToken) {
    const subscribers = [...refreshSubscribers];
    refreshSubscribers = [];
    subscribers.forEach((callback) => callback(newAccessToken));
}

api.interceptors.request.use((config) => {
    const isPublicEndpoint = publicEndpoints.some(endpoint =>
        config.url.includes(endpoint)
    );

    if (!isPublicEndpoint) {
        const { accessToken } = getLocalTokens();
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        const isPublicEndpoint = publicEndpoints.some(endpoint =>
            originalRequest?.url?.includes(endpoint)
        );

        if (isPublicEndpoint) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401) {
            const { refreshToken } = getLocalTokens();

            // Если публичный эндпоинт или уже пробовали — отдаем ошибку сразу
            if (!refreshToken || originalRequest._retry) {
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            if (!isRefreshing) {
                isRefreshing = true;
                try {
                    const res = await axios.post(
                        `${import.meta.env.VITE_API_BASE_URL || "/api/v1"}/auth/token/refresh`,
                        { refreshToken }
                    );
                    const { accessToken, refreshToken: newRefresh } = res.data;
                    localStorage.setItem("accessToken", accessToken);
                    localStorage.setItem("refreshToken", newRefresh);
                    isRefreshing = false;
                    onRefreshed(accessToken);
                } catch (err) {
                    isRefreshing = false;
                    localStorage.clear();
                    window.location.href = "/login";
                    return Promise.reject(err);
                }
            }
            return new Promise((resolve) => {
                subscribeTokenRefresh((newAccessToken) => {
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    resolve(api(originalRequest));
                });
            });
        }

        return Promise.reject(error);
    }
);

export default api;
