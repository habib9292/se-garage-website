import { google } from 'googleapis'

function slotToTime(slot) {
  const [h, m] = slot.replace('h', ':').split(':').map(Number)
  return { h, m: m || 0 }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' })

  const { date, slot, nom, telephone, email, marque, service } = req.body

  if (!date || !slot || !nom) {
    return res.status(400).json({ error: 'Données manquantes' })
  }

  try {
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key:   process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/calendar'],
    })

    const calendar = google.calendar({ version: 'v3', auth })

    const { h, m } = slotToTime(slot)
    const pad = n => String(n).padStart(2, '0')

    // Format ISO avec timezone Paris explicite pour éviter le décalage UTC
    const startDateTime = `${date}T${pad(h)}:${pad(m)}:00+02:00`
    const endDateTime   = `${date}T${pad(h + 1)}:${pad(m)}:00+02:00`

    await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      requestBody: {
        summary:     `RDV — ${nom} — ${service}`,
        description: [
          `👤 ${nom}`,
          `📞 ${telephone}`,
          `📧 ${email}`,
          `🚗 ${marque}`,
          `🔧 ${service}`,
        ].join('\n'),
        start: { dateTime: startDateTime, timeZone: 'Europe/Paris' },
        end:   { dateTime: endDateTime,   timeZone: 'Europe/Paris' },
        colorId: '6', // bleu
      },
    })

    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur création RDV', details: err.message })
  }
}
