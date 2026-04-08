import { google } from 'googleapis'

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

    const [h, m] = slot.replace('h', ':').split(':').map(Number)
    const pad = n => String(n).padStart(2, '0')

    // Pas d'offset UTC hardcodé — on laisse Google gérer CET/CEST via timeZone
    const startDateTime = `${date}T${pad(h)}:${pad(m || 0)}:00`
    const endDateTime   = `${date}T${pad(h + 1)}:${pad(m || 0)}:00`

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
        colorId: '6',
      },
    })

    console.log(`[book] RDV créé: ${nom} le ${date} à ${slot}`)
    res.json({ success: true })

  } catch (err) {
    console.error('[book] error:', err.message)
    res.status(500).json({ error: 'Erreur création RDV', details: err.message })
  }
}
