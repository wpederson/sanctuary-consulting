import { Invoice, LineItem, Client } from '@/types'

export function invoiceTotal(invoice: Invoice): number {
  return (invoice.line_items || []).reduce(
    (sum, li) => sum + li.qty * li.price,
    0
  )
}

export function formatMoney(n: number): string {
  return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function isOverdue(invoice: Invoice): boolean {
  if (!invoice.due_date) return false
  if (invoice.status === 'paid' || invoice.status === 'draft') return false
  return new Date(invoice.due_date) < new Date()
}

export function nextInvoiceNumber(existing: Invoice[]): string {
  const nums = existing
    .map(i => parseInt((i.number || '').replace(/\D/g, '')))
    .filter(Boolean)
  const next = nums.length ? Math.max(...nums) + 1 : 1001
  return 'SNC-' + String(next).padStart(4, '0')
}

export function buildInvoiceEmailBody(invoice: Invoice, client: Client): string {
  const total = invoiceTotal(invoice)
  return [
    `Dear ${client.contact},`,
    '',
    `Please find your invoice from Sanctuary Consulting below.`,
    '',
    `Invoice Number: ${invoice.number}`,
    `Amount Due: ${formatMoney(total)}`,
    `Due Date: ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'See invoice'}`,
    '',
    invoice.notes ? `Payment Terms: ${invoice.notes}` : '',
    '',
    `View your portal for full details: ${process.env.NEXT_PUBLIC_APP_URL}/portal/${client.id}`,
    '',
    'For questions, please call 612-600-4034 or reply to this email.',
    '',
    'Thank you for your partnership,',
    'Sanctuary Consulting',
    '612-600-4034',
  ].filter(l => l !== undefined).join('\n')
}

export function buildInvoiceHTML(invoice: Invoice, client: Client): string {
  const total = invoiceTotal(invoice)
  const overdue = isOverdue(invoice)
  const statusLabel = overdue ? 'OVERDUE' : invoice.status.toUpperCase()
  const statusColor = overdue ? '#C0392B' : invoice.status === 'paid' ? '#1E7E4A' : invoice.status === 'sent' ? '#1565C0' : '#666'

  return `
    <div style="font-family:Georgia,serif;max-width:660px;margin:0 auto;color:#1E2D28">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:20px;border-bottom:2px solid #2C4A3E">
        <div>
          <div style="font-size:28px;font-weight:800;color:#2C4A3E;letter-spacing:-.5px">SANCTUARY</div>
          <div style="font-size:10px;letter-spacing:3px;color:#C8963E;text-transform:uppercase;margin-top:2px">Consulting</div>
          <div style="font-size:12px;color:#7A8C85;margin-top:12px;line-height:1.8">
            Sanctuary Consulting<br>📞 612-600-4034<br>wespederson@comcast.net
          </div>
        </div>
        <div style="text-align:right">
          <div style="font-size:26px;font-weight:700;color:#1E2D28">INVOICE</div>
          <div style="font-size:12px;color:#7A8C85;margin-top:8px;line-height:1.8">
            <strong style="color:#1E2D28">${invoice.number}</strong><br>
            Issued: ${new Date(invoice.issue_date).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}<br>
            Due: ${new Date(invoice.due_date).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}
          </div>
          <div style="margin-top:10px;padding:4px 14px;background:${statusColor};color:white;border-radius:6px;font-size:11px;font-weight:700;letter-spacing:1px;display:inline-block">${statusLabel}</div>
        </div>
      </div>
      <div style="background:#f5f2ec;border-radius:10px;padding:18px 22px;margin-bottom:28px">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#7A8C85;margin-bottom:8px">Bill To</div>
        <div style="font-size:17px;font-weight:700;color:#1E2D28">${client.church}</div>
        <div style="font-size:13px;color:#7A8C85;margin-top:4px;line-height:1.7">${client.contact}<br>${client.email}<br>${client.location || ''}</div>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <thead>
          <tr style="background:#2C4A3E;color:white">
            <th style="padding:10px 14px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.5px">Description</th>
            <th style="padding:10px 14px;text-align:center;width:60px;font-size:11px;text-transform:uppercase;letter-spacing:.5px">Qty</th>
            <th style="padding:10px 14px;text-align:right;width:100px;font-size:11px;text-transform:uppercase;letter-spacing:.5px">Unit</th>
            <th style="padding:10px 14px;text-align:right;width:100px;font-size:11px;text-transform:uppercase;letter-spacing:.5px">Total</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.line_items.map((li, i) => `
            <tr style="background:${i % 2 ? '#fdfbf7' : 'white'}">
              <td style="padding:10px 14px;font-size:13px">${li.desc}</td>
              <td style="padding:10px 14px;font-size:13px;color:#7A8C85;text-align:center">${li.qty}</td>
              <td style="padding:10px 14px;font-size:13px;color:#7A8C85;text-align:right">${formatMoney(li.price)}</td>
              <td style="padding:10px 14px;font-size:13px;font-weight:600;text-align:right">${formatMoney(li.qty * li.price)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div style="display:flex;justify-content:flex-end">
        <div style="width:260px">
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #E2D9CC;font-size:13px">
            <span style="color:#7A8C85">Subtotal</span>
            <span style="font-weight:600">${formatMoney(total)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:14px 0;font-size:17px;border-top:2px solid #2C4A3E;margin-top:4px">
            <span style="font-weight:700;color:#2C4A3E">Total Due</span>
            <span style="font-weight:800;color:#2C4A3E">${formatMoney(total)}</span>
          </div>
        </div>
      </div>
      ${invoice.notes ? `<div style="margin-top:24px;padding:16px 18px;background:#f5f2ec;border-radius:8px;font-size:12px;color:#7A8C85;line-height:1.6"><strong style="color:#1E2D28">Payment Terms:</strong> ${invoice.notes}</div>` : ''}
      <div style="margin-top:32px;padding-top:16px;border-top:1px solid #E2D9CC;font-size:11px;color:#7A8C85;text-align:center">
        Thank you for your partnership with Sanctuary Consulting · 612-600-4034 · wespederson@comcast.net
      </div>
    </div>
  `
}
