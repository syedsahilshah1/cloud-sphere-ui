import React, { useState } from 'react';
import { Cloud, Lock, Mail, ShieldCheck, Shield, User, ShieldAlert } from 'lucide-react';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('kc@cloudsphere.io');
  const [password, setPassword] = useState('password123');
  const [selectedRole, setSelectedRole] = useState('user'); // 'user' or 'superadmin'

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    if (role === 'superadmin') {
      setEmail('superadmin@cloudsphere.io');
    } else {
      setEmail('kc@cloudsphere.io');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onLogin) {
      const isSuper = email.trim().toLowerCase() === 'superadmin@cloudsphere.io';
      onLogin({
        email: email.trim(),
        name: isSuper ? 'Super Admin' : 'KC Developer',
        role: isSuper ? 'superadmin' : 'user',
        avatar: isSuper 
          ? 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80'
          : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'
      });
    }
  };

  const handleThirdPartyLogin = () => {
    if (onLogin) {
      const isSuper = selectedRole === 'superadmin';
      onLogin({
        email: isSuper ? 'superadmin@cloudsphere.io' : 'kc@cloudsphere.io',
        name: isSuper ? 'Super Admin' : 'KC Developer',
        role: isSuper ? 'superadmin' : 'user',
        avatar: isSuper 
          ? 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80'
          : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 blur-3xl mix-blend-multiply"></div>
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-100/50 blur-3xl mix-blend-multiply"></div>
      </div>

      <div className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 font-medium z-10 text-sm tracking-wide">
        <ShieldCheck size={18} className="text-indigo-600" />
        MILITARY GRADE ENCRYPTION
      </div>

      <div className="bg-white/80 backdrop-blur-xl w-full max-w-md rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 p-10 z-10">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-600/20">
            <Cloud className="text-white w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-indigo-600">CloudSphere</h1>
          <p className="text-slate-500 text-sm mt-1">Unlock your digital vault</p>
        </div>

        {/* Premium Role Selection Toggle */}
        <div className="bg-slate-100 p-1.5 rounded-2xl flex gap-1 mb-6">
          <button
            type="button"
            onClick={() => handleRoleChange('user')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedRole === 'user'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <User size={14} />
            Standard User
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('superadmin')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedRole === 'superadmin'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Shield size={14} />
            Super Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="email" 
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (e.target.value.trim().toLowerCase() === 'superadmin@cloudsphere.io') {
                    setSelectedRole('superadmin');
                  } else {
                    setSelectedRole('user');
                  }
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all text-slate-700 placeholder:text-slate-400 font-medium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Forgot password?</a>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all text-slate-700 placeholder:text-slate-400 font-medium"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember" defaultChecked className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
              <label htmlFor="remember" className="text-sm text-slate-600">Remember session</label>
            </div>
            {selectedRole === 'superadmin' && (
              <span className="flex items-center gap-1 text-xs text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                <ShieldAlert size={12} />
                Admin Credentials
              </span>
            )}
          </div>

          <button 
            type="submit" 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 rounded-xl transition-all mt-4 shadow-lg shadow-indigo-600/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
          >
            Sign In as {selectedRole === 'superadmin' ? 'Super Admin' : 'Standard User'} <span className="text-lg">→</span>
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center space-x-4 before:h-px before:bg-slate-200 before:flex-1 after:h-px after:bg-slate-200 after:flex-1">
          <span className="text-[10px] text-slate-400 font-bold px-2 uppercase tracking-wider">or continue with</span>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <button 
            type="button"
            onClick={handleThirdPartyLogin}
            className="flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-medium rounded-xl transition-colors cursor-pointer border border-slate-200/50"
          >
            Google
          </button>
          <button 
            type="button"
            onClick={handleThirdPartyLogin}
            className="flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-medium rounded-xl transition-colors cursor-pointer border border-slate-200/50"
          >
            Apple
          </button>
        </div>

        <p className="text-center text-xs text-slate-500 mt-6">
          Selected Account Role: <span className="font-bold text-indigo-600 capitalize">{selectedRole}</span>
        </p>
      </div>

      <div className="absolute bottom-8 right-8 text-slate-400 hover:text-slate-600 cursor-pointer z-10 bg-white p-2.5 rounded-full shadow-sm border border-slate-100">
        <HelpCircle size={20} />
      </div>
    </div>
  );
}

function HelpCircle({ size, className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  );
}
