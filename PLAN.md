# 📅 Project Plan – Blockchain Term Deposit System

**Timeline:** 28/04 → 06/05  
**Goal:** Hoàn thành backend + test trước 05/05, frontend optional

---

# 🗓️ Day 1 — 28/04 (Setup & Data Model)

## 🎯 Task
- [ ] Khởi tạo project Hardhat
- [ ] Cài dependencies: hardhat, ethers, openzeppelin
- [ ] Tạo structure thư mục `/contracts`, `/test`
- [ ] Tạo file:
  - MockUSDC.sol
  - VaultManager.sol
  - SavingCore.sol
- [ ] Thiết kế struct:
  - Plan
  - Deposit
- [ ] Define enum Status

## ⚠️ Risk
- Thiếu field trong struct → phải refactor lớn
- Hiểu sai snapshot APR → sai toàn bộ logic

## ✅ Achievement
- [ ] Compile thành công
- [ ] Struct đầy đủ
- [ ] Enum status hoàn chỉnh

---

# 🗓️ Day 2 — 29/04 (Mock Token + Vault)

## 🎯 Task

### MockUSDC
- [ ] ERC20 (6 decimals)
- [ ] mint() phục vụ test

### VaultManager
- [ ] Biến:
  - token address
  - feeReceiver
- [ ] Function:
  - fundVault()
  - withdrawVault()
  - setFeeReceiver()
- [ ] Thêm Pausable

## ⚠️ Risk
- Sai decimals → sai toàn bộ phép tính
- Trộn vault với tiền user

## ✅ Achievement
- [ ] mint hoạt động
- [ ] fundVault hoạt động
- [ ] withdrawVault hoạt động
- [ ] pause hoạt động

---

# 🗓️ Day 3 — 30/04 (Plan Management)

## 🎯 Task
- [ ] createPlan()
- [ ] updatePlan()
- [ ] enable/disable plan
- [ ] Validate input (APR, tenor)
- [ ] Emit event PlanCreated, PlanUpdated

## ⚠️ Risk
- Plan update ảnh hưởng deposit cũ
- Không validate input

## ✅ Achievement
- [ ] Tạo plan OK
- [ ] Disable plan OK
- [ ] Update chỉ ảnh hưởng deposit mới

---

# 🗓️ Day 4 — 01/05 (Open Deposit + NFT)

## 🎯 Task
- [ ] Implement openDeposit()
- [ ] Check plan enabled
- [ ] Check min/max
- [ ] Transfer token
- [ ] Mint ERC721
- [ ] Lưu deposit
- [ ] Snapshot APR & penalty

## ⚠️ Risk
- Không snapshot APR
- Sai timestamp

## ✅ Achievement
- [ ] Open deposit thành công
- [ ] Reject khi plan disable
- [ ] NFT đúng owner

---

# 🗓️ Day 5 — 02/05 (Withdraw Logic)

## 🎯 Task

### Withdraw at maturity
- [ ] Check maturity
- [ ] Tính interest
- [ ] Gọi vault trả lãi

### Early withdraw
- [ ] Tính penalty
- [ ] Transfer penalty → feeReceiver
- [ ] Không trả interest

## ⚠️ Risk
- Sai công thức interest
- Vault thiếu tiền không revert
- Double withdraw

## ✅ Achievement
- [ ] Withdraw đúng hạn OK
- [ ] Early withdraw OK
- [ ] Không withdraw 2 lần

---

# 🗓️ Day 6 — 03/05 (Renew Logic)

## 🎯 Task

### Manual renew
- [ ] Tính interest
- [ ] Cộng vào principal
- [ ] Mint deposit mới

### Auto renew
- [ ] Check grace period (3 ngày)
- [ ] Giữ APR cũ
- [ ] Tạo deposit mới

## ⚠️ Risk
- Auto renew dùng APR mới
- Renew trước thời gian

## ✅ Achievement
- [ ] Manual renew OK
- [ ] Auto renew đúng điều kiện
- [ ] APR giữ nguyên

---

# 🗓️ Day 7 — 04/05 (Testing)

## 🎯 Task
- [ ] Viết full test suite
- [ ] Test:
  - openDeposit
  - withdraw
  - earlyWithdraw
  - renew
  - autoRenew
  - vault
  - pause
- [ ] Coverage > 90%

## ⚠️ Risk
- Thiếu edge case
- Không test revert

## ✅ Achievement
- [ ] Coverage ≥ 90%
- [ ] All test pass

---

# 🗓️ Day 8 — 05/05 (Frontend + Demo)

## 🎯 Task

### Optional frontend
- [ ] React + MetaMask
- [ ] View plans
- [ ] Open deposit
- [ ] Withdraw

### Bắt buộc
- [ ] README.md
- [ ] Chuẩn bị demo flow

## ⚠️ Risk
- Frontend lỗi
- Demo không chuẩn bị

## ✅ Achievement
- [ ] Demo chạy mượt
- [ ] README rõ ràng

---

# 🗓️ Day 9 — 06/05 (Demo Day)

## 🎯 Task
- [ ] Chạy lại test
- [ ] Deploy local
- [ ] Demo theo flow

---

# 🔥 Strategy

## Thứ tự ưu tiên
1. Data model
2. Vault
3. Plan
4. Deposit
5. Withdraw
6. Renew
7. Test
8. Frontend

## Nguyên tắc
- Không làm frontend trước
- Luôn test từng phần
- Mỗi task DONE phải chạy được

---

# 🚀 Goal cuối
- Backend ổn định
- Test coverage > 90%
- Demo mượt, không lỗi
