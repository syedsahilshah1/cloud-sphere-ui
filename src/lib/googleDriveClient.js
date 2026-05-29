/**
 * Google Drive API Client Integration
 * Handles GIS (Google Identity Services) OAuth 2.0 handshake, Drive API requests,
 * and high-fidelity simulated/fallback accounts.
 */

// Load Google Identity Services SDK
export function loadGsiScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve(window.google);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.oauth2) {
        resolve(window.google);
      } else {
        reject(new Error('Google Identity Services SDK loaded but not initialized.'));
      }
    };
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });
}

// Request Access Token from Google OAuth 2.0
export async function requestGoogleAccessToken(clientId) {
  await loadGsiScript();
  
  return new Promise((resolve, reject) => {
    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile https://www.googleapis.com/auth/drive.readonly',
        callback: (response) => {
          if (response.error) {
            reject(response);
          } else {
            resolve(response); // Contains access_token, expires_in, etc.
          }
        },
        error_callback: (err) => {
          reject(err);
        }
      });
      client.requestAccessToken({ prompt: 'consent' });
    } catch (error) {
      reject(error);
    }
  });
}

// Map Google MimeTypes to CloudSphere's internal types
export function mapMimeType(mimeType) {
  if (!mimeType) return 'txt';
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('word') || mimeType === 'application/vnd.google-apps.document') return 'docx';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet') || mimeType === 'application/vnd.google-apps.spreadsheet') return 'xlsx';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation') || mimeType === 'application/vnd.google-apps.presentation') return 'pptx';
  if (mimeType.includes('video') || mimeType.includes('mp4')) return 'mp4';
  if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return 'jpg';
  if (mimeType.includes('png')) return 'png';
  if (mimeType.includes('gif')) return 'gif';
  return 'txt';
}

// Format byte sizes into readable values
export function formatBytes(bytes) {
  if (!bytes) return '12 KB'; // Google files have no native size
  const parsed = parseInt(bytes, 10);
  if (isNaN(parsed) || parsed === 0) return '24 KB';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(parsed) / Math.log(k));
  return parseFloat((parsed / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Format Drive ISO times to readable labels
export function formatModifiedTime(isoString) {
  if (!isoString) return 'yesterday';
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    
    // Default formatted date
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (e) {
    return 'recently';
  }
}

// Fetch files from real Google Drive API
export async function fetchRealGoogleDriveFiles(accessToken) {
  const url = 'https://www.googleapis.com/drive/v3/files?fields=files(id,name,mimeType,size,modifiedTime,thumbnailLink)&q=trashed=false&pageSize=40';
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Google Drive API failed: ${response.statusText}`);
  }

  const data = await response.json();
  
  return (data.files || []).map((file) => ({
    id: file.id,
    name: file.name,
    type: mapMimeType(file.mimeType),
    modified: formatModifiedTime(file.modifiedTime),
    size: formatBytes(file.size),
    previewUrl: file.thumbnailLink || '',
    isRealGoogleFile: true
  }));
}

// Dynamic Mock Drive Files for demo/sandbox purposes
export const sandboxDriveFiles = [
  {
    id: 'sb-1',
    name: 'Brand_Identity_v2.pdf',
    type: 'pdf',
    modified: '2h ago',
    size: '4.2 MB',
    previewUrl: ''
  },
  {
    id: 'sb-2',
    name: 'Hero_Section_Draft.jpg',
    type: 'jpg',
    modified: '5h ago',
    size: '12.8 MB',
    previewUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'sb-3',
    name: 'Content_Strategy.docx',
    type: 'docx',
    modified: 'yesterday',
    size: '856 KB',
    previewUrl: ''
  },
  {
    id: 'sb-4',
    name: 'Transparent_Logo.png',
    type: 'png',
    modified: '3d ago',
    size: '2.1 MB',
    previewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'sb-5',
    name: 'Presentation_Video.mp4',
    type: 'mp4',
    modified: '1w ago',
    size: '245 MB',
    previewUrl: ''
  },
  {
    id: 'sb-6',
    name: 'Meeting_Notes.txt',
    type: 'txt',
    modified: 'yesterday',
    size: '12 KB',
    previewUrl: ''
  },
  {
    id: 'sb-7',
    name: 'Desktop_Wallpaper.jpg',
    type: 'jpg',
    modified: '2w ago',
    size: '3.5 MB',
    previewUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'sb-8',
    name: 'Q3_Financials.pdf',
    type: 'pdf',
    modified: '1mo ago',
    size: '1.8 MB',
    previewUrl: ''
  }
];
