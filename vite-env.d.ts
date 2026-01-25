/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_ONCHAINKIT_API_KEY: string
    readonly VITE_GIGPAY_NETWORK?: string
    readonly VITE_GIGPAY_CHAIN_ID?: string
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
