// get-refresh-token.js
import { google } from 'googleapis';
import readline from 'readline';

const required = ['GMAIL_CLIENT_ID', 'GMAIL_CLIENT_SECRET', 'GMAIL_REDIRECT_URI'];
const missing = required.filter((k) => !process.env[k]);

if (missing.length) {
  console.error('❌ Faltan variables en .env:', missing.join(', '));
  console.error('Ejemplo .env:');
  console.error(`GMAIL_CLIENT_ID=TU_CLIENT_ID.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=TU_CLIENT_SECRET
GMAIL_REDIRECT_URI=http://localhost`);
  process.exit(1);
}

const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const REDIRECT_URI = process.env.GMAIL_REDIRECT_URI;

console.log('✅ Vars cargadas:\n', {
  GMAIL_CLIENT_ID: CLIENT_ID.slice(0, 8) + '…',
  GMAIL_CLIENT_SECRET: CLIENT_SECRET ? 'present' : 'missing',
  GMAIL_REDIRECT_URI: REDIRECT_URI,
});

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

try {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
  });

  console.log('\n👉 Abrí esta URL y aceptá permisos:\n', authUrl, '\n');

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('Pega el "code" que te devuelve Google y presiona Enter:\n', async (code) => {
    rl.close();
    try {
      const { tokens } = await oAuth2Client.getToken(code.trim());
      console.log('\n✅ Tokens obtenidos:');
      console.dir(tokens, { depth: null });
      if (!tokens.refresh_token) {
        console.warn('\n⚠️ Google NO devolvió refresh_token.');
        console.warn('Tips: usa prompt:"consent" y access_type:"offline". Verificá que la cuenta no haya autorizado antes con el mismo client-id.');
      } else {
        console.log('\n👉 Copiá este refresh_token a tu .env como GMAIL_REFRESH_TOKEN:');
        console.log(tokens.refresh_token);
      }
    } catch (e) {
      console.error('\n❌ Error al intercambiar el código:\n', e.response?.data || e.message || e);
    }
  });
} catch (e) {
  console.error('\n❌ Error al generar la URL de autorización:\n', e.message || e);
}