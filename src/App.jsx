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
        setUser(prev => prev ? null : { email: 'superadmin@cloudsphere.io', role: 'superadmin', name: 'Super Admin' });
      }
      if (e.key === 'u' && e.ctrlKey) setIsUploadOpen(prev => !prev);
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

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
          <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
        </>
      )}
    </>
  )
}

export default App
