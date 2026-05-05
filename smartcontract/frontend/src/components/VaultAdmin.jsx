import { useState, useEffect } from 'react';
import { useReadContract, useReadContracts, useWriteContract, useAccount, useChainId, useBlockNumber } from 'wagmi';
import { addresses, VAULT_MANAGER_ABI, USDC_ABI, SAVING_CORE_ABI } from '../constants';
import { formatUnits, parseUnits } from 'viem';

export function VaultAdmin() {
  const { address } = useAccount();
  const chainId = useChainId();
  const { VAULT_MANAGER_ADDRESS, USDC_ADDRESS, SAVING_CORE_ADDRESS } = addresses[chainId] || addresses[31337];
  const [activeTab, setActiveTab] = useState('overview'); // overview, finance, plans, bot, settings

  // States for forms
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [fundAmount, setFundAmount] = useState('');
  const [newSavingCore, setNewSavingCore] = useState('');
  const [planTenor, setPlanTenor] = useState('');
  const [planApr, setPlanApr] = useState('');
  const [planMin, setPlanMin] = useState('');
  const [planMax, setPlanMax] = useState('');
  const [planPenalty, setPlanPenalty] = useState('');

  // Edit State
  const [editingPlanId, setEditingPlanId] = useState(null);

  const { data: hash, writeContract } = useWriteContract();

  // Data
  const { data: isPaused, refetch: refetchPaused } = useReadContract({ address: VAULT_MANAGER_ADDRESS, abi: VAULT_MANAGER_ABI, functionName: 'paused' });
  const { data: vaultBalance, refetch: refetchBalance } = useReadContract({ address: USDC_ADDRESS, abi: USDC_ABI, functionName: 'balanceOf', args: [VAULT_MANAGER_ADDRESS] });
  const { data: ownerAddress } = useReadContract({ address: VAULT_MANAGER_ADDRESS, abi: VAULT_MANAGER_ABI, functionName: 'owner' });
  const { data: nextDepositId, refetch: refetchNextDeposit } = useReadContract({ address: SAVING_CORE_ADDRESS, abi: SAVING_CORE_ABI, functionName: 'nextDepositId' });
  const { data: nextPlanId, refetch: refetchNextPlan } = useReadContract({ address: SAVING_CORE_ADDRESS, abi: SAVING_CORE_ABI, functionName: 'nextPlanId' });

  const isOwner = address?.toLowerCase() === ownerAddress?.toLowerCase();

  // Load All Plans for Management
  const numPlans = Number(nextPlanId || 0);
  const planIds = Array.from({ length: numPlans }, (_, i) => i);
  const { data: allPlansData, refetch: refetchPlans } = useReadContracts({
    contracts: planIds.map(id => ({ address: SAVING_CORE_ADDRESS, abi: SAVING_CORE_ABI, functionName: 'plans', args: [id] }))
  });

  // Bot logic
  const numDeposits = Number(nextDepositId || 0);
  const allIds = Array.from({ length: numDeposits }, (_, i) => i);
  const { data: allDepositsData, refetch: refetchAllDeposits } = useReadContracts({
    contracts: allIds.map(id => ({ address: SAVING_CORE_ADDRESS, abi: SAVING_CORE_ABI, functionName: 'deposits', args: [id] }))
  });
  const eligibleForAutoRenew = allIds.filter((id, index) => {
    const data = allDepositsData?.[index]?.result;
    if (!data) return false;
    const [, , , maturityAt, , , status] = data;
    return Number(status) !== 1 && Math.floor(Date.now() / 1000) > (Number(maturityAt) + 3 * 86400);
  });

  // 6. Tự động Refetch mỗi khi có Block mới
  const { data: blockNumber } = useBlockNumber({ watch: true });

  useEffect(() => {
    refetchPaused();
    refetchBalance();
    refetchNextDeposit();
    refetchNextPlan();
    refetchPlans();
    refetchAllDeposits();
  }, [blockNumber]);

  if (!isOwner) return <AccessDenied />;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { id: 'finance', label: 'Finance', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'plans', label: 'Products', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { id: 'bot', label: 'Automation', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' }
  ];

  const handleStartEdit = (id, data) => {
    setEditingPlanId(id);
    setPlanTenor(data[0].toString());
    setPlanApr((Number(data[1]) / 100).toString());
    setPlanMin(formatUnits(data[2], 6));
    setPlanMax(formatUnits(data[3], 6));
    setPlanPenalty((Number(data[4]) / 100).toString());
  };

  const handleUpdatePlan = () => {
    writeContract({
      address: SAVING_CORE_ADDRESS,
      abi: SAVING_CORE_ABI,
      functionName: 'updatePlan',
      args: [editingPlanId, Number(planTenor), Number(planApr) * 100, parseUnits(planMin, 6), parseUnits(planMax, 6), Number(planPenalty) * 100]
    });
    setEditingPlanId(null);
  };

  const handleToggleStatus = (id, currentStatus) => {
    writeContract({
      address: SAVING_CORE_ADDRESS,
      abi: SAVING_CORE_ABI,
      functionName: 'togglePlanStatus',
      args: [id, !currentStatus]
    });
  };

  return (
    <div className="flex min-h-[700px] bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl animate-in fade-in duration-700">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-black/20 p-8 flex flex-col gap-10">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-neonPurple rounded-lg shadow-lg shadow-purple-500/50" />
          <span className="font-black text-white tracking-widest text-lg uppercase">OCFPVault</span>
        </div>

        <nav className="flex flex-col gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-white/10 text-white shadow-xl' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} /></svg>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-3xl border border-white/5">
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2 text-center">Admin Mode</p>
          <div className="text-center font-mono text-[8px] text-purple-400 break-all">{address}</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-12 overflow-y-auto">
        <header className="flex justify-between items-start mb-12">
          <div>
            <h2 className="text-3xl font-black text-white capitalize">{tabs.find(t => t.id === activeTab).label}</h2>
            <p className="text-gray-500 text-sm mt-1">Contract and cash flow management system.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-xl border text-[10px] font-bold ${isPaused ? 'border-red-500/50 text-red-500' : 'border-emerald-500/50 text-emerald-500'}`}>
              {isPaused ? '● PAUSED' : '● ACTIVE'}
            </div>
          </div>
        </header>

        <div className="animate-in slide-in-from-right-4 duration-500">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <StatCard label="Vault Liquidity" value={vaultBalance ? formatUnits(vaultBalance, 6) : '0.00'} unit="USDC" color="text-emerald-400" />
              <StatCard label="Total Plans" value={numPlans} unit="Plans" color="text-neonBlue" />
              <div className="md:col-span-2 bg-white/5 border border-white/10 p-8 rounded-[2rem]">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-white font-bold">Security Status</h4>
                  <button
                    onClick={() => writeContract({ address: VAULT_MANAGER_ADDRESS, abi: VAULT_MANAGER_ABI, functionName: isPaused ? 'unpause' : 'pause' })}
                    className={`px-6 py-2 rounded-xl font-bold text-xs ${isPaused ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}
                  >
                    {isPaused ? 'Activate System' : 'Emergency Stop'}
                  </button>
                </div>
                <div className="space-y-3 opacity-60">
                  <InfoRow label="VaultManager" value={VAULT_MANAGER_ADDRESS} />
                  <InfoRow label="SavingCore" value={SAVING_CORE_ADDRESS} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'finance' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FinanceBox
                title="Pump Liquidity"
                desc="Deposit USDC into the Vault to ensure interest payment capacity."
                value={fundAmount}
                onChange={setFundAmount}
                onAction={() => writeContract({ address: USDC_ADDRESS, abi: USDC_ABI, functionName: 'transfer', args: [VAULT_MANAGER_ADDRESS, parseUnits(fundAmount, 6)] })}
                btnText="Deposit Now"
                theme="emerald"
              />
              <FinanceBox
                title="Withdraw Surplus"
                desc="Withdraw funds from the Vault to Admin wallet (Max 90% balance)."
                value={withdrawAmount}
                onChange={setWithdrawAmount}
                onAction={() => writeContract({ address: VAULT_MANAGER_ADDRESS, abi: VAULT_MANAGER_ABI, functionName: 'withdraw', args: [address, parseUnits(withdrawAmount, 6)] })}
                btnText="Withdraw Now"
                theme="purple"
              />
            </div>
          )}

          {activeTab === 'plans' && (
            <div className="space-y-12">
              {/* Form Create/Edit */}
              <div className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                  {editingPlanId !== null && <button onClick={() => setEditingPlanId(null)} className="text-xs text-gray-500 hover:text-white">× Cancel Edit</button>}
                </div>
                <h4 className="text-xl font-bold text-white mb-4">{editingPlanId !== null ? `Edit Plan #${editingPlanId}` : 'Add New Product'}</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                  <InputGroup label="Tenor (Days)" value={planTenor} onChange={setPlanTenor} />
                  <InputGroup label="APR Interest Rate (%)" value={planApr} onChange={setPlanApr} />
                  <InputGroup label="Penalty Fee (%)" value={planPenalty} onChange={setPlanPenalty} />
                  <InputGroup label="Minimum (USDC)" value={planMin} onChange={setPlanMin} />
                  <div className="md:col-span-2">
                    <InputGroup label="Maximum (USDC)" value={planMax} onChange={setPlanMax} />
                  </div>
                </div>
                <button
                  onClick={editingPlanId !== null ? handleUpdatePlan : () => writeContract({ address: SAVING_CORE_ADDRESS, abi: SAVING_CORE_ABI, functionName: 'createPlan', args: [Number(planTenor), Number(planApr) * 100, parseUnits(planMin, 6), parseUnits(planMax, 6), Number(planPenalty) * 100] })}
                  className={`w-full ${editingPlanId !== null ? 'bg-orange-600' : 'bg-neonBlue'} text-white py-5 rounded-3xl font-black text-sm tracking-[0.2em] shadow-2xl transition-all`}
                >
                  {editingPlanId !== null ? 'CONFIRM UPDATE' : 'RELEASE PRODUCT'}
                </button>
              </div>

              {/* List Plans */}
              <div className="space-y-4">
                <h4 className="text-gray-500 text-xs font-bold uppercase tracking-widest px-4">List of existing products</h4>
                <div className="grid grid-cols-1 gap-4">
                  {planIds.map(id => {
                    const data = allPlansData?.[id]?.result;
                    if (!data) return null;
                    return (
                      <div key={id} className="bg-white/5 border border-white/10 p-6 rounded-3xl flex justify-between items-center group hover:bg-white/[0.08] transition-all">
                        <div className="flex gap-8 items-center">
                          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center font-black text-white">#{id}</div>
                          <div>
                            <p className="text-white font-bold">{data[0].toString()} Days - {Number(data[1]) / 100}% APR</p>
                            <p className="text-[10px] text-gray-500">Min: {formatUnits(data[2], 6)} | Max: {formatUnits(data[3], 6)} | Penalty: {Number(data[4]) / 100}%</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleStartEdit(id, data)} className="p-3 bg-white/5 hover:bg-white/20 rounded-xl text-gray-400 hover:text-white transition-all">Edit</button>
                          <button
                            onClick={() => handleToggleStatus(id, data[5])}
                            className={`px-4 py-3 rounded-xl text-[10px] font-bold transition-all ${data[5] ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'}`}
                          >
                            {data[5] ? 'Enabled' : 'Disabled'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bot' && (
            <div className="space-y-6">
              {eligibleForAutoRenew.length === 0 ? (
                <div className="p-20 text-center bg-black/20 rounded-[2.5rem] border border-dashed border-white/10">
                  <p className="text-gray-500 italic">System clean. No saving books need processing.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {eligibleForAutoRenew.map(id => (
                    <div key={id} className="flex justify-between items-center bg-white/5 border border-white/10 p-6 rounded-3xl">
                      <div>
                        <p className="text-white font-bold text-lg">Saving Book #{id}</p>
                        <p className="text-xs text-gray-500 uppercase">Status: Grace period expired (Bot Trigger Required)</p>
                      </div>
                      <button
                        onClick={() => writeContract({ address: SAVING_CORE_ADDRESS, abi: SAVING_CORE_ABI, functionName: 'autoRenew', args: [id] })}
                        className="bg-orange-600 text-white px-8 py-3 rounded-2xl font-black text-xs transition-all hover:bg-orange-500"
                      >ACTIVATE BOT</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-xl space-y-8">
              <div className="space-y-4">
                <label className="text-xs text-gray-500 uppercase tracking-widest font-bold">Upgrade SavingCore (Address)</label>
                <div className="flex gap-3">
                  <input type="text" value={newSavingCore} onChange={e => setNewSavingCore(e.target.value)} placeholder="0x..." className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-pink-500" />
                  <button onClick={() => writeContract({ address: VAULT_MANAGER_ADDRESS, abi: VAULT_MANAGER_ABI, functionName: 'setSavingCore', args: [newSavingCore] })} className="bg-pink-600 text-white px-8 rounded-2xl font-bold text-sm">Update</button>
                </div>
                <p className="text-xs text-red-500 italic">Note: Only change when you deploy a new Smart Contract.</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, unit, color }) {
  return (
    <div className="bg-white/5 p-8 rounded-[2rem] border border-white/10">
      <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">{label}</p>
      <div className={`text-4xl font-black ${color}`}>{value} <span className="text-sm font-normal opacity-40">{unit}</span></div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-gray-500 font-bold uppercase tracking-tighter">{label}</span>
      <span className="text-white font-mono opacity-80">{value}</span>
    </div>
  );
}

function FinanceBox({ title, desc, value, onChange, onAction, btnText, theme }) {
  const colors = theme === 'emerald' ? 'bg-emerald-600' : 'bg-purple-600';
  return (
    <div className={`bg-white/5 border border-white/10 p-8 rounded-[2rem] space-y-6`}>
      <div>
        <h4 className={`text-xl font-black ${theme === 'emerald' ? 'text-emerald-400' : 'text-purple-400'}`}>{title}</h4>
        <p className="text-xs text-gray-500 mt-1">{desc}</p>
      </div>
      <div className="space-y-4">
        <input type="number" value={value} onChange={e => onChange(e.target.value)} placeholder="0.00" className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none" />
        <button onClick={onAction} className={`w-full ${colors} text-white py-4 rounded-2xl font-black text-xs tracking-widest shadow-xl`}>{btnText}</button>
      </div>
    </div>
  );
}

function InputGroup({ label, value, onChange }) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black">{label}</label>
      <input type="number" value={value} onChange={e => onChange(e.target.value)} placeholder="..." className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-neonBlue" />
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="flex items-center justify-center min-h-[500px]">
      <div className="bg-red-500/10 border border-red-500/50 p-12 rounded-[3rem] text-center max-w-md">
        <h2 className="text-3xl font-black text-red-500 mb-4 uppercase">Access Denied</h2>
        <p className="text-gray-400 text-sm">Please connect Owner wallet to operate the system.</p>
      </div>
    </div>
  );
}
