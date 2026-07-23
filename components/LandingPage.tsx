'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function LandingPage() {
  const [contactSuccess, setContactSuccess] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [org, setOrg] = useState('')
  const [msg, setMsg] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

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
    setMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-forest/97 backdrop-blur-sm shadow-lg">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollTo('hero')}>
            <div className="relative w-10 h-10">
              <svg viewBox="0 0 40 40" className="w-10 h-10">
                <circle cx="20" cy="20" r="18" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
                <circle cx="20" cy="20" r="12" fill="rgba(255,255,255,0.12)"/>
                <text x="20" y="26" textAnchor="middle" fontSize="16" fill="white">🤝</text>
              </svg>
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-tight font-serif">CULTURE FIRST</div>
              <div className="text-goldLt text-xs tracking-widest uppercase" style={{fontSize:'8px'}}>Consulting</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {['Services','Approach','FAQs','Testimonials','Contact'].map(item => (
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
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white"/>
          <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-goldLt"/>
        </div>
        <div className="relative max-w-4xl mx-auto">
          {/* Animated logo */}
          <div className="flex justify-center mb-8">
            <div className="flex flex-col items-center gap-4">
              <div className="relative" style={{animation: 'spin3d 8s linear infinite', transformStyle: 'preserve-3d'}}>
                <style>{`
                  @keyframes spin3d { 0% { transform: rotateY(0deg); } 100% { transform: rotateY(360deg); } }
                `}</style>
                <div className="w-36 h-36 rounded-3xl flex items-center justify-center shadow-2xl"
                  style={{background:'rgba(255,255,255,0.12)', border:'2px solid rgba(255,255,255,0.22)'}}>
                  <svg viewBox="0 0 80 80" width="96" height="96" xmlns="http://www.w3.org/2000/svg">
                    {/* People/community circle */}
                    <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
                    {/* Center person */}
                    <circle cx="40" cy="32" r="7" fill="rgba(255,255,255,0.9)"/>
                    <path d="M28 52 Q40 44 52 52" fill="rgba(255,255,255,0.9)" stroke="none"/>
                    {/* Left person */}
                    <circle cx="22" cy="36" r="5" fill="rgba(255,255,255,0.7)"/>
                    <path d="M14 52 Q22 46 30 52" fill="rgba(255,255,255,0.7)"/>
                    {/* Right person */}
                    <circle cx="58" cy="36" r="5" fill="rgba(255,255,255,0.7)"/>
                    <path d="M50 52 Q58 46 66 52" fill="rgba(255,255,255,0.7)"/>
                    {/* Connection lines */}
                    <line x1="27" y1="36" x2="35" y2="34" stroke="#E8B96A" strokeWidth="1.5" strokeDasharray="2,2"/>
                    <line x1="53" y1="36" x2="45" y2="34" stroke="#E8B96A" strokeWidth="1.5" strokeDasharray="2,2"/>
                    {/* Heart at center bottom */}
                    <path d="M37 60 Q40 57 43 60 Q46 57 46 54 Q46 51 43 51 Q41 51 40 53 Q39 51 37 51 Q34 51 34 54 Q34 57 37 60Z" fill="#E8B96A"/>
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-white tracking-tight font-serif">CULTURE FIRST</div>
                <div className="text-sm tracking-widest text-goldLt uppercase mt-1">Consulting</div>
              </div>
            </div>
          </div>
          <div className="text-goldLt text-xs font-bold tracking-widest uppercase mb-4">Places of Worship Safety & Security Consulting</div>
          <h1 className="text-5xl font-bold font-serif mb-6 leading-tight">
            Protect Your People.<br/><span className="text-goldLt">Preserve Your Culture.</span>
          </h1>
          <p className="text-xl text-sageLt mb-10 max-w-2xl mx-auto leading-relaxed">
            Culture First helps churches, mosques, synagogues, and faith communities build thoughtful security strategies — without changing what makes your community special.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button onClick={() => scrollTo('contact')}
              className="bg-gold text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-amber transition-colors shadow-lg">
              Schedule a Free Consultation
            </button>
            <button onClick={() => scrollTo('services')}
              className="border-2 border-white/40 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-colors">
              Explore Our Services
            </button>
          </div>
          <div className="flex justify-center gap-12 mt-16 flex-wrap">
            {[['50+','Congregations Served'],['15+','Years Experience'],['100%','Culture-First'],['0','One-Size-Fits-All Plans']].map(([val,label]) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-bold text-white">{val}</div>
                <div className="text-sageLt text-xs mt-1">{label}</div>
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
          <p className="text-midGray mt-4 max-w-xl mx-auto">Every congregation is different. We design security strategies from the inside out — starting with your values, your people, and your culture.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon:'🛡', title:'Security Strategy', color:'#2C4A3E', body:'A comprehensive framework tailored to your congregation size, culture, and risk profile. Includes policy templates and implementation roadmap.' },
            { icon:'🎓', title:'De-Escalation Training', color:'#5C8374', body:'Hands-on training using the CALM framework. Covers crisis recognition, verbal de-escalation, and mental health awareness.' },
            { icon:'👥', title:'Volunteer Development', color:'#2E7D6B', body:'Identify, vet, and train the right people — leaders who reflect your congregation\'s warmth while providing thoughtful safety coverage.' },
            { icon:'📋', title:'Policy Writing', color:'#C8963E', body:'Clear, practical written policies covering use of force, communication protocols, trespassing procedures, and documentation.' },
            { icon:'🧠', title:'Mental Health Readiness', color:'#D4820A', body:'Training and protocols for behavioral health situations — the most common type of security incident at places of worship.' },
            { icon:'🔄', title:'Ongoing Support', color:'#2C4A3E', body:'Quarterly check-ins, annual training refreshers, policy reviews, and access to your digital resource library.' },
          ].map(s => (
            <div key={s.title} className="bg-white rounded-2xl p-6 shadow-sm border-t-4" style={{borderTopColor: s.color}}>
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
            <p className="text-midGray leading-relaxed">We don't believe security and hospitality are in conflict. The best safety teams are your most welcoming people — trained to notice and respond, without anyone feeling watched.</p>
          </div>
          <div className="space-y-6">
            {[
              { n:'1', title:'Listen First', body:'We start by understanding your congregation\'s identity, culture, values, and specific concerns. Your words shape everything.' },
              { n:'2', title:'Assess Honestly', body:'A frank assessment of your current safety posture — what\'s working, what\'s missing, and what matters most.' },
              { n:'3', title:'Build Together', body:'We co-create a plan with your leadership — one everyone feels ownership over and fits how you already operate.' },
              { n:'4', title:'Train & Sustain', body:'Hands-on training, written resources, and ongoing support through your client portal.' },
            ].map(step => (
              <div key={step.n} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center font-bold flex-shrink-0">{step.n}</div>
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
          {[
            { q:'"Security doesn\'t belong in a church."', a:'We agree a militarized presence has no place in a house of worship. What we build looks like hospitality with awareness — warm, discreet, and deeply pastoral.' },
            { q:'"We don\'t want people to feel uncomfortable."', a:'Done well, security increases warmth. People feel safer when they sense someone is paying caring attention.' },
            { q:'"We can\'t afford paid security."', a:'You don\'t need it. A small, well-trained volunteer team built from your own congregation is often more effective.' },
            { q:'"This will change who we are."', a:'That\'s our primary commitment: it won\'t. Every decision is filtered through your identity and values.' },
            { q:'"We\'re not comfortable with firearms."', a:'A completely valid position. An unarmed, trained team handles the vast majority of incidents effectively.' },
            { q:'"We don\'t know where to start."', a:'That\'s exactly why we\'re here. One conversation is enough to get oriented. No pressure, no predetermined plan.' },
          ].map(faq => (
            <div key={faq.q} className="bg-white rounded-xl p-5 border-l-4 border-sage">
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
            {[
              { q:'We were hesitant for years. Culture First helped us build something that feels completely like us. Nobody even knows we have a safety team.', name:'Pastor Sarah Mitchell', church:'Grace Community Church, Nashville TN' },
              { q:'The de-escalation training changed how our whole staff thinks about care. We\'ve handled three situations this year calmly and quietly.', name:'Elder James Thornton', church:'Riverside Fellowship, Memphis TN' },
              { q:'I was the biggest skeptic on our board. Now I tell every pastor I know: don\'t wait. Culture First made this feel manageable.', name:'Deacon Marcus Webb', church:'New Hope Baptist, Knoxville TN' },
            ].map(t => (
              <div key={t.name} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="text-4xl text-gold leading-none mb-3">"</div>
                <p className="text-darkText italic text-sm leading-relaxed mb-4">{t.q}</p>
                <div className="font-bold text-forest text-sm">{t.name}</div>
                <div className="text-midGray text-xs">{t.church}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 px-6 bg-forest text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold font-serif mb-4">Ready to start the conversation?</h2>
          <p className="text-sageLt mb-10">No commitment, no pressure, no predetermined plan. Just an honest conversation about your congregation.</p>
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
                <label className="block text-xs font-bold text-sageLt uppercase tracking-wide mb-1">Congregation / Organization</label>
                <input type="text" value={org} onChange={e=>setOrg(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm text-darkText bg-white/90 border-0 focus:outline-none focus:ring-2 focus:ring-gold"
                  placeholder="Grace Community Church" />
              </div>
              <div>
                <label className="block text-xs font-bold text-sageLt uppercase tracking-wide mb-1">What's on your mind?</label>
                <textarea rows={3} value={msg} onChange={e=>setMsg(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm text-darkText bg-white/90 border-0 focus:outline-none focus:ring-2 focus:ring-gold resize-none"
                  placeholder="Tell us a bit about your congregation…" />
              </div>
              {contactSuccess ? (
                <div className="bg-green/20 border border-green/40 rounded-lg px-4 py-3 text-white font-semibold text-sm text-center">
                  ✅ Message sent! We'll be in touch within one business day.
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
