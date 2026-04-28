import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Clock, Phone, Mail, CheckCircle } from 'lucide-react'
import { SectionLabel } from '../components/ui/SectionLabel'
import { Button } from '../components/ui/Button'
import { useGarageStatus } from '../hooks/useGarageStatus'

const schema = z.object({
  nom:           z.string().min(2, 'Le nom est requis'),
  email:         z.string().email('Adresse email invalide'),
  telephone:     z.string().min(10, 'Numéro de téléphone invalide'),
  vehicule:      z.string().optional(),
  type_demande:  z.string().min(1, 'Veuillez choisir un type de demande'),
  message:       z.string().min(10, 'Le message doit contenir au moins 10 caractères'),
})

const horaires = [
  { jour: 'Lundi',    heure: '8h00 – 19h00' },
  { jour: 'Mardi',    heure: '8h00 – 19h00' },
  { jour: 'Mercredi', heure: '8h00 – 19h00' },
  { jour: 'Jeudi',    heure: '8h00 – 19h00' },
  { jour: 'Vendredi', heure: '8h00 – 19h00' },
  { jour: 'Samedi',   heure: '9h00 – 17h00' },
  { jour: 'Dimanche', heure: 'Fermé' },
]

export function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const { isOpen: open } = useGarageStatus()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error('Erreur envoi')
    setSubmitted(true)
  }

  return (
    <>
      {/* Hero */}
      <section className="relative bg-forge pt-32 pb-20 overflow-hidden border-b border-acier/10">
        <div className="absolute inset-0 bg-gradient-to-br from-forge via-anthracite/60 to-forge" />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <SectionLabel>Nous contacter</SectionLabel>
            <h1 className="font-display text-calcaire uppercase leading-none" style={{ fontSize: 'clamp(48px, 7vw, 96px)' }}>
              <span className="text-or">Contact</span>
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="bg-forge py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Form */}
            <div>
              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -20 }}
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <h2 className="font-display text-2xl text-calcaire uppercase tracking-wide mb-8">
                      Envoyez-nous un message
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-mono text-xs uppercase tracking-widest text-acier mb-2">Nom *</label>
                        <input
                          {...register('nom')}
                          placeholder="Votre nom"
                          className={`w-full bg-anthracite border px-4 py-3 font-body text-sm text-calcaire placeholder-acier/50 outline-none transition-colors duration-200 focus:border-or ${errors.nom ? 'border-alerte' : 'border-acier/20'}`}
                        />
                        {errors.nom && <p className="text-alerte text-xs mt-1">{errors.nom.message}</p>}
                      </div>
                      <div>
                        <label className="block font-mono text-xs uppercase tracking-widest text-acier mb-2">Email *</label>
                        <input
                          {...register('email')}
                          type="email"
                          placeholder="votre@email.fr"
                          className={`w-full bg-anthracite border px-4 py-3 font-body text-sm text-calcaire placeholder-acier/50 outline-none transition-colors duration-200 focus:border-or ${errors.email ? 'border-alerte' : 'border-acier/20'}`}
                        />
                        {errors.email && <p className="text-alerte text-xs mt-1">{errors.email.message}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-mono text-xs uppercase tracking-widest text-acier mb-2">Téléphone *</label>
                        <input
                          {...register('telephone')}
                          type="tel"
                          placeholder="06 XX XX XX XX"
                          className={`w-full bg-anthracite border px-4 py-3 font-body text-sm text-calcaire placeholder-acier/50 outline-none transition-colors duration-200 focus:border-or ${errors.telephone ? 'border-alerte' : 'border-acier/20'}`}
                        />
                        {errors.telephone && <p className="text-alerte text-xs mt-1">{errors.telephone.message}</p>}
                      </div>
                      <div>
                        <label className="block font-mono text-xs uppercase tracking-widest text-acier mb-2">Véhicule</label>
                        <input
                          {...register('vehicule')}
                          placeholder="Ex : Renault Clio 2020"
                          className="w-full bg-anthracite border border-acier/20 px-4 py-3 font-body text-sm text-calcaire placeholder-acier/50 outline-none transition-colors duration-200 focus:border-or"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-mono text-xs uppercase tracking-widest text-acier mb-2">Type de demande *</label>
                      <select
                        {...register('type_demande')}
                        className={`w-full bg-anthracite border px-4 py-3 font-body text-sm text-calcaire outline-none transition-colors duration-200 focus:border-or appearance-none ${errors.type_demande ? 'border-alerte' : 'border-acier/20'}`}
                      >
                        <option value="">Sélectionner...</option>
                        <option value="carrosserie">Carrosserie</option>
                        <option value="mecanique">Mécanique / Entretien</option>
                        <option value="freinage">Freinage</option>
                        <option value="pare-brise">Pare-brise</option>
                        <option value="nettoyage">Nettoyage auto</option>
                        <option value="pieces">Pièces détachées</option>
                        <option value="autre">Autre</option>
                      </select>
                      {errors.type_demande && <p className="text-alerte text-xs mt-1">{errors.type_demande.message}</p>}
                    </div>

                    <div>
                      <label className="block font-mono text-xs uppercase tracking-widest text-acier mb-2">Message *</label>
                      <textarea
                        {...register('message')}
                        rows={5}
                        placeholder="Décrivez votre problème ou votre demande..."
                        className={`w-full bg-anthracite border px-4 py-3 font-body text-sm text-calcaire placeholder-acier/50 outline-none transition-colors duration-200 focus:border-or resize-none ${errors.message ? 'border-alerte' : 'border-acier/20'}`}
                      />
                      {errors.message && <p className="text-alerte text-xs mt-1">{errors.message.message}</p>}
                    </div>

                    <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
                    </Button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center py-16"
                  >
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}>
                      <CheckCircle size={64} className="text-or mb-6" />
                    </motion.div>
                    <h3 className="font-display text-3xl text-calcaire uppercase tracking-wide mb-4">Message envoyé !</h3>
                    <p className="font-body text-acier">Nous vous répondrons rapidement,<br />généralement sous 2 heures en heures ouvrées.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Infos */}
            <div className="space-y-10">
              <div>
                <h3 className="font-mono text-xs uppercase tracking-widest text-or mb-6">Informations pratiques</h3>
                <div className="space-y-6">
                  <a href="tel:0141114340" className="flex items-center gap-4 group">
                    <div className="w-10 h-10 border border-or/30 flex items-center justify-center flex-shrink-0 group-hover:bg-or group-hover:border-or transition-all duration-200">
                      <Phone size={18} className="text-or group-hover:text-anthracite transition-colors duration-200" />
                    </div>
                    <div>
                      <p className="font-mono text-xs uppercase tracking-widest text-acier mb-0.5">Téléphone</p>
                      <p className="font-display text-2xl text-calcaire tracking-wider group-hover:text-or transition-colors">01 41 11 43 40</p>
                    </div>
                  </a>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 border border-acier/20 flex items-center justify-center flex-shrink-0">
                      <MapPin size={18} className="text-or" />
                    </div>
                    <div>
                      <p className="font-mono text-xs uppercase tracking-widest text-acier mb-0.5">Adresse</p>
                      <address className="font-body text-calcaire not-italic">
                        13 Avenue de la Gare<br />92230 Gennevilliers
                      </address>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 border border-acier/20 flex items-center justify-center flex-shrink-0">
                      <Mail size={18} className="text-or" />
                    </div>
                    <div>
                      <p className="font-mono text-xs uppercase tracking-widest text-acier mb-0.5">Services</p>
                      <p className="font-body text-calcaire text-sm">
                        Carrosserie · Mécanique · Pare-brise<br />Pièces détachées · Vente · Achat
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Horaires */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Clock size={16} className="text-or" />
                  <h3 className="font-mono text-xs uppercase tracking-widest text-or">Horaires</h3>
                  <span className={`inline-flex items-center gap-1.5 font-mono text-xs px-2 py-0.5 ${open ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-alerte/10 text-alerte border border-alerte/20'}`}>
                    {open ? '● Ouvert' : '● Fermé'}
                  </span>
                </div>
                <table className="w-full">
                  <tbody>
                    {horaires.map(h => (
                      <tr key={h.jour} className="border-b border-acier/10">
                        <td className="py-2.5 font-body text-sm text-acier">{h.jour}</td>
                        <td className={`py-2.5 font-body text-sm text-right ${h.heure === 'Fermé' ? 'text-acier/50' : 'text-calcaire'}`}>{h.heure}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Map placeholder */}
              <div className="aspect-video bg-anthracite border border-acier/10 relative overflow-hidden">
                <img src="/images/garage/facade.jpg" alt="S.E Garage" className="w-full h-full object-cover opacity-40" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin size={32} className="text-or mx-auto mb-2" />
                    <p className="font-mono text-xs uppercase tracking-widest text-calcaire">
                      13 Av. de la Gare, 92230 Gennevilliers
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
