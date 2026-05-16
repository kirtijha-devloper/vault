import React from 'react';
import { FileText, Download, Share2, Trash2, ExternalLink, Image, FileCode } from 'lucide-react';

const DocumentCard = ({ item, onShare, onDelete }) => {
  const isImage = item.fileType.startsWith('image/');
  const isPdf = item.fileType === 'application/pdf';

  // Format size helper
  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col justify-between group">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-xl text-indigo-500">
              {isImage ? <Image className="w-6 h-6" /> : isPdf ? <FileText className="w-6 h-6" /> : <FileCode className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 group-hover:text-indigo-500 transition-colors">
                {item.title}
              </h3>
              <span className="text-xs text-gray-400 dark:text-gray-500 block mt-0.5">
                {formatSize(item.fileSize)} • {item.fileType.split('/')[1]?.toUpperCase() || 'FILE'}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 opacity-90 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => onShare(item, 'DOCUMENT')} 
              className="p-2 text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Share Document"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <a 
              href={item.fileUrl} 
              target="_blank" 
              rel="noreferrer" 
              download 
              className="p-2 text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center justify-center"
              title="Download / View Document"
            >
              <Download className="w-4 h-4" />
            </a>
            <button 
              onClick={() => onDelete(item.id, 'DOCUMENT')} 
              className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
              title="Delete Document"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Preview / Description */}
        <div className="mt-4 bg-gray-50/50 dark:bg-[#111827]/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800 overflow-hidden">
          {isImage ? (
            <div className="relative h-40 w-full rounded-lg overflow-hidden mb-3 bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200/50 dark:border-gray-700/50">
              <img src={item.fileUrl} alt={item.title} className="object-cover w-full h-full hover:scale-105 transition-transform duration-300" />
            </div>
          ) : (
            <div className="h-20 w-full rounded-lg bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center mb-3 border border-gray-200/50 dark:border-gray-700/50 text-gray-400 dark:text-gray-500 gap-2">
              <FileText className="w-8 h-8 opacity-60" />
              <span className="text-xs font-medium">Document Preview Available via Download</span>
            </div>
          )}
          {item.description ? (
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2">
              {item.description}
            </p>
          ) : (
            <p className="text-xs text-gray-400 dark:text-gray-500 italic">No description provided.</p>
          )}
        </div>
      </div>

      {/* Footer category badge */}
      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
        <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg font-medium">{item.category}</span>
        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default DocumentCard;
