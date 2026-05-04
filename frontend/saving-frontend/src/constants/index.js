import SavingCoreABI from '../abis/SavingCore.json';
import MockUSDCABI from '../abis/MockUSDC.json';
import VaultManagerABI from '../abis/VaultManager.json';
import baseAddresses from './addresses.json';

const addresses = { ...baseAddresses };

const chainId = import.meta.env.VITE_CHAIN_ID || "11155111";

addresses[chainId] = addresses[chainId] || {};

const envConfig = {
    SAVING_CORE_ADDRESS: import.meta.env.VITE_SAVING_CORE_ADDRESS,
    VAULT_MANAGER_ADDRESS: import.meta.env.VITE_VAULT_MANAGER_ADDRESS,
    USDC_ADDRESS: import.meta.env.VITE_USDC_ADDRESS,
};

Object.entries(envConfig).forEach(([key, value]) => {
    if (value) {
        addresses[chainId][key] = value;
    }
});

export { addresses };

export const SAVING_CORE_ABI = SavingCoreABI.abi;
export const USDC_ABI = MockUSDCABI.abi;
export const VAULT_MANAGER_ABI = VaultManagerABI.abi;