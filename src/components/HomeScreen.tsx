import React from 'react';
import { 
  PlusCircle, 
  Bookmark, 
  Settings, 
  ArrowRight, 
  Truck, 
  BatteryCharging,
  Zap,
  Calendar
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
      
      {/* Brand Hero Card with Glass Styling */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 text-center space-y-6 relative overflow-hidden border border-slate-200/90 shadow-sm">
        
        {/* Subtle Decorative Background Aura */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-72 h-32 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Logo Presentation */}
        <div className="flex flex-col items-center justify-center pt-1">
          <div className="p-3 bg-white/95 rounded-2xl shadow-xs border border-slate-100 mb-3 inline-block">
            <img 
              src="/assets/xidaa-logo-dark.png" 
              alt="Xidaa Moto" 
              className="h-11 sm:h-13 w-auto object-contain"
            />
          </div>

          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200/80 text-[10px] font-extrabold text-[#12B8A6] uppercase tracking-wider mb-2">
            <Zap className="w-3 h-3 text-[#12B8A6]" />
            <span>Commercial Calculation Engine</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#101827]">
            Xidaa Discount Calculator
          </h1>
          
          <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#12B8A6] mt-1">
            Ride The Electric Thunder
          </p>
          
          <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
            Enterprise B2B commercial settlement, multi-model discount allowances, and 5-step transport freight engine.
          </p>
        </div>

        {/* PROMINENT MAIN ACTION: Create New Order */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => startNewOrder(true)}
            className="w-full py-4 px-6 bg-[#101827] hover:bg-slate-900 active:scale-[0.98] text-white font-black text-base rounded-xl shadow-lg shadow-slate-900/25 border border-[#12B8A6]/40 flex items-center justify-center space-x-2.5 transition-all cursor-pointer group"
          >
            <PlusCircle className="w-5 h-5 text-[#12B8A6] transition-transform duration-200 group-hover:rotate-90" />
            <span className="tracking-wide">Create New Order</span>
            <ArrowRight className="w-4 h-4 ml-1 text-[#12B8A6] opacity-80 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* 3 Core Architecture Pillars */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3 text-center">
        <div className="glass-card p-3 sm:p-3.5 rounded-xl text-center border border-slate-200/90">
          <div className="w-8 h-8 rounded-xl bg-teal-50 text-[#12B8A6] flex items-center justify-center mx-auto mb-1.5 border border-teal-100">
            <Zap className="w-4 h-4" />
          </div>
          <div className="text-[11px] font-bold text-slate-900">Multi-Model</div>
          <div className="text-[10px] text-slate-500 mt-0.5">DL & Other Quota</div>
        </div>

        <div className="glass-card p-3 sm:p-3.5 rounded-xl text-center border border-slate-200/90">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-1.5 border border-emerald-100">
            <BatteryCharging className="w-4 h-4" />
          </div>
          <div className="text-[11px] font-bold text-slate-900">Separate Quota</div>
          <div className="text-[10px] text-slate-500 mt-0.5">₹500 / Battery Unit</div>
        </div>

        <div className="glass-card p-3 sm:p-3.5 rounded-xl text-center border border-slate-200/90">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-1.5 border border-blue-100">
            <Truck className="w-4 h-4" />
          </div>
          <div className="text-[11px] font-bold text-slate-900">5-Step Logistics</div>
          <div className="text-[10px] text-slate-500 mt-0.5">10% Extra + GST</div>
        </div>
      </div>

      {/* Recent Calculations Section (Only shown if history exists) */}
      {savedOrders.length > 0 && (
        <div className="glass-card rounded-2xl p-5 space-y-3.5 border border-slate-200/90">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center space-x-2">
              <Bookmark className="w-4 h-4 text-[#12B8A6]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Recent Calculations
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setActiveView('history')}
              className="text-xs font-bold text-[#12B8A6] hover:underline flex items-center space-x-1 transition-colors"
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
                    <div className="text-xs font-bold text-slate-900 group-hover:text-[#12B8A6] transition-colors flex items-center space-x-1.5">
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
                    <div className="text-[10px] text-teal-700 font-semibold">
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
          className="hover:text-slate-900 flex items-center space-x-1.5 transition-colors font-medium cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5 text-slate-400" />
          <span>Config & Rates</span>
        </button>
        <span className="text-slate-300">•</span>
        <button
          type="button"
          onClick={() => setActiveView('history')}
          className="hover:text-slate-900 flex items-center space-x-1.5 transition-colors font-medium cursor-pointer"
        >
          <Bookmark className="w-3.5 h-3.5 text-slate-400" />
          <span>Saved Orders ({savedOrders.length})</span>
        </button>
      </div>

    </div>
  );
};
