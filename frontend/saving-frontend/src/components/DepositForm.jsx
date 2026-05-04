import { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { addresses, SAVING_CORE_ABI, USDC_ABI } from '../constants';
import { parseUnits, formatUnits } from 'viem';

export function DepositForm({ planId, minDeposit, onClose }) {
  const chainId = useChainId();
  const { SAVING_CORE_ADDRESS, USDC_ADDRESS } = addresses[chainId] || addresses[31337];
  const [depositAmount, setDepositAmount] = useState(minDeposit ? formatUnits(minDeposit, 6) : "100");
  
  const { data: hashApprove, writeContract: writeApprove, isPending: isApproving } = useWriteContract();
  const { data: hashDeposit, writeContract: writeDeposit, isPending: isDepositing } = useWriteContract();

  const { isSuccess: isApproveSuccess, isLoading: isWaitingApprove } = useWaitForTransactionReceipt({ hash: hashApprove });
  const { isSuccess: isDepositSuccess, isLoading: isWaitingDeposit } = useWaitForTransactionReceipt({ hash: hashDeposit });

  // Auto trigger deposit once approve is mined successfully
  useEffect(() => {
    if (isApproveSuccess && depositAmount) {
      writeDeposit({
        address: SAVING_CORE_ADDRESS,
        abi: SAVING_CORE_ABI,
        functionName: 'openDeposit',
        args: [planId, parseUnits(depositAmount, 6)],
      });
    }
  }, [isApproveSuccess]);

  // Close modal when deposit is mined
  useEffect(() => {
    if (isDepositSuccess && onClose) {
      setTimeout(() => onClose(), 1500); // 1.5s delay to show success state
    }
  }, [isDepositSuccess]);

  const handleAction = async () => {
    if (!depositAmount || isNaN(depositAmount) || Number(depositAmount) <= 0) return;
    const amount = parseUnits(depositAmount, 6);

    // Start 2-step sequence: Approve -> OpenDeposit
    writeApprove({
      address: USDC_ADDRESS,
      abi: USDC_ABI,
      functionName: 'approve',
      args: [SAVING_CORE_ADDRESS, amount],
    });
  };

  const isBusy = isApproving || isWaitingApprove || isDepositing || isWaitingDeposit;
  let statusText = `Confirm Deposit ${depositAmount || '0'} USDC`;
  if (isApproving) statusText = "Signing Approve on wallet...";
  else if (isWaitingApprove) statusText = "Waiting for network to process Approve...";
  else if (isDepositing) statusText = "Signing Open Deposit on wallet...";
  else if (isWaitingDeposit) statusText = "Waiting for network to process Deposit...";
  else if (isDepositSuccess) statusText = "Success!";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={!isBusy ? onClose : undefined}></div>
      
      {/* Modal Card */}
      <div className="relative bg-darkSlate border border-white/20 p-8 rounded-3xl shadow-2xl w-full max-w-md animate-fade-in-up">
        {/* Neon top border */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neonBlue to-neonPurple rounded-t-3xl"></div>
        
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white">Deposit Funds (Plan #{planId})</h3>
          {!isBusy && (
            <button onClick={onClose} className="text-gray-400 hover:text-white transition">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-300 mb-2 pl-1">
              Deposit amount (USDC)
            </label>
            <div className="relative flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-neonBlue transition-all duration-300">
              <input
                type="number"
                min={minDeposit ? formatUnits(minDeposit, 6) : "0"}
                step="10"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                disabled={isBusy || isDepositSuccess}
                className="w-full bg-transparent text-white px-5 py-4 outline-none text-xl font-bold placeholder-gray-500 disabled:opacity-50"
              />
              <div className="absolute right-4 flex items-center gap-2">
                <span className="text-neonBlue font-semibold tracking-wider">USDC</span>
              </div>
            </div>
            {minDeposit > 0 && (
              <p className="mt-2 text-xs text-neonPurple pl-1">Minimum: {formatUnits(minDeposit, 6)} USDC</p>
            )}
          </div>

          <button 
            onClick={handleAction} 
            disabled={isBusy || isDepositSuccess}
            className={`w-full mt-4 relative overflow-hidden group py-4 text-lg font-bold rounded-xl transition-all duration-300 ${
              isDepositSuccess 
                ? "bg-green-500/20 text-green-400 border border-green-500/50" 
                : "bg-gradient-to-r from-neonBlue to-neonPurple text-white hover:shadow-neon hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
            }`}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isBusy && (
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span>{statusText}</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}