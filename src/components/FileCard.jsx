import React, { useState } from 'react';
import { FileText, Image as ImageIcon, FileSpreadsheet, Film, MoreVertical, Mail, Download, Archive, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

const iconMap = {
  document: { icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  image: { icon: ImageIcon, color: 'text-pink-600', bg: 'bg-pink-100' },
  spreadsheet: { icon: FileSpreadsheet, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  video: { icon: Film, color: 'text-purple-600', bg: 'bg-purple-100' },
};

export default function FileCard({ file, onDeleteFile }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const { icon: Icon, color, bg } = iconMap[file.type] || iconMap.document;

  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsMenuOpen(prev => !prev);
  };

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleEmail = (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    triggerToast(`📧 Sent asset link to sahilkhan536ah@gmail.com!`);
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    triggerToast(`⬇️ Verified segment download for ${file.name}...`);
  };

  const handleArchive = (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    triggerToast(`📦 Asset archived successfully.`);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    if (onDeleteFile) {
      onDeleteFile(file);
    }
  };

  const handleCardClick = () => {
    triggerToast(`📂 Opening secure sandbox preview for "${file.name}"...`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 group relative flex flex-col h-48 cursor-pointer overflow-hidden select-none"
    >
      {/* Toast Notification inside card */}
      {toastMsg && (
        <div className="absolute top-4 left-4 right-4 z-40 bg-slate-900/95 backdrop-blur-md text-white text-[10px] font-bold py-2 px-2.5 rounded-xl flex items-center justify-center text-center shadow-lg border border-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Menu Backdrop */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-20 cursor-default" 
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen(false);
          }}
        ></div>
      )}

      {/* Menu dropdown */}
      {isMenuOpen && (
        <div className="absolute right-4 top-12 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-100 py-1.5 w-40 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
          <button 
            onClick={handleEmail}
            className="w-full text-left px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-2"
          >
            <Mail size={12} className="text-slate-400" /> Email Asset
          </button>
          <button 
            onClick={handleDownload}
            className="w-full text-left px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-2"
          >
            <Download size={12} className="text-slate-400" /> Download
          </button>
          <button 
            onClick={handleArchive}
            className="w-full text-left px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-2"
          >
            <Archive size={12} className="text-slate-400" /> Archive
          </button>
          <div className="border-t border-slate-100 my-1"></div>
          <button 
            onClick={handleDelete}
            className="w-full text-left px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors flex items-center gap-2"
          >
            <Trash2 size={12} className="text-rose-500" /> Delete
          </button>
        </div>
      )}

      <button 
        onClick={toggleMenu}
        className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 opacity-0 group-hover:opacity-100 transition-opacity z-10 p-1 hover:bg-slate-50 rounded-lg cursor-pointer"
      >
        <MoreVertical size={20} />
      </button>

      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", bg)}>
        <Icon size={24} className={color} />
      </div>

      <div className="mt-auto">
        <h3 className="font-semibold text-slate-800 truncate" title={file.name}>
          {file.name}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Last opened {file.lastOpened}
        </p>

        <div className="flex items-center gap-2 mt-4">
          <div className="flex -space-x-2">
            {file.members.slice(0, 3).map((member, i) => (
              <img 
                key={i}
                src={member.avatar} 
                alt="Member" 
                className="w-6 h-6 rounded-full border-2 border-white object-cover"
              />
            ))}
            {file.members.length > 3 && (
              <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-medium text-slate-600 z-10">
                +{file.members.length - 3}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
