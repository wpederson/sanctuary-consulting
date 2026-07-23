'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'

interface Props { content: Record<string, any> }

export default function ContentClient({ content: initial }: Props) {
  const [content, setContent] = useState(initial)
  const [activeTab, setActiveTab] = useState('hero')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState('')
  const supabase = createClient()

  async function save(id: string, data: any) {
    setSaving(true)
    await supabase.from('site_content').upsert({ id, content: data, updated_at: new Date().toISOString() })
    setSaving(false)
    setSaved(id)
    setTimeout(() => setSaved(''), 2000)
  }

  function updateHero(key: string, val: string) {
    setContent(c => ({ ...c, hero: { ...c.hero, [key]: val } }))
  }

  function updateArrayItem(section: string, index: number, key: string, val: string) {
    setContent(c => {
      const arr = [...(c[section] || [])]
      arr[index] = { ...arr[index], [key]: val }
      return { ...c, [section]: arr }
    })
  }

  function addArrayItem(section: string, template: any) {
    setContent(c => ({ ...c, [section]: [...(c[section] || []), template] }))
  }

  function removeArrayItem(section: string, index: number) {
    setContent(c => ({ ...c, [section]: c[section].filter((_: any, i: number) => i !== index) }))
  }

  const tabs = [
    { id: 'hero', label: '🏠 Hero' },
    { id: 'services', label: '🛡 Services' },
    { id: 'approach', label: '📋 Approach' },
    { id: 'faqs', label: '❓ FAQs' },
    { id: 'testimonials', label: '💬 Testimonials' },
  ]

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-0 border-b border-tan mb-6 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-5 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
              activeTab === t.id ? 'border-forest text-forest' : 'border-transparent text-midGray hover:text-darkText'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Hero */}
      {activeTab === 'hero' && (
        <div className="card space-y-4 max-w-2xl">
          <h2 className="font-bold text-darkText">Hero Section</h2>
          {[
            { key:'eyebrow', label:'Eyebrow text (small text above headline)' },
            { key:'headline', label:'Headline line 1' },
            { key:'headline2', label:'Headline line 2 (gold color)' },
            { key:'subtext', label:'Subheadline paragraph' },
          ].map(f => (
            <div key={f.key}>
              <label className="label">{f.label}</label>
              <input className="input" value={content.hero?.[f.key] || ''} onChange={e => updateHero(f.key, e.target.value)} />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4">
            {[1,2,3,4].map(n => (
              <div key={n} className="space-y-2">
                <label className="label">Stat {n}</label>
                <input className="input" placeholder="Value e.g. 50+" value={content.hero?.[`stat${n}_val`] || ''} onChange={e => updateHero(`stat${n}_val`, e.target.value)} />
                <input className="input" placeholder="Label" value={content.hero?.[`stat${n}_label`] || ''} onChange={e => updateHero(`stat${n}_label`, e.target.value)} />
              </div>
            ))}
          </div>
          <button onClick={() => save('hero', content.hero)} disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : saved === 'hero' ? '✅ Saved!' : 'Save Hero Content'}
          </button>
        </div>
      )}
      {/* Services */}
      {activeTab === 'services' && (
        <div className="space-y-4 max-w-2xl">
          <h2 className="font-bold text-darkText">Services</h2>
          {(content.services || []).map((s: any, i: number) => (
            <div key={i} className="card space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-darkText">Service {i + 1}</span>
                <button onClick={() => removeArrayItem('services', i)} className="text-red text-sm">🗑 Remove</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Icon (emoji)</label><input className="input" value={s.icon || ''} onChange={e => updateArrayItem('services', i, 'icon', e.target.value)} /></div>
                <div><label className="label">Title</label><input className="input" value={s.title || ''} onChange={e => updateArrayItem('services', i, 'title', e.target.value)} /></div>
              </div>
              <div><label className="label">Description</label><textarea className="input" rows={2} value={s.body || ''} onChange={e => updateArrayItem('services', i, 'body', e.target.value)} /></div>
            </div>
          ))}
          <button onClick={() => addArrayItem('services', { icon:'⭐', title:'New Service', color:'#2C4A3E', body:'Description here' })} className="btn-outline w-full justify-center">+ Add Service</button>
          <button onClick={() => save('services', content.services)} disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : saved === 'services' ? '✅ Saved!' : 'Save Services'}
          </button>
        </div>
      )}

      {/* Approach */}
      {activeTab === 'approach' && (
        <div className="space-y-4 max-w-2xl">
          <h2 className="font-bold text-darkText">Our Approach Steps</h2>
          {(content.approach || []).map((s: any, i: number) => (
            <div key={i} className="card space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-darkText">Step {i + 1}</span>
                <button onClick={() => removeArrayItem('approach', i)} className="text-red text-sm">🗑 Remove</button>
              </div>
              <div><label className="label">Title</label><input className="input" value={s.title || ''} onChange={e => updateArrayItem('approach', i, 'title', e.target.value)} /></div>
              <div><label className="label">Description</label><textarea className="input" rows={2} value={s.body || ''} onChange={e => updateArrayItem('approach', i, 'body', e.target.value)} /></div>
            </div>
          ))}
          <button onClick={() => addArrayItem('approach', { n: String((content.approach?.length || 0) + 1), title:'New Step', body:'Description here' })} className="btn-outline w-full justify-center">+ Add Step</button>
          <button onClick={() => save('approach', content.approach)} disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : saved === 'approach' ? '✅ Saved!' : 'Save Approach'}
          </button>
        </div>
      )}

      {/* FAQs */}
      {activeTab === 'faqs' && (
        <div className="space-y-4 max-w-2xl">
          <h2 className="font-bold text-darkText">FAQs</h2>
          {(content.faqs || []).map((f: any, i: number) => (
            <div key={i} className="card space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-darkText">FAQ {i + 1}</span>
                <button onClick={() => removeArrayItem('faqs', i)} className="text-red text-sm">🗑 Remove</button>
              </div>
              <div><label className="label">Question</label><input className="input" value={f.q || ''} onChange={e => updateArrayItem('faqs', i, 'q', e.target.value)} /></div>
              <div><label className="label">Answer</label><textarea className="input" rows={2} value={f.a || ''} onChange={e => updateArrayItem('faqs', i, 'a', e.target.value)} /></div>
            </div>
          ))}
          <button onClick={() => addArrayItem('faqs', { q:'New question?', a:'Answer here' })} className="btn-outline w-full justify-center">+ Add FAQ</button>
          <button onClick={() => save('faqs', content.faqs)} disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : saved === 'faqs' ? '✅ Saved!' : 'Save FAQs'}
          </button>
        </div>
      )}

      {/* Testimonials */}
      {activeTab === 'testimonials' && (
        <div className="space-y-4 max-w-2xl">
          <h2 className="font-bold text-darkText">Testimonials</h2>
          {(content.testimonials || []).map((t: any, i: number) => (
            <div key={i} className="card space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-darkText">Testimonial {i + 1}</span>
                <button onClick={() => removeArrayItem('testimonials', i)} className="text-red text-sm">🗑 Remove</button>
              </div>
              <div><label className="label">Quote</label><textarea className="input" rows={3} value={t.q || ''} onChange={e => updateArrayItem('testimonials', i, 'q', e.target.value)} /></div>
              <div><label className="label">Name</label><input className="input" value={t.name || ''} onChange={e => updateArrayItem('testimonials', i, 'name', e.target.value)} /></div>
              <div><label className="label">Church / Organization</label><input className="input" value={t.church || ''} onChange={e => updateArrayItem('testimonials', i, 'church', e.target.value)} /></div>
            </div>
          ))}
          <button onClick={() => addArrayItem('testimonials', { q:'Quote here', name:'Pastor Name', church:'Church Name, City ST' })} className="btn-outline w-full justify-center">+ Add Testimonial</button>
          <button onClick={() => save('testimonials', content.testimonials)} disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : saved === 'testimonials' ? '✅ Saved!' : 'Save Testimonials'}
          </button>
        </div>
      )}
    </div>
  )
}
