import React from 'react';
import { 
  PlusCircle, 
  Bookmark, 
  Settings, 
  ArrowRight, 
  Truck, 
  BatteryCharging,
  Zap,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/currency';

export const HomeScreen: React.FC = () => {
  const { 
    startNewOrder, 
    savedOrders, 
    loadSavedOrder, 
    setActiveView 
  } = useApp();

  return (
    <div className="max-w-xl mx-auto space-y-6 sm:space-y-7 py-2 sm:py-6 animate-fade-in">
      
      {/* Brand Hero Card with Glass Styling & Ambient Glow */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 text-center space-y-6 relative overflow-hidden border border-slate-200/90 shadow-lg shadow-slate-200/40">
        
        {/* Subtle Decorative Background Aura (Pink, Blue, Green) */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-96 h-40 bg-gradient-to-r from-pink-400/15 via-blue-400/15 to-emerald-400/15 rounded-full blur-3xl pointer-events-none" />

        {/* Logo Presentation */}
        <div className="flex flex-col items-center justify-center pt-1 relative">
          <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 mb-3 inline-block">
            <img 
              src="/assets/xidaa-logo-dark.png" 
              alt="Xidaa Moto" 
              className="h-11 sm:h-13 w-auto object-contain"
            />
          </div>

          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-pink-50 via-blue-50 to-emerald-50 border border-slate-200/80 text-[10px] font-extrabold uppercase tracking-wider mb-2 shadow-2xs">
            <Sparkles className="w-3 h-3 text-pink-500 fill-current" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-blue-600 to-emerald-600 font-black">
              Commercial Calculation Engine
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            Xidaa Discount Calculator
          </h1>
          
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-pink-600 mt-1">
            Ride The Electric Thunder
          </p>
          
          <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
            Enterprise B2B commercial settlement, multi-model discount allowances, and 5-step transport freight engine.
          </p>
        </div>

        {/* PROMINENT MAIN ACTION: Create New Order (Hero Pink Gradient) */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => startNewOrder(true)}
            className="w-full py-4 px-6 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:via-rose-600 hover:to-pink-700 active:scale-[0.98] text-white font-black text-base rounded-2xl shadow-xl shadow-pink-500/25 flex items-center justify-center space-x-2.5 transition-all cursor-pointer group"
          >
            <PlusCircle className="w-5 h-5 text-white transition-transform duration-200 group-hover:rotate-90" />
            <span className="tracking-wide">Create New Order</span>
            <ArrowRight className="w-4 h-4 ml-1 opacity-90 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* 3 Core Architecture Pillars (Pink, Green, Blue) */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3 text-center">
        {/* Pillar 1: Pink */}
        <div className="glass-card p-3 sm:p-3.5 rounded-2xl text-center border border-pink-100 hover:border-pink-300 transition-all shadow-2xs bg-gradient-to-b from-pink-50/40 to-white">
          <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center mx-auto mb-1.5 border border-pink-200 shadow-2xs">
            <Zap className="w-4 h-4" />
          </div>
          <div className="text-[11px] font-bold text-slate-900">Multi-Model</div>
          <div className="text-[10px] text-pink-700 font-semibold mt-0.5">DL & Other Quota</div>
        </div>

        {/* Pillar 2: Green */}
        <div className="glass-card p-3 sm:p-3.5 rounded-2xl text-center border border-emerald-100 hover:border-emerald-300 transition-all shadow-2xs bg-gradient-to-b from-emerald-50/40 to-white">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-1.5 border border-emerald-200 shadow-2xs">
            <BatteryCharging className="w-4 h-4" />
          </div>
          <div className="text-[11px] font-bold text-slate-900">Separate Quota</div>
          <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">₹500 / Battery Unit</div>
        </div>

        {/* Pillar 3: Blue */}
        <div className="glass-card p-3 sm:p-3.5 rounded-2xl text-center border border-blue-100 hover:border-blue-300 transition-all shadow-2xs bg-gradient-to-b from-blue-50/40 to-white">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-1.5 border border-blue-200 shadow-2xs">
            <Truck className="w-4 h-4" />
          </div>
          <div className="text-[11px] font-bold text-slate-900">5-Step Logistics</div>
          <div className="text-[10px] text-blue-700 font-semibold mt-0.5">10% Extra + GST</div>
        </div>
      </div>

      {/* Recent Calculations Section (Only shown if history exists) */}
      {savedOrders.length > 0 && (
        <div className="glass-card rounded-3xl p-5 space-y-3.5 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center space-x-2">
              <Bookmark className="w-4 h-4 text-blue-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Recent Calculations
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setActiveView('history')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center space-x-1 transition-colors cursor-pointer"
            >
              <span>View All ({savedOrders.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {savedOrders.slice(0, 3).map((order) => {
              const res = order.calculationResult;
              const inp = order.orderInput;
              return (
                <div
                  key={order.id}
                  onClick={() => loadSavedOrder(order.id)}
                  className="py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 rounded-xl px-2.5 -mx-2.5 transition-all group active:scale-[0.99]"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-slate-900 group-hover:text-pink-600 transition-colors flex items-center space-x-1.5">
                      <span>{inp.customerName || 'Direct B2B Dealer'}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                        {inp.orderRef}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center space-x-2">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{inp.orderDate}</span>
                      </span>
                      <span>•</span>
                      <span>{res.totalScooters} scooters ({res.totalDlScooters} DL)</span>
                    </div>
                  </div>

                  <div className="text-right space-y-0.5">
                    <div className="text-xs font-mono font-black text-slate-900">
                      {res.finalPayableAmount !== null ? formatINR(res.finalPayableAmount) : 'Pending Prices'}
                    </div>
                    <div className="text-[10px] text-emerald-700 font-bold">
                      Allowance: {formatINR(res.scooterDiscountAllowance)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Utility Footer Links */}
      <div className="flex items-center justify-center space-x-4 text-xs text-slate-500 pt-1">
        <button
          type="button"
          onClick={() => setActiveView('admin-settings')}
          className="hover:text-emerald-700 flex items-center space-x-1.5 transition-colors font-semibold cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5 text-slate-400" />
          <span>Config & Rates</span>
        </button>
        <span className="text-slate-300">•</span>
        <button
          type="button"
          onClick={() => setActiveView('history')}
          className="hover:text-blue-700 flex items-center space-x-1.5 transition-colors font-semibold cursor-pointer"
        >
          <Bookmark className="w-3.5 h-3.5 text-slate-400" />
          <span>Saved Orders ({savedOrders.length})</span>
        </button>
      </div>

    </div>
  );
};
