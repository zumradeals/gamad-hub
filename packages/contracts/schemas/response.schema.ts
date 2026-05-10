export type ApiSuccess<TData = unknown> = {
  success: true;
  data: TData;
  meta?: Record<string, unknown>;
};

export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
};

export type ApiResponse<TData = unknown> = ApiSuccess<TData> | ApiError;
