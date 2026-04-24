import { useState, useEffect } from 'react'
import { BookOpen, Plus, X, Pencil, Trash2 } from 'lucide-react'
import { catalogue as catalogueStore } from './storage'

function fmt(n) { return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n || 0) }

const TVA = 1.20
const EMPTY_FORM = { nom: '', prix_ht: '', unite: 'forfait', categorie: '' }

export function Catalogue() {
  const [items, setItems] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [editingTtc, setEditingTtc] = useState(false)
  const [ttcDraft, setTtcDraft] = useState('')

  const computedTtc = form.prix_ht !== '' ? (parseFloat(form.prix_ht) * TVA).toFixed(2) : ''

  function handleHtChange(val) {
    setForm(p => ({ ...p, prix_ht: val }))
  }

  function handleHtBlur() {
    const ht = form.prix_ht !== '' ? parseFloat(parseFloat(form.prix_ht).toFixed(2)) : ''
    setForm(p => ({ ...p, prix_ht: ht === '' ? '' : String(ht) }))
  }

  function handleTtcFocus() {
    setEditingTtc(true)
    setTtcDraft(computedTtc)
  }

  function handleTtcChange(val) {
    setTtcDraft(val)
    const ht = val !== '' ? parseFloat((parseFloat(val) / TVA).toFixed(2)) : ''
    setForm(p => ({ ...p, prix_ht: ht === '' ? '' : String(ht) }))
  }

  function handleTtcBlur() {
    setEditingTtc(false)
  }

  async function load() {
    const all = await catalogueStore.allAdmin()
    setItems(all)
  }

  useEffect(() => { load() }, [])

  const grouped = items.reduce((acc, item) => {
    const cat = item.categorie || 'Autre'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(item)
    return acc
  }, {})
  const categories = Object.keys(grouped).sort()

  async function toggleActif(id, current) {
    await catalogueStore.toggleActif(id, !current)
    load()
  }

  function openCreate() {
    setEditItem(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  function openEdit(item) {
    setEditItem(item)
    setForm({ nom: item.nom, prix_ht: String(item.prix_ht), unite: item.unite, categorie: item.categorie || '' })
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditItem(null)
    setForm(EMPTY_FORM)
  }

  async function handleSave(e) {
    e.preventDefault()
    const payload = { ...form, prix_ht: parseFloat(form.prix_ht) || 0 }
    if (editItem) {
      await catalogueStore.update(editItem.id, payload)
    } else {
      await catalogueStore.create({ ...payload, actif: true })
    }
    closeModal()
    load()
  }

  async function handleDelete(id) {
    await catalogueStore.delete(id)
    setDeleteConfirm(null)
    load()
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-or mb-1">Prestations</p>
          <h1 className="font-display text-calcaire uppercase flex items-center gap-3" style={{ fontSize: '36px' }}>
            <BookOpen size={22} className="text-or" /> Catalogue
          </h1>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-or text-anthracite font-body text-sm font-semibold hover:opacity-90">
          <Plus size={14} /> Ajouter
        </button>
      </div>

      <div className="h-px w-full bg-acier/10 mb-6" />

      <div className="space-y-4">
        {categories.map(cat => (
          <div key={cat} className="bg-anthracite border border-acier/10">
            <div className="px-5 py-3 border-b border-acier/10 bg-forge/40">
              <span className="font-mono text-xs uppercase tracking-widest text-or">{cat}</span>
            </div>
            <div className="divide-y divide-acier/5">
              {grouped[cat].map(item => (
                <div key={item.id} className={`flex flex-wrap items-center justify-between gap-y-2 px-5 py-3 group ${!item.actif ? 'opacity-40' : ''}`}>
                  <div className="min-w-0">
                    <p className="font-body text-sm text-calcaire">{item.nom}</p>
                    <p className="font-mono text-xs text-acier">{item.unite}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <span className="font-display text-or whitespace-nowrap block" style={{ fontSize: '18px' }}>{fmt(item.prix_ht)} HT</span>
                      <span className="font-mono text-xs text-emerald-400 whitespace-nowrap">{fmt(item.prix_ht * TVA)} TTC</span>
                    </div>
                    <button onClick={() => toggleActif(item.id, item.actif)}
                      className={`font-mono text-xs uppercase tracking-wide px-2.5 py-1 transition-colors
                        ${item.actif
                          ? 'bg-emerald-900/30 text-emerald-400 hover:bg-alerte/20 hover:text-alerte'
                          : 'bg-acier/20 text-acier hover:bg-emerald-900/30 hover:text-emerald-400'
                        }`}>
                      {item.actif ? 'Actif' : 'Inactif'}
                    </button>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(item)}
                        className="p-1.5 text-acier hover:text-or transition-colors" title="Modifier">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => setDeleteConfirm(item.id)}
                        className="p-1.5 text-acier hover:text-alerte transition-colors" title="Supprimer">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal création / édition */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-anthracite border border-acier/20 w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-acier/10">
              <h2 className="font-display text-calcaire uppercase" style={{ fontSize: '22px' }}>
                {editItem ? 'Modifier la prestation' : 'Nouvelle prestation'}
              </h2>
              <button onClick={closeModal} className="text-acier hover:text-calcaire"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block font-mono text-xs uppercase tracking-widest text-acier mb-1.5">Nom *</label>
                <input required value={form.nom} onChange={e => setForm(p => ({ ...p, nom: e.target.value }))}
                  className="w-full px-3 py-2 bg-forge border border-acier/30 text-calcaire font-body text-sm outline-none focus:border-or/60" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-xs uppercase tracking-widest text-acier mb-1.5">Prix HT (€) *</label>
                  <input type="number" required min="0" step="0.01" value={form.prix_ht}
                    onChange={e => handleHtChange(e.target.value)}
                    onBlur={handleHtBlur}
                    className="w-full px-3 py-2 bg-forge border border-acier/30 text-calcaire font-body text-sm outline-none focus:border-or/60" />
                </div>
                <div>
                  <label className="block font-mono text-xs uppercase tracking-widest text-emerald-500 mb-1.5">Prix TTC (€)</label>
                  <input type="number" min="0" step="0.01"
                    value={editingTtc ? ttcDraft : computedTtc}
                    onFocus={handleTtcFocus}
                    onChange={e => handleTtcChange(e.target.value)}
                    onBlur={handleTtcBlur}
                    className="w-full px-3 py-2 bg-forge border border-acier/30 text-emerald-400 font-body text-sm outline-none focus:border-emerald-500/60" />
                </div>
              </div>
              <div>
                <label className="block font-mono text-xs uppercase tracking-widest text-acier mb-1.5">Unité</label>
                <select value={form.unite} onChange={e => setForm(p => ({ ...p, unite: e.target.value }))}
                  className="w-full px-3 py-2 bg-forge border border-acier/30 text-calcaire font-body text-sm outline-none focus:border-or/60 appearance-none">
                  {['forfait', 'heure', 'pièce', 'jour'].map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="block font-mono text-xs uppercase tracking-widest text-acier mb-1.5">Catégorie</label>
                <input value={form.categorie} onChange={e => setForm(p => ({ ...p, categorie: e.target.value }))}
                  list="cats" placeholder="ex: Entretien, Freinage..."
                  className="w-full px-3 py-2 bg-forge border border-acier/30 text-calcaire font-body text-sm outline-none focus:border-or/60 placeholder-acier/30" />
                <datalist id="cats">{categories.map(c => <option key={c} value={c} />)}</datalist>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal}
                  className="flex-1 py-2.5 border border-acier/30 text-acier font-body text-sm hover:text-calcaire">Annuler</button>
                <button type="submit"
                  className="flex-1 py-2.5 bg-or text-anthracite font-body text-sm font-semibold hover:opacity-90">
                  {editItem ? 'Enregistrer' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation suppression */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-anthracite border border-acier/20 p-6 max-w-sm w-full">
            <h3 className="font-display text-calcaire uppercase mb-2" style={{ fontSize: '22px' }}>Supprimer ?</h3>
            <p className="font-body text-sm text-acier mb-5">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 border border-acier/30 text-acier font-body text-sm hover:text-calcaire transition-colors">
                Annuler
              </button>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 bg-alerte text-calcaire font-body text-sm font-semibold hover:opacity-90">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
