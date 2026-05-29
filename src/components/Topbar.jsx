import React from 'react';
import { Search, Bell, Settings } from 'lucide-react';

export default function Topbar({ onLogoutClick, searchQuery, setSearchQuery }) {
  return (
    <div className="h-20 border-b border-slate-200 px-8 flex items-center justify-between bg-slate-50 sticky top-0 z-10">
      <div className="flex-1 max-w-2xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search your files..." 
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 border-none rounded-full py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-shadow"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-6 ml-4">
        <button className="text-slate-500 hover:text-slate-800 transition-colors">
          <Bell size={20} />
        </button>
        <button className="text-slate-500 hover:text-slate-800 transition-colors">
          <Settings size={20} />
        </button>
        <button 
          onClick={onLogoutClick}
          title="Click to logout"
          className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-200 hover:border-indigo-600 transition-colors cursor-pointer"
        >
          <img 
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80" 
            alt="User profile" 
            className="w-full h-full object-cover"
          />
        </button>
      </div>
    </div>
  );
}
