import React, { useState, useEffect } from 'react';
import { Cloud, ShieldCheck, ShieldAlert, Sparkles, Shield, HardDrive, HelpCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { requestGoogleAccessToken } from '../lib/googleDriveClient';

const GoogleIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

const DriveIcon = () => (
  <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.75 3h-7.5L2 14.25h7.5L15.75 3z" fill="#0066DA"/>
    <path d="M22 14.25H14.5L11.25 21h7.5L22 14.25z" fill="#00A85D"/>
    <path d="M9.5 14.25L5.75 21H20.5L22 18l-3.25-5.25H9.5z" fill="#FFD000"/>
    <path d="M9.5 14.25l3.25-5.25h6l3.25 5.25H9.5z" fill="#00832D"/>
  </svg>
);

export default function Login({ onLogin }) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [connectingUser, setConnectingUser] = useState(null);
  const [verificationStage, setVerificationStage] = useState('idle'); // 'idle', 'verifying_google', 'checking_drive', 'drive_not_linked', 'linking_drive', 'fetching_drive_details'
  
  // Real OAuth Integration states
  const [useLiveGoogle, setUseLiveGoogle] = useState(() => {
    return localStorage.getItem('cs_use_live_google') === 'true';
  });
  const [googleClientId, setGoogleClientId] = useState(() => {
    return import.meta.env.VITE_GOOGLE_CLIENT_ID || localStorage.getItem('cs_google_client_id') || '';
  });
  const [showClientIdInfo, setShowClientIdInfo] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Custom sign-in form states
  const [isCustomSignInOpen, setIsCustomSignInOpen] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [customRole, setCustomRole] = useState('user');
  const [customAvatar, setCustomAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80');
  const [customLinkDrive, setCustomLinkDrive] = useState(false);

  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
  ];

  // Dynamic storage-backed Google accounts state
  const [profiles, setProfiles] = useState(() => {
    const defaultProfile = {
      email: 'sahilkhan536ah@gmail.com',
      name: 'Sahil Shah',
      role: 'superadmin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      desc: 'Workspace Administrator (Primary)',
      isDriveLinked: true
    };

    const stored = localStorage.getItem('cs_google_accounts');
    if (stored) {
      try {
        let parsed = JSON.parse(stored);
        // Filter out other default credentials
        parsed = parsed.filter(p => p.email !== 'kc@cloudsphere.io' && p.email !== 'superadmin@cloudsphere.io');
        // Ensure sahilkhan536ah@gmail.com is present as superadmin
        const hasSahil = parsed.some(p => p.email === 'sahilkhan536ah@gmail.com');
        if (!hasSahil) {
          parsed.unshift(defaultProfile);
        } else {
          // Force Sahil to be superadmin and linked
          parsed = parsed.map(p => {
            if (p.email === 'sahilkhan536ah@gmail.com') {
              return { ...p, role: 'superadmin', isDriveLinked: true };
            }
            if (p.isDriveLinked === undefined) {
              p.isDriveLinked = false;
            }
            return p;
          });
        }
        localStorage.setItem('cs_google_accounts', JSON.stringify(parsed));
        return parsed;
      } catch (e) {
        // Fallback
      }
    }
    const defaults = [defaultProfile];
    localStorage.setItem('cs_google_accounts', JSON.stringify(defaults));
    return defaults;
  });

  // Track live selection state changes
  useEffect(() => {
    localStorage.setItem('cs_use_live_google', useLiveGoogle.toString());
  }, [useLiveGoogle]);

  // Sync profile details with Supabase Database safely
  const syncProfileToSupabase = async (profileData) => {
    try {
      const dbProfile = {
        id: profileData.googleUserId || profileData.email,
        email: profileData.email,
        name: profileData.name,
        role: profileData.email === 'sahilkhan536ah@gmail.com' ? 'superadmin' : profileData.role || 'user',
        status: 'active',
        storage: profileData.role === 'superadmin' ? '2 TB' : '1.2 TB',
        avatar: profileData.avatar,
        is_drive_linked: profileData.isDriveLinked,
        last_login: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(dbProfile, { onConflict: 'email' });

      if (error) {
        console.warn("Supabase profile sync failed (schema might not be created yet):", error.message);
      } else {
        console.log("Profile synchronized successfully with Supabase.");
      }
    } catch (e) {
      console.warn("Could not reach Supabase. Fallback memory sync active.", e);
    }
  };

  const handleCopyOrigin = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Triggers Google GIS Client flow
  const handleLiveGoogleLogin = async () => {
    // Sanitize client ID: remove quotes, spaces, etc.
    let cleanedId = googleClientId.trim();
    cleanedId = cleanedId.replace(/['"]+/g, ''); // strip any quotes

    if (!cleanedId) {
      setErrorMessage('Please enter a valid Google Client ID to authorize with Google Identity Services.');
      setShowClientIdInfo(true);
      return;
    }

    if (!cleanedId.includes('.apps.googleusercontent.com')) {
      setErrorMessage('Invalid Google Client ID format. It should look like: [numbers]-[characters].apps.googleusercontent.com. Make sure you did not paste a client secret or project name.');
      setShowClientIdInfo(true);
      return;
    }

    setErrorMessage('');
    setGoogleClientId(cleanedId); // sync state with sanitized value
    localStorage.setItem('cs_google_client_id', cleanedId);

    try {
      setVerificationStage('verifying_google');
      // Trigger GIS authorization popup
      const tokenResponse = await requestGoogleAccessToken(cleanedId);
      const accessToken = tokenResponse.access_token;

      // Fetch user profile information using standard oauth endpoint
      const profileRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
      if (!profileRes.ok) {
        throw new Error('Failed to retrieve user details from Google profile servers.');
      }
      
      const googleUser = await profileRes.json();
      const newLiveProfile = {
        email: googleUser.email.toLowerCase(),
        name: googleUser.name,
        role: googleUser.email === 'sahilkhan536ah@gmail.com' ? 'superadmin' : 'user',
        avatar: googleUser.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        isDriveLinked: true,
        accessToken: accessToken,
        googleUserId: googleUser.sub
      };

      setConnectingUser(newLiveProfile);
      setVerificationStage('checking_drive');

      // Stage 2: Mapped space verified
      setTimeout(() => {
        setVerificationStage('fetching_drive_details');
        
        // Stage 3: Fetching dynamic content
        setTimeout(async () => {
          await syncProfileToSupabase(newLiveProfile);
          if (onLogin) {
            onLogin(newLiveProfile);
          }
        }, 1500);
      }, 1500);

    } catch (err) {
      console.error("GIS Flow Error:", err);
      setVerificationStage('idle');
      
      let parsedMessage = 'Sign in cancelled or configuration rejected by Google Auth policy.';
      if (err && typeof err === 'object') {
        const errType = err.error || err.details || '';
        if (errType === 'invalid_client' || (err.message && err.message.includes('invalid_client'))) {
          parsedMessage = `Error 401 (invalid_client): Google does not recognize this Client ID. Ensure you have copied the Client ID correctly (it must contain the project numeric prefix and end in .apps.googleusercontent.com). Also ensure the JavaScript origin is configured to: ${window.location.origin}`;
        } else if (errType === 'popup_closed_by_user') {
          parsedMessage = 'Authentication popup was closed before completion. Please try again.';
        } else if (errType === 'access_denied') {
          parsedMessage = 'Access denied: Google Drive readonly permission was rejected. You must authorize read-only drive access to continue.';
        } else if (err.message) {
          parsedMessage = err.message;
        } else if (typeof err.error === 'string') {
          parsedMessage = `Google Auth Error: ${err.error}`;
        }
      }
      setErrorMessage(parsedMessage);
    }
  };

  const handleSelectProfile = (profile) => {
    setConnectingUser(profile);
    setVerificationStage('verifying_google');
    
    // Stage 1: Verify Google Identity (OAuth token handshake)
    setTimeout(() => {
      setVerificationStage('checking_drive');
      
      // Stage 2: Check for linked Google Drive
      setTimeout(() => {
        const isLinked = profile.isDriveLinked ?? false;
        if (isLinked) {
          setVerificationStage('fetching_drive_details');
          
          // Stage 3: Fetch personalized details from Google Drive
          setTimeout(async () => {
            await syncProfileToSupabase(profile);
            if (onLogin) {
              onLogin({
                email: profile.email,
                name: profile.name,
                role: profile.role,
                avatar: profile.avatar,
                isDriveLinked: true
              });
            }
          }, 1500);
        } else {
          setVerificationStage('drive_not_linked');
        }
      }, 1500);
    }, 1500);
  };

  const handleLinkDriveAndLogin = (profile) => {
    setVerificationStage('linking_drive');
    
    // Simulate mounting partition and registering namespace
    setTimeout(async () => {
      const updatedProfiles = profiles.map(p => {
        if (p.email === profile.email) {
          return { ...p, isDriveLinked: true };
        }
        return p;
      });
      setProfiles(updatedProfiles);
      localStorage.setItem('cs_google_accounts', JSON.stringify(updatedProfiles));
      
      const loggedProfile = { ...profile, isDriveLinked: true };
      await syncProfileToSupabase(loggedProfile);

      if (onLogin) {
        onLogin(loggedProfile);
      }
    }, 2000);
  };

  const handleContinueWithoutDrive = async (profile) => {
    const loggedProfile = { ...profile, isDriveLinked: false };
    await syncProfileToSupabase(loggedProfile);
    if (onLogin) {
      onLogin(loggedProfile);
    }
  };

  const handleCreateCustomAccount = (e) => {
    e.preventDefault();
    if (!customEmail || !customName) return;

    // Direct profile construction
    const newProfile = {
      email: customEmail.toLowerCase().trim(),
      name: customName.trim(),
      role: customRole,
      avatar: customAvatar,
      desc: customRole === 'superadmin' ? 'Workspace Administrator' : 'Personal Cloud Storage Space',
      isDriveLinked: customLinkDrive
    };

    // Prevent duplicate emails
    if (profiles.some(p => p.email === newProfile.email)) {
      const existing = profiles.find(p => p.email === newProfile.email);
      setIsCustomSignInOpen(false);
      handleSelectProfile(existing);
      return;
    }

    const updatedProfiles = [...profiles, newProfile];
    setProfiles(updatedProfiles);
    localStorage.setItem('cs_google_accounts', JSON.stringify(updatedProfiles));

    // Clear form states & proceed directly to OAuth validation for the created user
    setCustomEmail('');
    setCustomName('');
    setCustomLinkDrive(false);
    setIsCustomSignInOpen(false);
    handleSelectProfile(newProfile);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Premium ambient light vectors */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-100/50 blur-3xl mix-blend-multiply"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-emerald-50/50 blur-3xl mix-blend-multiply"></div>
      </div>

      <div className="absolute top-8 left-8 flex items-center gap-2 text-slate-500 font-medium z-10 text-xs tracking-wider">
        <ShieldCheck size={16} className="text-indigo-600" />
        SECURED BY GOOGLE WORKSPACE PROTOCOL
      </div>

      <div className="bg-white/90 backdrop-blur-2xl w-full max-w-md rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-white/80 p-10 z-10 transition-all duration-300">
        
        {/* Verification Loader Box */}
        {verificationStage !== 'idle' && verificationStage !== 'drive_not_linked' && connectingUser ? (
          <div className="flex flex-col py-2 animate-fade-in text-center">
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-3 group">
                <img 
                  src={connectingUser.avatar} 
                  alt={connectingUser.name} 
                  className="w-16 h-16 rounded-full object-cover border-4 border-indigo-50 shadow-md group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow border border-slate-100">
                  <GoogleIcon />
                </div>
              </div>
              <h3 className="font-bold text-slate-800 text-sm">{connectingUser.name}</h3>
              <p className="text-slate-400 text-xs">{connectingUser.email}</p>
            </div>

            <div className="space-y-4 text-left bg-slate-50 border border-slate-100 rounded-3xl p-5 mb-4">
              {/* Step 1: Google OAuth */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0">
                  {verificationStage === 'verifying_google' ? (
                    <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold">✓</div>
                  )}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-700">Google Identity Verification</h5>
                  <p className="text-[10px] text-slate-400">
                    {verificationStage === 'verifying_google' ? 'Authenticating with Google OAuth credentials...' : 'Identity verified successfully'}
                  </p>
                </div>
              </div>

              {/* Step 2: Drive Partition */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0">
                  {verificationStage === 'verifying_google' ? (
                    <div className="w-4 h-4 bg-slate-200 rounded-full flex items-center justify-center text-[10px] text-slate-400 font-bold">•</div>
                  ) : verificationStage === 'checking_drive' ? (
                    <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[9px] font-bold">✓</div>
                  )}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-700">Google Drive Mappings</h5>
                  <p className="text-[10px] text-slate-400">
                    {verificationStage === 'verifying_google' ? 'Waiting for identity...' :
                     verificationStage === 'checking_drive' ? 'Scanning Drive partition allocations...' :
                     'Drive configuration active'}
                  </p>
                </div>
              </div>

              {/* Step 3: Metadata Streaming */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0">
                  {verificationStage === 'verifying_google' || verificationStage === 'checking_drive' ? (
                    <div className="w-4 h-4 bg-slate-200 rounded-full flex items-center justify-center text-[10px] text-slate-400 font-bold">•</div>
                  ) : (
                    <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-700">Data Stream Integration</h5>
                  <p className="text-[10px] text-slate-400">
                    {verificationStage === 'linking_drive' ? 'Mounting CloudSphere root workspace namespace...' :
                     verificationStage === 'fetching_drive_details' ? 'Syncing files, quotas & personal resources...' :
                     'Waiting for Drive mapping...'}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 font-bold uppercase mt-4 tracking-wider animate-pulse">
              {verificationStage === 'verifying_google' ? 'Authorizing Google credentials...' :
               verificationStage === 'checking_drive' ? 'Querying workspace partition...' :
               'Synchronizing storage resources...'}
            </p>
          </div>
        ) : verificationStage === 'drive_not_linked' && connectingUser ? (
          /* Drive Not Associated Screen */
          <div className="animate-fade-in text-left">
            <div className="flex flex-col items-center mb-6">
              <img 
                src={connectingUser.avatar} 
                alt={connectingUser.name} 
                className="w-16 h-16 rounded-full object-cover border-4 border-indigo-50 shadow-md"
              />
              <h3 className="font-bold text-slate-800 text-sm mt-2">{connectingUser.name}</h3>
              <p className="text-slate-400 text-xs">{connectingUser.email}</p>
            </div>

            <div className="bg-amber-50/60 border border-amber-200/50 rounded-3xl p-5 mb-6 flex gap-4">
              <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 flex-shrink-0">
                <HardDrive size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Drive Link Required</h4>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Your Google Identity is verified, but this account has no Google Drive link registered. Link it to fetch personalized workspace details.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleLinkDriveAndLogin(connectingUser)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-5 rounded-2xl text-xs transition-all shadow-md shadow-indigo-600/10 cursor-pointer text-center"
              >
                Link Google Drive & Login
              </button>

              <button
                type="button"
                onClick={() => handleContinueWithoutDrive(connectingUser)}
                className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-bold py-3.5 px-5 rounded-2xl text-xs transition-all cursor-pointer text-center"
              >
                Continue Without Drive Integration
              </button>

              <button
                type="button"
                onClick={() => {
                  setConnectingUser(null);
                  setVerificationStage('idle');
                }}
                className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer pt-2"
              >
                ← Back to profile list
              </button>
            </div>
          </div>
        ) : !isPickerOpen ? (
          /* Welcome Launch Screen */
          <div className="flex flex-col items-center">
            {/* Branding Sphere */}
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-xl shadow-indigo-600/20 relative z-10">
                <Cloud className="text-white w-10 h-10" />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[2.2rem] blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
            </div>

            <h1 className="text-2xl font-black text-slate-800 tracking-tight">CloudSphere</h1>
            <p className="text-slate-500 text-xs mt-1 text-center font-medium max-w-xs">
              Synchronize your workspace using encrypted Google Drive storage allocations.
            </p>

            {/* Live Integration Toggle Option */}
            <div className="w-full my-6 flex flex-col gap-3">
              <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setUseLiveGoogle(false)}
                  className={`flex-1 py-2 text-center rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer ${
                    !useLiveGoogle 
                      ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/50' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  ⚡ Sandbox Mode
                </button>
                <button
                  type="button"
                  onClick={() => setUseLiveGoogle(true)}
                  className={`flex-1 py-2 text-center rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all cursor-pointer ${
                    useLiveGoogle 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  ☁ Live Google Drive
                </button>
              </div>

              {useLiveGoogle && (
                <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 animate-fade-in text-left">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wide flex items-center gap-1">
                      <Sparkles size={11} className="text-indigo-500" />
                      Google Cloud OAuth ID
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowClientIdInfo(!showClientIdInfo)}
                      className="text-indigo-500 hover:text-indigo-700 transition-colors text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      <HelpCircle size={12} />
                      <span>{showClientIdInfo ? 'Hide Setup' : 'Show Setup'}</span>
                    </button>
                  </div>
                  
                  {showClientIdInfo && (
                    <div className="text-[10px] text-indigo-900 leading-relaxed mb-3 bg-white p-3 rounded-xl border border-indigo-100/50 animate-fade-in shadow-[0_4px_12px_rgba(90,81,230,0.03)]">
                      <p className="font-bold mb-1">To get your Google Client ID:</p>
                      <ol className="list-decimal list-inside space-y-1 mb-2">
                        <li>Go to Google Cloud Console.</li>
                        <li>Create a project & enable <strong>Google Drive API</strong>.</li>
                        <li>Create OAuth consent screen (External, add scope: <code>.../auth/drive.readonly</code>).</li>
                        <li>Create OAuth client ID (Web application) & set Authorized JavaScript origins to the value below.</li>
                        <li>Copy the Client ID and paste it below.</li>
                      </ol>

                      <div className="mt-3 bg-indigo-500/5 p-2.5 rounded-lg border border-indigo-500/10 text-[9px] text-indigo-900/90 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-indigo-700">Authorized JavaScript Origin:</span>
                          <button
                            type="button"
                            onClick={handleCopyOrigin}
                            className={`px-1.5 py-0.5 rounded text-[8px] font-black tracking-wider uppercase transition-all border cursor-pointer ${
                              copySuccess
                                ? 'bg-emerald-500 border-emerald-600 text-white'
                                : 'bg-indigo-600 border-indigo-700 text-white hover:bg-indigo-700 active:scale-95'
                            }`}
                          >
                            {copySuccess ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                        <code className="block bg-indigo-950 text-indigo-300 p-1.5 rounded font-mono text-[9px] select-all tracking-tight break-all border border-indigo-800">
                          {window.location.origin}
                        </code>
                        <p className="leading-normal text-indigo-700/80">
                          ⚠️ If your browser port changes (e.g. to <code>5181</code>), Google will reject authentication with a <strong>401: invalid_client</strong> or <strong>origin_mismatch</strong> error. Ensure you match the console setting exactly!
                        </p>
                      </div>

                      <div className="mt-2.5 flex justify-end">
                        <a
                          href="https://console.cloud.google.com/apis/credentials"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
                        >
                          Google Cloud Credentials Console ↗
                        </a>
                      </div>
                    </div>
                  )}

                  <input
                    type="text"
                    value={googleClientId}
                    onChange={(e) => setGoogleClientId(e.target.value)}
                    placeholder="Paste your client-id.apps.googleusercontent.com"
                    className="w-full px-3 py-2 bg-white border border-indigo-200 focus:border-indigo-600 focus:outline-none rounded-xl text-xs text-slate-800 placeholder-slate-400 shadow-sm transition-all"
                  />
                  
                  {googleClientId && !googleClientId.includes('.apps.googleusercontent.com') && (
                    <p className="text-[9px] font-bold text-amber-600 mt-1 bg-amber-50 border border-amber-100 p-1.5 rounded-lg leading-relaxed flex items-start gap-1">
                      ⚠️ Client ID should end with ".apps.googleusercontent.com" - verify you did not copy a client secret or project name.
                    </p>
                  )}

                  {errorMessage && (
                    <div className="text-[10px] font-semibold text-rose-600 mt-2 bg-rose-50 border border-rose-100 p-3 rounded-lg leading-relaxed space-y-1.5 animate-pulse">
                      <div className="flex items-start gap-1.5">
                        <ShieldAlert size={14} className="flex-shrink-0 mt-0.5" />
                        <span>{errorMessage}</span>
                      </div>
                      {errorMessage.includes('invalid_client') && (
                        <div className="pt-1.5 border-t border-rose-200/50 text-[9px] text-rose-700 leading-normal font-normal">
                          <p className="font-bold">Troubleshooting 401 error:</p>
                          <ul className="list-disc list-inside space-y-0.5 mt-0.5">
                            <li>Check if the Client ID has leading or trailing white spaces.</li>
                            <li>Check if the Google Cloud project was created under an organization with API restrictions.</li>
                            <li>Make sure the OAuth client ID is set to <strong>Web application</strong> (not Desktop or Web service).</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Principal authentic login trigger */}
            {useLiveGoogle ? (
              <button
                type="button"
                onClick={handleLiveGoogleLogin}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-2xl shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/25 active:scale-[0.99] cursor-pointer flex items-center justify-center gap-3 text-sm group transition-all"
              >
                <GoogleIcon />
                <span>Continue with Google Drive</span>
                <span className="text-white/60 group-hover:translate-x-0.5 transition-transform">→</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsPickerOpen(true)}
                className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-4 px-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md active:scale-[0.99] cursor-pointer flex items-center justify-center gap-3 text-sm group"
              >
                <GoogleIcon />
                <span>Select Account (Sandbox)</span>
                <span className="text-slate-400 group-hover:translate-x-0.5 transition-transform">→</span>
              </button>
            )}

            <div className="mt-8 flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full">
              <Sparkles size={10} className="text-indigo-500" />
              Direct OAuth 2.0 Access
            </div>
          </div>
        ) : isCustomSignInOpen ? (
          /* Sandbox Custom User Sign In Form */
          <div className="animate-fade-in">
            <div className="flex justify-center mb-6">
              <span className="text-2xl font-bold tracking-tight">
                <span className="text-[#4285F4]">G</span>
                <span className="text-[#EA4335]">o</span>
                <span className="text-[#FBBC05]">o</span>
                <span className="text-[#4285F4]">g</span>
                <span className="text-[#34A853]">l</span>
                <span className="text-[#EA4335]">e</span>
              </span>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-normal text-slate-800">Sign in</h2>
              <p className="text-xs text-slate-500 mt-1">
                Use your Google Account to connect to <span className="font-semibold text-indigo-600">CloudSphere</span>
              </p>
            </div>

            <form onSubmit={handleCreateCustomAccount} className="space-y-4">
              <div>
                <input
                  type="email"
                  required
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="Email address (e.g. name@gmail.com)"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white transition-all placeholder-slate-400"
                />
              </div>

              <div>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Full name"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white transition-all placeholder-slate-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Workspace Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomRole('user')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                      customRole === 'user'
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Standard Member
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomRole('superadmin')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                      customRole === 'superadmin'
                        ? 'bg-amber-50 border-amber-600 text-amber-700 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Super Admin
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Choose Profile Icon</label>
                <div className="flex gap-3 justify-center py-1">
                  {presetAvatars.map((av, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCustomAvatar(av)}
                      className={`relative rounded-full border-2 transition-all p-0.5 cursor-pointer ${
                        customAvatar === av ? 'border-indigo-600 scale-110 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={av} alt="Avatar option" className="w-9 h-9 rounded-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setIsCustomSignInOpen(false)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ← Back to list
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-md shadow-indigo-600/10 cursor-pointer active:scale-95 transition-all"
                >
                  Next
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Sandbox Accounts List Picker */
          <div>
            <div className="flex items-center gap-3 mb-6">
              <GoogleIcon />
              <div>
                <h2 className="font-bold text-slate-800 text-base">Choose an account</h2>
                <p className="text-xs text-slate-500">to continue to <span className="font-bold text-indigo-600">CloudSphere</span></p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 max-h-[280px] overflow-y-auto pr-1">
              {profiles.map((profile) => (
                <button
                  key={profile.email}
                  type="button"
                  onClick={() => handleSelectProfile(profile)}
                  className="w-full flex items-center gap-4 py-3.5 px-3 hover:bg-slate-50 rounded-2xl transition-colors text-left group cursor-pointer animate-fade-in"
                >
                  <img 
                    src={profile.avatar} 
                    alt={profile.name} 
                    className="w-10 h-10 rounded-full object-cover border border-slate-100"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-sm text-slate-800 truncate">{profile.name}</h4>
                      {profile.role === 'superadmin' ? (
                        <span className="flex items-center gap-0.5 text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-black border border-amber-100">
                          <Shield size={8} /> ADMIN
                        </span>
                      ) : (
                        <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-black border border-indigo-100">
                          MEMBER
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{profile.email}</p>
                  </div>
                  <span className="text-slate-300 group-hover:text-slate-500 transition-colors text-lg font-bold">
                    ›
                  </span>
                </button>
              ))}

              <button
                type="button"
                onClick={() => setIsCustomSignInOpen(true)}
                className="w-full flex items-center gap-4 py-4 px-3 hover:bg-slate-50 rounded-2xl transition-colors text-left cursor-pointer text-slate-500 text-xs font-semibold"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold">
                  ＋
                </div>
                <span>Use another account</span>
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-[10px] text-slate-400 leading-relaxed">
                To continue, Google will share your name, email address, and profile picture with CloudSphere. CloudSphere will also receive permissions to access files metadata stored in your Google Drive.
              </p>
              
              <button
                type="button"
                onClick={() => setIsPickerOpen(false)}
                className="mt-4 text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
              >
                ← Back to launchscreen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
