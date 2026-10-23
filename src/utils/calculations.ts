import type { 
  AppConfig, 
  CalculationResult, 
  OrderInput, 
  ProfitabilityStatus,
  ProfitProtectionResult, 
  ProfitScenario, 
  ProfitScenarioId, 
  TransportAllocationMode, 
  TruckConfig 
} from '../types';
import { formatINR, toPaise, toRupees } from './currency';

/**
 * Pure calculation engine for Xidaa Discount Calculator.
 * Operates with strict integer-paise arithmetic to eliminate floating-point currency discrepancies.
 */
export function calculateOrderFinancials(
  input: OrderInput,
  config: AppConfig
): CalculationResult {
  const auditTrail: CalculationResult['auditTrail'] = [];

  // 1. Scooter Item Calculations
  let totalDlScooters = 0;
  let totalOtherScooters = 0;
  let totalScooters = 0;
  let hasMissingScooterPrice = false;
  let grossScooterPaise = 0;

  (input.scooterItems || []).forEach((item) => {
    const qty = Math.max(0, Math.floor(Number(item.quantity) || 0));
    if (qty > 0) {
      totalScooters += qty;
      if (item.category === 'DL Model') {
        totalDlScooters += qty;
      } else {
        totalOtherScooters += qty;
      }

      const effectivePrice = (item.unitPrice !== undefined && item.unitPrice !== null && item.unitPrice > 0)
        ? item.unitPrice 
        : input.profitabilityInput?.defaultScooterSellingPrice;

      if (effectivePrice !== undefined && effectivePrice !== null && effectivePrice > 0) {
        grossScooterPaise += toPaise(qty * effectivePrice);
      } else {
        hasMissingScooterPrice = true;
      }
    }
  });

  const dlLimit = config.discountRates.dlModelMaxDiscount;
  const otherLimit = config.discountRates.otherModelMaxDiscount;

  const dlAllowancePaise = toPaise(totalDlScooters * dlLimit);
  const otherAllowancePaise = toPaise(totalOtherScooters * otherLimit);
  const scooterDiscountAllowancePaise = dlAllowancePaise + otherAllowancePaise;
  const scooterDiscountAllowance = toRupees(scooterDiscountAllowancePaise);

  auditTrail.push({
    step: '1. Scooter Discount Allowance (S)',
    description: `DL: ${totalDlScooters} × ${formatINR(dlLimit)} (${formatINR(toRupees(dlAllowancePaise))}) + Other: ${totalOtherScooters} × ${formatINR(otherLimit)} (${formatINR(toRupees(otherAllowancePaise))})`,
    formula: `(${totalDlScooters} × ${formatINR(dlLimit)}) + (${totalOtherScooters} × ${formatINR(otherLimit)})`,
    amount: scooterDiscountAllowance,
  });

  // 2. Battery Item Calculations
  let totalBatteries = 0;
  let totalEligibleBatteries = 0;
  let grossBatteryPaise = 0;
  let hasMissingBatteryPrice = false;
  const batteryBreakdown: CalculationResult['batteryBreakdown'] = [];

  if (input.batteryIncluded && input.batteryItems && input.batteryItems.length > 0) {
    input.batteryItems.forEach((b) => {
      const bQty = Math.max(0, Math.floor(Number(b.quantity) || 0));
      if (bQty > 0) {
        totalBatteries += bQty;
        const eligible = Math.min(bQty, Math.max(0, Math.floor(Number(b.eligibleDiscountQuantity) || 0)));
        totalEligibleBatteries += eligible;
        batteryBreakdown.push({ variant: b.variant, quantity: bQty });

        const effectiveBattPrice = (b.unitPrice !== undefined && b.unitPrice !== null && b.unitPrice > 0)
          ? b.unitPrice
          : input.profitabilityInput?.defaultBatterySellingPrice;

        if (effectiveBattPrice !== undefined && effectiveBattPrice !== null && effectiveBattPrice > 0) {
          grossBatteryPaise += toPaise(bQty * effectiveBattPrice);
        } else {
          hasMissingBatteryPrice = true;
        }
      }
    });
  }

  const batteryAllowancePaise = toPaise(totalEligibleBatteries * config.discountRates.batteryMaxDiscount);
  const batteryDiscountAllowance = toRupees(batteryAllowancePaise);

  auditTrail.push({
    step: '2. Battery Discount Allowance (B)',
    description: input.batteryIncluded && totalEligibleBatteries > 0
      ? `${totalEligibleBatteries} eligible batteries @ ${formatINR(config.discountRates.batteryMaxDiscount)} each`
      : 'No eligible battery discount (batteries not included or 0 eligible)',
    formula: `${totalEligibleBatteries} × ${formatINR(config.discountRates.batteryMaxDiscount)}`,
    amount: batteryDiscountAllowance,
  });

  const totalDiscountAllowance = scooterDiscountAllowance + batteryDiscountAllowance;

  // 3. Transport Logistics Calculations
  // Step 1: Base Transport = Distance in KM × Truck Rate (sum of truck allocations)
  // Step 2: Extra Charge % (default 10%) = Base Transport × Extra%
  // Step 3: Transport Subtotal = Base Transport + Extra Charge
  // Step 4: Transport GST % (default 5%) = Transport Subtotal × GST%
  // Step 5: Final Transport Cost = Transport Subtotal + Transport GST
  const distanceKm = Math.max(0, Number(input.transportDistanceKm) || 0);
  let baseTransportPaise = 0;
  let totalCapacity = 0;
  const truckDescriptions: string[] = [];

  if (input.truckAllocations && input.truckAllocations.length > 0) {
    input.truckAllocations.forEach((alloc) => {
      const count = Math.max(0, Math.floor(Number(alloc.count) || 0));
      if (count > 0) {
        totalCapacity += count * alloc.capacity;
        const lineBasePaise = toPaise(count * distanceKm * alloc.ratePerKm);
        baseTransportPaise += lineBasePaise;
        truckDescriptions.push(
          `${count}x ${alloc.capacity}-scooter truck (${distanceKm} km @ ${formatINR(alloc.ratePerKm)}/km = ${formatINR(toRupees(lineBasePaise))})`
        );
      }
    });
  }

  const baseTransportCost = toRupees(baseTransportPaise);

  // Additional % extra charge (configurable, default 10%)
  const transportExtraPercent = config.transportSettings?.extraChargePercent ?? 10;
  const transportExtraPaise = Math.round(baseTransportPaise * (transportExtraPercent / 100));
  const transportExtraCharge = toRupees(transportExtraPaise);

  // Transport subtotal after extra charge
  const transportSubtotalPaise = baseTransportPaise + transportExtraPaise;
  const transportSubtotal = toRupees(transportSubtotalPaise);

  // Transport GST % (configurable, default 5%) calculated on Transport Subtotal
  const transportGstPercent = config.transportSettings?.transportGstPercent ?? 5;
  const transportGstPaise = Math.round(transportSubtotalPaise * (transportGstPercent / 100));
  const transportGstAmount = toRupees(transportGstPaise);

  // Final Transport Cost = Subtotal + Transport GST
  const finalTransportPaise = transportSubtotalPaise + transportGstPaise;
  const totalTransportCost = toRupees(finalTransportPaise);

  // Half-transport sharing quota (50% of final transport cost)
  const halfTransportPaise = Math.round(finalTransportPaise * (config.transportSharing.companySharePercent / 100));
  const halfTransportCost = toRupees(halfTransportPaise);
  const truckSummary = truckDescriptions.join(' + ') || 'No trucks allocated';

  auditTrail.push({
    step: '3. Transport Logistics Charges (5-Step Formula)',
    description: `Base: ${formatINR(baseTransportCost)} + ${transportExtraPercent}% Extra: ${formatINR(transportExtraCharge)} = Subtotal: ${formatINR(transportSubtotal)} + ${transportGstPercent}% GST: ${formatINR(transportGstAmount)} = Final Transport: ${formatINR(totalTransportCost)} (${truckSummary})`,
    formula: `[Base (${formatINR(baseTransportCost)}) × (1 + ${transportExtraPercent}%)] × (1 + ${transportGstPercent}%)`,
    amount: totalTransportCost,
  });

  // 4. Smart Profit Protection Engine & Scenario Analysis
  // Rule: Scooter discount allowance (S) covers 50% of final transport cost (H). Battery allowance (B) is NEVER used for freight sharing.
  const isSharingEligible = totalTransportCost > 0 && scooterDiscountAllowancePaise >= halfTransportPaise;

  const profitProtection = evaluateProfitProtectionEngine(input, config, {
    totalScooters,
    totalBatteries,
    scooterDiscountAllowance,
    batteryDiscountAllowance,
    totalTransportCost,
    halfTransportCost,
    baseTransportCost,
    transportSubtotal,
    transportGstAmount,
    isSharingEligible,
    grossScooterPaise,
    grossBatteryPaise,
    hasMissingScooterPrice,
    hasMissingBatteryPrice,
  });

  // Use the active scenario selected by user or recommended by profit protection engine
  const activeScenario = profitProtection.activeScenario;
  const companyTransportSupport = activeScenario.companyTransportSupport;
  const customerTransportPayment = activeScenario.customerTransportPayment;
  const actualScooterDiscountApplied = activeScenario.scooterDiscountApplied;
  const actualBatteryDiscountApplied = activeScenario.batteryDiscountApplied;
  const remainingScooterDiscount = activeScenario.remainingScooterDiscount;
  const totalCustomerDiscountBenefit = activeScenario.totalDiscountBenefit;
  const transportSharingApplied = companyTransportSupport > 0;

  const customerTransportPaymentPaise = toPaise(customerTransportPayment);
  const remainingScooterDiscountPaise = toPaise(actualScooterDiscountApplied);
  const batteryAllowanceAppliedPaise = toPaise(actualBatteryDiscountApplied);

  let effectiveAllocationMode: TransportAllocationMode = input.allocationMode;
  if (activeScenario.id === 'scenario-b') {
    effectiveAllocationMode = 'Share Transport';
  } else if (activeScenario.id === 'scenario-a') {
    effectiveAllocationMode = 'Full Scooter Discount';
  }

  let eligibilityMessage = activeScenario.description;
  let warningMessage: string | undefined = undefined;
  let suggestedMode: TransportAllocationMode | undefined;

  if (!activeScenario.isValid) {
    warningMessage = activeScenario.statusMessage;
    suggestedMode = 'Full Scooter Discount';
  } else if (activeScenario.status === 'Below Target') {
    warningMessage = `Profit Protection Alert: ${activeScenario.statusMessage}`;
  } else if (isSharingEligible && activeScenario.id === 'scenario-b') {
    eligibilityMessage = `Scooter discount allowance (${formatINR(scooterDiscountAllowance)}) covers 50% freight (${formatINR(halfTransportCost)}). Company absorbs 50% freight support. Remaining scooter discount (${formatINR(remainingScooterDiscount)}) applied to invoice.`;
  } else if (!isSharingEligible && totalTransportCost > 0) {
    eligibilityMessage = `Scooter discount allowance (${formatINR(scooterDiscountAllowance)}) is insufficient for 50% transport support (${formatINR(halfTransportCost)}). Full discount applied to scooter invoice; customer pays 100% transport.`;
  }

  // 5. Check Price Completeness & Financials
  const hasItemsToPrice = totalScooters > 0 || totalBatteries > 0;
  const hasAllPrices = hasItemsToPrice && !hasMissingScooterPrice && (!input.batteryIncluded || !hasMissingBatteryPrice);

  let grossScooterAmount: number | null = null;
  let grossBatteryAmount: number | null = null;
  let grossTotalAmount: number | null = null;
  let subtotalBeforeTax: number | null = null;
  let gstAmount: number | null = null;
  let finalPayableAmount: number | null = null;
  let missingPriceReason: string | undefined;

  if (!hasItemsToPrice) {
    missingPriceReason = 'Add at least one scooter or battery item to calculate order.';
  } else if (!hasAllPrices) {
    missingPriceReason = 'Enter prices to calculate final payable amount.';
  } else {
    // All prices provided!
    grossScooterAmount = toRupees(grossScooterPaise);
    grossBatteryAmount = toRupees(grossBatteryPaise);
    const grossTotalPaise = grossScooterPaise + grossBatteryPaise;
    grossTotalAmount = toRupees(grossTotalPaise);

    // Net products after applying remaining scooter discount and battery discount
    const netProductsPaise = Math.max(0, grossTotalPaise - remainingScooterDiscountPaise - batteryAllowanceAppliedPaise);

    // Note: Customer transport payment already includes transport GST (Step 3/4).
    // Do NOT add GST again elsewhere to the same transport amount.
    const { gstTreatment, gstRatePercent } = config.taxSettings;
    let productGstPaise = 0;

    if (gstTreatment === 'Exclusive' && gstRatePercent > 0) {
      productGstPaise = Math.round(netProductsPaise * (gstRatePercent / 100));
      subtotalBeforeTax = toRupees(netProductsPaise + customerTransportPaymentPaise);
      gstAmount = toRupees(productGstPaise);
      finalPayableAmount = toRupees(netProductsPaise + productGstPaise + customerTransportPaymentPaise);
    } else if (gstTreatment === 'Inclusive' && gstRatePercent > 0) {
      productGstPaise = Math.round(netProductsPaise - (netProductsPaise / (1 + gstRatePercent / 100)));
      subtotalBeforeTax = toRupees(netProductsPaise + customerTransportPaymentPaise);
      gstAmount = toRupees(productGstPaise);
      finalPayableAmount = toRupees(netProductsPaise + customerTransportPaymentPaise);
    } else {
      // 'None'
      subtotalBeforeTax = toRupees(netProductsPaise + customerTransportPaymentPaise);
      gstAmount = null;
      finalPayableAmount = toRupees(netProductsPaise + customerTransportPaymentPaise);
    }
  }

  auditTrail.push({
    step: '5. Smart Profit Protection Engine',
    description: profitProtection.hasCostData
      ? `Status: ${profitProtection.status} (${profitProtection.minProfitRequirementText}). Active Strategy: ${profitProtection.activeScenario.name} -> Profit: ${profitProtection.activeScenario.companyProfit !== null ? formatINR(profitProtection.activeScenario.companyProfit) : 'N/A'} (${profitProtection.activeScenario.profitMarginPercent ?? 0}% margin). ${profitProtection.recommendationReason}`
      : `Status: Profitability Not Verified (Missing: ${profitProtection.missingDataReasons.join(', ')}). ${profitProtection.recommendationReason}`,
    formula: `Scooter Rev + Battery Rev + Customer Transport (ex GST) - Scooter Costs - Battery Costs - Transporter Costs - Other Costs`,
    amount: profitProtection.activeScenario.companyProfit,
  });

  return {
    totalDlScooters,
    totalOtherScooters,
    totalScooters,
    totalBatteries,
    batteryBreakdown,
    scooterDiscountAllowance,
    batteryDiscountAllowance,
    totalDiscountAllowance,
    baseTransportCost,
    transportExtraPercent,
    transportExtraCharge,
    transportSubtotal,
    transportGstPercent,
    transportGstAmount,
    totalTransportCost,
    halfTransportCost,
    totalCapacity,
    truckSummary,
    transportSharingEligible: isSharingEligible,
    transportSharingApplied,
    companyTransportSupport,
    customerTransportPayment,
    actualScooterDiscountApplied,
    actualBatteryDiscountApplied,
    remainingScooterDiscount,
    totalCustomerDiscountBenefit,
    hasAllPrices,
    missingPriceReason,
    grossScooterAmount,
    grossBatteryAmount,
    grossTotalAmount,
    subtotalBeforeTax,
    gstAmount,
    finalPayableAmount,
    gstTreatment: config.taxSettings.gstTreatment,
    gstRatePercent: config.taxSettings.gstRatePercent,
    effectiveAllocationMode,
    eligibilityMessage,
    warningMessage,
    suggestedMode,
    auditTrail,
    profitProtection,
  };
}

