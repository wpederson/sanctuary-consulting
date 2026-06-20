import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getAdminUser, can } from '@/lib/auth'
import { buildInvoiceHTML, invoiceTotal, formatMoney, isOverdue } from '@/lib/invoices'
import { sendEmail, invoiceEmailHTML } from '@/lib/email'
import { Invoice, Client } from '@/types'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminUser = await getAdminUser()
  if (!adminUser || !can(adminUser, 'manageInvoices')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = await createServerSupabaseClient()
  const { data: invoice } = await supabase
    .from('invoices')
    .select('*, clients(*)')
    .eq('id', params.id)
    .single()

  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const client = invoice.clients as Client
  const inv = invoice as Invoice
  const total = invoiceTotal(inv)
  const overdue = isOverdue(inv)

  const subject = overdue
    ? `PAST DUE: Invoice ${inv.number} — ${formatMoney(total)}`
    : `Invoice ${inv.number} from Sanctuary Consulting — ${formatMoney(total)} Due`

  const html = invoiceEmailHTML(buildInvoiceHTML(inv, client), subject)

  const ok = await sendEmail({ to: client.email, subject, html })

  if (ok && inv.status === 'draft') {
    await supabase.from('invoices').update({ status: 'sent' }).eq('id', inv.id)
  }

  return NextResponse.json({ ok })
}
