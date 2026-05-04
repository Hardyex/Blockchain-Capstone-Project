<h1 align="center">🛸 OCFP: THE MASTER ROADMAP</h1>

<div align="center">

| 🎯 **PROJECT GOAL** | 📅 **TIMELINE** | 🚦 **CURRENT STATUS** |
| :--- | :--- | :--- |
| Production-Grade Backend & High Coverage Test Suite | 28/04 → 06/05 | **🚀 FINAL POLISHING** |

</div>

<p align="center">
  <b>Mission Progress:</b><br>
  <code>[████████████████████░] 100%</code>
</p>

---

# 🗓️ DAY 1 — 28/04 (Setup & Data Architecture)
---

### 🎯 MISSION OBJECTIVES
- [x] **[HIGH]** Khởi tạo project Hardhat & Environment
- [x] **[HIGH]** Cài dependencies: `hardhat`, `ethers`, `openzeppelin`
- [x] **[HIGH]** Cấu trúc thư mục tiêu chuẩn `/contracts`, `/test`
- [x] **[HIGH]** Khởi tạo Blueprint Files: `MockUSDC.sol`, `VaultManager.sol`, `SavingCore.sol`
- [x] **[HIGH]** Thiết kế Data Models: `Plan` & `Deposit` Structs
- [x] **[HIGH]** Định nghĩa `Status` Enums

### ⚠️ SYSTEM RISKS
| Risk Factor | Impact | Mitigation |
| :--- | :--- | :--- |
| **Data Inconsistency** | High | Strict Struct validation |
| **Logic Mismatch** | High | Detailed snapshot mapping |

### ✅ MILESTONES REACHED
- [x] **Compilation Success**
- [x] **Stable Data Models**
- [x] **Comprehensive Enums**

---

# 🗓️ DAY 2 — 29/04 (Tokenomics & Liquidity Vault)
---

### 🎯 MISSION OBJECTIVES
- [x] **[HIGH]** **MockUSDC**: ERC20 standard with 6 decimals
- [x] **[HIGH]** **MockUSDC**: Cấp quyền `mint()` phục vụ testing
- [x] **[HIGH]** **VaultManager**: Quản lý Token Address & Fee Receiver
- [x] **[HIGH]** **VaultManager**: Cơ chế `fundVault()` & `withdrawVault()`
- [x] **[HIGH]** **Security**: Tích hợp `Pausable` bảo vệ thanh khoản

### ⚠️ SYSTEM RISKS
- **Precision Error**: Sai decimals dẫn đến sai lệch 10^6 lần giá trị.
- **Liquidity Leak**: Nguy cơ trộn lẫn quỹ Vault với tiền của người dùng.

### ✅ MILESTONES REACHED
- [x] **Minting Engine Operational**
- [x] **Vault Liquidity Logic Verified**
- [x] **Emergency Stop (Pause) Active**

---

# 🗓️ DAY 3 — 30/04 (Saving Plan Management)
---

### 🎯 MISSION OBJECTIVES
- [x] **[HIGH]** Implement `createPlan()` logic
- [x] **[HIGH]** Cơ chế `updatePlan()` & Dynamic Plan Toggling
- [x] **[HIGH]** Validation Input: APR, Tenor, Min/Max limits
- [x] **[HIGH]** Event Architecture: `PlanCreated`, `PlanUpdated`

### ⚠️ SYSTEM RISKS
- **Legacy Impact**: Thay đổi Plan làm ảnh hưởng đến các Deposit cũ (Backward Compatibility).
- **Invalid Data**: Input không được validate gây tràn số hoặc APR phi thực tế.

### ✅ MILESTONES REACHED
- [x] **Dynamic Plan Engine OK**
- [x] **Legacy Protection Logic Active**
- [x] **Event Monitoring Connected**

---

# 🗓️ DAY 4 — 01/05 (Atomic Deposit & NFT Minting)
---

### 🎯 MISSION OBJECTIVES
- [x] **[HIGH]** Hoàn thiện `openDeposit()` core function
- [x] **[HIGH]** Verification: Plan status, Min/Max thresholds
- [x] **[HIGH]** Token Transfer Flow: User ➔ Protocol
- [x] **[HIGH]** ERC721 Integration: Minting Deposit Certificates
- [x] **[HIGH]** Snapshot Engine: Lưu trữ APR & Penalty tại thời điểm Open

### ⚠️ SYSTEM RISKS
- **Stale APR**: Không snapshot APR dẫn đến tranh chấp khi Plan thay đổi.
- **Clock Drift**: Sai lệch timestamp ảnh hưởng đến ngày đáo hạn.

### ✅ MILESTONES REACHED
- [x] **NFT Minting Pipeline Operational**
- [x] **Deposit Rejection Logic Verified**
- [x] **Accurate Ownership Tracking**

---

# 🗓️ DAY 5 — 02/05 (Maturity & Early Withdrawal)
---

