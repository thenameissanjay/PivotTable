import { createRoot } from 'react-dom/client'
import './App.css'
import App from './App.jsx'
import {  CsvProvider } from './Context/Context';


createRoot(document.getElementById('root')).render(
 <CsvProvider>
     <App />
   </CsvProvider>
)
