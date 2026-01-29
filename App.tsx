import React, { useState, useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { PageTransition } from './components/PageTransition';
import { Toaster } from 'sonner';
import { useAccount } from 'wagmi';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Overview } from './pages/Dashboard';
import { UserRole } from './types';
import { Login } from './pages/Login';
import { CreatePayment } from './pages/CreatePayment';
import { Payments } from './pages/Payments';
import { PaymentDetail } from './pages/PaymentDetail';
import { Entities } from './pages/Entities';
import { Explore } from './pages/Explore';
import { ExploreJob } from './pages/ExploreJob';
import { Policies } from './pages/Policies';
import { Activity } from './pages/Activity';
import TreasuryPage from './app/dashboard/treasury/page';
// import { Treasury } from './pages/Treasury';
import { TreasuryOps } from './pages/TreasuryOps';
import { Settings } from './pages/Settings';
import { Providers } from './components/Providers';

const AppContent: React.FC = () => {
  const { isConnected, address } = useAccount();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const navigate = useNavigate();

  // Sync Wagmi state with App state
  useEffect(() => {
    if (isConnected && address && !userRole) {
      // Auto-login as Freelancer for now (or fetch actual role)
      handleLogin(UserRole.FREELANCER, address);
    } else if (!isConnected && userRole) {
      handleLogout();
    }
  }, [isConnected, address, userRole]);

  const handleLogin = (role: UserRole, address: string) => {
    setUserRole(role);
    setWalletAddress(address);
    navigate('/overview');
  };

  const handleLogout = () => {
    setUserRole(null);
    setWalletAddress(null);
    // Disconnect wagmi if needed, but for now just clear local state
    navigate('/');
  };



  const location = useLocation();

  return (
    <>
      <Layout
        userRole={userRole}
        walletAddress={walletAddress}
        onLogout={handleLogout}
        onConnect={() => navigate('/login')}
      >
        <AnimatePresence mode="wait">
          {/* @ts-ignore */}
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><Landing onConnect={() => navigate('/login')} /></PageTransition>} />
            <Route path="/login" element={<PageTransition><Login onConnectWallet={() => { }} /></PageTransition>} />
            <Route path="/overview" element={
              <PageTransition>
                <Overview />
              </PageTransition>
            } />
            <Route path="/dashboard" element={<Navigate to="/overview" replace />} />
            <Route path="/treasury" element={
              <PageTransition>
                <TreasuryPage />
              </PageTransition>
            } />
            <Route path="/treasury/ops" element={
              <PageTransition>
                <TreasuryOps />
              </PageTransition>
            } />
            <Route path="/payments" element={<PageTransition><Payments /></PageTransition>} />
            <Route path="/payments/new" element={<PageTransition><CreatePayment /></PageTransition>} />
            <Route path="/payments/:id" element={<PageTransition><PaymentDetail /></PageTransition>} />
            <Route path="/entities" element={<Navigate to="/overview" replace />} />
            <Route path="/explore" element={<PageTransition><Explore /></PageTransition>} />
            <Route path="/explore/:jobId" element={<PageTransition><ExploreJob /></PageTransition>} />
            <Route path="/policies" element={<Navigate to="/treasury" replace />} />
            <Route path="/activity" element={<Navigate to="/overview" replace />} />
            <Route path="/create-gig" element={<Navigate to="/payments/new" replace />} />
            <Route path="/gig-created-success" element={<Navigate to="/payments" replace />} />
            <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </Layout>
    </>
  );
};

function App() {
  useEffect(() => {
    sdk.actions.ready();
  }, []);

  return (
    <Providers>
      <HashRouter>
        <AppContent />
      </HashRouter>
      <Toaster position="bottom-right" theme="dark" />
    </Providers>
  );
}

export default App;
