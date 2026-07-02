import React from 'react'
import ReactDOM from 'react-dom/client'
import { PrivyProvider } from "@privy-io/react-auth"
import { testnetBradbury } from "genlayer-js/chains"
import App from './App.tsx'
import { PRIVY_APP_ID } from './lib/config'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        defaultChain: testnetBradbury,
        supportedChains: [testnetBradbury],
        appearance: {
          theme: "dark",
          accentColor: "#9d4edd",
          logo: undefined,
          walletList: ["metamask", "wallet_connect", "rabby_wallet", "coinbase_wallet"],
        },
        embeddedWallets: { ethereum: { createOnLogin: "users-without-wallets" } },
      }}
    >
      <App />
    </PrivyProvider>
  </React.StrictMode>,
)
