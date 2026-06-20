interface EmailPayload {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('RESEND_API_KEY not set — email not sent')
    return false
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.SANCTUARY_FROM_EMAIL || 'Sanctuary Consulting <invoices@sanctuary.consulting>',
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      }),
    })
    return res.ok
  } catch (e) {
    console.error('Email send error:', e)
    return false
  }
}

export function invoiceEmailHTML(invoiceHTML: string, subject: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
      </head>
      <body style="margin:0;padding:32px;background:#f5f2ec;font-family:Georgia,serif">
        <div style="max-width:700px;margin:0 auto;background:white;border-radius:12px;padding:40px;box-shadow:0 2px 8px rgba(0,0,0,.08)">
          ${invoiceHTML}
        </div>
        <div style="text-align:center;margin-top:20px;font-size:11px;color:#7A8C85">
          Sanctuary Consulting · 612-600-4034
        </div>
      </body>
    </html>
  `
}
