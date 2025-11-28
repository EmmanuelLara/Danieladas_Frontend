const API_URL = "http://192.168.1.72:4000";

const api = axios.create({
    baseURL: `${API_URL}/api`
});

// 👉 Interceptor para enviar token automáticamente
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});
