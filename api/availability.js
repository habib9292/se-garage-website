import { google } from 'googleapis'

const SLOTS = [
  '8h00','8h30','9h00','9h30','10h00','10h30','11h00','11h30',
  '14h00','14h30','15h00','15h30','16h00','16h30','17h00','17h30',
]

function slotToMinutes(slot) {
  const [h, m] = slot.replace('h', ':').split(':').map(Number)
  return h * 60 + (m || 0)
}

// Convertit une date ISO en minutes depuis minuit — heure Paris (gère CET et CEST)
function toParisMinutes(isoString) {
  const parts = new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris',
    hour:   '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date(isoString))

  const h = parseInt(parts.find(p => p.type === 'hour').value)
  const m = parseInt(parts.find(p => p.type === 'minute').value)
  return h * 60 + m
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate')
  res.setHeader('Pragma', 'no-cache')

  const { date } = req.query
  if (!date) return res.status(400).json({ error: 'date requis (YYYY-MM-DD)' })

  try {
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key:   process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/calendar'],
    })

    const calendar = google.calendar({ version: 'v3', auth })

    // Large plage horaire pour couvrir CET (UTC+1) et CEST (UTC+2)
    const timeMin = new Date(`${date}T00:00:00+01:00`)
    const timeMax = new Date(`${date}T23:59:59+02:00`)

    const { data } = await calendar.freebusy.query({
      requestBody: {
        timeMin:  timeMin.toISOString(),
        timeMax:  timeMax.toISOString(),
        timeZone: 'Europe/Paris',
        items: [{ id: process.env.GOOGLE_CALENDAR_ID }],
      },
    })

    const busyPeriods = data.calendars?.[process.env.GOOGLE_CALENDAR_ID]?.busy || []
    console.log(`[availability] date=${date} busyPeriods=${JSON.stringify(busyPeriods)}`)

    // Compare en heure Paris grâce à Intl.DateTimeFormat
    const takenSlots = SLOTS.filter(slot => {
      const slotStart = slotToMinutes(slot)
      const slotEnd   = slotStart + 30

      return busyPeriods.some(period => {
        const bStart = toParisMinutes(period.start)
        const bEnd   = toParisMinutes(period.end)
        // Chevauchement
        return slotStart < bEnd && slotEnd > bStart
      })
    })

    console.log(`[availability] takenSlots=${JSON.stringify(takenSlots)}`)
    res.json({ date, takenSlots })

  } catch (err) {
    console.error('[availability] error:', err.message)
    res.status(500).json({ error: 'Erreur Google Calendar', details: err.message })
  }
}
