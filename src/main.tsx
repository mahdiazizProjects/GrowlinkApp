import React from 'react'
import ReactDOM from 'react-dom/client'
import { configureBackend } from './services/backend'
import App from './App.tsx'
import './index.css'

// Uses the Amplify backend when amplify_outputs.json is present, otherwise local mode.
configureBackend()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
