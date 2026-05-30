import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import FileCard from '../components/FileCard';
import GoogleDriveCard from '../components/GoogleDriveCard';
import UsersControl from '../components/UsersControl';
import { supabase } from '../lib/supabaseClient';
import { fetchRealGoogleDriveFiles } from '../lib/googleDriveClient';
import { 
  LayoutGrid, List, SortAsc, Upload, Users, Trash2, 
  Database, RefreshCw, FolderOpen, ArrowUpDown, ChevronRight,
  Shield, CheckCircle, Info, ExternalLink, CloudLightning, HardDrive
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

const gdriveMockFiles = [
  {
    id: 'mock-11',
    name: 'Brand_Identity_v2.pdf',
    type: 'pdf',
    modified: '2h ago',
    size: '4.2 MB',
    previewUrl: ''
  },
  {
    id: 'mock-12',
    name: 'Hero_Section_Draft.jpg',
    type: 'jpg',
    modified: '5h ago',
    size: '12.8 MB',
    previewUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'mock-13',
    name: 'Content_Strategy.docx',
    type: 'docx',
    modified: 'yesterday',
    size: '856 KB',
    previewUrl: ''
  },
  {
    id: 'mock-14',
    name: 'Transparent_Logo.png',
    type: 'png',
    modified: '3d ago',
    size: '2.1 MB',
    previewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'mock-15',
    name: 'Presentation_Video.mp4',
    type: 'mp4',
    modified: '1w ago',
    size: '245 MB',
    previewUrl: ''
  },
  {
    id: 'mock-16',
    name: 'Meeting_Notes.txt',
    type: 'txt',
    modified: 'yesterday',
    size: '12 KB',
    previewUrl: ''
  },
  {
    id: 'mock-17',
    name: 'Desktop_Wallpaper.jpg',
    type: 'jpg',
    modified: '2w ago',
    size: '3.5 MB',
    previewUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'mock-18',
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
  user,
  onUserUpdate
}) {
  const [sortOrder, setSortOrder] = useState('name-asc');
  const [viewType, setViewType] = useState('grid'); // grid or list
  const [linkingState, setLinkingState] = useState('idle'); // idle, oauth, partition, syncing, completed
  
  // Real Google Drive integration states
  const [driveFiles, setDriveFiles] = useState(gdriveMockFiles);
  const [syncedFileIds, setSyncedFileIds] = useState([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [driveApiError, setDriveApiError] = useState(null);

  // Stateful lists for personal files and trash bin files
  const [personalFiles, setPersonalFiles] = useState(() => {
    const saved = localStorage.getItem(`cs_personal_files_${user?.email}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return myFilesList;
  });

  const [deletedFiles, setDeletedFiles] = useState(() => {
    const saved = localStorage.getItem(`cs_deleted_files_${user?.email}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { id: 'del-1', name: 'Legacy_Blueprint.pdf', type: 'pdf', modified: '2 days ago', size: '14.8 MB', source: 'mock' },
      { id: 'del-2', name: 'Draft_Landing_Page.png', type: 'png', modified: '4 days ago', size: '3.2 MB', source: 'mock' }
    ];
  });

  const handleDeletePersonalFile = (file) => {
    const nextPersonal = personalFiles.filter(f => f.id !== file.id);
    setPersonalFiles(nextPersonal);
    localStorage.setItem(`cs_personal_files_${user?.email}`, JSON.stringify(nextPersonal));

    const newDeleted = [
      {
        id: file.id,
        name: file.name,
        type: file.type || 'document',
        modified: 'Just now',
        size: file.size || 'Unknown size',
        source: 'personal'
      },
      ...deletedFiles
    ];
    setDeletedFiles(newDeleted);
    localStorage.setItem(`cs_deleted_files_${user?.email}`, JSON.stringify(newDeleted));
  };

  const handleDeleteDriveFile = async (file) => {
    // 1. Remove from database / unsync
    if (syncedFileIds.includes(file.id)) {
      const nextSyncedIds = syncedFileIds.filter(id => id !== file.id);
      setSyncedFileIds(nextSyncedIds);
      localStorage.setItem(`cs_synced_files_${user?.email}`, JSON.stringify(nextSyncedIds));

      try {
        await supabase
          .from('drive_files')
          .delete()
          .eq('drive_file_id', file.id);
      } catch (err) {
        console.warn("Supabase database delete failed on manual delete:", err.message);
      }
    }

    // 2. Remove from driveFiles view
    const nextDriveFiles = driveFiles.filter(f => f.id !== file.id);
    setDriveFiles(nextDriveFiles);

    // 3. Add to deletedFiles list
    const newDeleted = [
      {
        id: file.id,
        name: file.name,
        type: file.type || 'document',
        modified: 'Just now',
        size: file.size || 'Unknown size',
        source: 'drive',
        fileObj: file
      },
      ...deletedFiles
    ];
    setDeletedFiles(newDeleted);
    localStorage.setItem(`cs_deleted_files_${user?.email}`, JSON.stringify(newDeleted));
  };

  const handleRestoreFile = (file) => {
    if (file.source === 'personal') {
      const restored = {
        id: file.id,
        name: file.name,
        type: file.type || 'document',
        lastOpened: 'Just now',
        members: [{ avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' }]
      };
      const nextPersonal = [restored, ...personalFiles];
      setPersonalFiles(nextPersonal);
      localStorage.setItem(`cs_personal_files_${user?.email}`, JSON.stringify(nextPersonal));
    } else if (file.source === 'drive') {
      if (file.fileObj) {
        setDriveFiles(prev => [file.fileObj, ...prev]);
      }
    }

    const nextDeleted = deletedFiles.filter(f => f.id !== file.id);
    setDeletedFiles(nextDeleted);
    localStorage.setItem(`cs_deleted_files_${user?.email}`, JSON.stringify(nextDeleted));
  };

  const handleDeletePermanently = (file) => {
    const nextDeleted = deletedFiles.filter(f => f.id !== file.id);
    setDeletedFiles(nextDeleted);
    localStorage.setItem(`cs_deleted_files_${user?.email}`, JSON.stringify(nextDeleted));
  };

  const handleEmptyTrash = () => {
    setDeletedFiles([]);
    localStorage.setItem(`cs_deleted_files_${user?.email}`, JSON.stringify([]));
  };

  // Load files and synced status
  const fetchSyncedFiles = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('drive_files')
        .select('drive_file_id');
      
      if (error) throw error;
      if (data) {
        setSyncedFileIds(data.map(f => f.drive_file_id));
      }
    } catch (err) {
      console.warn("Supabase select sync files failed. Falling back to local storage:", err.message);
      const stored = localStorage.getItem(`cs_synced_files_${user.email}`) || '[]';
      try {
        setSyncedFileIds(JSON.parse(stored));
      } catch (e) {}
    }
  };

  const loadDriveFiles = async () => {
    if (!user) return;
    
    // Always fetch synced IDs first
    await fetchSyncedFiles();

    if (user.isDriveLinked && user.accessToken) {
      setIsLoadingFiles(true);
      setDriveApiError(null);
      try {
        const files = await fetchRealGoogleDriveFiles(user.accessToken);
        setDriveFiles(files);
      } catch (err) {
        console.error("Could not retrieve real Google Drive files:", err);
        setDriveApiError(err.message || 'Could not retrieve real Google Drive files.');
        setDriveFiles(gdriveMockFiles);
      } finally {
        setIsLoadingFiles(false);
      }
    } else {
      setDriveFiles(gdriveMockFiles);
      setDriveApiError(null);
    }
  };

  useEffect(() => {
    loadDriveFiles();
    window.refreshDashboard = loadDriveFiles;
    return () => {
      window.refreshDashboard = null;
    };
  }, [user, activeTab]);

  // Sync / Unsync handler
  const handleSyncToggle = async (file) => {
    if (!user) return;
    const isCurrentlySynced = syncedFileIds.includes(file.id);
    let nextSyncedIds;

    if (isCurrentlySynced) {
      nextSyncedIds = syncedFileIds.filter(id => id !== file.id);
      try {
        const { error } = await supabase
          .from('drive_files')
          .delete()
          .eq('drive_file_id', file.id);
        
        if (error) throw error;
      } catch (err) {
        console.warn("Supabase database delete failed:", err.message);
      }
    } else {
      nextSyncedIds = [...syncedFileIds, file.id];
      try {
        const { error } = await supabase
          .from('drive_files')
          .insert({
            user_id: user.googleUserId || user.email,
            file_name: file.name,
            mime_type: file.type || 'unknown',
            size: file.size || '0 KB',
            drive_file_id: file.id
          });
        
        if (error) throw error;
      } catch (err) {
        console.warn("Supabase database insert failed:", err.message);
      }
    }

    setSyncedFileIds(nextSyncedIds);
    localStorage.setItem(`cs_synced_files_${user.email}`, JSON.stringify(nextSyncedIds));
  };

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

  const startLinkingFlow = () => {
    setLinkingState('oauth');
    setTimeout(() => {
      setLinkingState('partition');
      setTimeout(() => {
        setLinkingState('syncing');
        setTimeout(() => {
          setLinkingState('completed');
          setTimeout(() => {
            if (onUserUpdate) {
              onUserUpdate({ ...user, isDriveLinked: true });
            }
            setLinkingState('idle');
          }, 800);
        }, 1200);
      }, 1200);
    }, 1200);
  };

  // Google Drive render
  const renderGoogleDrive = () => {
    if (!user?.isDriveLinked) {
      return (
        <div className="max-w-4xl mx-auto py-12 flex flex-col items-center justify-center min-h-[60vh]">
          {linkingState === 'idle' ? (
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] flex flex-col items-center text-center max-w-lg w-full animate-fade-in">
              <div className="relative mb-8 group">
                <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center relative z-10 transition-all duration-500 group-hover:scale-105 group-hover:rotate-6">
                  <Database className="text-indigo-600 w-10 h-10 stroke-[1.5]" />
                </div>
                <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2.2rem] blur opacity-15 group-hover:opacity-30 transition duration-500 animate-pulse"></div>
              </div>

              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Google Drive Unlinked</h2>
              <p className="text-slate-500 text-xs mt-3 mb-8 leading-relaxed font-medium max-w-sm">
                To access configuration rules, storage allocations, and team cloud storage, you must authorize CloudSphere to map a partition within your Google Drive.
              </p>

              <button
                onClick={startLinkingFlow}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-2xl shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-3 text-sm group"
              >
                <span>Authorize Google Drive Partition</span>
                <span className="text-white/60 group-hover:translate-x-0.5 transition-transform">→</span>
              </button>

              <div className="mt-8 flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                <Shield size={10} className="text-emerald-500" />
                Zero-Trust Encryption Mapping
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] flex flex-col items-center text-center max-w-lg w-full animate-fade-in">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 animate-spin">
                <RefreshCw size={24} className="stroke-[1.5]" />
              </div>
              
              <h3 className="font-extrabold text-slate-800 text-sm mb-2 uppercase tracking-wider">
                {linkingState === 'oauth' && 'Establishing OAuth Channel'}
                {linkingState === 'partition' && 'Creating Drive Partition'}
                {linkingState === 'syncing' && 'Synchronizing Metadata'}
                {linkingState === 'completed' && 'Connection Finalized!'}
              </h3>
              
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-6 max-w-xs">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{
                    width: 
                      linkingState === 'oauth' ? '25%' :
                      linkingState === 'partition' ? '50%' :
                      linkingState === 'syncing' ? '75%' : '100%'
                  }}
                ></div>
              </div>

              <p className="text-xs text-slate-500 max-w-xs leading-relaxed font-medium">
                {linkingState === 'oauth' && 'Validating secure credentials and scope authorization limits...'}
                {linkingState === 'partition' && 'Mapping virtual directory structures on your Google Workspace root...'}
                {linkingState === 'syncing' && 'Downloading template models, layout guidelines, and asset packages...'}
                {linkingState === 'completed' && 'Synchronized successfully. Redirecting to workspace...'}
              </p>
            </div>
          )}
        </div>
      );
    }

    const filteredFiles = driveFiles.filter(file => 
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

        {driveApiError && (
          <div className="mb-6 p-5 bg-rose-50 border border-rose-100 rounded-3xl text-xs text-rose-800 leading-relaxed flex items-start gap-3 shadow-[0_4px_12px_rgba(244,63,94,0.02)]">
            <Shield size={16} className="text-rose-500 flex-shrink-0 mt-0.5 animate-pulse" />
            <div>
              <p className="font-bold text-rose-900 mb-1 text-xs uppercase tracking-wider">Google Drive Access Restricted</p>
              <p className="font-medium text-rose-700">{driveApiError}</p>
              <p className="mt-2 text-rose-600/90 font-medium">
                💡 Troubleshooting: Ensure you have enabled the <strong>Google Drive API</strong> in your Google Cloud Console library for the selected project. Also, when signing in, make sure to <strong>check the checkbox option</strong> that allows the application to read files from your Google Drive!
              </p>
            </div>
          </div>
        )}

        {/* Content grid with sidebar */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Grid */}
          <div className="xl:col-span-3">
            {isLoadingFiles ? (
              <div className="bg-white rounded-3xl p-24 text-center border border-slate-100 shadow-sm flex flex-col items-center justify-center">
                <RefreshCw size={36} className="text-indigo-600 animate-spin mb-4" />
                <h4 className="font-bold text-slate-800 text-sm">Streaming files from Google Drive...</h4>
                <p className="text-slate-400 text-xs mt-1">Connecting to official Google REST endpoint</p>
              </div>
            ) : sortedFiles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedFiles.map(file => (
                  <GoogleDriveCard 
                    key={file.id} 
                    file={file} 
                    isSynced={syncedFileIds.includes(file.id)}
                    onSyncToggle={handleSyncToggle}
                    onDeleteFile={handleDeleteDriveFile}
                  />
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
                  <span>Workspace Drive</span>
                  <span className="text-indigo-600 font-bold">{user?.role === 'superadmin' ? '34% Used' : '40% Used'}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: user?.role === 'superadmin' ? '34%' : '40%' }}
                  ></div>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed mb-6 font-medium font-sans">
                {user?.role === 'superadmin' 
                  ? 'Healthy storage allocation. Your SuperAdmin account is fully synchronized across all cluster instances.' 
                  : 'You have used 480 GB of your 1.2 TB professional allocation. Keep uploading files seamlessly.'}
              </p>

              <button 
                onClick={onUpgradeClick}
                className="w-full py-3 px-4 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 text-indigo-600 font-bold rounded-2xl text-xs transition-all cursor-pointer text-center"
              >
                {user?.role === 'superadmin' ? 'Manage Allocation' : 'Upgrade Plan'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Default My Files render
  const renderMyFiles = () => {
    // Get currently synced files to display them directly
    const syncedDriveFilesList = driveFiles.filter(f => syncedFileIds.includes(f.id) && !f.id.startsWith('uploaded-'));
    const localUploadedFiles = driveFiles.filter(f => f.id.startsWith('uploaded-') || syncedFileIds.includes(f.id));

    const combinedRecentFiles = [
      ...localUploadedFiles.map(f => ({
        id: f.id,
        name: f.name,
        type: f.type,
        modified: f.modified || 'Just now',
        size: f.size,
        members: ['Me']
      })),
      ...recentFiles
    ];

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
          {personalFiles.map(file => (
            <FileCard key={file.id} file={file} onDeleteFile={handleDeletePersonalFile} />
          ))}
        </div>

        {/* Sync assets dynamically retrieved from Supabase drive_files */}
        {syncedDriveFilesList.length > 0 && (
          <div className="mb-12 animate-fade-in">
            <div className="flex items-center gap-2.5 mb-6">
              <CloudLightning className="text-indigo-600 w-6 h-6 stroke-[2]" />
              <h2 className="text-2xl font-bold text-slate-800">Synced Drive Assets</h2>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                ACTIVE SUPABASE SYNC
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {syncedDriveFilesList.map(file => (
                <GoogleDriveCard 
                  key={file.id} 
                  file={file} 
                  isSynced={true}
                  onSyncToggle={handleSyncToggle}
                  onDeleteFile={handleDeleteDriveFile}
                />
              ))}
            </div>
          </div>
        )}

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
                {combinedRecentFiles.map(file => (
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
            {combinedRecentFiles.map(file => (
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
      <div className="max-w-4xl mx-auto py-8 animate-fade-in">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2.5">
              <Trash2 size={24} className="text-indigo-600 animate-pulse" /> Trash Bin
            </h2>
            <p className="text-xs text-slate-500 mt-1">Items will be permanently deleted after 30 days</p>
          </div>
          {deletedFiles.length > 0 && (
            <button 
              onClick={handleEmptyTrash}
              className="px-4 py-2 border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm hover:shadow active:scale-[0.98]"
            >
              Empty Trash Bin
            </button>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {deletedFiles.length === 0 ? (
            <div className="p-16 text-center text-slate-400">
              <Trash2 size={48} className="mx-auto text-slate-300 mb-4 stroke-[1.5]" />
              <p className="font-semibold text-sm text-slate-700">Your Trash Bin is clean and empty!</p>
              <p className="text-xs text-slate-400 mt-1">Any personal or synced assets you delete will show up here.</p>
            </div>
          ) : (
            <>
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">File Name</span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</span>
              </div>

              <div className="divide-y divide-slate-100">
                {deletedFiles.map(file => (
                  <div key={file.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs uppercase ${
                        file.type === 'pdf' ? 'bg-rose-50 text-rose-600' :
                        file.type === 'png' || file.type === 'image' ? 'bg-pink-50 text-pink-600' :
                        'bg-indigo-50 text-indigo-600'
                      }`}>
                        {file.type ? file.type.substring(0, 3) : 'DOC'}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-slate-800">{file.name}</h4>
                        <p className="text-[10px] text-slate-400">Deleted {file.modified || 'Just now'} • {file.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleRestoreFile(file)}
                        className="px-3 py-1.5 text-indigo-600 hover:bg-indigo-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Restore
                      </button>
                      <button 
                        onClick={() => handleDeletePermanently(file)}
                        className="px-3 py-1.5 text-slate-400 hover:text-rose-600 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                      >
                        Delete Permanently
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // Detailed Storage breakdown
  const renderStorage = () => {
    const isSuper = user?.role === 'superadmin';
    const quotaGb = isSuper ? 2000 : 1200;
    const usedGb = isSuper ? 680 : 480;
    const usedPct = isSuper ? 34 : 40;
    const filesCount = isSuper ? (1428 + driveFiles.length) : (936 + driveFiles.length);

    // Dynamic category allocation
    const videoGb = isSuper ? 380 : 220;
    const videoPct = Math.round((videoGb / usedGb) * 100);

    const imageGb = isSuper ? 180 : 150;
    const imagePct = Math.round((imageGb / usedGb) * 100);

    const docGb = isSuper ? 90 : 85;
    const docPct = Math.round((docGb / usedGb) * 100);

    const backupGb = isSuper ? 30 : 25;
    const backupPct = Math.round((backupGb / usedGb) * 100);

    return (
      <div className="max-w-4xl mx-auto py-8 animate-fade-in">
        <h2 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-2.5">
          <Database size={24} className="text-indigo-600 animate-pulse" /> Storage Diagnostics
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Used Space</h3>
            <p className="text-3xl font-black text-slate-800 mt-2">{usedGb} GB</p>
            <p className="text-xs text-emerald-600 font-semibold mt-1">{usedPct}% of {isSuper ? '2 TB' : '1.2 TB'} quota</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider">Files Count</h3>
            <p className="text-3xl font-black text-slate-800 mt-2">{filesCount.toLocaleString()}</p>
            <p className="text-xs text-indigo-600 font-semibold mt-1">+148 synced this week</p>
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
                <span>{videoGb} GB</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-purple-600 h-full rounded-full transition-all duration-500" style={{ width: `${videoPct}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-slate-600 font-semibold mb-2">
                <span>Creative Image Assets (.png, .jpg, .obj)</span>
                <span>{imageGb} GB</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-pink-600 h-full rounded-full transition-all duration-500" style={{ width: `${imagePct}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-slate-600 font-semibold mb-2">
                <span>Documents & Spreadsheets (.pdf, .docx, .xls)</span>
                <span>{docGb} GB</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${docPct}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-slate-600 font-semibold mb-2">
                <span>Other Backups</span>
                <span>{backupGb} GB</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${backupPct}%` }}></div>
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
