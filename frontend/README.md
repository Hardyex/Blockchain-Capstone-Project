# 💎 OCFP - One Capital Four Profits | Blockchain Saving Frontend

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vitejs.dev/)
[![Wagmi](https://img.shields.io/badge/Wagmi-3-blue)](https://wagmi.sh/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

A premium, production-grade decentralized finance (DeFi) interface designed for high-yield blockchain savings. This frontend provides a cinematic "Neon-Noir" experience for users to manage their digital assets through NFT-based saving certificates.

---

## 🎯 Project Overview

**OCFP (One Capital Four Profits)** is a high-performance dApp serving as the gateway to a decentralized savings ecosystem. It abstracts the complexity of smart contract interactions into a sleek, real-time dashboard.

- **Primary Role**: Interface for retail investors and system administrators.
- **Protocol Integration**: Seamless connection with `SavingCore` (NFT Logic), `VaultManager` (Liquidity), and `MockUSDC` (Assets).
- **Core Value**: Time-restricted USDC deposits represented by non-fungible tokens, enabling automated interest accrual and secure principal protection.

---

## 🛠️ Installation & Setup

Follow these steps to get the development environment running locally:

### 1. Prerequisites
- Node.js (v18+ recommended)
- A Web3 Wallet (MetaMask, Rainbow, etc.)

### 2. Clone and Install
```bash
# Clone the repository
git clone <repository-url>
cd saving-frontend

# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
VITE_WALLET_CONNECT_PROJECT_ID=your_project_id_here
VITE_CHAIN_ID=11155111
VITE_SAVING_CORE_ADDRESS=0x...
VITE_VAULT_MANAGER_ADDRESS=0x...
VITE_USDC_ADDRESS=0x...
```

### 4. Development & Build
```bash
# Run local development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## ▶️ Running the Application

1. **Connect Wallet**: Connect your Web3 wallet via RainbowKit.
2. **Switch Network**: Switch to the Sepolia test network.
3. **Ensure Balance**: Ensure your wallet has:
   - **Sepolia ETH**: To pay for transaction gas.
   - **MockUSDC**: To fund your deposits.
4. **Interact**: Browse and interact with the saving plans.

---

## 🔗 Contract Integration

The frontend is architected as a state-aware layer that interacts directly with the OCFP protocol. To ensure seamless operation across different environments (Local, Staging, Production), contract addresses are managed through a robust environment variable system.

### Dynamic Address Injection
The application depends on deployed smart contracts. For production and staging deployments, contract addresses are injected via environment variables. This ensures that the frontend remains decoupled from specific deployment instances and can be easily updated or migrated.

```env
# Mandatory for Production/Staging Deployments
VITE_SAVING_CORE_ADDRESS=0xf7b2ABDED47a34c436372423344d0d0D6AB755a1
VITE_VAULT_MANAGER_ADDRESS=0x9bB8a91492927fa4b7Db7Fd799eeF3d2918dc294
VITE_USDC_ADDRESS=0x578883cf1d9cD74bEa3167EF6Bd14fC5682E30D7
```

> [!IMPORTANT]
> The addresses defined in the environment **MUST** exactly match the deployment addresses from the backend. Mismatched addresses will result in failed transaction signatures or incorrect data being displayed.

---

## 🧱 Tech Stack

- **React 19 & Vite 8**: Chosen for optimal HMR performance and modern hook-based architecture.
- **wagmi 3 & viem 2**: Industry-standard stack for type-safe contract interactions and robust wallet state management.
- **RainbowKit 2**: Premium wallet connection UI with multi-chain support and personalized profiles.
- **TailwindCSS 3**: Powering the custom **Neon-Noir** design system with cinematic gradients and glassmorphism effects.

---

## 🏗️ Core Engineering Patterns

### 1. The "Approve-Execute" Atomic Flow
To eliminate the UX friction inherent in ERC20 interactions, the app implements an automated two-step sequence:
- **Pre-flight Check**: The UI verifies current allowance before prompting any action.
- **Sequential Signing**: If allowance is insufficient, it triggers `approve()` then automatically queues the `openDeposit()` call upon receipt confirmation.
- **Status Mapping**: Real-time feedback for each lifecycle stage (Awaiting Approval → Confirming → Executing → Success).

### 2. High-Efficiency Data Fetching (Multicall)
The dApp leverages `useReadContracts` to batch multiple RPC requests into a single network round-trip. This:
- Reduces the load on public RPC nodes (Infura/Alchemy).
- Ensures atomic data consistency (all values correspond to the same block height).
- Drastically improves initial load times for users with multiple active saving books.

### 3. Reactive Portfolio Tracking
Accrued interest is calculated on-chain but visualized via a high-performance polling strategy. By fetching interest every 5 seconds, we provide a "live profit ticker" that enhances user engagement while maintaining RPC request limits.

---

## 🔄 Transaction Lifecycle (UI)

- **Idle**: Awaits user action (e.g., clicking deposit).
- **Signing**: Triggers wallet popup for signature approval.
- **Pending**: Broadcasts transaction to the network. The UI actively **disables actions** and buttons to **prevent duplicate transactions**.
- **Confirmed**: Transaction is securely included in a block.
- **Success**: The UI executes a background refetch to update local state (balances, NFTs).
- **Error**: Catches failure and displays a localized error message to the user.

---

## ❌ Web3 Edge Cases & Failure Handling

- **User rejects transaction (Error 4001)**: User cancels action in their wallet. The UI gracefully resets to the idle state.
- **Insufficient gas balance**: Wallet lacks ETH for transaction fees. The UI/wallet blocks the transaction and prompts the user.
- **Wrong network selected**: User is connected to an unsupported chain. RainbowKit enforces a network switch prompt before any interaction.
- **Contract revert (invalid state)**: The contract rejects the transaction. The UI parses the revert data and displays an error toast.
- **Pending transaction delays**: Network congestion causes long confirmation times. The UI maintains a locked loading state to prevent double-spending attempts.

---

## 🛡️ Production Optimization & Security

### 1. BigInt Safety & Precision
All financial calculations use native `BigInt` (via `viem`) to prevent floating-point errors common in DeFi. Precision is maintained at 6 decimals (USDC standard) throughout the data pipeline.

### 2. Global Exception Handling
- **User Rejection**: Gracefully handles `User Rejected Request` (Error 4001) without breaking the UI state.
- **Network Guards**: Automatically prompts the user to switch networks if they connect to an unsupported chain.
- **Insufficient Liquidity**: Admin dashboard proactively checks Vault balance before allowing withdrawal attempts.

### 3. Gas Awareness
The UI estimates gas limits before transaction submission, preventing users from attempting transactions that would likely fail (e.g., during high network congestion or insufficient balance).

---

## 🎨 UI / UX Excellence

- **Procedural NFT Art**: Each "Saving Book" card features a unique gradient generated from its `tokenId`, ensuring every user's certificate feels distinct and personal.
- **Glassmorphic Aesthetic**: Deep blue-black backgrounds (`#020617`) paired with neon-accented borders and ambient glows create a high-end "Institutional-grade" feel.
- **Accessibility**: High-contrast ratios and clear semantic headers ensure the application remains readable for all users.

---

## 📊 State Management

- **External State**: The blockchain serves as the single source of truth.
- **Server-State (TanStack Query)**: Manages caching, background refetching, and transaction persistence.
- **UI-State**: Atomic `useState` management for modals, tab filtering, and admin form inputs.

---

## 🧪 Testing & Quality Assurance

Ensuring the reliability of financial interactions is paramount. The frontend employs a multi-layered testing strategy:

### 1. Component & Hook Testing
- **Unit Tests**: Critical logic such as APR calculations, tenor formatting, and status badge logic are verified using **Vitest**.
- **Hook Isolation**: Custom hooks like `usePlan` are tested in isolation to ensure correct state transitions during contract reads.

### 2. Integration Simulation
- **Local Forking**: For complex UI flows, we recommend using a local Hardhat fork to simulate real-world contract states without incurring gas costs.
- **Wallet Mocking**: Testing connection states and transaction rejections to ensure graceful error handling.

---

## 🚀 Deployment Strategy

### Environment Mapping
| Environment | Network | RPC Provider |
| :--- | :--- | :--- |
| **Development** | Hardhat (31337) | `http://127.0.0.1:8545` |
| **Staging** | Sepolia (11155111) | Alchemy / Infura |
| **Production** | Ethereum / L2 | Managed RPC Gateway |

### Production Build
The application is optimized for deployment on decentralized hosting platforms like **IPFS** or managed services like **Vercel**.
```bash
npm run build
```
This generates a highly compressed, tree-shaken production bundle located in the `dist/` directory.

---

## 📂 Project Structure

```text
src/
 ├── abis/              # EVM Contract ABIs (SavingCore, VaultManager, USDC)
 ├── components/        # Atomic UI units
 │    ├── DepositForm   # Approval + Open Deposit logic
 │    ├── SavingPlans   # Plan grid & metadata display
 │    ├── UserDashboard # NFT gallery & real-time profit tracking
 │    └── VaultAdmin    # System governance & liquidity tools
 ├── constants/         # Multi-network address mapping & ABI exports
 ├── hooks/             # Custom Web3 hooks & business logic
 ├── assets/            # Branding & static media
 ├── wagmi.js           # RainbowKit, Provider & Chain configuration
 └── index.css          # Tailwind base & cinematic styling tokens
```

---