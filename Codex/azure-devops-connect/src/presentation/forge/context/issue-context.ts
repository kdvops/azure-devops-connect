export interface ForgeResolverContext {
  readonly extension?: {
    readonly issue?: {
      readonly key?: string;
    };
  };
}

export const resolveIssueKeyFromContext = (context: ForgeResolverContext): string | null => {
  return context.extension?.issue?.key ?? null;
};
