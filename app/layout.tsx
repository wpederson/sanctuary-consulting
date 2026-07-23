import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Culture First Consulting — Places of Worship Safety & Security',
  description: 'Culture-first security consulting for places of worship. Protect your people. Preserve your culture.',
  keywords: 'church security, places of worship safety, faith community security, de-escalation training, security consulting',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-cream text-darkText antialiased">{children}</body>
    </html>
  )
}
