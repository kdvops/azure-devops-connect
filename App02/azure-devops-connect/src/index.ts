import { getAppHealth } from "./presentation/forge/handlers/app-health-handler";
import { handler } from "./presentation/forge/resolver";
import { handleIssueCreatedTrigger } from "./presentation/forge/triggers/issue-created-trigger";

export { type AppHealth } from "./presentation/forge/handlers/app-health-handler";

export const run = getAppHealth;
export { handler };
export const issueCreatedTrigger = handleIssueCreatedTrigger;
