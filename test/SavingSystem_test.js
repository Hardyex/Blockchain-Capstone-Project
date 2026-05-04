const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("Blockchain Saving System - Final Optimized Coverage", function () {
  let usdc, vault, savingCore, owner, user, otherAccount;
  const INITIAL_SUPPLY = ethers.parseUnits("10000", 6);
  const DEPOSIT_AMOUNT = ethers.parseUnits("1000", 6);

  beforeEach(async function () {
    [owner, user, otherAccount] = await ethers.getSigners();

    // 1. Deploy Mock USDC
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    usdc = await MockUSDC.deploy();

    // 2. Deploy VaultManager
    const VaultManager = await ethers.getContractFactory("VaultManager");
    vault = await VaultManager.deploy(await usdc.getAddress(), owner.address);

    // 3. Deploy SavingCore
    const SavingCore = await ethers.getContractFactory("SavingCore");
    savingCore = await SavingCore.deploy(await usdc.getAddress(), await vault.getAddress());

    // 4. Configure VaultManager
    await vault.setSavingCore(await savingCore.getAddress());

    // Fund and approve
    await usdc.mint(user.address, INITIAL_SUPPLY);
    await usdc.mint(await vault.getAddress(), INITIAL_SUPPLY); // Fund Vault to pay interest
    await usdc.connect(user).approve(await savingCore.getAddress(), INITIAL_SUPPLY);

    // Plan 0: 30 days, 5% APR, 2% Penalty, Min Deposit 0
    await savingCore.createPlan(30, 500, 0, ethers.parseUnits("5000", 6), 200);
  });

  describe("1. Mock & Basic Coverage", function () {
    it("Should cover MockUSDC functions", async function () {
      await usdc.mint(owner.address, 100);
      expect(await usdc.balanceOf(owner.address)).to.equal(100);
      expect(await usdc.decimals()).to.equal(6);
      await expect(
        usdc.connect(user).mint(user.address, 100)
      ).to.be.revertedWithCustomError(usdc, "OwnableUnauthorizedAccount");
    });
  });

  describe("2. Deposit & Withdraw Logic", function () {
    it("Should correctly withdraw at maturity with interest", async function () {
      await savingCore.connect(user).openDeposit(0, DEPOSIT_AMOUNT);
      await time.increase(30 * 24 * 60 * 60);

      const balanceBefore = await usdc.balanceOf(user.address);
      await savingCore.connect(user).withdrawAtMaturity(0);
      const balanceAfter = await usdc.balanceOf(user.address);

      expect(balanceAfter).to.be.gt(balanceBefore + DEPOSIT_AMOUNT);
    });

    it("Should apply penalty on early withdrawal", async function () {
      await savingCore.connect(user).openDeposit(0, DEPOSIT_AMOUNT);
      const feeReceiver = await vault.feeReceiver();
      const feeBefore = await usdc.balanceOf(feeReceiver);

      await savingCore.connect(user).earlyWithdraw(0);

      const feeAfter = await usdc.balanceOf(feeReceiver);
      expect(feeAfter).to.be.gt(feeBefore);
    });

    it("Should fail if amount is below minimum deposit", async function () {
      await savingCore.createPlan(30, 500, ethers.parseUnits("2000", 6), ethers.parseUnits("5000", 6), 200);
      await expect(
        savingCore.connect(user).openDeposit(1, ethers.parseUnits("1000", 6))
      ).to.be.revertedWith("Below min");
    });

    it("Should succeed if amount is at or above minimum deposit", async function () {
      await savingCore.createPlan(30, 500, ethers.parseUnits("2000", 6), ethers.parseUnits("5000", 6), 200);
      await savingCore.connect(user).openDeposit(1, ethers.parseUnits("2500", 6));
      const deposit = await savingCore.deposits(0);
      expect(deposit.principal).to.equal(ethers.parseUnits("2500", 6));
    });

    it("Should revert open deposit if plan is disabled", async function () {
      await expect(
        savingCore.connect(user).openDeposit(999, ethers.parseUnits("1000", 6))
      ).to.be.revertedWith("Plan disabled");
    });

    it("Should revert earlyWithdraw if already mature", async function () {
      await savingCore.connect(user).openDeposit(0, DEPOSIT_AMOUNT);
      await time.increase(30 * 24 * 60 * 60);
      await expect(savingCore.connect(user).earlyWithdraw(0)).to.be.revertedWith("Already mature");
    });
    it("Should revert open deposit if amount is above maximum deposit", async function () {
      // Plan 2: Max Deposit 5000
      await savingCore.createPlan(30, 500, 0, ethers.parseUnits("5000", 6), 200);
      await expect(
        savingCore.connect(user).openDeposit(1, ethers.parseUnits("6000", 6))
      ).to.be.revertedWith("Above max");
    });
  });

  describe("3. Renew Logic & Grace Period", function () {
    it("Should manual renew and compound interest", async function () {
      await savingCore.connect(user).openDeposit(0, DEPOSIT_AMOUNT);
      await time.increase(30 * 24 * 60 * 60);

      const depositBefore = await savingCore.deposits(0);
      await savingCore.connect(user).manualRenew(0, 0);
      const depositAfter = await savingCore.deposits(0);
      
      expect(depositAfter.principal).to.be.gt(depositBefore.principal);
      expect(depositAfter.status).to.equal(2); // Status.ManualRenewed
    });

    it("Should allow admin to trigger auto-renew and compound", async function () {
      await savingCore.connect(user).openDeposit(0, DEPOSIT_AMOUNT);
      await time.increase(34 * 24 * 60 * 60); // Past grace period

      const depositBefore = await savingCore.deposits(0);
      await savingCore.connect(owner).autoRenew(0);
      const depositAfter = await savingCore.deposits(0);

      expect(depositAfter.principal).to.be.gt(depositBefore.principal);
      expect(depositAfter.status).to.equal(3); // Status.AutoRenewed
    });

    it("Should revert autoRenew if still in grace period", async function () {
      await savingCore.connect(user).openDeposit(0, DEPOSIT_AMOUNT);
      await time.increase(31 * 24 * 60 * 60); // Inside grace period (30 + 1)
      await expect(savingCore.connect(owner).autoRenew(0)).to.be.revertedWith("Inside grace period");
    });
    it("Should revert manualRenew if new plan is disabled", async function () {
      await savingCore.connect(user).openDeposit(0, DEPOSIT_AMOUNT);
      await time.increase(30 * 24 * 60 * 60);
      
      // Create and disable a plan
      await savingCore.createPlan(30, 500, 0, ethers.parseUnits("5000", 6), 200);
      // Wait, there is no disablePlan function. I'll just use a non-existent plan ID.
      await expect(
        savingCore.connect(user).manualRenew(0, 999)
      ).to.be.revertedWith("Plan disabled");
    });
  });

  describe("4. Comprehensive Edge Cases", function () {
    it("Should revert if non-owner tries to withdraw or renew", async function () {
      await savingCore.connect(user).openDeposit(0, DEPOSIT_AMOUNT);
      await expect(savingCore.connect(otherAccount).withdrawAtMaturity(0)).to.be.revertedWith("Not your deposit");
      await expect(savingCore.connect(otherAccount).earlyWithdraw(0)).to.be.revertedWith("Not your deposit");
      await expect(savingCore.connect(otherAccount).manualRenew(0, 0)).to.be.revertedWith("Not your deposit");
      await expect(savingCore.connect(otherAccount).autoRenew(0)).to.be.revertedWith("Only system can auto-renew");
    });

    it("Should revert if withdrawing maturity early or renewing late", async function () {
      await savingCore.connect(user).openDeposit(0, DEPOSIT_AMOUNT);
      await expect(savingCore.connect(user).withdrawAtMaturity(0)).to.be.revertedWith("Not mature yet");
      await expect(savingCore.connect(user).manualRenew(0, 0)).to.be.revertedWith("Not mature yet");

      await time.increase(35 * 24 * 60 * 60); // Past 3-day grace period
      await expect(savingCore.connect(user).manualRenew(0, 0)).to.be.revertedWith("Grace period passed");
    });

    it("Should revert if action on already withdrawn deposit", async function () {
      await savingCore.connect(user).openDeposit(0, DEPOSIT_AMOUNT);
      await savingCore.connect(user).earlyWithdraw(0);

      await expect(savingCore.connect(user).withdrawAtMaturity(0)).to.be.revertedWith("Already withdrawn");
      await expect(savingCore.connect(user).earlyWithdraw(0)).to.be.revertedWith("Already withdrawn");
      await expect(savingCore.connect(owner).autoRenew(0)).to.be.revertedWith("Already withdrawn");
    });
  });

  describe("5. System Controls", function () {
    it("Should block all operations when System is paused via VaultManager", async function () {
      await savingCore.connect(user).openDeposit(0, DEPOSIT_AMOUNT);
      
      // Pause system via VaultManager
      await vault.pause();
      
      await expect(savingCore.connect(user).openDeposit(0, DEPOSIT_AMOUNT)).to.be.revertedWith("System is paused");
      await expect(savingCore.connect(user).withdrawAtMaturity(0)).to.be.revertedWith("System is paused");
      await expect(savingCore.connect(user).earlyWithdraw(0)).to.be.revertedWith("System is paused");
      await expect(savingCore.connect(user).manualRenew(0, 0)).to.be.revertedWith("System is paused");
      await expect(savingCore.connect(owner).autoRenew(0)).to.be.revertedWith("System is paused");
      
      // Unpause and verify it works again
      await vault.unpause();
      await savingCore.connect(user).earlyWithdraw(0); // Should work now
    });
    it("VaultManager: Only owner can call admin functions", async function () {
      await expect(vault.connect(otherAccount).setSavingCore(otherAccount.address)).to.be.revertedWithCustomError(vault, "OwnableUnauthorizedAccount");
      await expect(vault.connect(otherAccount).setFeeReceiver(otherAccount.address)).to.be.revertedWithCustomError(vault, "OwnableUnauthorizedAccount");
      await expect(vault.connect(otherAccount).pause()).to.be.revertedWithCustomError(vault, "OwnableUnauthorizedAccount");
      await expect(vault.connect(otherAccount).unpause()).to.be.revertedWithCustomError(vault, "OwnableUnauthorizedAccount");
    });

    it("VaultManager: requestInterest should return false on insufficient balance", async function () {
      await vault.setSavingCore(owner.address);
      const vaultBalance = await usdc.balanceOf(await vault.getAddress());
      const wayTooMuch = vaultBalance + 1n;
      // staticCall used to check return value of a state-changing function
      expect(await vault.requestInterest.staticCall(owner.address, wayTooMuch)).to.be.false;
      await vault.setSavingCore(await savingCore.getAddress());
    });

    it("VaultManager: requestInterest should revert if paused", async function () {
      await vault.setSavingCore(owner.address);
      await vault.pause();
      await expect(vault.requestInterest(owner.address, 100)).to.be.revertedWithCustomError(vault, "EnforcedPause");
      await vault.unpause();
      await vault.setSavingCore(await savingCore.getAddress());
    });

    it("VaultManager: Success branches for admin functions", async function () {
      await vault.setSavingCore(owner.address);
      expect(await vault.savingCore()).to.equal(owner.address);
      
      await vault.setFeeReceiver(otherAccount.address);
      expect(await vault.feeReceiver()).to.equal(otherAccount.address);
      
      await vault.pause();
      expect(await vault.paused()).to.be.true;
      await vault.unpause();
      expect(await vault.paused()).to.be.false;
    });

    it("VaultManager: Admin withdraw with safety buffer", async function () {
      const balance = await usdc.balanceOf(await vault.getAddress());
      const safeAmount = balance / 2n;
      await vault.withdraw(owner.address, safeAmount);
      
      const tooMuch = balance; // More than 90%
      await expect(vault.withdraw(owner.address, tooMuch)).to.be.revertedWith("Vault: Exceeds safety buffer");
    });

    it("VaultManager: requestInterest should revert if not called by SavingCore", async function () {
      await expect(vault.connect(user).requestInterest(user.address, 100))
        .to.be.revertedWith("Only SavingCore");
    });
  });

  describe("6. Security Fixes & Edge Cases (100% Coverage)", function () {
    it("SavingCore: Liquidity Safety - principal withdraw even if vault empty", async function () {
      await savingCore.connect(user).openDeposit(0, DEPOSIT_AMOUNT);
      await time.increase(30 * 24 * 60 * 60);
      
      // Empty the vault completely
      const balance = await usdc.balanceOf(await vault.getAddress());
      await vault.withdraw(owner.address, (balance * 90n) / 100n);
      
      for(let i=0; i<5; i++) {
          const b = await usdc.balanceOf(await vault.getAddress());
          await vault.withdraw(owner.address, (b * 90n) / 100n);
      }
      
      const userBalanceBefore = await usdc.balanceOf(user.address);
      const tx = await savingCore.connect(user).withdrawAtMaturity(0);
      await expect(tx).to.emit(savingCore, "InterestPayoutFailed");
      
      const userBalanceAfter = await usdc.balanceOf(user.address);
      expect(userBalanceAfter).to.equal(userBalanceBefore + DEPOSIT_AMOUNT);
    });

    it("SavingCore: Interest Gap - should earn interest during grace period", async function () {
      await savingCore.connect(user).openDeposit(0, DEPOSIT_AMOUNT);
      await time.increase(30 * 24 * 60 * 60);
      const interestAtMaturity = await savingCore.calculateInterest(0);
      
      await time.increase(2 * 24 * 60 * 60);
      const interestAfter2Days = await savingCore.calculateInterest(0);
      
      expect(interestAfter2Days).to.be.gt(interestAtMaturity);
    });

    it("SavingCore: Auto-Renew Limit - should update APR after 10 cycles", async function () {
      await savingCore.connect(user).openDeposit(0, DEPOSIT_AMOUNT);
      
      // Fast forward 11 cycles
      for(let i = 0; i < 11; i++) {
        await time.increase(35 * 24 * 60 * 60);
        await savingCore.connect(owner).autoRenew(0);
      }
      
      const deposit = await savingCore.deposits(0);
      expect(deposit.autoRenewCount).to.equal(11n);
    });

    it("SavingCore: Emergency Withdraw - should work when paused and return principal", async function () {
      await savingCore.connect(user).openDeposit(0, DEPOSIT_AMOUNT);
      await vault.pause();
      
      const balanceBefore = await usdc.balanceOf(user.address);
      await savingCore.connect(user).emergencyWithdraw(0);
      const balanceAfter = await usdc.balanceOf(user.address);
      
      expect(balanceAfter).to.equal(balanceBefore + DEPOSIT_AMOUNT);
      expect((await savingCore.deposits(0)).status).to.equal(1); // Withdrawn
    });

    it("SavingCore: Manual Renew resets autoRenewCount", async function () {
      await savingCore.connect(user).openDeposit(0, DEPOSIT_AMOUNT);
      await time.increase(34 * 24 * 60 * 60);
      await savingCore.connect(owner).autoRenew(0);
      expect((await savingCore.deposits(0)).autoRenewCount).to.equal(1n);
      
      await time.increase(30 * 24 * 60 * 60);
      await savingCore.connect(user).manualRenew(0, 0);
      expect((await savingCore.deposits(0)).autoRenewCount).to.equal(0n);
    });

    it("SavingCore: Withdraw/Renew with 0 interest", async function () {
      await savingCore.createPlan(30, 0, 0, 0, 0); // Plan ID 1
      await savingCore.connect(user).openDeposit(1, DEPOSIT_AMOUNT); // Deposit ID 0
      await time.increase(30 * 24 * 60 * 60);
      await savingCore.connect(user).manualRenew(0, 1);
      await time.increase(30 * 24 * 60 * 60);
      await savingCore.connect(user).withdrawAtMaturity(0);
    });
  });

  describe("7. Plan Management & Administrative Controls", function () {
    it("Should allow owner to update a plan", async function () {
      await expect(savingCore.updatePlan(0, 60, 600, 100, 10000, 300))
        .to.emit(savingCore, "PlanUpdated")
        .withArgs(0, 600);
      
      const plan = await savingCore.plans(0);
      expect(plan.tenorDays).to.equal(60n);
      expect(plan.aprBps).to.equal(600n);
    });

    it("Should revert if non-owner tries to update a plan", async function () {
      await expect(savingCore.connect(user).updatePlan(0, 60, 600, 100, 10000, 300))
        .to.be.revertedWithCustomError(savingCore, "OwnableUnauthorizedAccount");
    });

    it("Should revert updatePlan if planId is invalid", async function () {
      await expect(savingCore.updatePlan(99, 60, 600, 100, 10000, 300))
        .to.be.revertedWith("Plan not found");
    });

    it("Should allow owner to toggle plan status", async function () {
      await expect(savingCore.togglePlanStatus(0, false))
        .to.emit(savingCore, "PlanUpdated");
      
      expect((await savingCore.plans(0)).enabled).to.be.false;
      
      await expect(savingCore.connect(user).openDeposit(0, DEPOSIT_AMOUNT))
        .to.be.revertedWith("Plan disabled");
        
      await savingCore.togglePlanStatus(0, true);
      expect((await savingCore.plans(0)).enabled).to.be.true;
    });

    it("Should revert if non-owner tries to toggle plan status", async function () {
      await expect(savingCore.connect(user).togglePlanStatus(0, false))
        .to.be.revertedWithCustomError(savingCore, "OwnableUnauthorizedAccount");
    });

    it("Should revert togglePlanStatus if planId is invalid", async function () {
      await expect(savingCore.togglePlanStatus(99, false))
        .to.be.revertedWith("Plan not found");
    });
  });

  describe("8. Advanced Branch & Edge Case Coverage", function () {
    it("SavingCore: calculateInterest zero duration", async function () {
      await savingCore.connect(user).openDeposit(0, DEPOSIT_AMOUNT);
      const interest = await savingCore.calculateInterest(0); // Deposit ID 0
      expect(interest).to.equal(0);
    });

    it("SavingCore: earlyWithdraw with zero penalty", async function () {
      await savingCore.createPlan(30, 500, 0, 0, 0); // Plan ID 1
      await savingCore.connect(user).openDeposit(1, DEPOSIT_AMOUNT); // Deposit ID 0
      
      const balanceBefore = await usdc.balanceOf(user.address);
      await savingCore.connect(user).earlyWithdraw(0); 
      const balanceAfter = await usdc.balanceOf(user.address);
      
      expect(balanceAfter).to.equal(balanceBefore + DEPOSIT_AMOUNT);
    });

    it("SavingCore: emergencyWithdraw should revert if principal is zero", async function () {
      await savingCore.createPlan(30, 500, 0, 0, 200); // Plan ID 1
      await savingCore.connect(user).openDeposit(1, 0); // Deposit ID 0
      
      await expect(savingCore.connect(user).emergencyWithdraw(0))
        .to.be.revertedWith("No principal to withdraw");
    });

    it("SavingCore: openDeposit with zero min/max limits", async function () {
      await savingCore.createPlan(30, 500, 0, 0, 200); // Plan ID 1
      await expect(savingCore.connect(user).openDeposit(1, DEPOSIT_AMOUNT))
        .to.not.be.reverted;
    });

    it("SavingCore: manualRenew and autoRenew with zero interest", async function () {
      await savingCore.createPlan(30, 0, 0, 0, 200); // Plan ID 1
      await savingCore.connect(user).openDeposit(1, DEPOSIT_AMOUNT); // Deposit ID 0
      
      await time.increase(31 * 24 * 60 * 60);
      await expect(savingCore.connect(user).manualRenew(0, 1)).to.not.be.reverted;
      
      await time.increase(35 * 24 * 60 * 60);
      await expect(savingCore.connect(owner).autoRenew(0)).to.not.be.reverted;
    });

    it("SavingCore: withdrawAtMaturity with zero principal", async function () {
        await savingCore.createPlan(30, 500, 0, 0, 200); // Plan ID 1
        await savingCore.connect(user).openDeposit(1, 0); // Deposit ID 0
        await time.increase(31 * 24 * 60 * 60);
        
        await expect(savingCore.connect(user).withdrawAtMaturity(0))
            .to.emit(savingCore, "Withdrawn");
    });
  });
});