/**
 * Smart Profit Protection Engine
 * Evaluates Scenario A (Scooter Discount), B (Transport Sharing), C (Combined Allocation), and D (No Discount).
 * Validates against configurable profit target and prevents double-counting or loss-making discounts.
 */
export function evaluateProfitProtectionEngine(
  input: OrderInput,
  config: AppConfig,
  context: {
    totalScooters: number;
    totalBatteries: number;
    scooterDiscountAllowance: number;
    batteryDiscountAllowance: number;
    totalTransportCost: number;
    halfTransportCost: number;
    baseTransportCost: number;
    transportSubtotal: number;
    transportGstAmount: number;
    isSharingEligible: boolean;
    grossScooterPaise: number;
    grossBatteryPaise: number;
    hasMissingScooterPrice: boolean;
    hasMissingBatteryPrice: boolean;
  }
): ProfitProtectionResult {
  const pInput = input.profitabilityInput || {};
  const pConfig = config.profitProtectionConfig || {
    enabled: true,
    defaultMinProfitType: 'margin_percent',
    defaultMinProfitAmount: 30000,
    defaultMinProfitMarginPercent: 10,
    gstRecoverable: true,
  };

  const minProfitType = pInput.minProfitType || pConfig.defaultMinProfitType || 'margin_percent';
  const targetProfitAmount = (pInput.minProfitAmount !== undefined && pInput.minProfitAmount !== null && Number(pInput.minProfitAmount) > 0)
    ? Number(pInput.minProfitAmount)
    : pConfig.defaultMinProfitAmount;
  const targetProfitMarginPercent = (pInput.minProfitMarginPercent !== undefined && pInput.minProfitMarginPercent !== null && Number(pInput.minProfitMarginPercent) > 0)
    ? Number(pInput.minProfitMarginPercent)
    : pConfig.defaultMinProfitMarginPercent;

  const minProfitRequirementText = minProfitType === 'margin_percent'
    ? `Minimum ${targetProfitMarginPercent}% Profit Margin`
    : `Minimum ${formatINR(targetProfitAmount)} Profit Amount`;

  // Costs
  let totalScooterCost: number | null = null;
  if (pInput.totalScooterCost !== undefined && pInput.totalScooterCost !== null && Number(pInput.totalScooterCost) > 0) {
    totalScooterCost = Number(pInput.totalScooterCost);
  } else if (pInput.scooterUnitCost !== undefined && pInput.scooterUnitCost !== null && Number(pInput.scooterUnitCost) > 0) {
    totalScooterCost = context.totalScooters * Number(pInput.scooterUnitCost);
  }

  let totalBatteryCost: number | null = null;
  if (context.totalBatteries === 0) {
    totalBatteryCost = 0;
  } else if (pInput.totalBatteryCost !== undefined && pInput.totalBatteryCost !== null && Number(pInput.totalBatteryCost) > 0) {
    totalBatteryCost = Number(pInput.totalBatteryCost);
  } else if (pInput.batteryUnitCost !== undefined && pInput.batteryUnitCost !== null && Number(pInput.batteryUnitCost) > 0) {
    totalBatteryCost = context.totalBatteries * Number(pInput.batteryUnitCost);
  }

  const otherCompanyCosts = Math.max(0, Number(pInput.otherCompanyCosts) || 0);

  // Revenue Check
  const grossScooterRevenue = context.grossScooterPaise > 0 ? toRupees(context.grossScooterPaise) : null;
  const grossBatteryRevenue = context.totalBatteries > 0 ? (context.grossBatteryPaise > 0 ? toRupees(context.grossBatteryPaise) : null) : 0;

  // Identify Missing Data (Strictly do not invent manufacturing data)
  const missingDataReasons: string[] = [];
  if (context.totalScooters > 0 && totalScooterCost === null) {
    missingDataReasons.push('Scooter company cost (unit cost or total manufacturing cost)');
  }
  if (context.totalScooters > 0 && (context.hasMissingScooterPrice || grossScooterRevenue === null)) {
    missingDataReasons.push('Approved scooter selling price');
  }
  if (context.totalBatteries > 0 && totalBatteryCost === null) {
    missingDataReasons.push('Battery company cost (unit cost or total manufacturing cost)');
  }
  if (context.totalBatteries > 0 && (context.hasMissingBatteryPrice || grossBatteryRevenue === null)) {
    missingDataReasons.push('Approved battery selling price');
  }

  const hasCostData = missingDataReasons.length === 0;
  const gstTransportTreatment: 'recoverable' | 'cost' = pConfig.gstRecoverable ? 'recoverable' : 'cost';

  // Helper for single scenario calculation
  const calculateScenario = (
    id: ProfitScenarioId,
    name: string,
    tagline: string,
    description: string,
    scooterDiscount: number,
    batteryDiscount: number,
    compTransportSupport: number,
    custTransportPay: number,
    isValid: boolean,
    invalidReason?: string
  ): ProfitScenario => {
    const totalBenefit = scooterDiscount + batteryDiscount + compTransportSupport;

    if (!hasCostData || grossScooterRevenue === null || totalScooterCost === null || (context.totalBatteries > 0 && (grossBatteryRevenue === null || totalBatteryCost === null))) {
      return {
        id,
        name,
        tagline,
        description,
        scooterDiscountApplied: scooterDiscount,
        batteryDiscountApplied: batteryDiscount,
        companyTransportSupport: compTransportSupport,
        customerTransportPayment: custTransportPay,
        totalDiscountBenefit: totalBenefit,
        remainingScooterDiscount: scooterDiscount,
        companyProfit: null,
        profitMarginPercent: null,
        isValid,
        meetsProfitTarget: null,
        status: 'Not Verified',
        statusMessage: invalidReason || 'Profitability not verified (missing cost or selling price data).',
      };
    }

    // Revenue after discounts
    const scooterRev = Math.max(0, grossScooterRevenue - scooterDiscount);
    const battRev = Math.max(0, (grossBatteryRevenue || 0) - batteryDiscount);

    // Transport excluding GST
    const transportTotalExGst = context.transportSubtotal;
    const finalTrans = Math.max(1, context.totalTransportCost);
    const custTransportExGst = Math.round(custTransportPay * (transportTotalExGst / finalTrans));

    // Company-borne transport cost excluding recoverable GST where applicable
    const compTransportExpense = gstTransportTreatment === 'recoverable'
      ? Math.round(compTransportSupport * (transportTotalExGst / finalTrans))
      : compTransportSupport;

    // Company Profit =
    // Scooter revenue after discounts + Battery revenue after discounts + Customer transport collected (excl GST)
    // - Scooter costs - Battery costs - Transporter charges (excl GST) - Other costs
    // = Scooter revenue after discounts + Battery revenue after discounts - Scooter costs - Battery costs - Company transport cost - Other costs
    // (Never double-counting company transport support)
    const companyProfit = Math.round(
      scooterRev + battRev - totalScooterCost - (totalBatteryCost || 0) - compTransportExpense - otherCompanyCosts
    );

    // Revenue base for margin
    const totalRevExGst = scooterRev + battRev + custTransportExGst;
    const profitMarginPercent = totalRevExGst > 0 ? Number(((companyProfit / totalRevExGst) * 100).toFixed(2)) : 0;

    let meetsTarget = false;
    let shortfall = 0;

    if (minProfitType === 'margin_percent') {
      meetsTarget = profitMarginPercent >= targetProfitMarginPercent;
      if (!meetsTarget && totalRevExGst > 0) {
        const requiredProfit = (targetProfitMarginPercent / 100) * totalRevExGst;
        shortfall = Math.max(0, Math.round(requiredProfit - companyProfit));
      }
    } else {
      meetsTarget = companyProfit >= targetProfitAmount;
      if (!meetsTarget) {
        shortfall = Math.max(0, Math.round(targetProfitAmount - companyProfit));
      }
    }

    const scenarioStatus: ProfitabilityStatus = !isValid
      ? 'Below Target'
      : meetsTarget
      ? 'Verified'
      : 'Below Target';

    let statusMsg = '';
    if (!isValid) {
      statusMsg = invalidReason || 'Ineligible configuration.';
    } else if (meetsTarget) {
      statusMsg = `Meets target with ${formatINR(companyProfit)} profit (${profitMarginPercent}% margin).`;
    } else {
      statusMsg = `Falls ${formatINR(shortfall)} short of ${minProfitRequirementText} (Profit: ${formatINR(companyProfit)}, Margin: ${profitMarginPercent}%).`;
    }

    return {
      id,
      name,
      tagline,
      description,
      scooterDiscountApplied: scooterDiscount,
      batteryDiscountApplied: batteryDiscount,
      companyTransportSupport: compTransportSupport,
      customerTransportPayment: custTransportPay,
      totalDiscountBenefit: totalBenefit,
      remainingScooterDiscount: scooterDiscount,
      companyProfit,
      profitMarginPercent,
      isValid,
      meetsProfitTarget: meetsTarget,
      profitShortfall: shortfall > 0 ? shortfall : undefined,
      status: scenarioStatus,
      statusMessage: statusMsg,
    };
  };

  const S = context.scooterDiscountAllowance;
  const B = context.batteryDiscountAllowance;
  const T = context.totalTransportCost;
  const H = context.halfTransportCost;

  // Scenario A: Scooter Discount
  // Full scooter discount applied to vehicle invoice, customer pays 100% transport
  const scenarioA = calculateScenario(
    'scenario-a',
    'Scenario A: Scooter Discount',
    'Full Discount on Price',
    'Apply eligible scooter discount to scooter prices; customer pays full calculated transport amount.',
    S,
    B,
    0,
    T,
    true
  );

  // Scenario B: Transport Sharing
  // Evaluate 50% transport support from scooter discount allowance if eligible
  const isBEligible = context.isSharingEligible;
  const scenarioB = calculateScenario(
    'scenario-b',
    'Scenario B: Transport Sharing',
    '50/50 Freight Support',
    'Company absorbs 50% transport from scooter discount allowance; remaining allowance applied to scooter price.',
    isBEligible ? Math.max(0, S - H) : 0,
    B,
    isBEligible ? H : 0,
    isBEligible ? T - H : T,
    isBEligible,
    isBEligible ? undefined : `Ineligible: Scooter discount allowance (${formatINR(S)}) does not cover 50% transport charge (${formatINR(H)}).`
  );

  // Scenario C: Combined Allocation
  // Deduct transport support from scooter discount allowance before calculating any remaining scooter discount
  const supportC = Math.min(S, H);
  const remainingScooterC = Math.max(0, S - supportC);
  const scenarioC = calculateScenario(
    'scenario-c',
    'Scenario C: Combined Allocation',
    'Deduct Freight from Allowance',
    'Deducts transport support from the scooter discount allowance before calculating remaining scooter discount. Never uses allowance twice.',
    remainingScooterC,
    B,
    supportC,
    T - supportC,
    true
  );

  // Scenario D: No Discount
  // Baseline when discount options violate profit requirement
  const scenarioD = calculateScenario(
    'scenario-d',
    'Scenario D: No Discount',
    'Zero Discount Baseline',
    'Zero discounts applied to protect company profit margin when discounts would cause a loss or breach target.',
    0,
    0,
    0,
    T,
    true
  );

  const scenarios = [scenarioA, scenarioB, scenarioC, scenarioD];

  // Recommendation Engine
  let recommendedScenarioId: ProfitScenarioId = 'scenario-a';
  let recommendationReason = '';

  if (!hasCostData) {
    if (context.isSharingEligible && (input.allocationMode === 'Share Transport' || input.allocationMode === 'Automatic')) {
      recommendedScenarioId = 'scenario-b';
      recommendationReason = 'Provisional recommendation: 50/50 Transport Sharing (Scenario B). Profitability not verified — enter scooter procurement cost and selling price in Profit Protection to verify profit compliance.';
    } else {
      recommendedScenarioId = 'scenario-a';
      recommendationReason = 'Provisional recommendation: Scooter Discount (Scenario A). Profitability not verified — enter scooter procurement cost and selling price in Profit Protection to verify profit compliance.';
    }
  } else {
    // Check valid discount options meeting profit target
    const discountPool = context.isSharingEligible
      ? [scenarioA, scenarioB, scenarioC]
      : [scenarioA];
    const validDiscountOptions = discountPool.filter(s => s.isValid && s.meetsProfitTarget === true);

    if (validDiscountOptions.length > 0) {
      // Pick the discount option that yields highest company profit
      validDiscountOptions.sort((a, b) => (b.companyProfit || 0) - (a.companyProfit || 0));
      const best = validDiscountOptions[0];
      recommendedScenarioId = best.id;

      if (best.id === 'scenario-a') {
        if (scenarioB.isValid && scenarioB.companyProfit !== null && (best.companyProfit || 0) > scenarioB.companyProfit) {
          recommendationReason = `Recommended: Apply the discount to scooter prices because this option preserves a higher company profit (${formatINR(best.companyProfit ?? 0)}) than transport sharing (${formatINR(scenarioB.companyProfit ?? 0)}).`;
        } else {
          recommendationReason = `Recommended: Apply the discount to scooter prices (Scenario A) — achieves ${formatINR(best.companyProfit ?? 0)} company profit (${best.profitMarginPercent}% margin), satisfying the ${minProfitRequirementText}.`;
        }
      } else if (best.id === 'scenario-b') {
        if (scenarioA.companyProfit !== null && (best.companyProfit || 0) > scenarioA.companyProfit) {
          recommendationReason = `Recommended: 50/50 Transport Sharing (Scenario B) because this option preserves a higher company profit (${formatINR(best.companyProfit ?? 0)}) than scooter discount (${formatINR(scenarioA.companyProfit ?? 0)}) while supporting dealer freight.`;
        } else {
          recommendationReason = `Recommended: 50/50 Transport Sharing (Scenario B) — achieves ${formatINR(best.companyProfit ?? 0)} company profit (${best.profitMarginPercent}% margin), satisfying the ${minProfitRequirementText}.`;
        }
      } else {
        recommendationReason = `Recommended: Combined Allocation (Scenario C) — balances freight absorption with vehicle invoice discount to maximize net company profit (${formatINR(best.companyProfit ?? 0)}).`;
      }
    } else {
      // No discount option meets the target
      recommendedScenarioId = 'scenario-d';
      if (scenarioD.meetsProfitTarget) {
        recommendationReason = `Discount not recommended: This order does not meet the configured profit requirement with discounts applied. Baseline no-discount option preserves ${formatINR(scenarioD.companyProfit ?? 0)} profit (${scenarioD.profitMarginPercent}% margin).`;
      } else {
        recommendationReason = `Discount not recommended: This order does not meet the configured profit requirement even with zero discounts (Target: ${minProfitRequirementText}, Max possible profit: ${formatINR(scenarioD.companyProfit ?? 0)}).`;
      }
    }
  }

  // Active / Selected Scenario
  const selectedScenarioId = input.selectedScenarioId || recommendedScenarioId;
  const activeScenario = scenarios.find(s => s.id === selectedScenarioId) || scenarioA;

  let overallStatus: ProfitabilityStatus = 'Not Verified';
  if (!hasCostData) {
    overallStatus = 'Not Verified';
  } else if (input.selectedScenarioId === 'scenario-d' && activeScenario.meetsProfitTarget) {
    overallStatus = 'Verified';
  } else if (recommendedScenarioId === 'scenario-d') {
    overallStatus = 'Below Target';
  } else if (activeScenario.meetsProfitTarget) {
    overallStatus = 'Verified';
  } else {
    overallStatus = 'Below Target';
  }

  const totalCompanyCost = totalScooterCost !== null ? totalScooterCost + (totalBatteryCost || 0) + otherCompanyCosts : null;

  return {
    status: overallStatus,
    hasCostData,
    missingDataReasons,
    scenarios,
    recommendedScenarioId,
    recommendationReason,
    selectedScenarioId,
    activeScenario,
    minProfitRequirementText,
    targetProfitAmount: minProfitType === 'amount' ? targetProfitAmount : null,
    targetProfitMarginPercent: minProfitType === 'margin_percent' ? targetProfitMarginPercent : null,
    grossScooterRevenue,
    grossBatteryRevenue,
    totalScooterCost,
    totalBatteryCost,
    totalCompanyCost,
    otherCompanyCosts,
    gstTransportTreatment,
  };
}

