import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import FileCard from '../components/FileCard';
import GoogleDriveCard from '../components/GoogleDriveCard';
import UsersControl from '../components/UsersControl';
import { 
  LayoutGrid, List, SortAsc, Upload, Users, Trash2, 
  Database, RefreshCw, FolderOpen, ArrowUpDown, ChevronRight,
  Shield, CheckCircle, Info, ExternalLink
} from 'lucide-react';

const myFilesList = [
  {
    id: 1,
    name: 'Q4 Strategy.doc',
    type: 'document',
    lastOpened: '2h ago',
    members: [
      { avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&q=80' },
      { avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=64&q=80' },
      { avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=64&q=80' },
      { avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=64&q=80' }
    ]
  },
  {
    id: 2,
    name: 'Project Roadmap.xls',
    type: 'spreadsheet',
    lastOpened: '5h ago',
    members: [
      { avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=64&q=80' },
    ]
  },
  {
    id: 3,
    name: 'Investor Deck.ppt',
    type: 'image',
    lastOpened: '1d ago',
    members: [
      { avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=64&q=80' },
      { avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=64&q=80' },
    ]
  }
];

const recentFiles = [
  { id: 4, name: 'Marketing Assets', type: 'folder', modified: 'Oct 12, 2023', size: '420 MB', members: ['JC', 'ML'] },
  { id: 5, name: 'Hero-banner-v2.png', type: 'image', modified: 'Oct 11, 2023', size: '2.4 MB', members: ['ME'] },
  { id: 6, name: 'Brand-Intro-Video.mp4', type: 'video', modified: 'Oct 10, 2023', size: '128 MB', members: ['AS', 'KK', 'RT'] },
];

const gdriveFiles = [
  {
    id: 11,
    name: 'Brand_Identity_v2.pdf',
    type: 'pdf',
    modified: '2h ago',
    size: '4.2 MB',
    previewUrl: ''
  },
  {
    id: 12,
    name: 'Hero_Section_Draft.jpg',
    type: 'jpg',
    modified: '5h ago',
    size: '12.8 MB',
    previewUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 13,
    name: 'Content_Strategy.docx',
    type: 'docx',
    modified: 'yesterday',
    size: '856 KB',
    previewUrl: ''
  },
  {
    id: 14,
    name: 'Transparent_Logo.png',
    type: 'png',
    modified: '3d ago',
    size: '2.1 MB',
    previewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 15,
    name: 'Presentation_Video.mp4',
    type: 'mp4',
    modified: '1w ago',
    size: '245 MB',
    previewUrl: ''
  },
  {
    id: 16,
    name: 'Meeting_Notes.txt',
    type: 'txt',
    modified: 'yesterday',
    size: '12 KB',
    previewUrl: ''
  },
  {
    id: 17,
    name: 'Desktop_Wallpaper.jpg',
    type: 'jpg',
    modified: '2w ago',
    size: '3.5 MB',
    previewUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 18,
    name: 'Q3_Financials.pdf',
    type: 'pdf',
    modified: '1mo ago',
    size: '1.8 MB',
    previewUrl: ''
  }
];

export default function Dashboard({ 
  activeTab, 
  setActiveTab, 
  onUploadClick, 
  onLogoutClick,
  onUpgradeClick,
  searchQuery, 
  setSearchQuery,
  user
}) {
  const [sortOrder, setSortOrder] = useState('name-asc');
  const [viewType, setViewType] = useState('grid'); // grid or list

  // Sort files helper
  const sortFiles = (files) => {
    return [...files].sort((a, b) => {
      if (sortOrder === 'name-asc') return a.name.localeCompare(b.name);
      if (sortOrder === 'name-desc') return b.name.localeCompare(a.name);
      if (sortOrder === 'size') {
        const parseSize = (s) => {
          if (!s) return 0;
          const float = parseFloat(s);
          if (s.includes('MB')) return float * 1024 * 1024;
          if (s.includes('KB')) return float * 1024;
          if (s.includes('GB')) return float * 1024 * 1024 * 1024;
          return float;
        };
        return parseSize(b.size) - parseSize(a.size);
      }
      return 0;
    });
  };

  const handleSortToggle = () => {
    if (sortOrder === 'name-asc') setSortOrder('name-desc');
    else if (sortOrder === 'name-desc') setSortOrder('size');
    else setSortOrder('name-asc');
  };

  // Google Drive render
  const renderGoogleDrive = () => {
    const filteredFiles = gdriveFiles.filter(file => 
      file.name.toLowerCase().includes((searchQuery || '').toLowerCase())
    );
    const sortedFiles = sortFiles(filteredFiles);

    return (
      <div className="relative pb-24">
        {/* Breadcrumb and utility bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
            <span className="hover:text-slate-800 transition-colors cursor-pointer">My Cloud</span>
            <ChevronRight size={16} />
            <span className="text-indigo-600">Google Drive</span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleSortToggle}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:text-slate-900 transition-all cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
            >
              <SortAsc size={16} className="text-slate-500" /> Sort
              <span className="text-xs text-indigo-600 font-bold bg-indigo-50 px-1.5 py-0.5 rounded uppercase">
                {sortOrder.replace('-', ' ')}
              </span>
            </button>

            <button 
              onClick={onUploadClick}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.98]"
            >
              <Upload size={16} /> Upload
            </button>
          </div>
        </div>

        {/* Content grid with sidebar */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Grid */}
          <div className="xl:col-span-3">
            {sortedFiles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedFiles.map(file => (
                  <GoogleDriveCard key={file.id} file={file} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm flex flex-col items-center">
                <FolderOpen size={48} className="text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-800">No matching files</h3>
                <p className="text-slate-500 text-sm mt-1">Try expanding your query to find what you need.</p>
              </div>
            )}
          </div>

          {/* Right cloud usage card sidebar */}
          <div className="xl:col-span-1">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] sticky top-24 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 text-base">Cloud Usage</h3>
                <Info size={16} className="text-slate-400" />
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1.5">
                  <span>Google Drive</span>
                  <span className="text-indigo-600 font-bold">85% Used</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: '85%' }}></div>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed mb-6 font-medium">
                You're approaching your limit. Free up 2GB to keep syncing across all devices.
              </p>

              <button 
                onClick={onUpgradeClick}
                className="w-full py-3 px-4 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-indigo-600 font-bold rounded-2xl text-xs transition-all cursor-pointer text-center"
              >
                Clean Up Storage
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Default My Files render
  const renderMyFiles = () => {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            Quick Access
          </h2>
          <button 
            onClick={() => setActiveTab('Google Drive')}
            className="text-xs font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full hover:bg-indigo-100 transition-colors cursor-pointer"
          >
            View Google Drive
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {myFilesList.map(file => (
            <FileCard key={file.id} file={file} />
          ))}
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Recent Files</h2>
          <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-slate-200">
            <button 
              onClick={() => setViewType('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewType === 'grid' ? 'bg-slate-100 text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewType('list')}
              className={`p-1.5 rounded-lg transition-colors ${viewType === 'list' ? 'bg-slate-100 text-slate-700' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {viewType === 'list' ? (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm font-semibold border-b border-slate-100">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Last Modified</th>
                  <th className="px-6 py-4">Size</th>
                  <th className="px-6 py-4">Members</th>
                </tr>
              </thead>
              <tbody>
                {recentFiles.map(file => (
                  <tr key={file.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors group cursor-pointer">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm uppercase ${
                        file.type === 'folder' ? 'bg-indigo-50 text-indigo-600' :
                        file.type === 'image' ? 'bg-pink-50 text-pink-600' :
                        'bg-purple-50 text-purple-600'
                      }`}>
                        {file.type[0]}
                      </div>
                      <span className="font-semibold text-slate-800">{file.name}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{file.modified}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{file.size}</td>
                    <td className="px-6 py-4">
                      <div className="flex -space-x-2">
                        {file.members.map((initials, i) => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-600">
                            {initials}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentFiles.map(file => (
              <div key={file.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-44 hover:shadow-md transition-shadow group relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base uppercase ${
                    file.type === 'folder' ? 'bg-indigo-50 text-indigo-600' :
                    file.type === 'image' ? 'bg-pink-50 text-pink-600' :
                    'bg-purple-50 text-purple-600'
                  }`}>
                    {file.type[0]}
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded uppercase">
                    {file.type}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm truncate">{file.name}</h3>
                  <p className="text-[11px] text-slate-500 mt-1">Modified {file.modified} • {file.size}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Shared workspace render
  const renderShared = () => {
    return (
      <div className="max-w-4xl mx-auto py-8 text-center flex flex-col items-center">
        <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6 text-indigo-600">
          <Users size={40} className="stroke-[1.5]" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Shared Spaces</h2>
        <p className="text-slate-500 max-w-md mt-2 text-sm leading-relaxed">
          Access shared drives, joint campaign briefs, and active folders shared by your core team members.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mt-12 text-left">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-slate-200 transition-all flex flex-col justify-between h-44">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full">ACTIVE</span>
                <span className="text-xs text-slate-400">4 members</span>
              </div>
              <h3 className="font-bold text-slate-800 text-base mt-4">Marketing Campaign 2026</h3>
              <p className="text-xs text-slate-500 mt-1">Shared by Jessica Mitchell</p>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="flex -space-x-1.5">
                <img className="w-6 h-6 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&q=80" />
                <img className="w-6 h-6 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=64&q=80" />
                <img className="w-6 h-6 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=64&q=80" />
              </div>
              <button className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline">
                Open <ExternalLink size={12} />
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-slate-200 transition-all flex flex-col justify-between h-44">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2.5 py-0.5 rounded-full">DESIGN SPEC</span>
                <span className="text-xs text-slate-400">2 members</span>
              </div>
              <h3 className="font-bold text-slate-800 text-base mt-4">CloudSphere 3D Assets</h3>
              <p className="text-xs text-slate-500 mt-1">Shared by Michael Evans</p>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="flex -space-x-1.5">
                <img className="w-6 h-6 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=64&q=80" />
                <img className="w-6 h-6 rounded-full border-2 border-white object-cover" src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=64&q=80" />
              </div>
              <button className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline">
                Open <ExternalLink size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Trash Bin render
  const renderTrash = () => {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2.5">
              <Trash2 size={24} className="text-indigo-600" /> Trash Bin
            </h2>
            <p className="text-xs text-slate-500 mt-1">Items will be permanently deleted after 30 days</p>
          </div>
          <button className="px-4 py-2 border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold text-xs rounded-xl transition-all cursor-pointer">
            Empty Trash Bin
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">File Name</span>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</span>
          </div>

          <div className="divide-y divide-slate-100">
            <div className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center font-bold text-xs uppercase">
                  PDF
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-800">Legacy_Blueprint.pdf</h4>
                  <p className="text-[10px] text-slate-400">Deleted 2 days ago • 14.8 MB</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl text-xs font-bold transition-all cursor-pointer">
                  Restore
                </button>
                <button className="p-2 text-slate-400 hover:text-rose-600 rounded-xl text-xs transition-all cursor-pointer">
                  Delete Permanently
                </button>
              </div>
            </div>

            <div className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold text-xs uppercase">
                  PNG
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-800">Draft_Landing_Page.png</h4>
                  <p className="text-[10px] text-slate-400">Deleted 4 days ago • 3.2 MB</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl text-xs font-bold transition-all cursor-pointer">
                  Restore
                </button>
                <button className="p-2 text-slate-400 hover:text-rose-600 rounded-xl text-xs transition-all cursor-pointer">
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Detailed Storage breakdown
  const renderStorage = () => {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-2.5">
          <Database size={24} className="text-indigo-600" /> Storage Diagnostics
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Used Space</h3>
            <p className="text-3xl font-black text-slate-800 mt-2">1.2 TB</p>
            <p className="text-xs text-emerald-600 font-semibold mt-1">68% of 2 TB quota</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Files Count</h3>
            <p className="text-3xl font-black text-slate-800 mt-2">4,821</p>
            <p className="text-xs text-indigo-600 font-semibold mt-1">+148 added this week</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Security Audits</h3>
            <p className="text-3xl font-black text-indigo-600 mt-2">100%</p>
            <p className="text-xs text-indigo-600 font-semibold mt-1 flex items-center gap-1">
              <Shield size={12} /> Military encrypted
            </p>
          </div>
        </div>

        {/* Categories Progress */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm mb-8">
          <h3 className="font-bold text-slate-800 text-base mb-6">Breakdown by Asset Category</h3>
          
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-600 font-semibold mb-2">
                <span>High-res Videos (.mp4, .mov)</span>
                <span>650 GB</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-purple-600 h-full rounded-full" style={{ width: '54%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-slate-600 font-semibold mb-2">
                <span>Creative Image Assets (.png, .jpg, .obj)</span>
                <span>350 GB</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-pink-600 h-full rounded-full" style={{ width: '29%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-slate-600 font-semibold mb-2">
                <span>Documents & Spreadsheets (.pdf, .docx, .xls)</span>
                <span>150 GB</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: '12%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-slate-600 font-semibold mb-2">
                <span>Other Backups</span>
                <span>50 GB</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: '5%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Suggestion */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-3xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg shadow-indigo-600/10">
          <div>
            <h3 className="font-bold text-lg">Need more workspace overhead?</h3>
            <p className="text-indigo-100 text-xs mt-1 max-w-md leading-relaxed">
              Upgrade to the CloudSphere Enterprise Plan for unlimited storage capacity, dedicated priority channels, and multi-tenant sub-sharing.
            </p>
          </div>
          <button 
            onClick={onUpgradeClick}
            className="px-6 py-3 bg-white hover:bg-indigo-50 text-indigo-600 font-bold rounded-2xl text-xs transition-all cursor-pointer whitespace-nowrap"
          >
            Upgrade Capacity
          </button>
        </div>
      </div>
    );
  };

  return (
    <MainLayout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      onLogoutClick={onLogoutClick}
      onUpgradeClick={onUpgradeClick}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      user={user}
    >
      {activeTab === 'My Files' && renderMyFiles()}
      {activeTab === 'Google Drive' && renderGoogleDrive()}
      {activeTab === 'Shared' && renderShared()}
      {activeTab === 'Users Control' && <UsersControl />}
      {activeTab === 'Trash' && renderTrash()}
      {activeTab === 'Storage' && renderStorage()}
    </MainLayout>
  );
}
