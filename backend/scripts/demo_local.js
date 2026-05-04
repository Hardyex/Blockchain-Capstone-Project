
// Chạy 2 lệnh này sau đó vào React Test Frontend
// npx hardhat node
//npx hardhat run scripts/demo_local.js --network localhost
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("\n====================================================");
  console.log("🚀 KHỞI TẠO HỆ THỐNG DEMO (LOCAL)");
  console.log("Tài khoản deployer:", deployer.address);
  console.log("====================================================\n");

  // 1. Deploy MockUSDC
  console.log("1. Đang deploy MockUSDC...");
  const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy();
  await usdc.waitForDeployment();
  const usdcAddr = await usdc.getAddress();
  console.log("✅ MockUSDC:", usdcAddr);

  // 2. Deploy VaultManager (Tham số: usdcAddr, feeReceiver)
  console.log("2. Đang deploy VaultManager...");
  const VaultManager = await hre.ethers.getContractFactory("VaultManager");
  const vault = await VaultManager.deploy(usdcAddr, deployer.address);
  await vault.waitForDeployment();
  const vaultAddr = await vault.getAddress();
  console.log("✅ VaultManager:", vaultAddr);

  // 3. Deploy SavingCore (Tham số: usdcAddr, vaultAddr)
  console.log("3. Đang deploy SavingCore...");
  const SavingCore = await hre.ethers.getContractFactory("SavingCore");
  const savingCore = await SavingCore.deploy(usdcAddr, vaultAddr);
  await savingCore.waitForDeployment();
  const savingCoreAddr = await savingCore.getAddress();
  console.log("✅ SavingCore:", savingCoreAddr);

  // 4. Cấu hình liên kết: Cho phép SavingCore gọi sang Vault
  console.log("4. Đang cấu hình liên kết hệ thống...");
  await vault.setSavingCore(savingCoreAddr);
  console.log("✅ Đã liên kết SavingCore vào VaultManager");

  // 5. Tạo các Plan mẫu để Demo
  console.log("5. Đang tạo các Plan mẫu...");
  // Plan 0: 30 ngày, 5% APR, 10 USDC min, 5000 USDC max, 2% Penalty
  await savingCore.createPlan(30, 500, 10n * 10n ** 6n, 5000n * 10n ** 6n, 200);
  // Plan 1: 90 ngày, 8% APR, 50 USDC min, 10000 USDC max, 3% Penalty
  await savingCore.createPlan(90, 800, 50n * 10n ** 6n, 10000n * 10n ** 6n, 300);
  // Plan 2: 365 ngày, 12% APR, 100 USDC min, 50000 USDC max, 5% Penalty
  await savingCore.createPlan(365, 1200, 100n * 10n ** 6n, 50000n * 10n ** 6n, 500);
  console.log("✅ Đã tạo xong 3 Plan (30, 90 và 365 ngày)");

  // 6. Cấp tiền (Mint) và tạo Deposit mẫu để Dashboard có dữ liệu ngay
  console.log("6. Đang tạo dữ liệu mẫu cho Dashboard...");
  const depositAmount = 1000n * 10n ** 6n; // 1000 USDC

  // Mint cho Deployer, Vault và ĐẶC BIỆT là ví MetaMask của bạn
  const yourWallet = "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199";
  await usdc.mint(deployer.address, depositAmount * 5n);
  await usdc.mint(yourWallet, depositAmount * 50n); // Add 50,000 USDC to test
  await usdc.mint(vaultAddr, depositAmount * 100n);

  console.log(`Đã cấp 50,000 USDC cho ví: ${yourWallet}`);

  // Approve and Open Deposit for Deployer sample
  await usdc.approve(savingCoreAddr, depositAmount);
  await savingCore.openDeposit(0, depositAmount);
  console.log("Đã nạp mẫu 1000 USDC vào Plan 0 thành công");

  // EXPORT TO FILE JSON FOR FRONTEND (Nested structure for multi-network support)
  const frontendConstantsPath = path.join(__dirname, "../../blockchain-UI-system/saving-frontend/src/constants/addresses.json");

  try {
    let currentAddresses = {};
    if (fs.existsSync(frontendConstantsPath)) {
      try {
        currentAddresses = JSON.parse(fs.readFileSync(frontendConstantsPath, "utf8"));
      } catch (e) {
        console.log("⚠️ File addresses.json cũ không hợp lệ, sẽ khởi tạo mới.");
      }
    }

    // Cập nhật hoặc tạo mới "ngăn" 31337 (Local Hardhat)
    currentAddresses["31337"] = {
      USDC_ADDRESS: usdcAddr,
      VAULT_MANAGER_ADDRESS: vaultAddr,
      SAVING_CORE_ADDRESS: savingCoreAddr
    };

    fs.writeFileSync(frontendConstantsPath, JSON.stringify(currentAddresses, null, 2));
    console.log("✅ Đã tự động cập nhật địa chỉ vào Frontend (Network 31337)!");
  } catch (err) {
    console.error("❌ Lỗi khi ghi file addresses.json:", err.message);
  }

  console.log("\n====================================================");
  console.log("THÔNG TIN QUAN TRỌNG ĐỂ CẬP NHẬT FRONTEND:");
  console.log("----------------------------------------------------");
  console.log(`USDC_ADDRESS: "${usdcAddr}"`);
  console.log(`VAULT_MANAGER_ADDRESS: "${vaultAddr}"`);
  console.log(`SAVING_CORE_ADDRESS: "${savingCoreAddr}"`);
  console.log("====================================================\n");
  console.log("Hãy copy 3 địa chỉ trên vào file config/constants của Frontend.");
}

main().catch((error) => {
  console.error("\nLỖI THIẾT LẬP:", error);
  process.exitCode = 1;
});
