'use client'
import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname === '/login') {
    return <>{children}</>
  }

  return (
    <>
      <Sidebar />

      {/* Right side: header + scrollable main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </>
  )
}
