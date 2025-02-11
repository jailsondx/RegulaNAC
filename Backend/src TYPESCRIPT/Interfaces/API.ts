export interface ResultData{
    success: boolean;
    message: string;
    error?: undefined;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  error?: unknown;
  data?: unknown;
}