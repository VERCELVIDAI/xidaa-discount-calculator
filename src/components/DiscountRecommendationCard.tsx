import React from 'react';
import { Sparkles, ShieldCheck, AlertCircle, ArrowRight, Check, HelpCircle } from 'lucide-react';
import type { CalculationResult, DiscountAllocationOption, ProfitScenarioId } from '../types';
import { formatINR } from '../utils/currency';

interface DiscountRecommendationCardProps {
  calculationResult: CalculationResult;
  onApplyRecommendation?: (mode: DiscountAllocationOption, scenarioId: ProfitScenarioId) => void;
  className?: string;
  compact?: boolean;
}

export const DiscountRecommendationCard: React.FC<DiscountRecommendationCardProps> = ({
  calculationResult,
  onApplyRecommendation,
  className = '',
  compact = false,
}) => {
  const { profitProtection, allocationOption } = calculationResult;
  const recommendedScenarioId = profitProtection.recommendedScenarioId;
  const scenarios = profitProtection.scenarios || [];
  const recScenario = scenarios.find((s) => s.id === recommendedScenarioId) || scenarios[0];

  if (!recScenario) return null;

  // Determine equivalent DiscountAllocationOption
  const getMappedAllocationOption = (id: ProfitScenarioId): DiscountAllocationOption => {
    if (id === 'scenario-b') return 'Transport Support';
    if (id === 'scenario-c' || id === 'scenario-d') return 'No Discount / Support';
    return 'Scooty/Battery Discount';
  };

  const targetAllocation = getMappedAllocationOption(recommendedScenarioId);
  const isAlreadyActive = allocationOption === targetAllocation;

  const totalRecommendedDiscount = recScenario.scooterDiscountApplied + recScenario.batteryDiscountApplied;
  const isProfitVerified = profitProtection.status === 'Verified';
  const isBelowTarget = profitProtection.status === 'Below Target';
  const isNotVerified = profitProtection.status === 'Not Verified';

  return (
    <div className={`rounded-2xl p-4 sm:p-5 transition-all relative overflow-hidden bg-white/95 border shadow-sm ${
      isProfitVerified
        ? 'border-emerald-300 ring-1 ring-emerald-200/50'
        : isBelowTarget
        ? 'border-amber-300 ring-1 ring-amber-200/50'
        : 'border-slate-200 ring-1 ring-slate-100'
    } ${className}`}>

      {/* Ambient Tri-Color Glow Accent */}
      <div className={`absolute top-0 right-0 w-44 h-44 rounded-full blur-3xl pointer-events-none opacity-40 ${
        isProfitVerified ? 'bg-emerald-300' : 'bg-pink-300'
      }`} />
      <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-20 bg-blue-300" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 gap-2 relative z-10">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-pink-50 border border-pink-200 shadow-2xs flex items-center justify-center text-pink-600">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-pink-600">
                Smart Commercial Engine
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[10px] font-bold text-slate-500">
                Automatic Recommendation
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-black text-slate-900">
              {profitProtection.bestOptionTitle || recScenario.name}
            </h3>
          </div>
        </div>

        {/* Verification Status Pill */}
        <div className="flex items-center space-x-1.5 self-start sm:self-auto">
          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border flex items-center space-x-1 ${
            isProfitVerified
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : isBelowTarget
              ? 'bg-amber-50 text-amber-800 border-amber-300'
              : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}>
            {isProfitVerified ? (
              <>
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Profitability Verified</span>
              </>
            ) : isBelowTarget ? (
              <>
                <AlertCircle className="w-3 h-3 text-amber-600" />
                <span>Target Shortfall</span>
              </>
            ) : (
              <>
                <HelpCircle className="w-3 h-3 text-slate-500" />
                <span>Profitability Not Verified</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* 4-Stat Comparison Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3.5 relative z-10">
        
        {/* Recommended Discount - Pink */}
        <div className="p-2.5 bg-pink-50/50 rounded-xl border border-pink-200/70 shadow-2xs">
          <span className="text-[10px] font-bold text-pink-700 uppercase block tracking-wider">
            Vehicle Discount
          </span>
          <strong className="text-sm font-mono font-black text-pink-900 block mt-0.5">
            {formatINR(totalRecommendedDiscount)}
          </strong>
          <span className="text-[9px] text-pink-600/80">
            DL + Other + Battery
          </span>
        </div>

        {/* Company Transport Support - Green */}
        <div className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-200/70 shadow-2xs">
          <span className="text-[10px] font-bold text-emerald-700 uppercase block tracking-wider">
            Company Freight Support
          </span>
          <strong className="text-sm font-mono font-black text-emerald-900 block mt-0.5">
            {formatINR(recScenario.companyTransportSupport)}
          </strong>
          <span className="text-[9px] text-emerald-600/80">
            Borne by Xidaa Moto
          </span>
        </div>

        {/* Customer Transport Payment - Blue */}
        <div className="p-2.5 bg-blue-50/50 rounded-xl border border-blue-200/70 shadow-2xs">
          <span className="text-[10px] font-bold text-blue-700 uppercase block tracking-wider">
            Customer Freight
          </span>
          <strong className="text-sm font-mono font-black text-blue-900 block mt-0.5">
            {formatINR(recScenario.customerTransportPayment)}
          </strong>
          <span className="text-[9px] text-blue-600/80">
            Payable by Dealer
          </span>
        </div>

        {/* Estimated Company Profit / Status */}
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">
            Company Profit
          </span>
          {recScenario.companyProfit !== null ? (
            <div>
              <strong className={`text-sm font-mono font-black block mt-0.5 ${
                recScenario.companyProfit >= 0 ? 'text-slate-900' : 'text-rose-600'
              }`}>
                {formatINR(recScenario.companyProfit)}
              </strong>
              <span className="text-[9px] font-bold text-emerald-700">
                {recScenario.profitMarginPercent}% Margin
              </span>
            </div>
          ) : (
            <div>
              <strong className="text-xs font-bold text-slate-400 block mt-0.5">
                Provisional
              </strong>
              <span className="text-[9px] text-amber-700 font-medium">
                Cost Data Missing
              </span>
            </div>
          )}
        </div>

      </div>

      {/* Recommendation Reason */}
      <div className="pt-3 text-xs text-slate-700 space-y-1 relative z-10">
        <p className="leading-relaxed bg-slate-50/80 p-2.5 rounded-xl border border-slate-200 text-[11px] text-slate-800">
          <strong className="text-pink-600">Strategic Financial Rationale:</strong> {profitProtection.recommendationReason || recScenario.description}
        </p>

        {isNotVerified && (
          <p className="text-[10px] text-amber-800 italic px-1">
            * Note: This is a provisional recommendation based on discount ceilings. Enter actual manufacturing costs and approved selling prices in Profit Protection to verify corporate margin target compliance.
          </p>
        )}
      </div>

      {/* Action: One-Click Apply */}
      {onApplyRecommendation && !compact && (
        <div className="pt-3 flex items-center justify-between border-t border-slate-100 mt-3 relative z-10">
          <div className="text-[11px] text-slate-600">
            Current Active Settlement: <strong className="text-slate-900 font-bold">{allocationOption}</strong>
          </div>

          {isAlreadyActive ? (
            <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
              <Check className="w-3.5 h-3.5" />
              <span>Recommended Strategy Active</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => onApplyRecommendation(targetAllocation, recommendedScenarioId)}
              className="py-1.5 px-3.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center space-x-1.5 active:scale-95"
            >
              <span>Apply Recommended Strategy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

    </div>
  );
};
