import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { services } from '../data/services'

// Step 3 schema
const step3Schema = z.object({
  nom:       z.string().min(2, 'Nom requis'),
  telephone: z.string().min(10, 'Téléphone invalide'),
  email:     z.string().email('Email invalide'),
  marque:    z.string().min(2, 'Marque & modèle requis'),
})

function ProgressBar({ step }) {
  const steps = ['Service', 'Créneau', 'Coordonnées']
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        {steps.map((label, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 flex items-center justify-center font-mono text-xs transition-all duration-300 ${
                i + 1 < step ? 'bg-or text-anthracite' :
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

function Step2({ selectedDate, selectedSlot, onSelectDate, onSelectSlot }) {
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i + 1)
    if (d.getDay() !== 0) days.push(d)
  }
  const slots = ['8h00', '9h00', '10h00', '11h00', '14h00', '15h00', '16h00', '17h00']
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
  const monthNames = ['jan', 'fév', 'mar', 'avr', 'mai', 'jui', 'jul', 'aoû', 'sep', 'oct', 'nov', 'déc']

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
      <p className="font-body text-sm text-acier mb-8">Disponibilités sur les 7 prochains jours</p>

      {/* Days */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-8">
        {days.map((day, i) => {
          const key = day.toISOString().split('T')[0]
          const isSelected = selectedDate === key
          return (
            <button
              key={key}
              onClick={() => onSelectDate(key)}
              className={`flex flex-col items-center py-3 px-1 border transition-all duration-200 ${
                isSelected ? 'border-or bg-or/10 text-or' : 'border-acier/20 text-acier hover:border-or/50'
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

      {/* Slots */}
      {selectedDate && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <p className="font-mono text-xs uppercase tracking-widest text-acier mb-4">Créneaux disponibles</p>
          <div className="grid grid-cols-4 gap-2">
            {slots.map(slot => {
              const isSelected = selectedSlot === slot
              return (
                <button
                  key={slot}
                  onClick={() => onSelectSlot(slot)}
                  className={`py-2.5 font-mono text-sm border transition-all duration-200 ${
                    isSelected ? 'border-or bg-or text-anthracite' : 'border-acier/20 text-acier hover:border-or/50 hover:text-calcaire'
                  }`}
                >
                  {slot}
                </button>
              )
            })}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

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

      <div>
        <label className="block font-mono text-xs uppercase tracking-widest text-acier mb-2">Marque & Modèle *</label>
        <input
          {...register('marque')}
          placeholder="Ex : Renault Clio IV 2020"
          className={`w-full bg-forge border px-4 py-3 font-body text-sm text-calcaire placeholder-acier/50 outline-none transition-colors focus:border-or ${errors.marque ? 'border-alerte' : 'border-acier/20'}`}
        />
        {errors.marque && <p className="text-alerte text-xs mt-1">{errors.marque.message}</p>}
      </div>
    </motion.div>
  )
}

export function Appointment() {
  const [step, setStep] = useState(1)
  const [selectedService, setSelectedService] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(step3Schema),
  })

  const goNext = () => {
    if (step === 1 && !selectedService) return
    if (step === 2 && (!selectedDate || !selectedSlot)) return
    setStep(s => s + 1)
  }

  const onSubmit = async (data) => {
    await new Promise(r => setTimeout(r, 1200))
    setSubmitted(true)
  }

  if (submitted) {
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
          <p className="font-body text-acier mb-8">
            Votre demande a été enregistrée. Nous vous confirmons votre créneau par SMS et email sous 2 heures.
          </p>
          <div className="flex flex-col gap-3">
            {['✓ Sans engagement', '✓ Confirmé sous 2h', '✓ Rappel par SMS'].map(item => (
              <p key={item} className="font-mono text-xs uppercase tracking-widest text-or">{item}</p>
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <>
      {/* Hero */}
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

      {/* Form */}
      <section className="bg-anthracite py-16 lg:py-20 min-h-[60vh]">
        <div className="max-w-2xl mx-auto px-6 lg:px-8">
          <ProgressBar step={step} />

          <form onSubmit={handleSubmit(onSubmit)}>
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
                <Step3 key="step3" register={register} errors={errors} />
              )}
            </AnimatePresence>

            {/* Navigation */}
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
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Envoi...' : 'Confirmer le RDV'}
                  {!isSubmitting && <CheckCircle size={16} className="ml-2" />}
                </Button>
              )}
            </div>
          </form>

          {/* Reassurance */}
          <div className="flex flex-wrap justify-center gap-6 mt-10">
            {['✓ Sans engagement', '✓ Confirmé sous 2h', '✓ Rappel par SMS'].map(item => (
              <p key={item} className="font-mono text-xs uppercase tracking-widest text-acier/60">{item}</p>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
