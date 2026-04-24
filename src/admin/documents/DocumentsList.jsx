import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, Trash2, Eye, FileText, Receipt, FileMinus, Filter } from 'lucide-react'
import { documents, clients, calculer } from '../storage'

function fmt(n) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n || 0)
}

const STATUTS = {
  devis:   ['brouillon', 'envoye', 'accepte', 'refuse'],
  facture: ['brouillon', 'envoye', 'paye', 'en_retard'],
  avoir:   ['brouillon', 'envoye', 'paye'],
}
const STATUT_LABELS = {
  brouillon: 'Brouillon', envoye: 'Envoyé', accepte: 'Accepté',
  refuse: 'Refusé', paye: 'Payé', en_retard: 'En retard',
  avoir_emis: 'Avoir émis',
}
const STATUT_COLORS = {
  brouillon:  'bg-acier/20 text-acier',
  envoye:     'bg-or/20 text-or',
  accepte:    'bg-emerald-900/30 text-emerald-400',
  refuse:     'bg-alerte/20 text-alerte',
  paye:       'bg-emerald-900/40 text-emerald-300',
  en_retard:  'bg-orange-900/30 text-orange-400',
  avoir_emis: 'bg-purple-900/30 text-purple-400',
}

function StatusBadge({ statut }) {
  return (
    <span className={`font-mono text-xs uppercase tracking-wide px-2 py-0.5 ${STATUT_COLORS[statut] || STATUT_COLORS.brouillon}`}>
      {STATUT_LABELS[statut] || statut}
    </span>
  )
}

