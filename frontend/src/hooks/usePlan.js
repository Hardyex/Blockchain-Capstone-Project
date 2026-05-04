import { useReadContract, useChainId } from 'wagmi';
import { addresses, SAVING_CORE_ABI } from '../constants';

export function usePlanDetails(planId) {
  const chainId = useChainId();
  const { SAVING_CORE_ADDRESS } = addresses[chainId] || addresses[31337];

  return useReadContract({
    address: SAVING_CORE_ADDRESS,
    abi: SAVING_CORE_ABI,
    functionName: 'plans',
    args: [planId],
  });
}