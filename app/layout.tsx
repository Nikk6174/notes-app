import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Notes App',
  description: 'Multi-tenant SaaS Notes Application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}