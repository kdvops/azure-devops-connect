// Azure DevOps Connect — Jira Forge App
// Entry point

export const handler = async (event) => {
  return {
    body: JSON.stringify({ message: 'Azure DevOps Connect ready' }),
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' }
  };
};
