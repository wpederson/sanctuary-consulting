'use client'
import { useState } from 'react'
import { Invoice, AdminUser } from '@/types'
import { invoiceTotal, formatMoney, isOverdue, nextInvoiceNumber, buildInvoiceHTML } from '@/lib/invoices'
import { createClient } from '@/lib/supabase'

interface Props { invoices: any[]; clients: any[]; user: AdminUser }

type Status = 'all' | 'draft' | 'sent' | 'paid' | 'overdue'

export default function InvoicesClient({ invoices: initial, clients, user }: Props) {
  const [invoices, setInvoices] = useState(initial)
  const [filter, setFilter] = useState<Status>('all')
  const [showModal, setShowModal] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [previewHTML, setPreviewHTML] = useState('')
  const [previewInv, setPreviewInv] = useState<any>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [sendingId, setSendingId] = useState<string | null>(null)

  // Form state
  const [form, setForm] = useState({
    clientId: '', number: nextInvoiceNumber(initial), issueDate: new Date().toISOString().split('T')[0],
    dueDate: '', status: 'draft' as const, notes: 'Payment due within 30 days.', showClient: false,
    lineItems: [{ desc: 'Security Strategy Consultation', qty: 1, price: 250 }] as { desc:string;qty:number;price:number }[]
  })
  const supabase = createClient()

  const filtered = invoices.filter(inv => {
    if (filter === 'overdue') return isOverdue(inv)
    if (filter !== 'all') return inv.status === filter
    return true
  })

  function openNew() {
    setEditId(null)
    setForm({ clientId:'', number: nextInvoiceNumber(invoices), issueDate: new Date().toISOString().split('T')[0],
      dueDate:'', status:'draft', notes:'Payment due within 30 days.', showClient:false,
      lineItems:[{desc:'Security Strategy Consultation',qty:1,price:250}] })
    setShowModal(true)
  }

  function openEdit(inv: any) {
    setEditId(inv.id)
    setForm({ clientId:inv.client_id, number:inv.number, issueDate:inv.issue_date, dueDate:inv.due_date,
      status:inv.status, notes:inv.notes||'', showClient:inv.show_client, lineItems:inv.line_items||[] })
    setShowModal(true)
  }

  function openPreviewFor(inv: any) {
    const client = clients.find(c => c.id === inv.client_id) || inv.clients || {}
    const html = buildInvoiceHTML(inv, client)
    setPreviewHTML(html)
    setPreviewInv(inv)
    setShowPreview(true)
  }

  async function save() {
    if (!form.clientId || !form.issueDate || !form.dueDate) return alert('Fill required fields')
    setSaving(true)
    const payload = { client_id: form.clientId, number: form.number, issue_date: form.issueDate,
      due_date: form.dueDate, status: form.status, notes: form.notes, show_client: form.showClient, line_items: form.lineItems }
    if (editId) {
      const { data } = await supabase.from('invoices').update(payload).eq('id', editId).select('*, clients(church,contact,email,location)').single()
      setInvoices(prev => prev.map(i => i.id === editId ? data : i))
    } else {
      const { data } = await supabase.from('invoices').insert(payload).select('*, clients(church,contact,email,location)').single()
      if (data) setInvoices(prev => [data, ...prev])
    }
    setSaving(false)
    setShowModal(false)
  }

  async function sendEmail(invId: string) {
    setSendingId(invId)
    const res = await fetch(`/api/invoices/${invId}/send`, { method: 'POST' })
    if (res.ok) {
      setInvoices(prev => prev.map(i => i.id === invId && i.status === 'draft' ? {...i, status:'sent'} : i))
      alert('Invoice emailed successfully')
    } else alert('Email failed — check your Resend API key')
    setSendingId(null)
  }

  function printPreview() {
    const win = window.open('', '_blank')
    win!.document.write(`<!DOCTYPE html><html><head><title>Invoice ${previewInv?.number}</title>
      <style>body{margin:32px;font-family:Georgia,serif}</style></head>
      <body>${previewHTML}</body></html>`)
    win!.document.close()
    setTimeout(() => { win!.focus(); win!.print() }, 300)
  }

  const total = form.lineItems.reduce((s,l) => s+l.qty*l.price, 0)

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-darkText font-serif">🧾 Invoices</h1>
          <p className="text-sm text-midGray mt-1">{invoices.length} total · {invoices.filter(isOverdue).length} overdue</p>
        </div>
        <button onClick={openNew} className="btn-primary">+ New Invoice</button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['all','draft','sent','paid','overdue'] as Status[]).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-colors ${filter===s ? 'bg-forest text-white border-forest' : 'border-tan text-midGray hover:border-sage'} ${s==='overdue' ? 'border-red text-red' : ''}`}>
            {s.charAt(0).toUpperCase()+s.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <table className="data-table">
          <thead><tr>
            <th>Invoice #</th><th>Client</th><th>Amount</th><th>Issued</th><th>Due</th><th>Status</th><th>Show Client</th><th>Actions</th>
          </tr></thead>
          <tbody>
            {filtered.map(inv => {
              const overdue = isOverdue(inv)
              const total = invoiceTotal(inv)
              const statusKey = overdue ? 'overdue' : inv.status
              const statusColors: Record<string,string> = { draft:'badge-gray', sent:'badge-blue', paid:'badge-green', overdue:'badge-red' }
              const statusLabels: Record<string,string> = { draft:'Draft', sent:'Sent', paid:'Paid', overdue:'⚠️ Overdue' }
              return (
                <tr key={inv.id} style={{background: overdue ? '#fff8f8' : undefined}}>
                  <td><span className="font-mono text-sm font-bold">{inv.number}</span></td>
                  <td>
                    <div className="font-semibold">{inv.clients?.church}</div>
                    <div className="text-xs text-midGray">{inv.clients?.contact}</div>
                  </td>
                  <td className="font-bold text-forest">{formatMoney(total)}</td>
                  <td className="text-sm text-midGray">{new Date(inv.issue_date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</td>
                  <td className={`text-sm ${overdue ? 'text-red font-bold' : 'text-midGray'}`}>{new Date(inv.due_date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</td>
                  <td><span className={`badge ${statusColors[statusKey]}`}>{statusLabels[statusKey]}</span></td>
                  <td>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={inv.show_client} className="accent-forest"
                        onChange={async e => {
                          await supabase.from('invoices').update({show_client: e.target.checked}).eq('id', inv.id)
                          setInvoices(prev => prev.map(i => i.id===inv.id ? {...i, show_client: e.target.checked} : i))
                        }} />
                      <span className="text-xs">{inv.show_client ? 'Visible' : 'Hidden'}</span>
                    </label>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(inv)} className="btn-outline py-1 px-2 text-xs">✏️</button>
                      <button onClick={() => openPreviewFor(inv)} className="btn-ghost py-1 px-2 text-xs">👁</button>
                      <button onClick={() => sendEmail(inv.id)} disabled={sendingId===inv.id} className="btn-ghost py-1 px-2 text-xs">
                        {sendingId===inv.id ? '…' : '✉️'}
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {!filtered.length && (
              <tr><td colSpan={8} className="text-center py-12 text-midGray">No invoices found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit modal */}
      {showModal && (
        <div className="fixed inset-0 bg-darkText/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-tan bg-forest rounded-t-2xl">
              <h2 className="text-white font-bold text-lg">{editId ? 'Edit Invoice' : 'New Invoice'}</h2>
              <button onClick={() => setShowModal(false)} className="text-sageLt text-xl hover:text-white">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">Client *</label>
                  <select className="select" value={form.clientId} onChange={e=>setForm(f=>({...f,clientId:e.target.value}))}>
                    <option value="">— Select client —</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.church}</option>)}
                  </select>
                </div>
                <div><label className="label">Invoice #</label><input className="input" value={form.number} onChange={e=>setForm(f=>({...f,number:e.target.value}))} /></div>
                <div><label className="label">Status</label>
                  <select className="select" value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value as any}))}>
                    <option value="draft">Draft</option><option value="sent">Sent</option><option value="paid">Paid</option>
                  </select>
                </div>
                <div><label className="label">Issue Date *</label><input type="date" className="input" value={form.issueDate} onChange={e=>setForm(f=>({...f,issueDate:e.target.value}))} /></div>
                <div><label className="label">Due Date *</label><input type="date" className="input" value={form.dueDate} onChange={e=>setForm(f=>({...f,dueDate:e.target.value}))} /></div>
                <div className="col-span-2"><label className="label">Payment Terms / Notes</label><input className="input" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} /></div>
              </div>

              <div>
                <div className="text-sm font-bold text-darkText mb-2">Line Items</div>
                {form.lineItems.map((li, i) => (
                  <div key={i} className="grid grid-cols-[1fr_70px_90px_80px_28px] gap-2 mb-2">
                    <input className="input text-xs" placeholder="Description" value={li.desc} onChange={e=>{const items=[...form.lineItems];items[i]={...items[i],desc:e.target.value};setForm(f=>({...f,lineItems:items}))}} />
                    <input className="input text-xs text-center" type="number" min="0.25" step="0.25" value={li.qty} onChange={e=>{const items=[...form.lineItems];items[i]={...items[i],qty:+e.target.value};setForm(f=>({...f,lineItems:items}))}} />
                    <input className="input text-xs text-right" type="number" min="0" step="0.01" value={li.price} onChange={e=>{const items=[...form.lineItems];items[i]={...items[i],price:+e.target.value};setForm(f=>({...f,lineItems:items}))}} />
                    <div className="flex items-center justify-end text-sm font-semibold text-forest">{formatMoney(li.qty*li.price)}</div>
                    <button onClick={()=>setForm(f=>({...f,lineItems:f.lineItems.filter((_,j)=>j!==i)}))} className="text-midGray hover:text-red text-lg">✕</button>
                  </div>
                ))}
                <button onClick={()=>setForm(f=>({...f,lineItems:[...f.lineItems,{desc:'',qty:1,price:0}]}))} className="text-sm text-forest font-semibold hover:underline">+ Add line item</button>
                <div className="flex justify-end mt-3 text-lg font-bold text-forest">Total: {formatMoney(total)}</div>
              </div>

              <label className="flex items-center gap-3 text-sm cursor-pointer">
                <input type="checkbox" className="accent-forest w-4 h-4" checked={form.showClient} onChange={e=>setForm(f=>({...f,showClient:e.target.checked}))} />
                Show this invoice on the client's portal
              </label>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-tan">
              <button onClick={() => setShowModal(false)} className="btn-ghost">Cancel</button>
              <button onClick={save} disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save Invoice'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Preview modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-darkText/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-tan bg-forest rounded-t-2xl">
              <h2 className="text-white font-bold">Invoice Preview</h2>
              <button onClick={() => setShowPreview(false)} className="text-sageLt text-xl hover:text-white">✕</button>
            </div>
            <div className="p-4 bg-gray-50">
              <div className="bg-white rounded-lg p-8 shadow-sm" dangerouslySetInnerHTML={{ __html: previewHTML }} />
            </div>
            <div className="flex gap-3 justify-end p-5 border-t border-tan">
              <button onClick={() => setShowPreview(false)} className="btn-ghost">Close</button>
              <button onClick={() => sendEmail(previewInv.id)} className="btn-outline">✉️ Email</button>
              <button onClick={printPreview} className="btn-primary">🖨 Print / PDF</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
