import React from 'react';
import { CloudUpload, X } from 'lucide-react';

export default function UploadModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Upload Assets</h2>
              <p className="text-sm text-slate-500 mt-1">Support for high-res images and 3D models.</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="border-2 border-dashed border-indigo-200 rounded-2xl bg-indigo-50/50 p-10 flex flex-col items-center justify-center text-center transition-colors hover:bg-indigo-50 hover:border-indigo-300 group cursor-pointer mb-6">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4 text-white relative shadow-lg shadow-indigo-600/20 group-hover:-translate-y-1 transition-transform">
              <CloudUpload size={32} />
              <div className="absolute -bottom-2 -right-2 bg-white rounded-lg p-1 shadow-sm">
                <div className="w-4 h-4 text-indigo-600 flex items-center justify-center font-bold text-lg leading-none">+</div>
              </div>
            </div>
            <p className="font-medium text-slate-700 mb-1">Drag & drop your files here</p>
            <p className="text-sm text-slate-500 mb-6">or browse from your device</p>
            <button className="bg-white text-indigo-600 px-6 py-2.5 rounded-xl font-medium shadow-sm border border-slate-100 hover:shadow transition-shadow">
              Select Files
            </button>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-4 border border-slate-100">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-700 truncate">marketing_campaign_final_v2.mp4</p>
                <span className="text-sm font-semibold text-indigo-600">65%</span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            <button className="text-slate-400 hover:text-slate-600 p-1">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 bg-white text-slate-700 font-medium rounded-xl hover:bg-slate-100 transition-colors border border-slate-200"
          >
            Cancel
          </button>
          <button className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20">
            Finish Upload
          </button>
        </div>
      </div>
    </div>
  );
}
