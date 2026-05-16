import React from 'react';
import { 
  ShieldCheck, 
  Key, 
  FileText, 
  StickyNote, 
  Landmark, 
  User, 
  Briefcase, 
  Share2, 
  Layers,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ activeCategory, setActiveCategory, isOpen, setIsOpen }) => {
  const { logout } = useAuth();

  const categories = [
    { id: 'All', name: 'All Items', icon: Layers },
    { id: 'Passwords', name: 'Passwords', icon: Key },
    { id: 'Documents', name: 'Documents', icon: FileText },
    { id: 'Notes', name: 'Secure Notes', icon: StickyNote },
    { id: 'Banking', name: 'Banking', icon: Landmark },
    { id: 'Personal', name: 'Personal', icon: User },
    { id: 'Work', name: 'Work', icon: Briefcase },
    { id: 'Shares', name: 'Shared Links', icon: Share2 },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white dark:bg-[#111827] border-r border-gray-200 dark:border-gray-800 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800 gap-3">
          <div className="p-2 bg-brand-500/10 dark:bg-brand-500/20 rounded-xl text-brand-500">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-brand-500 to-indigo-600 bg-clip-text text-transparent">
            SecureVault
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <div className="px-3 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            Categories
          </div>
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive 
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
