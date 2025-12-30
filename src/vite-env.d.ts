/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL_DEV: string
    readonly VITE_API_BASE_URL_DEV_NET: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}