import { ApiException } from "./api-error";

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = "/api") {
    this.baseUrl = baseUrl;
  }

  private getHeaders(options?: RequestOptions): Headers {
    const headers = new Headers(options?.headers);

    if (!options?.skipAuth) {
      const token = localStorage.getItem("access_token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }

    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      return ApiException.fromResponse(
        response,
        "An error occurred while processing your request"
      );
    }

    return response.json();
  }

  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      method: "GET",
      headers: this.getHeaders(options),
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(
    path: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      method: "POST",
      headers: this.getHeaders(options),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(path: string, data?: any, options?: RequestOptions): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      method: "PUT",
      headers: this.getHeaders(options),
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(path: string, options?: RequestOptions): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      method: "DELETE",
      headers: this.getHeaders(options),
    });
    return this.handleResponse<T>(response);
  }
}

export const apiClient = new ApiClient();
