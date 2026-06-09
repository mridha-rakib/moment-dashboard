export interface ApiResponse<TData = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: TData;
  details?: unknown;
  meta?: Record<string, unknown>;
  requestId?: string;
}

export interface ApiValidationIssue {
  message?: string;
}

export interface ApiValidationDetails {
  fields?: Record<string, string[]>;
  issues?: ApiValidationIssue[];
}
