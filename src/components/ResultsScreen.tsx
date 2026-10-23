import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Printer, 
  RotateCcw, 
  CheckCircle2, 
  TrendingDown, 
  Truck, 
  Info, 
  Edit3, 
  AlertCircle,
  ShieldCheck
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
    setActiveView 
  } = useApp();

  const [justSaved, setJustSaved] = useState(false);
  const [isBreakdownExpanded, setIsBreakdownExpanded] = useState(true);
  const [isProfitExpanded, setIsProfitExpanded] = useState(false);

  const handleSaveOrder = () => {
    saveCurrentOrder();
    setJustSaved(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#E53935', '#16a34a', '#2563eb', '#ffffff'],
    });
    setTimeout(() => setJustSaved(false), 2500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24 animate-fade-in">
      
      {/* Top Header Bar with Back / Edit & Ref */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
        <button
          type="button"
          onClick={editCurrentOrder}
          className="flex items-center space-x-1.5 text-xs font-bold text-gray-700 hover:text-[#E53935] transition-colors py-1 cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Back to Edit Order</span>
        </button>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono font-bold bg-white border border-gray-200 text-gray-800 px-2.5 py-1 rounded-xl shadow-2xs">
            {orderInput.orderRef}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. EXECUTIVE HERO CARD: FINAL PAYABLE AMOUNT & KEY STATS                  */}
      {/* ========================================================================= */}
      <div className="glass-card rounded-2xl p-6 sm:p-7 shadow-xs space-y-4 relative overflow-hidden">
        {/* Subtle Brand Ambient Glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Customer & Reference Header */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
              B2B Dealership Quotation
            </span>
            <h1 className="text-base sm:text-lg font-black text-[#191A1D]">
              {orderInput.customerName || 'Direct B2B Order'}
            </h1>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
              Quotation Date
            </span>
            <span className="text-xs font-bold text-gray-700 font-mono">
              {orderInput.orderDate}
            </span>
          </div>
        </div>

        {/* Hero Figure: Final Payable Amount or Prices Pending */}
        {calculationResult.hasAllPrices && calculationResult.finalPayableAmount !== null ? (
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
                Final Total Payable Amount
              </span>
              <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                Total Dealership Benefit: <AnimatedNumber value={calculationResult.totalCustomerDiscountBenefit} />
              </span>
            </div>

            <div className="mt-2 text-3xl sm:text-4xl font-black text-[#191A1D] tracking-tight font-mono">
              <AnimatedNumber value={calculationResult.finalPayableAmount} />
            </div>

            <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
              <span className="font-medium text-gray-600">{formatINRWords(calculationResult.finalPayableAmount)}</span>
              {calculationResult.gstTreatment !== 'None' && (
                <span className="font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded text-[10px]">
                  {calculationResult.gstTreatment === 'Exclusive' ? '+ Product GST Applicable' : 'Product GST Included'}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-300 space-y-2">
            <div className="flex items-start space-x-2 text-amber-900">
              <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="text-sm font-bold">Prices Pending for Final Invoice Calculation</h2>
                <p className="text-xs text-amber-800 mt-0.5">
                  Commercial discount allowance of <strong>{formatINR(calculationResult.totalDiscountAllowance)}</strong> is calculated. Enter unit prices anytime to display net invoice.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={editCurrentOrder}
              className="text-xs font-bold text-amber-900 underline hover:text-black flex items-center space-x-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Tap here to add unit prices</span>
            </button>
          </div>
        )}

        {/* 4-Stat High-Level Snapshot */}
        <div className="pt-3 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2 bg-gray-50/80 rounded-xl">
            <span className="text-[10px] text-gray-500 font-semibold block">Total Scooters</span>
            <strong className="text-sm font-black font-mono text-gray-900 mt-0.5 block">
              <AnimatedNumber value={calculationResult.totalScooters} formatFn={(n) => `${n}`} /> units
            </strong>
          </div>

          <div className="p-2 bg-gray-50/80 rounded-xl">
            <span className="text-[10px] text-gray-500 font-semibold block">Total Batteries</span>
            <strong className="text-sm font-black font-mono text-gray-900 mt-0.5 block">
              <AnimatedNumber value={calculationResult.totalBatteries} formatFn={(n) => `${n}`} /> units
            </strong>
          </div>

          <div className="p-2 bg-gray-50/80 rounded-xl">
            <span className="text-[10px] text-gray-500 font-semibold block">Final Freight</span>
            <strong className="text-sm font-black font-mono text-gray-900 mt-0.5 block">
              <AnimatedNumber value={calculationResult.totalTransportCost} />
            </strong>
          </div>

          <div className="p-2 bg-gray-50/80 rounded-xl">
            <span className="text-[10px] text-gray-500 font-semibold block">Freight / Scooty</span>
            <strong className="text-sm font-black font-mono text-blue-900 mt-0.5 block">
              {calculationResult.transportCostPerScooter !== null ? formatINR(calculationResult.transportCostPerScooter) : '—'}
            </strong>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ORDER UNITS BREAKDOWN                                                  */}
      {/* ========================================================================= */}
      <div className="glass-card rounded-2xl p-5 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-600">
          Order Units Breakdown
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-blue-700 block">DL Scooters</span>
            <span className="text-xl font-black font-mono text-blue-950 mt-1 block">
              <AnimatedNumber value={calculationResult.totalDlScooters} formatFn={(n) => `${n}`} />
            </span>
            <span className="text-[10px] text-blue-600 font-medium">₹500 limit</span>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-amber-700 block">Other Scooters</span>
            <span className="text-xl font-black font-mono text-amber-950 mt-1 block">
              <AnimatedNumber value={calculationResult.totalOtherScooters} formatFn={(n) => `${n}`} />
            </span>
            <span className="text-[10px] text-amber-600 font-medium">₹1,000 limit</span>
          </div>

          <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-gray-600 block">Total Scooters</span>
            <span className="text-xl font-black font-mono text-gray-900 mt-1 block">
              <AnimatedNumber value={calculationResult.totalScooters} formatFn={(n) => `${n}`} />
            </span>
            <span className="text-[10px] text-gray-500 font-medium">All Models</span>
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-700 block">Total Batteries</span>
            <span className="text-xl font-black font-mono text-emerald-950 mt-1 block">
              <AnimatedNumber value={calculationResult.totalBatteries} formatFn={(n) => `${n}`} />
            </span>
            <span className="text-[10px] text-emerald-600 font-medium">₹500 disc/unit</span>
          </div>
        </div>

        {calculationResult.batteryBreakdown.length > 0 && (
          <div className="pt-1 text-xs text-gray-600 flex items-center space-x-2 flex-wrap gap-y-1">
            <span className="font-bold text-gray-700 text-[11px]">Battery Variants:</span>
            {calculationResult.batteryBreakdown.map((b, idx) => (
              <span key={idx} className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-[11px] font-medium">
                {b.quantity}x {b.variant}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. FINANCIAL & FREIGHT SETTLEMENT BREAKDOWN (11 DISTINCT VALUES)         */}
      {/* ========================================================================= */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-3 gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                Financial & Freight Settlement Breakdown
              </h2>
              <button
                type="button"
                onClick={() => setIsBreakdownExpanded(!isBreakdownExpanded)}
                className="text-[11px] font-semibold text-gray-500 hover:text-gray-900 cursor-pointer"
              >
                {isBreakdownExpanded ? '(Hide Details)' : '(Show Details)'}
              </button>
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">
              Strict Single-Component Rule: Discount applies to ONE component only.
            </p>
          </div>
          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border self-start sm:self-auto ${
            calculationResult.allocationOption === 'Scooty/Battery Discount'
              ? 'bg-blue-50 text-blue-800 border-blue-200'
              : calculationResult.allocationOption === 'Transport Support'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-gray-100 text-gray-800 border-gray-300'
          }`}>
            ● Active: {calculationResult.allocationOption}
          </span>
        </div>

        {/* Interactive 3-Way Allocation Switcher (Instant Recalculation) */}
        <div className="bg-gray-50/70 p-2.5 rounded-xl border border-gray-200/80 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-gray-700 px-1">
            <span>Switch Settlement Allocation:</span>
            <span className="text-[10px] text-gray-500 font-normal">Immediate Recalculation</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => updateOrderInput({ allocationMode: 'Scooty/Battery Discount', selectedScenarioId: 'scenario-a' })}
              className={`py-2 px-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                calculationResult.allocationOption === 'Scooty/Battery Discount'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="text-[11px] font-bold block">1. Scooty/Battery Discount</span>
              <span className={`text-[9px] block ${calculationResult.allocationOption === 'Scooty/Battery Discount' ? 'text-blue-100' : 'text-gray-500'}`}>
                100% discount on invoice; ₹0 transport support
              </span>
            </button>

            <button
              type="button"
              onClick={() => updateOrderInput({ allocationMode: 'Transport Support', selectedScenarioId: 'scenario-b' })}
              className={`py-2 px-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                calculationResult.allocationOption === 'Transport Support'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="text-[11px] font-bold block">2. Transport Support (50%)</span>
              <span className={`text-[9px] block ${calculationResult.allocationOption === 'Transport Support' ? 'text-emerald-100' : 'text-gray-500'}`}>
                50% freight support; ₹0 invoice discount
              </span>
            </button>

            <button
              type="button"
              onClick={() => updateOrderInput({ allocationMode: 'No Discount / Support', selectedScenarioId: 'scenario-c' })}
              className={`py-2 px-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                calculationResult.allocationOption === 'No Discount / Support'
                  ? 'bg-gray-800 text-white border-gray-800 shadow-2xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="text-[11px] font-bold block">3. No Discount / Support</span>
              <span className={`text-[9px] block ${calculationResult.allocationOption === 'No Discount / Support' ? 'text-gray-300' : 'text-gray-500'}`}>
                Full invoice & 100% freight payable
              </span>
            </button>
          </div>
        </div>

        {/* 11 Required Settlement Items */}
        {isBreakdownExpanded && (
          <div className="space-y-3 text-xs divide-y divide-gray-100 animate-fade-in">
            
            {/* 1. Total Scooter/Battery Invoice Amount */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="font-bold text-gray-900">1. Total Scooter/Battery Invoice Amount</span>
                <div className="text-[11px] text-gray-500">
                  {calculationResult.totalProductInvoiceAmount !== null
                    ? `${calculationResult.totalScooters} scooters (${formatINR(calculationResult.grossScooterAmount ?? 0)}) + ${calculationResult.totalBatteries} batteries (${formatINR(calculationResult.grossBatteryAmount ?? 0)})`
                    : 'Gross amount before discounts (Enter unit prices to calculate)'}
                </div>
              </div>
              <span className="font-mono font-bold text-gray-900 text-sm">
                {calculationResult.totalProductInvoiceAmount !== null
                  ? formatINR(calculationResult.totalProductInvoiceAmount)
                  : 'Prices Pending'}
              </span>
            </div>

            {/* 2. Scooter/Battery Discount */}
            <div className={`flex items-center justify-between pt-2 pl-3 border-l-2 ${
              calculationResult.allocationOption === 'Scooty/Battery Discount'
                ? 'border-emerald-500 bg-emerald-50/20'
                : 'border-gray-200 text-gray-400'
            }`}>
              <div>
                <span className={`font-semibold flex items-center space-x-1 ${
                  calculationResult.allocationOption === 'Scooty/Battery Discount' ? 'text-emerald-900' : 'text-gray-600'
                }`}>
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>2. Scooter / Battery Discount</span>
                </span>
                <div className="text-[10px] text-gray-500">
                  {calculationResult.allocationOption === 'Scooty/Battery Discount'
                    ? `Applied to Invoice (${formatINR(calculationResult.actualScooterDiscountApplied)} scooter + ${formatINR(calculationResult.actualBatteryDiscountApplied)} battery)`
                    : '₹0 (Single-component rule: Transport Support active)'}
                </div>
              </div>
              <span className={`font-mono font-bold text-sm ${
                calculationResult.allocationOption === 'Scooty/Battery Discount' ? 'text-emerald-700' : 'text-gray-500'
              }`}>
                {calculationResult.scooterBatteryDiscountApplied > 0
                  ? `− ${formatINR(calculationResult.scooterBatteryDiscountApplied)}`
                  : '₹0'}
              </span>
            </div>

            {/* Transport Charges Breakdown (5-Step Formula) */}
            <div className="pt-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-gray-900 flex items-center space-x-1">
                    <Truck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Transport Freight Charges</span>
                  </span>
                  <div className="text-[10px] text-gray-500">
                    {orderInput.transportDistanceKm} km • {calculationResult.truckSummary}
                  </div>
                </div>
              </div>

              {/* 5 Distinct Transport Breakdown Values */}
              <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-200/80 space-y-1.5 text-xs">
                {/* 3. Base Transport Charge */}
                <div className="flex items-center justify-between text-gray-700">
                  <span>3. Base Transport Charge:</span>
                  <span className="font-mono font-medium">{formatINR(calculationResult.baseTransportCost)}</span>
                </div>

                {/* 4. Additional Transport Charge (10%) */}
                <div className="flex items-center justify-between text-gray-700">
                  <span>4. Additional {calculationResult.transportExtraPercent}% Charge:</span>
                  <span className="font-mono font-medium text-amber-700">+ {formatINR(calculationResult.transportExtraCharge)}</span>
                </div>

                {/* Transport Subtotal */}
                <div className="flex items-center justify-between font-semibold text-gray-900 pt-1 border-t border-gray-200">
                  <span>Transport Subtotal:</span>
                  <span className="font-mono">{formatINR(calculationResult.transportSubtotal)}</span>
                </div>

                {/* 5. Transport GST (5%) */}
                <div className="flex items-center justify-between text-gray-700">
                  <span>5. Transport GST ({calculationResult.transportGstPercent}%):</span>
                  <span className="font-mono font-medium text-blue-700">+ {formatINR(calculationResult.transportGstAmount)}</span>
                </div>

                {/* 6. Final Total Transport Cost */}
                <div className="flex items-center justify-between font-extrabold text-gray-950 pt-1.5 border-t border-gray-300 text-xs">
                  <span>6. Final Total Transport Cost:</span>
                  <span className="font-mono text-red-600 font-bold">{formatINR(calculationResult.totalTransportCost)}</span>
                </div>

                {/* 7. Transport Cost Per Scooty */}
                <div className="flex items-center justify-between bg-blue-50/80 px-2.5 py-2 rounded-lg border border-blue-200/80 font-bold text-blue-950 mt-1">
                  <div>
                    <span className="block text-blue-900">7. Transport Cost Per Scooty:</span>
                    <span className="text-[10px] text-blue-700 font-normal">
                      {calculationResult.totalScooters > 0
                        ? `Final Transport (${formatINR(calculationResult.totalTransportCost)}) ÷ ${calculationResult.totalScooters} Scooters`
                        : 'Zero scooters in order'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-blue-950 font-black text-sm block">
                      {calculationResult.transportCostPerScooter !== null
                        ? `${formatINR(calculationResult.transportCostPerScooter)} / scooty`
                        : '—'}
                    </span>
                    {calculationResult.customerTransportPerScooter !== null && (
                      <span className="text-[10px] font-mono text-blue-800 font-semibold block">
                        Dealer pays: {formatINR(calculationResult.customerTransportPerScooter)}/scooty
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 8. Company Transport Support */}
              <div className={`flex items-center justify-between pl-3 border-l-2 text-xs py-1 ${
                calculationResult.allocationOption === 'Transport Support'
                  ? 'border-blue-500 bg-blue-50/30 text-blue-950'
                  : 'border-gray-200 text-gray-500'
              }`}>
                <div>
                  <span className="font-semibold block">8. Company Transport Support (50%)</span>
                  <div className="text-[10px] text-gray-500">
                    {calculationResult.allocationOption === 'Transport Support'
                      ? 'Absorbed by Xidaa Moto under Transport Support allocation'
                      : '₹0 (Single-component rule: Scooty/Battery Discount active)'}
                  </div>
                </div>
                <span className={`font-mono font-bold ${
                  calculationResult.allocationOption === 'Transport Support' ? 'text-blue-800' : 'text-gray-500'
                }`}>
                  {calculationResult.companyTransportSupport > 0
                    ? `− ${formatINR(calculationResult.companyTransportSupport)}`
                    : '₹0'}
                </span>
              </div>

              {/* 9. Customer Transport Payable */}
              <div className="flex items-center justify-between pl-3 border-l-2 border-gray-400 font-bold text-gray-900 text-xs py-1">
                <div>
                  <span>9. Customer Transport Payable</span>
                  <div className="text-[10px] text-gray-500 font-normal">
                    {calculationResult.allocationOption === 'Transport Support'
                      ? 'Remaining 50% freight payable by customer'
                      : 'Full 100% freight payable by customer'}
                  </div>
                </div>
                <span className="font-mono font-black text-sm">
                  + {formatINR(calculationResult.customerTransportPayment)}
                </span>
              </div>
            </div>

            {/* 10. Total Customer Payable */}
            <div className="flex items-center justify-between pt-3 font-extrabold text-sm bg-gray-900 text-white p-3.5 rounded-xl shadow-xs">
              <div>
                <span className="block text-white">10. Total Customer Payable:</span>
                <span className="text-[10px] text-gray-300 font-normal">
                  {calculationResult.finalPayableAmount !== null
                    ? `Net Invoice + Customer Transport (${formatINR(calculationResult.customerTransportPayment)})`
                    : 'Prices pending in order form'}
                </span>
              </div>
              <span className="font-mono text-red-400 text-base font-black">
                {calculationResult.finalPayableAmount !== null
                  ? formatINR(calculationResult.finalPayableAmount)
                  : 'Pending Prices'}
              </span>
            </div>

            {/* 11. Total Dealership Benefit Received */}
            <div className="flex items-center justify-between pt-3 font-extrabold text-sm bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
              <div>
                <span className="text-gray-900 block">11. Total Dealership Benefit Received:</span>
                <span className="text-[10px] text-emerald-800 font-normal">
                  Single non-duplicated benefit: {calculationResult.allocationOption}
                </span>
              </div>
              <span className="font-mono text-emerald-700 text-base font-black">
                {formatINR(calculationResult.totalCustomerDiscountBenefit)}
              </span>
            </div>

          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. SMART PROFIT PROTECTION ENGINE CARD                                    */}
      {/* ========================================================================= */}
      <div className="glass-card rounded-2xl p-5 space-y-3.5">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-purple-700" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Profit Protection & Feasibility Audit
            </h2>
          </div>

          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
            calculationResult.profitProtection.status === 'Verified'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : calculationResult.profitProtection.status === 'Below Target'
              ? 'bg-red-50 text-red-800 border-red-300'
              : 'bg-amber-50 text-amber-800 border-amber-300'
          }`}>
            ● {calculationResult.profitProtection.status}
          </span>
        </div>

        {/* Executive Recommendation Message */}
        <div className="p-3 bg-gray-50/80 rounded-xl border border-gray-200 text-xs text-gray-700 space-y-1">
          <strong className="block text-gray-900">
            {calculationResult.profitProtection.hasCostData ? 'Executive Strategy Recommendation:' : 'Status: Data Not Verified'}
          </strong>
          <p className="text-[11px] leading-relaxed text-gray-600">
            {calculationResult.profitProtection.recommendationReason}
          </p>
        </div>

        {/* Toggle Detailed Profit Rows */}
        <button
          type="button"
          onClick={() => setIsProfitExpanded(!isProfitExpanded)}
          className="text-[11px] font-semibold text-purple-700 hover:underline flex items-center space-x-1 cursor-pointer"
        >
          <span>{isProfitExpanded ? '− Hide Strategy Comparison' : '+ Compare All 4 Profit Strategies'}</span>
        </button>

        {isProfitExpanded && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 animate-fade-in text-xs">
            {calculationResult.profitProtection.scenarios.map((s) => (
              <div
                key={s.id}
                className={`p-3 rounded-xl border transition-all ${
                  calculationResult.profitProtection.selectedScenarioId === s.id
                    ? 'bg-purple-50/50 border-purple-400'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-gray-900">{s.tagline}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                    s.status === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {s.status}
                  </span>
                </div>
                <div className="text-[11px] text-gray-500 space-y-0.5">
                  <div className="flex justify-between">
                    <span>Est. Profit:</span>
                    <strong className="font-mono text-gray-800">
                      {s.companyProfit !== null ? formatINR(s.companyProfit) : 'Pending'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <strong className="font-mono text-gray-800">
                      {formatINR(s.totalDiscountBenefit)}
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Policy Callout */}
      <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-700 flex items-start space-x-2">
        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <p>
          <strong>Policy Status:</strong> {calculationResult.eligibilityMessage}
        </p>
      </div>

      {/* ========================================================================= */}
      {/* 5. PRIMARY ACTION BUTTONS                                                 */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
        {/* Edit Order */}
        <button
          type="button"
          onClick={editCurrentOrder}
          className="py-3 px-3 bg-white hover:bg-gray-100 text-gray-800 border border-gray-200 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors cursor-pointer active:scale-95 shadow-2xs"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Order</span>
        </button>

        {/* Save Calculation */}
        <button
          type="button"
          onClick={handleSaveOrder}
          className={`py-3 px-3 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-all cursor-pointer active:scale-95 ${
            justSaved
              ? 'bg-emerald-600 text-white'
              : 'bg-[#E53935] hover:bg-[#D32F2F] text-white shadow-xs'
          }`}
        >
          {justSaved ? (
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
          className="py-3 px-3 bg-white hover:bg-gray-100 text-gray-800 border border-gray-200 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors cursor-pointer active:scale-95 shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Start New</span>
        </button>

        {/* Generate PDF (Print / PDF) */}
        <button
          type="button"
          onClick={() => setActiveView('print-summary')}
          className="py-3 px-3 bg-gray-900 hover:bg-black text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors cursor-pointer active:scale-95 shadow-xs"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Generate PDF</span>
        </button>
      </div>

    </div>
  );
};
