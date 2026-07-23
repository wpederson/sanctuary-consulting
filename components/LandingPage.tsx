'use client'
import { useState } from 'react'
import Link from 'next/link'

interface Props { content?: Record<string, any> }

export default function LandingPage({ content = {} }: Props) {
  const [contactSuccess, setContactSuccess] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [org, setOrg] = useState('')
  const [msg, setMsg] = useState('')

  const hero = content.hero || {}
  const services = content.services || [
    { icon:'🛡', title:'Security Strategy', color:'#2C4A3E', body:'A comprehensive framework tailored to your congregation size, culture, and risk profile.' },
    { icon:'🎓', title:'De-Escalation Training', color:'#5C8374', body:'Hands-on training using the CALM framework. Covers crisis recognition and verbal de-escalation.' },
    { icon:'👥', title:'Volunteer Development', color:'#2E7D6B', body:'Identify, vet, and train the right people who reflect your warmth while providing safety coverage.' },
    { icon:'📋', title:'Policy Writing', color:'#C8963E', body:'Clear, practical written policies covering use of force, communication protocols, and documentation.' },
    { icon:'🧠', title:'Mental Health Readiness', color:'#D4820A', body:'Training and protocols for behavioral health situations — the most common security incident at places of worship.' },
    { icon:'🔄', title:'Ongoing Support', color:'#2C4A3E', body:'Quarterly check-ins, annual training refreshers, and access to your digital resource library.' },
  ]
  const approach = content.approach || [
    { n:'1', title:'Listen First', body:'We start by understanding your identity, culture, values, and concerns.' },
    { n:'2', title:'Assess Honestly', body:'A frank assessment of your current safety posture — what is working and what is missing.' },
    { n:'3', title:'Build Together', body:'We co-create a plan with your leadership that everyone feels ownership over.' },
    { n:'4', title:'Train and Sustain', body:'Hands-on training, written resources, and ongoing support through your client portal.' },
  ]
  const faqs = content.faqs || [
    { q:'Security does not belong in a church.', a:'We agree a militarized presence has no place in a house of worship. What we build looks like hospitality with awareness.' },
    { q:'We do not want people to feel uncomfortable.', a:'Done well, security increases warmth. People feel safer when they sense someone is paying caring attention.' },
    { q:'We cannot afford paid security.', a:'You do not need it. A small, well-trained volunteer team is often more effective.' },
    { q:'This will change who we are.', a:'That is our primary commitment: it will not. Every decision is filtered through your identity and values.' },
    { q:'We are not comfortable with firearms.', a:'A completely valid position. An unarmed, trained team handles the vast majority of incidents effectively.' },
    { q:'We do not know where to start.', a:'That is exactly why we are here. One conversation is enough. No pressure, no predetermined plan.' },
  ]
  const testimonials = content.testimonials || [
    { q:'We were hesitant for years. Culture First helped us build something that feels completely like us. Nobody even knows we have a safety team.', name:'Pastor Sarah Mitchell', church:'Grace Community Church, Nashville TN' },
    { q:'The de-escalation training changed how our whole staff thinks about care. We have handled three situations this year calmly and quietly.', name:'Elder James Thornton', church:'Riverside Fellowship, Memphis TN' },
    { q:'I was the biggest skeptic on our board. Now I tell every pastor I know: do not wait. Culture First made this feel manageable.', name:'Deacon Marcus Webb', church:'New Hope Baptist, Knoxville TN' },
  ]
  const about = content.about || {}

  async function handleContact(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email) return
    const subject = encodeURIComponent(`Culture First Consulting Inquiry — ${name}${org ? ' · ' + org : ''}`)
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nOrganization: ${org || 'Not specified'}\n\nMessage:\n${msg || 'No message provided.'}`)
    window.location.href = `mailto:wespederson@comcast.net?subject=${subject}&body=${body}`
    setContactSuccess(true)
    setName(''); setEmail(''); setOrg(''); setMsg('')
  }

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">

      {/* Nav */}
      <nav className="sticky top-0 z-50 shadow-lg" style={{background:'#2C4A3E'}}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollTo('hero')}>
            <div className="text-2xl">🤝</div>
            <div>
              <div className="text-white font-bold text-sm leading-tight font-serif">CULTURE FIRST</div>
              <div className="text-goldLt text-xs tracking-widest uppercase" style={{fontSize:'8px'}}>Consulting</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {['Services','Approach','FAQs','Testimonials','About','Contact'].map(item => (
              <button key={item} onClick={() => scrollTo(item.toLowerCase())}
                className="text-sageLt text-sm font-semibold hover:text-white transition-colors">
                {item}
              </button>
            ))}
          </div>
          <Link href="/login" className="bg-gold text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-amber transition-colors">
            Client Login
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section id="hero" className="bg-forest text-white py-24 px-6 text-center relative overflow-hidden">
        <div className="relative max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <div className="flex flex-col items-center gap-4">
              <div style={{animation:'spin3d 8s linear infinite', transformStyle:'preserve-3d'}}>
                <style>{`@keyframes spin3d { 0% { transform: rotateY(0deg); } 100% { transform: rotateY(360deg); } }`}</style>
                <div className="w-36 h-36 rounded-3xl flex items-center justify-center shadow-2xl"
                  style={{background:'rgba(255,255,255,0.12)', border:'2px solid rgba(255,255,255,0.22)'}}>
                  <svg viewBox="0 0 80 80" width="96" height="96">
                    <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
                    <circle cx="40" cy="32" r="7" fill="rgba(255,255,255,0.9)"/>
                    <path d="M28 52 Q40 44 52 52" fill="rgba(255,255,255,0.9)"/>
                    <circle cx="22" cy="36" r="5" fill="rgba(255,255,255,0.7)"/>
                    <path d="M14 52 Q22 46 30 52" fill="rgba(255,255,255,0.7)"/>
                    <circle cx="58" cy="36" r="5" fill="rgba(255,255,255,0.7)"/>
                    <path d="M50 52 Q58 46 66 52" fill="rgba(255,255,255,0.7)"/>
                    <line x1="27" y1="36" x2="35" y2="34" stroke="#E8B96A" strokeWidth="1.5" strokeDasharray="2,2"/>
                    <line x1="53" y1="36" x2="45" y2="34" stroke="#E8B96A" strokeWidth="1.5" strokeDasharray="2,2"/>
                    <path d="M37 60 Q40 57 43 60 Q46 57 46 54 Q46 51 43 51 Q41 51 40 53 Q39 51 37 51 Q34 51 34 54 Q34 57 37 60Z" fill="#E8B96A"/>
                  </svg>
                </div>
              </div>
              <div>
                <div className="text-4xl font-bold text-white tracking-tight font-serif">CULTURE FIRST</div>
                <div className="text-sm tracking-widest text-goldLt uppercase mt-1">Consulting</div>
              </div>
            </div>
          </div>
          <div className="text-goldLt text-xs font-bold tracking-widest uppercase mb-4">
            {hero.eyebrow || 'Places of Worship Safety & Security Consulting'}
          </div>
          <h1 className="text-5xl font-bold font-serif mb-6 leading-tight">
            {hero.headline || 'Protect Your People.'}<br/>
            <span className="text-goldLt">{hero.headline2 || 'Preserve Your Culture.'}</span>
          </h1>
          <p className="text-xl text-sageLt mb-10 max-w-2xl mx-auto leading-relaxed">
            {hero.subtext || 'Culture First helps faith communities build thoughtful security strategies.'}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button onClick={() => scrollTo('contact')}
              className="bg-gold text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-amber transition-colors">
              Schedule a Free Consultation
            </button>
            <button onClick={() => scrollTo('services')}
              className="border-2 border-white/40 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-colors">
              Explore Our Services
            </button>
          </div>
          <div className="flex justify-center gap-12 mt-16 flex-wrap">
            {[
              { val: hero.stat1_val, label: hero.stat1_label },
              { val: hero.stat2_val, label: hero.stat2_label },
              { val: hero.stat3_val, label: hero.stat3_label },
              { val: hero.stat4_val, label: hero.stat4_label },
            ].filter(s => s.val).map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-bold text-white">{s.val}</div>
                <div className="text-sageLt text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Services */}
      <section id="services" className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <div className="text-gold text-xs font-bold tracking-widest uppercase mb-3">What We Do</div>
          <h2 className="text-4xl font-bold font-serif text-darkText">Security that serves your mission</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s: any, i: number) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border-t-4" style={{borderTopColor: s.color}}>
              <div className="text-4xl mb-4">{s.icon}</div>
              <h3 className="text-lg font-bold text-darkText mb-2">{s.title}</h3>
              <p className="text-sm text-midGray leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Approach */}
      <section id="approach" className="py-20 px-6 bg-warm">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-gold text-xs font-bold tracking-widest uppercase mb-3">Our Approach</div>
            <h2 className="text-4xl font-bold font-serif text-darkText mb-4">Culture first. Always.</h2>
            <p className="text-midGray leading-relaxed">We do not believe security and hospitality are in conflict. The best safety teams are your most welcoming people.</p>
          </div>
          <div className="space-y-6">
            {approach.map((step: any, i: number) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center font-bold flex-shrink-0">{step.n || i+1}</div>
                <div>
                  <div className="font-bold text-darkText">{step.title}</div>
                  <div className="text-sm text-midGray mt-1">{step.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faqs" className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <div className="text-gold text-xs font-bold tracking-widest uppercase mb-3">We Hear This Often</div>
          <h2 className="text-4xl font-bold font-serif text-darkText">Your hesitations are valid.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((faq: any, i: number) => (
            <div key={i} className="bg-white rounded-xl p-5 border-l-4 border-sage">
              <div className="font-bold text-darkText text-sm mb-2">{faq.q}</div>
              <div className="text-midGray text-sm leading-relaxed">{faq.a}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6 bg-warm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-gold text-xs font-bold tracking-widest uppercase mb-3">What Leaders Say</div>
            <h2 className="text-4xl font-bold font-serif text-darkText">Trusted by congregations across the region</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t: any, i: number) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="text-4xl text-gold leading-none mb-3">"</div>
                <p className="text-darkText italic text-sm leading-relaxed mb-4">{t.q}</p>
                <div className="font-bold text-forest text-sm">{t.name}</div>
                <div className="text-midGray text-xs">{t.church}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <div className="text-gold text-xs font-bold tracking-widest uppercase mb-3">About</div>
          <h2 className="text-4xl font-bold font-serif text-darkText">Culture First Consulting</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center max-w-4xl mx-auto">
          <div className="flex justify-center">
            <div className="relative">
              <img
                src={about.photo_url || 'https://gxlgweomjiabkoudnrgs.supabase.co/storage/v1/object/public/consultant-photos/1784836375440_Wes_optimized.jpg'}
                alt={about.name || 'Culture First Consulting'}
                className="w-72 h-72 rounded-2xl object-cover shadow-2xl"
              />
              <div className="absolute -bottom-4 -right-4 bg-forest text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg">
                {about.badge || 'Founder & Lead Consultant'}
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold font-serif text-darkText mb-2">{about.name || 'Wes Pederson'}</h3>
            <div className="text-gold text-sm font-semibold mb-6">{about.title || 'Pastor · Safety & Security Consultant'}</div>
            <p className="text-midGray leading-relaxed text-sm">{about.bio || ''}</p>
            <div className="mt-6 flex gap-4 flex-wrap">
              {[1,2,3].map(n => about[`credential${n}_label`] ? (
                <div key={n} className="flex items-center gap-2 text-sm text-midGray">
                  <span className="text-forest font-bold text-lg">{about[`credential${n}_icon`]}</span>
                  {about[`credential${n}_label`]}
                </div>
              ) : null)}
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 px-6 bg-forest text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold font-serif mb-4">Ready to start the conversation?</h2>
          <p className="text-sageLt mb-10">No commitment, no pressure, no predetermined plan.</p>
          <div className="bg-white/10 border border-white/20 rounded-2xl p-8">
            <form onSubmit={handleContact} className="space-y-4 text-left">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-sageLt uppercase tracking-wide mb-1">Your Name *</label>
                  <input type="text" required value={name} onChange={e=>setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm text-darkText bg-white/90 border-0 focus:outline-none focus:ring-2 focus:ring-gold"
                    placeholder="Pastor Jane Smith" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-sageLt uppercase tracking-wide mb-1">Email *</label>
                  <input type="email" required value={email} onChange={e=>setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm text-darkText bg-white/90 border-0 focus:outline-none focus:ring-2 focus:ring-gold"
                    placeholder="jane@yourchurch.org" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-sageLt uppercase tracking-wide mb-1">Congregation</label>
                <input type="text" value={org} onChange={e=>setOrg(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm text-darkText bg-white/90 border-0 focus:outline-none focus:ring-2 focus:ring-gold"
                  placeholder="Grace Community Church" />
              </div>
              <div>
                <label className="block text-xs font-bold text-sageLt uppercase tracking-wide mb-1">Message</label>
                <textarea rows={3} value={msg} onChange={e=>setMsg(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm text-darkText bg-white/90 border-0 focus:outline-none focus:ring-2 focus:ring-gold resize-none"
                  placeholder="Tell us about your congregation…" />
              </div>
              {contactSuccess ? (
                <div className="rounded-lg px-4 py-3 text-white font-semibold text-sm text-center"
                  style={{background:'rgba(30,126,74,0.3)', border:'1px solid rgba(30,126,74,0.5)'}}>
                  ✅ Message sent! We will be in touch within one business day.
                </div>
              ) : (
                <button type="submit" className="w-full bg-gold text-white py-3 rounded-xl font-bold text-lg hover:bg-amber transition-colors">
                  Send My Message →
                </button>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-darkText text-sageLt py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-white font-bold text-lg font-serif">Culture First Consulting</div>
            <div className="text-sm mt-1">Places of Worship · Safety & Security · Culture-First Approach</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-lg">📞</span>
              <a href="tel:6126004034" className="text-goldLt font-bold text-base hover:text-white transition-colors">612-600-4034</a>
              <span className="text-xs">· General Support</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-white font-semibold mb-2">Already a client?</div>
            <Link href="/login" className="bg-gold text-white px-6 py-2 rounded-lg font-bold hover:bg-amber transition-colors">
              Client Portal Login
            </Link>
          </div>
          <div className="text-right text-sm">
            <div>© {new Date().getFullYear()} Culture First Consulting</div>
            <div className="mt-1">All rights reserved</div>
            <a href="mailto:wespederson@comcast.net" className="text-sageLt hover:text-white text-xs mt-1 block">
              wespederson@comcast.net
            </a>
          </div>
        </div>
      </footer>

    </div>
  )
}
