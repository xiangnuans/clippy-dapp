export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}

export class ApiException extends Error {
  statusCode: number;
  error: string;

  constructor(error: ApiError) {
    super(error.message);
    this.statusCode = error.statusCode;
    this.error = error.error;
    this.name = "ApiException";
  }

  static isApiError(error: unknown): error is ApiException {
    return error instanceof ApiException;
  }

  static fromResponse(
    response: Response,
    fallbackMessage: string
  ): Promise<never> {
    return response
      .json()
      .then((data: ApiError) => {
        throw new ApiException(data);
      })
      .catch((error) => {
        if (error instanceof ApiException) {
          throw error;
        }
        throw new ApiException({
          statusCode: response.status,
          message: fallbackMessage,
          error: response.statusText || "Unknown Error",
        });
      });
  }

  static getErrorMessage(error: unknown): string {
    if (error instanceof ApiException) {
      return error.message;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return "An unexpected error occurred";
  }
}
