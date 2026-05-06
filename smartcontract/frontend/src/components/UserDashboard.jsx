import { useAccount, useReadContract, useReadContracts, useWriteContract, useChainId, useBlockNumber } from 'wagmi';
import { addresses, SAVING_CORE_ABI } from '../constants';
import { formatUnits } from 'viem';
import { useEffect, useState } from 'react';

// Utility for creating procedural gradients from seed (Token ID)
const getGradient = (seed) => {
  const hues = [280, 310, 190, 220, 260, 340, 150];
  const color1 = `hsl(${hues[seed % hues.length]}, 100%, 40%)`;
  const color2 = `hsl(${hues[(seed + 1) % hues.length]}, 100%, 20%)`;
  return `linear-gradient(135deg, ${color1}, ${color2})`;
};

const StatusBadge = ({ deposit }) => {
  const [, , startAt, maturityAt, , , status] = deposit;
  const now = Math.floor(Date.now() / 1000);
  const isMatured = now >= Number(maturityAt);
  const inGracePeriod = isMatured && now <= Number(maturityAt) + 3 * 86400;

  if (Number(status) === 1) return <span className="text-gray-400 bg-gray-900 border border-gray-700 px-2 rounded-md text-xs">Withdrawn</span>;
  if (inGracePeriod) return <span className="text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 px-2 rounded-md text-xs animate-pulse">Awaiting Renewal / Withdrawal</span>;
  if (isMatured) return <span className="text-green-400 bg-green-400/10 border border-green-400/30 px-2 rounded-md text-xs">Matured</span>;

  return <span className="text-neonBlue bg-neonBlue/10 border border-neonBlue/30 px-2 rounded-md text-xs">Generating Profit</span>;
};

