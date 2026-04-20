import { z } from "zod";

export const transactionKindValues = ["charge", "refund", "deposit", "fee", "payout", "expense"] as const;
export type TransactionKind = (typeof transactionKindValues)[number];

export const transactionStatusValues = ["pending", "succeeded", "failed", "refunded"] as const;
export type TransactionStatus = (typeof transactionStatusValues)[number];

export const invoiceStatusValues = ["draft", "sent", "paid", "overdue", "void"] as const;
export type InvoiceStatus = (typeof invoiceStatusValues)[number];

export const payoutStatusValues = ["scheduled", "in_transit", "paid", "failed"] as const;
export type PayoutStatus = (typeof payoutStatusValues)[number];

export interface TransactionRecord {
  id: string;
  owner_id: string;
  event_id: string | null;
  booking_id: string | null;
  kind: TransactionKind;
  status: TransactionStatus;
  amount_cents: number;
  currency: string;
  occurred_on: string;
  description: string | null;
  counterparty: string | null;
  created_at: string;
  updated_at: string;
}

export const transactionFormSchema = z.object({
  kind: z.enum(transactionKindValues).default("charge"),
  status: z.enum(transactionStatusValues).default("succeeded"),
  amount: z.coerce.number().min(0),
  occurred_on: z.string().min(1, "Date is required"),
  description: z.string().max(500).optional().or(z.literal("")),
  counterparty: z.string().max(160).optional().or(z.literal("")),
  event_id: z.string().uuid().optional().nullable(),
});
export type TransactionFormInput = z.infer<typeof transactionFormSchema>;

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price_cents: number;
}

export interface InvoiceRecord {
  id: string;
  owner_id: string;
  event_id: string | null;
  booking_id: string | null;
  number: string;
  recipient_name: string;
  recipient_email: string | null;
  status: InvoiceStatus;
  subtotal_cents: number;
  tax_cents: number;
  total_cents: number;
  currency: string;
  issued_on: string;
  due_on: string | null;
  paid_on: string | null;
  notes: string | null;
  line_items: InvoiceLineItem[];
  created_at: string;
  updated_at: string;
}

export const invoiceFormSchema = z.object({
  number: z.string().trim().min(1, "Invoice number is required").max(40),
  recipient_name: z.string().trim().min(2).max(160),
  recipient_email: z.string().email().optional().or(z.literal("")),
  status: z.enum(invoiceStatusValues).default("draft"),
  subtotal: z.coerce.number().min(0),
  tax: z.coerce.number().min(0).optional().or(z.literal("")),
  issued_on: z.string().min(1),
  due_on: z.string().optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
  event_id: z.string().uuid().optional().nullable(),
});
export type InvoiceFormInput = z.infer<typeof invoiceFormSchema>;

export interface ReceiptRecord {
  id: string;
  owner_id: string;
  event_id: string | null;
  vendor_name: string;
  amount_cents: number;
  currency: string;
  occurred_on: string;
  category: string | null;
  notes: string | null;
  file_url: string | null;
  created_at: string;
  updated_at: string;
}

export const receiptFormSchema = z.object({
  vendor_name: z.string().trim().min(2).max(160),
  amount: z.coerce.number().min(0),
  occurred_on: z.string().min(1),
  category: z.string().max(80).optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
  file_url: z.string().url().optional().or(z.literal("")),
  event_id: z.string().uuid().optional().nullable(),
});
export type ReceiptFormInput = z.infer<typeof receiptFormSchema>;

export interface PayoutRecord {
  id: string;
  owner_id: string;
  amount_cents: number;
  currency: string;
  status: PayoutStatus;
  expected_on: string | null;
  paid_on: string | null;
  method: string | null;
  reference: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const payoutFormSchema = z.object({
  amount: z.coerce.number().min(0),
  status: z.enum(payoutStatusValues).default("scheduled"),
  expected_on: z.string().optional().or(z.literal("")),
  method: z.string().max(80).optional().or(z.literal("")),
  reference: z.string().max(160).optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
});
export type PayoutFormInput = z.infer<typeof payoutFormSchema>;

export const formatCurrency = (cents: number | null | undefined, currency = "USD"): string => {
  const value = (cents ?? 0) / 100;
  return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
};
