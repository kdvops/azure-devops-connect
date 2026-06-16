import api from "@forge/api";
import type { RequestInit } from "@forge/api";

import { DomainError } from "../../domain/errors/domain-error";

const retryableStatusCodes = new Set([429, 500, 502, 503, 504]);

interface RequestOptions {
  readonly method: "GET" | "POST";
  readonly body?: string;
}

export class AzureDevOpsHttpClient {
  public constructor(
    private readonly organizationName: string,
    private readonly personalAccessToken: string
  ) {}

  public async getJson<T>(path: string): Promise<T> {
    return this.requestJson<T>(path, { method: "GET" });
  }

  public async postJson<T>(path: string, body: unknown): Promise<T> {
    return this.requestJson<T>(path, { method: "POST", body: JSON.stringify(body) });
  }

  private async requestJson<T>(path: string, options: RequestOptions): Promise<T> {
    const url = `https://dev.azure.com/${this.organizationName}${path}`;
    let lastError: unknown = null;

    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const requestInit: RequestInit = {
          method: options.method,
          headers: {
            Authorization: `Basic ${Buffer.from(`:${this.personalAccessToken}`).toString("base64")}`,
            "Content-Type": "application/json"
          }
        };

        if (options.body) {
          requestInit.body = options.body;
        }

        const response = await api.fetch(url, requestInit);

        if (response.status === 401) {
          throw new DomainError("AZURE_UNAUTHORIZED", "Azure DevOps rejected the credentials.");
        }

        if (response.status === 403) {
          throw new DomainError("AZURE_FORBIDDEN", "Azure DevOps denied access to the requested resource.");
        }

        if (retryableStatusCodes.has(response.status)) {
          lastError = new DomainError("AZURE_SERVICE_UNAVAILABLE", "Azure DevOps is temporarily unavailable.");
          continue;
        }

        if (!response.ok) {
          if (response.status === 404) {
            throw new DomainError("AZURE_PROJECT_NOT_FOUND", "The Azure DevOps resource was not found.");
          }

          throw new DomainError("AZURE_CONNECTION_FAILED", "Azure DevOps request failed.");
        }

        return (await response.json()) as T;
      } catch (error: unknown) {
        if (error instanceof DomainError) {
          throw error;
        }

        lastError = error;
      }
    }

    if (lastError instanceof DomainError) {
      throw lastError;
    }

    throw new DomainError("NETWORK_ERROR", "A network error occurred while calling Azure DevOps.");
  }
}
