/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the CampusEats FastAPI backend. See .env.example. */
  readonly VITE_API_BASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
