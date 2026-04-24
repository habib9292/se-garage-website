import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, FileText, Receipt, AlertCircle, ArrowRight, Plus } from 'lucide-react'
import { documents, clients, calculer } from './storage'

function fmt(n) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n || 0)
}

const STATUT_LABELS = {
  brouillon: 'Brouillon', envoye: 'Envoyé', accepte: 'Accepté',
  refuse: 'Refusé', paye: 'Payé', en_retard: 'En retard',
}
const STATUT_COLORS = {
  brouillon: 'bg-acier/20 text-acier',
  envoye:    'bg-or/20 text-or',
  accepte:   'bg-emerald-900/30 text-emerald-400',
  refuse:    'bg-alerte/20 text-alerte',
  paye:      'bg-emerald-900/40 text-emerald-300',
  en_retard: 'bg-orange-900/30 text-orange-400',
}

function StatCard({ icon: Icon, label, value, sub, accent = false, to }) {
  const inner = (
    <div className={`bg-anthracite border border-acier/10 p-5 hover:border-acier/30 transition-colors
      ${accent ? 'border-or/30' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <p className="font-mono text-xs uppercase tracking-widest text-acier">{label}</p>
        <Icon size={16} className={accent ? 'text-or' : 'text-acier'} />
      </div>
      <p className={`font-display uppercase leading-none ${accent ? 'text-or' : 'text-calcaire'}`}
        style={{ fontSize: '32px' }}>{value}</p>
      {sub && <p className="font-body text-xs text-acier mt-2">{sub}</p>}
    </div>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}

function StatusBadge({ statut }) {
  return (
    <span className={`inline-block px-2 py-0.5 font-mono text-xs uppercase tracking-wide ${STATUT_COLORS[statut] || STATUT_COLORS.brouillon}`}>
      {STATUT_LABELS[statut] || statut}
    </span>
  )
}

function getClientName(doc, clientMap) {
  if (doc.client_id && clientMap[doc.client_id]) {
    const c = clientMap[doc.client_id]
    return `${c.prenom || ''} ${c.nom}`.trim()
  }
  return doc.client_nom_libre || '—'
}

export function Dashboard() {
  const [allDocs, setAllDocs] = useState([])
  const [clientMap, setClientMap] = useState({})

  useEffect(() => {
    async function load() {
      const [docs, allClients] = await Promise.all([
        documents.all(),
        clients.all(),
      ])
      setAllDocs(docs)
      setClientMap(Object.fromEntries(allClients.map(c => [c.id, c])))
    }
    load()
  }, [])

  const stats = useMemo(() => {
    const thisMonth = new Date().toISOString().slice(0, 7)
    const factures = allDocs.filter(d => d.type === 'facture')
    const avoirs   = allDocs.filter(d => d.type === 'avoir')
    const devis    = allDocs.filter(d => d.type === 'devis')

    const avoirsMois  = avoirs
      .filter(a => a.date_emission?.startsWith(thisMonth))
      .reduce((s, a) => s + calculer(a.lignes, a.remise_globale, a.tva_applicable, a.tva_taux).totalTTC, 0)
    const avoirsTotal = avoirs
      .reduce((s, a) => s + calculer(a.lignes, a.remise_globale, a.tva_applicable, a.tva_taux).totalTTC, 0)

    const caMois = factures
      .filter(f => f.statut === 'paye' && f.date_emission?.startsWith(thisMonth))
      .reduce((s, f) => s + calculer(f.lignes, f.remise_globale, f.tva_applicable, f.tva_taux).totalTTC, 0) - avoirsMois
    const caTotal = factures
      .filter(f => f.statut === 'paye')
      .reduce((s, f) => s + calculer(f.lignes, f.remise_globale, f.tva_applicable, f.tva_taux).totalTTC, 0) - avoirsTotal

    const devisEnAttente    = devis.filter(d => d.statut === 'envoye').length
    const facturesImpayees  = factures.filter(f => ['envoye', 'en_retard'].includes(f.statut)).length
    const recent = allDocs.slice(0, 8).map(d => ({ ...d, clientName: getClientName(d, clientMap) }))

    return { caTotal, caMois, devisEnAttente, facturesImpayees, recent }
  }, [allDocs, clientMap])

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-or mb-1">Tableau de bord</p>
          <h1 className="font-display text-calcaire uppercase" style={{ fontSize: '36px' }}>Dashboard</h1>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/devis/nouveau"
            className="flex items-center gap-2 px-4 py-2 border border-acier/30 text-calcaire font-body text-sm hover:border-or/50 hover:text-or transition-all">
            <Plus size={14} /> Devis
          </Link>
          <Link to="/admin/factures/nouvelle"
            className="flex items-center gap-2 px-4 py-2 bg-or text-anthracite font-body text-sm font-semibold hover:opacity-90 transition-opacity">
            <Plus size={14} /> Facture
          </Link>
        </div>
      </div>

      <div className="h-px w-full bg-acier/10 mb-8" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <StatCard icon={TrendingUp} label="CA ce mois" value={fmt(stats.caMois)} accent />
        <StatCard icon={TrendingUp} label="CA total" value={fmt(stats.caTotal)} />
        <StatCard icon={FileText} label="Devis en attente" value={stats.devisEnAttente} to="/admin/devis" />
        <StatCard icon={AlertCircle} label="Factures impayées" value={stats.facturesImpayees} to="/admin/factures" />
      </div>

      <div className="bg-anthracite border border-acier/10">
        <div className="flex items-center justify-between px-6 py-4 border-b border-acier/10">
          <p className="font-mono text-xs uppercase tracking-widest text-or">Documents récents</p>
          <Link to="/admin/devis" className="font-mono text-xs text-acier hover:text-calcaire flex items-center gap-1 transition-colors">
            Tout voir <ArrowRight size={12} />
          </Link>
        </div>
        {stats.recent.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <FileText size={36} className="mx-auto text-acier/30 mb-3" />
            <p className="font-body text-acier text-sm">Aucun document</p>
            <Link to="/admin/devis/nouveau" className="mt-3 inline-block font-mono text-xs text-or hover:underline">
              Créer votre premier devis →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-acier/5">
            {stats.recent.map(doc => {
              const totaux = calculer(doc.lignes, doc.remise_globale, doc.tva_applicable, doc.tva_taux)
              return (
                <Link
                  key={doc.id}
                  to={`/admin/${doc.type === 'devis' ? 'devis' : doc.type === 'avoir' ? 'avoirs' : 'factures'}/${doc.id}`}
                  className="flex items-center justify-between px-6 py-3.5 hover:bg-acier/5 transition-colors group gap-2"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className={`font-mono text-xs px-1.5 py-0.5 flex-shrink-0 ${doc.type === 'devis' ? 'text-or bg-or/10' : doc.type === 'avoir' ? 'text-alerte bg-alerte/10' : 'text-calcaire bg-acier/10'}`}>
                      {doc.type === 'devis' ? 'DEV' : doc.type === 'avoir' ? 'AV' : 'FAC'}
                    </span>
                    <div className="min-w-0">
                      <p className="font-body text-sm text-calcaire truncate">{doc.numero}</p>
                      <p className="font-body text-xs text-acier truncate">{doc.clientName} · {doc.date_emission}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2 flex-shrink-0">
                    <StatusBadge statut={doc.statut} />
                    <span className="font-display text-or whitespace-nowrap" style={{ fontSize: '18px' }}>{fmt(totaux.totalTTC)}</span>
                    <ArrowRight size={13} className="text-acier/30 group-hover:text-acier transition-colors hidden sm:block" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
