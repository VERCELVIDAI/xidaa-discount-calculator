import { describe, expect, it } from 'vitest';
import { calculateOrderFinancials } from './calculations';
import { DEFAULT_APP_CONFIG } from '../data/defaultConfig';
import type { AppConfig, OrderInput } from '../types';

describe('Xidaa Discount Calculator - Updated Transport Formula & Sharing Tests', () => {
  it('Prompt Example: 12-scooter truck travelling 1,000 km (Exact Match)', () => {
    const input: OrderInput = {
      customerName: 'Aodn Motors Dealership',
      orderRef: 'XD-EX-1000KM',
      orderDate: '2026-10-23',
      scooterItems: [
        { id: '1', modelId: 'x-torvo', modelName: 'X-Torvo', category: 'Other Model', quantity: 12, unitPrice: 50000 },
      ],
      batteryIncluded: false,
      batteryItems: [],
      transportDistanceKm: 1000,
      truckAllocations: [
        { truckId: 'truck-12', truckName: '12-Scooter Truck', capacity: 12, ratePerKm: 40, count: 1 },
      ],
      allocationMode: 'Automatic',
    };

    const res = calculateOrderFinancials(input, DEFAULT_APP_CONFIG);

    // Step 1: Base transport = 1,000 km × ₹40/km = ₹40,000
    expect(res.baseTransportCost).toBe(40000);
    // Step 2: Additional 10% charge = ₹4,000
    expect(res.transportExtraPercent).toBe(10);
    expect(res.transportExtraCharge).toBe(4000);
    // Step 3: Transport subtotal = ₹44,000
    expect(res.transportSubtotal).toBe(44000);
    // Step 4: GST at 5% on ₹44,000 = ₹2,200
    expect(res.transportGstPercent).toBe(5);
    expect(res.transportGstAmount).toBe(2200);
    // Step 5: Final transport payable = ₹46,200
    expect(res.totalTransportCost).toBe(46200);
    // 50% threshold H = ₹23,100
    expect(res.halfTransportCost).toBe(23100);
  });

  it('All 3 Truck Rates: 32-scooter truck rate (₹55/km) for 1,000 km', () => {
    const input: OrderInput = {
      customerName: 'Test 32-Truck',
      orderRef: 'XD-TRUCK-32',
      orderDate: '2026-10-23',
      scooterItems: [
        { id: '1', modelId: 'x-torvo', modelName: 'X-Torvo', category: 'Other Model', quantity: 32 },
      ],
      batteryIncluded: false,
      batteryItems: [],
      transportDistanceKm: 1000,
      truckAllocations: [
        { truckId: 'truck-32', truckName: '32-Scooter Truck', capacity: 32, ratePerKm: 55, count: 1 },
      ],
      allocationMode: 'Automatic',
    };

    const res = calculateOrderFinancials(input, DEFAULT_APP_CONFIG);

    // Step 1: Base = 1,000 × 55 = ₹55,000
    expect(res.baseTransportCost).toBe(55000);
    // Step 2: 10% Extra = ₹5,500
    expect(res.transportExtraCharge).toBe(5500);
    // Step 3: Subtotal = ₹60,500
    expect(res.transportSubtotal).toBe(60500);
    // Step 4: 5% GST = ₹3,025
    expect(res.transportGstAmount).toBe(3025);
    // Step 5: Final = ₹63,525
    expect(res.totalTransportCost).toBe(63525);
  });

  it('All 3 Truck Rates: 55-scooter truck rate (₹65/km) for 1,000 km', () => {
    const input: OrderInput = {
      customerName: 'Test 55-Truck',
      orderRef: 'XD-TRUCK-55',
      orderDate: '2026-10-23',
      scooterItems: [
        { id: '1', modelId: 'x-tank', modelName: 'X-Tank', category: 'Other Model', quantity: 55 },
      ],
      batteryIncluded: false,
      batteryItems: [],
      transportDistanceKm: 1000,
      truckAllocations: [
        { truckId: 'truck-55', truckName: '55-Scooter Truck', capacity: 55, ratePerKm: 65, count: 1 },
      ],
      allocationMode: 'Automatic',
    };

    const res = calculateOrderFinancials(input, DEFAULT_APP_CONFIG);

    // Step 1: Base = 1,000 × 65 = ₹65,000
    expect(res.baseTransportCost).toBe(65000);
    // Step 2: 10% Extra = ₹6,500
    expect(res.transportExtraCharge).toBe(6500);
    // Step 3: Subtotal = ₹71,500
    expect(res.transportSubtotal).toBe(71500);
    // Step 4: 5% GST = ₹3,575
    expect(res.transportGstAmount).toBe(3575);
    // Step 5: Final = ₹75,075
    expect(res.totalTransportCost).toBe(75075);
  });

  it('Zero distance handling: all 5 values must be 0 and sharing ineligible', () => {
    const input: OrderInput = {
      customerName: 'Local Customer',
      orderRef: 'XD-ZERO-KM',
      orderDate: '2026-10-23',
      scooterItems: [
        { id: '1', modelId: 'x-torvo', modelName: 'X-Torvo', category: 'Other Model', quantity: 10 },
      ],
      batteryIncluded: false,
      batteryItems: [],
      transportDistanceKm: 0,
      truckAllocations: [
        { truckId: 'truck-12', truckName: '12-Scooter Truck', capacity: 12, ratePerKm: 40, count: 1 },
      ],
      allocationMode: 'Automatic',
    };

    const res = calculateOrderFinancials(input, DEFAULT_APP_CONFIG);

    expect(res.baseTransportCost).toBe(0);
    expect(res.transportExtraCharge).toBe(0);
    expect(res.transportSubtotal).toBe(0);
    expect(res.transportGstAmount).toBe(0);
    expect(res.totalTransportCost).toBe(0);
    expect(res.halfTransportCost).toBe(0);
    expect(res.transportSharingEligible).toBe(false);
    expect(res.companyTransportSupport).toBe(0);
    expect(res.customerTransportPayment).toBe(0);
    expect(res.actualScooterDiscountApplied).toBe(10000);
  });

  it('Multiple trucks calculation without double-counting', () => {
    // 1x 12-truck (₹40/km) + 1x 32-truck (₹55/km) for 500 km
    const input: OrderInput = {
      customerName: 'Multi Truck Fleet Dealership',
      orderRef: 'XD-MULTI-TRUCK',
      orderDate: '2026-10-23',
      scooterItems: [
        { id: '1', modelId: 'x-torvo', modelName: 'X-Torvo', category: 'Other Model', quantity: 44 },
      ],
      batteryIncluded: false,
      batteryItems: [],
      transportDistanceKm: 500,
      truckAllocations: [
        { truckId: 'truck-12', truckName: '12-Scooter Truck', capacity: 12, ratePerKm: 40, count: 1 },
        { truckId: 'truck-32', truckName: '32-Scooter Truck', capacity: 32, ratePerKm: 55, count: 1 },
      ],
      allocationMode: 'Automatic',
    };

    const res = calculateOrderFinancials(input, DEFAULT_APP_CONFIG);

    // Base = (500 × 40) + (500 × 55) = 20,000 + 27,500 = ₹47,500
    expect(res.baseTransportCost).toBe(47500);
    // 10% Extra = ₹4,750
    expect(res.transportExtraCharge).toBe(4750);
    // Subtotal = ₹52,250
    expect(res.transportSubtotal).toBe(52250);
    // 5% GST = 52,250 × 0.05 = ₹2,612.50
    expect(res.transportGstAmount).toBe(2612.5);
    // Final Transport Cost = 52,250 + 2,612.50 = ₹54,862.50
    expect(res.totalTransportCost).toBe(54862.5);
  });

  it('Transport-sharing eligibility check: S >= H (Eligible)', () => {
    // 24 Other Model scooters (S = 24,000), 12-truck, 1,000 km (Final = ₹46,200, H = ₹23,100)
    // S (24,000) >= H (23,100) -> Eligible!
    const input: OrderInput = {
      customerName: 'Eligible Partner',
      orderRef: 'XD-SHARING-ELIGIBLE',
      orderDate: '2026-10-23',
      scooterItems: [
        { id: '1', modelId: 'x-torvo', modelName: 'X-Torvo', category: 'Other Model', quantity: 24, unitPrice: 50000 },
      ],
      batteryIncluded: false,
      batteryItems: [],
      transportDistanceKm: 1000,
      truckAllocations: [
        { truckId: 'truck-12', truckName: '12-Scooter Truck', capacity: 12, ratePerKm: 40, count: 1 },
      ],
      allocationMode: 'Automatic',
    };

    const res = calculateOrderFinancials(input, DEFAULT_APP_CONFIG);

    expect(res.scooterDiscountAllowance).toBe(24000);
    expect(res.totalTransportCost).toBe(46200);
    expect(res.halfTransportCost).toBe(23100);
    expect(res.transportSharingEligible).toBe(true);
    expect(res.transportSharingApplied).toBe(true);
    expect(res.companyTransportSupport).toBe(23100);
    expect(res.customerTransportPayment).toBe(23100);
    expect(res.remainingScooterDiscount).toBe(900); // 24,000 - 23,100
    expect(res.actualScooterDiscountApplied).toBe(900);
    // Final payable: 24 * 50,000 = 12,00,000 - 900 + 23,100 = 12,22,200
    expect(res.finalPayableAmount).toBe(1222200);
  });

  it('Transport-sharing eligibility check: S < H (Ineligible)', () => {
    // 10 DL Model scooters (S = 5,000), 12-truck, 1,000 km (Final = ₹46,200, H = ₹23,100)
    // S (5,000) < H (23,100) -> Ineligible!
    const input: OrderInput = {
      customerName: 'Ineligible Dealership',
      orderRef: 'XD-SHARING-INELIGIBLE',
      orderDate: '2026-10-23',
      scooterItems: [
        { id: '1', modelId: 'x-double-light', modelName: 'X-Double Light', category: 'DL Model', quantity: 10 },
      ],
      batteryIncluded: false,
      batteryItems: [],
      transportDistanceKm: 1000,
      truckAllocations: [
        { truckId: 'truck-12', truckName: '12-Scooter Truck', capacity: 12, ratePerKm: 40, count: 1 },
      ],
      allocationMode: 'Automatic',
    };

    const res = calculateOrderFinancials(input, DEFAULT_APP_CONFIG);

    expect(res.scooterDiscountAllowance).toBe(5000);
    expect(res.totalTransportCost).toBe(46200);
    expect(res.halfTransportCost).toBe(23100);
    expect(res.transportSharingEligible).toBe(false);
    expect(res.transportSharingApplied).toBe(false);
    expect(res.companyTransportSupport).toBe(0);
    expect(res.customerTransportPayment).toBe(46200);
    expect(res.actualScooterDiscountApplied).toBe(5000);
  });

  it('Battery discount remains strictly separate from transport sharing', () => {
    // 0 scooters, 20 batteries @ ₹500 discount = ₹10,000 battery allowance. 100 km, 12-truck.
    const input: OrderInput = {
      customerName: 'Battery Distributor',
      orderRef: 'XD-BATT-ONLY',
      orderDate: '2026-10-23',
      scooterItems: [],
      batteryIncluded: true,
      batteryItems: [
        { id: 'b1', variant: '60V 45Ah LFP', quantity: 20, unitPrice: 35000, eligibleDiscountQuantity: 20 },
      ],
      transportDistanceKm: 100,
      truckAllocations: [
        { truckId: 'truck-12', truckName: '12-Scooter Truck', capacity: 12, ratePerKm: 40, count: 1 },
      ],
      allocationMode: 'Automatic',
    };

    const res = calculateOrderFinancials(input, DEFAULT_APP_CONFIG);

    // 100 km @ ₹40 = ₹4,000 base + 10% (₹400) = ₹4,400 + 5% (₹220) = ₹4,620 final
    expect(res.totalTransportCost).toBe(4620);
    expect(res.halfTransportCost).toBe(2310);
    expect(res.scooterDiscountAllowance).toBe(0);
    expect(res.batteryDiscountAllowance).toBe(10000);
    // Battery allowance CANNOT fund transport sharing!
    expect(res.transportSharingEligible).toBe(false);
    expect(res.companyTransportSupport).toBe(0);
    expect(res.customerTransportPayment).toBe(4620);
    expect(res.actualBatteryDiscountApplied).toBe(10000);
  });

  it('Configurable transport settings: custom 15% extra and 18% GST', () => {
    const customConfig: AppConfig = {
      ...DEFAULT_APP_CONFIG,
      transportSettings: {
        extraChargePercent: 15,
        transportGstPercent: 18,
      },
    };

    const input: OrderInput = {
      customerName: 'Custom Surcharge Dealership',
      orderRef: 'XD-CUSTOM-SURCHARGE',
      orderDate: '2026-10-23',
      scooterItems: [
        { id: '1', modelId: 'x-torvo', modelName: 'X-Torvo', category: 'Other Model', quantity: 10 },
      ],
      batteryIncluded: false,
      batteryItems: [],
      transportDistanceKm: 100,
      truckAllocations: [
        { truckId: 'truck-12', truckName: '12-Scooter Truck', capacity: 12, ratePerKm: 40, count: 1 },
      ],
      allocationMode: 'Automatic',
    };

    const res = calculateOrderFinancials(input, customConfig);

    // Base = 100 × 40 = ₹4,000
    expect(res.baseTransportCost).toBe(4000);
    // 15% Extra = ₹600
    expect(res.transportExtraPercent).toBe(15);
    expect(res.transportExtraCharge).toBe(600);
    // Subtotal = ₹4,600
    expect(res.transportSubtotal).toBe(4600);
    // 18% GST on ₹4,600 = ₹828
    expect(res.transportGstPercent).toBe(18);
    expect(res.transportGstAmount).toBe(828);
    // Final = ₹5,428
    expect(res.totalTransportCost).toBe(5428);
  });

  it('No double-counting of GST on transport in downstream order payable', () => {
    const configWithExclusiveGst: AppConfig = {
      ...DEFAULT_APP_CONFIG,
      taxSettings: {
        gstTreatment: 'Exclusive',
        gstRatePercent: 5,
      },
    };

    const input: OrderInput = {
      customerName: 'GST Dealership',
      orderRef: 'XD-GST-TEST',
      orderDate: '2026-10-23',
      scooterItems: [
        { id: '1', modelId: 'x-torvo', modelName: 'X-Torvo', category: 'Other Model', quantity: 10, unitPrice: 50000 },
      ],
      batteryIncluded: false,
      batteryItems: [],
      transportDistanceKm: 100,
      truckAllocations: [
        { truckId: 'truck-12', truckName: '12-Scooter Truck', capacity: 12, ratePerKm: 40, count: 1 },
      ],
      allocationMode: 'Full Scooter Discount', // Full discount on vehicle, full transport paid by customer
    };

    const res = calculateOrderFinancials(input, configWithExclusiveGst);

    // Gross scooters = 10 × 50,000 = ₹5,00,000
    // Scooter discount = 10 × 1,000 = ₹10,000
    // Net scooters = ₹4,90,000
    // Product GST (5% of net scooters) = ₹24,500
    // Transport: 100 km @ ₹40 = ₹4,000 Base + ₹400 (10%) = ₹4,400 + ₹220 (5% transport GST) = ₹4,620 Final Transport Cost
    // Notice that product GST is ₹24,500, NOT applied on transport.
    // Final payable = ₹4,90,000 (net scooters) + ₹24,500 (scooter GST) + ₹4,620 (transport with its own GST) = ₹5,19,120
    expect(res.baseTransportCost).toBe(4000);
    expect(res.transportGstAmount).toBe(220);
    expect(res.totalTransportCost).toBe(4620);
    expect(res.customerTransportPayment).toBe(4620);
    expect(res.gstAmount).toBe(24500); // 5% on 4,90,000
    expect(res.finalPayableAmount).toBe(519120);
  });
});

