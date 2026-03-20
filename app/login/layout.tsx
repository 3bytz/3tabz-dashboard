import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
  title: '3TABZ Admin — Sign In',
  description: '3TABZ platform administration dashboard login page',
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="w-full h-full bg-red-500">
      <body className="flex-1 align-middle w-full h-full bg-red-500">
        {children}
      </body>
    </html>
  )
}
