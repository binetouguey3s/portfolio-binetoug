/// <reference types="vite/client" />

/** Variables d'environnement du front (fichier frontend/.env.local, ou réglages Vercel) */
interface ImportMetaEnv {
  /** URL de l'API Django, sans « / » final (ex. http://localhost:8000) */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
