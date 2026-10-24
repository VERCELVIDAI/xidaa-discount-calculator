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
      {/* Trio Signature Gradient Line: Pink -> Blue -> Green */}
      <div className="h-1 w-full bg-gradient-to-r from-pink-500 via-blue-600 to-emerald-500" />

      <div className="max-w-5xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-15 sm:h-16">
          
          {/* Logo & Brand Identity */}
          <div 
            className="flex items-center space-x-3 cursor-pointer py-1 group select-none"
            onClick={() => setActiveView('home')}
            title="Xidaa Discount Calculator - Home"
          >
            <div className="relative flex items-center p-1 rounded-xl bg-white/80 shadow-2xs border border-slate-100">
              <img 
                src="/assets/xidaa-logo-dark.png" 
                alt="Xidaa Moto" 
                className="h-7 sm:h-8 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.03]"
              />
            </div>
            
            <div className="hidden sm:flex flex-col border-l border-slate-200/90 pl-3">
              <span className="text-[12px] font-black uppercase tracking-wider text-slate-900 flex items-center space-x-1">
                <span>Discount Calculator</span>
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
              </span>
              <span className="text-[9px] uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-blue-600 to-emerald-600 font-extrabold flex items-center space-x-1">
                <span>RIDE THE ELECTRIC THUNDER</span>
              </span>
            </div>
          </div>

          {/* Primary Navigation Items */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            
            {/* 1. New Order Button (Hero Pink) */}
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
              className={`flex items-center space-x-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeView === 'order-form' || activeView === 'home'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/25 active:scale-[0.98]'
                  : 'text-slate-700 hover:text-pink-600 hover:bg-pink-50/80 active:scale-[0.98]'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{activeView === 'order-form' ? 'Order Form' : 'New Order'}</span>
            </button>

            {/* Quick Results Shortcut (Azure Blue) */}
            {(activeView === 'results' || activeView === 'print-summary') && (
              <button
                type="button"
                onClick={() => setActiveView('results')}
                className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer"
              >
                <Calculator className="w-3.5 h-3.5 text-blue-200" />
                <span className="truncate max-w-[120px]">{orderInput.orderRef}</span>
                <ChevronRight className="w-3 h-3 text-blue-300" />
              </button>
            )}

            {/* 2. Saved Orders (Azure Blue) */}
            <button
              type="button"
              onClick={() => setActiveView('history')}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-[0.98] ${
                activeView === 'history'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 font-bold shadow-2xs'
                  : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50/70'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Saved Orders</span>
              {savedOrders.length > 0 && (
                <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 text-[10px] rounded-full font-bold ml-0.5">
                  {savedOrders.length}
                </span>
              )}
            </button>

            {/* 3. Settings (Emerald Green) */}
            <button
              type="button"
              onClick={() => setActiveView('admin-settings')}
              title="Application Settings"
              className={`p-2 rounded-xl text-xs transition-all cursor-pointer active:scale-[0.98] ${
                activeView === 'admin-settings'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/70'
              }`}
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* User Session & Logout */}
            {user && (
              <div className="flex items-center space-x-1 pl-1 border-l border-slate-200">
                <div 
                  title={`Signed in as ${user.email} (${user.role.toUpperCase()}) | Cloud: ${cloudSyncStatus}`}
                  className="hidden lg:flex items-center space-x-1.5 py-1 px-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs shadow-2xs"
                >
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-bold text-slate-800 text-[11px] truncate max-w-[90px]">
                    {user.username}
                  </span>
                  <span className={`text-[9px] uppercase font-black px-1.5 py-0.2 rounded ${
                    user.role === 'admin' 
                      ? 'bg-pink-100 text-pink-700 border border-pink-200' 
                      : 'bg-blue-100 text-blue-700 border border-blue-200'
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
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
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
