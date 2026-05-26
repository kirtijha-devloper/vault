import React from 'react';
import { Menu, Search, Sun, Moon, User as UserIcon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ toggleSidebar, searchQuery, setSearchQuery }) => {
  const { darkMode, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white dark:bg-[#111827] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-3 sm:px-4 lg:px-6 sticky top-0 z-10 transition-colors gap-2 sm:gap-4">
      {/* Left side: Mobile menu toggle & Search */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0 max-w-xl">
        <button
          onClick={toggleSidebar}
          className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl lg:hidden transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search vault items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#1F2937] border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
          />
        </div>
      </div>

      {/* Right side: Theme toggle & Profile */}
      <div className="flex items-center gap-2 sm:gap-4 pl-1 sm:pl-4 flex-shrink-0">
        <button
          onClick={toggleTheme}
          className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
        </button>

        <div className="flex items-center gap-2 sm:gap-3 sm:pl-4 sm:border-l sm:border-gray-200 sm:dark:border-gray-800">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-md shadow-brand-500/20">
            {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
          </div>
          <div className="hidden lg:block text-left max-w-[10rem] truncate">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-none mb-1">
              {user?.name || 'Vault User'}
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500 leading-none truncate">
              {user?.email || ''}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
