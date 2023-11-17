const fs = require("fs").promises;
const path = require("path");
const process = require("process");
const { authenticate } = require("@google-cloud/local-auth");
const { google } = require("googleapis");
let scriptEjecutado = false; // Variable de estado para controlar si el script ya se ejecutó
const tiempoEspera = 600000;


// If modifying these scopes, delete token.json.
const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), "token.json");
const CREDENTIALS_PATH = path.join(process.cwd(), "credentials.json");

/**
 * Reads previously authorized credentials from the save file.
 *
 * @return {Promise<OAuth2Client|null>}
 */
async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

/**
 * Serializes credentials to a file compatible with GoogleAUth.fromJSON.
 *
 * @param {OAuth2Client} client
 * @return {Promise<void>}
 */
async function saveCredentials(client) {
  console.log(client);
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: "authorized_user",
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
    access_token: client.credentials.access_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}
const ACCESS_TOKEN_PATH = path.join(__dirname, 'access_token.json'); // Nuevo archivo

async function refreshToken() {
 
    try {
      // Cargar el token de actualización
      const content = await fs.readFile(TOKEN_PATH);
      const tokenData = JSON.parse(content);
      const refreshToken = tokenData.refresh_token;
  
      // Configurar las credenciales
      const credentialsContent = await fs.readFile(CREDENTIALS_PATH);
      const credentials = JSON.parse(credentialsContent);
  
      const { client_id, client_secret } =
        credentials.installed || credentials.web;
      const oauth2Client = new google.auth.OAuth2(client_id, client_secret);
  
      // Obtener un nuevo token de acceso
      const { tokens } = await oauth2Client.refreshToken(refreshToken);
  
      // Guardar el nuevo token de acceso en access_token.json
      await fs.writeFile(ACCESS_TOKEN_PATH, JSON.stringify(tokens));
  
      console.log('Nuevo token de acceso guardado', tokens.access_token);
    } catch (error) {
      console.error('Error al actualizar el token de acceso', error.message);
    }
  }
  


/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
async function listLabels(auth) {
  const gmail = google.gmail({ version: "v1", auth });
  const res = await gmail.users.labels.list({
    userId: "me",
  });
  const labels = res.data.labels;
  if (!labels || labels.length === 0) {
    console.log("No labels found.");
    return;
  }
}
function ejecutarScript() {
  //authorize().then(listLabels).catch(console.error);
  if (!scriptEjecutado) {
    scriptEjecutado = true; // Marcar que el script se está ejecutando para evitar llamadas adicionales
    try {
      console.log("Ejecutando el script...");
      refreshToken();
    } catch (error) {
      console.error("Error al ejecutar el script:", error);
    } finally {
      scriptEjecutado = false; // Restablecer la variable de estado después de la ejecución del script
    }
  }
}
setInterval(ejecutarScript, tiempoEspera);

module.exports = {
  ejecutarScript
};

