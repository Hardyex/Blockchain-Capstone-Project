// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./VaultManager.sol";

event Withdrawn(uint256 indexed depositId, address indexed user, uint256 amount, uint256 interest);
event Renewed(uint256 indexed depositId, uint256 startAt, uint256 maturityAt);
event PlanUpdated(uint256 indexed planId, uint256 newApr);
event InterestPayoutFailed(uint256 indexed depositId, address indexed user, uint256 amount);

contract SavingCore is ERC721, Ownable {
    uint256 public nextPlanId;
    uint256 public nextDepositId;
    IERC20 public usdc;
    VaultManager public vault;

    enum Status { Active, Withdrawn, ManualRenewed, AutoRenewed }

    struct SavingPlan {
        uint256 tenorDays;
        uint256 aprBps;
        uint256 minDeposit;
        uint256 maxDeposit;
        uint256 earlyWithdrawPenaltyBps;
        bool enabled;
    }

    struct DepositCertificate {
        uint256 planId;
        uint256 principal;
        uint256 startAt;
        uint256 maturityAt;
        uint256 aprBpsAtOpen; 
        uint256 penaltyBpsAtOpen; 
        Status status;
        uint256 autoRenewCount; 
    }

    mapping(uint256 => SavingPlan) public plans;
    mapping(uint256 => DepositCertificate) public deposits;

    constructor(address _usdc, address _vault) ERC721("Saving Certificate NFT", "SCN") Ownable(msg.sender) {
        usdc = IERC20(_usdc);
        vault = VaultManager(_vault);
    }

    modifier whenNotPaused() {
        require(!vault.paused(), "System is paused");
        _;
    }

    function createPlan(uint256 _tenor, uint256 _apr, uint256 _min, uint256 _max, uint256 _penalty) external onlyOwner {
        plans[nextPlanId++] = SavingPlan(_tenor, _apr, _min, _max, _penalty, true);
    }

    function openDeposit(uint256 _planId, uint256 _amount) external whenNotPaused {
        SavingPlan storage plan = plans[_planId];
        require(plan.enabled, "Plan disabled");
        if(plan.minDeposit > 0) require(_amount >= plan.minDeposit, "Below min");
        if(plan.maxDeposit > 0) require(_amount <= plan.maxDeposit, "Above max");
        
        usdc.transferFrom(msg.sender, address(this), _amount);

        uint256 depositId = nextDepositId++;
        deposits[depositId] = DepositCertificate({
            planId: _planId,
            principal: _amount,
            startAt: block.timestamp,
            maturityAt: block.timestamp + (plan.tenorDays * 1 days),
            aprBpsAtOpen: plan.aprBps,
            penaltyBpsAtOpen: plan.earlyWithdrawPenaltyBps,
            status: Status.Active,
            autoRenewCount: 0
        });

        _mint(msg.sender, depositId);
    }


    // Simple interest calculation function (Public for Frontend and Test usage)
    function calculateInterest(uint256 _depositId) public view returns (uint256) {
        DepositCertificate storage deposit = deposits[_depositId];
        
        // Calculate interest based on actual time from start until now
        // This removes interest "gaps" during the waiting period (Grace Period)
        uint256 duration = block.timestamp > deposit.startAt ? block.timestamp - deposit.startAt : 0;
        
        uint256 interest = (deposit.principal * deposit.aprBpsAtOpen * duration) / (365 days * 10000);
        
        return interest;
    }



    // 1. Withdraw at Maturity
    function withdrawAtMaturity(uint256 _depositId) external whenNotPaused {
        require(ownerOf(_depositId) == msg.sender, "Not your deposit");
        DepositCertificate storage deposit = deposits[_depositId];
        require(deposit.status != Status.Withdrawn, "Already withdrawn");
        require(block.timestamp >= deposit.maturityAt, "Not mature yet");
    

        uint256 interest = calculateInterest(_depositId);
        uint256 principal = deposit.principal;

        deposit.status = Status.Withdrawn;
        
        // Gas Optimization: Transfer principal from SavingCore, transfer interest from VaultManager
        if (principal > 0) {
            usdc.transfer(msg.sender, principal);
        }
        
        if (interest > 0) {
            bool success = vault.requestInterest(msg.sender, interest);
            if (!success) {
                emit InterestPayoutFailed(_depositId, msg.sender, interest);
            }
        }
        
        emit Withdrawn(_depositId, msg.sender, principal + interest, interest);
    }

    // 2. Early Withdraw - Subject to penalty fee
    function earlyWithdraw(uint256 _depositId) external whenNotPaused {
        require(ownerOf(_depositId) == msg.sender, "Not your deposit");
        DepositCertificate storage deposit = deposits[_depositId];
        require(deposit.status != Status.Withdrawn, "Already withdrawn");
        require(block.timestamp < deposit.maturityAt, "Already mature");

        uint256 penalty = (deposit.principal * deposit.penaltyBpsAtOpen) / 10000;
        uint256 amountToUser = deposit.principal - penalty;

        deposit.status = Status.Withdrawn;
        
        if (penalty > 0) {
            usdc.transfer(vault.feeReceiver(), penalty);
        }
        usdc.transfer(msg.sender, amountToUser);

        emit Withdrawn(_depositId, msg.sender, amountToUser, 0);
    }

    // Emergency withdrawal function: Bypasses Pause state, withdraws principal only and receives no interest
    // Ensures users can always recover their capital in case of permanent system failure
    function emergencyWithdraw(uint256 _depositId) external {
        require(ownerOf(_depositId) == msg.sender, "Not your deposit");
        DepositCertificate storage deposit = deposits[_depositId];
        require(deposit.status != Status.Withdrawn, "Already withdrawn");

        uint256 principal = deposit.principal;
        require(principal > 0, "No principal to withdraw");

        deposit.status = Status.Withdrawn;
        usdc.transfer(msg.sender, principal);

        emit Withdrawn(_depositId, msg.sender, principal, 0);
    }





    // Manual Renew
    function manualRenew(uint256 _depositId, uint256 _newPlanId) external whenNotPaused {
        require(ownerOf(_depositId) == msg.sender, "Not your deposit");
        DepositCertificate storage deposit = deposits[_depositId];
        SavingPlan storage newPlan = plans[_newPlanId];
        require(newPlan.enabled, "Plan disabled");
        
        // Check status and Grace period (0 -> 3 days after maturity)
        require(deposit.status != Status.Withdrawn, "Already withdrawn");
        require(block.timestamp >= deposit.maturityAt, "Not mature yet");
        require(block.timestamp <= deposit.maturityAt + 3 days, "Grace period passed");

        // 1. Calculate interest and request from Vault to compound into principal
        uint256 interest = calculateInterest(_depositId);
        if (interest > 0) {
            vault.requestInterest(address(this), interest);
            deposit.principal += interest;
        }

        // 2. Update new cycle info and snapshot new APR/Penalty
        deposit.planId = _newPlanId;
        deposit.aprBpsAtOpen = newPlan.aprBps;
        deposit.penaltyBpsAtOpen = newPlan.earlyWithdrawPenaltyBps;
        deposit.startAt = block.timestamp;
        deposit.maturityAt = block.timestamp + (newPlan.tenorDays * 1 days);
        deposit.status = Status.ManualRenewed;
        deposit.autoRenewCount = 0; // Reset counter on manual renew

        emit Renewed(_depositId, block.timestamp, deposit.maturityAt);
    }





    // Auto Renew
    function autoRenew(uint256 _depositId) external whenNotPaused {
        // Only contract owner (bot system) can trigger auto-renew
        require(msg.sender == owner(), "Only system can auto-renew");
        
        DepositCertificate storage deposit = deposits[_depositId];
        require(deposit.status != Status.Withdrawn, "Already withdrawn");
        
        // Only auto-renew AFTER the Grace Period (3 days) ends
        require(block.timestamp > deposit.maturityAt + 3 days, "Inside grace period");

        // 1. Calculate interest and request from Vault to compound (Compounding)
        uint256 interest = calculateInterest(_depositId);
        if (interest > 0) {
            vault.requestInterest(address(this), interest);
            deposit.principal += interest;
        }

        // 2. Update to new cycle
        deposit.startAt = block.timestamp;
        deposit.maturityAt = block.timestamp + (plans[deposit.planId].tenorDays * 1 days);
        deposit.status = Status.AutoRenewed;
        
        // System protection mechanism: Only keep old APR for a maximum of 10 auto-renew cycles
        deposit.autoRenewCount++;
        if (deposit.autoRenewCount > 10) {
            deposit.aprBpsAtOpen = plans[deposit.planId].aprBps;
            deposit.penaltyBpsAtOpen = plans[deposit.planId].earlyWithdrawPenaltyBps;
        }

        emit Renewed(_depositId, block.timestamp, deposit.maturityAt);
    }

    // --- Plan Management (CRUD) ---

    function updatePlan(
        uint256 _planId, 
        uint256 _tenor, 
        uint256 _apr, 
        uint256 _min, 
        uint256 _max, 
        uint256 _penalty
    ) external onlyOwner {
        require(_planId < nextPlanId, "Plan not found");
        SavingPlan storage plan = plans[_planId];
        plan.tenorDays = _tenor;
        plan.aprBps = _apr;
        plan.minDeposit = _min;
        plan.maxDeposit = _max;
        plan.earlyWithdrawPenaltyBps = _penalty;
        emit PlanUpdated(_planId, _apr);
    }

    function togglePlanStatus(uint256 _planId, bool _enabled) external onlyOwner {
        require(_planId < nextPlanId, "Plan not found");
        plans[_planId].enabled = _enabled;
        emit PlanUpdated(_planId, plans[_planId].aprBps);
    }
}