function StatutSelect({ type, statut, onChange }) {
  return (
    <div className="relative inline-flex items-center">
      <select
        value={statut}
        onChange={e => { e.stopPropagation(); onChange(e.target.value) }}
        onClick={e => e.stopPropagation()}
        className={`font-mono text-xs uppercase tracking-wide pl-2 pr-6 py-0.5 border-0 outline-none cursor-pointer appearance-none rounded-none ${STATUT_COLORS[statut] || STATUT_COLORS.brouillon}`}
      >
        {STATUTS[type].map(s => (
          <option key={s} value={s} className="bg-anthracite text-calcaire normal-case">
            {STATUT_LABELS[s]}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] leading-none">▾</span>
    </div>
  )
}

function getClientName(doc, clientMap) {
  if (doc.client_id && clientMap[doc.client_id]) {
    const c = clientMap[doc.client_id]
    return `${c.prenom || ''} ${c.nom}`.trim()
  }
  return doc.client_nom_libre || '—'
}

export function DocumentsList({ type }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filterStatut, setFilterStatut] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [allDocs, setAllDocs] = useState([])
  const [clientMap, setClientMap] = useState({})

  const isDevis = type === 'devis'
  const isAvoir = type === 'avoir'
  const createPath = isDevis ? '/admin/devis/nouveau' : isAvoir ? '/admin/avoirs/nouveau' : '/admin/factures/nouvelle'
  const editPath = (id) => isDevis ? `/admin/devis/${id}` : isAvoir ? `/admin/avoirs/${id}` : `/admin/factures/${id}`

  async function load() {
    const [docs, allClients] = await Promise.all([
      documents.byType(type),
      clients.all(),
    ])
    setAllDocs(docs)
    setClientMap(Object.fromEntries(allClients.map(c => [c.id, c])))
  }

  useEffect(() => { load() }, [type])

  const items = useMemo(() => {
    return allDocs
      .filter(d => {
        const name = getClientName(d, clientMap).toLowerCase()
        const matchSearch = !search || d.numero.toLowerCase().includes(search.toLowerCase()) || name.includes(search.toLowerCase())
        const matchStatut = !filterStatut || d.statut === filterStatut
        return matchSearch && matchStatut
      })
      .map(d => ({
        ...d,
        clientName: getClientName(d, clientMap),
        totaux: calculer(d.lignes, d.remise_globale, d.tva_applicable, d.tva_taux),
      }))
  }, [allDocs, clientMap, search, filterStatut])

  async function handleDelete(id) {
    await documents.delete(id)
    setDeleteConfirm(null)
    load()
  }

  async function handleStatutChange(id, newStatut) {
    await documents.update(id, { statut: newStatut })
    load()
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-or mb-1">Documents</p>
          <h1 className="font-display text-calcaire uppercase flex items-center gap-3" style={{ fontSize: '36px' }}>
            {isDevis
              ? <><FileText size={22} className="text-or" /> Devis</>
              : isAvoir
              ? <><FileMinus size={22} className="text-or" /> Avoirs</>
              : <><Receipt size={22} className="text-or" /> Factures</>
            }
          </h1>
        </div>
        {isAvoir ? (
          <p className="font-mono text-xs text-acier">Créés depuis une facture</p>
        ) : (
          <Link to={createPath}
            className="flex items-center gap-2 px-4 py-2 bg-or text-anthracite font-body text-sm font-semibold hover:opacity-90 transition-opacity">
            <Plus size={14} />
            {isDevis ? 'Nouveau devis' : 'Nouvelle facture'}
          </Link>
        )}
      </div>

      <div className="h-px w-full bg-acier/10 mb-6" />

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-acier" />
          <input
            type="text"
            placeholder="Rechercher numéro ou client..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-anthracite border border-acier/20 text-calcaire font-body text-sm outline-none focus:border-or/50 placeholder-acier/50"
          />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-acier" />
          <select
            value={filterStatut}
            onChange={e => setFilterStatut(e.target.value)}
            className="pl-9 pr-6 py-2 bg-anthracite border border-acier/20 text-calcaire font-body text-sm outline-none focus:border-or/50 appearance-none cursor-pointer"
          >
            <option value="">Tous statuts</option>
            {STATUTS[type].map(s => <option key={s} value={s}>{STATUT_LABELS[s]}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-anthracite border border-acier/10 overflow-x-auto">
        {items.length === 0 ? (
          <div className="py-16 text-center">
            <div className="text-acier/20 mb-4">{isDevis ? <FileText size={48} className="mx-auto" /> : <Receipt size={48} className="mx-auto" />}</div>
            <p className="font-body text-acier text-sm mb-4">
              {search || filterStatut ? 'Aucun résultat' : `Aucun ${isDevis ? 'devis' : 'facture'}`}
            </p>
            {!search && !filterStatut && !isAvoir && (
              <Link to={createPath} className="font-mono text-xs text-or hover:underline">
                Créer {isDevis ? 'un devis' : 'une facture'} →
              </Link>
            )}
          </div>
        ) : (
          <div className="min-w-[700px]">
            <div className="grid grid-cols-[160px_1fr_100px_160px_110px_56px] gap-4 px-6 py-2.5 border-b border-acier/10 bg-forge">
              <span className="font-mono text-xs uppercase tracking-widest text-acier">Numéro</span>
              <span className="font-mono text-xs uppercase tracking-widest text-acier">Client</span>
              <span className="font-mono text-xs uppercase tracking-widest text-acier hidden lg:block">Date</span>
              <span className="font-mono text-xs uppercase tracking-widest text-acier hidden lg:block">Statut</span>
              <span className="font-mono text-xs uppercase tracking-widest text-acier text-right">TTC</span>
              <span></span>
            </div>
            <div className="divide-y divide-acier/5">
              {items.map(doc => (
                <div key={doc.id} className="group grid grid-cols-[160px_1fr_100px_160px_110px_56px] gap-4 items-center px-6 py-3.5 hover:bg-acier/5 transition-colors">
                  <Link to={editPath(doc.id)} className="font-mono text-sm text-or hover:underline whitespace-nowrap">
                    {doc.numero}
                  </Link>
                  <span className="font-body text-sm text-calcaire truncate min-w-0">{doc.clientName}</span>
                  <span className="font-mono text-xs text-acier hidden lg:block">{doc.date_emission}</span>
                  <span className="hidden lg:block">
                    <StatutSelect type={type} statut={doc.statut} onChange={s => handleStatutChange(doc.id, s)} />
                  </span>
                  <span className="font-display text-or whitespace-nowrap text-right" style={{ fontSize: '18px' }}>
                    {fmt(doc.totaux.totalTTC)}
                  </span>
                  <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link to={editPath(doc.id)} className="p-1 text-acier hover:text-or transition-colors" title="Ouvrir">
                        <Eye size={14} />
                      </Link>
                      <button onClick={() => setDeleteConfirm(doc.id)} className="p-1 text-acier hover:text-alerte transition-colors" title="Supprimer">
                        <Trash2 size={14} />
                      </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-anthracite border border-acier/20 p-6 max-w-sm w-full">
            <h3 className="font-display text-calcaire uppercase mb-2" style={{ fontSize: '22px' }}>Supprimer ?</h3>
            <p className="font-body text-sm text-acier mb-5">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-acier/30 text-acier font-body text-sm hover:text-calcaire transition-colors">
                Annuler
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 bg-alerte text-calcaire font-body text-sm font-semibold hover:opacity-90">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
