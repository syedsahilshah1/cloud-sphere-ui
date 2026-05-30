import React, { useState } from 'react';
import { MoreVertical, FileText, FileCode, Film, Eye, CloudLightning, CheckCircle, Mail, Download, Archive, Trash2 } from 'lucide-react';

export default function GoogleDriveCard({ file, isSynced, onSyncToggle, onDeleteFile }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const hasPreview = file.type === 'jpg' || file.type === 'png' || (file.previewUrl && file.previewUrl.startsWith('http'));

  const handleSyncClick = (e) => {
    e.stopPropagation();
    if (onSyncToggle) {
      onSyncToggle(file);
    }
  };

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
    triggerToast(`📧 Dispatched: Link sent to sahilkhan536ah@gmail.com!`);
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    triggerToast(`⬇️ Verified: Downloading ${file.name}...`);
    // If it has a downloadable link, try to trigger it, else simulate
    if (file.previewUrl && file.previewUrl.startsWith('http')) {
      const a = document.createElement('a');
      a.href = file.previewUrl;
      a.download = file.name;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleArchive = (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    triggerToast(`📦 Archived: Moved to cold storage.`);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    if (onDeleteFile) {
      onDeleteFile(file);
    }
  };

  const handleCardClick = () => {
    const targetUrl = file.previewUrl || file.webViewLink;
    if (targetUrl && targetUrl.startsWith('http')) {
      window.open(targetUrl, '_blank');
    } else {
      triggerToast(`📂 Opening secure sandbox viewer for "${file.name}"...`);
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-3xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.015)] hover:shadow-[0_12px_40px_rgba(90,81,230,0.08)] hover:border-slate-200/60 transition-all duration-300 overflow-hidden flex flex-col group h-64 select-none relative cursor-pointer"
    >
      {/* Toast Notification inside card */}
      {toastMsg && (
        <div className="absolute top-16 left-4 right-4 z-40 bg-slate-900/95 backdrop-blur-md text-white text-[11px] font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 shadow-lg border border-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Dropdown Menu Backdrop */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-20 cursor-default" 
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen(false);
          }}
        ></div>
      )}

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute right-4 top-14 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-100 py-1.5 w-44 z-30 animate-in fade-in slide-in-from-top-3 duration-200">
          <button 
            onClick={handleEmail}
            className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-2"
          >
            <Mail size={14} className="text-slate-400" /> Send on Email
          </button>
          <button 
            onClick={handleDownload}
            className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-2"
          >
            <Download size={14} className="text-slate-400" /> Download File
          </button>
          <button 
            onClick={handleArchive}
            className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center gap-2"
          >
            <Archive size={14} className="text-slate-400" /> Archive Asset
          </button>
          <div className="border-t border-slate-100 my-1"></div>
          <button 
            onClick={handleDelete}
            className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors flex items-center gap-2"
          >
            <Trash2 size={14} className="text-rose-500" /> Delete (Trash)
          </button>
        </div>
      )}

      {/* Thumbnail area */}
      <div className="relative h-44 bg-slate-50 flex items-center justify-center border-b border-slate-100 overflow-hidden">
        {hasPreview ? (
          <>
            <img 
              src={file.previewUrl} 
              alt={file.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            {/* Elegant preview hover indicator */}
            <div className="absolute inset-0 bg-indigo-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="bg-white/90 backdrop-blur-md text-slate-800 text-xs font-semibold py-1.5 px-3 rounded-full flex items-center gap-1.5 shadow-sm transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                <Eye size={14} /> Preview
              </span>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center w-full h-full relative">
            <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center shadow-sm transform group-hover:scale-110 transition-transform duration-300 ${
              file.type === 'pdf' ? 'bg-rose-50 text-rose-600' :
              file.type === 'docx' ? 'bg-indigo-50 text-indigo-600' :
              file.type === 'mp4' ? 'bg-purple-50 text-purple-600' :
              'bg-slate-50 text-slate-600'
            }`}>
              {file.type === 'pdf' && <FileText size={28} className="stroke-[1.5]" />}
              {file.type === 'docx' && <FileText size={28} className="stroke-[1.5]" />}
              {file.type === 'mp4' && <Film size={28} className="stroke-[1.5]" />}
              {file.type === 'txt' && <FileCode size={28} className="stroke-[1.5]" />}
            </div>
          </div>
        )}
        
        {/* Top-left Sync Action Badge */}
        <button
          onClick={handleSyncClick}
          className={`absolute top-4 left-4 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-md select-none tracking-wider flex items-center gap-1.5 transition-all duration-300 cursor-pointer z-10 ${
            isSynced 
              ? 'bg-emerald-500 text-white shadow-emerald-500/10 scale-105' 
              : 'bg-white/90 hover:bg-indigo-600 hover:text-white backdrop-blur-sm text-slate-700 hover:scale-105'
          }`}
        >
          {isSynced ? (
            <>
              <CheckCircle size={12} className="stroke-[2.5]" />
              <span>SYNCED</span>
            </>
          ) : (
            <>
              <CloudLightning size={12} className="text-indigo-500 group-hover:text-white" />
              <span>SYNC</span>
            </>
          )}
        </button>

        {/* Top-right extension badge */}
        <span className={`absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm select-none uppercase tracking-wider ${
          file.type === 'pdf' ? 'bg-rose-100/90 text-rose-700' :
          file.type === 'docx' ? 'bg-indigo-100/90 text-indigo-700' :
          file.type === 'mp4' ? 'bg-purple-100/90 text-purple-700' :
          file.type === 'txt' ? 'bg-slate-200/90 text-slate-700' :
          'bg-pink-100/90 text-pink-700' // jpg/png
        }`}>
          {file.type}
        </span>
      </div>

      {/* Info area */}
      <div className="p-4 flex-1 flex flex-col justify-between bg-white">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-800 text-sm truncate flex-1 group-hover:text-indigo-600 transition-colors font-sans" title={file.name}>
            {file.name}
          </h3>
          <button 
            onClick={toggleMenu}
            className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-0.5 rounded-md hover:bg-slate-50 relative z-10"
          >
            <MoreVertical size={16} />
          </button>
        </div>
        <p className="text-xs text-slate-400 font-medium">
          Modified {file.modified || 'Just now'} • {file.size}
        </p>
      </div>
    </div>
  );
}
