export interface InvoiceLineItem {
  id?: number;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  line_order?: number;
}

export interface Invoice {
  id?: number;
  invoice_number?: string;
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  client_name: string;
  client_email: string;
  client_phone?: string;
  client_address?: string;
  issue_date: string;
  due_date?: string;
  paid_date?: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  notes?: string;
  line_items: InvoiceLineItem[];
  created_by?: number;
  created_at?: string;
  updated_at?: string;
}

export interface InvoiceListItem {
  id: number;
  invoice_number: string;
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  client_name: string;
  client_email: string;
  total: number;
  issue_date: string;
  created_at: string;
}

export interface InvoiceStats {
  total: number;
  paid: number;
  sent: number;
  draft: number;
  totalRevenue: number;
  paidRevenue: number;
  pendingRevenue: number;
}
