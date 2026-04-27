// ─── Supabase persistence for SE Garage facturation ────────
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// ── helpers ──────────────────────────────────────────────
function today() { return new Date().toISOString().split('T')[0] }
function plusDays(n) {
  const d = new Date(); d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

// ── calculs (sync, inchangés) ─────────────────────────────
const r2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100

export function calculer(lignes = [], remiseGlobale = 0, tvaApplicable = true, tvaTaux = 20) {
  const totalHTBrut = r2(lignes.reduce((s, l) => {
    const base = parseFloat(l.quantite || 1) * parseFloat(l.prix_unitaire_ht || 0)
    const remise = base * (parseFloat(l.remise_ligne || 0) / 100)
    return s + r2(base - remise)
  }, 0))
  const montantRemise = r2(totalHTBrut * (remiseGlobale / 100))
  const totalHT = r2(totalHTBrut - montantRemise)
  const montantTVA = tvaApplicable ? r2(totalHT * (tvaTaux / 100)) : 0
  const totalTTC = r2(totalHT + montantTVA)
  return { totalHTBrut, montantRemise, totalHT, montantTVA, totalTTC }
}

export function ligneTotal(l) {
  const base = parseFloat(l.quantite || 1) * parseFloat(l.prix_unitaire_ht || 0)
  return r2(base * (1 - parseFloat(l.remise_ligne || 0) / 100))
}

// ── numérotation ─────────────────────────────────────────
export async function nextNumero(type) {
  const { data, error } = await supabase.rpc('seg_next_numero', { p_type: type })
  if (error) throw error
  return data
}

// ── clients ──────────────────────────────────────────────
export const clients = {
  async all() {
    const { data } = await supabase.from('seg_clients').select('*').order('nom')
    return data || []
  },
  async byId(id) {
    const { data } = await supabase.from('seg_clients').select('*').eq('id', id).single()
    return data || null
  },
  async create(d) {
    const { data } = await supabase.from('seg_clients').insert(d).select().single()
    return data
  },
  async update(id, d) {
    const { data } = await supabase.from('seg_clients').update(d).eq('id', id).select().single()
    return data
  },
  async delete(id) {
    await supabase.from('seg_clients').delete().eq('id', id)
  },
}

// Champs à exclure avant INSERT/UPDATE dans seg_documents
const DOC_EXCLUDE = ['lignes', 'clientName', 'totaux', 'id', 'created_at']

// Convertit les chaînes vides en null pour les colonnes UUID et date
function cleanDoc(doc) {
  const out = { ...doc }
  DOC_EXCLUDE.forEach(k => delete out[k])
  // UUID vides → null
  ;['client_id', 'devis_origine_id', 'avoir_origine_id'].forEach(k => {
    if (out[k] === '' || out[k] === undefined) out[k] = null
  })
  // Dates vides → null
  ;['date_emission', 'date_echeance', 'date_validite'].forEach(k => {
    if (out[k] === '' || out[k] === undefined) out[k] = null
  })
  return out
}

// ── documents (devis + factures) ─────────────────────────
async function withLignes(docs) {
  if (!docs.length) return []
  const ids = docs.map(d => d.id)
  const { data: lignes } = await supabase
    .from('seg_lignes').select('*').in('document_id', ids).order('position')
  return docs.map(d => ({
    ...d,
    lignes: (lignes || []).filter(l => l.document_id === d.id),
  }))
}

export const documents = {
  async all() {
    const { data } = await supabase
      .from('seg_documents').select('*').order('created_at', { ascending: false })
    return withLignes(data || [])
  },
  async byType(type) {
    const { data } = await supabase
      .from('seg_documents').select('*').eq('type', type).order('created_at', { ascending: false })
    return withLignes(data || [])
  },
  async byId(id) {
    const { data: doc } = await supabase
      .from('seg_documents').select('*').eq('id', id).single()
    if (!doc) return null
    const { data: lignes } = await supabase
      .from('seg_lignes').select('*').eq('document_id', id).order('position')
    return { ...doc, lignes: lignes || [] }
  },
  async create(doc, lignesData = []) {
    // N'appeler nextNumero que si le numéro n'est pas déjà défini
    const numero = doc.numero || await nextNumero(doc.type || 'devis')
    const { data: newDoc, error } = await supabase.from('seg_documents').insert({
      type: 'devis',
      statut: 'brouillon',
      remise_globale: 0,
      tva_taux: 20,
      tva_applicable: true,
      conditions_paiement: 'Paiement à 30 jours',
      moyens_paiement: 'Virement, espèces, chèque, CB',
      ...cleanDoc(doc),
      numero,
    }).select().single()
    if (error) throw error

    const newLignes = lignesData.filter(l => l.description).map((l, i) => ({
      description: '',
      quantite: 1,
      prix_unitaire_ht: 0,
      remise_ligne: 0,
      ...l,
      document_id: newDoc.id,
      position: i + 1,
    }))
    if (newLignes.length > 0) {
      await supabase.from('seg_lignes').insert(newLignes)
    }
    return { ...newDoc, lignes: newLignes }
  },
  async update(id, doc, lignesData) {
    const { data: updated } = await supabase
      .from('seg_documents')
      .update({ ...cleanDoc(doc), updated_at: new Date().toISOString() })
      .eq('id', id).select().single()

    if (lignesData !== undefined) {
      await supabase.from('seg_lignes').delete().eq('document_id', id)
      const newLignes = lignesData.filter(l => l.description).map((l, i) => ({
        description: '',
        quantite: 1,
        prix_unitaire_ht: 0,
        remise_ligne: 0,
        ...l,
        document_id: id,
        position: i + 1,
      }))
      if (newLignes.length > 0) {
        await supabase.from('seg_lignes').insert(newLignes)
      }
    }
    return updated
  },
  async delete(id) {
    // seg_lignes supprimées en cascade
    await supabase.from('seg_documents').delete().eq('id', id)
  },
  async convertToAvoir(factureId) {
    const facture = await this.byId(factureId)
    if (!facture) return null
    const avoir = await this.create({
      type: 'avoir',
      statut: 'brouillon',
      client_id: facture.client_id,
      client_nom_libre: facture.client_nom_libre,
      date_emission: today(),
      avoir_origine_id: factureId,
      remise_globale: facture.remise_globale || 0,
      tva_taux: facture.tva_taux || 20,
      tva_applicable: facture.tva_applicable !== false,
      notes: facture.notes,
      conditions_paiement: facture.conditions_paiement,
      moyens_paiement: facture.moyens_paiement,
      vehicule_immat: facture.vehicule_immat,
      vehicule_km: facture.vehicule_km,
      vehicule_marque: facture.vehicule_marque,
    }, facture.lignes.map(l => ({
      description: l.description,
      quantite: l.quantite,
      prix_unitaire_ht: l.prix_unitaire_ht,
      remise_ligne: l.remise_ligne || 0,
    })))
    // Marquer la facture d'origine comme "avoir émis"
    await supabase.from('seg_documents')
      .update({ statut: 'avoir_emis', updated_at: new Date().toISOString() })
      .eq('id', factureId)
    return avoir
  },
  async convertToFacture(devisId) {
    const devis = await this.byId(devisId)
    if (!devis) return null
    const facture = await this.create({
      type: 'facture',
      statut: 'brouillon',
      client_id: devis.client_id,
      client_nom_libre: devis.client_nom_libre,
      date_emission: today(),
      date_echeance: plusDays(30),
      devis_origine_id: devisId,
      remise_globale: devis.remise_globale || 0,
      tva_taux: devis.tva_taux || 20,
      tva_applicable: devis.tva_applicable !== false,
      notes: devis.notes,
      conditions_paiement: 'Paiement à 30 jours',
      moyens_paiement: 'Virement, espèces, chèque, CB',
      vehicule_immat: devis.vehicule_immat,
      vehicule_km: devis.vehicule_km,
      vehicule_marque: devis.vehicule_marque,
    }, devis.lignes.map(l => ({
      description: l.description,
      quantite: l.quantite,
      prix_unitaire_ht: l.prix_unitaire_ht,
      remise_ligne: l.remise_ligne || 0,
    })))
    await this.update(devisId, { statut: 'accepte' })
    return facture
  },
}

// ── catalogue de prestations ─────────────────────────────
export const catalogue = {
  async all() {
    const { data } = await supabase
      .from('seg_catalogue').select('*').eq('actif', true).order('categorie').order('nom')
    return data || []
  },
  async allAdmin() {
    const { data } = await supabase
      .from('seg_catalogue').select('*').order('categorie').order('nom')
    return data || []
  },
  async create(item) {
    const { data } = await supabase.from('seg_catalogue').insert(item).select().single()
    return data
  },
  async update(id, item) {
    const { data } = await supabase.from('seg_catalogue').update(item).eq('id', id).select().single()
    return data
  },
  async delete(id) {
    await supabase.from('seg_catalogue').delete().eq('id', id)
  },
  async toggleActif(id, actif) {
    await supabase.from('seg_catalogue').update({ actif }).eq('id', id)
  },
}
