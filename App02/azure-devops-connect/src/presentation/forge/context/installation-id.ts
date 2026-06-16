export interface ForgeLikeContext {
  readonly cloudId?: string;
  readonly siteUrl?: string;
  readonly localId?: string;
  readonly installContext?: string;
}

export const resolveInstallationId = (context: ForgeLikeContext): string => {
  return (
    context.installContext ??
    context.localId ??
    context.cloudId ??
    context.siteUrl ??
    "local-development-installation"
  );
};
