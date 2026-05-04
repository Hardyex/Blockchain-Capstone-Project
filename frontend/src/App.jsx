import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useState } from 'react';
import { SavingPlans } from './components/SavingPlans';
import { UserDashboard } from './components/UserDashboard';
import { DepositForm } from './components/DepositForm';
import { VaultAdmin } from './components/VaultAdmin';

function App() {
  const { isConnected } = useAccount();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [view, setView] = useState('user'); // 'user' or 'admin'

  const handleSelectPlan = (planId, minDeposit) => {
    setSelectedPlan({ planId, minDeposit });
  };

  return (
    <div className="min-h-screen bg-transparent relative font-sans">
      {/* Cinematic Ambient Lighting */}
      <div className="fixed inset-0 z-[-1] bg-[#020617] overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-neonBlue/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-neonPurple/20 rounded-full blur-[150px] pointer-events-none"></div>
      </div>

      <nav className="border-b border-white/10 bg-[#020617]/40 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neonBlue to-neonPurple flex items-center justify-center">
                  <span className="text-white font-bold text-x1 drop-shadow-md">OP</span>
                </div>
                <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 tracking-tight">
                  O<span className="text-neonBlue">C</span>F<span className="text-neonBlue">P</span>
                </h1>
              </div>

              {/* View Switcher */}
              <div className="hidden md:flex bg-white/5 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setView('user')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${view === 'user' ? 'bg-neonBlue text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                  USER
                </button>
                <button
                  onClick={() => setView('admin')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${view === 'admin' ? 'bg-neonPurple text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                  ADMIN
                </button>
              </div>
            </div>

            <div>
              <ConnectButton
                chainStatus="icon"
                showBalance={false}
                accountStatus={{
                  smallScreen: 'avatar',
                  largeScreen: 'full',
                }}
              />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {view === 'user' ? (
          <>
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight drop-shadow-lg">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-neonBlue to-neonPurple">One Capital - Four Profits</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                Welcome to the era of decentralized savings. Choose the right plans to receive high interest rates instantly.
              </p>
            </div>

            {isConnected ? (
              <div>
                <UserDashboard />

                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 mt-8">
                  <span className="text-neonBlue">◈</span> Featured Saving Plans
                </h2>
                <SavingPlans onSelectPlan={handleSelectPlan} />

                {selectedPlan && (
                  <DepositForm
                    planId={selectedPlan.planId}
                    minDeposit={selectedPlan.minDeposit}
                    onClose={() => setSelectedPlan(null)}
                  />
                )}
              </div>
            ) : (
              <AuthPlaceholder />
            )}
          </>
        ) : (
          <VaultAdmin />
        )}
      </main>
    </div>
  );
}

function AuthPlaceholder() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center max-w-3xl mx-auto backdrop-blur-xl flex flex-col items-center shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
      <div className="w-20 h-20 bg-neonPurple/20 text-neonPurple rounded-full flex items-center justify-center mb-6">
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h3 className="text-2xl font-bold text-white mb-3">Wallet Locked</h3>
      <p className="text-gray-400 mb-8 max-w-md">Please connect your Web3 wallet using the button in the top right corner to view your personal Saving Book data and Interest Rates.</p>
    </div>
  );
}

export default App;