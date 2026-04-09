import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '../../utils/api';
import { Save, Plus, X, Download, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Invoice, InvoiceLineItem } from '../../types/invoice';
import { generateInvoicePDF } from '../../utils/pdfGenerator';
import { useContent } from '../../contexts/ContentContext';

export default function InvoiceEditor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { settings } = useContent();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [invoice, setInvoice] = useState<Invoice>({
    status: 'draft',
    client_name: '',
    client_email: '',
    client_phone: '',
    client_address: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: '',
    tax_rate: 21,
    subtotal: 0,
    tax_amount: 0,
    total: 0,
    notes: '',
    line_items: [{ description: '', quantity: 1, unit_price: 0, amount: 0 }],
  });

  // Load invoice if editing
  useEffect(() => {
    if (id) {
      loadInvoice();
    }
  }, [id]);

  // Recalculate totals whenever line items or tax rate change
  useEffect(() => {
    calculateTotals();
  }, [invoice.line_items, invoice.tax_rate]);

  const loadInvoice = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getInvoice(parseInt(id!));
      setInvoice(data);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to load invoice',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateLineAmount = (quantity: number, unit_price: number): number => {
    return quantity * unit_price;
  };

  const calculateTotals = () => {
    const subtotal = invoice.line_items.reduce((sum, item) => sum + item.amount, 0);
    const tax_amount = subtotal * (invoice.tax_rate / 100);
    const total = subtotal + tax_amount;

    setInvoice((prev) => ({
      ...prev,
      subtotal,
      tax_amount,
      total,
    }));
  };

  const updateLineItem = (index: number, field: keyof InvoiceLineItem, value: any) => {
    const newLineItems = [...invoice.line_items];
    newLineItems[index] = {
      ...newLineItems[index],
      [field]: value,
    };

    // Recalculate amount if quantity or unit_price changed
    if (field === 'quantity' || field === 'unit_price') {
      const quantity = field === 'quantity' ? value : newLineItems[index].quantity;
      const unit_price = field === 'unit_price' ? value : newLineItems[index].unit_price;
      newLineItems[index].amount = calculateLineAmount(quantity, unit_price);
    }

    setInvoice((prev) => ({
      ...prev,
      line_items: newLineItems,
    }));
  };

  const addLineItem = () => {
    setInvoice((prev) => ({
      ...prev,
      line_items: [...prev.line_items, { description: '', quantity: 1, unit_price: 0, amount: 0 }],
    }));
  };

  const removeLineItem = (index: number) => {
    if (invoice.line_items.length === 1) {
      setMessage({ type: 'error', text: 'At least one line item is required' });
      return;
    }

    setInvoice((prev) => ({
      ...prev,
      line_items: prev.line_items.filter((_, i) => i !== index),
    }));
  };

  const validateInvoice = (): boolean => {
    if (!invoice.client_name.trim()) {
      setMessage({ type: 'error', text: 'Client name is required' });
      return false;
    }

    if (!invoice.client_email.trim()) {
      setMessage({ type: 'error', text: 'Client email is required' });
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(invoice.client_email)) {
      setMessage({ type: 'error', text: 'Invalid email format' });
      return false;
    }

    if (invoice.line_items.length === 0) {
      setMessage({ type: 'error', text: 'At least one line item is required' });
      return false;
    }

    // Validate line items
    for (let i = 0; i < invoice.line_items.length; i++) {
      const item = invoice.line_items[i];
      if (!item.description.trim()) {
        setMessage({ type: 'error', text: `Line item ${i + 1}: Description is required` });
        return false;
      }
      if (item.quantity <= 0) {
        setMessage({ type: 'error', text: `Line item ${i + 1}: Quantity must be greater than 0` });
        return false;
      }
      if (item.unit_price < 0) {
        setMessage({ type: 'error', text: `Line item ${i + 1}: Unit price cannot be negative` });
        return false;
      }
    }

    return true;
  };

  const handleSave = async (status: 'draft' | 'sent') => {
    if (!validateInvoice()) {
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const invoiceData = {
        ...invoice,
        status,
      };

      if (id) {
        // Update status only (since there's no full update endpoint)
        await adminApi.updateInvoiceStatus(parseInt(id), status);
        setMessage({ type: 'success', text: `Invoice ${status === 'draft' ? 'saved as draft' : 'marked as sent'}!` });
      } else {
        // Create new invoice
        const created = await adminApi.createInvoice({
          invoice: invoiceData,
          lineItems: invoice.line_items,
        });
        setMessage({ type: 'success', text: `Invoice ${status === 'draft' ? 'saved as draft' : 'created and marked as sent'}!` });

        // Navigate to edit view of the newly created invoice
        setTimeout(() => {
          navigate(`/admin/invoices/${created.id}`);
        }, 1500);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save invoice',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!invoice.invoice_number) {
      setMessage({ type: 'error', text: 'Please save the invoice before downloading PDF' });
      return;
    }

    if (!settings) {
      setMessage({ type: 'error', text: 'Settings not loaded' });
      return;
    }

    try {
      generateInvoicePDF(invoice, settings);
      setMessage({ type: 'success', text: 'PDF downloaded successfully!' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to generate PDF',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-zinc-400">Loading invoice...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/invoices')}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {id ? `Edit Invoice #${invoice.invoice_number}` : 'New Invoice'}
            </h1>
            <p className="text-zinc-400">
              {id ? 'View and update invoice details' : 'Create a new invoice for your client'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {invoice.invoice_number && (
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          )}
          <button
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            onClick={() => handleSave('sent')}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            <CheckCircle2 className="w-5 h-5" />
            {saving ? 'Saving...' : 'Mark as Sent'}
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`flex items-center gap-2 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/20 text-green-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <p className="text-sm">{message.text}</p>
        </div>
      )}

      {/* Invoice Form */}
      <div className="space-y-6">
        {/* Client Section */}
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Client Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Client Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={invoice.client_name}
                onChange={(e) => setInvoice({ ...invoice, client_name: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Client Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={invoice.client_email}
                onChange={(e) => setInvoice({ ...invoice, client_email: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Client Phone</label>
              <input
                type="tel"
                value={invoice.client_phone || ''}
                onChange={(e) => setInvoice({ ...invoice, client_phone: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white"
                placeholder="+32 123 456 789"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-400 mb-2">Client Address</label>
              <textarea
                value={invoice.client_address || ''}
                onChange={(e) => setInvoice({ ...invoice, client_address: e.target.value })}
                rows={3}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white resize-none"
                placeholder="123 Main Street, Brussels, 1000"
              />
            </div>
          </div>
        </div>

        {/* Dates Section */}
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Dates</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Issue Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={invoice.issue_date}
                onChange={(e) => setInvoice({ ...invoice, issue_date: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Due Date</label>
              <input
                type="date"
                value={invoice.due_date || ''}
                onChange={(e) => setInvoice({ ...invoice, due_date: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white"
              />
            </div>
          </div>
        </div>

        {/* Line Items Section */}
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Line Items</h2>
            <button
              onClick={addLineItem}
              className="flex items-center gap-2 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>

          <div className="space-y-3">
            {invoice.line_items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-3 items-start">
                <div className="col-span-5">
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm"
                    placeholder="Service or product description"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Quantity <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Unit Price <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-zinc-400 mb-1">Amount</label>
                  <input
                    type="text"
                    value={`€${item.amount.toFixed(2)}`}
                    readOnly
                    className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-400 text-sm cursor-not-allowed"
                  />
                </div>
                <div className="col-span-1 flex items-end">
                  <button
                    onClick={() => removeLineItem(index)}
                    className="w-full p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                    title="Remove item"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calculations Section */}
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Calculations</h2>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={invoice.tax_rate}
                  onChange={(e) => setInvoice({ ...invoice, tax_rate: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white"
                />
              </div>
            </div>

            <div className="border-t border-zinc-700 pt-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Subtotal:</span>
                <span className="text-white font-medium">€{invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Tax ({invoice.tax_rate}%):</span>
                <span className="text-white font-medium">€{invoice.tax_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-zinc-700">
                <span className="text-white font-bold text-lg">Total:</span>
                <span className="text-orange-500 font-bold text-xl">€{invoice.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Notes</h2>
          <textarea
            value={invoice.notes || ''}
            onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
            rows={4}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white resize-none"
            placeholder="Additional notes or payment instructions..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/admin/invoices')}
            className="px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSave('draft')}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              onClick={() => handleSave('sent')}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="w-5 h-5" />
              {saving ? 'Saving...' : 'Mark as Sent'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
