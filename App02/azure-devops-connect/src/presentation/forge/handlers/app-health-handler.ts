export interface AppHealth {
  readonly status: "ok";
  readonly service: "azure-devops-connect";
}

export const getAppHealth = async (): Promise<AppHealth> => {
  return {
    status: "ok",
    service: "azure-devops-connect"
  };
};
