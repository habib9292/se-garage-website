import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader2, Calendar } from 'lucide-react'

export function Cancel() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('loading') // loading | success | already | error | invalid
  const [info, setInfo]     = useState(null)

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) { setStatus('invalid'); return }

    // Décoder le token pour afficher les infos pendant le chargement
    try {
      const data = JSON.parse(atob(token.replace(/-/g, '+').replace(/_/g, '/')))
      setInfo(data)
    } catch {}

    fetch(`/api/cancel?token=${token}`)
      .then(r => r.json())
      .then(d => setStatus(d.status || 'success'))
      .catch(() => setStatus('error'))
  }, [searchParams])

  const formatDateFr = (dateStr) => {
    if (!dateStr) return ''
    const [y, m, d] = dateStr.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-forge flex items-center justify-center px-6 py-32">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full text-center"
      >
        {/* Chargement */}
        {status === 'loading' && (
          <>
            <Loader2 size={48} className="text-or animate-spin mx-auto mb-6" />
            <h1 className="font-display text-3xl text-calcaire uppercase tracking-wide mb-3">
              Annulation en cours…
            </h1>
            {info && (
              <p className="font-body text-acier text-sm">
                {formatDateFr(info.date)} à {info.slot}
              </p>
            )}
          </>
        )}

        {/* Succès */}
        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className="w-20 h-20 bg-or/10 border border-or/30 flex items-center justify-center mx-auto mb-8"
            >
              <CheckCircle size={40} className="text-or" />
            </motion.div>
            <h1 className="font-display text-4xl text-calcaire uppercase tracking-wide mb-4">
              RDV annulé
            </h1>
            {info && (
              <div className="border border-acier/20 p-4 mb-6 text-left">
                <p className="font-mono text-xs uppercase tracking-widest text-acier/60 mb-1">Créneau annulé</p>
                <p className="font-body text-sm text-calcaire capitalize mb-2">
                  {formatDateFr(info.date)} à {info.slot}
                </p>
                {info.service && (
                  <>
                    <p className="font-mono text-xs uppercase tracking-widest text-acier/60 mb-1">Service</p>
                    <p className="font-body text-sm text-calcaire">{info.service}</p>
                  </>
                )}
              </div>
            )}
            <p className="font-body text-acier text-sm mb-8">
              Votre rendez-vous a été supprimé du calendrier. Vous recevrez une confirmation par email.
            </p>
            <Link
              to="/rendez-vous"
              className="inline-flex items-center gap-2 bg-or text-anthracite px-6 py-3 font-body font-semibold text-sm hover:bg-amber-500 transition-colors"
            >
              <Calendar size={16} />
              Prendre un nouveau RDV
            </Link>
          </>
        )}

        {/* Déjà annulé */}
        {status === 'already' && (
          <>
            <div className="w-20 h-20 bg-acier/10 border border-acier/30 flex items-center justify-center mx-auto mb-8">
              <XCircle size={40} className="text-acier" />
            </div>
            <h1 className="font-display text-3xl text-calcaire uppercase tracking-wide mb-4">
              Déjà annulé
            </h1>
            <p className="font-body text-acier text-sm mb-8">
              Ce rendez-vous a déjà été annulé.
            </p>
            <Link to="/rendez-vous" className="inline-flex items-center gap-2 bg-or text-anthracite px-6 py-3 font-body font-semibold text-sm hover:bg-amber-500 transition-colors">
              <Calendar size={16} />
              Prendre un nouveau RDV
            </Link>
          </>
        )}

        {/* Erreur / invalide */}
        {(status === 'error' || status === 'invalid') && (
          <>
            <div className="w-20 h-20 bg-alerte/10 border border-alerte/30 flex items-center justify-center mx-auto mb-8">
              <XCircle size={40} className="text-alerte" />
            </div>
            <h1 className="font-display text-3xl text-calcaire uppercase tracking-wide mb-4">
              Lien invalide
            </h1>
            <p className="font-body text-acier text-sm mb-8">
              Ce lien d'annulation est invalide ou a expiré. Contactez-nous directement.
            </p>
            <a href="tel:0141114340" className="inline-flex items-center gap-2 bg-or text-anthracite px-6 py-3 font-body font-semibold text-sm hover:bg-amber-500 transition-colors">
              Nous appeler
            </a>
          </>
        )}
      </motion.div>
    </div>
  )
}
