import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Printer, 
  RotateCcw, 
  CheckCircle2, 
  Truck, 
  Edit3, 
  AlertCircle,
  Loader2,
  Sparkles,
  BatteryCharging,
  ShieldCheck,
  HelpCircle,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { formatINR, formatINRWords } from '../utils/currency';
import { AnimatedNumber } from './AnimatedNumber';

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

  const isOptionASelected = calculationResult.allocationOption === 'Scooty/Battery Discount';
  const isOptionBSelected = calculationResult.allocationOption === 'Transport Support';

  const isOptionBEligible = calculationResult.transportSharingEligible;
  const recommendedScenarioId = calculationResult.profitProtection.recommendedScenarioId;

  const scenarios = calculationResult.profitProtection.scenarios || [];
  const recScenario = scenarios.find((s) => s.id === recommendedScenarioId) || scenarios[0];

  const isProfitVerified = calculationResult.profitProtection.status === 'Verified';
  const isBelowTarget = calculationResult.profitProtection.status === 'Below Target';

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
            isOptionASelected
              ? 'bg-pink-50 text-pink-900 border-pink-200'
              : isOptionBSelected
              ? 'bg-blue-50 text-blue-900 border-blue-200'
              : 'bg-slate-100 text-slate-800 border-slate-300'
          }`}>
            ● Active: {calculationResult.allocationOption}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: ORDER SUMMARY                                                  */}
      {/* ========================================================================= */}
      <section className="glass-card rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm border border-slate-200/90">
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Section 1 • Order Summary
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

        {/* Quantities 4-Pill Grid - Tri-Color Harmony (Blue / Pink / Slate / Green) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-blue-700 block">DL Scooters</span>
            <span className="text-xl font-black font-mono text-blue-950 mt-1 block">
              <AnimatedNumber value={calculationResult.totalDlScooters} formatFn={(n) => `${n}`} />
            </span>
            <span className="text-[10px] text-blue-600 font-medium">₹500 / unit allowance</span>
          </div>

          <div className="p-3 bg-pink-50/70 border border-pink-200/80 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-pink-700 block">Other Scooters</span>
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
              {calculationResult.totalBatteries > 0 ? 'Separate ₹500 quota' : 'None'}
            </span>
          </div>
        </div>

        {/* Model Breakdown Tags */}
        {orderInput.scooterItems.length > 0 && (
          <div className="pt-2 text-xs text-slate-600 flex items-center space-x-2 flex-wrap gap-y-1.5 border-t border-slate-100">
            <span className="font-bold text-slate-700 text-[11px]">Ordered Models:</span>
            {orderInput.scooterItems.map((item, idx) => (
              <span key={idx} className="bg-white border border-slate-200 text-slate-800 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold shadow-2xs">
                {item.quantity}x {item.modelId.toUpperCase()} ({item.category})
              </span>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: BEST DISCOUNT RECOMMENDATION                                   */}
      {/* ========================================================================= */}
      <section className="glass-card rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm border border-slate-200/90">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-50 border border-pink-200 text-pink-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 fill-current" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-pink-600 block tracking-wider">
                Section 2 • Recommendation
              </span>
              <h2 className="text-sm sm:text-base font-black text-[#101827]">
                BEST DISCOUNT FOR THIS ORDER
              </h2>
            </div>
          </div>

          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-pink-50 border border-pink-200 text-pink-600">
            {calculationResult.profitProtection.bestOptionTitle || recScenario?.name || 'Commercial Best'}
          </span>
        </div>

        {/* 4-Metric Commercial Impact Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 bg-pink-50/50 rounded-xl border border-pink-200/70 shadow-2xs">
            <span className="text-[10px] font-bold text-pink-700 uppercase block tracking-wider">
              Scooter Allowance
            </span>
            <strong className="text-sm font-mono font-black text-pink-950 block mt-1">
              {formatINR(calculationResult.scooterDiscountAllowance)}
            </strong>
            <span className="text-[10px] text-pink-600/80">
              Max eligible discount
            </span>
          </div>

          <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/70 shadow-2xs">
            <span className="text-[10px] font-bold text-emerald-700 uppercase block tracking-wider">
              Company Freight Support
            </span>
            <strong className="text-sm font-mono font-black text-emerald-950 block mt-1">
              {formatINR(recScenario?.companyTransportSupport ?? 0)}
            </strong>
            <span className="text-[10px] text-emerald-600/80">
              Borne by Xidaa Moto
            </span>
          </div>

          <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200/70 shadow-2xs">
            <span className="text-[10px] font-bold text-blue-700 uppercase block tracking-wider">
              Dealer Freight
            </span>
            <strong className="text-sm font-mono font-black text-blue-950 block mt-1">
              {formatINR(recScenario?.customerTransportPayment ?? calculationResult.totalTransportCost)}
            </strong>
            <span className="text-[10px] text-blue-600/80">
              Payable by Dealership
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">
              Estimated Profit
            </span>
            {recScenario?.companyProfit !== null && recScenario?.companyProfit !== undefined ? (
              <div>
                <strong className={`text-sm font-mono font-black block mt-1 ${
                  recScenario.companyProfit >= 0 ? 'text-slate-900' : 'text-rose-600'
                }`}>
                  {formatINR(recScenario.companyProfit)}
                </strong>
                <span className="text-[10px] font-bold text-emerald-700">
                  {recScenario.profitMarginPercent}% Margin
                </span>
              </div>
            ) : (
              <div>
                <strong className="text-xs font-bold text-slate-400 block mt-1">
                  Provisional
                </strong>
                <span className="text-[10px] text-amber-700 font-medium">
                  Costs not verified
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Plain-Language Financial Reason */}
        <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-200 text-xs space-y-1">
          <div className="flex items-center space-x-1.5 text-slate-800 font-bold">
            <Info className="w-3.5 h-3.5 text-pink-600" />
            <span>Plain-Language Rationale:</span>
          </div>
          <p className="text-slate-600 leading-relaxed text-[11px] pl-5">
            {calculationResult.profitProtection.recommendationReason || recScenario?.description}
          </p>
        </div>

        {/* Quick Strategy Switcher */}
        <div className="pt-1 flex items-center justify-between border-t border-slate-100 text-xs">
          <span className="text-slate-500 text-[11px]">
            Active Settlement: <strong className="text-slate-800 font-mono">{calculationResult.allocationOption}</strong>
          </span>
          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={() => updateOrderInput({ allocationMode: 'Scooty/Battery Discount', selectedScenarioId: 'scenario-a' })}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                isOptionASelected
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Scooter Discount
            </button>
            <button
              type="button"
              disabled={!isOptionBEligible}
              onClick={() => {
                if (isOptionBEligible) {
                  updateOrderInput({ allocationMode: 'Transport Support', selectedScenarioId: 'scenario-b' });
                }
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                !isOptionBEligible
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                  : isOptionBSelected
                  ? 'bg-blue-600 text-white shadow-2xs cursor-pointer'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer'
              }`}
            >
              50% Transport Support
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: TRANSPORT BREAKDOWN                                            */}
      {/* ========================================================================= */}
      <section className="glass-card rounded-2xl p-5 sm:p-6 space-y-3.5 shadow-sm border border-slate-200/90">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Truck className="w-4 h-4 text-blue-600" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Section 3 • Freight Logistics
              </span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Transport Breakdown
              </h2>
            </div>
          </div>
          <span className="text-sm font-mono font-black text-slate-900">
            Final: <AnimatedNumber value={calculationResult.totalTransportCost} />
          </span>
        </div>

        {/* Route Details Chips */}
        <div className="text-[11px] text-slate-500 flex items-center space-x-2 flex-wrap">
          <span>Delivery Distance: <strong className="text-blue-700">{orderInput.transportDistanceKm} km</strong></span>
          <span>•</span>
          <span>Fleet: <strong>{calculationResult.truckSummary}</strong></span>
          {calculationResult.transportCostPerScooter !== null && (
            <>
              <span>•</span>
              <span>Freight Rate: <strong className="text-blue-600">{formatINR(calculationResult.transportCostPerScooter)} / scooty</strong></span>
            </>
          )}
        </div>

        {/* 5-Step Formula Table */}
        <div className="bg-slate-50/90 rounded-xl p-3.5 border border-slate-200/90 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-700">
            <span>1. Base Transport:</span>
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

        {/* Freight Sharing Summary */}
        <div className="grid grid-cols-2 gap-2 text-xs">
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
      {/* SECTION 4: BATTERY DISCOUNT                                               */}
      {/* ========================================================================= */}
      <section className="glass-card rounded-2xl p-5 sm:p-6 space-y-3 shadow-sm border border-slate-200/90">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <BatteryCharging className="w-4 h-4 text-emerald-600" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Section 4 • Battery Program
              </span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Battery Discount (Separate Quota)
              </h2>
            </div>
          </div>
          <span className="text-sm font-mono font-black text-emerald-800">
            Allowance: {formatINR(calculationResult.batteryDiscountAllowance)}
          </span>
        </div>

        {calculationResult.totalBatteries > 0 ? (
          <div className="space-y-2.5">
            <p className="text-xs text-slate-600">
              Batteries carry a dedicated <strong>₹500 / unit discount allowance</strong> separate from the scooter budget and never shared with transport freight.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {calculationResult.batteryBreakdown.map((b, idx) => (
                <div key={idx} className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs flex items-center justify-between">
                  <span className="font-semibold text-emerald-950">{b.quantity}x {b.variant}</span>
                  <span className="font-mono font-bold text-emerald-800">{formatINR(b.quantity * 500)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>No separate battery units ordered.</span>
            <span className="font-mono font-bold text-slate-700">₹0 allowance</span>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: PROFIT VERIFICATION STATUS                                     */}
      {/* ========================================================================= */}
      <section className="glass-card rounded-2xl p-5 sm:p-6 space-y-3 shadow-sm border border-slate-200/90">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Section 5 • Profit Safeguard
              </span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Profit Verification Status
              </h2>
            </div>
          </div>

          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border flex items-center space-x-1 ${
            isProfitVerified
              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
              : isBelowTarget
              ? 'bg-amber-100 text-amber-900 border-amber-300'
              : 'bg-slate-100 text-slate-700 border-slate-300'
          }`}>
            {isProfitVerified ? (
              <>
                <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                <span>Verified</span>
              </>
            ) : isBelowTarget ? (
              <>
                <AlertCircle className="w-3 h-3 text-amber-700" />
                <span>Target Shortfall</span>
              </>
            ) : (
              <>
                <HelpCircle className="w-3 h-3 text-slate-500" />
                <span>Not Verified</span>
              </>
            )}
          </span>
        </div>

        <div className="text-xs space-y-1.5">
          {isProfitVerified ? (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950">
              <strong className="block font-bold">Approved Margin Compliant:</strong>
              <p className="mt-0.5 text-[11px] leading-relaxed">
                Order profitability has been confirmed with authorized company manufacturing costs and meets the corporate target margin threshold.
              </p>
            </div>
          ) : isBelowTarget ? (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950">
              <strong className="block font-bold">Margin Warning:</strong>
              <p className="mt-0.5 text-[11px] leading-relaxed">
                Projected profit falls below the required company margin target. Review discount allocation before issuing commercial quotation.
              </p>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
              <strong className="block font-bold text-slate-900">Profitability not verified — approved cost information is required.</strong>
              <p className="mt-0.5 text-[11px] text-slate-600 leading-relaxed">
                Company procurement costs and selling prices have not been entered. The commercial discount allowance is provisional based on model limits (DL: ₹500, Other: ₹1,000).
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 6: FINAL PAYABLE AMOUNT                                           */}
      {/* ========================================================================= */}
      <section className="glass-card rounded-2xl p-5 sm:p-6 space-y-3 shadow-sm border border-slate-200/90">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
            Section 6 • Settlement Total
          </span>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Final Payable Amount
          </h2>
        </div>

        {calculationResult.hasAllPrices && calculationResult.finalPayableAmount !== null ? (
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Dealership Settlement
              </span>
              <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                Net Vehicles + Dealer Transport
              </span>
            </div>

            <div className="text-3xl sm:text-4xl font-black text-[#101827] tracking-tight font-mono">
              <AnimatedNumber value={calculationResult.finalPayableAmount} />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-1 pt-2 border-t border-slate-100">
              <span className="font-medium text-slate-700">
                {formatINRWords(calculationResult.finalPayableAmount)}
              </span>
              <div className="flex items-center space-x-2 text-[11px]">
                <span>Net Vehicles: <strong>{formatINR(calculationResult.totalProductInvoiceAmount ? calculationResult.totalProductInvoiceAmount - calculationResult.actualScooterDiscountApplied : 0)}</strong></span>
                <span>+</span>
                <span>Dealer Transport: <strong>{formatINR(calculationResult.customerTransportPayment)}</strong></span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-slate-900">
                  Final scooter invoice amount is not calculated because approved prices are not configured.
                </h3>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  The commercial discount allowance of <strong className="text-slate-900 font-mono">{formatINR(calculationResult.scooterDiscountAllowance)}</strong> and final transport freight of <strong className="text-slate-900 font-mono">{formatINR(calculationResult.totalTransportCost)}</strong> have been successfully calculated and are ready for settlement.
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
