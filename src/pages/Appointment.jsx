import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { services } from '../data/services'

// ─── Schemas ─────────────────────────────────────────────────────────────────
const step3Schema = z.object({
  nom:          z.string({ required_error: 'Nom requis' }).min(2, 'Nom requis'),
  telephone:    z.string({ required_error: 'Téléphone requis' }).min(10, 'Numéro invalide (10 chiffres minimum)'),
  email:        z.string({ required_error: 'Email requis' }).min(1, 'Email requis').email('Adresse email invalide'),
  marque:       z.string({ required_error: 'Marque & modèle requis' }).min(2, 'Marque & modèle requis'),
  kilometrage:  z.string().optional(),
  immatriculation: z.string({ required_error: 'Immatriculation requise' })
    .min(1, 'Immatriculation requise')
    .regex(/^[A-Za-z]{2}-?[0-9]{3}-?[A-Za-z]{2}$/, 'Format invalide — exemple : AB-123-CD'),
})

// Créneaux toutes les 30 minutes (matin + après-midi)
const ALL_SLOTS = [
  '8h00','8h30','9h00','9h30','10h00','10h30','11h00','11h30',
  '14h00','14h30','15h00','15h30','16h00','16h30','17h00','17h30',
]

const dayNames   = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
const monthNames = ['jan', 'fév', 'mar', 'avr', 'mai', 'jui', 'jul', 'aoû', 'sep', 'oct', 'nov', 'déc']

const localDateKey = (d) => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Génère les 30 prochains jours (hors dimanche)
function buildDays() {
  const days = []
  let i = 1
  while (days.length < 30) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    if (d.getDay() !== 0) days.push(d)
    i++
  }
  return days
}

