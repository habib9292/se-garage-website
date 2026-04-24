import { useState, useEffect, useMemo } from 'react'
import { Plus, Search, Trash2, Edit2, Users, Phone, Mail, X } from 'lucide-react'
import { clients as clientsStore } from '../storage'

function ModalInput({ label, value, onChange, type = 'text', placeholder = '', span = false }) {
  return (
    <div className={span ? 'col-span-2' : ''}>
      <label className="block font-mono text-xs uppercase tracking-widest text-acier mb-1.5">{label}</label>
      <input type={type} value={value || ''} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-forge border border-acier/30 text-calcaire font-body text-sm outline-none focus:border-or/60 placeholder-acier/30" />
    </div>
  )
}

function ClientModal({ client, onClose, onSave }) {
  const [form, setForm] = useState({
    nom: '', prenom: '', societe: '', email: '', telephone: '',
    adresse_ligne1: '', code_postal: '', ville: '', siret: '', notes: '',
    ...client,
  })
  function set(field, val) { setForm(f => ({ ...f, [field]: val })) }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-anthracite border border-acier/20 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-acier/10">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-or">Clients</p>
            <h2 className="font-display text-calcaire uppercase" style={{ fontSize: '22px' }}>
              {client ? 'Modifier' : 'Nouveau client'}
            </h2>
          </div>
          <button onClick={onClose} className="text-acier hover:text-calcaire"><X size={18} /></button>
        </div>

        <form onSubmit={e => { e.preventDefault(); if (form.nom || form.societe) onSave(form) }} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <ModalInput label="Nom" value={form.nom} onChange={v => set('nom', v)} />
            <ModalInput label="Prénom" value={form.prenom} onChange={v => set('prenom', v)} />
          </div>
          <ModalInput label="Société" value={form.societe} onChange={v => set('societe', v)} span />
          <div className="grid grid-cols-2 gap-3">
            <ModalInput label="Email" value={form.email} onChange={v => set('email', v)} type="email" />
            <ModalInput label="Téléphone" value={form.telephone} onChange={v => set('telephone', v)} />
          </div>
          <ModalInput label="Adresse" value={form.adresse_ligne1} onChange={v => set('adresse_ligne1', v)} placeholder="Numéro et rue" />
          <div className="grid grid-cols-2 gap-3">
            <ModalInput label="Code postal" value={form.code_postal} onChange={v => set('code_postal', v)} />
            <ModalInput label="Ville" value={form.ville} onChange={v => set('ville', v)} />
          </div>
          <ModalInput label="SIRET" value={form.siret} onChange={v => set('siret', v)} />
          <div>
            <label className="block font-mono text-xs uppercase tracking-widest text-acier mb-1.5">Notes</label>
            <textarea value={form.notes || ''} onChange={e => set('notes', e.target.value)} rows={2}
              className="w-full px-3 py-2 bg-forge border border-acier/30 text-calcaire font-body text-sm outline-none focus:border-or/60 resize-none placeholder-acier/30" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-acier/30 text-acier font-body text-sm hover:text-calcaire transition-colors">
              Annuler
            </button>
            <button type="submit"
              className="flex-1 py-2.5 bg-or text-anthracite font-body text-sm font-semibold hover:opacity-90 transition-opacity">
              {client ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function ClientsList() {
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [allClients, setAllClients] = useState([])

  async function load() {
    const list = await clientsStore.all()
    setAllClients(list)
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    if (!search) return allClients
    const s = search.toLowerCase()
    return allClients.filter(c =>
      c.nom.toLowerCase().includes(s) ||
      (c.prenom || '').toLowerCase().includes(s) ||
      (c.societe || '').toLowerCase().includes(s) ||
      (c.email || '').includes(s) ||
      (c.telephone || '').includes(s)
    )
  }, [search, allClients])

  async function handleSave(form) {
    if (editing) {
      await clientsStore.update(editing.id, form)
    } else {
      await clientsStore.create(form)
    }
    setShowModal(false); setEditing(null)
    load()
  }

  async function handleDelete(id) {
    await clientsStore.delete(id)
    setDeleteConfirm(null)
    load()
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-or mb-1">Répertoire</p>
          <h1 className="font-display text-calcaire uppercase flex items-center gap-3" style={{ fontSize: '36px' }}>
            <Users size={22} className="text-or" /> Clients
          </h1>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-or text-anthracite font-body text-sm font-semibold hover:opacity-90 transition-opacity">
          <Plus size={14} /> Nouveau client
        </button>
      </div>

      <div className="h-px w-full bg-acier/10 mb-6" />

      <div className="relative mb-5">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-acier" />
        <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-anthracite border border-acier/20 text-calcaire font-body text-sm outline-none focus:border-or/50 placeholder-acier/40" />
      </div>

      <div className="bg-anthracite border border-acier/10">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Users size={40} className="mx-auto text-acier/20 mb-3" />
            <p className="font-body text-acier text-sm">
              {search ? 'Aucun client trouvé' : 'Aucun client'}
            </p>
            {!search && (
              <button onClick={() => setShowModal(true)} className="mt-3 font-mono text-xs text-or hover:underline">
                Ajouter un client →
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-acier/5">
            {filtered.map(c => (
              <div key={c.id} className="group flex items-center justify-between px-6 py-4 hover:bg-acier/5 transition-colors gap-2">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-9 h-9 bg-or/10 border border-or/20 flex items-center justify-center flex-shrink-0">
                    <span className="font-display text-or" style={{ fontSize: '16px' }}>
                      {(c.prenom ? c.prenom[0] : c.nom ? c.nom[0] : c.societe ? c.societe[0] : '?').toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-body text-sm text-calcaire font-medium truncate">
                      {c.prenom || c.nom ? `${c.prenom ? c.prenom + ' ' : ''}${c.nom || ''}`.trim() : c.societe || '—'}
                      {(c.prenom || c.nom) && c.societe ? <span className="text-acier font-normal"> · {c.societe}</span> : null}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5 min-w-0">
                      {c.email && <span className="font-mono text-xs text-acier flex items-center gap-1 truncate"><Mail size={10} className="flex-shrink-0" />{c.email}</span>}
                      {c.telephone && <span className="font-mono text-xs text-acier flex items-center gap-1 flex-shrink-0"><Phone size={10} />{c.telephone}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditing(c); setShowModal(true) }}
                    className="p-1.5 text-acier hover:text-or transition-colors"><Edit2 size={13} /></button>
                  <button onClick={() => setDeleteConfirm(c.id)}
                    className="p-1.5 text-acier hover:text-alerte transition-colors"><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <ClientModal client={editing} onClose={() => { setShowModal(false); setEditing(null) }} onSave={handleSave} />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-anthracite border border-acier/20 p-6 max-w-sm w-full">
            <h3 className="font-display text-calcaire uppercase mb-2" style={{ fontSize: '22px' }}>Supprimer ?</h3>
            <p className="font-body text-sm text-acier mb-5">Les documents restent conservés.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-acier/30 text-acier font-body text-sm hover:text-calcaire">Annuler</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 bg-alerte text-calcaire font-body text-sm font-semibold hover:opacity-90">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
