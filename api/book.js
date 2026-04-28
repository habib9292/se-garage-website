import { google } from 'googleapis'
import nodemailer from 'nodemailer'

// ── Transporter Gmail ────────────────────────────────────────
function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })
}

// ── Formatage date en français ───────────────────────────────
function formatDateFr(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

// ── Génère un token d'annulation (base64) ───────────────────
function cancelToken(data) {
  return Buffer.from(JSON.stringify(data)).toString('base64url')
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' })

  const { date, slot, nom, telephone, email, marque, service, kilometrage } = req.body

  if (!date || !slot || !nom) {
    return res.status(400).json({ error: 'Données manquantes' })
  }

  const dateFr = formatDateFr(date)
  const siteUrl = process.env.VITE_SITE_URL || 'https://garage-premium.vercel.app'

  try {
    // ── 1. Créer l'événement Google Calendar ─────────────────
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key:   process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/calendar'],
    })

    const calendar = google.calendar({ version: 'v3', auth })

    const [h, m] = slot.replace('h', ':').split(':').map(Number)
    const pad = n => String(n).padStart(2, '0')

    const startDateTime = `${date}T${pad(h)}:${pad(m || 0)}:00`
    // Durée 30 minutes
    const endH = (m || 0) === 30 ? h + 1 : h
    const endM = (m || 0) === 30 ? 0 : 30
    const endDateTime = `${date}T${pad(endH)}:${pad(endM)}:00`

    const { data: event } = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      requestBody: {
        summary:     `RDV — ${nom} — ${service}`,
        description: [
          `👤 ${nom}`,
          `📞 ${telephone}`,
          `📧 ${email}`,
          `🚗 ${marque}`,
          `🔧 ${service}`,
          kilometrage ? `📏 ${kilometrage} km` : '',
        ].filter(Boolean).join('\n'),
        start: { dateTime: startDateTime, timeZone: 'Europe/Paris' },
        end:   { dateTime: endDateTime,   timeZone: 'Europe/Paris' },
        colorId: '6',
      },
    })

    console.log(`[book] RDV créé: ${nom} le ${date} à ${slot} (eventId: ${event.id})`)

    // ── 2. Générer les liens d'annulation ────────────────────
    const tokenData = { eventId: event.id, email, nom, date, slot, service, marque, telephone }
    const token = cancelToken(tokenData)
    const cancelUrl = `${siteUrl}/annulation?token=${token}`

    // ── 3. Envoyer les emails (en parallèle) ─────────────────
    try {
      const transporter = createTransporter()

      const emailGarage = transporter.sendMail({
        from: `"SE Garage" <${process.env.GMAIL_USER}>`,
        to:   process.env.GMAIL_USER,
        subject: `🔧 Nouveau RDV — ${nom} — ${dateFr} à ${slot}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 24px; border-radius: 8px;">
            <h2 style="color: #1A1A1A; border-bottom: 3px solid #C8963E; padding-bottom: 12px;">
              🔧 Nouveau rendez-vous
            </h2>
            <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
              <tr style="background: #fff;">
                <td style="padding: 10px 16px; font-weight: bold; color: #6B7280; width: 140px;">Client</td>
                <td style="padding: 10px 16px; color: #1A1A1A;">${nom}</td>
              </tr>
              <tr style="background: #f5f3ef;">
                <td style="padding: 10px 16px; font-weight: bold; color: #6B7280;">Téléphone</td>
                <td style="padding: 10px 16px; color: #1A1A1A;">${telephone}</td>
              </tr>
              <tr style="background: #fff;">
                <td style="padding: 10px 16px; font-weight: bold; color: #6B7280;">Email</td>
                <td style="padding: 10px 16px; color: #1A1A1A;">${email}</td>
              </tr>
              <tr style="background: #f5f3ef;">
                <td style="padding: 10px 16px; font-weight: bold; color: #6B7280;">Véhicule</td>
                <td style="padding: 10px 16px; color: #1A1A1A;">${marque}</td>
              </tr>
              <tr style="background: #fff;">
                <td style="padding: 10px 16px; font-weight: bold; color: #6B7280;">Service</td>
                <td style="padding: 10px 16px; color: #1A1A1A;">${service}</td>
              </tr>
              ${kilometrage ? `<tr style="background: #f5f3ef;">
                <td style="padding: 10px 16px; font-weight: bold; color: #6B7280;">Kilométrage</td>
                <td style="padding: 10px 16px; color: #1A1A1A;">${kilometrage} km</td>
              </tr>` : ''}
              <tr style="background: #E8620A;">
                <td style="padding: 12px 16px; font-weight: bold; color: #fff;">Date & Heure</td>
                <td style="padding: 12px 16px; color: #fff; font-weight: bold;">${dateFr} à ${slot}</td>
              </tr>
            </table>
            <div style="margin-top: 20px; text-align: center;">
              <a href="${cancelUrl}" style="display: inline-block; background: #CC2B2B; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px;">
                ❌ Annuler ce rendez-vous
              </a>
            </div>
            <p style="color: #6B7280; font-size: 12px; margin-top: 16px; text-align: center;">
              Ce rendez-vous a été automatiquement ajouté à votre Google Agenda.
            </p>
          </div>
        `,
      })

      const emailClient = email ? transporter.sendMail({
        from: `"SE Garage" <${process.env.GMAIL_USER}>`,
        to:   email,
        subject: `✅ Votre RDV au SE Garage est confirmé — ${dateFr} à ${slot}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 24px; border-radius: 8px;">
            <h2 style="color: #1A1A1A; border-bottom: 3px solid #C8963E; padding-bottom: 12px;">
              ✅ Rendez-vous confirmé
            </h2>
            <p style="color: #1A1A1A; font-size: 15px;">Bonjour <strong>${nom}</strong>,</p>
            <p style="color: #6B7280; font-size: 15px; line-height: 1.6;">
              Votre rendez-vous au <strong>SE Garage</strong> a bien été enregistré. Voici le récapitulatif :
            </p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
              <tr style="background: #E8620A;">
                <td style="padding: 12px 16px; font-weight: bold; color: #fff;">Date & Heure</td>
                <td style="padding: 12px 16px; color: #fff; font-weight: bold;">${dateFr} à ${slot}</td>
              </tr>
              <tr style="background: #fff;">
                <td style="padding: 10px 16px; font-weight: bold; color: #6B7280;">Service</td>
                <td style="padding: 10px 16px; color: #1A1A1A;">${service}</td>
              </tr>
              <tr style="background: #f5f3ef;">
                <td style="padding: 10px 16px; font-weight: bold; color: #6B7280;">Véhicule</td>
                <td style="padding: 10px 16px; color: #1A1A1A;">${marque}</td>
              </tr>
            </table>
            <div style="background: #fff; border-left: 4px solid #C8963E; padding: 16px; margin-top: 20px;">
              <p style="margin: 0; color: #6B7280; font-size: 13px;">
                📅 Vous recevrez un rappel 24h avant votre rendez-vous.<br>
                📞 En cas de besoin : <a href="tel:+33141114340" style="color: #E8620A;">01 41 11 43 40</a>
              </p>
            </div>
            <div style="margin-top: 20px; text-align: center;">
              <a href="${cancelUrl}" style="display: inline-block; background: #CC2B2B; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px;">
                ❌ Annuler mon rendez-vous
              </a>
            </div>
            <p style="color: #6B7280; font-size: 12px; margin-top: 24px; text-align: center;">
              SE Garage — Votre garage de confiance
            </p>
          </div>
        `,
      }) : Promise.resolve()

      await Promise.all([emailGarage, emailClient])
      console.log(`[book] Emails envoyés pour ${nom} → garage + ${email}`)
    } catch (emailErr) {
      console.error('[book] Erreur email (non bloquant):', emailErr.message)
    }

    res.json({ success: true })

  } catch (err) {
    console.error('[book] error:', err.message)
    res.status(500).json({ error: 'Erreur création RDV', details: err.message })
  }
}
