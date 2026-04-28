import { google } from 'googleapis'
import nodemailer from 'nodemailer'

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

export default async function handler(req, res) {
  const { token } = req.query

  if (!token) {
    return res.status(400).send(htmlPage(
      'Lien invalide', '❌', '#CC2B2B',
      '<p>Ce lien d\'annulation est invalide ou expiré.</p>'
    ))
  }

  let data
  try {
    data = JSON.parse(Buffer.from(token, 'base64url').toString('utf-8'))
  } catch {
    return res.status(400).json({ status: 'invalid' })
  }

  const { eventId, email, nom, date, slot, service, marque } = data
  const dateFr = formatDateFr(date)

  try {
    // ── Supprimer l'événement Google Calendar ────────────────
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key:   process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/calendar'],
    })

    const calendar = google.calendar({ version: 'v3', auth })

    await calendar.events.delete({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId,
    })

    console.log(`[cancel] RDV supprimé: ${nom} le ${date} à ${slot}`)

    // ── Envoyer les emails de confirmation d'annulation ──────
    try {
      const transporter = createTransporter()

      const htmlAnnulation = (destinataire) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 24px; border-radius: 8px;">
          <h2 style="color: #1A1A1A; border-bottom: 3px solid #CC2B2B; padding-bottom: 12px;">
            ❌ Rendez-vous annulé
          </h2>
          <p style="color: #1A1A1A; font-size: 15px; margin-bottom: 16px;">
            ${destinataire === 'garage'
              ? `Le rendez-vous de <strong>${nom}</strong> a été annulé.`
              : `Bonjour <strong>${nom}</strong>, votre rendez-vous a bien été annulé.`}
          </p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background: #CC2B2B;">
              <td style="padding: 12px 16px; font-weight: bold; color: #fff;">Date & Heure</td>
              <td style="padding: 12px 16px; color: #fff; font-weight: bold;">${dateFr} à ${slot}</td>
            </tr>
            <tr style="background: #fff;">
              <td style="padding: 10px 16px; font-weight: bold; color: #6B7280; width: 140px;">Service</td>
              <td style="padding: 10px 16px; color: #1A1A1A;">${service}</td>
            </tr>
            <tr style="background: #f5f3ef;">
              <td style="padding: 10px 16px; font-weight: bold; color: #6B7280;">Véhicule</td>
              <td style="padding: 10px 16px; color: #1A1A1A;">${marque || '—'}</td>
            </tr>
          </table>
          <p style="color: #6B7280; font-size: 13px; margin-top: 20px; text-align: center;">
            Le créneau a été libéré dans le calendrier du garage.
          </p>
        </div>
      `

      await Promise.all([
        transporter.sendMail({
          from: `"SE Garage" <${process.env.GMAIL_USER}>`,
          to:   process.env.GMAIL_USER,
          subject: `❌ RDV annulé — ${nom} — ${dateFr} à ${slot}`,
          html:    htmlAnnulation('garage'),
        }),
        email ? transporter.sendMail({
          from: `"SE Garage" <${process.env.GMAIL_USER}>`,
          to:   email,
          subject: `❌ Votre RDV au SE Garage a été annulé — ${dateFr} à ${slot}`,
          html:    htmlAnnulation('client'),
        }) : Promise.resolve(),
      ])

      console.log(`[cancel] Emails annulation envoyés pour ${nom}`)
    } catch (emailErr) {
      console.error('[cancel] Erreur email:', emailErr.message)
    }

    res.json({ status: 'success' })

  } catch (err) {
    console.error('[cancel] error:', err.message)

    if (err.code === 410 || err.message?.includes('Resource has been deleted') || err.message?.includes('Not Found')) {
      return res.json({ status: 'already' })
    }

    res.status(500).json({ status: 'error' })
  }
}
