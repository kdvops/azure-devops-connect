// Webhook handler — recibe eventos de Azure DevOps
import api, { route } from '@forge/api';

export const handler = async (event) => {
  const payload = JSON.parse(event.body);
  
  // Mapear eventos de Azure DevOps a Jira
  if (payload.eventType === 'git.push') {
    // Crear comentario en Jira
    await api.asApp().requestJira(route`/rest/api/3/issue/${payload.resource.refUpdates[0].name}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        body: `Push detectado en Azure DevOps: ${payload.resource.refUpdates[0].name}`
      })
    });
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ received: true })
  };
};
