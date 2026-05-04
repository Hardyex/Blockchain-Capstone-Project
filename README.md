<h1 align="center">💎 OCFP: One Capital - Four Profits</h1>
<p align="center">
  <i>Next-Gen Decentralized Yield Engine & Liquid Deposit NFTs</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-ff69b4?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Solidity-0.8.24-9b59b6?style=for-the-badge&logo=solidity" />
  <img src="https://img.shields.io/badge/Hardhat-Project-ff69b4?style=for-the-badge&logo=hardhat" />
  <br />
  <img src="https://img.shields.io/badge/License-MIT-9b59b6?style=flat-square" />
  <img src="https://img.shields.io/badge/Coverage-100%25-ff69b4?style=flat-square" />
  <img src="https://img.shields.io/badge/Network-Sepolia-9b59b6?style=flat-square" />
</p>

---

## 🏗️ System Architecture

**OCFP** is a decentralized term-deposit protocol that transforms traditional savings into high-yield, liquid NFT assets. Built with a **Neon-Noir** aesthetic, it combines DeFi yield strategies with ERC721 certificate tokens.

The project is architected as a decoupled mono-repo:

- **`/backend`**: Hardhat environment containing Solidity smart contracts, automated test suites, and deployment scripts for Sepolia/Mainnet.
- **`/frontend`**: React 19 + Vite 8 application utilizing Wagmi 3 and RainbowKit for a seamless, type-safe Web3 user experience.

---

## 🛠️ Tech Stack

### ⚡ Smart Contracts (Blockchain)
- **Solidity ^0.8.24**: Core logic with custom errors and optimized gas usage.
- **OpenZeppelin**: Industry-standard implementations for `ERC20`, `ERC721`, and `Ownable` security.
- **Hardhat**: Development framework for compilation, testing, and deployment.

### 🎨 Application (Frontend)
- **React 19**: Modern UI component architecture.
- **Wagmi 3 & Viem 2**: Type-safe hooks for contract interaction and state management.
- **RainbowKit 2**: Premium wallet connection management.
- **TailwindCSS**: Powering the custom **Neon-Noir** design system.

---

## 📂 Project Structure

```text
.
├── backend/                # Hardhat Project
│   ├── contracts/          # SavingCore, VaultManager, MockUSDC
│   ├── scripts/            # Deployment & Local Demo scripts
│   └── test/               # Comprehensive Test suite
├── frontend/               # React Project
│   ├── src/
│   │   ├── abis/           # Synced Contract ABIs
│   │   ├── components/     # UI Design System
│   │   └── constants/      # Multi-network addresses
│   └── public/             # Static Assets
└── README.md               # Project Documentation (Root)
```

---

## 🔗 Smart Contract Summary

1. **`SavingCore.sol`**: The engine of the protocol. Handles deposit logic, NFT minting, and interest calculation.
2. **`VaultManager.sol`**: Manages the protocol's liquidity pool, fee structures, and administrative funding.
3. **`MockUSDC.sol`**: An ERC20 test token used to simulate real-world value on testnets.

### 🛡️ Quality Assurance (Testing)
- **Unit Tests**: 100% coverage achieved for `SavingCore` and `VaultManager` logic.
- **Security**: Architected using OpenZeppelin standards; strictly verified against Reentrancy and Overflow vulnerabilities.

---

## 🚀 Quick Start (Local Development)

### 1. Setup Backend
```bash
# Navigate to backend directory
cd backend

# Install project dependencies
npm install

# Start a local Hardhat node
npx hardhat node
```

### 2. Deploy & Seed Data (New Terminal)
```bash
# Deploy contracts and seed sample data to local node
cd backend
npx hardhat run scripts/demo_local.js --network localhost
```

### 3. Setup Frontend
```bash
# Navigate to frontend directory
cd frontend

# Install UI dependencies
npm install

# Start the Vite development server
npm run dev
```

---

## 🌐 Deployment (Sepolia Testnet)

The system is currently deployed on the Sepolia Testnet.

**Latest Contract Addresses (Chain ID: 11155111):**
- **USDC**: `0xFd9d4200Cad64cC0798F9DD72bf1844597492935`
- **VaultManager**: `0xB7927A43BE1e057CA1FC9b5CdF482C09A1b190DE`
- **SavingCore**: `0xea99B62Cb18f7C16a690F1856A07E0AfF96352A1`

---

## 🔄 User Flow (Demo)

1. **Connect Wallet**: Use RainbowKit to connect your wallet (e.g., MetaMask).
2. **Approve USDC**: The UI detects your allowance and prompts an `approve()` transaction.
3. **Open Deposit**: Choose a plan (30, 90, 365 days) and deposit USDC.
4. **Manage NFTs**: View your active deposits as dynamic cards. Monitor real-time interest accrual.
5. **Withdraw/Renew**: At maturity, withdraw your principal + interest, or renew for another cycle.

```mermaid
graph TD
  A[Connect Wallet] --> B[Approve USDC]
  B --> C[Deposit - Mint NFT]
  C --> D[Earn Interest]
  D --> E[Withdraw / Renew]
```

---

## 🛡️ Edge Case Handling

- **Insufficent Gas**: Proactive gas estimation prevents failed transactions.
- **Network Switch**: Automatic detection and prompt to switch to the correct chain (Sepolia/Hardhat).
- **User Rejection**: Graceful UI resets if the user cancels a signature in the wallet.

---

## 🔮 Future Roadmap

- **Governance**: Implementation of a DAO for adjusting APR and Fee parameters.
- **Secondary Market**: Native marketplace for trading matured NFT deposit certificates.
- **Cross-Chain**: Integration with Layer 2s (Arbitrum/Optimism) for lower gas costs.

---

<h2 align="center">📜 License & Contact</h2>

<div align="center">
  <table align="center">
    <tr>
      <td align="center">
        <a href="https://github.com/Hardyex">
          <img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" />
        </a>
      </td>
      <td align="center">
        <a href="mailto:nguyenminhhoang2624@gmail.com">
          <img src="https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white" />
        </a>
      </td>
    </tr>
    <tr>
      <td align="center"><b>@Hardyex</b></td>
      <td align="center"><b>nguyenminhhoang2624@gmail.com</b></td>
    </tr>
  </table>
</div>
