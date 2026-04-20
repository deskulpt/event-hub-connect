import { supabase } from "@/integrations/supabase/client";
import type {
  InvoiceFormInput,
  InvoiceRecord,
  PayoutFormInput,
  PayoutRecord,
  ReceiptFormInput,
  ReceiptRecord,
  TransactionFormInput,
  TransactionRecord,
} from "@/types/finance";

const dollarsToCents = (v: unknown): number => {
  if (v === null || v === undefined || v === "") return 0;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
};

// ---------- Transactions ----------
const txRow = (input: TransactionFormInput) => ({
  kind: input.kind,
  status: input.status,
  amount_cents: dollarsToCents(input.amount),
  occurred_on: input.occurred_on,
  description: input.description ? String(input.description) : null,
  counterparty: input.counterparty ? String(input.counterparty) : null,
  event_id: input.event_id ?? null,
});

export const listTransactions = async (ownerId: string): Promise<TransactionRecord[]> => {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("owner_id", ownerId)
    .order("occurred_on", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as TransactionRecord[];
};

export const createTransaction = async (input: TransactionFormInput, ownerId: string): Promise<TransactionRecord> => {
  const { data, error } = await supabase
    .from("transactions")
    .insert({ ...txRow(input), owner_id: ownerId })
    .select("*")
    .single();
  if (error) throw error;
  return data as TransactionRecord;
};

export const deleteTransaction = async (id: string): Promise<void> => {
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) throw error;
};

// ---------- Invoices ----------
const invoiceRow = (input: InvoiceFormInput) => {
  const subtotal = dollarsToCents(input.subtotal);
  const tax = dollarsToCents(input.tax);
  return {
    number: input.number,
    recipient_name: input.recipient_name,
    recipient_email: input.recipient_email ? String(input.recipient_email) : null,
    status: input.status,
    subtotal_cents: subtotal,
    tax_cents: tax,
    total_cents: subtotal + tax,
    issued_on: input.issued_on,
    due_on: input.due_on ? String(input.due_on) : null,
    notes: input.notes ? String(input.notes) : null,
    event_id: input.event_id ?? null,
  };
};

export const listInvoices = async (ownerId: string): Promise<InvoiceRecord[]> => {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("owner_id", ownerId)
    .order("issued_on", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as InvoiceRecord[];
};

export const createInvoice = async (input: InvoiceFormInput, ownerId: string): Promise<InvoiceRecord> => {
  const { data, error } = await supabase
    .from("invoices")
    .insert({ ...invoiceRow(input), owner_id: ownerId })
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as InvoiceRecord;
};

export const updateInvoiceStatus = async (id: string, status: InvoiceRecord["status"]): Promise<void> => {
  const patch: { status: InvoiceRecord["status"]; paid_on?: string } = { status };
  if (status === "paid") patch.paid_on = new Date().toISOString().slice(0, 10);
  const { error } = await supabase.from("invoices").update(patch).eq("id", id);
  if (error) throw error;
};

export const deleteInvoice = async (id: string): Promise<void> => {
  const { error } = await supabase.from("invoices").delete().eq("id", id);
  if (error) throw error;
};

// ---------- Receipts ----------
const receiptRow = (input: ReceiptFormInput) => ({
  vendor_name: input.vendor_name,
  amount_cents: dollarsToCents(input.amount),
  occurred_on: input.occurred_on,
  category: input.category ? String(input.category) : null,
  notes: input.notes ? String(input.notes) : null,
  file_url: input.file_url ? String(input.file_url) : null,
  event_id: input.event_id ?? null,
});

export const listReceipts = async (ownerId: string): Promise<ReceiptRecord[]> => {
  const { data, error } = await supabase
    .from("receipts")
    .select("*")
    .eq("owner_id", ownerId)
    .order("occurred_on", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ReceiptRecord[];
};

export const createReceipt = async (input: ReceiptFormInput, ownerId: string): Promise<ReceiptRecord> => {
  const { data, error } = await supabase
    .from("receipts")
    .insert({ ...receiptRow(input), owner_id: ownerId })
    .select("*")
    .single();
  if (error) throw error;
  return data as ReceiptRecord;
};

export const deleteReceipt = async (id: string): Promise<void> => {
  const { error } = await supabase.from("receipts").delete().eq("id", id);
  if (error) throw error;
};

// ---------- Payouts ----------
const payoutRow = (input: PayoutFormInput) => ({
  amount_cents: dollarsToCents(input.amount),
  status: input.status,
  expected_on: input.expected_on ? String(input.expected_on) : null,
  method: input.method ? String(input.method) : null,
  reference: input.reference ? String(input.reference) : null,
  notes: input.notes ? String(input.notes) : null,
});

export const listPayouts = async (ownerId: string): Promise<PayoutRecord[]> => {
  const { data, error } = await supabase
    .from("payouts")
    .select("*")
    .eq("owner_id", ownerId)
    .order("expected_on", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PayoutRecord[];
};

export const createPayout = async (input: PayoutFormInput, ownerId: string): Promise<PayoutRecord> => {
  const { data, error } = await supabase
    .from("payouts")
    .insert({ ...payoutRow(input), owner_id: ownerId })
    .select("*")
    .single();
  if (error) throw error;
  return data as PayoutRecord;
};

export const deletePayout = async (id: string): Promise<void> => {
  const { error } = await supabase.from("payouts").delete().eq("id", id);
  if (error) throw error;
};