describe('Smart Profit Protection Engine Tests', () => {
  it('Missing costs or selling prices: correctly returns Not Verified without inventing data', () => {
    const input: OrderInput = {
      customerName: 'No Cost Dealership',
      orderRef: 'XD-NO-COST',
      orderDate: '2026-10-23',
      scooterItems: [
        { id: '1', modelId: 'x-torvo', modelName: 'X-Torvo', category: 'Other Model', quantity: 10 },
      ],
      batteryIncluded: false,
      batteryItems: [],
      transportDistanceKm: 200,
      truckAllocations: [
        { truckId: 'truck-12', truckName: '12-Scooter Truck', capacity: 12, ratePerKm: 40, count: 1 },
      ],
      allocationMode: 'Automatic',
      // No profitabilityInput provided
    };

    const res = calculateOrderFinancials(input, DEFAULT_APP_CONFIG);
    const pp = res.profitProtection;

    expect(pp.status).toBe('Not Verified');
    expect(pp.hasCostData).toBe(false);
    expect(pp.missingDataReasons.length).toBeGreaterThan(0);
    expect(pp.activeScenario.companyProfit).toBeNull();
    expect(pp.recommendationReason).toContain('Provisional');
    expect(pp.recommendationReason).toContain('Profitability not verified');
  });

  it('Scooter discount is more profitable than transport sharing (S < H ineligible)', () => {
    // 10 Other Model scooters: S = ₹10,000.
    // 1000 km on 12-truck: Base ₹40,000 + 10% (4,000) = 44,000 + 5% GST (2,200) = ₹46,200. H = ₹23,100.
    // S (10,000) < H (23,100): Transport sharing is ineligible.
    const input: OrderInput = {
      customerName: 'High Distance Dealership',
      orderRef: 'XD-PP-SCOOT-BEST',
      orderDate: '2026-10-23',
      scooterItems: [
        { id: '1', modelId: 'x-torvo', modelName: 'X-Torvo', category: 'Other Model', quantity: 10, unitPrice: 50000 },
      ],
      batteryIncluded: false,
      batteryItems: [],
      transportDistanceKm: 1000,
      truckAllocations: [
        { truckId: 'truck-12', truckName: '12-Scooter Truck', capacity: 12, ratePerKm: 40, count: 1 },
      ],
      allocationMode: 'Automatic',
      profitabilityInput: {
        scooterUnitCost: 35000, // 10 * 35,000 = ₹3,50,000 cost
        minProfitType: 'margin_percent',
        minProfitMarginPercent: 10, // 10% target
      },
    };

    const res = calculateOrderFinancials(input, DEFAULT_APP_CONFIG);
    const pp = res.profitProtection;

    expect(pp.hasCostData).toBe(true);
    expect(pp.recommendedScenarioId).toBe('scenario-a');
    expect(pp.recommendationReason).toContain('Recommended: Apply the discount to scooter prices');
    // Scenario A: Revenue = 5,00,000 - 10,000 = 4,90,000. Cost = 3,50,000. Company profit = 1,40,000. Margin = 1,40,000 / (4,90,000 + 44,000) = 26.22%
    expect(pp.scenarios[0].companyProfit).toBe(140000);
    expect(pp.scenarios[0].meetsProfitTarget).toBe(true);
    // Scenario B is ineligible because S < H
    expect(pp.scenarios[1].isValid).toBe(false);
  });

  it('Transport sharing is more profitable than scooter discount when freight ITC saves money', () => {
    // 20 Other Model scooters: S = ₹20,000.
    // 100 km on 12-truck: Base ₹4,000, Subtotal ₹4,400, Final ₹4,620. H = ₹2,310.
    // S (20,000) >= H (2,310): Transport sharing is eligible!
    // In Scenario B:
    // Support H = 2,310. Company freight cost excluding 5% GST = 2,200.
    // Remaining scooter discount = 20,000 - 2,310 = ₹17,690.
    // Net discount + company freight = 17,690 + 2,200 = ₹19,890.
    // In Scenario A:
    // Full discount = ₹20,000.
    // Company profit in Scenario B is ₹110 HIGHER than Scenario A (19,890 < 20,000 expense)!
    const input: OrderInput = {
      customerName: 'Short Distance Partner',
      orderRef: 'XD-PP-SHARING-BEST',
      orderDate: '2026-10-23',
      scooterItems: [
        { id: '1', modelId: 'x-torvo', modelName: 'X-Torvo', category: 'Other Model', quantity: 20, unitPrice: 50000 },
      ],
      batteryIncluded: false,
      batteryItems: [],
      transportDistanceKm: 100,
      truckAllocations: [
        { truckId: 'truck-12', truckName: '12-Scooter Truck', capacity: 12, ratePerKm: 40, count: 1 },
      ],
      allocationMode: 'Automatic',
      profitabilityInput: {
        scooterUnitCost: 35000,
        minProfitType: 'margin_percent',
        minProfitMarginPercent: 10,
      },
    };

    const res = calculateOrderFinancials(input, DEFAULT_APP_CONFIG);
    const pp = res.profitProtection;

    expect(pp.hasCostData).toBe(true);
    // Scenario B preserves higher profit than Scenario A!
    expect(pp.scenarios[1].companyProfit).toBeGreaterThan(pp.scenarios[0].companyProfit!);
    expect(pp.recommendedScenarioId).toBe('scenario-b');
    expect(pp.recommendationReason).toContain('Recommended: 50/50 Transport Sharing');
  });

  it('Neither discount option meets minimum profit requirement: recommends Scenario D (No Discount)', () => {
    // 10 DL scooters: S = 10 * 500 = ₹5,000.
    // Selling price: ₹38,000. Cost: ₹36,000.
    // Gross margin without discount = 10 * (38,000 - 36,000) = ₹20,000.
    // Target minimum profit = ₹18,000.
    // With discount S (₹5,000): profit is ₹15,000, falling ₹3,000 below target!
    const input: OrderInput = {
      customerName: 'Low Margin Dealership',
      orderRef: 'XD-PP-LOW-MARGIN',
      orderDate: '2026-10-23',
      scooterItems: [
        { id: '1', modelId: 'x-single-light', modelName: 'X-Single Light', category: 'DL Model', quantity: 10, unitPrice: 38000 },
      ],
      batteryIncluded: false,
      batteryItems: [],
      transportDistanceKm: 100,
      truckAllocations: [
        { truckId: 'truck-12', truckName: '12-Scooter Truck', capacity: 12, ratePerKm: 40, count: 1 },
      ],
      allocationMode: 'Automatic',
      profitabilityInput: {
        scooterUnitCost: 36000,
        minProfitType: 'amount',
        minProfitAmount: 18000, // Requires at least ₹18,000 profit
      },
    };

    const res = calculateOrderFinancials(input, DEFAULT_APP_CONFIG);
    const pp = res.profitProtection;

    expect(pp.hasCostData).toBe(true);
    // Discount scenarios fall below target
    expect(pp.scenarios[0].meetsProfitTarget).toBe(false);
    expect(pp.scenarios[1].meetsProfitTarget).toBe(false);
    // No Discount (Scenario D) meets target with ₹20,000
    expect(pp.scenarios[3].meetsProfitTarget).toBe(true);
    expect(pp.scenarios[3].companyProfit).toBe(20000);
    // Recommended is Scenario D
    expect(pp.recommendedScenarioId).toBe('scenario-d');
    expect(pp.recommendationReason).toContain('Discount not recommended: This order does not meet the configured profit requirement');
  });

  it('Battery discount reduces profit below the required threshold', () => {
    // Scooters alone: 10 DL @ 40,000. Cost = 35,000. Gross profit = 50,000. Discount = 5,000. Net profit = 45,000.
    // Batteries: 10 batteries @ 15,000. Cost = 14,800. Gross profit = 2,000.
    // Battery discount: 10 * 500 = ₹5,000.
    // Battery profit becomes 2,000 - 5,000 = -₹3,000!
    // Total profit = 45,000 - 3,000 = ₹42,000.
    // Target = ₹44,000.
    const input: OrderInput = {
      customerName: 'Battery Impact Dealership',
      orderRef: 'XD-PP-BATT-IMPACT',
      orderDate: '2026-10-23',
      scooterItems: [
        { id: '1', modelId: 'x-single-light', modelName: 'X-Single Light', category: 'DL Model', quantity: 10, unitPrice: 40000 },
      ],
      batteryIncluded: true,
      batteryItems: [
        { id: 'b1', variant: '60V 30Ah LFP', quantity: 10, unitPrice: 15000, eligibleDiscountQuantity: 10 },
      ],
      transportDistanceKm: 0,
      truckAllocations: [],
      allocationMode: 'Automatic',
      profitabilityInput: {
        scooterUnitCost: 35000,
        batteryUnitCost: 14800,
        minProfitType: 'amount',
        minProfitAmount: 44000,
      },
    };

    const res = calculateOrderFinancials(input, DEFAULT_APP_CONFIG);
    const pp = res.profitProtection;

    expect(pp.hasCostData).toBe(true);
    // Battery discount of ₹5,000 reduces total profit below ₹44,000
    expect(pp.scenarios[0].companyProfit).toBe(42000);
    expect(pp.scenarios[0].meetsProfitTarget).toBe(false);
    expect(pp.status).toBe('Below Target');
  });

  it('Discount allowances are never exceeded or double-counted across scenarios', () => {
    const input: OrderInput = {
      customerName: 'Integrity Check Dealership',
      orderRef: 'XD-INTEGRITY',
      orderDate: '2026-10-23',
      scooterItems: [
        { id: '1', modelId: 'x-torvo', modelName: 'X-Torvo', category: 'Other Model', quantity: 15, unitPrice: 50000 },
      ],
      batteryIncluded: true,
      batteryItems: [
        { id: 'b1', variant: '60V 30Ah LFP', quantity: 10, unitPrice: 20000, eligibleDiscountQuantity: 10 },
      ],
      transportDistanceKm: 500,
      truckAllocations: [
        { truckId: 'truck-32', truckName: '32-Scooter Truck', capacity: 32, ratePerKm: 55, count: 1 },
      ],
      allocationMode: 'Automatic',
      profitabilityInput: {
        scooterUnitCost: 38000,
        batteryUnitCost: 16000,
      },
    };

    const res = calculateOrderFinancials(input, DEFAULT_APP_CONFIG);
    const S = res.scooterDiscountAllowance; // 15 * 1000 = 15000
    const B = res.batteryDiscountAllowance; // 10 * 500 = 5000
    const totalBudget = S + B; // 20000

    res.profitProtection.scenarios.forEach((scenario) => {
      // Total customer discount benefit must NEVER exceed total budget
      expect(scenario.totalDiscountBenefit).toBeLessThanOrEqual(totalBudget);
      // Scooter discount + transport support must never exceed scooter allowance S
      expect(scenario.scooterDiscountApplied + scenario.companyTransportSupport).toBeLessThanOrEqual(S);
      // Battery discount must never exceed B
      expect(scenario.batteryDiscountApplied).toBeLessThanOrEqual(B);
    });
  });
});
