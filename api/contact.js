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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' })

  const { nom, email, telephone, vehicule, type_demande, message } = req.body

  if (!nom || !email || !message) {
    return res.status(400).json({ error: 'Données manquantes' })
  }

  try {
    const transporter = createTransporter()

    await transporter.sendMail({
      from: `"SE Garage" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      replyTo: email,
      subject: `📩 Nouveau message — ${nom} — ${type_demande || 'Contact'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 24px; border-radius: 8px;">
          <h2 style="color: #1A1A1A; border-bottom: 3px solid #E8620A; padding-bottom: 12px;">
            📩 Nouveau message de contact
          </h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <tr style="background: #fff;">
              <td style="padding: 10px 16px; font-weight: bold; color: #6B7280; width: 140px;">Nom</td>
              <td style="padding: 10px 16px; color: #1A1A1A;">${nom}</td>
            </tr>
            <tr style="background: #f5f3ef;">
              <td style="padding: 10px 16px; font-weight: bold; color: #6B7280;">Email</td>
              <td style="padding: 10px 16px; color: #1A1A1A;"><a href="mailto:${email}" style="color: #E8620A;">${email}</a></td>
            </tr>
            <tr style="background: #fff;">
              <td style="padding: 10px 16px; font-weight: bold; color: #6B7280;">Téléphone</td>
              <td style="padding: 10px 16px; color: #1A1A1A;">${telephone || '—'}</td>
            </tr>
            <tr style="background: #f5f3ef;">
              <td style="padding: 10px 16px; font-weight: bold; color: #6B7280;">Véhicule</td>
              <td style="padding: 10px 16px; color: #1A1A1A;">${vehicule || '—'}</td>
            </tr>
            <tr style="background: #E8620A;">
              <td style="padding: 12px 16px; font-weight: bold; color: #fff;">Type de demande</td>
              <td style="padding: 12px 16px; color: #fff; font-weight: bold;">${type_demande || '—'}</td>
            </tr>
          </table>
          <div style="margin-top: 20px; background: #fff; border-left: 4px solid #E8620A; padding: 16px; border-radius: 0 4px 4px 0;">
            <p style="font-weight: bold; color: #6B7280; font-size: 12px; margin: 0 0 8px 0;">MESSAGE :</p>
            <p style="color: #1A1A1A; margin: 0; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</p>
          </div>
          <div style="margin-top: 20px; text-align: center;">
            <a href="mailto:${email}" style="display: inline-block; background: #E8620A; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px;">
              ↩ Répondre à ${nom}
            </a>
          </div>
          <p style="color: #6B7280; font-size: 12px; margin-top: 16px; text-align: center;">
            SE Garage — Formulaire de contact segarage.fr
          </p>
        </div>
      `,
    })

    res.json({ success: true })
  } catch (err) {
    console.error('[contact] error:', err.message)
    res.status(500).json({ error: 'Erreur envoi email', details: err.message })
  }
}
