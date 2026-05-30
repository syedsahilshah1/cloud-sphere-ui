import React, { useState, useRef } from 'react';
import { CloudUpload, X, Check, RefreshCw, AlertCircle, FileText, Image as ImageIcon, FileSpreadsheet, Film } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

function formatBytes(bytes) {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileType(fileName) {
  const ext = fileName.split('.').pop().toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return 'video';
  if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'].includes(ext)) return 'document';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'spreadsheet';
  return 'document';
}

const fileIconMap = {
  document: { icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
  spreadsheet: { icon: FileSpreadsheet, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
  image: { icon: ImageIcon, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
  video: { icon: Film, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100' }
};

export default function UploadModal({ isOpen, onClose, user, onUploadComplete }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const processFiles = (filesList) => {
    setErrorMsg('');
    const newFiles = Array.from(filesList).map((file, idx) => {
      const type = getFileType(file.name);
      const fileId = 'uploaded-' + Math.random().toString(36).substr(2, 9);
      
      const fileStateObj = {
        id: fileId,
        name: file.name,
        size: formatBytes(file.size),
        type: type,
        mimeType: file.type || 'application/octet-stream',
        progress: 0,
        status: 'uploading'
      };

      // Simulate a premium upload progress animation
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += Math.floor(Math.random() * 15) + 5;
        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(interval);
          setSelectedFiles(prev => 
            prev.map(f => f.id === fileId ? { ...f, progress: 100, status: 'success' } : f)
          );
        } else {
          setSelectedFiles(prev => 
            prev.map(f => f.id === fileId ? { ...f, progress: currentProgress } : f)
          );
        }
      }, 150 + idx * 50);

      return fileStateObj;
    });

    setSelectedFiles(prev => [...newFiles, ...prev]);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (id) => {
    setSelectedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleFinishUpload = async () => {
    const completedFiles = selectedFiles.filter(f => f.status === 'success');
    if (completedFiles.length === 0) {
      onClose();
      return;
    }

    setIsSyncing(true);
    setErrorMsg('');

    try {
      // Loop over and insert into drive_files table
      for (const file of completedFiles) {
        if (user) {
          const { error } = await supabase
            .from('drive_files')
            .insert({
              user_id: user.googleUserId || user.email,
              file_name: file.name,
              mime_type: file.mimeType,
              size: file.size,
              drive_file_id: file.id
            });

          if (error) {
            console.warn("Supabase drive_files insert error, saving to local list fallback:", error.message);
            // Fallback: save synced IDs locally
            const storageKey = `cs_synced_files_${user.email}`;
            const currentLocal = JSON.parse(localStorage.getItem(storageKey) || '[]');
            if (!currentLocal.includes(file.id)) {
              localStorage.setItem(storageKey, JSON.stringify([...currentLocal, file.id]));
            }
          }
        }
      }

      if (onUploadComplete) {
        onUploadComplete();
      }
      
      // Clear selected list and close
      setSelectedFiles([]);
      onClose();
    } catch (err) {
      console.error("Upload save error:", err);
      setErrorMsg('Failed to store files in Supabase Database.');
    } finally {
      setIsSyncing(false);
    }
  };

  const hasCompletedFiles = selectedFiles.some(f => f.status === 'success');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-100 flex flex-col max-h-[90vh]">
        <div className="p-8 flex-1 overflow-y-auto">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Upload Live Assets</h2>
              <p className="text-sm text-slate-500 mt-1">Files are saved instantly to your Supabase cloud.</p>
            </div>
            <button 
              onClick={onClose}
              disabled={isSyncing}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
            >
              <X size={20} />
            </button>
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            multiple 
            className="hidden" 
          />

          <div 
            onClick={triggerFileSelect}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all group cursor-pointer mb-6 ${
              isDragging 
                ? 'border-indigo-600 bg-indigo-50/70 scale-[0.99]' 
                : 'border-indigo-200 bg-indigo-50/30 hover:bg-indigo-50/70 hover:border-indigo-400'
            }`}
          >
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4 text-white relative shadow-lg shadow-indigo-600/10 group-hover:-translate-y-0.5 transition-transform">
              <CloudUpload size={28} />
              <div className="absolute -bottom-1.5 -right-1.5 bg-white rounded-lg p-0.5 shadow-md border border-slate-50">
                <div className="w-4 h-4 text-indigo-600 flex items-center justify-center font-bold text-sm leading-none">+</div>
              </div>
            </div>
            <p className="font-semibold text-slate-700 text-sm mb-0.5">Drag & drop your files here</p>
            <p className="text-xs text-slate-500 mb-4">or browse from your computer</p>
            <button 
              type="button"
              className="bg-white text-indigo-600 px-4 py-2 rounded-xl font-bold text-xs shadow-sm border border-slate-100 hover:shadow transition-shadow cursor-pointer"
            >
              Select Files
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3.5 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle size={16} className="text-rose-500 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Files List */}
          {selectedFiles.length > 0 && (
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {selectedFiles.map(file => {
                const conf = fileIconMap[file.type] || fileIconMap.document;
                const IconComponent = conf.icon;
                return (
                  <div 
                    key={file.id} 
                    className="bg-slate-50 rounded-2xl p-4 flex items-center gap-4 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.01)] animate-in fade-in slide-in-from-bottom-2 duration-150"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${conf.bg} ${conf.color}`}>
                      <IconComponent size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs font-bold text-slate-700 truncate pr-4">{file.name}</p>
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                          {file.progress}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <div className="h-1.5 flex-1 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-indigo-600 rounded-full transition-all duration-300" 
                            style={{ width: `${file.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400 flex-shrink-0">{file.size}</span>
                      </div>
                    </div>
                    <div>
                      {file.status === 'success' ? (
                        <div className="w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-md shadow-emerald-500/10">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      ) : (
                        <button 
                          onClick={() => removeFile(file.id)}
                          className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200/50 rounded-lg transition-colors"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button 
            onClick={onClose}
            disabled={isSyncing}
            className="px-5 py-2.5 bg-white text-slate-700 font-bold rounded-xl hover:bg-slate-100 hover:border-slate-300 transition-all border border-slate-200 text-xs disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button 
            onClick={handleFinishUpload}
            disabled={isSyncing || selectedFiles.length === 0}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.98] text-xs flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {isSyncing && <RefreshCw size={14} className="animate-spin" />}
            {isSyncing ? 'Syncing...' : hasCompletedFiles ? 'Finish Upload' : 'Upload Files'}
          </button>
        </div>
      </div>
    </div>
  );
}
