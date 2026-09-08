import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './index.css'
import './phone-layout.css'
import App from './App.jsx'
import { needsIosScrollFix, syncPhoneOrientation } from './lib/device'

syncPhoneOrientation()
if (needsIosScrollFix()) {
  document.documentElement.classList.add('is-ios')
}

gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({
  ignoreMobileResize: true,
  autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load',
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)