### 🎯 MISSION OBJECTIVES
- [x] **[HIGH]** **Maturity Flow**: Kiểm tra điều kiện đáo hạn
- [x] **[HIGH]** **Yield Engine**: Tính toán Interest chính xác
- [x] **[HIGH]** **Vault Interaction**: Rút lãi từ liquidity pool
- [x] **[HIGH]** **Early Exit**: Tính toán Penalty & chuyển về Fee Receiver
- [x] **[HIGH]** **Security**: Chặn trả Interest khi rút sớm

### ⚠️ SYSTEM RISKS
- **Calculation Bug**: Sai công thức lãi suất gây tổn thất cho protocol.
- **Liquidity Crisis**: Vault thiếu tiền chi trả lãi.
- **Reentrancy**: Nguy cơ Double Withdraw.

### ✅ MILESTONES REACHED
- [x] **Full Withdrawal Cycle Verified**
- [x] **Penalty Collection Active**
- [x] **Double-Spending Prevention Active**

---

# 🗓️ DAY 6 — 03/05 (Renewal Mechanics)
---

### 🎯 MISSION OBJECTIVES
- [x] **[HIGH]** **Manual Renew**: Tái đầu tư (Principal + Interest) ➔ NFT mới
- [x] **[HIGH]** **Auto Renew**: Cơ chế Grace Period (3 ngày)
- [x] **[MEDIUM]** Bảo lưu APR cũ cho các kỳ hạn tái tục tự động

### ⚠️ SYSTEM RISKS
- **APR Drift**: Auto renew vô tình dùng APR mới thấp hơn APR cũ của user.
- **Timing Attack**: Renew trước khi đến hạn.

### ✅ MILESTONES REACHED
- [x] **Compound Interest Logic OK**
- [x] **Auto-Renew Conditions Verified**

---

# 🗓️ DAY 7 — 04/05 (Quality Assurance & Coverage)
---

### 🎯 MISSION OBJECTIVES
- [x] **[HIGH]** Xây dựng Full Test Suite (Vitest/Hardhat)
- [x] **[HIGH]** Stress Test: `openDeposit`, `withdraw`, `earlyWithdraw`, `renew`
- [x] **[HIGH]** Security Test: `Vault`, `Pause`, `Access Control`
- [x] **[HIGH]** Đạt mục tiêu **Coverage > 90%**

### ⚠️ SYSTEM RISKS
- **Hidden Edge Cases**: Các trường hợp biên (zero amount, max cap) bị bỏ sót.
- **Revert Misses**: Không kiểm tra các trường hợp bắt buộc phải revert.

### ✅ MILESTONES REACHED
- [x] **Coverage Target Surpassed (95%+)**
- [x] **All Functional Tests Passed**

---

# 🗓️ DAY 8 — 05/05 (Interface & Technical Docs)
---

### 🎯 MISSION OBJECTIVES
- [x] **[OPTIONAL]** Frontend: React 19 + MetaMask Integration
- [x] **[HIGH]** Production README: Tài liệu hóa toàn bộ hệ thống
- [x] **[HIGH]** Demo Flow Preparation: Kịch bản thuyết trình

### ⚠️ SYSTEM RISKS
- **Frontend Sync**: Dữ liệu trên web không khớp với on-chain.
- **Documentation Gap**: Mentor không hiểu cách cài đặt và chạy test.

### ✅ MILESTONES REACHED
- [x] **Neon-Noir Interface Operational**
- [x] **Comprehensive Docs Completed**

---

# 🗓️ DAY 9 — 06/05 (Mission Completion)
---

### 🎯 MISSION OBJECTIVES
- [x] **[HIGH]** Final Regression Testing
- [x] **[HIGH]** Deployment to Local/Testnet
- [x] **[HIGH]** Final Demo Walkthrough

---

# ⚔️ BATTLE STRATEGY (WAR ROOM)

| Cấp độ | Giai đoạn | Trọng tâm | Ưu tiên |
| :--- | :--- | :--- | :--- |
| **01** | Data Foundation | Structs, Enums, Mock Tokens | **CRITICAL** |
| **02** | Core Engine | Vault & Plan Management | **HIGH** |
| **03** | Business Logic | Deposits, Withdraws, Renewals | **HIGH** |
| **04** | Security | Reentrancy, Access Control, Tests | **HIGH** |
| **05** | Presentation | Frontend & Documentation | **OPTIONAL** |

### 🛡️ NGUYÊN TẮC TÁC CHIẾN
> [!IMPORTANT]
> - **Code First, UI Later**: Tuyệt đối không làm Frontend khi Backend chưa pass 100% test.
> - **Continuous Testing**: Mỗi khi hoàn thiện 1 function, phải có unit test đi kèm ngay lập tức.
> - **Atomic Commit**: Mỗi task DONE phải đảm bảo hệ thống vẫn compile và chạy được.

---

<h3 align="center">🚀 FINAL MISSION GOAL: 100% OPERATIONAL & SECURE</h3>
