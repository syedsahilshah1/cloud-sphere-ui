import React, { useState } from 'react'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import UploadModal from './components/UploadModal'

function App() {
  const [user, setUser] = useState(null)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('My Files')
  const [searchQuery, setSearchQuery] = useState('')

  const isAuthenticated = !!user;

  // Handle keys for testing convenience
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'l' && e.ctrlKey) {
        setUser(prev => prev ? null : { 
          email: 'sahilkhan536ah@gmail.com', 
          role: 'superadmin', 
          name: 'Sahil Shah',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
        });
      }
      if (e.key === 'u' && e.ctrlKey) setIsUploadOpen(prev => !prev);
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleUserUpdate = (updatedUserData) => {
    setUser(updatedUserData);
    const accountsStr = localStorage.getItem('cs_google_accounts');
    if (accountsStr) {
      try {
        const accounts = JSON.parse(accountsStr);
        const index = accounts.findIndex(acc => acc.email === updatedUserData.email);
        if (index !== -1) {
          accounts[index] = { ...accounts[index], ...updatedUserData };
          localStorage.setItem('cs_google_accounts', JSON.stringify(accounts));
        }
      } catch (err) {
        console.error('Failed to update persisted user accounts:', err);
      }
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('My Files');
    setSearchQuery('');
  };

  const handleUpgrade = () => {
    alert('Plan Upgrade request sent! Capacity expansion options initialized.');
  };

  return (
    <>
      {!isAuthenticated ? (
        <Login onLogin={handleLogin} />
      ) : (
        <>
          <Dashboard 
            user={user}
            onUserUpdate={handleUserUpdate}
            activeTab={activeTab}
            setActiveTab={(tab) => {
              setActiveTab(tab);
              // Preset query for the Google Drive view matching screenshot
              if (tab === 'Google Drive') {
                setSearchQuery('presentation assets');
              } else {
                setSearchQuery('');
              }
            }}
            onUploadClick={() => setIsUploadOpen(true)}
            onLogoutClick={handleLogout}
            onUpgradeClick={handleUpgrade}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
          <UploadModal 
            isOpen={isUploadOpen} 
            onClose={() => setIsUploadOpen(false)} 
            user={user}
            onUploadComplete={() => {
              if (typeof window !== 'undefined' && window.refreshDashboard) {
                window.refreshDashboard();
              }
            }}
          />
        </>
      )}
    </>
  )
}

export default App
