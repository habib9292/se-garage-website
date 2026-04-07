import { google } from 'googleapis'

const SLOTS = ['8h00', '9h00', '10h00', '11h00', '14h00', '15h00', '16h00', '17h00']

function slotToMinutes(slot) {
  const [h, m] = slot.replace('h', ':').split(':').map(Number)
  return h * 60 + (m || 0)
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
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    })

    const calendar = google.calendar({ version: 'v3', auth })

    // Force timezone Paris (UTC+1 hiver / UTC+2 été) — on prend large des deux côtés
    const timeMin = new Date(`${date}T00:00:00+01:00`)
    const timeMax = new Date(`${date}T23:59:59+02:00`)

    const { data } = await calendar.freebusy.query({
      requestBody: {
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        timeZone: 'Europe/Paris',
        items: [{ id: process.env.GOOGLE_CALENDAR_ID }],
      },
    })

    const busyPeriods = data.calendars?.[process.env.GOOGLE_CALENDAR_ID]?.busy || []
    console.log(`[availability] date=${date} busyPeriods=${JSON.stringify(busyPeriods)}`)

    // Vérifie chaque créneau contre les périodes occupées
    const takenSlots = SLOTS.filter(slot => {
      const slotStart = slotToMinutes(slot)
      const slotEnd   = slotStart + 60

      return busyPeriods.some(period => {
        const busyStart = new Date(period.start)
        const busyEnd   = new Date(period.end)
        const bStart = busyStart.getHours() * 60 + busyStart.getMinutes()
        const bEnd   = busyEnd.getHours()   * 60 + busyEnd.getMinutes()
        // Chevauchement
        return slotStart < bEnd && slotEnd > bStart
      })
    })

    console.log(`[availability] takenSlots=${JSON.stringify(takenSlots)}`)
    res.json({ date, takenSlots })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur Google Calendar', details: err.message })
  }
}
