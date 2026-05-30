import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Settings, LogOut, User, Shield } from 'lucide-react';

export default function Topbar({ user, onLogoutClick, searchQuery, setSearchQuery }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userAvatar = user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80';
  const userName = user?.name || 'Sahil Shah';
  const userEmail = user?.email || 'sahilkhan536ah@gmail.com';
  const userRole = user?.role || 'user';

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
        
        {/* Premium Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-200 hover:border-indigo-600 transition-colors cursor-pointer focus:outline-none flex items-center justify-center bg-white shadow-sm"
          >
            <img 
              src={userAvatar} 
              alt={userName} 
              className="w-full h-full object-cover"
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl py-3 animate-fade-in z-50">
              <div className="px-4 py-2 border-b border-slate-100 flex items-start gap-3">
                <img 
                  src={userAvatar} 
                  alt={userName} 
                  className="w-10 h-10 rounded-full object-cover border border-slate-100"
                />
                <div className="overflow-hidden flex-1">
                  <h4 className="font-bold text-slate-800 text-xs truncate leading-tight">{userName}</h4>
                  <p className="text-[10px] text-slate-500 truncate leading-relaxed mt-0.5">{userEmail}</p>
                  <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider mt-1.5 border ${
                    userRole === 'superadmin' 
                      ? 'bg-rose-50 border-rose-100 text-rose-700' 
                      : 'bg-indigo-50 border-indigo-100 text-indigo-700'
                  }`}>
                    {userRole === 'superadmin' ? (
                      <>
                        <Shield size={8} />
                        SuperAdmin
                      </>
                    ) : (
                      <>
                        <User size={8} />
                        User
                      </>
                    )}
                  </span>
                </div>
              </div>

              <div className="px-2 pt-2">
                <button 
                  onClick={() => {
                    setDropdownOpen(false);
                    onLogoutClick && onLogoutClick();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer text-left"
                >
                  <LogOut size={14} />
                  <span>Sign Out Account</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

