import { google } from 'googleapis'
import nodemailer from 'nodemailer'

// ── Appelé automatiquement chaque jour à 9h (Vercel Cron) ───

function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })
}

function formatDateFr(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

// Extrait une valeur depuis la description de l'événement
function parseDesc(description, emoji) {
  const line = (description || '').split('\n').find(l => l.startsWith(emoji))
  return line ? line.replace(emoji, '').trim() : null
}

export default async function handler(req, res) {
  // Sécurité : header Vercel Cron ou clé secrète
  const authHeader = req.headers.authorization
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && req.headers['x-vercel-cron'] !== '1') {
    return res.status(401).json({ error: 'Non autorisé' })
  }

  try {
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key:   process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/calendar'],
    })

    const calendar = google.calendar({ version: 'v3', auth })

    // Demain en heure Paris
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const y = tomorrow.getFullYear()
    const m = String(tomorrow.getMonth() + 1).padStart(2, '0')
    const d = String(tomorrow.getDate()).padStart(2, '0')
    const dateTomorrow = `${y}-${m}-${d}`
    const dateFr = formatDateFr(dateTomorrow)

    const timeMin = new Date(`${dateTomorrow}T00:00:00+01:00`)
    const timeMax = new Date(`${dateTomorrow}T23:59:59+02:00`)

    const { data } = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      timeMin:    timeMin.toISOString(),
      timeMax:    timeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    })

    const events = data.items || []
    console.log(`[reminder] ${events.length} RDV demain (${dateTomorrow})`)

    if (events.length === 0) {
      return res.json({ sent: 0, message: 'Aucun RDV demain' })
    }

    const transporter = createTransporter()
    let sent = 0

    for (const event of events) {
      const desc  = event.description || ''
      const nom   = parseDesc(desc, '👤')
      const email = parseDesc(desc, '📧')
      const service = parseDesc(desc, '🔧')
      const marque  = parseDesc(desc, '🚗')

      // Extraire l'heure de début
      const startIso = event.start?.dateTime
      let slot = ''
      if (startIso) {
        const parts = new Intl.DateTimeFormat('fr-FR', {
          timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit', hour12: false,
        }).formatToParts(new Date(startIso))
        const h = parts.find(p => p.type === 'hour')?.value
        const min = parts.find(p => p.type === 'minute')?.value
        slot = min === '00' ? `${h}h00` : `${h}h${min}`
      }

      if (!email) {
        console.log(`[reminder] Pas d'email pour l'événement: ${event.summary}`)
        continue
      }

      try {
        const telephone = parseDesc(desc, '📞')

        // Email au client
        const emailClient = email ? transporter.sendMail({
          from: `"SE Garage" <${process.env.GMAIL_USER}>`,
          to:   email,
          subject: `⏰ Rappel — Votre RDV au SE Garage demain à ${slot}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 24px; border-radius: 8px;">
              <h2 style="color: #1A1A1A; border-bottom: 3px solid #C8963E; padding-bottom: 12px;">
                ⏰ Rappel de rendez-vous
              </h2>
              <p style="color: #1A1A1A; font-size: 15px;">Bonjour <strong>${nom || 'cher client'}</strong>,</p>
              <p style="color: #6B7280; font-size: 15px; line-height: 1.6; margin: 12px 0;">
                Nous vous rappelons votre rendez-vous au <strong>SE Garage</strong> <strong>demain</strong> :
              </p>
              <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
                <tr style="background: #C8963E;">
                  <td style="padding: 12px 16px; font-weight: bold; color: #fff;">Date & Heure</td>
                  <td style="padding: 12px 16px; color: #fff; font-weight: bold;">${dateFr} à ${slot}</td>
                </tr>
                ${service ? `<tr style="background: #fff;">
                  <td style="padding: 10px 16px; font-weight: bold; color: #6B7280; width: 140px;">Service</td>
                  <td style="padding: 10px 16px; color: #1A1A1A;">${service}</td>
                </tr>` : ''}
                ${marque ? `<tr style="background: #f5f3ef;">
                  <td style="padding: 10px 16px; font-weight: bold; color: #6B7280;">Véhicule</td>
                  <td style="padding: 10px 16px; color: #1A1A1A;">${marque}</td>
                </tr>` : ''}
              </table>
              <div style="background: #fff; border-left: 4px solid #C8963E; padding: 16px; margin-top: 20px;">
                <p style="margin: 0; color: #6B7280; font-size: 13px;">
                  📍 N'oubliez pas de venir avec votre carte grise.<br>
                  📞 En cas d'empêchement : <a href="tel:+33141114340" style="color: #C8963E;">01 41 11 43 40</a>
                </p>
              </div>
              <p style="color: #6B7280; font-size: 12px; margin-top: 24px; text-align: center;">
                SE Garage — Votre garage de confiance
              </p>
            </div>
          `,
        }) : Promise.resolve()

        await emailClient
        sent++
        console.log(`[reminder] Rappels envoyés pour ${nom} — ${dateFr} à ${slot}`)
      } catch (e) {
        console.error(`[reminder] Erreur envoi:`, e.message)
      }
    }

    res.json({ sent, total: events.length, date: dateTomorrow })

  } catch (err) {
    console.error('[reminder] error:', err.message)
    res.status(500).json({ error: err.message })
  }
}
