import { NavLink, useNavigate, Outlet } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Receipt, Users, LogOut,
  Menu, X, BookOpen, FileMinus,
} from 'lucide-react'
import { useState } from 'react'
import { logout } from './AdminLogin'

const NAV = [
  { to: '/admin/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/devis',      icon: FileText,         label: 'Devis' },
  { to: '/admin/factures',   icon: Receipt,          label: 'Factures' },
  { to: '/admin/avoirs',     icon: FileMinus,        label: 'Avoirs' },
  { to: '/admin/clients',    icon: Users,            label: 'Clients' },
  { to: '/admin/catalogue',  icon: BookOpen,         label: 'Catalogue' },
]

export function AdminLayout() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/admin/login')
  }

  return (
    <div className="flex h-screen bg-forge overflow-hidden" style={{ cursor: 'default' }}>
      {/* Sidebar overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-60 bg-anthracite border-r border-acier/10 flex flex-col
        transition-transform duration-300 lg:translate-x-0
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="px-6 py-6 border-b border-acier/10">
          <div className="flex items-center justify-between">
            <NavLink to="/admin/dashboard" onClick={() => setOpen(false)}>
              <h1 className="font-display text-calcaire uppercase tracking-widest hover:text-or transition-colors" style={{ fontSize: '26px' }}>
                S.E <span className="text-or">GARAGE</span>
              </h1>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-acier mt-1">Facturation</p>
            </NavLink>
            <button onClick={() => setOpen(false)} className="lg:hidden text-acier hover:text-calcaire">
              <X size={18} />
            </button>
          </div>
          <div className="h-px w-full bg-or/20 mt-4" />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 font-body text-sm font-medium transition-all
                ${isActive
                  ? 'bg-or/10 text-or border-l-2 border-or pl-[10px]'
                  : 'text-acier hover:text-calcaire hover:bg-acier/5 border-l-2 border-transparent'
                }
              `}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-acier/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 font-body text-sm text-acier hover:text-calcaire hover:bg-acier/5 transition-all"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-anthracite border-b border-acier/10">
          <button onClick={() => setOpen(true)} className="text-acier hover:text-calcaire">
            <Menu size={20} />
          </button>
          <span className="font-display uppercase tracking-widest text-calcaire" style={{ fontSize: '22px' }}>
            S.E <span className="text-or">GARAGE</span>
          </span>
          <div className="w-6" />
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
