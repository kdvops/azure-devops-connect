const azureDevOpsHost = "dev.azure.com";

const extractOrganizationSegment = (pathname: string): string | null => {
  const segment = pathname.split("/").filter((part) => part.length > 0)[0];
  return segment ? decodeURIComponent(segment) : null;
};

export const normalizeAzureDevOpsOrganizationName = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  try {
    const parsed = new URL(trimmed.startsWith("http://") || trimmed.startsWith("https://") ? trimmed : `https://${trimmed}`);
    if (parsed.hostname.toLowerCase() === azureDevOpsHost) {
      return extractOrganizationSegment(parsed.pathname) ?? "";
    }
  } catch {
    // Fall through to string-based cleanup for non-URL input.
  }

  const withoutScheme = trimmed.replace(/^https?:\/\//i, "");
  const hostMatch = withoutScheme.match(/^dev\.azure\.com\/(.+)$/i);
  if (hostMatch) {
    return extractOrganizationSegment(`/${hostMatch[1]}`) ?? "";
  }

  return extractOrganizationSegment(`/${withoutScheme}`) ?? withoutScheme;
};
