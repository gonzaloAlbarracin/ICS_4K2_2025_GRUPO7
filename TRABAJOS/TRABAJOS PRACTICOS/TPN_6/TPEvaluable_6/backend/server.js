import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config();

const app = express();
app.use(cors({ origin: true }));
app.use(bodyParser.json());

const {
  PORT = 3000,
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET,
  GMAIL_REDIRECT_URI = 'http://localhost',
  GMAIL_REFRESH_TOKEN,
  FROM_EMAIL,
  TO_EMAIL,
} = process.env;

const oAuth2Client = new google.auth.OAuth2(
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET,
  GMAIL_REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: GMAIL_REFRESH_TOKEN });

function createMIME({ from, to, subject, text }) {
  const mime =
`From: ${from}
To: ${to}
Subject: ${subject}
Content-Type: text/plain; charset="UTF-8"

${text}`;
  return Buffer.from(mime).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

app.post('/api/send-email', async (req, res) => {
  try {
    const { subject, text } = req.body || {};
    if (!subject || !text) return res.status(400).json({ error: 'Faltan subject o text' });

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
    const raw = createMIME({
      from: FROM_EMAIL,
      to: TO_EMAIL,   // ← destinatario fijo
      subject,
      text,
    });

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw },
    });

    res.json({ ok: true });
  } catch (e) {
    console.error('Gmail send error:', e);
    res.status(500).json({ error: 'No se pudo enviar el email' });
  }
});

app.listen(PORT, () => console.log(`✅ Email API on http://localhost:${PORT}`));