import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = { title: '3TABZ Admin — Sign In', 
  description: '3TABZ platform administration dashboard login page',
 }

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
