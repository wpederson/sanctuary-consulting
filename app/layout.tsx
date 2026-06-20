import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sanctuary Consulting — Places of Worship Safety & Security',
  description: 'Culture-first security consulting for places of worship.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-cream text-darkText antialiased">{children}</body>
    </html>
  )
}