// ─── Progress Bar ────────────────────────────────────────────────────────────
function ProgressBar({ step }) {
  const steps = ['Service', 'Créneau', 'Coordonnées']
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        {steps.map((label, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 flex items-center justify-center font-mono text-xs transition-all duration-300 ${
                i + 1 < step  ? 'bg-or text-anthracite' :
                i + 1 === step ? 'border border-or text-or' :
                'border border-acier/30 text-acier/50'
              }`}>
                {i + 1 < step ? '✓' : i + 1}
              </div>
              <span className={`font-mono text-xs uppercase tracking-widest hidden sm:block transition-colors ${
                i + 1 === step ? 'text-or' : i + 1 < step ? 'text-acier' : 'text-acier/40'
              }`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-3 transition-all duration-300 ${i + 1 < step ? 'bg-or' : 'bg-acier/20'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Step 1 : Service ────────────────────────────────────────────────────────
function Step1({ selectedService, onSelect }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="font-display text-2xl lg:text-3xl text-calcaire uppercase tracking-wide mb-2">
        Quel service souhaitez-vous ?
      </h2>
      <p className="font-body text-sm text-acier mb-8">Sélectionnez le type d'intervention</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {services.map(service => {
          const Icon = service.icon
          const isSelected = selectedService === service.id
          return (
            <button
              key={service.id}
              onClick={() => onSelect(service.id)}
              className={`flex items-center gap-4 p-4 border text-left transition-all duration-200 ${
                isSelected
                  ? 'border-or bg-or/10 text-or'
                  : 'border-acier/20 text-acier hover:border-or/50 hover:text-calcaire'
              }`}
            >
              <div className={`w-10 h-10 flex items-center justify-center flex-shrink-0 border ${
                isSelected ? 'border-or bg-or/20' : 'border-acier/20'
              }`}>
                <Icon size={18} className={isSelected ? 'text-or' : 'text-acier'} />
              </div>
              <span className="font-body text-sm font-medium">{service.title}</span>
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}

// ─── Step 2 : Créneau (30 jours + créneaux 30min) ───────────────────────────
function Step2({ selectedDate, selectedSlot, onSelectDate, onSelectSlot }) {
  const [takenSlots, setTakenSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [weekOffset, setWeekOffset] = useState(0)

  const allDays = buildDays()
  // 7 jours par page
  const weekDays = allDays.slice(weekOffset * 7, weekOffset * 7 + 7)
  const totalWeeks = Math.ceil(allDays.length / 7)

  useEffect(() => {
    if (!selectedDate) return
    setTakenSlots([])
    setLoadingSlots(true)
    fetch(`/api/availability?date=${selectedDate}`)
      .then(r => r.json())
      .then(data => setTakenSlots(data.takenSlots || []))
      .catch(() => setTakenSlots([]))
      .finally(() => setLoadingSlots(false))
  }, [selectedDate])

  const morningSlots = ALL_SLOTS.filter(s => {
    const h = parseInt(s.split('h')[0])
    return h < 12
  })
  const afternoonSlots = ALL_SLOTS.filter(s => {
    const h = parseInt(s.split('h')[0])
    return h >= 14
  })

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="font-display text-2xl lg:text-3xl text-calcaire uppercase tracking-wide mb-2">
        Choisissez un créneau
      </h2>
      <p className="font-body text-sm text-acier mb-6">Disponibilités sur les 30 prochains jours</p>

      {/* Navigation semaines */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => { setWeekOffset(w => Math.max(0, w - 1)); onSelectDate(null); onSelectSlot(null) }}
          disabled={weekOffset === 0}
          className="flex items-center gap-1 font-mono text-xs uppercase tracking-widest text-acier hover:text-or transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={14} /> Préc.
        </button>
        <span className="font-mono text-xs uppercase tracking-widest text-acier/60">
          Semaine {weekOffset + 1} / {totalWeeks}
        </span>
        <button
          onClick={() => { setWeekOffset(w => Math.min(totalWeeks - 1, w + 1)); onSelectDate(null); onSelectSlot(null) }}
          disabled={weekOffset >= totalWeeks - 1}
          className="flex items-center gap-1 font-mono text-xs uppercase tracking-widest text-acier hover:text-or transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Suiv. <ChevronRight size={14} />
        </button>
      </div>

      {/* Jours de la semaine */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-8">
        {weekDays.map((day) => {
          const key = localDateKey(day)
          const isSelected = selectedDate === key
          return (
            <button
              key={key}
              onClick={() => { onSelectDate(key); onSelectSlot(null) }}
              className={`flex flex-col items-center py-3 px-1 border transition-all duration-200 ${
                isSelected
                  ? 'border-or bg-or/10 text-or'
                  : 'border-acier/20 text-acier hover:border-or/50'
              }`}
            >
              <span className="font-mono text-xs uppercase">{dayNames[day.getDay()]}</span>
              <span className={`font-display text-2xl leading-none my-1 ${isSelected ? 'text-or' : 'text-calcaire'}`}>
                {day.getDate()}
              </span>
              <span className="font-mono text-xs uppercase text-acier/60">{monthNames[day.getMonth()]}</span>
            </button>
          )
        })}
      </div>

      {/* Créneaux */}
      {selectedDate && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-4">
            <p className="font-mono text-xs uppercase tracking-widest text-acier">Créneaux disponibles</p>
            {loadingSlots && <Loader2 size={12} className="text-or animate-spin" />}
          </div>

          {/* Matin */}
          <p className="font-mono text-xs uppercase tracking-widest text-acier/40 mb-2">Matin</p>
          <div className="grid grid-cols-4 gap-2 mb-5">
            {morningSlots.map(slot => {
              const isTaken = takenSlots.includes(slot)
              const isSelected = selectedSlot === slot
              if (isTaken) return (
                <div key={slot} className="py-2.5 font-mono text-sm border border-acier/10 text-acier/25 text-center cursor-not-allowed">
                  <span className="line-through">{slot}</span>
                </div>
              )
              return (
                <button
                  key={slot}
                  onClick={() => onSelectSlot(slot)}
                  className={`py-2.5 font-mono text-sm border transition-all duration-200 ${
                    isSelected
                      ? 'border-or bg-or text-anthracite'
                      : 'border-acier/20 text-acier hover:border-or/50 hover:text-calcaire'
                  }`}
                >
                  {slot}
                </button>
              )
            })}
          </div>

          {/* Après-midi */}
          <p className="font-mono text-xs uppercase tracking-widest text-acier/40 mb-2">Après-midi</p>
          <div className="grid grid-cols-4 gap-2 mb-5">
            {afternoonSlots.map(slot => {
              const isTaken = takenSlots.includes(slot)
              const isSelected = selectedSlot === slot
              if (isTaken) return (
                <div key={slot} className="py-2.5 font-mono text-sm border border-acier/10 text-acier/25 text-center cursor-not-allowed">
                  <span className="line-through">{slot}</span>
                </div>
              )
              return (
                <button
                  key={slot}
                  onClick={() => onSelectSlot(slot)}
                  className={`py-2.5 font-mono text-sm border transition-all duration-200 ${
                    isSelected
                      ? 'border-or bg-or text-anthracite'
                      : 'border-acier/20 text-acier hover:border-or/50 hover:text-calcaire'
                  }`}
                >
                  {slot}
                </button>
              )
            })}
          </div>

          {/* Légende */}
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border border-or bg-or/10" />
              <span className="font-mono text-xs text-acier/60 uppercase tracking-widest">Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border border-acier/10 bg-acier/5" />
              <span className="font-mono text-xs text-acier/40 uppercase tracking-widest">Déjà pris</span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

// ─── Step 3 : Coordonnées ────────────────────────────────────────────────────
function Step3({ register, errors }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
    >
      <h2 className="font-display text-2xl lg:text-3xl text-calcaire uppercase tracking-wide mb-2">
        Vos coordonnées
      </h2>
      <p className="font-body text-sm text-acier mb-6">Dernière étape — confirmation sous 2h</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-mono text-xs uppercase tracking-widest text-acier mb-2">Nom *</label>
          <input
            {...register('nom')}
            placeholder="Votre nom"
            className={`w-full bg-forge border px-4 py-3 font-body text-sm text-calcaire placeholder-acier/50 outline-none transition-colors focus:border-or ${errors.nom ? 'border-alerte' : 'border-acier/20'}`}
          />
          {errors.nom && <p className="text-alerte text-xs mt-1">{errors.nom.message}</p>}
        </div>
        <div>
          <label className="block font-mono text-xs uppercase tracking-widest text-acier mb-2">Téléphone *</label>
          <input
            {...register('telephone')}
            type="tel"
            placeholder="06 XX XX XX XX"
            className={`w-full bg-forge border px-4 py-3 font-body text-sm text-calcaire placeholder-acier/50 outline-none transition-colors focus:border-or ${errors.telephone ? 'border-alerte' : 'border-acier/20'}`}
          />
          {errors.telephone && <p className="text-alerte text-xs mt-1">{errors.telephone.message}</p>}
        </div>
      </div>

      <div>
        <label className="block font-mono text-xs uppercase tracking-widest text-acier mb-2">Email *</label>
        <input
          {...register('email')}
          type="email"
          placeholder="votre@email.fr"
          className={`w-full bg-forge border px-4 py-3 font-body text-sm text-calcaire placeholder-acier/50 outline-none transition-colors focus:border-or ${errors.email ? 'border-alerte' : 'border-acier/20'}`}
        />
        {errors.email && <p className="text-alerte text-xs mt-1">{errors.email.message}</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-mono text-xs uppercase tracking-widest text-acier mb-2">Marque & Modèle *</label>
          <input
            {...register('marque')}
            placeholder="Ex : Renault Clio IV 2020"
            className={`w-full bg-forge border px-4 py-3 font-body text-sm text-calcaire placeholder-acier/50 outline-none transition-colors focus:border-or ${errors.marque ? 'border-alerte' : 'border-acier/20'}`}
          />
          {errors.marque && <p className="text-alerte text-xs mt-1">{errors.marque.message}</p>}
        </div>
        <div>
          <label className="block font-mono text-xs uppercase tracking-widest text-acier mb-2">
            Kilométrage <span className="text-acier/40 normal-case tracking-normal">(optionnel)</span>
          </label>
          <input
            {...register('kilometrage')}
            type="number"
            placeholder="Ex : 85000"
            className="w-full bg-forge border border-acier/20 px-4 py-3 font-body text-sm text-calcaire placeholder-acier/50 outline-none transition-colors focus:border-or"
          />
        </div>
      </div>

      <div>
        <label className="block font-mono text-xs uppercase tracking-widest text-acier mb-2">
          Plaque d'immatriculation *
        </label>
        <input
          {...register('immatriculation')}
          placeholder="Ex : AB-123-CD"
          className={`w-full bg-forge border px-4 py-3 font-body text-sm text-calcaire placeholder-acier/50 outline-none transition-colors focus:border-or ${errors.immatriculation ? 'border-alerte' : 'border-acier/20'}`}
          style={{ textTransform: 'uppercase' }}
        />
        {errors.immatriculation && <p className="text-alerte text-xs mt-1">{errors.immatriculation.message}</p>}
      </div>
    </motion.div>
  )
}

// ─── Page principale ─────────────────────────────────────────────────────────
export function Appointment() {
  const [step, setStep]               = useState(1)
  const [selectedService, setSelectedService] = useState(null)
  const [selectedDate, setSelectedDate]       = useState(null)
  const [selectedSlot, setSelectedSlot]       = useState(null)
  const [submitted, setSubmitted]             = useState(false)
  const [triedSubmit, setTriedSubmit]         = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(step3Schema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  })

  const goNext = () => {
    if (step === 1 && !selectedService) return
    if (step === 2 && (!selectedDate || !selectedSlot)) return
    setStep(s => s + 1)
  }

  const onSubmit = async (data) => {
    const serviceName = services.find(s => s.id === selectedService)?.title || selectedService

    await fetch('/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date:        selectedDate,
        slot:        selectedSlot,
        nom:         data.nom,
        telephone:   data.telephone,
        email:       data.email,
        marque:          data.marque,
        kilometrage:     data.kilometrage || '',
        immatriculation: data.immatriculation || '',
        service:         serviceName,
      }),
    }).catch(() => {})

    setSubmitted(true)
  }

  // ─── Confirmation ─────────────────────────────────────────────────────────
  if (submitted) {
    const serviceName = services.find(s => s.id === selectedService)?.title || ''
    const dateFormatted = selectedDate
      ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('fr-FR', {
          weekday: 'long', day: 'numeric', month: 'long'
        })
      : ''

    return (
      <div className="min-h-screen bg-forge flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-20 h-20 bg-or/10 border border-or/30 flex items-center justify-center mx-auto mb-8"
          >
            <CheckCircle size={40} className="text-or" />
          </motion.div>
          <h2 className="font-display text-4xl text-calcaire uppercase tracking-wide mb-4">
            Rendez-vous confirmé !
          </h2>
          {(serviceName || dateFormatted) && (
            <div className="border border-acier/20 p-4 mb-6 text-left">
              {serviceName && (
                <>
                  <p className="font-mono text-xs uppercase tracking-widest text-acier/60 mb-1">Service</p>
                  <p className="font-body text-sm text-calcaire mb-3">{serviceName}</p>
                </>
              )}
              {dateFormatted && (
                <>
                  <p className="font-mono text-xs uppercase tracking-widest text-acier/60 mb-1">Créneau</p>
                  <p className="font-body text-sm text-calcaire capitalize">{dateFormatted} à {selectedSlot}</p>
                </>
              )}
            </div>
          )}
          <p className="font-body text-acier mb-8">
            Votre rendez-vous a été ajouté au calendrier du garage. Vous recevrez une confirmation par email sous 2 heures.
          </p>
          <div className="flex flex-col gap-3">
            {['✓ Ajouté au calendrier Google', '✓ Confirmation par email', '✓ Rappel 24h avant'].map(item => (
              <p key={item} className="font-mono text-xs uppercase tracking-widest text-or">{item}</p>
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  // ─── Formulaire ──────────────────────────────────────────────────────────
  return (
    <>
      <section className="bg-forge pt-32 pb-10 border-b border-acier/10">
        <div className="max-w-2xl mx-auto px-6 lg:px-8 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-or mb-4">Prise de rendez-vous</p>
          <h1 className="font-display text-calcaire uppercase leading-none mb-4" style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}>
            RDV en 2 minutes
          </h1>
          <p className="font-body text-acier text-sm">
            Choisissez votre service, sélectionnez un créneau, confirmez vos infos.
          </p>
        </div>
      </section>

      <section className="bg-anthracite py-16 lg:py-20 min-h-[60vh]">
        <div className="max-w-2xl mx-auto px-6 lg:px-8">
          <ProgressBar step={step} />

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <Step1
                  key="step1"
                  selectedService={selectedService}
                  onSelect={setSelectedService}
                />
              )}
              {step === 2 && (
                <Step2
                  key="step2"
                  selectedDate={selectedDate}
                  selectedSlot={selectedSlot}
                  onSelectDate={setSelectedDate}
                  onSelectSlot={setSelectedSlot}
                />
              )}
              {step === 3 && (
                <Step3 key="step3" register={register} errors={triedSubmit ? errors : {}} />
              )}
            </AnimatePresence>

            <div className="flex justify-between items-center mt-10 pt-6 border-t border-acier/20">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(s => s - 1)}
                  className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-acier hover:text-calcaire transition-colors"
                >
                  <ChevronLeft size={16} />
                  Retour
                </button>
              ) : <div />}

              {step < 3 ? (
                <Button
                  type="button"
                  onClick={goNext}
                  disabled={
                    (step === 1 && !selectedService) ||
                    (step === 2 && (!selectedDate || !selectedSlot))
                  }
                  className="disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continuer
                  <ChevronRight size={16} className="ml-2" />
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting} onClick={() => setTriedSubmit(true)}>
                  {isSubmitting ? 'Enregistrement...' : 'Confirmer le RDV'}
                  {!isSubmitting && <CheckCircle size={16} className="ml-2" />}
                </Button>
              )}
            </div>
          </form>

          <div className="flex flex-wrap justify-center gap-6 mt-10">
            {['✓ Sans engagement', '✓ Confirmation par email', '✓ Rappel 24h avant'].map(item => (
              <p key={item} className="font-mono text-xs uppercase tracking-widest text-acier/60">{item}</p>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
