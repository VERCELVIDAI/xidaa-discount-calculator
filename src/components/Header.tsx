import React from 'react';
import { 
  PlusCircle, 
  Bookmark, 
  Settings,
  Calculator,
  ChevronRight,
  LogOut,
  User,
  Cloud,
  CloudOff
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export const Header: React.FC = () => {
  const { 
    activeView, 
    setActiveView, 
    startNewOrder, 
    savedOrders,
    orderInput,
    cloudSyncStatus
  } = useApp();

  const { user, logout, isConfigured } = useAuth();

  return (
    <header className="no-print glass-header sticky top-0 z-40 transition-all duration-200">
      {/* Subtle Indian Tricolour Precision Brand Accent Line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-[#FF9933] via-[#FFFFFF] to-[#128807]" />

      <div className="max-w-5xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-15 sm:h-16">
          
          {/* Logo & Brand Identity */}
          <div 
            className="flex items-center space-x-3 cursor-pointer py-1 group select-none"
            onClick={() => setActiveView('home')}
            title="Xidaa Discount Calculator - Home"
          >
            <div className="relative flex items-center">
              <img 
                src="/assets/xidaa-logo-dark.png" 
                alt="Xidaa Moto" 
                className="h-7 sm:h-8 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
              />
            </div>
            
            <div className="hidden sm:flex flex-col border-l border-slate-200/90 pl-3">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#101827]">
                Discount Calculator
              </span>
              <span className="text-[9px] uppercase tracking-widest text-[#12B8A6] font-extrabold flex items-center space-x-1">
                <span>RIDE THE ELECTRIC THUNDER</span>
              </span>
            </div>
          </div>

          {/* Primary Navigation Items */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            
            {/* Home / New Order Button */}
            <button
              type="button"
              onClick={() => {
                if (activeView === 'home') {
                  startNewOrder(false);
                } else if (activeView === 'order-form') {
                  // already in order form
                } else {
                  setActiveView('order-form');
                }
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all ${
                activeView === 'order-form' || activeView === 'home'
                  ? 'bg-[#101827] text-white shadow-xs active:scale-[0.98]'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 active:scale-[0.98]'
              }`}
            >
              <PlusCircle className={`w-3.5 h-3.5 ${activeView === 'order-form' || activeView === 'home' ? 'text-[#12B8A6]' : ''}`} />
              <span>{activeView === 'order-form' ? 'Order Form' : 'New Order'}</span>
            </button>

            {/* Quick Results Shortcut (When in calculation flow) */}
            {(activeView === 'results' || activeView === 'print-summary') && (
              <button
                type="button"
                onClick={() => setActiveView('results')}
                className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#101827] text-white shadow-xs border border-teal-500/30"
              >
                <Calculator className="w-3.5 h-3.5 text-[#12B8A6]" />
                <span className="truncate max-w-[120px]">{orderInput.orderRef}</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
              </button>
            )}

            {/* Saved Orders */}
            <button
              type="button"
              onClick={() => setActiveView('history')}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold transition-all active:scale-[0.98] ${
                activeView === 'history'
                  ? 'bg-teal-50 text-[#12B8A6] border border-teal-200/80 font-bold'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Saved Orders</span>
              {savedOrders.length > 0 && (
                <span className="px-1.5 py-0.2 bg-teal-100 text-teal-900 text-[10px] rounded-full font-bold ml-0.5">
                  {savedOrders.length}
                </span>
              )}
            </button>

            {/* Settings */}
            <button
              type="button"
              onClick={() => setActiveView('admin-settings')}
              title="Application Settings"
              className={`p-2 rounded-xl text-xs transition-all active:scale-[0.98] ${
                activeView === 'admin-settings'
                  ? 'bg-teal-50 text-[#12B8A6] border border-teal-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* User Session & Logout */}
            {user && (
              <div className="flex items-center space-x-1 pl-1 border-l border-slate-200">
                <div 
                  title={`Signed in as ${user.email} (${user.role.toUpperCase()}) | Cloud: ${cloudSyncStatus}`}
                  className="hidden lg:flex items-center space-x-1.5 py-1 px-2 bg-slate-50 rounded-xl border border-slate-200 text-xs"
                >
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-bold text-slate-800 text-[11px] truncate max-w-[90px]">
                    {user.username}
                  </span>
                  <span className={`text-[9px] uppercase font-black px-1.5 py-0.2 rounded ${
                    user.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-teal-100 text-teal-800'
                  }`}>
                    {user.role}
                  </span>
                  {isConfigured ? (
                    <span title="Supabase Connected">
                      <Cloud className="w-3 h-3 text-emerald-600 ml-0.5" />
                    </span>
                  ) : (
                    <span title="Local Sandbox">
                      <CloudOff className="w-3 h-3 text-amber-500 ml-0.5" />
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={logout}
                  title="Sign Out of Commercial Portal"
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

          </nav>

        </div>
      </div>
    </header>
  );
};