/**
 * Helper to auto-allocate trucks based on order total scooters
 */
export function recommendTruckAllocation(
  totalScooters: number,
  truckConfigs: TruckConfig[]
): {
  trucks: { truck: TruckConfig; count: number }[];
  totalCapacity: number;
} {
  if (totalScooters <= 0) {
    return {
      trucks: [{ truck: truckConfigs[0], count: 1 }],
      totalCapacity: truckConfigs[0]?.capacity || 12,
    };
  }

  // Sort descending: 55, 32, 12
  const sorted = [...truckConfigs].sort((a, b) => b.capacity - a.capacity);
  let remaining = totalScooters;
  const result: { truck: TruckConfig; count: number }[] = [];
  let totalCapacity = 0;

  for (const truck of sorted) {
    if (remaining >= truck.capacity) {
      const count = Math.floor(remaining / truck.capacity);
      result.push({ truck, count });
      remaining -= count * truck.capacity;
      totalCapacity += count * truck.capacity;
    }
  }

  if (remaining > 0) {
    const ascending = [...truckConfigs].sort((a, b) => a.capacity - b.capacity);
    const chosen = ascending.find((t) => t.capacity >= remaining) || sorted[0];
    const existing = result.find((r) => r.truck.id === chosen.id);
    if (existing) {
      existing.count += 1;
    } else {
      result.push({ truck: chosen, count: 1 });
    }
    totalCapacity += chosen.capacity;
  }

  return {
    trucks: result,
    totalCapacity,
  };
}
