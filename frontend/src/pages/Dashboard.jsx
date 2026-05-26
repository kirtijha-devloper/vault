import React, { useState, useEffect } from 'react';
import { 
  Key, 
  FileText, 
  StickyNote, 
  Plus, 
  Upload, 
  RefreshCw, 
  Layers, 
  Trash2, 
  ExternalLink,
  Clock, 
  Eye,
  Lock,
  Globe
} from 'lucide-react';
import { passwordService, documentService, noteService, shareService } from '../services/vaultService';
import PasswordCard from '../components/vault/PasswordCard';
import DocumentCard from '../components/vault/DocumentCard';
import NoteCard from '../components/vault/NoteCard';
import PasswordModal from '../components/vault/PasswordModal';
import DocumentModal from '../components/vault/DocumentModal';
import NoteModal from '../components/vault/NoteModal';
import ShareModal from '../components/vault/ShareModal';
import toast from 'react-hot-toast';

const Dashboard = ({ activeCategory, searchQuery }) => {
  const [passwords, setPasswords] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [notes, setNotes] = useState([]);
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Edit & Share targets
  const [editingPassword, setEditingPassword] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [shareTarget, setShareTarget] = useState(null);
  const [shareType, setShareType] = useState('PASSWORD');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [passData, docData, noteData, shareData] = await Promise.all([
        passwordService.getAll(),
        documentService.getAll(),
        noteService.getAll(),
        shareService.getMyShares(),
      ]);
      setPasswords(passData);
      setDocuments(docData);
      setNotes(noteData);
      setShares(shareData);
    } catch (err) {
      toast.error('Failed to load vault items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter logic
  const filterItem = (item, type) => {
    // Category check
    if (activeCategory !== 'All' && activeCategory !== 'Shares') {
      if (item.category !== activeCategory) return false;
    }

    // Search query check
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();

    if (type === 'PASSWORD') {
      return (
        item.title.toLowerCase().includes(query) ||
        item.username.toLowerCase().includes(query) ||
        (item.website && item.website.toLowerCase().includes(query))
      );
    } else if (type === 'DOCUMENT') {
      return (
        item.title.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query))
      );
    } else if (type === 'NOTE') {
      return (
        item.title.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query)
      );
    }
    return true;
  };

  const filteredPasswords = passwords.filter((item) => filterItem(item, 'PASSWORD'));
  const filteredDocuments = documents.filter((item) => filterItem(item, 'DOCUMENT'));
  const filteredNotes = notes.filter((item) => filterItem(item, 'NOTE'));

  // Delete handlers with confirmation
  const handleDelete = async (id, type) => {
    if (!window.confirm(`Are you sure you want to delete this ${type.toLowerCase()}? This action cannot be undone.`)) {
      return;
    }

    try {
      if (type === 'PASSWORD') {
        await passwordService.delete(id);
        setPasswords(passwords.filter((item) => item.id !== id));
      } else if (type === 'DOCUMENT') {
        await documentService.delete(id);
        setDocuments(documents.filter((item) => item.id !== id));
      } else if (type === 'NOTE') {
        await noteService.delete(id);
        setNotes(notes.filter((item) => item.id !== id));
      }
      toast.success(`${type} deleted successfully`);
    } catch (err) {
      toast.error(`Failed to delete ${type.toLowerCase()}`);
    }
  };

  const handleRevokeShare = async (id) => {
    if (!window.confirm('Are you sure you want to revoke this share link? Anyone with the link will instantly lose access.')) {
      return;
    }

    try {
      await shareService.revoke(id);
      setShares(shares.filter((item) => item.id !== id));
      toast.success('Share link revoked');
    } catch (err) {
      toast.error('Failed to revoke share link');
    }
  };

  // Save handlers
  const handleSavePassword = async (data, id) => {
    if (id) {
      const updated = await passwordService.update(id, data);
      setPasswords(passwords.map((item) => (item.id === id ? updated : item)));
      toast.success('Password updated successfully');
    } else {
      const created = await passwordService.create(data);
      setPasswords([created, ...passwords]);
      toast.success('Password added successfully');
    }
  };

  const handleSaveDocument = async (formData) => {
    const created = await documentService.upload(formData);
    setDocuments([created, ...documents]);
    toast.success('Document uploaded successfully');
  };

  const handleSaveNote = async (data, id) => {
    if (id) {
      const updated = await noteService.update(id, data);
      setNotes(notes.map((item) => (item.id === id ? updated : item)));
      toast.success('Note updated successfully');
    } else {
      const created = await noteService.create(data);
      setNotes([created, ...notes]);
      toast.success('Note added successfully');
    }
  };

  // Open Edit / Share Modals
  const openEdit = (item, type) => {
    if (type === 'PASSWORD') {
      setEditingPassword(item);
      setIsPasswordModalOpen(true);
    } else if (type === 'NOTE') {
      setEditingNote(item);
      setIsNoteModalOpen(true);
    }
  };

  const openShare = (item, type) => {
    setShareTarget(item);
    setShareType(type);
    setIsShareModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-8 h-8 text-brand-500 animate-spin" />
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Decrypting and loading vault items...</span>
      </div>
    );
  }

  const isSharesTab = activeCategory === 'Shares';
  const totalFilteredCount = filteredPasswords.length + filteredDocuments.length + filteredNotes.length;

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
      {/* Top Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 sm:mb-8 bg-white dark:bg-[#111827] p-4 sm:p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2.5 flex-wrap">
            <span>{activeCategory === 'All' ? 'All Vault Items' : activeCategory}</span>
            <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl">
              {isSharesTab ? shares.length : totalFilteredCount}
            </span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {isSharesTab 
              ? 'Manage active secure share links and revoke access instantly'
              : 'Safely store, search, and manage your encrypted credentials and files'}
          </p>
        </div>

        {/* Action Buttons */}
        {!isSharesTab && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:flex items-stretch gap-3 w-full md:w-auto">
            <button
              onClick={() => { setEditingPassword(null); setIsPasswordModalOpen(true); }}
              className="px-4 py-2.5 bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white rounded-xl font-medium text-xs shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2 min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Password</span>
            </button>
            <button
              onClick={() => setIsDocumentModalOpen(true)}
              className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 min-h-[44px]"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Document</span>
            </button>
            <button
              onClick={() => { setEditingNote(null); setIsNoteModalOpen(true); }}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Note</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Grid Content */}
      {!isSharesTab ? (
        totalFilteredCount === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-white/50 dark:bg-[#111827]/50 rounded-3xl border border-gray-200 dark:border-gray-800">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500 mb-4">
              <Layers className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">No items found</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mb-6">
              {searchQuery 
                ? `No items match your search query "${searchQuery}" in ${activeCategory}`
                : `You don't have any items in the ${activeCategory} category yet. Get started by adding your first item above.`}
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Passwords Section */}
            {filteredPasswords.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Key className="w-4 h-4 text-brand-500" />
                  <span>Passwords ({filteredPasswords.length})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPasswords.map((item) => (
                    <PasswordCard 
                      key={item.id} 
                      item={item} 
                      onEdit={openEdit} 
                      onShare={openShare} 
                      onDelete={handleDelete} 
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Documents Section */}
            {filteredDocuments.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <span>Documents ({filteredDocuments.length})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDocuments.map((item) => (
                    <DocumentCard 
                      key={item.id} 
                      item={item} 
                      onShare={openShare} 
                      onDelete={handleDelete} 
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Notes Section */}
            {filteredNotes.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <StickyNote className="w-4 h-4 text-emerald-500" />
                  <span>Secure Notes ({filteredNotes.length})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredNotes.map((item) => (
                    <NoteCard 
                      key={item.id} 
                      item={item} 
                      onEdit={openEdit} 
                      onShare={openShare} 
                      onDelete={handleDelete} 
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )
      ) : (
        /* Shared Links Tab */
        shares.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-white/50 dark:bg-[#111827]/50 rounded-3xl border border-gray-200 dark:border-gray-800">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500 mb-4">
              <Globe className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">No active share links</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm">
              You haven't shared any vault items recently. You can share any password, document, or note by clicking the share icon on its card.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shares.map((share) => (
              <div key={share.id} className="glass-card rounded-2xl p-4 sm:p-6 flex flex-col justify-between group min-w-0">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <span className="px-2.5 py-1 bg-brand-500/10 text-brand-500 dark:text-brand-400 rounded-lg text-xs font-semibold uppercase">
                      {share.itemType}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 min-w-0">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="truncate">Expires {new Date(share.expiresAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="space-y-3 bg-gray-50/50 dark:bg-[#111827]/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Share Token</span>
                      <span className="text-xs font-mono font-medium text-gray-800 dark:text-gray-200 break-all">{share.token}</span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t border-gray-200/60 dark:border-gray-800/80">
                      <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Protection</span>
                      <span className="text-xs font-medium flex items-center gap-1 text-gray-800 dark:text-gray-200">
                        {share.isPasswordProtected ? <Lock className="w-3 h-3 text-amber-500" /> : <Eye className="w-3 h-3 text-green-500" />}
                        <span>{share.isPasswordProtected ? 'Password Locked' : 'Public Access'}</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-200/60 dark:border-gray-800/80">
                      <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Total Views</span>
                      <span className="text-xs font-bold text-brand-500">{share.views}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                  <a 
                    href={`/share/${share.token}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Visit Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button 
                    onClick={() => handleRevokeShare(share.id)} 
                    className="px-4 py-2 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Revoke Access</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Modals */}
      <PasswordModal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
        onSave={handleSavePassword} 
        editingItem={editingPassword} 
      />
      <DocumentModal 
        isOpen={isDocumentModalOpen} 
        onClose={() => setIsDocumentModalOpen(false)} 
        onSave={handleSaveDocument} 
      />
      <NoteModal 
        isOpen={isNoteModalOpen} 
        onClose={() => setIsNoteModalOpen(false)} 
        onSave={handleSaveNote} 
        editingItem={editingNote} 
      />
      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        shareItem={shareTarget} 
        shareType={shareType} 
      />
    </main>
  );
};

export default Dashboard;
