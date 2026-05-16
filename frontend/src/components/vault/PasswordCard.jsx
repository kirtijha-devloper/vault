import React, { useState } from 'react';
import { Key, Eye, EyeOff, Copy, ExternalLink, Edit2, Share2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const PasswordCard = ({ item, onEdit, onShare, onDelete }) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard!`);
  };

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col justify-between group">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-brand-500/10 dark:bg-brand-500/20 rounded-xl text-brand-500">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 group-hover:text-brand-500 transition-colors">
                {item.title}
              </h3>
              {item.website && (
                <a 
                  href={item.website.startsWith('http') ? item.website : `https://${item.website}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-xs text-brand-500 hover:underline flex items-center gap-1 mt-0.5"
                >
                  <span>{item.website}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 opacity-90 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => onShare(item, 'PASSWORD')} 
              className="p-2 text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Share Password"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onEdit(item, 'PASSWORD')} 
              className="p-2 text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Edit Password"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onDelete(item.id, 'PASSWORD')} 
              className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
              title="Delete Password"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Credentials fields */}
        <div className="space-y-3 bg-gray-50/50 dark:bg-[#111827]/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
          {/* Username */}
          <div className="flex items-center justify-between gap-2">
            <div className="overflow-hidden">
              <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-0.5">Username / Email</span>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate block">{item.username}</span>
            </div>
            <button 
              onClick={() => handleCopy(item.username, 'Username')} 
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors shadow-sm"
              title="Copy Username"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>

          {/* Password */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-200/60 dark:border-gray-800/80">
            <div className="overflow-hidden flex-1">
              <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block mb-0.5">Password</span>
              <span className="text-sm font-mono font-medium text-gray-800 dark:text-gray-200 truncate block">
                {showPassword ? item.password : '••••••••••••••••'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setShowPassword(!showPassword)} 
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors shadow-sm"
                title={showPassword ? "Hide Password" : "Show Password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => handleCopy(item.password, 'Password')} 
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors shadow-sm"
                title="Copy Password"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Notes */}
        {item.notes && (
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-3 leading-relaxed">
            <span className="font-semibold text-amber-800 dark:text-amber-400 block mb-1">Notes:</span>
            {item.notes}
          </div>
        )}
      </div>

      {/* Footer category badge */}
      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
        <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg font-medium">{item.category}</span>
        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default PasswordCard;
