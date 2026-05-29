import React, { useState } from 'react'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import UploadModal from './components/UploadModal'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('My Files')
  const [searchQuery, setSearchQuery] = useState('')

  // Handle keys for testing convenience
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'l' && e.ctrlKey) setIsAuthenticated(prev => !prev);
      if (e.key === 'u' && e.ctrlKey) setIsUploadOpen(prev => !prev);
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
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
