import React, { useState } from 'react';
import { X, Upload, RefreshCw, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const DocumentModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Documents',
    description: '',
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      // Check 10MB limit
      if (selected.size > 10 * 1024 * 1024) {
        toast.error('File size must be under 10MB');
        return;
      }
      setFile(selected);
      if (!formData.title) {
        // Auto-fill title from filename without extension
        setFormData((prev) => ({ ...prev, title: selected.name.replace(/\.[^/.]+$/, "") }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append('file', file);
    data.append('title', formData.title);
    data.append('category', formData.category);
    data.append('description', formData.description);

    await onSave(data);
    setLoading(false);
    // Reset
    setFormData({ title: '', category: 'Documents', description: '' });
    setFile(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-[#1F2937]/30">
          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
            Upload Document
          </h3>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* File dropzone */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Select File *</label>
            <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-brand-500 dark:hover:border-brand-500 rounded-2xl cursor-pointer bg-gray-50/50 dark:bg-[#1F2937]/30 hover:bg-brand-50/10 dark:hover:bg-brand-500/5 transition-all">
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                {file ? (
                  <>
                    <FileText className="w-10 h-10 text-brand-500 mb-2" />
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-xs">{file.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-gray-400 dark:text-gray-500 mb-2" />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">PDF, Images, DOCX, ZIP (Max 10MB)</p>
                  </>
                )}
              </div>
              <input type="file" className="hidden" onChange={handleFileChange} />
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Document Title *</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Identity Proof, Tax Return 2025" 
              value={formData.title} 
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#1F2937] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Category</label>
            <select 
              value={formData.category} 
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#1F2937] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
            >
              <option value="Documents">Documents</option>
              <option value="Banking">Banking</option>
              <option value="Personal">Personal</option>
              <option value="Work">Work</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Description (Optional)</label>
            <textarea 
              rows="3"
              placeholder="Add summary or keywords to find this document easily..." 
              value={formData.description} 
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#1F2937] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all resize-none custom-scrollbar"
            />
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
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
              <span>{loading ? 'Uploading...' : 'Upload Document'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentModal;