export function UserDashboard() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { SAVING_CORE_ADDRESS } = addresses[chainId] || addresses[31337];
  const { data: hash, writeContract, isPending } = useWriteContract();

  // 1. Fetch nextDepositId
  const { data: nextDepositId, refetch: refetchNextId } = useReadContract({
    address: SAVING_CORE_ADDRESS,
    abi: SAVING_CORE_ABI,
    functionName: 'nextDepositId',
  });

  // 2. Load owners of all deposits
  const numDeposits = Number(nextDepositId || 0);
  const allDepositIds = Array.from({ length: numDeposits }, (_, i) => i);

  const { data: ownersData, refetch: refetchOwners } = useReadContracts({
    contracts: allDepositIds.map((id) => ({
      address: SAVING_CORE_ADDRESS,
      abi: SAVING_CORE_ABI,
      functionName: 'ownerOf',
      args: [id],
    })),
  });

  // 3. Filter IDs belonging to current user
  const userIds = allDepositIds.filter((id, index) => {
    return ownersData?.[index]?.status === 'success' &&
      ownersData[index].result?.toLowerCase() === address?.toLowerCase();
  });

  // 4. Load Deposit Structs for the user
  const { data: depositsData, isLoading, refetch: refetchDeposits } = useReadContracts({
    contracts: userIds.map((id) => ({
      address: SAVING_CORE_ADDRESS,
      abi: SAVING_CORE_ABI,
      functionName: 'deposits',
      args: [id],
    })),
  });

  // 5. Fetch current accrued interest for each NFT (Only for Active ones)
  const activeUserIds = userIds.filter((id, index) => {
    const deposit = depositsData?.[index]?.result;
    return deposit && Number(deposit[6]) !== 1; // 6 is the status index, 1 is Withdrawn
  });

  const { data: interestData, refetch: refetchInterest } = useReadContracts({
    contracts: activeUserIds.map((id) => ({
      address: SAVING_CORE_ADDRESS,
      abi: SAVING_CORE_ABI,
      functionName: 'calculateInterest',
      args: [id],
    })),
    query: {
      enabled: activeUserIds.length > 0,
      refetchInterval: 5000, 
    }
  });

  // 6. Tự động Refetch mỗi khi có Block mới
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    refetchNextId();
    refetchOwners();
    refetchDeposits();
    refetchInterest();
  }, [blockNumber]);

  if (!address) return null;

  return (
    <div className="mt-16 mb-20 animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span className="text-neonPurple">✦</span> Manage Saving Books (NFT)
      </h2>

      {userIds.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-gray-500">
          You don't own any Saving Books yet. Choose a plan and invest!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {depositsData?.map((result, index) => {
            if (result.status !== 'success') return null;
            const deposit = result.result;
            const tokenId = userIds[index];
            const [planId, principal, startAt, maturityAt, aprBpsAtOpen, penaltyBpsAtOpen, status] = deposit;

            const activeIndex = activeUserIds.indexOf(tokenId);
            
            // Calculate LIVE interest locally for smooth display (sync with 365-day contract logic)
            const duration = currentTime > Number(startAt) ? BigInt(currentTime - Number(startAt)) : 0n;
            const liveInterest = (BigInt(principal) * BigInt(aprBpsAtOpen) * duration) / (365n * 24n * 3600n * 10000n);
            
            const isMatured = currentTime >= Number(maturityAt);
            const inGracePeriod = isMatured && currentTime <= Number(maturityAt) + 3 * 86400;
            const isWithdrawn = Number(status) === 1;

            return (
              <div key={tokenId} className="hover:-translate-y-1 transition-transform duration-300 rounded-2xl overflow-hidden shadow-xl border border-white/10 bg-darkSlate flex flex-col group">
                {/* NFT Art Header */}
                <div className="h-44 p-5 flex flex-col justify-between relative overflow-hidden" style={{ background: getGradient(tokenId) }}>
                  {/* Overlay sheen */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  <div className="flex justify-between items-start relative z-10">
                    <span className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider shadow-lg">
                      Book #{tokenId}
                    </span>
                    <StatusBadge deposit={deposit} />
                  </div>
                  
                  {/* Bottom Area: Balance & Interest */}
                  <div className="flex justify-between items-end relative z-10 gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-white/70 uppercase tracking-widest mb-1 truncate">Principal Balance</div>
                      <div className="text-2xl sm:text-3xl font-black text-white/95 truncate drop-shadow-md">
                        {formatUnits(principal, 6)} <span className="text-xs font-normal opacity-60">USDC</span>
                      </div>
                    </div>

                    {/* Display Accrued Interest */}
                    {!isWithdrawn && (
                      <div className="text-right flex-shrink-0 animate-pulse pb-1">
                        <div className="text-[9px] text-white/50 uppercase tracking-tighter">Accrued Profit (+{Number(aprBpsAtOpen) / 100}%)</div>
                        <div className="text-lg sm:text-xl font-bold text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
                          +{formatUnits(liveInterest, 6)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info Body */}
                <div className="p-5 flex-1 bg-white/5">
                  <div className="flex justify-between text-sm text-gray-400 mb-3">
                    <span>Plan ID:</span>
                    <span className="text-white font-mono">{Number(planId)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400 mb-3">
                    <span>Open Date:</span>
                    <span className="text-white">
                      {new Date(Number(startAt) * 1000).toLocaleDateString("en-US")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>Maturity Date:</span>
                    <span className={isMatured && !isWithdrawn ? "text-green-400 font-bold" : "text-white"}>
                      {new Date(Number(maturityAt) * 1000).toLocaleDateString("en-US")}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 border-t border-white/10 bg-black/40 flex gap-3">
                  {!isWithdrawn && isMatured && (
                    <>
                      <button
                        onClick={() => writeContract({ address: SAVING_CORE_ADDRESS, abi: SAVING_CORE_ABI, functionName: 'withdrawAtMaturity', args: [tokenId] })}
                        disabled={isPending}
                        className="flex-1 py-2.5 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-xl text-sm font-bold transition shadow-[0_0_10px_rgba(34,197,94,0.1)] hover:shadow-[0_0_15px_rgba(34,197,94,0.3)] disabled:opacity-50"
                      >Withdraw at Maturity</button>
                      {inGracePeriod && (
                        <button
                          onClick={() => writeContract({ address: SAVING_CORE_ADDRESS, abi: SAVING_CORE_ABI, functionName: 'manualRenew', args: [tokenId, planId] })}
                          disabled={isPending}
                          className="flex-1 py-2.5 bg-neonBlue/20 text-neonBlue hover:bg-neonBlue/30 rounded-xl text-sm font-bold transition shadow-[0_0_10px_rgba(0,210,255,0.1)] hover:shadow-[0_0_15px_rgba(0,210,255,0.3)] disabled:opacity-50"
                        >Renew</button>
                      )}
                    </>
                  )}
                  {!isWithdrawn && !isMatured && (
                    <button
                      onClick={() => writeContract({ address: SAVING_CORE_ADDRESS, abi: SAVING_CORE_ABI, functionName: 'earlyWithdraw', args: [tokenId] })}
                      disabled={isPending}
                      className="w-full py-2.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 rounded-xl text-sm font-bold transition disabled:opacity-50"
                    >Early Withdraw (Penalty {Number(penaltyBpsAtOpen) / 100}%)</button>
                  )}
                  {isWithdrawn && (
                    <div className="w-full py-2.5 text-center text-gray-500 text-sm italic font-medium">
                      ✓ Payment completed
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
