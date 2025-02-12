import fetch from "node-fetch";
import Tools from "../utils/tools.js";

class Client {
  constructor() {
    this.baseUrl = "https://dapp-backend-4x.fractionai.xyz/api3";
    this.userAgent = Tools.getRandomUA();
  }

  async createHeaders(token) {
    const headers = {
      "Accept": "application/json, text/plain, */*",
      "Accept-Language": "en-US,en;q=0.9",
      "Content-Type": "application/json",
      "Allowed-State": "na",
    };

    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }

  formatErrorMessage(error) {
    if (
      typeof error === "string" &&
      error.includes("maximum number of sessions")
    ) {
      const matches = error.match(/(\d+)\s+for the hour/);
      if (matches) {
        return `Session limit reached: ${matches[1]} sessions per hour`;
      }
    }

    if (typeof error === "object") {
      return error.message || JSON.stringify(error);
    }

    return error;
  }

  async fetch(endpoint, method = "GET", token, body = {}) {
    try {
      const url = this.baseUrl + endpoint;
      const headers = await this.createHeaders(token);
      const options = {
        method,
        headers,
        body: method !== "GET" ? JSON.stringify(body) : undefined,
      };

      const response = await fetch(url, options);
      const contentType = response.headers.get("Content-Type");
      let data;

      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        data = { message: await response.text() };
      }

      if (response.status === 429) {
        const waitTime = 60 * 1000;
        Tools.log("Rate limit hit (429). Waiting 1 minute before retry...");
        await Tools.delay(waitTime, "Waiting for rate limit cooldown...");
        return this.fetch(endpoint, method, token, body);
      }

      if (!response.ok) {
        if (data.error) {
          const errorMessage = this.formatErrorMessage(data.error);
          Tools.log(`Error: ${errorMessage}`);
        }
      }

      return {
        status: response.ok ? 200 : response.status,
        data,
      };
    } catch (error) {
      if (error.status) {
        const errorData = await this.handleErrorResponse(error);
        if ([400, 403, 409, 429].includes(error.status)) {
          return { status: error.status, data: errorData };
        }
        throw new Error(
          `${error.status} - ${error.message || error.statusText}`
        );
      }
      throw error;
    }
  }

  async getNonce() {
    try {
      const response = await this.fetch("/auth/nonce");
      if (!response.data || !response.data.nonce) {
        throw new Error("Invalid nonce response");
      }
      return response.data.nonce;
    } catch (error) {
      throw new Error(`Failed to get nonce: ${error.message}`);
    }
  }

  async handleErrorResponse(error) {
    const contentType = error.headers.get("Content-Type");
    if (contentType?.includes("application/json")) {
      return await error.json();
    }
    return { message: await error.text() };
  }
}

export default Client;
