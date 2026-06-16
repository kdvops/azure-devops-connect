// Admin page resolver — configuración de la app
import api, { route } from '@forge/api';

export const handler = async (request) => {
  return {
    body: `
      <h1>Azure DevOps Connect</h1>
      <p>Configuración de conexión con Azure DevOps</p>
      <form id="configForm">
        <label>Azure DevOps URL:</label>
        <input type="text" id="devopsUrl" value="https://dev.azure.com/the-punisher01" />
        <label>PAT Token:</label>
        <input type="password" id="patToken" />
        <button type="submit">Guardar</button>
      </form>
      <script>
        document.getElementById('configForm').onsubmit = async (e) => {
          e.preventDefault();
          // TODO: save config via storage API
        };
      </script>
    `,
    headers: { 'Content-Type': 'text/html' }
  };
};
