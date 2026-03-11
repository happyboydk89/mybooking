'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/Navbar'

interface AppChromeProps {
  children: React.ReactNode
}

export function AppChrome({ children }: AppChromeProps) {
  const pathname = usePathname()
  const isDashboardRoute =
    pathname === '/dashboard' || pathname.startsWith('/dashboard/')

  if (isDashboardRoute) {
    return <main className="min-h-screen">{children}</main>
  }

  return (
    <>
      {/* Modern Navigation */}
      <Navbar />
      {/* Page Content */}
      <main className="min-h-screen">{children}</main>
      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">BookingPro</h3>
              <p className="text-slate-400 text-sm">
                Professional booking platform for all industries
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Security
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex justify-between items-center text-sm text-slate-400">
            <p>&copy; 2026 BookingPro. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition">
                Twitter
              </a>
              <a href="#" className="hover:text-white transition">
                GitHub
              </a>
              <a href="#" className="hover:text-white transition">
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
