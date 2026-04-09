# AK CHAUFFAGE - Three New Features Implementation Plan

## Context

AK CHAUFFAGE admin dashboard is being enhanced with three new features for the demo deployment:

1. **Floating WhatsApp Button** - Increase customer engagement with instant contact via WhatsApp, configurable from admin dashboard
2. **Basic Visitor Analytics** - Provide business insights through server-side tracking (no cookies, GDPR-safe) with visual charts
3. **Invoice Generator** - Professional invoicing tool with PDF export, line items, Belgian VAT (21%), and status tracking

**Why these features:**
- WhatsApp is highly popular in Belgium for business communication
- Analytics help the business owner understand visitor behavior and traffic sources
- Invoice generator streamlines billing workflow and looks professional to clients
- All features are demo-ready to showcase the full admin dashboard capabilities

**Implementation order:** WhatsApp (2h) → Analytics (6h) → Invoices (12h) = 20 hours total

---

## PHASE 1: FLOATING WHATSAPP BUTTON (2 hours)

### Architecture
- **Settings storage:** JSON file (`data/settings.json`) - not sensitive, follows contact/social pattern
- **Component pattern:** Based on existing `FloatingCTA.tsx` (scroll detection, mobile/desktop responsive)
- **Position:** Bottom-left (opposite of FloatingCTA on bottom-right to avoid conflict)
- **Theme:** WhatsApp green (#25D366) instead of orange
- **Trigger:** Shows after 300px scroll (less than FloatingCTA's 500px)

### Implementation Steps

#### 1.1 Type Definition
**File:** `src/types/content.ts`

Add to `SiteSettings` interface:
```typescript
whatsapp: {
  enabled: boolean;
  phoneNumber: string;
  defaultMessage: string;
};
```

#### 1.2 Settings Data
**File:** `data/settings.json`

Add after `social` section:
```json
"whatsapp": {
  "enabled": true,
  "phoneNumber": "+32488459976",
  "defaultMessage": "Bonjour! Je souhaite obtenir un devis pour mes besoins en chauffage."
}
```

#### 1.3 FloatingWhatsApp Component
**New file:** `src/components/FloatingWhatsApp.tsx`

**Pattern:** Follow `/Users/macbook/Documents/codes/ak-chauffage/src/components/FloatingCTA.tsx`

Key features:
- Use `useContent()` hook for settings access
- Conditional render: `if (!settings?.whatsapp?.enabled) return null;`
- WhatsApp URL: `https://wa.me/${phoneNumber}?text=${encodedMessage}`
- Green theme: `bg-green-500 hover:bg-green-600`
- Scroll detection with 300px threshold
- Mobile: Full-width button, Desktop: Circular expandable
- MessageCircle icon from lucide-react

#### 1.4 Settings Editor UI
**File:** `src/admin/pages/SettingsEditor.tsx`

Add WhatsApp configuration section with:
- Checkbox toggle for enabled/disabled
- Phone number input (tel type, international format)
- Default message textarea
- Pattern: Follow existing contact section layout
- Use `updateField('whatsapp.enabled', value)` pattern

#### 1.5 App Integration
**File:** `src/App.tsx`

Import and render: `<FloatingWhatsApp />` alongside existing FloatingCTA

### Verification
- [ ] Toggle in settings shows/hides button on frontend
- [ ] Opens WhatsApp with correct phone number and pre-filled message
- [ ] Mobile and desktop responsive
- [ ] No position conflict with FloatingCTA
- [ ] Scroll trigger works at 300px

---

## PHASE 2: BASIC VISITOR ANALYTICS (6 hours)

### Architecture
- **Database:** SQLite table `visitor_analytics` with session tracking
- **Tracking method:** Server-side Express middleware (no cookies except session ID)
- **GDPR compliance:** Anonymous aggregate stats, no personal data, session cookie only
- **Charts:** Recharts library for visualization
- **Service pattern:** Follow existing `ContactService` pattern with prepared statements

### Database Schema

**New table:** `visitor_analytics`
```sql
CREATE TABLE visitor_analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  page_path TEXT NOT NULL,
  referrer TEXT,
  ip_address TEXT,
  user_agent TEXT,
  device_type TEXT CHECK(device_type IN ('desktop', 'mobile', 'tablet')),
  country TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analytics_created_at ON visitor_analytics(created_at DESC);
CREATE INDEX idx_analytics_page_path ON visitor_analytics(page_path);
CREATE INDEX idx_analytics_session ON visitor_analytics(session_id);
```

### Implementation Steps

#### 2.1 Database Migration
**New file:** `server/database/migrations/add-analytics.cjs`

Pattern: Follow `/Users/macbook/Documents/codes/ak-chauffage/server/database/migrations/migrate-env-admin.cjs`

Register in `server/index.cjs` startup sequence

#### 2.2 Analytics Service
**New file:** `server/database/visitorAnalyticsService.cjs`

Pattern: Follow `/Users/macbook/Documents/codes/ak-chauffage/server/database/contactService.cjs`

Methods:
- `track({ sessionId, pagePath, referrer, ipAddress, userAgent })` - Insert page view
- `detectDeviceType(userAgent)` - Parse UA string to categorize device
- `getStats(days)` - Aggregate stats for time range
  - Total page views
  - Unique visitors (by session_id)
  - Daily views (time-series data)
  - Popular pages (top 10)
  - Traffic sources (Direct, Google, Facebook, Instagram, Other)
  - Device breakdown (desktop/mobile/tablet)

#### 2.3 Tracking Middleware
**New file:** `server/middleware/analytics.cjs`

- Exclude: `/api/*`, `/admin/*`, static assets (`.js`, `.css`, images)
- Session cookie: `analytics_session` (30-minute expiry, httpOnly, sameSite)
- Non-blocking: Use `setImmediate()` to track in background
- Error handling: Catch and log, don't throw (analytics shouldn't break app)

Register in `server/index.cjs` BEFORE static file serving

#### 2.4 API Route
**New file:** `server/routes/analytics.cjs`

Endpoint: `GET /api/analytics/stats?days=7` (protected with authMiddleware)

Validation: days must be between 1-365

Register route in `server/index.cjs`

#### 2.5 Frontend API
**File:** `src/utils/api.ts`

Add to adminApi:
```typescript
async getAnalyticsStats(days: number = 7) {
  const response = await fetchWithAuth(`/analytics/stats?days=${days}`);
  return handleResponse(response);
}
```

#### 2.6 Analytics Dashboard
**New file:** `src/admin/pages/Analytics.tsx`

Pattern: Follow `/Users/macbook/Documents/codes/ak-chauffage/src/admin/pages/Dashboard.tsx`

Components:
- Header with time range selector (7d, 30d, 90d)
- Stats cards grid (total views, unique visitors, avg per day)
- Line chart: Daily page views over time
- Bar chart: Popular pages
- Pie chart: Traffic sources
- Pie chart: Device breakdown

Styling:
- Dark theme: `bg-zinc-800`, `border-zinc-700`
- Orange accent: `#f97316`
- French labels throughout
- Responsive grid layout

Charts config:
- Recharts: LineChart, BarChart, PieChart
- Orange color scheme: `['#f97316', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']`
- French axis labels and tooltips

#### 2.7 Dependencies
```bash
npm install recharts cookie-parser
npm install --save-dev @types/cookie-parser
```

#### 2.8 Admin Routes
**Files to update:**
- `src/admin/AdminApp.tsx` - Add route: `<Route path="analytics" element={<Analytics />} />`
- `src/admin/components/Layout/AdminLayout.tsx` - Add "Analytics" nav item with TrendingUp icon

### Verification
- [ ] Frontend page visits tracked in database
- [ ] API/admin routes excluded from tracking
- [ ] Session tracking works (30-minute sessions)
- [ ] Device type detection accurate
- [ ] Charts render with French labels
- [ ] Time range selector works (7/30/90 days)
- [ ] No performance impact on page loads
- [ ] Traffic sources categorized correctly

---

## PHASE 3: INVOICE GENERATOR (12 hours)

### Architecture
- **Database:** Two tables with foreign key (invoices + invoice_line_items)
- **Service pattern:** Transaction-based creation, follows ContactService pattern
- **PDF generation:** jsPDF library with company branding
- **Invoice numbering:** Auto-increment format `AK-2026-001`
- **Belgian VAT:** 21% standard rate (configurable per invoice)
- **Status workflow:** draft → sent → paid → cancelled
- **UI pattern:** Complex form with dynamic line items, auto-calculations

### Database Schema

**Table 1:** `invoices`
```sql
CREATE TABLE invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'sent', 'paid', 'cancelled')),
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  client_address TEXT,
  issue_date DATE NOT NULL,
  due_date DATE,
  paid_date DATE,
  subtotal DECIMAL(10, 2) NOT NULL,
  tax_rate DECIMAL(5, 2) DEFAULT 21.00,
  tax_amount DECIMAL(10, 2),
  total DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_by INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES admins(id)
);

CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_date ON invoices(issue_date DESC);
```

**Table 2:** `invoice_line_items`
```sql
CREATE TABLE invoice_line_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  line_order INTEGER DEFAULT 0,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

CREATE INDEX idx_line_items_invoice ON invoice_line_items(invoice_id);
```

### Implementation Steps

#### 3.1 Database Migration
**New file:** `server/database/migrations/add-invoices.cjs`

Creates both tables with indexes

Register in `server/index.cjs` startup

#### 3.2 TypeScript Types
**New file:** `src/types/invoice.ts`

Interfaces:
- `InvoiceLineItem` - Single line item with description, quantity, unit_price, amount
- `Invoice` - Full invoice with client info, dates, totals, line_items array
- `InvoiceListItem` - Simplified for list view

#### 3.3 Invoice Service
**New file:** `server/database/invoiceService.cjs`

Pattern: Follow `/Users/macbook/Documents/codes/ak-chauffage/server/database/contactService.cjs`

Methods:
- `generateInvoiceNumber()` - Auto-increment AK-YYYY-XXX format
- `create({ invoice, lineItems, createdBy })` - Transaction-based creation
  - Insert invoice record
  - Insert all line items
  - Return full invoice with line items
- `getById(id)` - Fetch invoice with line items joined
- `getAll({ status, search, limit, offset })` - Paginated list with filters
- `updateStatus(id, status, paidDate)` - Update workflow status
- `delete(id)` - Delete invoice (cascades to line items)
- `getStats()` - Counts by status, total/pending revenue

Transaction usage:
```javascript
const createInvoice = db.transaction((invoiceData, items) => {
  // Insert invoice
  // Insert line items in loop
  // Return invoiceId
});
```

#### 3.4 API Routes
**New file:** `server/routes/invoices.cjs`

All routes protected with authMiddleware

Endpoints:
- `GET /api/invoices` - List with pagination, filters
- `GET /api/invoices/stats` - Dashboard statistics
- `GET /api/invoices/:id` - Single invoice with line items
- `POST /api/invoices` - Create new invoice
- `PATCH /api/invoices/:id/status` - Update status
- `DELETE /api/invoices/:id` - Delete invoice

Register route in `server/index.cjs`

#### 3.5 Frontend API
**File:** `src/utils/api.ts`

Add to adminApi:
- `getInvoices(params)` - List with filters
- `getInvoiceStats()` - Stats for dashboard
- `getInvoice(id)` - Single invoice
- `createInvoice(data)` - Create with line items
- `updateInvoiceStatus(id, status, paidDate)` - Status update
- `deleteInvoice(id)` - Delete

#### 3.6 PDF Generator
**New file:** `src/utils/pdfGenerator.ts`

Function: `generateInvoicePDF(invoice, companyInfo)`

Layout:
- Orange header (30mm) with company name in white
- Company details (address, phone, email, VAT)
- Invoice number, date, due date (top-right)
- Client info section ("Facturé à:")
- Line items table (Description, Qté, Prix Unit., Montant)
- Totals section (Sous-total, TVA 21%, TOTAL)
- Notes section if present
- Footer with "Merci pour votre confiance!"

Styling:
- A4 page (210x297mm)
- Orange brand color (#f97316)
- French labels
- Professional typography
- Company branding

Library: jsPDF

#### 3.7 Invoice List Page
**New file:** `src/admin/pages/Invoices.tsx`

Pattern: Follow `/Users/macbook/Documents/codes/ak-chauffage/src/admin/pages/Contacts.tsx`

Features:
- Stats cards (total invoices, paid count, total/pending revenue)
- Filter by status (all, draft, sent, paid, cancelled)
- Search by invoice number, client name, client email
- Table with columns: Invoice #, Client, Status, Total, Date, Actions
- Status badges with color coding
- Action buttons: View, Download PDF, Delete
- "Create Invoice" button (navigates to editor)
- Pagination

Status badge colors:
- draft: `bg-zinc-700 text-zinc-300`
- sent: `bg-blue-500/20 text-blue-400`
- paid: `bg-green-500/20 text-green-400`
- cancelled: `bg-red-500/20 text-red-400`

#### 3.8 Invoice Editor Page
**New file:** `src/admin/pages/InvoiceEditor.tsx`

Complex form with:

**Client Section:**
- Client name (required)
- Client email (required)
- Client phone (optional)
- Client address (textarea, optional)

**Dates Section:**
- Issue date (defaults to today)
- Due date (optional)

**Line Items Section:**
- Dynamic array of line items
- Each row: Description, Quantity, Unit Price, Amount (auto-calculated)
- Add button: Appends new line item
- Remove button: Deletes line item
- Drag-to-reorder (optional enhancement)

**Calculations:**
- Line amount = quantity × unit_price (auto-update on change)
- Subtotal = sum of all line amounts
- Tax amount = subtotal × (tax_rate / 100)
- Total = subtotal + tax_amount
- All calculations happen in real-time

**Tax Configuration:**
- Tax rate input (default 21%)
- Displayed as percentage

**Notes:**
- Textarea for additional notes (optional)

**Actions:**
- Save as Draft
- Mark as Sent
- Download PDF
- Cancel (navigate back)

State management:
```typescript
const [invoice, setInvoice] = useState<Invoice>({
  status: 'draft',
  client_name: '',
  client_email: '',
  issue_date: new Date().toISOString().split('T')[0],
  tax_rate: 21,
  line_items: [],
  // ... other fields
});
```

#### 3.9 Dependencies
```bash
npm install jspdf
```

#### 3.10 Admin Routes
**Files to update:**
- `src/admin/AdminApp.tsx` - Add routes:
  - `<Route path="invoices" element={<Invoices />} />`
  - `<Route path="invoices/new" element={<InvoiceEditor />} />`
  - `<Route path="invoices/:id" element={<InvoiceEditor />} />`
- `src/admin/components/Layout/AdminLayout.tsx` - Add "Factures" nav with Receipt icon

#### 3.11 Dashboard Integration
**File:** `src/admin/pages/Dashboard.tsx`

Add invoice stats card to stats grid:
```typescript
{
  name: 'Factures',
  value: invoiceStats?.total || 0,
  icon: Receipt,
  href: '/admin/invoices',
  subtitle: `${invoiceStats?.paid || 0} payées`
}
```

Load stats on dashboard mount using `adminApi.getInvoiceStats()`

### Verification
- [ ] Create invoice with multiple line items
- [ ] Auto-calculations work (line amount, subtotal, tax, total)
- [ ] Invoice number auto-increments (AK-2026-001, 002, ...)
- [ ] Save as draft appears in list
- [ ] Update status to sent/paid/cancelled
- [ ] Download PDF with correct formatting
- [ ] PDF has company branding and French labels
- [ ] Delete invoice cascades to line items
- [ ] Filter by status works
- [ ] Search functionality works
- [ ] Pagination works
- [ ] Stats display on dashboard and invoices page

---

## Critical Files Reference

**Must read before implementation:**
- `/Users/macbook/Documents/codes/ak-chauffage/src/components/FloatingCTA.tsx` - Floating button pattern (scroll, responsive, expandable)
- `/Users/macbook/Documents/codes/ak-chauffage/server/database/contactService.cjs` - Service layer pattern (prepared statements, pagination, CRUD)
- `/Users/macbook/Documents/codes/ak-chauffage/src/admin/pages/SettingsEditor.tsx` - Settings management pattern (nested updates, form validation)
- `/Users/macbook/Documents/codes/ak-chauffage/server/database/init.cjs` - Database initialization pattern (tables, indexes, foreign keys)
- `/Users/macbook/Documents/codes/ak-chauffage/src/admin/pages/Dashboard.tsx` - Dashboard card layout pattern (stats, responsive grid)
- `/Users/macbook/Documents/codes/ak-chauffage/src/admin/pages/Contacts.tsx` - List page pattern (filters, search, pagination, table)

**Existing utilities to leverage:**
- `useContent()` hook - Access settings globally
- `updateField('path.to.field', value)` - Nested state updates in SettingsEditor
- `adminApi.*` methods - Authenticated API calls with error handling
- `fetchWithAuth()` - Auth middleware wrapper
- lucide-react icons - Consistent icon library
- Tailwind classes: `bg-zinc-800`, `border-zinc-700`, `text-orange-500`

---

## File Structure Summary

### New Files (13 files)

**Frontend:**
1. `src/components/FloatingWhatsApp.tsx` - WhatsApp floating button component
2. `src/admin/pages/Analytics.tsx` - Analytics dashboard with charts
3. `src/admin/pages/Invoices.tsx` - Invoice list page
4. `src/admin/pages/InvoiceEditor.tsx` - Invoice creation/editing form
5. `src/types/invoice.ts` - TypeScript interfaces for invoices
6. `src/utils/pdfGenerator.ts` - PDF generation utility with jsPDF

**Backend:**
7. `server/database/migrations/add-analytics.cjs` - Analytics table migration
8. `server/database/migrations/add-invoices.cjs` - Invoice tables migration
9. `server/database/visitorAnalyticsService.cjs` - Analytics service layer
10. `server/database/invoiceService.cjs` - Invoice service layer
11. `server/middleware/analytics.cjs` - Visitor tracking middleware
12. `server/routes/analytics.cjs` - Analytics API endpoints
13. `server/routes/invoices.cjs` - Invoice API endpoints

### Modified Files (10 files)

**Frontend:**
1. `src/types/content.ts` - Add WhatsApp type to SiteSettings
2. `src/App.tsx` - Import and render FloatingWhatsApp
3. `src/admin/pages/SettingsEditor.tsx` - Add WhatsApp configuration section
4. `src/admin/pages/Dashboard.tsx` - Add invoice stats card
5. `src/admin/AdminApp.tsx` - Add Analytics and Invoice routes
6. `src/admin/components/Layout/AdminLayout.tsx` - Add nav items (Analytics, Factures)
7. `src/utils/api.ts` - Add analytics and invoice API methods

**Backend:**
8. `server/index.cjs` - Register middleware, routes, run migrations
9. `data/settings.json` - Add WhatsApp configuration object

**Dependencies:**
10. `package.json` - Will be updated by npm install

---

## Dependencies Installation

```bash
npm install recharts jspdf cookie-parser
npm install --save-dev @types/cookie-parser
```

---

## Implementation Sequence

### Step 1: WhatsApp Button (2 hours)
1. Update `src/types/content.ts` and `data/settings.json`
2. Create `src/components/FloatingWhatsApp.tsx`
3. Update `src/admin/pages/SettingsEditor.tsx`
4. Import in `src/App.tsx`
5. Test toggle, positioning, WhatsApp link

### Step 2: Visitor Analytics (6 hours)
1. Install recharts and cookie-parser
2. Create database migration `add-analytics.cjs`
3. Create `visitorAnalyticsService.cjs`
4. Create `analytics.cjs` middleware
5. Create `analytics.cjs` API route
6. Update `server/index.cjs` with middleware and route
7. Add API method to `src/utils/api.ts`
8. Create `src/admin/pages/Analytics.tsx` with charts
9. Add route and nav item
10. Test tracking, charts, time ranges

### Step 3: Invoice Generator (12 hours)
1. Install jsPDF
2. Create `src/types/invoice.ts`
3. Create database migration `add-invoices.cjs`
4. Create `invoiceService.cjs` with transaction support
5. Create `invoices.cjs` API routes
6. Update `server/index.cjs` with route
7. Add API methods to `src/utils/api.ts`
8. Create `src/utils/pdfGenerator.ts`
9. Create `src/admin/pages/Invoices.tsx` list page
10. Create `src/admin/pages/InvoiceEditor.tsx` form
11. Add routes and nav items
12. Add stats to dashboard
13. Test full workflow: create, edit, PDF, delete

---

## Post-Implementation Checklist

### WhatsApp Button
- [ ] Appears/disappears based on settings toggle
- [ ] Correct phone number and message in WhatsApp URL
- [ ] Mobile and desktop responsive layouts
- [ ] Scroll trigger at 300px
- [ ] No conflict with FloatingCTA positioning

### Analytics
- [ ] Page views tracked in database
- [ ] API/admin routes excluded
- [ ] Session tracking (30 min)
- [ ] Device type detection works
- [ ] Charts display correctly
- [ ] French labels throughout
- [ ] No performance impact

### Invoices
- [ ] Auto-incrementing invoice numbers
- [ ] Dynamic line items (add/remove)
- [ ] Auto-calculations (subtotal, tax 21%, total)
- [ ] PDF generation with branding
- [ ] Status workflow transitions
- [ ] Filters and search work
- [ ] Pagination works
- [ ] Stats on dashboard
- [ ] Cascading delete

---

## Success Criteria for Demo

1. **WhatsApp Button:** Client can toggle it on/off from admin, customize message, and click it to open WhatsApp chat
2. **Analytics Dashboard:** Shows visitor traffic over last 7/30/90 days with visual charts, popular pages, traffic sources, device breakdown
3. **Invoice Generator:** Admin can create professional invoices with multiple line items, download as PDF with company branding, track payment status

All features should work seamlessly on both desktop and mobile, with French language support throughout.