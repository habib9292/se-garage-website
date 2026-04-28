import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Save, Printer, Plus, Trash2, ChevronDown,
  FileText, Receipt, ArrowRight, Check, X, Search,
} from 'lucide-react'
import {
  documents as docsStore, clients as clientsStore,
  catalogue, nextNumero, calculer, ligneTotal,
} from '../storage'

function fmt(n) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n || 0)
}

// ─── Statuts ───────────────────────────────────────────────
const STATUT_LABELS = {
  brouillon: 'Brouillon', envoye: 'Envoyé', accepte: 'Accepté',
  refuse: 'Refusé', paye: 'Payé', en_retard: 'En retard',
  avoir_emis: 'Avoir émis',
}
const STATUT_COLORS = {
  brouillon: 'bg-acier/20 text-acier', envoye: 'bg-or/20 text-or',
  accepte: 'bg-emerald-900/30 text-emerald-400', refuse: 'bg-alerte/20 text-alerte',
  paye: 'bg-emerald-900/40 text-emerald-300', en_retard: 'bg-orange-900/30 text-orange-400',
  avoir_emis: 'bg-purple-900/30 text-purple-400',
}

// ─── Client Combobox (saisie libre ou sélection) ──────────
function clientDisplayName(c) {
  const fullName = `${c.prenom ? c.prenom + ' ' : ''}${c.nom || ''}`.trim()
  return fullName || c.societe || ''
}

