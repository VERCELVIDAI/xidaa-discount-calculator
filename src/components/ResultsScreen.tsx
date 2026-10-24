import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Truck, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Info, 
  Sparkles, 
  RotateCcw, 
  Printer, 
  Edit3, 
  Save, 
  Loader2,
  ChevronDown,
  ChevronUp,
  Check,
  Ban,
  Tag
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { formatINR, formatINRWords } from '../utils/currency';
import { AnimatedNumber } from './AnimatedNumber';
import type { ProfitScenarioId } from '../types';

export const ResultsScreen: React.FC = () => {
  const { 
    orderInput, 
    updateOrderInput,
    calculationResult, 
    editCurrentOrder, 
    startNewOrder, 
    saveCurrentOrder, 
    isSaving,
    saveError,
    clearSaveError,
    setActiveView 
  } = useApp();

  const [justSaved, setJustSaved] = useState(false);
  const [isTransportBreakdownOpen, setIsTransportBreakdownOpen] = useState(true);

  const handleSaveOrder = async () => {
    clearSaveError();
    const result = await saveCurrentOrder();
    if (result) {
      setJustSaved(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#EC4899', '#2563EB', '#10B981', '#ffffff'],
      });
      setTimeout(() => setJustSaved(false), 2500);
    }
  };

  const handleSelectScenario = (scenarioId: ProfitScenarioId) => {
    if (scenarioId === 'scenario-b') {
      updateOrderInput({ 
        selectedScenarioId: 'scenario-b',
        allocationMode: 'Transport Support' 
      });
    } else if (scenarioId === 'scenario-a') {
      updateOrderInput({ 
        selectedScenarioId: 'scenario-a',
        allocationMode: 'Scooty/Battery Discount' 
      });
    } else if (scenarioId === 'scenario-c' || scenarioId === 'scenario-d') {
      updateOrderInput({ 
        selectedScenarioId: scenarioId,
        allocationMode: 'No Discount / Support' 
      });
    }
  };

  const pp = calculationResult.profitProtection;
  const scenarios = pp.scenarios || [];
  const eligibleScenarios = pp.eligibleScenarios || scenarios.filter(s => s.isEligible);
  const ineligibleScenarios = pp.ineligibleScenarios || scenarios.filter(s => !s.isEligible);
  const recommendedScenarioId = pp.recommendedScenarioId;
  const recScenario = scenarios.find((s) => s.id === recommendedScenarioId) || scenarios[0];
  const selectedScenarioId = pp.selectedScenarioId || recommendedScenarioId;

  const isRecommendedActive = selectedScenarioId === recommendedScenarioId;

  return (
    <div className="max-w-2xl mx-auto space-y-5 pb-28 animate-fade-in">
      
      {/* Top Header Bar with Back / Edit & Ref */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <button
          type="button"
          onClick={editCurrentOrder}
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 hover:text-pink-600 transition-colors py-1 cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Back to Edit Order</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono font-bold bg-white border border-slate-200 text-slate-800 px-2.5 py-1 rounded-xl shadow-2xs">
            {orderInput.orderRef}
          </span>
          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${
            calculationResult.allocationOption === 'Scooty/Battery Discount'
              ? 'bg-pink-50 text-pink-900 border-pink-200'
              : calculationResult.allocationOption === 'Transport Support'
              ? 'bg-blue-50 text-blue-900 border-blue-200'
              : 'bg-slate-100 text-slate-800 border-slate-300'
          }`}>
            ● Active: {calculationResult.allocationOption}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION A: ORDER SUMMARY                                                  */}
      {/* ========================================================================= */}
      <section className="glass-card rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm border border-slate-200/90">
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Section A • Order Summary
            </span>
            <h1 className="text-base sm:text-lg font-black text-[#101827]">
              {orderInput.customerName || 'Direct B2B Dealership'}
            </h1>
            <span className="text-xs font-mono font-medium text-slate-500">
              Ref: {orderInput.orderRef} • Quotation Date: {orderInput.orderDate}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Total Fleet
            </span>
            <span className="text-sm font-black font-mono text-slate-900 block mt-0.5">
              {calculationResult.totalScooters} Scooters
            </span>
          </div>
        </div>

        {/* Quantities 4-Pill Grid - Tri-Color Harmony */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-blue-700 block">DL Model</span>
            <span className="text-xl font-black font-mono text-blue-950 mt-1 block">
              <AnimatedNumber value={calculationResult.totalDlScooters} formatFn={(n) => `${n}`} />
            </span>
            <span className="text-[10px] text-blue-600 font-medium">₹500 / unit allowance</span>
          </div>

          <div className="p-3 bg-pink-50/70 border border-pink-200/80 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-pink-700 block">Other Model</span>
            <span className="text-xl font-black font-mono text-pink-950 mt-1 block">
              <AnimatedNumber value={calculationResult.totalOtherScooters} formatFn={(n) => `${n}`} />
            </span>
            <span className="text-[10px] text-pink-600 font-medium">₹1,000 / unit allowance</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-slate-600 block">Total Scooters</span>
            <span className="text-xl font-black font-mono text-slate-900 mt-1 block">
              <AnimatedNumber value={calculationResult.totalScooters} formatFn={(n) => `${n}`} />
            </span>
            <span className="text-[10px] text-slate-500 font-medium">All Models Combined</span>
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-700 block">Batteries</span>
            <span className="text-xl font-black font-mono text-emerald-950 mt-1 block">
              <AnimatedNumber value={calculationResult.totalBatteries} formatFn={(n) => `${n}`} />
            </span>
            <span className="text-[10px] text-emerald-600 font-medium">
              {calculationResult.totalBatteries > 0 ? '₹500 / unit quota' : 'None'}
            </span>
          </div>
        </div>

        {/* Model Breakdown Tags & Truck Logistics Details */}
        <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
          {orderInput.scooterItems.length > 0 && (
            <div className="text-slate-600 flex items-center space-x-2 flex-wrap gap-y-1.5">
              <span className="font-bold text-slate-700 text-[11px]">Models:</span>
              {orderInput.scooterItems.map((item, idx) => (
                <span key={idx} className="bg-white border border-slate-200 text-slate-800 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold shadow-2xs">
                  {item.quantity}x {item.modelName || item.modelId.toUpperCase()} ({item.category})
                </span>
              ))}
            </div>
          )}

          <div className="text-[11px] text-slate-500 flex items-center space-x-2 flex-wrap">
            <span>Distance: <strong className="text-blue-700">{orderInput.transportDistanceKm} km</strong></span>
            <span>•</span>
            <span>Truck Allocation: <strong>{calculationResult.truckSummary}</strong></span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION B: FINAL TRANSPORT COST                                           */}
      {/* ========================================================================= */}
      <section className="glass-card rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-sm border border-slate-200/90">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Section B • Logistics Cost
              </span>
              <h2 className="text-sm sm:text-base font-black text-[#101827]">
                FINAL TRANSPORT COST
              </h2>
            </div>
          </div>

          <div className="text-right">
            <span className="text-lg sm:text-xl font-black font-mono text-[#101827]">
              <AnimatedNumber value={calculationResult.totalTransportCost} />
            </span>
            {calculationResult.transportCostPerScooter !== null && (
              <span className="text-[10px] text-blue-600 block font-semibold">
                {formatINR(calculationResult.transportCostPerScooter)} / scooty
              </span>
            )}
          </div>
        </div>

        {/* Expandable 5-Step Formula Toggle */}
        <div className="pt-0.5">
          <button
            type="button"
            onClick={() => setIsTransportBreakdownOpen(!isTransportBreakdownOpen)}
            className="flex items-center justify-between w-full py-1.5 px-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer"
          >
            <span>{isTransportBreakdownOpen ? '− Hide 5-Step Transport Formula' : '+ View 5-Step Transport Formula Breakdown'}</span>
            {isTransportBreakdownOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {isTransportBreakdownOpen && (
            <div className="mt-2.5 bg-slate-50/90 rounded-xl p-3.5 border border-slate-200/90 space-y-2 text-xs animate-fade-in">
              <div className="flex items-center justify-between text-slate-700">
                <span>1. Base Transport ({orderInput.transportDistanceKm} km):</span>
                <span className="font-mono font-semibold">{formatINR(calculationResult.baseTransportCost)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span>2. Additional {calculationResult.transportExtraPercent}% Charge:</span>
                <span className="font-mono font-semibold text-amber-700">+ {formatINR(calculationResult.transportExtraCharge)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-800 font-semibold pt-1 border-t border-slate-200">
                <span>3. Transport Subtotal:</span>
                <span className="font-mono">{formatINR(calculationResult.transportSubtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span>4. Transport GST ({calculationResult.transportGstPercent}%):</span>
                <span className="font-mono font-semibold text-blue-600">+ {formatINR(calculationResult.transportGstAmount)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-950 font-black pt-1.5 border-t border-slate-300">
                <span>5. Final Transport Cost:</span>
                <span className="font-mono text-sm text-[#101827] font-black">{formatINR(calculationResult.totalTransportCost)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Current Active Transport Settlement Chips */}
        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-200">
            <span className="text-[10px] text-emerald-700 block uppercase font-bold">Xidaa Support</span>
            <strong className="text-sm font-mono font-black text-emerald-950 block mt-0.5">
              {formatINR(calculationResult.companyTransportSupport)}
            </strong>
          </div>
          <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-200">
            <span className="text-[10px] text-blue-700 block uppercase font-bold">Dealer Payable</span>
            <strong className="text-sm font-mono font-black text-blue-950 block mt-0.5">
              {formatINR(calculationResult.customerTransportPayment)}
            </strong>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION C: AVAILABLE DISCOUNT OPTIONS                                     */}
      {/* ========================================================================= */}
      <section className="glass-card rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm border border-slate-200/90">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Section C • Comparison
              </span>
              <h2 className="text-sm sm:text-base font-black text-[#101827]">
                AVAILABLE DISCOUNT OPTIONS
              </h2>
            </div>
          </div>

          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            {eligibleScenarios.length} Eligible Strategies
          </span>
        </div>

        <div className="space-y-3">
          {eligibleScenarios.map((scenario) => {
            const isSelected = selectedScenarioId === scenario.id;
            const isRec = scenario.id === recommendedScenarioId;

            return (
              <div 
                key={scenario.id}
                className={`p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-gradient-to-br from-white via-pink-50/20 to-blue-50/30 border-pink-400/80 shadow-sm ring-1 ring-pink-400/30'
                    : 'bg-white border-slate-200/90 hover:border-slate-300'
                }`}
              >
                {/* Header row: Name + Badges */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div>
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <h3 className="text-xs sm:text-sm font-black text-slate-900">
                        {scenario.name}
                      </h3>
                      {isRec && (
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-2xs">
                          RECOMMENDED
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {scenario.description}
                    </p>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center space-x-1">
                      <Check className="w-2.5 h-2.5" />
                      <span>{scenario.eligibilityBadge}</span>
                    </span>

                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border flex items-center space-x-1 ${
                      scenario.profitBadge === 'VERIFIED'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : scenario.profitBadge === 'BELOW PROFIT TARGET'
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {scenario.profitBadge === 'VERIFIED' ? (
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                      ) : scenario.profitBadge === 'BELOW PROFIT TARGET' ? (
                        <AlertCircle className="w-2.5 h-2.5 text-rose-600" />
                      ) : (
                        <HelpCircle className="w-2.5 h-2.5 text-slate-400" />
                      )}
                      <span>{scenario.profitBadge}</span>
                    </span>
                  </div>
                </div>

                {/* Metrics 3-Col Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs py-2 border-y border-slate-100">
                  <div className="p-2 bg-slate-50/80 rounded-lg">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Discount / Support</span>
                    <strong className="text-xs sm:text-sm font-mono font-black text-slate-900 block mt-0.5">
                      {formatINR(scenario.totalDiscountBenefit)}
                    </strong>
                    <span className="text-[9px] text-slate-500">
                      {scenario.id === 'scenario-a'
                        ? 'Deducted from vehicle'
                        : scenario.id === 'scenario-b'
                        ? 'Company freight share'
                        : 'No discount'}
                    </span>
                  </div>

                  <div className="p-2 bg-slate-50/80 rounded-lg">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Dealer Freight</span>
                    <strong className="text-xs sm:text-sm font-mono font-black text-blue-950 block mt-0.5">
                      {formatINR(scenario.customerTransportPayment)}
                    </strong>
                    <span className="text-[9px] text-blue-600">
                      {scenario.customerTransportPayment === calculationResult.totalTransportCost ? 'Full 100% transport' : '50% shared freight'}
                    </span>
                  </div>

                  <div className="p-2 bg-slate-50/80 rounded-lg col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Company Profit</span>
                    {scenario.companyProfit !== null ? (
                      <div>
                        <strong className="text-xs sm:text-sm font-mono font-black text-slate-900 block mt-0.5">
                          {formatINR(scenario.companyProfit)}
                        </strong>
                        <span className="text-[9px] font-bold text-emerald-700">
                          {scenario.profitMarginPercent}% Margin
                        </span>
                      </div>
                    ) : (
                      <div>
                        <strong className="text-xs font-bold text-slate-400 block mt-0.5">
                          Unverified
                        </strong>
                        <span className="text-[9px] text-slate-500">
                          Cost data pending
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Note on Unused Scooter Allowance for Option B */}
                {scenario.id === 'scenario-b' && scenario.remainingScooterDiscount > 0 && (
                  <div className="mt-2 text-[10px] text-blue-700 bg-blue-50/60 border border-blue-200/80 rounded-lg p-2 flex items-center justify-between">
                    <span>Remaining unused scooter allowance:</span>
                    <strong className="font-mono">{formatINR(scenario.remainingScooterDiscount)} (retained, not double-counted)</strong>
                  </div>
                )}

                {/* Selection Action Button */}
                <div className="mt-3 flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500">
                    {isSelected ? (
                      <span className="font-bold text-pink-600 flex items-center space-x-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Currently Active Option</span>
                      </span>
                    ) : (
                      'Available for selection'
                    )}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleSelectScenario(scenario.id)}
                    className={`py-1.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-xs cursor-default'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 active:scale-95'
                    }`}
                  >
                    {isSelected ? '✓ Active' : 'Select Option'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION D: UNAVAILABLE OPTIONS (Ineligible Strategies)                      */}
      {/* ========================================================================= */}
      {ineligibleScenarios.length > 0 && (
        <section className="glass-card rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-sm border border-slate-200/90">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
                <Ban className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Section D • Rule Enforcement
                </span>
                <h2 className="text-sm sm:text-base font-black text-[#101827]">
                  UNAVAILABLE OPTIONS
                </h2>
              </div>
            </div>

            <span className="text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
              {ineligibleScenarios.length} Ineligible
            </span>
          </div>

          <div className="space-y-3">
            {ineligibleScenarios.map((scenario) => (
              <div 
                key={scenario.id}
                className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2 opacity-85"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-black text-slate-800">
                    {scenario.name}
                  </h3>
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 border border-rose-300 flex items-center space-x-1">
                    <Ban className="w-2.5 h-2.5 text-rose-600" />
                    <span>{scenario.eligibilityBadge}</span>
                  </span>
                </div>

                {/* Plain-Language Ineligibility Explanation Banner */}
                <div className="p-3 bg-rose-50/80 border border-rose-200/90 rounded-xl text-xs text-rose-900 space-y-1">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Why this option cannot be selected:</strong>
                      <p className="text-[11px] text-rose-800 mt-0.5 leading-relaxed">
                        {scenario.ineligibilityReason || scenario.statusMessage}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 pt-1">
                  Rule: 50% transport support requires that the available scooter discount allowance ({formatINR(calculationResult.scooterDiscountAllowance)}) is sufficient to cover 50% of the final transport cost ({formatINR(calculationResult.halfTransportCost)}). Battery allowances cannot be used to qualify.
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* SECTION E: RECOMMENDED DECISION                                           */}
      {/* ========================================================================= */}
      <section className="glass-card rounded-2xl p-5 sm:p-6 space-y-4 shadow-md border-2 border-pink-400/80 bg-gradient-to-br from-white via-pink-50/20 to-white">
        <div className="flex items-center justify-between border-b border-pink-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-50 border border-pink-200 text-pink-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 fill-current" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-pink-600 block tracking-wider">
                Section E • Decision Engine
              </span>
              <h2 className="text-sm sm:text-base font-black text-[#101827]">
                RECOMMENDED DECISION
              </h2>
            </div>
          </div>

          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-pink-50 border border-pink-200 text-pink-700">
            {recScenario?.tagline || 'Recommended Option'}
          </span>
        </div>

        {/* Highlight Card Content */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900">
                {recScenario?.name}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                {recScenario?.description}
              </p>
            </div>

            <div className="text-right flex-shrink-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Benefit</span>
              <strong className="text-lg font-mono font-black text-emerald-800 block">
                {formatINR(recScenario?.totalDiscountBenefit ?? 0)}
              </strong>
            </div>
          </div>

          {/* Rationale Callout */}
          <div className="p-3 bg-pink-50/70 border border-pink-200/80 rounded-xl text-xs space-y-1">
            <div className="flex items-center space-x-1.5 text-pink-900 font-bold">
              <Info className="w-3.5 h-3.5 text-pink-600" />
              <span>Recommendation Rationale:</span>
            </div>
            <p className="text-slate-700 text-[11px] leading-relaxed pl-5">
              {pp.recommendationReason}
            </p>
          </div>

          {/* 3-Impact Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 text-xs pt-1">
            <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Vehicle Discount</span>
              <strong className="text-xs sm:text-sm font-mono font-black text-slate-900 block mt-0.5">
                {formatINR(recScenario?.scooterDiscountApplied ?? 0)}
              </strong>
            </div>
            <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Freight Support</span>
              <strong className="text-xs sm:text-sm font-mono font-black text-emerald-950 block mt-0.5">
                {formatINR(recScenario?.companyTransportSupport ?? 0)}
              </strong>
            </div>
            <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Dealer Transport</span>
              <strong className="text-xs sm:text-sm font-mono font-black text-blue-950 block mt-0.5">
                {formatINR(recScenario?.customerTransportPayment ?? calculationResult.totalTransportCost)}
              </strong>
            </div>
          </div>

          {/* Prominent Action Button: "Use Recommended Option" */}
          <div className="pt-2">
            <button
              type="button"
              disabled={isRecommendedActive}
              onClick={() => handleSelectScenario(recommendedScenarioId)}
              className={`w-full py-3 px-4 font-black text-xs sm:text-sm rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                isRecommendedActive
                  ? 'bg-emerald-600 text-white cursor-default shadow-xs'
                  : 'bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 hover:from-pink-600 hover:to-rose-600 active:scale-[0.98] text-white shadow-lg shadow-pink-500/25'
              }`}
            >
              {isRecommendedActive ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>✓ Recommended Option Active</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white fill-current" />
                  <span>Use Recommended Option</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION F: FINAL CUSTOMER SETTLEMENT                                      */}
      {/* ========================================================================= */}
      <section className="glass-card rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-sm border border-slate-200/90">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Section F • Settlement
            </span>
            <h2 className="text-sm sm:text-base font-black text-[#101827]">
              FINAL CUSTOMER SETTLEMENT
            </h2>
          </div>

          <span className="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
            Separate Freight & Vehicle Allocation
          </span>
        </div>

        {/* Direct Separate Presentation: Dealer Transport Payable vs Vehicle Discount Allocation */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
              Dealer Transport Payable
            </span>
            <div className="text-lg sm:text-xl font-black font-mono text-blue-950">
              <AnimatedNumber value={calculationResult.customerTransportPayment} />
            </div>
            <span className="text-[10px] text-blue-600 block">
              {calculationResult.customerTransportPayment === calculationResult.totalTransportCost
                ? '100% full transport freight'
                : '50% shared transport freight'}
            </span>
          </div>

          <div className="p-3 bg-pink-50/70 border border-pink-200 rounded-xl space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-pink-700 block">
              Vehicle Discount Allocation
            </span>
            <div className="text-lg sm:text-xl font-black font-mono text-pink-950">
              <AnimatedNumber value={calculationResult.scooterBatteryDiscountApplied} />
            </div>
            <span className="text-[10px] text-pink-600 block">
              {calculationResult.scooterBatteryDiscountApplied > 0
                ? 'Applied directly to vehicle invoice'
                : '₹0 (Freight support active)'}
            </span>
          </div>
        </div>

        {/* Pricing Completeness & Final Customer Payable */}
        {calculationResult.hasAllPrices && calculationResult.finalPayableAmount !== null ? (
          <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2 mt-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="uppercase tracking-wider font-bold">Total Dealership Payable</span>
              <span className="font-mono text-emerald-400">Net Vehicles + Dealer Freight</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white">
              <AnimatedNumber value={calculationResult.finalPayableAmount} />
            </div>
            <div className="text-[11px] text-slate-300 pt-1 border-t border-slate-800 flex items-center justify-between">
              <span>{formatINRWords(calculationResult.finalPayableAmount)}</span>
              <span>Net Vehicles: {formatINR(calculationResult.totalProductInvoiceAmount ? calculationResult.totalProductInvoiceAmount - calculationResult.actualScooterDiscountApplied : 0)}</span>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <div className="flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-900">
                  Final scooter invoice amount requires approved pricing data.
                </h3>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Routine discount calculations operate strictly on model volume and transport distance. Dealer transport freight payable of <strong className="text-slate-900 font-mono">{formatINR(calculationResult.customerTransportPayment)}</strong> and eligible vehicle discount allowance of <strong className="text-slate-900 font-mono">{formatINR(calculationResult.scooterDiscountAllowance)}</strong> are finalized above.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Save Error Alert */}
      {saveError && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start justify-between gap-2 animate-fade-in">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Failed to Save to Database</strong>
              <p className="mt-0.5">{saveError}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={clearSaveError}
            className="text-[11px] font-bold text-red-700 hover:text-red-900 underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Primary Action Buttons Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        {/* Edit Order - Azure Blue Accent */}
        <button
          type="button"
          onClick={editCurrentOrder}
          className="py-3 px-3 bg-white hover:bg-blue-50/50 hover:border-blue-300 text-slate-800 hover:text-blue-700 border border-slate-200 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors cursor-pointer active:scale-95 shadow-2xs"
        >
          <Edit3 className="w-3.5 h-3.5 text-blue-600" />
          <span>Edit Order</span>
        </button>

        {/* Save Calculation - Emerald Green Accent */}
        <button
          type="button"
          onClick={handleSaveOrder}
          disabled={isSaving}
          className={`py-3 px-3 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50 ${
            justSaved
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
          }`}
        >
          {isSaving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : justSaved ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save Order</span>
            </>
          )}
        </button>

        {/* Start New Order */}
        <button
          type="button"
          onClick={() => startNewOrder(false)}
          className="py-3 px-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors cursor-pointer active:scale-95 shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Start New</span>
        </button>

        {/* Generate PDF (Print / PDF) - Electric Pink Gradient Accent */}
        <button
          type="button"
          onClick={() => setActiveView('print-summary')}
          className="py-3 px-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer active:scale-95 shadow-xs"
        >
          <Printer className="w-3.5 h-3.5 text-white" />
          <span>Generate PDF</span>
        </button>
      </div>

    </div>
  );
};
