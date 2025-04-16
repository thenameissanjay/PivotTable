import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import App from './App.jsx'
import { CsvContext, CsvProvider } from './Context/Context';


createRoot(document.getElementById('root')).render(
  <StrictMode>
 <CsvProvider>
     <App />
   </CsvProvider>
  </StrictMode>,
)
