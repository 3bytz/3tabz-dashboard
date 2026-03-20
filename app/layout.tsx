import type { Metadata } from 'next'
import './globals.css'
import { LayoutShell } from '@/components/layout/LayoutShell'
import { ToastProvider } from '@/components/ui/Toast'

export const metadata: Metadata = {
  title: '3TABZ Admin',
  description: '3TABZ platform administration dashboard',
  icons: {
    icon: '/AppIcon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0a]">
        <ToastProvider>
          <div className="flex h-screen w-full overflow-hidden">
            <LayoutShell>
              {children}
            </LayoutShell>
          </div>
        </ToastProvider>
      </body>
    </html>
  )
}
