import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'

const ADMIN_PASSWORD = 'segarage2026'
const SESSION_KEY = 'seg_admin_auth'

export function isAuthenticated() {
  return sessionStorage.getItem(SESSION_KEY) === 'true'
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY)
}

export function AdminLogin() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem(SESSION_KEY, 'true')
        navigate('/admin/dashboard', { replace: true })
      } else {
        setError(true)
        setLoading(false)
        setPassword('')
      }
    }, 500)
  }

  return (
    <div className="min-h-screen bg-forge flex items-center justify-center p-6">
      {/* Background texture */}
      <div className="absolute inset-0 bg-gradient-to-br from-forge via-anthracite/40 to-forge pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-or mb-3">
            Espace privé
          </p>
          <h1 className="font-display text-calcaire uppercase tracking-widest" style={{ fontSize: '52px' }}>
            S.E <span className="text-or">GARAGE</span>
          </h1>
          <div className="h-px w-16 bg-or/40 mx-auto mt-4" />
          <p className="font-body text-acier text-sm mt-3">Facturation & Gestion</p>
        </div>

        {/* Form */}
        <div className="bg-anthracite border border-acier/20 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-mono text-xs uppercase tracking-widest text-acier mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(false) }}
                  placeholder="••••••••••••"
                  className={`w-full px-4 py-3 pr-12 bg-forge border text-calcaire font-body text-sm outline-none transition-all
                    ${error
                      ? 'border-alerte focus:border-alerte'
                      : 'border-acier/30 focus:border-or'
                    }`}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShow(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-acier hover:text-calcaire transition-colors"
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {error && (
                <div className="flex items-center gap-2 mt-2 text-alerte">
                  <AlertCircle size={13} />
                  <span className="font-mono text-xs">Mot de passe incorrect</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!password || loading}
              className="w-full bg-or text-anthracite py-3 font-display uppercase tracking-widest text-lg
                hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Connexion...' : 'Entrer'}
            </button>
          </form>
        </div>

        <p className="text-center font-mono text-xs text-acier/40 mt-6 uppercase tracking-widest">
          13 Avenue de la Gare · Gennevilliers
        </p>
      </div>
    </div>
  )
}
