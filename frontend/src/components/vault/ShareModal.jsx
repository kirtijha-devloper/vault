import React, { useState } from 'react';
import { X, RefreshCw, Copy, Check, Lock, ShieldAlert } from 'lucide-react';
import { shareService } from '../../services/vaultService';
import toast from 'react-hot-toast';

const ShareModal = ({ isOpen, onClose, shareItem, shareType }) => {
  const [expiresInHours, setExpiresInHours] = useState('24');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [shareData, setShareData] = useState(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !shareItem) return null;

  const handleShare = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await shareService.create({
        itemId: shareItem.id,
        itemType: shareType,
        expiresInHours: parseInt(expiresInHours),
        password: password || undefined,
      });
      setShareData(data);
      toast.success('Secure share link created!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create share link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (shareData) {
      navigator.clipboard.writeText(shareData.shareUrl);
      setCopied(true);
      toast.success('Share link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setShareData(null);
    setPassword('');
    setExpiresInHours('24');
    setCopied(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-[#1F2937]/30">
          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Lock className="w-5 h-5 text-brand-500" />
            <span>Create Secure Share Link</span>
          </h3>
          <button 
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form or Result */}
        <div className="p-6">
          <div className="mb-6 p-4 bg-gray-50 dark:bg-[#1F2937]/50 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-0.5">Sharing Item</span>
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{shareItem.title}</span>
            </div>
            <span className="px-2.5 py-1 bg-brand-500/10 text-brand-500 dark:text-brand-400 rounded-lg text-xs font-semibold uppercase">
              {shareType}
            </span>
          </div>

          {!shareData ? (
            <form onSubmit={handleShare} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Link Expiry</label>
                <select 
                  value={expiresInHours} 
                  onChange={(e) => setExpiresInHours(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#1F2937] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                >
                  <option value="1">1 Hour</option>
                  <option value="6">6 Hours</option>
                  <option value="12">12 Hours</option>
                  <option value="24">24 Hours (1 Day)</option>
                  <option value="72">72 Hours (3 Days)</option>
                  <option value="168">168 Hours (7 Days)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Optional Password Protection</label>
                <input 
                  type="password" 
                  placeholder="Set a password to lock this share link" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#1F2937] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all font-mono"
                />
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                  <span>If set, visitors must enter this password to view the decrypted item.</span>
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
                <button 
                  type="button" 
                  onClick={handleClose}
                  className="px-5 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl font-medium text-sm transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-5 py-2.5 bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white rounded-xl font-medium text-sm shadow-lg shadow-brand-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                  <span>{loading ? 'Generating Link...' : 'Generate Share Link'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6 text-center py-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Check className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-1">Share Link Ready!</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  This link will automatically expire on {new Date(shareData.expiresAt).toLocaleString()}.
                </p>
              </div>

              <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-[#1F2937] border border-gray-200 dark:border-gray-700 rounded-2xl max-w-full overflow-hidden">
                <input 
                  type="text" 
                  readOnly 
                  value={shareData.shareUrl} 
                  className="bg-transparent text-xs text-gray-800 dark:text-gray-200 font-mono flex-1 pl-3 pr-1 focus:outline-none truncate"
                />
                <button 
                  onClick={handleCopy}
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-medium text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-brand-500/20 flex-shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Link'}</span>
                </button>
              </div>

              {shareData.isPasswordProtected && (
                <div className="p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl text-left text-xs text-amber-800 dark:text-amber-400 flex items-center gap-2">
                  <Lock className="w-4 h-4 flex-shrink-0" />
                  <span>Make sure to share the password separately with the recipient!</span>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-center">
                <button 
                  onClick={handleClose}
                  className="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-medium text-sm transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
