import { useState, useEffect } from 'react'

// Horaires du garage S.E Garage
// jour 0 = Dimanche, 1 = Lundi, ..., 6 = Samedi
const SCHEDULE = {
  0: null,               // Dimanche : fermé
  1: { open: 8,  close: 19 }, // Lundi
  2: { open: 8,  close: 19 }, // Mardi
  3: { open: 8,  close: 19 }, // Mercredi
  4: { open: 8,  close: 19 }, // Jeudi
  5: { open: 8,  close: 19 }, // Vendredi
  6: { open: 9,  close: 17 }, // Samedi
}

const DAY_NAMES = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

/**
 * Retourne { hour, minute, day } en heure locale Europe/Paris
 * en utilisant Intl.DateTimeFormat pour éviter les problèmes UTC.
 */
function getParisTime(date) {
  const fmt = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    hour: 'numeric',
    minute: 'numeric',
    weekday: 'short',
    hour12: false,
  })

  const parts = fmt.formatToParts(date)
  const get = (type) => parts.find(p => p.type === type)?.value

  // weekday en 'fr-FR' court : 'lun.', 'mar.', etc.
  const weekdayMap = { 'lun.': 1, 'mar.': 2, 'mer.': 3, 'jeu.': 4, 'ven.': 5, 'sam.': 6, 'dim.': 0 }
  const weekdayStr = get('weekday')
  const day = weekdayMap[weekdayStr] ?? date.getDay()

  const hour   = parseInt(get('hour'), 10)
  const minute = parseInt(get('minute'), 10)

  return { hour, minute, day }
}

/**
 * Trouve le prochain jour d'ouverture à partir du jour donné (en avançant).
 * Retourne { day, dayName } ou null si aucun trouvé dans la semaine.
 */
function getNextOpenDay(currentDay) {
  for (let i = 1; i <= 7; i++) {
    const nextDay = (currentDay + i) % 7
    if (SCHEDULE[nextDay] !== null) {
      return { day: nextDay, dayName: DAY_NAMES[nextDay] }
    }
  }
  return null
}

function computeStatus() {
  const now = new Date()
  const { hour, minute, day } = getParisTime(now)
  const hours = hour + minute / 60
  const todaySchedule = SCHEDULE[day]

  if (todaySchedule !== null && hours >= todaySchedule.open && hours < todaySchedule.close) {
    // Ouvert maintenant
    const closeH = todaySchedule.close
    return {
      isOpen: true,
      label: "Ouvert aujourd'hui",
      nextChange: `Ferme à ${closeH}h`,
    }
  }

  // Fermé — trouver la prochaine ouverture
  if (todaySchedule !== null && hours < todaySchedule.open) {
    // Ouverture plus tard aujourd'hui
    return {
      isOpen: false,
      label: 'Fermé',
      nextChange: `Ouvre à ${todaySchedule.open}h`,
    }
  }

  // Chercher le prochain jour d'ouverture
  const next = getNextOpenDay(day)
  if (next) {
    const tomorrowDay = (day + 1) % 7
    const tomorrowName = next.day === tomorrowDay ? 'demain' : next.dayName.toLowerCase()
    const nextOpen = SCHEDULE[next.day].open
    return {
      isOpen: false,
      label: 'Fermé',
      nextChange: `Ouvre ${tomorrowName} à ${nextOpen}h`,
    }
  }

  return {
    isOpen: false,
    label: 'Fermé',
    nextChange: '',
  }
}

export function useGarageStatus() {
  const [status, setStatus] = useState(computeStatus)

  useEffect(() => {
    // Recalculer chaque minute
    const interval = setInterval(() => {
      setStatus(computeStatus())
    }, 60_000)

    return () => clearInterval(interval)
  }, [])

  return status
}
