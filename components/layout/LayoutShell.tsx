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
      <div className="w-full flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="w-full flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </>
  )
}
