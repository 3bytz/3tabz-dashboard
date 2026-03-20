import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
  title: '3TABZ Admin — Account Setup',
  description: 'Set up your 3TABZ admin account',
}

export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-[#0a0a0a]">
        {children}
      </body>
    </html>
  )
}
