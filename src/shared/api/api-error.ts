import axios from "axios";
import type { ApiResponse, ApiValidationDetails } from "./api.types";

interface AppApiErrorOptions {
  cause?: unknown;
  details?: unknown;
  requestId?: string;
  statusCode?: number;
}

export class AppApiError extends Error {
  public readonly cause?: unknown;
  public readonly details?: unknown;
  public readonly requestId?: string;
  public readonly statusCode?: number;

  public constructor(message: string, options: AppApiErrorOptions = {}) {
    super(message);
    this.name = "AppApiError";
    this.cause = options.cause;
    this.details = options.details;
    this.requestId = options.requestId;
    this.statusCode = options.statusCode;
    Object.setPrototypeOf(this, AppApiError.prototype);
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const toValidationDetails = (details: unknown): ApiValidationDetails | null => {
  if (!isRecord(details)) {
    return null;
  }

  return details as ApiValidationDetails;
};

const getFieldMessages = (details: unknown): string[] => {
  const validationDetails = toValidationDetails(details);

  if (!validationDetails?.fields) {
    return [];
  }

  return Object.values(validationDetails.fields).flat().filter(Boolean);
};

const getIssueMessages = (details: unknown): string[] => {
  const validationDetails = toValidationDetails(details);

  if (!Array.isArray(validationDetails?.issues)) {
    return [];
  }

  return validationDetails.issues.map((issue) => issue.message).filter(Boolean) as string[];
};

export const getApiErrorMessage = (
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string => {
  if (error instanceof AppApiError) {
    const validationMessages = [...getFieldMessages(error.details), ...getIssueMessages(error.details)];
    return validationMessages[0] ?? error.message ?? fallback;
  }

  if (axios.isAxiosError<ApiResponse>(error)) {
    const responseData = error.response?.data;
    const validationMessages = [
      ...getFieldMessages(responseData?.details),
      ...getIssueMessages(responseData?.details),
    ];

    return validationMessages[0] ?? responseData?.message ?? error.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
};

export const normalizeApiError = (
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): AppApiError => {
  if (error instanceof AppApiError) {
    return error;
  }

  if (axios.isAxiosError<ApiResponse>(error)) {
    const responseData = error.response?.data;

    return new AppApiError(getApiErrorMessage(error, fallback), {
      cause: error,
      details: responseData?.details,
      requestId: responseData?.requestId,
      statusCode: responseData?.statusCode ?? error.response?.status,
    });
  }

  return new AppApiError(getApiErrorMessage(error, fallback), {
    cause: error,
  });
};
