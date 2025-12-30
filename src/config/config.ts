interface Config{
    baseURL: string;
}

export const AppConfig: Config = {
    baseURL: import.meta.env.VITE_API_BASE_URL_DEV_NET || "http://localhost:3000/api/v1",
}