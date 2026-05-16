import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { shareService } from '../services/vaultService';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  FileText, 
  StickyNote, 
  Copy, 
  Download, 
  ExternalLink, 
  RefreshCw, 
  Eye, 
  EyeOff,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

const SharedItem = () => {
  const { token } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [password, setPassword] = useState('');
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const fetchSharedItem = async (pass = null) => {
    setLoading(true);
    setError(null);
    try {
      const data = await shareService.getSharedItem(token, pass);
      setItem(data);
      setIsPasswordProtected(false);
    } catch (err) {
      if (err.response?.status === 401 && err.response?.data?.isPasswordProtected) {
        setIsPasswordProtected(true);
        if (pass) toast.error('Incorrect password');
      } else {
        setError(err.response?.data?.error || 'Failed to load shared item');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSharedItem();
  }, [token]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!password) return;
    fetchSharedItem(password);
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0B0F19]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-brand-500 animate-spin" />
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Verifying secure share link...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0B0F19] p-4">
        <div className="glass-panel bg-white/10 dark:bg-gray-900/60 backdrop-blur-xl border border-white/10 dark:border-gray-800/80 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Link Unavailable</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{error}</p>
          <div className="p-4 bg-gray-50 dark:bg-[#111827] rounded-2xl text-xs text-gray-400 dark:text-gray-500">
            This link may have expired, been revoked by the owner, or never existed.
          </div>
        </div>
      </div>
    );
  }

  if (isPasswordProtected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0B0F19] p-4 relative overflow-hidden bg-gradient-to-br from-gray-900 via-[#0B0F19] to-indigo-950">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="w-full max-w-md glass-panel bg-white/10 dark:bg-gray-900/60 backdrop-blur-xl border border-white/10 dark:border-gray-800/80 rounded-3xl p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-300">
          <div className="text-center mb-8">
            <div className="inline-flex p-4 bg-amber-500/10 text-amber-500 rounded-2xl mb-4">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white mb-1">Password Protected</h2>
            <p className="text-sm text-gray-400">This shared item requires a password to view</p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Share Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  placeholder="Enter share password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700/60 rounded-2xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all backdrop-blur-sm font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white rounded-2xl font-semibold text-sm shadow-xl shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Unlock Item</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#0B0F19] text-gray-900 dark:text-gray-100 font-sans antialiased selection:bg-brand-500 selection:text-white transition-colors duration-200">
      {/* Header */}
      <header className="h-16 bg-white dark:bg-[#111827] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-500/10 dark:bg-brand-500/20 rounded-xl text-brand-500">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-brand-500 to-indigo-600 bg-clip-text text-transparent">
            SecureVault Share
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 bg-green-500/10 text-green-500 dark:text-green-400 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span>Secure Connection</span>
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 lg:p-8 max-w-3xl mx-auto w-full">
        <div className="w-full glass-card rounded-3xl p-6 lg:p-8 border border-gray-200/50 dark:border-gray-800/80 shadow-2xl animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden">
          {/* Top accent bar */}
          <div className={`absolute top-0 left-0 right-0 h-2 ${
            item.type === 'PASSWORD' ? 'bg-brand-500' : item.type === 'DOCUMENT' ? 'bg-indigo-500' : 'bg-emerald-500'
          }`} />

          {/* Item Header */}
          <div className="flex items-start justify-between gap-4 mb-6 mt-2">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl text-white shadow-lg ${
                item.type === 'PASSWORD' ? 'bg-brand-500 shadow-brand-500/30' : item.type === 'DOCUMENT' ? 'bg-indigo-500 shadow-indigo-500/30' : 'bg-emerald-500 shadow-emerald-500/30'
              }`}>
                {item.type === 'PASSWORD' ? <Key className="w-7 h-7" /> : item.type === 'DOCUMENT' ? <FileText className="w-7 h-7" /> : <StickyNote className="w-7 h-7" />}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">{item.title}</h1>
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
                  Shared {item.type} • {item.category}
                </span>
              </div>
            </div>

            {item.website && (
              <a 
                href={item.website.startsWith('http') ? item.website : `https://${item.website}`} 
                target="_blank" 
                rel="noreferrer" 
                className="px-4 py-2 bg-brand-500/10 text-brand-500 hover:bg-brand-500/20 rounded-xl font-medium text-xs flex items-center gap-1.5 transition-colors"
              >
                <span>Visit Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Decrypted Content Rendering */}
          {item.type === 'PASSWORD' && (
            <div className="space-y-4 bg-gray-50/50 dark:bg-[#111827]/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
              {/* Username */}
              <div className="flex items-center justify-between gap-4">
                <div className="overflow-hidden">
                  <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1">Username / Email</span>
                  <span className="text-base font-medium text-gray-800 dark:text-gray-200">{item.username}</span>
                </div>
                <button 
                  onClick={() => handleCopy(item.username, 'Username')} 
                  className="p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-colors shadow-sm flex items-center gap-1.5 text-xs font-medium"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </button>
              </div>

              {/* Password */}
              <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-200/60 dark:border-gray-800/80">
                <div className="overflow-hidden flex-1">
                  <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1">Password</span>
                  <span className="text-base font-mono font-medium text-gray-800 dark:text-gray-200 tracking-wide">
                    {showPassword ? item.password : '••••••••••••••••'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-colors shadow-sm"
                    title={showPassword ? "Hide Password" : "Show Password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button 
                    onClick={() => handleCopy(item.password, 'Password')} 
                    className="p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-colors shadow-sm flex items-center gap-1.5 text-xs font-medium"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              {/* Notes */}
              {item.notes && (
                <div className="pt-4 border-t border-gray-200/60 dark:border-gray-800/80">
                  <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-1">Secure Notes</span>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                    {item.notes}
                  </p>
                </div>
              )}
            </div>
          )}

          {item.type === 'DOCUMENT' && (
            <div className="space-y-6 bg-gray-50/50 dark:bg-[#111827]/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 text-center">
              <div className="w-20 h-20 bg-indigo-500/10 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto">
                <FileText className="w-10 h-10" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-1">{item.title}</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {(item.fileSize / (1024 * 1024)).toFixed(2)} MB • {item.fileType}
                </p>
              </div>

              {item.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                  {item.description}
                </p>
              )}

              <div className="pt-4 border-t border-gray-200/60 dark:border-gray-800/80 flex justify-center">
                <a 
                  href={item.fileUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  download 
                  className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Document</span>
                </a>
              </div>
            </div>
          )}

          {item.type === 'NOTE' && (
            <div className="bg-gray-50/50 dark:bg-[#111827]/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
              <div className="bg-white dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200/50 dark:border-gray-700/50 min-h-[150px]">
                <p className="text-base text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed font-sans">
                  {item.content}
                </p>
              </div>
            </div>
          )}

          {/* Footer Notice */}
          <div className="mt-8 pt-6 border-t border-gray-200/50 dark:border-gray-800/80 text-center text-xs text-gray-400 dark:text-gray-500 flex items-center justify-center gap-2">
            <Lock className="w-3.5 h-3.5 text-brand-500" />
            <span>This is a secure, temporary, view-only share link.</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SharedItem;
