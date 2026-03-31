import { Resend } from 'resend'
import { DPEResult } from './types'

const resend = new Resend(process.env.RESEND_API_KEY)

const DPE_COLORS: Record<string, { bg: string; text: string }> = {
  A: { bg: '#10b981', text: '#ffffff' },
  B: { bg: '#22c55e', text: '#ffffff' },
  C: { bg: '#a3e635', text: '#1a1a1a' },
  D: { bg: '#facc15', text: '#1a1a1a' },
  E: { bg: '#fb923c', text: '#ffffff' },
  F: { bg: '#ea580c', text: '#ffffff' },
  G: { bg: '#dc2626', text: '#ffffff' },
}

export async function sendAlertEmail(
  to: string[],
  alertName: string,
  dpes: DPEResult[]
): Promise<void> {
  const from = process.env.RESEND_FROM || 'alertes@example.com'

  const html = generateEmailHTML(alertName, dpes)

  await resend.emails.send({
    from,
    to,
    subject: `${dpes.length} nouveau${dpes.length > 1 ? 'x' : ''} DPE · ${alertName}`,
    html,
  })
}

function generateGoogleMapsUrl(dpe: DPEResult): string {
  const address = `${dpe.adresse} ${dpe.code_postal} ${dpe.ville}`
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}

function generateEmailHTML(alertName: string, dpes: DPEResult[]): string {
  const dpeCards = dpes
    .map(
      (dpe) => `
      <div style="background: #ffffff; border-radius: 12px; padding: 20px; margin-bottom: 16px; box-shadow: 0 4px 24px rgba(25, 28, 33, 0.06);">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom: 16px;">
          <tr>
            <td style="vertical-align: top;">
              <a href="${generateGoogleMapsUrl(dpe)}" style="text-decoration: none; color: inherit;" target="_blank">
                <h3 style="margin: 0 0 4px; font-size: 16px; font-weight: 600; color: #00488d; text-decoration: underline;">${dpe.adresse}</h3>
                <p style="margin: 0; font-size: 14px; color: #424752;">${dpe.code_postal} ${dpe.ville} 📍</p>
              </a>
            </td>
            <td style="vertical-align: top; text-align: right; padding-left: 24px; white-space: nowrap;">
              <span style="display: inline-block; background: ${DPE_COLORS[dpe.etiquette_dpe]?.bg || '#ccc'}; color: ${DPE_COLORS[dpe.etiquette_dpe]?.text || '#000'}; padding: 6px 12px; border-radius: 8px; font-weight: 700; font-size: 14px; margin-right: 8px;">
                DPE ${dpe.etiquette_dpe}
              </span>
              <span style="display: inline-block; background: ${DPE_COLORS[dpe.etiquette_ges]?.bg || '#ccc'}; color: ${DPE_COLORS[dpe.etiquette_ges]?.text || '#000'}; padding: 6px 12px; border-radius: 8px; font-weight: 700; font-size: 14px;">
                GES ${dpe.etiquette_ges}
              </span>
            </td>
          </tr>
        </table>

        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 16px;">
          <tr>
            <td style="padding-right: 32px;">
              <p style="margin: 0 0 2px; font-size: 12px; color: #727783; text-transform: uppercase; letter-spacing: 0.5px;">Surface</p>
              <p style="margin: 0; font-size: 15px; color: #191c21; font-weight: 500;">${dpe.surface} m²</p>
            </td>
            <td style="padding-right: 32px;">
              <p style="margin: 0 0 2px; font-size: 12px; color: #727783; text-transform: uppercase; letter-spacing: 0.5px;">Type</p>
              <p style="margin: 0; font-size: 15px; color: #191c21; font-weight: 500;">${dpe.type_batiment}</p>
            </td>
            ${dpe.conso_energie ? `
            <td>
              <p style="margin: 0 0 2px; font-size: 12px; color: #727783; text-transform: uppercase; letter-spacing: 0.5px;">Conso.</p>
              <p style="margin: 0; font-size: 15px; color: #191c21; font-weight: 500;">${dpe.conso_energie} kWh/m²/an</p>
            </td>
            ` : ''}
          </tr>
        </table>

        <a href="https://observatoire-dpe-audit.ademe.fr/afficher-dpe/${dpe.numero_dpe}"
           style="display: inline-block; background: linear-gradient(135deg, #00488d 0%, #005fb8 100%); color: #ffffff; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 500; text-decoration: none;">
          Voir la fiche DPE
        </a>
        <p style="margin: 8px 0 0; font-size: 13px; color: #727783; font-family: monospace;">
          N° ${dpe.numero_dpe}
        </p>
      </div>
    `
    )
    .join('')

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 24px; background: #f2f3fb;">

      <div style="max-width: 640px; margin: 0 auto;">

        <!-- Header -->
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="display: inline-block; background: linear-gradient(135deg, #00488d 0%, #005fb8 100%); width: 56px; height: 56px; border-radius: 16px; margin-bottom: 16px; line-height: 56px; text-align: center;">
            <span style="color: white; font-size: 24px;">🔔</span>
          </div>
          <h1 style="margin: 0 0 8px; font-size: 28px; font-weight: 700; color: #191c21;">DPE Monitor</h1>
          <p style="margin: 0; font-size: 14px; color: #424752;">Informed Guardian</p>
        </div>

        <!-- Alert Info -->
        <div style="background: #ffffff; border-radius: 16px; padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 24px rgba(25, 28, 33, 0.06);">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
            <span style="background: #a0f399; color: #217128; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
              Nouvelle alerte
            </span>
          </div>
          <h2 style="margin: 0 0 8px; font-size: 22px; font-weight: 600; color: #191c21;">${alertName}</h2>
          <p style="margin: 0; font-size: 14px; color: #424752;">
            ${today} · <strong style="color: #00488d;">${dpes.length}</strong> nouveau${dpes.length > 1 ? 'x' : ''} DPE trouvé${dpes.length > 1 ? 's' : ''}
          </p>
        </div>

        <!-- DPE Cards -->
        <div style="margin-bottom: 24px;">
          ${dpeCards}
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 24px;">
          <p style="margin: 0 0 8px; font-size: 13px; color: #727783;">
            Cet email a été envoyé automatiquement par DPE Monitor.
          </p>
          <p style="margin: 0; font-size: 12px; color: #c2c6d4;">
            Prochain scan : mardi 8h00
          </p>
        </div>

      </div>
    </body>
    </html>
  `
}
