import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Import necessary libraries
import { WagmiProvider } from 'wagmi'
import { config } from './wagmi' // The config file you just wrote
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {/* darkTheme() helps keep the interface in sync with your Neon-noir style */}
        <RainbowKitProvider theme={darkTheme({
          accentColor: '#9d00ff', // Change Connect Button color to Neon Purple
          accentColorForeground: 'white',
          borderRadius: 'large',
          fontStack: 'system',
        })}> 
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
)