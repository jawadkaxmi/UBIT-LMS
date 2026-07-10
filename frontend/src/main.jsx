import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './app.css'   // saara CSS ek hi file mein

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* BrowserRouter — poore app mein page navigation ke liye */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
