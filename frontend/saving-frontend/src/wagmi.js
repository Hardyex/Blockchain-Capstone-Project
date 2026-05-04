import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia, hardhat } from 'wagmi/chains';

export const config = getDefaultConfig({
    appName: 'Blockchain Saving System',
    projectId: 'd0512792c81bbcaac5c24afe64093dcf', // Register for free at https://cloud.walletconnect.com/
    chains: [sepolia, hardhat],
    ssr: false,
});