function ClientCombobox({ allClients, clientId, clientNomLibre, onChange }) {
  const [query, setQuery] = useState(() => {
    if (clientId) {
      const c = allClients.find(c => c.id === clientId)
      return c ? clientDisplayName(c) : ''
    }
    return clientNomLibre || ''
  })
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Sync if parent changes
  useEffect(() => {
    if (clientId) {
      const c = allClients.find(c => c.id === clientId)
      if (c) setQuery(clientDisplayName(c))
    }
  }, [clientId])

  const filtered = allClients.filter(c => {
    const name = clientDisplayName(c).toLowerCase()
    const soc = (c.societe || '').toLowerCase()
    const q = query.toLowerCase()
    return name.includes(q) || soc.includes(q) || (c.telephone || '').includes(q)
  }).slice(0, 8)

  function selectClient(c) {
    setQuery(clientDisplayName(c))
    onChange({ clientId: c.id, clientNomLibre: '' })
    setOpen(false)
  }

  function handleChange(val) {
    setQuery(val)
    onChange({ clientId: '', clientNomLibre: val })
    setOpen(true)
  }

  function handleFocus() {
    setOpen(true)
  }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-acier" />
        <input
          value={query}
          onChange={e => handleChange(e.target.value)}
          onFocus={handleFocus}
          placeholder="Nom du client, société... (saisie libre ou choix)"
          className="w-full pl-9 pr-4 py-2 bg-forge border border-acier/30 text-calcaire font-body text-sm outline-none focus:border-or/60 placeholder-acier/40"
        />
      </div>
      {open && (
        <div className="absolute top-full mt-0.5 left-0 right-0 bg-anthracite border border-acier/30 z-30 max-h-52 overflow-y-auto shadow-xl">
          {filtered.length > 0 ? filtered.map(c => (
            <button
              key={c.id}
              type="button"
              onMouseDown={() => selectClient(c)}
              className="flex items-center justify-between w-full px-4 py-2.5 text-left hover:bg-or/10 transition-colors"
            >
              <div>
                <p className="font-body text-sm text-calcaire">
                  {clientDisplayName(c)}
                  {(c.prenom || c.nom) && c.societe ? <span className="text-acier"> — {c.societe}</span> : null}
                </p>
                {c.telephone && <p className="font-mono text-xs text-acier">{c.telephone}</p>}
              </div>
              {c.id === clientId && <Check size={13} className="text-or" />}
            </button>
          )) : query.trim() ? (
            <div className="px-4 py-3">
              <p className="font-mono text-xs text-acier uppercase tracking-wide">Saisie libre :</p>
              <p className="font-body text-sm text-calcaire mt-0.5">« {query} »</p>
            </div>
          ) : (
            <div className="px-4 py-3">
              <p className="font-mono text-xs text-acier">Aucun client · saisissez un nom</p>
              <Link to="/admin/clients" className="font-mono text-xs text-or hover:underline block mt-1">
                + Créer un client →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Ligne de prestation ──────────────────────────────────
function LigneRow({ ligne, index, onUpdate, onDelete, cat, tvaTaux, tvaApplicable }) {
  const multiplier = tvaApplicable ? (1 + (tvaTaux || 20) / 100) : 1
  const [editingTtc, setEditingTtc] = useState(false)
  const [ttcDraft, setTtcDraft] = useState('')

  function update(field, val) { onUpdate(index, { ...ligne, [field]: val }) }

  const computedTtc = (Math.round(((ligne.prix_unitaire_ht || 0) * multiplier + Number.EPSILON) * 100) / 100).toFixed(2)

  function handleHtChange(e) {
    // Saisie manuelle HT : on garde 2 décimales (utilisateur tape ce qu'il veut)
    update('prix_unitaire_ht', parseFloat(e.target.value) || 0)
  }

  function handleTtcFocus() {
    setEditingTtc(true)
    setTtcDraft(computedTtc)
  }

  function handleTtcChange(e) {
    const raw = e.target.value
    setTtcDraft(raw)
    // Stocker HT avec 4 décimales pour éviter la perte de précision sur plusieurs lignes
    // Ex : TTC=25 → HT=20.8333 (pas 20.83) → 2 lignes = 41.6666 → total HT = 41.67 ✓
    const ht = Math.round(((parseFloat(raw) || 0) / multiplier) * 10000) / 10000
    update('prix_unitaire_ht', ht)
  }

  function handleTtcBlur() {
    setEditingTtc(false)
  }

  return (
    <tr className="group border-b border-acier/10 hover:bg-acier/5">
      <td className="px-3 py-2 text-center font-mono text-xs text-acier w-8">{index + 1}</td>
      <td className="px-2 py-2">
        <input
          value={ligne.description || ''}
          onChange={e => {
            const val = e.target.value
            const match = cat.find(c => c.nom === val)
            if (match) {
              onUpdate(index, { ...ligne, description: val, prix_unitaire_ht: match.prix_ht })
            } else {
              update('description', val)
            }
          }}
          placeholder="Description..."
          list={`cat-${index}`}
          className="w-full bg-transparent text-sm text-calcaire font-body px-2 py-1.5 border border-transparent hover:border-acier/20 focus:border-or/50 outline-none placeholder-acier/30"
        />
        <datalist id={`cat-${index}`}>
          {cat.map(c => <option key={c.id} value={c.nom} />)}
        </datalist>
      </td>
      <td className="px-2 py-2 w-20">
        <input type="number" value={ligne.quantite || 1}
          onChange={e => update('quantite', parseFloat(e.target.value) || 1)}
          min="0.01" step="0.01"
          className="w-full bg-transparent text-sm text-calcaire text-center font-body px-1 py-1.5 border border-transparent hover:border-acier/20 focus:border-or/50 outline-none"
        />
      </td>
      <td className="px-2 py-2 w-28">
        <input type="number" value={ligne.prix_unitaire_ht ? Math.round(ligne.prix_unitaire_ht * 100) / 100 : ''}
          onChange={handleHtChange}
          min="0" step="0.01" placeholder="0.00"
          className="w-full bg-transparent text-sm text-calcaire text-right font-body px-1 py-1.5 border border-transparent hover:border-acier/20 focus:border-or/50 outline-none placeholder-acier/30"
        />
      </td>
      <td className="px-2 py-2 w-28">
        <input
          type="number"
          value={editingTtc ? ttcDraft : computedTtc}
          onFocus={handleTtcFocus}
          onChange={handleTtcChange}
          onBlur={handleTtcBlur}
          min="0" step="0.01" placeholder="0.00"
          className="w-full bg-transparent text-sm text-emerald-400 text-center font-body px-1 py-1.5 border border-transparent hover:border-acier/20 focus:border-emerald-500/50 outline-none placeholder-acier/30"
        />
      </td>
      <td className="px-2 py-2 w-20">
        <div className="flex items-center gap-0.5">
          <input type="number" value={ligne.remise_ligne || 0}
            onChange={e => update('remise_ligne', parseFloat(e.target.value) || 0)}
            min="0" max="100" step="0.5"
            className="w-full bg-transparent text-sm text-calcaire text-center font-body px-1 py-1.5 border border-transparent hover:border-acier/20 focus:border-or/50 outline-none"
          />
          <span className="text-xs text-acier">%</span>
        </div>
      </td>
      <td className="px-2 py-2 w-28 text-right">
        <span className="font-mono text-sm text-or">{fmt(ligneTotal(ligne))}</span>
      </td>
      <td className="px-2 py-2 w-10 text-center">
        <button onClick={() => onDelete(index)}
          className="opacity-0 group-hover:opacity-100 p-1 text-acier hover:text-alerte transition-all">
          <Trash2 size={13} />
        </button>
      </td>
    </tr>
  )
}

// ─── Input field ──────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div className="min-w-0">
      {label && <label className="block font-mono text-xs uppercase tracking-widest text-acier mb-1.5">{label}</label>}
      {children}
    </div>
  )
}

function Input({ label, value, onChange, type = 'text', placeholder = '', className = '', ...rest }) {
  return (
    <Field label={label}>
      <input type={type} value={value || ''} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ minWidth: 0, maxWidth: '100%', width: '100%' }}
        className={`px-3 py-2 bg-forge border border-acier/30 text-calcaire font-body text-sm outline-none focus:border-or/60 placeholder-acier/30 ${className}`}
        {...rest}
      />
    </Field>
  )
}

// ─── Document Editor ──────────────────────────────────────
export function DocumentEditor({ type }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'nouveau' || id === 'nouvelle'
  const isDevis = type === 'devis'
  const isAvoir = type === 'avoir'

  const [doc, setDoc] = useState({
    type,
    numero: '',
    statut: type === 'devis' ? 'envoye' : 'brouillon',
    client_id: '',
    client_nom_libre: '',
    date_emission: new Date().toISOString().split('T')[0],
    date_echeance: isDevis ? '' : new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    date_validite: isDevis ? new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0] : '',
    remise_globale: 0,
    tva_applicable: true,
    tva_taux: 20,
    notes: '',
    conditions_paiement: 'Paiement à 30 jours',
    moyens_paiement: 'Virement, espèces, chèque, CB',
    vehicule_immat: '',
    vehicule_km: '',
    vehicule_marque: '',
  })
  const [lignes, setLignes] = useState([])
  const [saved, setSaved] = useState(false)
  const [showStatutMenu, setShowStatutMenu] = useState(false)
  const [converting, setConverting] = useState(false)
  const [allClients, setAllClients] = useState([])
  const [cat, setCat] = useState([])

  useEffect(() => {
    clientsStore.all().then(setAllClients)
    catalogue.all().then(setCat)
  }, [])

  useEffect(() => {
    async function load() {
      if (!isNew) {
        const existing = await docsStore.byId(id)
        if (existing) {
          setDoc(existing)
          setLignes(existing.lignes.length > 0 ? existing.lignes : [{ description: '', quantite: 1, prix_unitaire_ht: 0, remise_ligne: 0 }])
        }
      } else {
        const num = await nextNumero(type)
        setDoc(prev => ({ ...prev, numero: num }))
      }
    }
    load()
  }, [id, isNew, type])

  function update(field, val) { setDoc(prev => ({ ...prev, [field]: val })) }
  function updateClient({ clientId, clientNomLibre }) {
    setDoc(prev => ({ ...prev, client_id: clientId, client_nom_libre: clientNomLibre }))
  }

  function addLigne() { setLignes(prev => [...prev, { description: '', quantite: 1, prix_unitaire_ht: 0, remise_ligne: 0 }]) }
  function updateLigne(i, updated) { setLignes(prev => prev.map((l, idx) => idx === i ? updated : l)) }
  function deleteLigne(i) { setLignes(prev => prev.filter((_, idx) => idx !== i)) }
  function addFromCat(item) { setLignes(prev => [...prev, { description: item.nom, quantite: 1, prix_unitaire_ht: item.prix_ht, remise_ligne: 0 }]) }

  const totaux = calculer(lignes, doc.remise_globale, doc.tva_applicable, doc.tva_taux)

  async function save() {
    const docData = { ...doc }
    if (isNew) {
      const result = await docsStore.create(docData, lignes)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      const seg = isDevis ? 'devis' : isAvoir ? 'avoirs' : 'factures'
      if (result) navigate(`/admin/${seg}/${result.id}`, { replace: true })
    } else {
      await docsStore.update(id, docData, lignes)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  async function convertToFacture() {
    setConverting(true)
    const facture = await docsStore.convertToFacture(id)
    if (facture) navigate(`/admin/factures/${facture.id}`)
    setConverting(false)
  }

  async function convertToAvoir() {
    setConverting(true)
    try {
      const avoir = await docsStore.convertToAvoir(id)
      if (avoir) navigate(`/admin/avoirs/${avoir.id}`)
    } catch (err) {
      console.error('convertToAvoir error:', err)
      alert('Erreur lors de la création de l\'avoir : ' + (err?.message || err))
    } finally {
      setConverting(false)
    }
  }

  const listPath = isDevis ? '/admin/devis' : isAvoir ? '/admin/avoirs' : '/admin/factures'
  const statutOptions = isDevis
    ? ['brouillon', 'envoye', 'accepte', 'refuse']
    : isAvoir
    ? ['brouillon', 'envoye', 'paye']
    : ['brouillon', 'envoye', 'paye', 'en_retard']

  // Resolve client info for print (lookup sync dans allClients déjà chargés)
  const printClient = useMemo(() => {
    if (doc.client_id) return allClients.find(c => c.id === doc.client_id) || null
    if (doc.client_nom_libre) return { nom: doc.client_nom_libre, _libre: true }
    return null
  }, [doc.client_id, doc.client_nom_libre, allClients])

  function openPrintWindow(autoPrint) {
    const printDiv = document.getElementById('seg-print')
    if (!printDiv) return
    const html = `<!DOCTYPE html><html><head>
<meta charset="utf-8">
<title></title>
<style>
@page { size: A4 portrait; margin: 0mm; }
@page :first { margin: 0mm; }
@page :left  { margin: 0mm; }
@page :right { margin: 0mm; }
* { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
html, body { margin: 0; padding: 0; background: white; }
body { font-family: Arial, Helvetica, sans-serif; font-size: 9pt; color: #111; }
.seg-wrap { padding: 8mm 11mm; }
.seg-inner { display: flex; flex-direction: column; min-height: 281mm; }
.seg-spacer { flex: 1; min-height: 0; }
</style></head>
<body>
<div class="seg-wrap">${printDiv.innerHTML}</div>
<script>
window.addEventListener('load', function() {
  setTimeout(function() {
    var wrap = document.querySelector('.seg-wrap');
    var MM = 96 / 25.4;
    var pageH = 297 * MM;
    var wrapH = wrap ? wrap.scrollHeight : document.body.scrollHeight;
    if (wrapH > pageH) {
      document.body.style.zoom = (pageH / wrapH).toFixed(4);
    }
    ${autoPrint ? 'setTimeout(function(){window.print();},400);' : ''}
  }, 200);
});
<\/script></body></html>`
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const blobUrl = URL.createObjectURL(blob)
    const win = window.open(blobUrl, '_blank', 'width=850,height=1100')
    if (!win) { URL.revokeObjectURL(blobUrl); return }
    win.addEventListener('unload', () => URL.revokeObjectURL(blobUrl))
    win.focus()
  }

  return (
    <>
      {/* Print styles */}
      <style>{`
        #seg-print { position: absolute; left: -9999px; top: 0; width: 21cm; background: white; color: #1a1a1a; }
        @media print {
          @page { size: A4 portrait; margin: 15mm 12mm 15mm 12mm; }
          html, body { overflow: visible !important; height: auto !important; }
          body * { visibility: hidden !important; }
          #seg-print { visibility: visible !important; position: fixed !important; left: 0 !important; top: 0 !important; width: 100% !important; }
          #seg-print * { visibility: visible !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* ── Screen UI ── */}
      <div className="no-print p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <Link to={listPath} className="p-2 text-acier hover:text-calcaire hover:bg-acier/10 transition-colors">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-or">
                {isDevis ? 'Devis' : 'Facture'}
              </p>
              <h1 className="font-display text-calcaire uppercase" style={{ fontSize: '28px' }}>
                {isNew ? (isDevis ? 'Nouveau devis' : 'Nouvelle facture') : doc.numero}
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Statut badge — disponible dès la création */}
            <div className="relative">
              <button
                onClick={() => setShowStatutMenu(s => !s)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 font-mono text-xs uppercase tracking-wide ${STATUT_COLORS[doc.statut]}`}
              >
                {STATUT_LABELS[doc.statut]} <ChevronDown size={11} />
              </button>
              {showStatutMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowStatutMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 bg-anthracite border border-acier/30 z-20 py-1 min-w-36 shadow-xl">
                    {statutOptions.map(s => (
                      <button key={s} onClick={() => { update('statut', s); setShowStatutMenu(false) }}
                        className="flex items-center gap-2 w-full px-3 py-2 font-body text-xs text-calcaire hover:bg-acier/10 text-left">
                        {doc.statut === s && <Check size={11} className="text-or" />}
                        {doc.statut !== s && <span className="w-[11px]" />}
                        {STATUT_LABELS[s]}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Convert devis → facture */}
            {isDevis && !isNew && doc.statut !== 'refuse' && (
              <button onClick={convertToFacture} disabled={converting}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-emerald-700/50 text-emerald-400 font-body text-xs hover:bg-emerald-900/20 transition-colors">
                <ArrowRight size={12} /> Convertir en facture
              </button>
            )}

            {/* Créer un avoir depuis une facture */}
            {!isDevis && !isAvoir && !isNew && (
              <button onClick={convertToAvoir} disabled={converting}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-acier/30 text-acier font-body text-xs hover:text-calcaire hover:border-acier/60 transition-colors">
                <X size={12} /> Créer un avoir
              </button>
            )}

            {/* Aperçu PDF + Imprimer */}
            {!isNew && (
              <>
                <button type="button" onClick={() => openPrintWindow(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-or/40 text-or font-body text-xs hover:bg-or/10 transition-colors">
                  <FileText size={12} /> Aperçu PDF
                </button>
                <button type="button" onClick={() => openPrintWindow(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-acier/30 text-acier font-body text-xs hover:text-calcaire hover:border-acier/50 transition-colors">
                  <Printer size={12} /> Imprimer
                </button>
              </>
            )}

            {/* Save */}
            <button onClick={save}
              className={`flex items-center gap-1.5 px-4 py-1.5 font-body text-sm font-semibold transition-all
                ${saved ? 'bg-emerald-600 text-white' : 'bg-or text-anthracite hover:opacity-90'}`}>
              {saved ? <><Check size={13} /> Enregistré</> : <><Save size={13} /> Enregistrer</>}
            </button>
          </div>
        </div>

        <div className="h-px w-full bg-acier/10 mb-5" />

        {/* Form grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

          {/* Left: client + dates */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-anthracite border border-acier/10 p-5">
              <p className="font-mono text-xs uppercase tracking-widest text-or mb-4">Destinataire</p>
              <div className="space-y-4">
                <Field label="Client">
                  <ClientCombobox
                    allClients={allClients}
                    clientId={doc.client_id}
                    clientNomLibre={doc.client_nom_libre}
                    onChange={updateClient}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3" style={{ minWidth: 0 }}>
                  <div style={{ minWidth: 0, overflow: 'hidden' }}>
                    <Input label="Date d'émission" type="date" value={doc.date_emission} onChange={v => update('date_emission', v)} />
                  </div>
                  <div style={{ minWidth: 0, overflow: 'hidden' }}>
                    {isDevis
                      ? <Input label="Valable jusqu'au" type="date" value={doc.date_validite} onChange={v => update('date_validite', v)} />
                      : <Input label="Échéance" type="date" value={doc.date_echeance} onChange={v => update('date_echeance', v)} />
                    }
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-anthracite border border-acier/10 p-5">
              <p className="font-mono text-xs uppercase tracking-widest text-or mb-4">Véhicule</p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <Input label="Marque / Modèle" value={doc.vehicule_marque} onChange={v => update('vehicule_marque', v)} placeholder="Renault Clio, Peugeot 308…" />
                <Input label="Immatriculation" value={doc.vehicule_immat} onChange={v => update('vehicule_immat', v)} placeholder="AA-123-BB" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Kilométrage" value={doc.vehicule_km} onChange={v => update('vehicule_km', v)} placeholder="50 000 km" />
              </div>
            </div>

            {!isDevis && (
              <div className="bg-anthracite border border-acier/10 p-5">
                <p className="font-mono text-xs uppercase tracking-widest text-or mb-4">Paiement</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input label="Conditions" value={doc.conditions_paiement} onChange={v => update('conditions_paiement', v)} />
                  <Input label="Moyens" value={doc.moyens_paiement} onChange={v => update('moyens_paiement', v)} />
                </div>
              </div>
            )}
          </div>

          {/* Right: totaux */}
          <div className="space-y-4">
            <div className="bg-anthracite border border-acier/10 p-5">
              <p className="font-mono text-xs uppercase tracking-widest text-or mb-4">Totaux</p>
              <div className="space-y-2">
                {[
                  { label: 'Total HT', val: fmt(totaux.totalHTBrut), dim: true },
                  doc.remise_globale > 0 && { label: `Remise (${doc.remise_globale}%)`, val: `−${fmt(totaux.montantRemise)}`, red: true },
                  doc.remise_globale > 0 && { label: 'HT net', val: fmt(totaux.totalHT), dim: true },
                  { label: `TVA ${doc.tva_applicable ? doc.tva_taux + '%' : 'N/A'}`, val: fmt(totaux.montantTVA), dim: true },
                ].filter(Boolean).map((row, i) => (
                  <div key={i} className={`flex justify-between font-body text-sm ${row.red ? 'text-alerte' : 'text-acier'}`}>
                    <span>{row.label}</span><span>{row.val}</span>
                  </div>
                ))}
                <div className="h-px bg-acier/20 my-2" />
                <div className="flex justify-between">
                  <span className="font-display uppercase text-calcaire" style={{ fontSize: '16px' }}>Total TTC</span>
                  <span className="font-display text-or" style={{ fontSize: '22px' }}>{fmt(totaux.totalTTC)}</span>
                </div>
              </div>
            </div>

            <div className="bg-anthracite border border-acier/10 p-5">
              <p className="font-mono text-xs uppercase tracking-widest text-or mb-4">Options</p>
              <div className="space-y-3">
                <Field label="Remise globale (%)">
                  <input type="number" value={doc.remise_globale || 0}
                    onChange={e => update('remise_globale', parseFloat(e.target.value) || 0)}
                    min="0" max="100" step="0.5"
                    className="w-full px-3 py-2 bg-forge border border-acier/30 text-calcaire font-body text-sm outline-none focus:border-or/60"
                  />
                </Field>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={doc.tva_applicable}
                    onChange={e => update('tva_applicable', e.target.checked)}
                    className="accent-or" />
                  <span className="font-body text-xs text-acier">TVA applicable (20%)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Lignes */}
        <div className="bg-anthracite border border-acier/10 mb-4">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-acier/10">
            <p className="font-mono text-xs uppercase tracking-widest text-or">Prestations</p>
            <div className="flex gap-2 flex-shrink-0">
              <select onChange={e => { const item = cat.find(c => c.id === e.target.value); if (item) { addFromCat(item); e.target.value = '' } }}
                className="max-w-[160px] bg-forge border border-acier/30 text-acier font-body text-xs px-2 py-1.5 outline-none focus:border-or/50 truncate">
                <option value="">+ Catalogue</option>
                {cat.map(c => <option key={c.id} value={c.id}>{c.nom} — {fmt(c.prix_ht)}</option>)}
              </select>
              <button onClick={addLigne}
                className="flex items-center gap-1 px-3 py-1.5 border border-acier/30 text-acier font-body text-xs hover:text-or hover:border-or/40 transition-colors">
                <Plus size={12} /> Ligne
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[740px]">
              <thead>
                <tr className="border-b border-acier/10 bg-forge/60">
                  <th className="px-3 py-2 font-mono text-xs text-acier text-center w-8">#</th>
                  <th className="px-2 py-2 font-mono text-xs text-acier text-left">Description</th>
                  <th className="px-2 py-2 font-mono text-xs text-acier text-center w-20">Qté</th>
                  <th className="px-2 py-2 font-mono text-xs text-acier text-right w-28">P.U. HT</th>
                  <th className="px-2 py-2 font-mono text-xs text-emerald-500 text-center w-28">P.U. TTC</th>
                  <th className="px-2 py-2 font-mono text-xs text-acier text-center w-20">Remise</th>
                  <th className="px-2 py-2 font-mono text-xs text-acier text-right w-28">Total HT</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {lignes.map((l, i) => (
                  <LigneRow key={i} ligne={l} index={i} onUpdate={updateLigne} onDelete={deleteLigne} cat={cat}
                    tvaTaux={doc.tva_taux} tvaApplicable={doc.tva_applicable} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-anthracite border border-acier/10 p-5">
          <p className="font-mono text-xs uppercase tracking-widest text-or mb-3">Notes</p>
          <textarea value={doc.notes || ''} onChange={e => update('notes', e.target.value)} rows={2}
            placeholder="Notes internes ou remarques pour le client..."
            className="w-full px-3 py-2 bg-forge border border-acier/30 text-calcaire font-body text-sm outline-none focus:border-or/60 resize-none placeholder-acier/30" />
        </div>
      </div>

      {/* ── PRINT DOCUMENT ── */}
      <div id="seg-print" style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '10pt', padding: 0 }}>
        <PrintDocument doc={doc} lignes={lignes} totaux={totaux} client={printClient} />
      </div>
    </>
  )
}

// ─── Document imprimable A4 ───────────────────────────────
function PrintDocument({ doc, lignes, totaux, client }) {
  const isDevis = doc.type === 'devis'
  const isAvoir = doc.type === 'avoir'
  const accent = '#FF6600'
  const accentLight = '#FFF2E8'
  const dark = '#0A0A0A'

  const fmt2 = (n) => parseFloat(n || 0).toFixed(2) + ' €'

  return (
    <div className="seg-inner" style={{ width: '100%', background: 'white', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '9pt', color: '#111' }}>

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'stretch', borderBottom: `3pt solid ${accent}`, paddingBottom: '18pt', marginBottom: '18pt' }}>
        <div>
          <div style={{ fontSize: '28pt', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase', fontFamily: 'Arial Black, Arial, sans-serif', lineHeight: 1, color: dark }}>
            S.E <span style={{ color: accent }}>GARAGE</span>
          </div>
          <div style={{ fontSize: '8pt', letterSpacing: '3px', textTransform: 'uppercase', color: accent, marginTop: '4pt', fontWeight: '600' }}>
            Carrosserie · Mécanique · Pare-brise
          </div>
          <div style={{ marginTop: '10pt', fontSize: '9.5pt', color: '#444', lineHeight: 1.8 }}>
            13 Avenue de la Gare, 92230 Gennevilliers<br />
            Tél : 01 41 11 43 40<br />
            SIRET : 102 981 214 00012 · TVA : FR12102981214
          </div>
        </div>
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '16pt', letterSpacing: '4px', textTransform: 'uppercase', color: accent, fontWeight: '700', fontFamily: 'Arial Black, Arial, sans-serif' }}>
            {isDevis ? '— Devis —' : isAvoir ? '— Avoir —' : '— Facture —'}
          </div>
          <div>
            <div style={{ fontSize: '10pt', fontWeight: '600', color: '#555', letterSpacing: '1px', lineHeight: 1 }}>
              {doc.numero}
            </div>
            <div style={{ height: '1.5pt', background: accent, marginTop: '5pt', marginBottom: '6pt', width: '50%', marginLeft: 'auto' }} />
            <div style={{ fontSize: '9pt', color: '#444', lineHeight: 1.9 }}>
              Émission : <strong>{doc.date_emission?.split('-').reverse().join('/')}</strong><br />
              {isDevis && doc.date_validite && <>Validité : <strong>{doc.date_validite?.split('-').reverse().join('/')}</strong><br /></>}
              {!isDevis && doc.date_echeance && <>Échéance : <strong style={{ color: accent }}>{doc.date_echeance?.split('-').reverse().join('/')}</strong></>}
            </div>
          </div>
        </div>
      </div>

      {/* ── CLIENT ── */}
      <div style={{ display: 'flex', marginBottom: '28pt' }}>
        <div style={{ flex: 1 }} />
        <div style={{ flex: '0 0 210pt', background: accentLight, border: `1pt solid ${accent}`, padding: '9pt 11pt' }}>
          <div style={{ fontSize: '7pt', textTransform: 'uppercase', letterSpacing: '2px', color: accent, marginBottom: '5pt', fontWeight: '700' }}>{isAvoir ? 'Avoir pour' : 'Facturé à'}</div>
          {client ? (
            <>
              <div style={{ fontSize: '10.5pt', fontWeight: '700', color: dark }}>
                {client._libre ? client.nom : `${client.prenom ? client.prenom + ' ' : ''}${client.nom}`}
              </div>
              {!client._libre && client.societe && <div style={{ fontSize: '9pt', color: '#333', marginTop: '1pt' }}>{client.societe}</div>}
              {!client._libre && client.adresse_ligne1 && <div style={{ fontSize: '9pt', color: '#444', marginTop: '4pt' }}>{client.adresse_ligne1}</div>}
              {!client._libre && client.code_postal && client.ville && <div style={{ fontSize: '9pt', color: '#444' }}>{client.code_postal} {client.ville}</div>}
              {!client._libre && client.email && <div style={{ fontSize: '8.5pt', color: '#555', marginTop: '4pt' }}>{client.email}</div>}
              {!client._libre && client.telephone && <div style={{ fontSize: '8.5pt', color: '#555' }}>Tél : {client.telephone}</div>}
              {!client._libre && client.siret && <div style={{ fontSize: '8.5pt', color: '#555' }}>SIRET : {client.siret}</div>}
            </>
          ) : (
            <div style={{ fontSize: '8.5pt', color: '#999', fontStyle: 'italic' }}>Client non renseigné</div>
          )}
        </div>
      </div>

      {/* ── VÉHICULE ── */}
      {(doc.vehicule_immat || doc.vehicule_km || doc.vehicule_marque) && (
        <div style={{ display: 'flex', gap: '16pt', marginBottom: '24pt', padding: '8pt 10pt', background: '#f5f5f5', border: `0.5pt solid #ddd`, borderLeft: `3pt solid ${accent}` }}>
          <div style={{ fontSize: '7pt', textTransform: 'uppercase', letterSpacing: '1.5px', color: accent, fontWeight: '700', alignSelf: 'center', marginRight: '4pt' }}>Véhicule</div>
          {doc.vehicule_marque && (
            <div style={{ fontSize: '9pt', fontWeight: '700', color: dark }}>
              <span style={{ fontSize: '7pt', color: '#666', fontWeight: 'normal', marginRight: '4pt' }}>Marque</span>
              {doc.vehicule_marque}
            </div>
          )}
          {doc.vehicule_immat && (
            <div style={{ fontSize: '9pt', fontWeight: '700', color: dark }}>
              <span style={{ fontSize: '7pt', color: '#666', fontWeight: 'normal', marginRight: '4pt' }}>Immat.</span>
              {doc.vehicule_immat.toUpperCase()}
            </div>
          )}
          {doc.vehicule_km && (
            <div style={{ fontSize: '9pt', color: '#333' }}>
              <span style={{ fontSize: '7pt', color: '#666', marginRight: '4pt' }}>Kilométrage</span>
              <strong>{doc.vehicule_km}</strong>
            </div>
          )}
        </div>
      )}

      {/* ── LIGNES ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14pt', fontSize: '9pt' }}>
        <thead>
          <tr style={{ background: dark, color: 'white' }}>
            <th style={{ padding: '7pt 7pt', textAlign: 'left', fontWeight: '700', fontSize: '8pt', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: `2pt solid ${accent}` }}>Désignation</th>
            <th style={{ padding: '7pt 5pt', textAlign: 'center', width: '32pt', fontWeight: '700', fontSize: '8pt', borderBottom: `2pt solid ${accent}` }}>Qté</th>
            <th style={{ padding: '7pt 5pt', textAlign: 'right', width: '62pt', fontWeight: '700', fontSize: '8pt', borderBottom: `2pt solid ${accent}` }}>P.U. HT</th>
            <th style={{ padding: '7pt 5pt', textAlign: 'center', width: '40pt', fontWeight: '700', fontSize: '8pt', borderBottom: `2pt solid ${accent}` }}>Remise</th>
            <th style={{ padding: '7pt 7pt', textAlign: 'right', width: '65pt', fontWeight: '700', fontSize: '8pt', borderBottom: `2pt solid ${accent}` }}>Total HT</th>
          </tr>
        </thead>
        <tbody>
          {lignes.filter(l => l.description).map((l, i) => (
            <tr key={i} style={{ borderBottom: `0.5pt solid #e8e8e8` }}>
              <td style={{ padding: '7pt 7pt', color: '#111' }}>{l.description}</td>
              <td style={{ padding: '7pt 5pt', textAlign: 'center', color: '#444' }}>{l.quantite}</td>
              <td style={{ padding: '7pt 5pt', textAlign: 'right', color: '#444' }}>{fmt2(l.prix_unitaire_ht)}</td>
              <td style={{ padding: '7pt 5pt', textAlign: 'center', color: '#444' }}>{parseFloat(l.remise_ligne || 0) > 0 ? `${l.remise_ligne}%` : '—'}</td>
              <td style={{ padding: '7pt 7pt', textAlign: 'right', fontWeight: '700', color: dark }}>{fmt2(ligneTotal(l))}</td>
            </tr>
          ))}
          {lignes.filter(l => l.description).length === 0 && (
            <tr><td colSpan={5} style={{ padding: '10pt', textAlign: 'center', color: '#999', fontStyle: 'italic' }}>Aucune prestation</td></tr>
          )}
        </tbody>
      </table>

      {/* ── TOTAUX ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14pt' }}>
        <div style={{ width: '210pt' }}>
          <div style={{ overflow: 'hidden' }}>
            {[
              { label: 'Total HT brut', val: fmt2(totaux.totalHTBrut) },
              totaux.montantRemise > 0 && { label: `Remise (${doc.remise_globale}%)`, val: `−${fmt2(totaux.montantRemise)}`, red: true },
              totaux.montantRemise > 0 && { label: 'Total HT net', val: fmt2(totaux.totalHT) },
              { label: doc.tva_applicable ? `TVA ${doc.tva_taux}%` : 'TVA non applicable', val: fmt2(totaux.montantTVA) },
            ].filter(Boolean).map((row, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3.5pt 7pt', fontSize: '9pt', color: row.red ? '#CC2B2B' : '#444', borderBottom: '0.5pt solid #e8e8e8' }}>
                <span>{row.label}</span><span style={{ fontWeight: '600' }}>{row.val}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8pt 7pt', borderTop: `2pt solid ${accent}`, marginTop: '1pt' }}>
              <span style={{ fontSize: '9.5pt', fontWeight: '700', color: dark, textTransform: 'uppercase', letterSpacing: '1px' }}>Net à payer</span>
              <span style={{ fontSize: '16pt', fontWeight: '900', color: accent }}>{fmt2(totaux.totalTTC)}</span>
            </div>
          </div>
          {!doc.tva_applicable && <p style={{ fontSize: '7.5pt', color: '#777', marginTop: '3pt' }}>TVA non applicable, art. 293 B du CGI</p>}
        </div>
      </div>

      {/* ── NOTES ── */}
      {doc.notes && (
        <div style={{ fontSize: '8.5pt', color: '#333', marginBottom: '14pt', padding: '6pt 9pt', borderLeft: `3pt solid ${accent}` }}>
          <div style={{ fontWeight: '700', marginBottom: '3pt', color: accent, fontSize: '7.5pt', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Notes</div>
          {doc.notes}
        </div>
      )}

      {/* ── SPACER avec watermark ── */}
      <div className="seg-spacer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ fontSize: '58pt', fontWeight: '900', color: '#ebebeb', letterSpacing: '8px', textTransform: 'uppercase', fontFamily: 'Arial Black, Arial, sans-serif', whiteSpace: 'nowrap', userSelect: 'none' }}>
          S.E GARAGE
        </div>
      </div>

      {/* ── CONDITIONS + PIED DE PAGE ── */}
      <div className="seg-footer" style={{ borderTop: `1.5pt solid ${accent}`, paddingTop: '7pt' }}>
        {!isDevis && (doc.conditions_paiement || doc.moyens_paiement) && (
          <div style={{ fontSize: '8pt', color: '#222', marginBottom: '5pt' }}>
            <strong style={{ color: dark }}>Conditions de paiement : </strong>{doc.conditions_paiement}
            {doc.moyens_paiement && <> · <strong style={{ color: dark }}>Moyens acceptés : </strong>{doc.moyens_paiement}</>}
          </div>
        )}
        <div style={{ fontSize: '7.5pt', color: '#666', lineHeight: 1.6 }}>
          {isDevis
            ? "Devis valable 30 jours à compter de la date d'émission. Ce devis ne vaut pas commande avant acceptation écrite du client."
            : isAvoir
            ? "Avoir établi en déduction de la facture d'origine. Pour toute question, contactez-nous au 01 41 11 43 40."
            : 'Nous vous remercions de votre confiance. Pour toute question, contactez-nous au 01 41 11 43 40.'
          }
        </div>
      </div>
    </div>
  )
}
