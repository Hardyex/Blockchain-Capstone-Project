import { useState, useEffect } from 'react';
import { useReadContract, useReadContracts, useChainId, useBlockNumber } from 'wagmi';
import { addresses, SAVING_CORE_ABI } from '../constants';
import { formatUnits } from 'viem';

export function SavingPlans({ onSelectPlan }) {
  const chainId = useChainId();
  const { SAVING_CORE_ADDRESS } = addresses[chainId] || addresses[31337];

  // 1. Fetch nextPlanId
  const { data: nextPlanId, refetch: refetchNextPlan } = useReadContract({
    address: SAVING_CORE_ADDRESS,
    abi: SAVING_CORE_ABI,
    functionName: 'nextPlanId',
  });

  // 2. Multicall to fetch all Plans data
  const numPlans = Number(nextPlanId || 0);
  const planIds = Array.from({ length: numPlans }, (_, i) => i);

  const { data: plansData, isLoading, refetch: refetchPlans } = useReadContracts({
    contracts: planIds.map((id) => ({
      address: SAVING_CORE_ADDRESS,
      abi: SAVING_CORE_ABI,
      functionName: 'plans',
      args: [id],
    })),
  });

  // 3. Tự động Refetch mỗi khi có Block mới
  const { data: blockNumber } = useBlockNumber({ watch: true });

  useEffect(() => {
    refetchNextPlan();
    refetchPlans();
  }, [blockNumber]);

  if (isLoading) {
    return <div className="text-gray-400 animate-pulse text-center p-8">Syncing Saving Plans from Blockchain...</div>;
  }

  if (numPlans === 0) {
    return <div className="text-gray-500 text-center p-8">The system has no active plans created yet.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {plansData?.map((result, index) => {
        if (result.status !== 'success') return null;

        // Map structure to SavingPlan struct: tenorDays, aprBps, minDeposit, maxDeposit, penaltyBps, enabled
        const [tenorDays, aprBps, minDeposit, maxDeposit, earlyWithdrawPenaltyBps, enabled] = result.result;

        if (!enabled) return null;

        const apr = Number(aprBps) / 100;
        const penalty = Number(earlyWithdrawPenaltyBps) / 100;

        return (
          <div key={index} className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl hover:border-neonBlue transition-colors group relative overflow-hidden flex flex-col justify-between">
            {/* Ambient Background Gradient */}
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-neonBlue/10 rounded-full blur-2xl group-hover:bg-neonBlue/20 transition-all pointer-events-none"></div>

            <div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white">Plan {Number(tenorDays)} Days</h3>
                <span className="px-3 py-1 bg-neonPurple/20 text-neonPurple rounded-full text-sm font-semibold border border-neonPurple/30">
                  {apr}% APR
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-400 mb-6">
                <div className="flex justify-between">
                  <span>Minimum deposit:</span>
                  <span className="text-gray-200">{formatUnits(minDeposit, 6)} USDC</span>
                </div>
                <div className="flex justify-between">
                  <span>Maximum deposit:</span>
                  <span className="text-gray-200">{maxDeposit > 0 ? `${formatUnits(maxDeposit, 6)} USDC` : 'Unlimited'}</span>
                </div>
                <div className="flex justify-between text-red-400/80">
                  <span>Early withdrawal fee:</span>
                  <span>{penalty}% principal</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectPlan(index, minDeposit)}
              className="w-full py-3 bg-white/5 border border-white/10 hover:border-neonBlue hover:bg-neonBlue/10 text-neonBlue font-semibold rounded-xl transition-all"
            >
              Select This Plan
            </button>
          </div>
        );
      })}
    </div>
  );
}
