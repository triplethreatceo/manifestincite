/**
 * Financial fields that must be hidden from staff users.
 * Used by API routes and server components to strip data before sending.
 */
export const FINANCIAL_FIELDS = [
  'rate',
  'rate_type',
  'rate_per_mile',
  'dispatch_fee_percent',
  'dispatch_fee_amount',
  'driver_pay',
  'fuel_cost',
  'monthly_service_fee',
  'amount',
  'amount_paid',
  'balance',
  'cost',
] as const;

/** Remove financial fields from an object (or array of objects) */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function stripFinancialFields<T extends Record<string, any>>(data: T): T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function stripFinancialFields<T extends Record<string, any>>(data: T[]): T[];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function stripFinancialFields<T extends Record<string, any>>(data: T | T[]): T | T[] {
  if (Array.isArray(data)) return data.map((item) => stripFinancialFields(item));
  const result = { ...data };
  for (const field of FINANCIAL_FIELDS) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (result as any)[field];
  }
  return result;
}