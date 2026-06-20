'use client'
import { useState, useEffect } from 'react'
import { Client, Consultant, Invoice } from '@/types'
import { invoiceTotal, formatMoney, isOverdue } from '@/lib/invoices'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Props {
  client: Client
  resources: any[]
  consultant: Consultant | null
  invoices: Invoice[]
  isAdmin: boolean
}

type Tab = 'library' | 'invoices' | 'request' | 'meeting' | 'contact' | 'about'

export default function ClientPortal({ client, resources, consultant, invoices, isAdmin }: Props) {
  const [tab, setTab] = useState<Tab>('library')
  const [showPastDue, setShowPastDue] = useState(false)
  const [contactSuccess, setContactSuccess] = useState(false)
  const [requestSuccess, setRequestSuccess] = useState('')
  const supabase = createClient()
  const router = useRouter()

  const overdueInvoices = invoices.filter(isOverdue)

  useEffect(() => {
    if (overdueInvoices.length > 0) {
      setTimeout(() => setShowPastDue(true), 800)
    }
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push(`/portal/${client.id}/login`)
  }

  const conColor: Record<string, string> = {
    forest: '#2C4A3E', teal: '#2E7D6B', sage: '#5C8374', gold: '#C8963E', amber: '#D4820A'
  }
  const conBg = consultant ? (conColor[consultant.color || 'sage'] || '#5C8374') : '#5C8374'

  const tabs: { id: Tab; label: string }[] = [
    { id: 'library',  label: '📚 My Library' },
    { id: 'invoices', label: '🧾 Invoices' },
    { id: 'request',  label: '➕ Request' },
    { id: 'meeting',  label: '📅 Book Meeting' },
    { id: 'contact',  label: '✉️ Contact' },
    { id: 'about',    label: '🕊 About' },
  ]

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Top bar */}
      <div className="bg-forest flex items-center justify-between px-6 py-3 flex-shrink-0">
        <div className="text-white font-bold font-serif">🕊 Sanctuary</div>
        <div className="flex items-center gap-4">
          <a href="tel:6126004034" className="text-sageLt text-sm font-semibold hover:text-white transition-colors">
            📞 612-600-4034
          </a>
          <span className="text-sageLt text-sm">{client.contact}</span>
          <button onClick={handleLogout} className="text-sageLt text-xs hover:text-white transition-colors">
            Sign out
          </button>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-forest text-white px-8 py-8">
        <div className="flex gap-8 max-w-5xl mx-auto">
          {/* Left */}
          <div className="flex-1">
            <div className="text-sageLt text-sm font-semibold mb-1">Welcome to Your Resource Portal</div>
            <h1 className="text-2xl font-bold font-serif mb-4">{client.church}</h1>
            <div className="space-y-3 text-sm text-sageLt">
              <div className="flex gap-3"><span>🕊</span><span><strong className="text-white">Ministry first.</strong> Safety always in the background. Every resource here was selected for your congregation.</span></div>
              <div className="flex gap-3"><span>🌱</span><span><strong className="text-white">Your culture, preserved.</strong> These materials stay true to who you are while building real capacity.</span></div>
            </div>
            <div className="mt-5 inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm">
              🕊 <span className="font-bold">{resources.length}</span> resource{resources.length !== 1 ? 's' : ''} curated for you
            </div>
          </div>

          {/* Consultant card */}
          {consultant ? (
            <div className="w-52 flex-shrink-0 bg-white/10 border border-white/20 rounded-xl p-5 text-center">
              <div className="text-white/50 text-xs uppercase tracking-widest mb-3">Your Consultant</div>
              {consultant.photo_url ? (
                <img src={consultant.photo_url} alt={consultant.name}
                  className="w-20 h-20 rounded-full object-cover border-3 border-white/30 mx-auto mb-3" />
              ) : (
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3"
                  style={{ background: conBg }}>
                  {consultant.avatar}
                </div>
              )}
              <div className="text-white font-bold text-sm">{consultant.name}</div>
              <div className="text-sageLt text-xs mt-1">{consultant.title}</div>
              {consultant.mobile && (
                <a href={`tel:${consultant.mobile.replace(/\D/g,'')}`} className="block mt-3 text-goldLt text-xs font-semibold hover:text-white transition-colors">
                  📱 {consultant.mobile}
                </a>
              )}
              {consultant.email && (
                <a href={`mailto:${consultant.email}`} className="block mt-1 text-goldLt text-xs font-semibold hover:text-white transition-colors truncate">
                  ✉️ {consultant.email}
                </a>
              )}
              <button onClick={() => setTab('contact')}
                className="mt-4 w-full bg-white/10 border border-white/25 rounded-lg py-2 text-white text-xs font-semibold hover:bg-white/20 transition-colors">
                Message →
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Tab nav */}
      <div className="bg-forestMd flex overflow-x-auto flex-shrink-0">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-3 text-sm font-semibold whitespace-nowrap border-b-3 transition-colors ${
              tab === t.id
                ? 'text-white border-goldLt border-b-2'
                : 'text-sageLt border-transparent hover:text-white'
            }`}
          >
            {t.label}
            {t.id === 'invoices' && overdueInvoices.length > 0 && (
              <span className="ml-2 bg-red text-white text-xs rounded-full px-1.5 py-0.5">!</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {/* Library */}
        {tab === 'library' && (
          <div className="p-8 max-w-5xl mx-auto">
            <h2 className="text-xl font-bold text-darkText mb-6">Your Training Library</h2>
            {resources.length === 0 ? (
              <div className="text-center py-16 text-midGray">
                <div className="text-5xl mb-4">📚</div>
                <p>Your consultant is preparing resources for you.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resources.map((cr: any) => (
                  <div key={cr.id} className="card hover:shadow-md transition-shadow">
                    <div className="text-3xl mb-3">{cr.resources?.icon}</div>
                    <div className="font-bold text-darkText mb-1">{cr.resources?.name}</div>
                    <div className="text-xs text-midGray mb-3 capitalize">{cr.resources?.type}</div>
                    <div className="text-sm text-midGray mb-4">{cr.resources?.description}</div>
                    <div className="flex gap-2">
                      {cr.can_view && cr.resources?.file_url && (
                        <a href={cr.resources.file_url} target="_blank" rel="noopener noreferrer"
                          className="btn-outline py-1 px-3 text-xs">View</a>
                      )}
                      {cr.can_download && cr.resources?.file_url && (
                        <a href={cr.resources.file_url} download
                          className="btn-ghost py-1 px-3 text-xs">Download ↓</a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Invoices */}
        {tab === 'invoices' && (
          <div className="p-8 max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-darkText mb-2">🧾 Your Invoices</h2>
            <p className="text-sm text-midGray mb-6">
              Questions? Call <a href="tel:6126004034" className="text-forest font-bold">612-600-4034</a>
            </p>
            {invoices.length === 0 ? (
              <div className="text-center py-16 text-midGray">
                <div className="text-4xl mb-3">🧾</div>
                <p>No invoices at this time.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {invoices.map(inv => {
                  const total = invoiceTotal(inv)
                  const overdue = isOverdue(inv)
                  const borderColor = overdue ? 'border-red' : inv.status === 'paid' ? 'border-green' : 'border-blue-400'
                  return (
                    <div key={inv.id} className={`card border-l-4 ${borderColor}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="text-xl font-bold text-darkText">{formatMoney(total)}</div>
                          <div className="text-xs font-mono text-midGray mt-0.5">{inv.number}</div>
                        </div>
                        <span className={`badge ${overdue ? 'badge-red' : inv.status === 'paid' ? 'badge-green' : 'badge-blue'}`}>
                          {overdue ? '⚠️ Overdue' : inv.status === 'paid' ? '✅ Paid' : 'Payment Due'}
                        </span>
                      </div>
                      <div className="flex gap-4 text-xs text-midGray mb-3">
                        <span>Issued: {new Date(inv.issue_date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</span>
                        <span style={{color: overdue ? '#C0392B' : undefined, fontWeight: overdue ? 700 : 400}}>
                          Due: {new Date(inv.due_date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
                        </span>
                      </div>
                      <div className="text-sm text-midGray mb-3">
                        {inv.line_items.map(li => `${li.desc} (×${li.qty})`).join(' · ')}
                      </div>
                      {overdue && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red font-semibold">
                          ⚠️ This invoice is past due. Please contact us at{' '}
                          <a href="tel:6126004034" className="underline">612-600-4034</a> to arrange payment.
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Contact */}
        {tab === 'contact' && (
          <div className="p-8 max-w-2xl mx-auto space-y-8">
            {consultant && (
              <div>
                <h2 className="text-xl font-bold text-darkText mb-4">👤 Your Consultant</h2>
                <div className="card">
                  <div className="flex items-center gap-4 mb-4">
                    {consultant.photo_url ? (
                      <img src={consultant.photo_url} alt={consultant.name}
                        className="w-16 h-16 rounded-full object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold"
                        style={{background: conBg}}>
                        {consultant.avatar}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-darkText text-lg">{consultant.name}</div>
                      <div className="text-midGray text-sm">{consultant.title}</div>
                    </div>
                  </div>
                  {consultant.bio && <p className="text-sm text-midGray mb-4">{consultant.bio}</p>}
                  <div className="flex gap-3 flex-wrap">
                    {consultant.mobile && (
                      <a href={`tel:${consultant.mobile.replace(/\D/g,'')}`} className="btn-primary py-2">
                        📱 {consultant.mobile}
                      </a>
                    )}
                    {consultant.email && (
                      <a href={`mailto:${consultant.email}?subject=Question from ${client.church}`} className="btn-outline py-2">
                        ✉️ Email
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div>
              <h2 className="text-xl font-bold text-darkText mb-2">💬 Contact Sanctuary</h2>
              <p className="text-sm text-midGray mb-4">
                General questions or feedback — or call <a href="tel:6126004034" className="text-forest font-bold">612-600-4034</a>
              </p>
              <div className="card space-y-4">
                <div>
                  <label className="label">Message</label>
                  <textarea rows={4} id="contact-msg" className="input" placeholder="Write your message…" />
                </div>
                {contactSuccess ? (
                  <div className="bg-emerald-50 text-green border border-emerald-200 rounded-lg px-4 py-3 text-sm font-semibold">
                    ✅ Message sent! We'll be in touch soon.
                  </div>
                ) : (
                  <button onClick={() => setContactSuccess(true)} className="btn-primary">
                    Send to Sanctuary →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Request */}
        {tab === 'request' && (
          <div className="p-8 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-darkText mb-6">➕ Request Resources or Training</h2>
            {requestSuccess ? (
              <div className="card text-center py-8">
                <div className="text-4xl mb-3">✅</div>
                <div className="font-bold text-darkText">{requestSuccess}</div>
                <button onClick={() => setRequestSuccess('')} className="btn-ghost mt-4">Submit another</button>
              </div>
            ) : (
              <div className="card space-y-4">
                <div>
                  <label className="label">Resource or topic needed</label>
                  <input type="text" id="req-topic" className="input" placeholder="e.g. De-escalation training, policy template…" />
                </div>
                <div>
                  <label className="label">Why is this relevant?</label>
                  <textarea rows={3} id="req-why" className="input" placeholder="Help us understand your situation…" />
                </div>
                <div>
                  <label className="label">Priority</label>
                  <select id="req-priority" className="select">
                    <option>Low — whenever convenient</option>
                    <option>Medium — within a few weeks</option>
                    <option>High — I have an upcoming need</option>
                  </select>
                </div>
                <button onClick={() => setRequestSuccess('Request submitted! Your consultant will follow up within 2 business days.')} className="btn-primary">
                  Submit Request →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Meeting */}
        {tab === 'meeting' && (
          <div className="p-8 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-darkText mb-6">📅 Request a Meeting</h2>
            <div className="card space-y-4">
              <div>
                <label className="label">Meeting type</label>
                <select className="select">
                  <option>Quick check-in (15 min)</option>
                  <option>Strategy review (30 min)</option>
                  <option>Full consulting session (60 min)</option>
                  <option>On-site visit</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Preferred date</label><input type="date" className="input" /></div>
                <div><label className="label">Alternate date</label><input type="date" className="input" /></div>
              </div>
              <div><label className="label">What do you hope to accomplish?</label><textarea rows={3} className="input" /></div>
              <button onClick={() => alert('Meeting request sent! We\'ll confirm within one business day.')} className="btn-primary">
                Request Meeting →
              </button>
            </div>
          </div>
        )}

        {/* About */}
        {tab === 'about' && (
          <div className="p-8 max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-darkText mb-6">🕊 About Sanctuary Consulting</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon:'🌱', title:'Our Mission', body:'To help every place of worship become safer without compromising the warmth and culture that makes it home.' },
                { icon:'🤝', title:'Our Commitment', body:"We will never push you faster than you're ready. Every plan is filtered through your congregation's identity and values." },
                { icon:'📚', title:'Your Portal', body:'Resources here were hand-selected by your consultant for your specific congregation. Take your time with each one.' },
                { icon:'📞', title:"We're Here", body:'Your consultant is a real person who knows your congregation. Reach out anytime — this is a relationship, not a transaction.' },
              ].map(item => (
                <div key={item.title} className="card">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <div className="font-bold text-darkText mb-2">{item.title}</div>
                  <p className="text-sm text-midGray">{item.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center text-sm text-midGray">
              General support: <a href="tel:6126004034" className="text-forest font-bold">612-600-4034</a>
              {' · '} <a href="mailto:wespederson@comcast.net" className="text-forest font-bold">wespederson@comcast.net</a>
            </div>
          </div>
        )}
      </div>

      {/* Past-due popup */}
      {showPastDue && (
        <div className="fixed inset-0 bg-darkText/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="bg-red px-6 py-5 flex items-center gap-3">
              <span className="text-3xl">⚠️</span>
              <div>
                <div className="text-white font-bold text-lg">Outstanding Invoice Notice</div>
                <div className="text-red-100 text-sm">You have {overdueInvoices.length} past-due invoice{overdueInvoices.length > 1 ? 's' : ''}</div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-midGray mb-4">
                Please contact Sanctuary at <a href="tel:6126004034" className="text-forest font-bold">612-600-4034</a> to arrange payment.
              </p>
              {overdueInvoices.map(inv => (
                <div key={inv.id} className="flex items-center justify-between py-2 border-b border-tan">
                  <div className="text-sm font-mono text-midGray">{inv.number}</div>
                  <div className="font-bold text-red">{formatMoney(invoiceTotal(inv))}</div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-tan flex gap-3 justify-end">
              <button onClick={() => setShowPastDue(false)} className="btn-ghost">Dismiss</button>
              <button onClick={() => { setShowPastDue(false); setTab('invoices') }} className="btn-danger">
                View My Invoices →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
