import React from 'react';
import { Cloud, Folder, Users, Trash2, Database, Settings, HelpCircle, Plus, Shield } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Sidebar({ activeTab, setActiveTab, onUpgradeClick, user }) {
  const navItems = [
    { name: 'My Files', icon: Folder },
    { name: 'Google Drive', icon: Cloud },
    { name: 'Shared', icon: Users },
    ...(user?.role === 'superadmin' ? [{ name: 'Users Control', icon: Shield }] : []),
    { name: 'Trash', icon: Trash2 },
    { name: 'Storage', icon: Database },
  ];

  return (
    <div className="w-64 bg-slate-50 border-r border-slate-200 h-screen flex flex-col p-4 flex-shrink-0">
      <div className="mb-8 pl-4">
        <h1 className="text-xl font-bold text-indigo-600">CloudSphere</h1>
        <p className="text-xs text-slate-500">Premium Storage</p>
      </div>

      <div className="mb-6 px-2">
        <button 
          onClick={onUpgradeClick}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 font-medium transition-colors shadow-sm"
        >
          <Plus size={20} /> Upgrade Plan
        </button>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.name;
          return (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left",
                isActive 
                  ? "bg-indigo-50 text-indigo-700 relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-indigo-600 before:rounded-r" 
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <item.icon size={20} className={isActive ? "text-indigo-600" : "text-slate-400"} />
              {item.name}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto">
        <div className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-slate-100 flex flex-col items-center text-center">
          <div className="relative w-24 h-24 mb-3">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-indigo-600"
                strokeWidth="4"
                strokeDasharray="68, 100"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-bold text-slate-800">68%</span>
              <span className="text-[10px] text-slate-500 font-medium uppercase">Used</span>
            </div>
          </div>
          <p className="text-sm font-semibold text-slate-800">1.2 TB / 2 TB</p>
          <p className="text-xs text-slate-500 mt-1">Storage almost full</p>
        </div>

        <div className="space-y-1">
          <a href="#" className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
            <Settings size={20} className="text-slate-400" /> Settings
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg">
            <HelpCircle size={20} className="text-slate-400" /> Help
          </a>
        </div>
      </div>
    </div>
  );
}
