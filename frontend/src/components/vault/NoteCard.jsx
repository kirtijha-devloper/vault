import React from 'react';
import { StickyNote, Edit2, Share2, Trash2 } from 'lucide-react';

const NoteCard = ({ item, onEdit, onShare, onDelete }) => {
  const accentColor = item.color || '#3B82F6';

  return (
    <div className="glass-card rounded-2xl p-6 flex flex-col justify-between group relative overflow-hidden">
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: accentColor }} />

      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4 mt-1">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl text-white shadow-md" style={{ backgroundColor: accentColor }}>
              <StickyNote className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 group-hover:text-brand-500 transition-colors">
                {item.title}
              </h3>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 opacity-90 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => onShare(item, 'NOTE')} 
              className="p-2 text-gray-400 hover:text-indigo-500 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Share Note"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onEdit(item, 'NOTE')} 
              className="p-2 text-gray-400 hover:text-brand-500 dark:hover:text-brand-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Edit Note"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onDelete(item.id, 'NOTE')} 
              className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
              title="Delete Note"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-gray-50/50 dark:bg-[#111827]/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800 mt-4 max-h-60 overflow-y-auto custom-scrollbar">
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed font-sans">
            {item.content}
          </p>
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

export default NoteCard;
