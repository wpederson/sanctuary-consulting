import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getAdminUser, can } from '@/lib/auth'
import { buildInvoiceHTML, invoiceTotal, formatMoney, isOverdue } from '@/lib/invoices'
import { sendEmail, invoiceEmailHTML } from '@/lib/email'

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  const adminUser = await getAdminUser()
  if (!adminUser || !can(adminUser, 'manageInvoices')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = await createServerSupabaseClient()
  const { data: invoice } = await supabase
    .from('invoices')
    .select('*, clients(*)')
    .eq('id', id)
    .single()

  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const client = invoice.clients as any
  const total = invoiceTotal(invoice as any)
  const overdue = isOverdue(invoice as any)

  const subject = overdue
    ? `PAST DUE: Invoice ${invoice.number} — ${formatMoney(total)}`
    : `Invoice ${invoice.number} from Sanctuary Consulting — ${formatMoney(total)} Due`

  const html = invoiceEmailHTML(buildInvoiceHTML(invoice as any, client), subject)
  const ok = await sendEmail({ to: client.email, subject, html })

  if (ok && invoice.status === 'draft') {
    await supabase.from('invoices').update({ status: 'sent' }).eq('id', id)
  }

  return NextResponse.json({ ok })
}
