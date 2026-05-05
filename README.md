<h1 align="center">
  <span style="color:#22d3ee;">OCFP: One Capital - Four Profits</span>
</h1>

<p align="center">
  <i style="color:#a5b4fc;">
    Next-Gen Decentralized Yield Engine & Liquid Deposit NFTs
  </i>
</p>

<p align="center">
  <!-- Neon Highlight -->
  <img src="https://img.shields.io/badge/OCFP-Core-111111?style=for-the-badge&logo=ethereum&logoColor=22d3ee" />
  <img src="https://img.shields.io/badge/DeFi-Protocol-111111?style=for-the-badge&logo=chainlink&logoColor=7c3aed" />
  <br /><br />
  <!-- Tech Stack -->
  <img src="https://img.shields.io/badge/React-19-111111?style=for-the-badge&logo=react&logoColor=22d3ee" />
  <img src="https://img.shields.io/badge/Solidity-0.8.24-111111?style=for-the-badge&logo=solidity&logoColor=7c3aed" />
  <img src="https://img.shields.io/badge/Hardhat-2.22.1-111111?style=for-the-badge&logo=hardhat&logoColor=22d3ee" />
  <img src="https://img.shields.io/badge/TailwindCSS-111111?style=for-the-badge&logo=tailwind-css&logoColor=7c3aed" />
  <img src="https://img.shields.io/badge/Vite-Project-111111?style=for-the-badge&logo=vite&logoColor=22d3ee" />
  <br />
  <!-- Status -->
  <img src="https://img.shields.io/badge/Coverage-100%25-111111?style=flat-square&logo=codecov&logoColor=22d3ee" />
  <img src="https://img.shields.io/badge/Network-Sepolia-111111?style=flat-square&logo=ethereum&logoColor=7c3aed" />
  <img src="https://img.shields.io/badge/License-MIT-111111?style=flat-square&logo=open-source-initiative&logoColor=22d3ee" />
  <img src="https://img.shields.io/badge/RainbowKit-2-111111?style=flat-square&logo=rainbowkit&logoColor=7c3aed" />
</p>

---

## 🎯 Project Overview & Vision

The **OCFP (One Capital - Four Profits)** protocol is a decentralized savings system that transforms traditional term-deposits into high-yield, liquid NFT assets. Built with a **Neon-Noir** aesthetic, it combines DeFi yield strategies with ERC721 certificate tokens to provide a transparent, automated alternative to centralized banking.

### 💡 Key Innovations
- **NFT-based Certificates**: Every deposit is represented by a tradeable NFT, enabling liquidity even during lock-up periods.
- **Treasury Isolation**: Dedicated `VaultManager` for interest payouts, ensuring user principal remains isolated and safe.
- **Automated Compounding**: System-triggered auto-renewal for seamless interest reinvestment.

---

## 📂 Project Structure

The project is organized as a unified monorepo to ensure tight integration between the blockchain logic and the user interface.

```text
.
├── smartcontract/          # Main Development Directory
│   ├── contracts/          # Core Logic (SavingCore, VaultManager)
│   ├── scripts/            # Deployment & Demo Automation
│   ├── test/               # Technical Test Suite (>98% Coverage)
│   └── frontend/           # React 19 DApp Interface
│       ├── src/            # Application Logic & UI
│       └── public/         # Static Assets
├── PLAN.md                 # Roadmap & Execution Logs
└── README.md               # Project Hub (This file)
```

> [!NOTE]
> For deep technical documentation regarding the smart contracts, security patterns, and execution flows, please refer to the [Smart Contract README](./smartcontract/README.md).

---

## 🚀 Quick Start (Local Development)

### 1. Initialize Backend & Node
```bash
cd smartcontract
npm install
npx hardhat node
```

### 2. Deploy Local Environment
```bash
# In a new terminal
cd smartcontract
npx hardhat run scripts/demo_local.js --network localhost
```

### 3. Launch Frontend
```bash
cd smartcontract/frontend
npm install
npm run dev
```

---

## 🌐 Deployment (Sepolia Testnet)

**Chain ID: 11155111**
- **USDC**: `0xFd9d4200Cad64cC0798F9DD72bf1844597492935`
- **VaultManager**: `0xB7927A43BE1e057CA1FC9b5CdF482C09A1b190DE`
- **SavingCore**: `0xea99B62Cb18f7C16a690F1856A07E0AfF96352A1`

---

## 🔮 Future Roadmap

- **Governance**: DAO for adjusting protocol parameters (APR, Fees).
- **Secondary Market**: Native marketplace for matured NFT certificates.
- **Cross-Chain**: Layer 2 deployments for reduced gas costs.
- **Automation**: Integrating Chainlink Keepers for full decentralization.

---

<h2 align="center">📜 License & Contact</h2>

<div align="center">
  <table align="center">
    <tr>
      <td align="center">
        <a href="https://github.com/Hardyex">
          <img src="https://img.shields.io/badge/GitHub-111111?style=for-the-badge&logo=github&logoColor=22d3ee" />
        </a>
      </td>
      <td align="center">
        <a href="mailto:nguyenminhhoang2624@gmail.com">
          <img src="https://img.shields.io/badge/Gmail-111111?style=for-the-badge&logo=gmail&logoColor=22d3ee" />
        </a>
      </td>
    </tr>
    <tr>
      <td align="center"><b style="color:#22d3ee;">@Hardyex</b></td>
      <td align="center"><b style="color:#22d3ee;">nguyenminhhoang2624@gmail.com</b></td>
    </tr>
  </table>
</div>
