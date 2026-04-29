// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract VaultManager is Ownable, Pausable {
    address public feeReceiver;
    address public savingCore;
    IERC20 public usdc;

    constructor(address _usdc, address _feeReceiver) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
        feeReceiver = _feeReceiver;
    }

    modifier onlySavingCore() {
        require(msg.sender == savingCore, "Only SavingCore");
        _;
    }

    function setSavingCore(address _savingCore) external onlyOwner {
        savingCore = _savingCore;
    }

    function setFeeReceiver(address _newReceiver) external onlyOwner {
        feeReceiver = _newReceiver;
    }

    function requestInterest(address _to, uint256 _amount) external onlySavingCore whenNotPaused returns (bool) {
        if (usdc.balanceOf(address(this)) < _amount) {
            return false;
        }
        usdc.transfer(_to, _amount);
        return true;
    }

    function withdraw(address _to, uint256 _amount) external onlyOwner {
        uint256 balance = usdc.balanceOf(address(this));
        // Safety limit mechanism: Admin can only withdraw a maximum of 90% of the current balance
        // The remaining 10% is always kept to ensure immediate interest payment capacity
        require(_amount <= (balance * 90) / 100, "Vault: Exceeds safety buffer");
        usdc.transfer(_to, _amount);
    }

    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}