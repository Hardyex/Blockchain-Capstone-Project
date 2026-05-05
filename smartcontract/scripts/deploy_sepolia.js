const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("\n====================================================");
  console.log("🚀 DEPLOYING TO SEPOLIA TESTNET");
  console.log("Deployer address:", deployer.address);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", hre.ethers.formatEther(balance), "ETH");
  console.log("====================================================\n");

  if (balance === 0n) {
    console.error("ERROR: Deployer has 0 ETH. Please get some Sepolia ETH from a faucet first.");
    return;
  }

  // 1. Deploy MockUSDC
  console.log("1. Deploying MockUSDC...");
  const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy();
  await usdc.waitForDeployment();
  const usdcAddr = await usdc.getAddress();
  console.log("MockUSDC deployed to:", usdcAddr);

  // 2. Deploy VaultManager
  console.log("2. Deploying VaultManager...");
  const VaultManager = await hre.ethers.getContractFactory("VaultManager");
  const vault = await VaultManager.deploy(usdcAddr, deployer.address);
  await vault.waitForDeployment();
  const vaultAddr = await vault.getAddress();
  console.log("VaultManager deployed to:", vaultAddr);

  // 3. Deploy SavingCore
  console.log("3. Deploying SavingCore...");
  const SavingCore = await hre.ethers.getContractFactory("SavingCore");
  const savingCore = await SavingCore.deploy(usdcAddr, vaultAddr);
  await savingCore.waitForDeployment();
  const savingCoreAddr = await savingCore.getAddress();
  console.log("SavingCore deployed to:", savingCoreAddr);

  // 4. Link SavingCore to VaultManager
  console.log("4. Configuring system links...");
  const tx = await vault.setSavingCore(savingCoreAddr);
  await tx.wait();
  console.log("SavingCore linked to VaultManager");

  // 5. Create Sample Plans
  console.log("5. Creating sample plans...");
  // Plan 0: 30 days, 5% APR, 10 USDC min, 5000 USDC max, 2% Penalty
  await (await savingCore.createPlan(30, 500, 10n * 10n ** 6n, 5000n * 10n ** 6n, 200)).wait();
  // Plan 1: 90 days, 8% APR, 50 USDC min, 10000 USDC max, 3% Penalty
  await (await savingCore.createPlan(90, 800, 50n * 10n ** 6n, 10000n * 10n ** 6n, 300)).wait();
  // Plan 2: 365 days, 12% APR, 100 USDC min, 50000 USDC max, 5% Penalty
  await (await savingCore.createPlan(365, 1200, 100n * 10n ** 6n, 50000n * 10n ** 6n, 500)).wait();
  console.log("3 Sample Plans created");

  console.log("\n====================================================");
  console.log("DEPLOYMENT SUCCESSFUL!");
  console.log("----------------------------------------------------");
  console.log(`"USDC_ADDRESS": "${usdcAddr}",`);
  console.log(`"VAULT_MANAGER_ADDRESS": "${vaultAddr}",`);
  console.log(`"SAVING_CORE_ADDRESS": "${savingCoreAddr}"`);
  console.log("====================================================\n");
  console.log("Please copy these addresses into the '11155111' section of addresses.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
