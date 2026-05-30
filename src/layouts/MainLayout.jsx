import React from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export default function MainLayout({ children, activeTab, setActiveTab, onLogoutClick, onUpgradeClick, searchQuery, setSearchQuery, user }) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onUpgradeClick={onUpgradeClick} user={user} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Topbar user={user} onLogoutClick={onLogoutClick} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
