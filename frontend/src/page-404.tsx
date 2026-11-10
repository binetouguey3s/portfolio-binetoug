import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import Page404 from './sections/Page404'

const racine = document.getElementById('root')
if (!racine) throw new Error('Élément #root introuvable dans 404.html')

createRoot(racine).render(
  <StrictMode>
    <Page404 />
  </StrictMode>,
)
